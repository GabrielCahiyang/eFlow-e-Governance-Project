create role anon;
create role authenticated;
create schema auth;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
create table public.organizations(id uuid primary key, head_user_id uuid, assistant_head_user_id uuid);
create table public.profiles(id uuid primary key, full_name text, role text, org_id uuid, is_active boolean default true);
create table public.department_fiscal_budgets(
  id uuid primary key, org_id uuid, fiscal_year int, status text default 'locked', approved_amount numeric default 100000,
  daily_petty_cash_release_limit numeric default 10000, per_receipt_limit numeric default 5000,
  liquidation_due_days int default 15, allow_receipt_limit_override boolean default false,
  underutilization_threshold numeric default 80, notes text, locked_at timestamptz, updated_at timestamptz
);
create table public.budget_commitments(id uuid primary key, fiscal_budget_id uuid, status text, amount numeric);
create table public.petty_cash_requests(
  id uuid primary key, fiscal_budget_id uuid, org_id uuid, commitment_id uuid, allocation_id uuid,
  task_id uuid, subtask_id uuid, allocation_line_id uuid, requester_id uuid, cash_recipient_id uuid,
  status text default 'scheduled_for_release', requested_amount numeric default 5000, approved_amount numeric default 5000,
  released_amount numeric default 0, scheduled_amount numeric default 5000, needed_by date,
  liquidation_due_at timestamptz, actual_spent numeric default 0, returned_amount numeric default 0, updated_at timestamptz
);
create table public.petty_cash_releases(
  id uuid primary key default gen_random_uuid(), request_id uuid references petty_cash_requests(id), org_id uuid,
  scheduled_date date, amount numeric, recipient_id uuid, status text default 'scheduled',
  released_by uuid, released_at timestamptz, created_by uuid, acknowledged_at timestamptz,
  unique(request_id, scheduled_date)
);
create table public.budget_ledger_entries(
  id uuid primary key default gen_random_uuid(), fiscal_budget_id uuid, org_id uuid, commitment_id uuid,
  allocation_id uuid, petty_cash_request_id uuid, task_id uuid, subtask_id uuid, allocation_line_id uuid,
  entry_type text check(entry_type in ('petty_cash_released','financial_override','cash_release_state_changed','cash_release_acknowledged')),
  amount numeric, description text, actor_id uuid, actor_role text, previous_state text, new_state text, reason text, metadata jsonb
);
create table public.notifications(user_id uuid, type text, title text, message text, task_id uuid, actor_id uuid, actor_name text, financial_record_id uuid, financial_record_type text);
create function public.can_view_department_budget(target_org uuid, caller_id uuid) returns boolean language sql stable as $$ select caller_id is not null $$;
create function public.test_assert(value boolean, message text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'Assertion failed: %', message; end if; end $$;
create function public.test_throws(command text, expected text) returns void language plpgsql as $$
begin
  begin execute command;
  exception when others then
    if position(expected in sqlerrm) = 0 then raise exception 'Expected %, got %', expected, sqlerrm; end if;
    return;
  end;
  raise exception 'Expected failure: %', expected;
end $$;
insert into organizations values ('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002');
insert into profiles(id, full_name, role, org_id) values
  ('20000000-0000-4000-8000-000000000001','Head','dept_head','10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002','Assistant','assistant_head','10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000003','Employee','employee','10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000004','Foreign Head','dept_head','10000000-0000-4000-8000-000000000002');
insert into department_fiscal_budgets(id,org_id,fiscal_year) values ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',2026);
create function public.reset_cash_test() returns void language plpgsql as $$
begin
  truncate petty_cash_releases, petty_cash_requests, budget_ledger_entries, notifications;
  update department_fiscal_budgets set status='locked', daily_petty_cash_release_limit=10000;
  for n in 1..3 loop
    insert into petty_cash_requests(id,fiscal_budget_id,org_id,cash_recipient_id,requester_id)
    values (('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003');
    insert into petty_cash_releases(id,request_id,org_id,recipient_id,scheduled_date,amount,created_by)
    values (('50000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,('40000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',current_date+1,5000,'20000000-0000-4000-8000-000000000001');
  end loop;
end $$;
grant select on all tables in schema public to authenticated;
