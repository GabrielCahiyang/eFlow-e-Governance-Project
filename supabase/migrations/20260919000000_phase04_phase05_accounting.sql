-- Phase 4 + 5: balanced general journal, immutable receipts, accounting staff,
-- department-scoped IAM, and accounting release/settlement routes.
begin;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in (
    'super_admin', 'dept_head', 'assistant_head', 'accounting_staff', 'employee',
    'department_head', 'executive', 'legislative', 'hrmo', 'finance',
    'councilor_pad'
  ));

create or replace function public.is_department_accounting_staff(target_org uuid, caller_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles profile
    where profile.id = caller_id
      and profile.org_id = target_org
      and profile.role = 'accounting_staff'
      and profile.is_active
  );
$$;

create or replace function public.can_manage_department_accounting(target_org uuid, caller_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_department_budget_approver(target_org, caller_id)
    or public.is_department_accounting_staff(target_org, caller_id);
$$;

create or replace function public.set_department_accounting_staff(
  p_user_id uuid,
  p_assigned boolean
) returns void language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  caller_profile public.profiles;
  target_profile public.profiles;
  organization public.organizations;
begin
  if caller is null then raise exception 'Sign in before managing department access' using errcode = '42501'; end if;
  select * into caller_profile from public.profiles where id = caller and is_active for update;
  if not found or caller_profile.role not in ('dept_head', 'department_head') then
    raise exception 'Only the Department Head can manage department accounting access' using errcode = '42501';
  end if;
  select * into organization from public.organizations where id = caller_profile.org_id and is_active for update;
  if not found or organization.head_user_id is distinct from caller then
    raise exception 'You can manage accounting access only for the department you currently head' using errcode = '42501';
  end if;
  select * into target_profile from public.profiles where id = p_user_id for update;
  if not found or not target_profile.is_active or target_profile.org_id is distinct from organization.id then
    raise exception 'Choose an active person in your own department' using errcode = '22023';
  end if;
  if target_profile.role not in ('employee', 'accounting_staff') then
    raise exception 'Head, Assistant Head, and administrator roles cannot be changed from this department control' using errcode = '42501';
  end if;
  update public.profiles
  set role = case when p_assigned then 'accounting_staff' else 'employee' end,
      updated_at = now()
  where id = target_profile.id;
  insert into public.audit_events(
    actor_id, actor_name, entity_type, entity_id, action, before_data, after_data, org_id
  ) values (
    caller, caller_profile.full_name, 'profile', target_profile.id::text,
    case when p_assigned then 'accounting_access_assigned' else 'accounting_access_removed' end,
    jsonb_build_object('role', target_profile.role),
    jsonb_build_object('role', case when p_assigned then 'accounting_staff' else 'employee' end),
    organization.id
  );
end;
$$;

insert into public.role_permissions(role, permission, allowed) values
  ('accounting_staff', 'navigation.accounting_overview', true),
  ('accounting_staff', 'navigation.accounting_releases', true),
  ('accounting_staff', 'navigation.accounting_journal', true),
  ('accounting_staff', 'navigation.accounting_audit', true),
  ('accounting_staff', 'navigation.department_budgets', true),
  ('accounting_staff', 'accounting.release_cash', true),
  ('accounting_staff', 'accounting.settle_liquidation', true),
  ('accounting_staff', 'accounting.post_journal', true),
  ('dept_head', 'accounting.release_cash', true),
  ('dept_head', 'accounting.settle_liquidation', true),
  ('dept_head', 'accounting.post_journal', true),
  ('assistant_head', 'accounting.release_cash', true),
  ('assistant_head', 'accounting.settle_liquidation', true),
  ('assistant_head', 'accounting.post_journal', true)
on conflict (role, permission) do nothing;

alter table public.petty_cash_releases
  add column if not exists voucher_number text,
  add column if not exists release_method text not null default 'cash',
  add column if not exists cheque_number text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conrelid = 'public.petty_cash_releases'::regclass
      and conname = 'petty_cash_releases_method_check'
  ) then
    alter table public.petty_cash_releases
      add constraint petty_cash_releases_method_check check (release_method in ('cash', 'cheque'));
  end if;
end;
$$;

alter table public.petty_cash_liquidations
  add column if not exists liquidation_number text,
  add column if not exists refund_receipt_number text,
  add column if not exists refund_date date;

create unique index if not exists petty_cash_releases_voucher_number_idx
  on public.petty_cash_releases(voucher_number) where voucher_number is not null;
create unique index if not exists petty_cash_liquidations_number_idx
  on public.petty_cash_liquidations(liquidation_number) where liquidation_number is not null;

