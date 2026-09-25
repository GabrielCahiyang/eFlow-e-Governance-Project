-- Fifteen days is the default liquidation window. Packages may still be
-- submitted after the deadline, but only the Department Head may approve the
-- late settlement. Existing audit columns retain the approving Head and time.

begin;

alter table public.department_fiscal_budgets
  alter column liquidation_due_days set default 15;

with legacy_budgets as (
  select id
  from public.department_fiscal_budgets
  where liquidation_due_days = 5
), extended_requests as (
  update public.petty_cash_requests request
  set liquidation_due_at = request.liquidation_due_at + interval '10 days',
      updated_at = now()
  where request.fiscal_budget_id in (select id from legacy_budgets)
    and request.liquidation_due_at is not null
    and request.status in (
      'released', 'liquidation_draft', 'liquidation_submitted',
      'pending_leader_liquidation_review', 'pending_department_settlement',
      'changes_requested', 'overdue_liquidation'
    )
  returning request.id
)
update public.department_fiscal_budgets budget
set liquidation_due_days = 15,
    updated_at = now()
where budget.id in (select id from legacy_budgets);

create or replace function public.guard_late_liquidation_head_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  request_row public.petty_cash_requests;
  caller_role text;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    select * into request_row
    from public.petty_cash_requests
    where id = new.request_id;

    if request_row.liquidation_due_at is not null
       and new.submitted_at > request_row.liquidation_due_at then
      select profile.role::text into caller_role
      from public.profiles profile
      where profile.id = auth.uid();

      if caller_role is null or caller_role not in ('dept_head', 'department_head') then
        raise exception 'This liquidation was submitted after its deadline and requires Department Head approval'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists petty_cash_liquidation_late_approval_guard
  on public.petty_cash_liquidations;
create trigger petty_cash_liquidation_late_approval_guard
before update of status on public.petty_cash_liquidations
for each row execute function public.guard_late_liquidation_head_approval();

revoke all on function public.guard_late_liquidation_head_approval()
  from public, anon, authenticated;

commit;
