-- Repair the shared document-number trigger on databases that already applied
-- Phase 4/5. A liquidation row has no voucher_number field, so each table's
-- fields must be accessed only inside its own branch.

create or replace function public.assign_accounting_document_number()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  request_row public.petty_cash_requests;
  fiscal_year_value int;
begin
  select cash_request.* into request_row
  from public.petty_cash_requests cash_request
  where cash_request.id = new.request_id;

  select budget.fiscal_year into fiscal_year_value
  from public.department_fiscal_budgets budget
  where budget.id = request_row.fiscal_budget_id;

  if tg_table_name = 'petty_cash_releases' then
    if new.voucher_number is null then
      new.voucher_number := format('DV-%s-%s-%s', fiscal_year_value,
        lpad(request_row.request_number::text, 5, '0'),
        upper(right(replace(new.id::text, '-', ''), 6)));
    end if;
  elsif tg_table_name = 'petty_cash_liquidations' then
    if new.liquidation_number is null then
      new.liquidation_number := format('LIQ-%s-%s-%s', fiscal_year_value,
        lpad(request_row.request_number::text, 5, '0'),
        lpad(new.version::text, 2, '0'));
    end if;
  end if;

  return new;
end;
$$;