create or replace function public.assign_accounting_document_number()
returns trigger language plpgsql security definer set search_path = public as $$
declare request_row public.petty_cash_requests; fiscal_year_value int;
begin
  select request.* into request_row
  from public.petty_cash_requests request
  where request.id = new.request_id;
  select budget.fiscal_year into fiscal_year_value
  from public.department_fiscal_budgets budget where budget.id = request_row.fiscal_budget_id;
  if tg_table_name = 'petty_cash_releases' then
    if new.voucher_number is null then
      new.voucher_number := format('DV-%s-%s-%s', fiscal_year_value,
        lpad(request_row.request_number::text, 5, '0'), upper(right(replace(new.id::text, '-', ''), 6)));
    end if;
  elsif tg_table_name = 'petty_cash_liquidations' then
    if new.liquidation_number is null then
      new.liquidation_number := format('LIQ-%s-%s-%s', fiscal_year_value,
        lpad(request_row.request_number::text, 5, '0'), lpad(new.version::text, 2, '0'));
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists petty_cash_release_document_number on public.petty_cash_releases;
create trigger petty_cash_release_document_number before insert on public.petty_cash_releases
for each row execute function public.assign_accounting_document_number();
drop trigger if exists petty_cash_liquidation_document_number on public.petty_cash_liquidations;
create trigger petty_cash_liquidation_document_number before insert on public.petty_cash_liquidations
for each row execute function public.assign_accounting_document_number();

update public.petty_cash_releases release
set voucher_number = format('DV-%s-%s-%s', budget.fiscal_year,
  lpad(request.request_number::text, 5, '0'), upper(right(replace(release.id::text, '-', ''), 6)))
from public.petty_cash_requests request
join public.department_fiscal_budgets budget on budget.id = request.fiscal_budget_id
where release.request_id = request.id and release.voucher_number is null;

update public.petty_cash_liquidations liquidation
set liquidation_number = format('LIQ-%s-%s-%s', budget.fiscal_year,
  lpad(request.request_number::text, 5, '0'), lpad(liquidation.version::text, 2, '0'))
from public.petty_cash_requests request
join public.department_fiscal_budgets budget on budget.id = request.fiscal_budget_id
where liquidation.request_id = request.id and liquidation.liquidation_number is null;

create table if not exists public.accounting_accounts (
  code text primary key,
  title text not null,
  classification text not null check (classification in ('asset', 'liability', 'equity', 'income', 'expense')),
  normal_balance text not null check (normal_balance in ('debit', 'credit')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.accounting_accounts(code, title, classification, normal_balance) values
  ('10102020', 'Cash in Bank - Local Currency, Current Account', 'asset', 'debit'),
  ('19901030', 'Advances to Special Disbursing Officer', 'asset', 'debit'),
  ('50299990', 'Other Maintenance and Operating Expenses', 'expense', 'debit')
on conflict (code) do nothing;

create table if not exists public.department_accounting_settings (
  fiscal_budget_id uuid primary key references public.department_fiscal_budgets(id) on delete restrict,
  cash_account_code text not null references public.accounting_accounts(code) on delete restrict default '10102020',
  advance_account_code text not null references public.accounting_accounts(code) on delete restrict default '19901030',
  default_expense_account_code text not null references public.accounting_accounts(code) on delete restrict default '50299990',
  configured_by uuid references public.profiles(id) on delete restrict,
  configured_at timestamptz not null default now()
);

insert into public.department_accounting_settings(fiscal_budget_id)
select id from public.department_fiscal_budgets on conflict (fiscal_budget_id) do nothing;

create or replace function public.create_default_department_accounting_settings()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.department_accounting_settings(fiscal_budget_id)
  values (new.id) on conflict (fiscal_budget_id) do nothing;
  return new;
end;
$$;

drop trigger if exists department_budget_accounting_defaults on public.department_fiscal_budgets;
create trigger department_budget_accounting_defaults after insert on public.department_fiscal_budgets
for each row execute function public.create_default_department_accounting_settings();

create table if not exists public.department_budget_account_mappings (
  allocation_line_id uuid primary key references public.work_budget_allocation_lines(id) on delete restrict,
  account_code text not null references public.accounting_accounts(code) on delete restrict,
  mapped_by uuid not null references public.profiles(id) on delete restrict,
  mapped_at timestamptz not null default now()
);

create table if not exists public.general_journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_number bigint generated always as identity,
  fiscal_budget_id uuid not null references public.department_fiscal_budgets(id) on delete restrict,
  org_id uuid not null references public.organizations(id) on delete restrict,
  entry_date date not null default current_date,
  reference_number text not null,
  source_type text not null check (source_type in ('cash_release', 'liquidation', 'manual_adjustment')),
  source_id uuid,
  memo text not null,
  posted_by uuid references public.profiles(id) on delete restrict,
  posted_at timestamptz not null default now()
);

create unique index if not exists general_journal_source_idx
  on public.general_journal_entries(source_type, source_id) where source_id is not null;
create index if not exists general_journal_org_date_idx
  on public.general_journal_entries(org_id, entry_date desc, entry_number desc);

create table if not exists public.general_journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.general_journal_entries(id) on delete restrict,
  line_number int not null check (line_number > 0),
  account_code text not null references public.accounting_accounts(code) on delete restrict,
  account_title text not null,
  debit numeric(16,2) not null default 0 check (debit >= 0),
  credit numeric(16,2) not null default 0 check (credit >= 0),
  created_at timestamptz not null default now(),
  unique (journal_entry_id, line_number),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);

