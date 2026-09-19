-- Audited early-release path for Department Heads and Accounting Staff.
-- It preserves every regular release control and adds the required reason.

begin;

create or replace function public.override_accounting_petty_cash_release_schedule(
  p_release_id uuid,
  p_reason text,
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
  override_reason text := nullif(btrim(p_reason), '');
  actor_role_value text;
begin
  if caller is null then raise exception 'Sign in before recording a release' using errcode = '42501'; end if;
  if p_release_method not in ('cash', 'cheque') then raise exception 'Choose cash or cheque release' using errcode = '22023'; end if;
  if p_release_method = 'cheque' and nullif(btrim(p_cheque_number), '') is null then raise exception 'Enter the cheque number before release' using errcode = '22023'; end if;
  if override_reason is null or length(override_reason) < 10 or length(override_reason) > 1000 then
    raise exception 'Explain the schedule override in 10 to 1000 characters' using errcode = '22023';
  end if;

  select request_row.* into cash_request
  from public.petty_cash_releases release_row
  join public.petty_cash_requests request_row on request_row.id = release_row.request_id
  where release_row.id = p_release_id
  for update of request_row;
  if not found then raise exception 'Scheduled release not found' using errcode = 'P0002'; end if;
  if not public.can_manage_department_accounting(cash_request.org_id, caller) then
    raise exception 'Only the department accounting staff, Head, or Assistant Head can record a release' using errcode = '42501';
  end if;
  select * into budget from public.department_fiscal_budgets where id = cash_request.fiscal_budget_id and status = 'locked' for update;
  if not found then raise exception 'The annual department budget is no longer open' using errcode = '22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('eflow:cash-release:' || cash_request.org_id::text, 0));
  select * into release from public.petty_cash_releases where id = p_release_id for update;
  if release.status <> 'scheduled' then raise exception 'This release has already been processed' using errcode = '22023'; end if;
  if release.scheduled_date <= current_date then raise exception 'This release is already due; use the normal release confirmation' using errcode = '22023'; end if;
  if cash_request.status not in ('approved', 'scheduled_for_release', 'partially_released') or cash_request.approved_amount is null then
    raise exception 'The request must be fiscally approved before release' using errcode = '22023';
  end if;
  select coalesce(sum(amount), 0) into released_total from public.petty_cash_releases where request_id = cash_request.id and status = 'released';
  if released_total + release.amount > cash_request.approved_amount then raise exception 'This release would exceed the approved request amount' using errcode = '22023'; end if;
  select coalesce(sum(amount), 0) into used_today from public.petty_cash_releases
  where org_id = cash_request.org_id and id <> release.id and (
    (status = 'released' and coalesce(released_at::date, scheduled_date) = current_date)
    or (status = 'scheduled' and scheduled_date = current_date)
  );
  if used_today + release.amount > budget.daily_petty_cash_release_limit then
    raise exception 'Daily release ceiling exceeded' using errcode = '22023';
  end if;

  update public.petty_cash_releases
  set status = 'released', released_by = caller, released_at = now(), release_method = p_release_method,
      cheque_number = case when p_release_method = 'cheque' then btrim(p_cheque_number) else null end
  where id = release.id;
  released_total := released_total + release.amount;
  update public.petty_cash_requests
  set released_amount = released_total,
      status = case when released_total >= approved_amount then 'released' else 'partially_released' end,
      liquidation_due_at = case when released_total >= approved_amount then now() + budget.liquidation_due_days * interval '1 day' else liquidation_due_at end,
      updated_at = now()
  where id = cash_request.id;
  select role::text into actor_role_value from public.profiles where id = caller;
  insert into public.budget_ledger_entries(
    fiscal_budget_id, org_id, commitment_id, allocation_id, petty_cash_request_id, task_id, subtask_id, allocation_line_id,
    entry_type, amount, description, actor_id, actor_role, previous_state, new_state, reason, metadata
  ) values (
    cash_request.fiscal_budget_id, cash_request.org_id, cash_request.commitment_id, cash_request.allocation_id,
    cash_request.id, cash_request.task_id, cash_request.subtask_id, cash_request.allocation_line_id,
    'financial_override', 0, 'Early cash release recorded with schedule override', caller, actor_role_value,
    'scheduled', 'released', override_reason,
    jsonb_build_object('overrideType', 'cash_release_schedule', 'releaseId', release.id,
      'voucherNumber', release.voucher_number, 'originalScheduledDate', release.scheduled_date,
      'actualReleaseDate', current_date, 'releaseAmount', release.amount,
      'releaseMethod', p_release_method, 'chequeNumber', p_cheque_number)
  );
end;
$$;

revoke all on function public.override_accounting_petty_cash_release_schedule(uuid, text, text, text) from public, anon;
grant execute on function public.override_accounting_petty_cash_release_schedule(uuid, text, text, text) to authenticated;

notify pgrst, 'reload schema';

commit;

-- Supabase SQL Editor should show the function signature below after install.
select to_regprocedure(
  'public.override_accounting_petty_cash_release_schedule(uuid,text,text,text)'
) as installed_override_function;