create index if not exists general_journal_lines_entry_idx
  on public.general_journal_lines(journal_entry_id, line_number);

create or replace function public.prevent_accounting_record_mutation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  raise exception 'Posted accounting and receipt records are immutable; use a correcting entry' using errcode = '42501';
end;
$$;

drop trigger if exists general_journal_entries_append_only on public.general_journal_entries;
create trigger general_journal_entries_append_only before update or delete on public.general_journal_entries
for each row execute function public.prevent_accounting_record_mutation();
drop trigger if exists general_journal_lines_append_only on public.general_journal_lines;
create trigger general_journal_lines_append_only before update or delete on public.general_journal_lines
for each row execute function public.prevent_accounting_record_mutation();
drop trigger if exists petty_cash_receipts_append_only on public.petty_cash_receipts;
create trigger petty_cash_receipts_append_only before update or delete on public.petty_cash_receipts
for each row execute function public.prevent_accounting_record_mutation();

create or replace function public.post_cash_release_general_journal()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  request public.petty_cash_requests;
  settings public.department_accounting_settings;
  journal_id uuid;
  cash_title text;
  advance_title text;
begin
  if new.status <> 'released' or old.status = 'released' then return new; end if;
  select * into request from public.petty_cash_requests where id = new.request_id;
  select * into settings from public.department_accounting_settings where fiscal_budget_id = request.fiscal_budget_id;
  select title into cash_title from public.accounting_accounts where code = settings.cash_account_code;
  select title into advance_title from public.accounting_accounts where code = settings.advance_account_code;
  insert into public.general_journal_entries(
    fiscal_budget_id, org_id, entry_date, reference_number, source_type, source_id, memo, posted_by
  ) values (
    request.fiscal_budget_id, request.org_id, coalesce(new.released_at::date, current_date),
    new.voucher_number, 'cash_release', new.id,
    format('Release to %s for %s', coalesce(request.cash_recipient_id::text, 'recipient'), request.purpose),
    new.released_by
  ) returning id into journal_id;
  insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit) values
    (journal_id, 1, settings.advance_account_code, advance_title, new.amount, 0),
    (journal_id, 2, settings.cash_account_code, cash_title, 0, new.amount);
  return new;
exception when unique_violation then return new;
end;
$$;

drop trigger if exists petty_cash_release_general_journal on public.petty_cash_releases;
create trigger petty_cash_release_general_journal after update on public.petty_cash_releases
for each row execute function public.post_cash_release_general_journal();

create or replace function public.post_liquidation_general_journal()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  request public.petty_cash_requests;
  settings public.department_accounting_settings;
  journal_id uuid;
  expense_code text;
  expense_title text;
  cash_title text;
  advance_title text;
  next_line int := 1;
  released_value numeric;
begin
  if new.status <> 'approved' or old.status = 'approved' then return new; end if;
  select * into request from public.petty_cash_requests where id = new.request_id;
  select * into settings from public.department_accounting_settings where fiscal_budget_id = request.fiscal_budget_id;
  select coalesce(mapping.account_code, settings.default_expense_account_code)
    into expense_code
  from (select 1) seed
  left join public.department_budget_account_mappings mapping on mapping.allocation_line_id = request.allocation_line_id;
  select title into expense_title from public.accounting_accounts where code = expense_code;
  select title into cash_title from public.accounting_accounts where code = settings.cash_account_code;
  select title into advance_title from public.accounting_accounts where code = settings.advance_account_code;
  released_value := new.declared_spent + new.returned_amount;
  insert into public.general_journal_entries(
    fiscal_budget_id, org_id, entry_date, reference_number, source_type, source_id, memo, posted_by
  ) values (
    request.fiscal_budget_id, request.org_id, coalesce(new.decided_at::date, current_date),
    new.liquidation_number, 'liquidation', new.id,
    format('Settlement for %s', request.purpose), coalesce(new.decided_by, auth.uid())
  ) returning id into journal_id;
  if new.declared_spent > 0 then
    insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
    values (journal_id, next_line, expense_code, expense_title, new.declared_spent, 0);
    next_line := next_line + 1;
  end if;
  if new.returned_amount > 0 then
    insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
    values (journal_id, next_line, settings.cash_account_code, cash_title, new.returned_amount, 0);
    next_line := next_line + 1;
  end if;
  insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
  values (journal_id, next_line, settings.advance_account_code, advance_title, 0, released_value);
  return new;
exception when unique_violation then return new;
end;
$$;

drop trigger if exists petty_cash_liquidation_general_journal on public.petty_cash_liquidations;
create trigger petty_cash_liquidation_general_journal after update on public.petty_cash_liquidations
for each row execute function public.post_liquidation_general_journal();

-- Establish an opening accounting trail for releases and approved settlements
-- completed before this phase. Source uniqueness keeps the backfill idempotent.
do $$
declare item record; journal_id uuid; next_line int;
begin
  for item in
    select release.*, request.fiscal_budget_id, request.purpose,
      settings.cash_account_code, settings.advance_account_code,
      cash.title as cash_title, advance.title as advance_title
    from public.petty_cash_releases release
    join public.petty_cash_requests request on request.id = release.request_id
    join public.department_accounting_settings settings on settings.fiscal_budget_id = request.fiscal_budget_id
    join public.accounting_accounts cash on cash.code = settings.cash_account_code
    join public.accounting_accounts advance on advance.code = settings.advance_account_code
    where release.status = 'released' and not exists (
      select 1 from public.general_journal_entries entry
      where entry.source_type = 'cash_release' and entry.source_id = release.id
    )
  loop
    insert into public.general_journal_entries(
      fiscal_budget_id, org_id, entry_date, reference_number, source_type, source_id, memo, posted_by, posted_at
    ) values (
      item.fiscal_budget_id, item.org_id, coalesce(item.released_at::date, item.scheduled_date),
      item.voucher_number, 'cash_release', item.id, format('Release for %s', item.purpose),
      item.released_by, coalesce(item.released_at, item.created_at)
    ) returning id into journal_id;
    insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit) values
      (journal_id, 1, item.advance_account_code, item.advance_title, item.amount, 0),
      (journal_id, 2, item.cash_account_code, item.cash_title, 0, item.amount);
  end loop;

  for item in
    select liquidation.*, request.fiscal_budget_id, request.org_id, request.purpose,
      coalesce(mapping.account_code, settings.default_expense_account_code) as expense_code,
      expense.title as expense_title, settings.cash_account_code, settings.advance_account_code,
      cash.title as cash_title, advance.title as advance_title
    from public.petty_cash_liquidations liquidation
    join public.petty_cash_requests request on request.id = liquidation.request_id
    join public.department_accounting_settings settings on settings.fiscal_budget_id = request.fiscal_budget_id
    left join public.department_budget_account_mappings mapping on mapping.allocation_line_id = request.allocation_line_id
    join public.accounting_accounts expense on expense.code = coalesce(mapping.account_code, settings.default_expense_account_code)
    join public.accounting_accounts cash on cash.code = settings.cash_account_code
    join public.accounting_accounts advance on advance.code = settings.advance_account_code
    where liquidation.status = 'approved' and not exists (
      select 1 from public.general_journal_entries entry
      where entry.source_type = 'liquidation' and entry.source_id = liquidation.id
    )
  loop
    insert into public.general_journal_entries(
      fiscal_budget_id, org_id, entry_date, reference_number, source_type, source_id, memo, posted_by, posted_at
    ) values (
      item.fiscal_budget_id, item.org_id, coalesce(item.decided_at::date, item.submitted_at::date),
      item.liquidation_number, 'liquidation', item.id, format('Settlement for %s', item.purpose),
      item.decided_by, coalesce(item.decided_at, item.submitted_at)
    ) returning id into journal_id;
    next_line := 1;
    if item.declared_spent > 0 then
      insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
      values (journal_id, next_line, item.expense_code, item.expense_title, item.declared_spent, 0);
      next_line := next_line + 1;
    end if;
    if item.returned_amount > 0 then
      insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
      values (journal_id, next_line, item.cash_account_code, item.cash_title, item.returned_amount, 0);
      next_line := next_line + 1;
    end if;
    insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
    values (journal_id, next_line, item.advance_account_code, item.advance_title, 0, item.declared_spent + item.returned_amount);
  end loop;
end;
$$;

create or replace function public.submit_accounting_cash_liquidation(
  p_request_id uuid,
  p_declared_spent numeric,
  p_note text,
  p_receipts jsonb,
  p_idempotency_key uuid,
  p_refund_receipt_number text default null,
  p_refund_date date default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare liquidation_id uuid; returned_value numeric;
begin
  select coalesce(released_amount, 0) - p_declared_spent into returned_value
  from public.petty_cash_requests where id = p_request_id;
  if returned_value > 0 and (nullif(btrim(p_refund_receipt_number), '') is null or p_refund_date is null) then
    raise exception 'Enter the official refund receipt number and return date for unused cash' using errcode = '22023';
  end if;
  liquidation_id := public.submit_contextual_cash_liquidation(
    p_request_id, p_declared_spent, p_note, p_receipts, p_idempotency_key
  );
  update public.petty_cash_liquidations
  set refund_receipt_number = case when returned_value > 0 then btrim(p_refund_receipt_number) else null end,
      refund_date = case when returned_value > 0 then p_refund_date else null end
  where id = liquidation_id and submitted_by = auth.uid();
  return liquidation_id;
end;
$$;

create or replace function public.record_accounting_petty_cash_release(
  p_release_id uuid,
  p_release_method text default 'cash',
  p_cheque_number text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  release public.petty_cash_releases;
  cash_request public.petty_cash_requests;
  budget public.department_fiscal_budgets;
  released_total numeric;
  used_today numeric;
begin
  if caller is null then raise exception 'Sign in before recording a release' using errcode = '42501'; end if;
  if p_release_method not in ('cash', 'cheque') then raise exception 'Choose cash or cheque release' using errcode = '22023'; end if;
  if p_release_method = 'cheque' and nullif(btrim(p_cheque_number), '') is null then
    raise exception 'Enter the cheque number before release' using errcode = '22023';
  end if;
  select request_row.* into cash_request from public.petty_cash_releases release_row
  join public.petty_cash_requests request_row on request_row.id = release_row.request_id
  where release_row.id = p_release_id for update of request_row;
  if not found then raise exception 'Scheduled release not found' using errcode = 'P0002'; end if;
  if not public.can_manage_department_accounting(cash_request.org_id, caller) then
    raise exception 'Only the department accounting staff, Head, or Assistant Head can record a release' using errcode = '42501';
  end if;
  select * into budget from public.department_fiscal_budgets where id = cash_request.fiscal_budget_id and status = 'locked' for update;
  if not found then raise exception 'The annual department budget is no longer open' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('eflow:cash-release:' || cash_request.org_id::text, 0));
  select * into release from public.petty_cash_releases where id = p_release_id for update;
  if release.status <> 'scheduled' then raise exception 'This release has already been processed' using errcode = '22023'; end if;
  if release.scheduled_date > current_date then
    raise exception 'This release is scheduled for %. A Head must use the audited schedule override.', release.scheduled_date using errcode = '22023';
  end if;
  if cash_request.status not in ('approved', 'scheduled_for_release', 'partially_released') or cash_request.approved_amount is null then
    raise exception 'The request must be fiscally approved before release' using errcode = '22023';
  end if;
  select coalesce(sum(amount), 0) into released_total from public.petty_cash_releases
  where request_id = cash_request.id and status = 'released';
  if released_total + release.amount > cash_request.approved_amount then
    raise exception 'This release would exceed the approved request amount' using errcode = '22023';
  end if;
  select coalesce(sum(amount), 0) into used_today from public.petty_cash_releases
  where org_id = cash_request.org_id and id <> release.id and (
    (status = 'released' and coalesce(released_at::date, scheduled_date) = current_date)
    or (status = 'scheduled' and scheduled_date = current_date)
  );
  if used_today + release.amount > budget.daily_petty_cash_release_limit then
    raise exception 'Daily release ceiling exceeded' using errcode = '22023';
  end if;
  update public.petty_cash_releases set status = 'released', released_by = caller, released_at = now(),
    release_method = p_release_method, cheque_number = case when p_release_method = 'cheque' then btrim(p_cheque_number) else null end
  where id = release.id;
  released_total := released_total + release.amount;
  update public.petty_cash_requests set released_amount = released_total,
    status = case when released_total >= approved_amount then 'released' else 'partially_released' end,
    liquidation_due_at = case when released_total >= approved_amount then now() + budget.liquidation_due_days * interval '1 day' else liquidation_due_at end,
    updated_at = now() where id = cash_request.id;
  insert into public.budget_ledger_entries(
    fiscal_budget_id, org_id, commitment_id, allocation_id, petty_cash_request_id,
    task_id, subtask_id, allocation_line_id, entry_type, amount, description,
    actor_id, actor_role, previous_state, new_state, metadata
  ) select cash_request.fiscal_budget_id, cash_request.org_id, cash_request.commitment_id, cash_request.allocation_id, cash_request.id,
    cash_request.task_id, cash_request.subtask_id, cash_request.allocation_line_id, 'petty_cash_released', release.amount,
    case when p_release_method = 'cheque' then 'Cheque issued and recorded as released' else 'Cash released to recipient' end,
    caller, profile.role::text, 'scheduled', 'released',
    jsonb_build_object('releaseId', release.id, 'voucherNumber', release.voucher_number,
      'releaseMethod', p_release_method, 'chequeNumber', p_cheque_number)
  from public.profiles profile where profile.id = caller;
end;
$$;

create or replace function public.acknowledge_accounting_release(
  p_release_id uuid,
  p_voucher_number text
) returns void language plpgsql security definer set search_path = public as $$
declare release public.petty_cash_releases;
begin
  select * into release from public.petty_cash_releases where id = p_release_id;
  if not found then raise exception 'Release not found' using errcode = 'P0002'; end if;
  if upper(btrim(coalesce(p_voucher_number, ''))) is distinct from upper(release.voucher_number) then
    raise exception 'Voucher number does not match this release' using errcode = '22023';
  end if;
  perform public.acknowledge_petty_cash_release(p_release_id);
end;
$$;

create or replace function public.settle_accounting_liquidation(
  p_liquidation_id uuid,
  p_approve boolean,
  p_reason text
) returns void language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); liquidation public.petty_cash_liquidations; request public.petty_cash_requests;
begin
  select * into liquidation from public.petty_cash_liquidations where id = p_liquidation_id for update;
  if not found then raise exception 'Liquidation not found' using errcode = 'P0002'; end if;
  select * into request from public.petty_cash_requests where id = liquidation.request_id for update;
  if not public.can_manage_department_accounting(request.org_id, caller) then
    raise exception 'Only department accounting staff, the Head, or Assistant Head can settle this liquidation' using errcode = '42501';
  end if;
  if caller in (request.cash_recipient_id, request.requester_id) then raise exception 'You cannot settle your own liquidation' using errcode = '42501'; end if;
  if caller = liquidation.leader_decided_by then raise exception 'Leader review and settlement must be performed by different people' using errcode = '42501'; end if;
  if liquidation.status <> 'pending_department_settlement' or request.status <> 'pending_department_settlement' then
    raise exception 'This liquidation is not awaiting accounting settlement' using errcode = '22023';
  end if;
  if not p_approve and nullif(btrim(p_reason), '') is null then raise exception 'Explain what must be corrected' using errcode = '22023'; end if;
  update public.petty_cash_liquidations set status = case when p_approve then 'approved' else 'changes_requested' end,
    decided_by = caller, decision_reason = nullif(btrim(p_reason), ''), decided_at = now(),
    department_decided_by = caller, department_decision_reason = nullif(btrim(p_reason), ''), department_decided_at = now()
  where id = liquidation.id;
  if p_approve then
    update public.petty_cash_requests set status = 'settled', actual_spent = liquidation.declared_spent,
      returned_amount = liquidation.returned_amount, settled_by = caller, settled_at = now(), updated_at = now()
    where id = request.id;
    insert into public.budget_ledger_entries(fiscal_budget_id, org_id, commitment_id, allocation_id, petty_cash_request_id, entry_type, amount, description, actor_id)
    values (request.fiscal_budget_id, request.org_id, request.commitment_id, request.allocation_id, request.id,
      'expense_posted', liquidation.declared_spent, 'Verified receipts posted as actual task spending', caller);
    if liquidation.returned_amount > 0 then
      insert into public.budget_ledger_entries(fiscal_budget_id, org_id, commitment_id, allocation_id, petty_cash_request_id, entry_type, amount, description, actor_id)
      values (request.fiscal_budget_id, request.org_id, request.commitment_id, request.allocation_id, request.id,
        'cash_returned', liquidation.returned_amount, 'Unused released cash returned to the department', caller);
    end if;
  else
    update public.petty_cash_requests set status = 'changes_requested', updated_at = now() where id = request.id;
  end if;
  insert into public.notifications(user_id, type, title, message, task_id, actor_id, actor_name, reason, financial_record_id, financial_record_type)
  select request.cash_recipient_id, 'petty_cash_liquidation_decision',
    case when p_approve then 'Expense liquidation settled' else 'Liquidation changes requested' end,
    case when p_approve then 'Accounting verified the receipts and posted the balanced journal entry.' else 'Your liquidation needs corrections before settlement.' end,
    request.task_id, caller, coalesce(full_name, ''), coalesce(p_reason, ''), liquidation.id, 'petty_cash_liquidation'
  from public.profiles where id = caller;
end;
$$;

create or replace function public.notify_department_accounting_settlement()
returns trigger language plpgsql security definer set search_path = public as $$
declare request public.petty_cash_requests;
begin
  if new.status <> 'pending_department_settlement'
     or (tg_op = 'UPDATE' and old.status = 'pending_department_settlement') then return new; end if;
  select * into request from public.petty_cash_requests where id = new.request_id;
  insert into public.notifications(
    user_id, type, title, message, task_id, actor_id, actor_name,
    financial_record_id, financial_record_type
  )
  select profile.id, 'petty_cash_liquidation_accounting_review',
    'Liquidation ready for accounting settlement',
    coalesce(submitter.full_name, 'A cash recipient') || ' submitted ' || new.liquidation_number ||
      ' with receipts totaling ' || to_char(new.declared_spent, 'FM999G999G999G990D00') || '.',
    request.task_id, new.submitted_by, coalesce(submitter.full_name, ''), new.id, 'petty_cash_liquidation'
  from public.profiles profile
  left join public.profiles submitter on submitter.id = new.submitted_by
  where profile.org_id = request.org_id and profile.role = 'accounting_staff'
    and profile.is_active and profile.id <> new.submitted_by;
  return new;
end;
$$;

drop trigger if exists petty_cash_liquidation_accounting_notification on public.petty_cash_liquidations;
create trigger petty_cash_liquidation_accounting_notification
after insert or update of status on public.petty_cash_liquidations
for each row execute function public.notify_department_accounting_settlement();

create or replace function public.post_general_journal_adjustment(
  p_fiscal_budget_id uuid,
  p_entry_date date,
  p_reference_number text,
  p_memo text,
  p_lines jsonb
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  budget public.department_fiscal_budgets;
  item jsonb;
  debit_total numeric := 0;
  credit_total numeric := 0;
  journal_id uuid;
  account_title_value text;
  line_value int := 0;
begin
  select * into budget from public.department_fiscal_budgets where id = p_fiscal_budget_id;
  if not found then raise exception 'Fiscal budget not found' using errcode = 'P0002'; end if;
  if not public.can_manage_department_accounting(budget.org_id, caller) then raise exception 'Accounting access denied' using errcode = '42501'; end if;
  if nullif(btrim(p_reference_number), '') is null or nullif(btrim(p_memo), '') is null then
    raise exception 'Reference and memo are required' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_lines, '[]'::jsonb)) <> 'array' or jsonb_array_length(p_lines) < 2 then
    raise exception 'A journal entry needs at least two lines' using errcode = '22023';
  end if;
  for item in select value from jsonb_array_elements(p_lines) loop
    debit_total := debit_total + coalesce((item ->> 'debit')::numeric, 0);
    credit_total := credit_total + coalesce((item ->> 'credit')::numeric, 0);
    if (coalesce((item ->> 'debit')::numeric, 0) > 0) = (coalesce((item ->> 'credit')::numeric, 0) > 0) then
      raise exception 'Each journal line must contain either a debit or a credit' using errcode = '22023';
    end if;
    if not exists (select 1 from public.accounting_accounts where code = item ->> 'accountCode' and is_active) then
      raise exception 'Choose an active account for every journal line' using errcode = '22023';
    end if;
  end loop;
  if debit_total <= 0 or abs(debit_total - credit_total) > 0.009 then
    raise exception 'Journal debits and credits must balance' using errcode = '22023';
  end if;
  insert into public.general_journal_entries(
    fiscal_budget_id, org_id, entry_date, reference_number, source_type, memo, posted_by
  ) values (
    budget.id, budget.org_id, coalesce(p_entry_date, current_date), btrim(p_reference_number),
    'manual_adjustment', btrim(p_memo), caller
  ) returning id into journal_id;
  for item in select value from jsonb_array_elements(p_lines) loop
    line_value := line_value + 1;
    select title into account_title_value from public.accounting_accounts where code = item ->> 'accountCode';
    insert into public.general_journal_lines(journal_entry_id, line_number, account_code, account_title, debit, credit)
    values (journal_id, line_value, item ->> 'accountCode', account_title_value,
      coalesce((item ->> 'debit')::numeric, 0), coalesce((item ->> 'credit')::numeric, 0));
  end loop;
  insert into public.audit_events(actor_id, actor_name, entity_type, entity_id, action, reason, after_data, org_id)
  select caller, profile.full_name, 'general_journal_entry', journal_id::text, 'manual_adjustment_posted',
    btrim(p_memo), jsonb_build_object('referenceNumber', btrim(p_reference_number), 'debit', debit_total, 'credit', credit_total), budget.org_id
  from public.profiles profile where profile.id = caller;
  return journal_id;
end;
$$;

alter table public.accounting_accounts enable row level security;
alter table public.department_accounting_settings enable row level security;
alter table public.department_budget_account_mappings enable row level security;
alter table public.general_journal_entries enable row level security;
alter table public.general_journal_lines enable row level security;

drop policy if exists accounting_accounts_read on public.accounting_accounts;
create policy accounting_accounts_read on public.accounting_accounts for select to authenticated using (true);
drop policy if exists department_accounting_settings_read on public.department_accounting_settings;
create policy department_accounting_settings_read on public.department_accounting_settings for select to authenticated using (exists (
  select 1 from public.department_fiscal_budgets budget
  where budget.id = fiscal_budget_id and public.can_manage_department_accounting(budget.org_id, auth.uid())
));
drop policy if exists department_budget_account_mappings_read on public.department_budget_account_mappings;
create policy department_budget_account_mappings_read on public.department_budget_account_mappings for select to authenticated using (exists (
  select 1 from public.work_budget_allocation_lines line
  join public.work_budget_allocations allocation on allocation.id = line.allocation_id
  join public.budget_commitments commitment on commitment.id = allocation.commitment_id
  join public.department_fiscal_budgets budget on budget.id = commitment.fiscal_budget_id
  where line.id = allocation_line_id and public.can_manage_department_accounting(budget.org_id, auth.uid())
));
drop policy if exists general_journal_entries_read on public.general_journal_entries;
create policy general_journal_entries_read on public.general_journal_entries for select to authenticated
using (public.can_manage_department_accounting(org_id, auth.uid()));
drop policy if exists general_journal_lines_read on public.general_journal_lines;
create policy general_journal_lines_read on public.general_journal_lines for select to authenticated using (exists (
  select 1 from public.general_journal_entries entry
  where entry.id = journal_entry_id and public.can_manage_department_accounting(entry.org_id, auth.uid())
));

drop policy if exists petty_cash_requests_read on public.petty_cash_requests;
create policy petty_cash_requests_read on public.petty_cash_requests for select to authenticated using (
  requester_id = auth.uid() or cash_recipient_id = auth.uid() or task_leader_id = auth.uid()
  or public.can_manage_department_accounting(org_id, auth.uid())
);
drop policy if exists work_budget_allocations_read on public.work_budget_allocations;
create policy work_budget_allocations_read on public.work_budget_allocations for select to authenticated using (
  public.can_see_task(task_id, auth.uid()) or exists (
    select 1 from public.budget_commitments commitment
    join public.department_fiscal_budgets budget on budget.id = commitment.fiscal_budget_id
    where commitment.id = commitment_id and public.can_manage_department_accounting(budget.org_id, auth.uid())
  )
);
drop policy if exists work_budget_allocation_lines_read on public.work_budget_allocation_lines;
create policy work_budget_allocation_lines_read on public.work_budget_allocation_lines for select to authenticated using (exists (
  select 1 from public.work_budget_allocations allocation
  join public.budget_commitments commitment on commitment.id = allocation.commitment_id
  join public.department_fiscal_budgets budget on budget.id = commitment.fiscal_budget_id
  where allocation.id = allocation_id and (
    public.can_see_task(allocation.task_id, auth.uid())
    or public.can_manage_department_accounting(budget.org_id, auth.uid())
  )
));
drop policy if exists petty_cash_liquidations_read on public.petty_cash_liquidations;
create policy petty_cash_liquidations_read on public.petty_cash_liquidations for select to authenticated using (exists (
  select 1 from public.petty_cash_requests request where request.id = request_id and (
    request.requester_id = auth.uid() or request.cash_recipient_id = auth.uid() or request.task_leader_id = auth.uid()
    or public.can_manage_department_accounting(request.org_id, auth.uid())
  )
));
drop policy if exists petty_cash_receipts_read on public.petty_cash_receipts;
create policy petty_cash_receipts_read on public.petty_cash_receipts for select to authenticated using (exists (
  select 1 from public.petty_cash_liquidations liquidation
  join public.petty_cash_requests request on request.id = liquidation.request_id
  where liquidation.id = liquidation_id and (
    request.requester_id = auth.uid() or request.cash_recipient_id = auth.uid() or request.task_leader_id = auth.uid()
    or public.can_manage_department_accounting(request.org_id, auth.uid())
  )
));
drop policy if exists petty_cash_releases_read on public.petty_cash_releases;
create policy petty_cash_releases_read on public.petty_cash_releases for select to authenticated using (
  recipient_id = auth.uid() or exists (
    select 1 from public.petty_cash_requests request where request.id = request_id and (
      request.requester_id = auth.uid() or request.task_leader_id = auth.uid()
      or public.can_manage_department_accounting(request.org_id, auth.uid())
    )
  )
);
drop policy if exists budget_ledger_entries_read on public.budget_ledger_entries;
create policy budget_ledger_entries_read on public.budget_ledger_entries for select to authenticated
using (public.can_manage_department_accounting(org_id, auth.uid()));
drop policy if exists petty_cash_request_attachments_read on public.petty_cash_request_attachments;
create policy petty_cash_request_attachments_read on public.petty_cash_request_attachments for select to authenticated using (exists (
  select 1 from public.petty_cash_requests request where request.id = request_id and (
    request.requester_id = auth.uid() or request.cash_recipient_id = auth.uid() or request.task_leader_id = auth.uid()
    or public.can_manage_department_accounting(request.org_id, auth.uid())
  )
));

drop policy if exists budget_receipts_delete on storage.objects;
create policy budget_receipts_delete on storage.objects for delete to authenticated using (
  bucket_id = 'budget-receipts' and owner_id = auth.uid()::text
  and not exists (select 1 from public.petty_cash_receipts receipt where receipt.file_path = name)
  and not exists (select 1 from public.petty_cash_request_attachments attachment where attachment.file_path = name)
);

revoke all on public.accounting_accounts, public.department_accounting_settings,
  public.department_budget_account_mappings, public.general_journal_entries,
  public.general_journal_lines from anon;
grant select on public.accounting_accounts, public.department_accounting_settings,
  public.department_budget_account_mappings, public.general_journal_entries,
  public.general_journal_lines to authenticated;
revoke all on function public.set_department_accounting_staff(uuid, boolean) from public, anon;
revoke all on function public.submit_accounting_cash_liquidation(uuid, numeric, text, jsonb, uuid, text, date) from public, anon;
revoke all on function public.record_accounting_petty_cash_release(uuid, text, text) from public, anon;
revoke all on function public.acknowledge_accounting_release(uuid, text) from public, anon;
revoke all on function public.settle_accounting_liquidation(uuid, boolean, text) from public, anon;
revoke all on function public.post_general_journal_adjustment(uuid, date, text, text, jsonb) from public, anon;
grant execute on function public.set_department_accounting_staff(uuid, boolean) to authenticated;
grant execute on function public.submit_accounting_cash_liquidation(uuid, numeric, text, jsonb, uuid, text, date) to authenticated;
grant execute on function public.record_accounting_petty_cash_release(uuid, text, text) to authenticated;
grant execute on function public.acknowledge_accounting_release(uuid, text) to authenticated;
grant execute on function public.settle_accounting_liquidation(uuid, boolean, text) to authenticated;
grant execute on function public.post_general_journal_adjustment(uuid, date, text, text, jsonb) to authenticated;
grant execute on function public.is_department_accounting_staff(uuid, uuid) to authenticated;
grant execute on function public.can_manage_department_accounting(uuid, uuid) to authenticated;

do $$
begin
  begin alter publication supabase_realtime add table public.general_journal_entries; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.general_journal_lines; exception when duplicate_object then null; end;
end;
$$;

commit;
