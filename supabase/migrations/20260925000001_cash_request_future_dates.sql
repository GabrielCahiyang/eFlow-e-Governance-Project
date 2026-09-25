-- A needed-by date is optional, but when provided it must not already have
-- passed. Enforce this below the UI so RPC and direct API callers agree.

create or replace function public.validate_cash_request_needed_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.needed_by is not null and new.needed_by < current_date then
    raise exception 'Needed-by date cannot be earlier than today' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists petty_cash_request_needed_by_guard on public.petty_cash_requests;
create trigger petty_cash_request_needed_by_guard
before insert or update of needed_by on public.petty_cash_requests
for each row execute function public.validate_cash_request_needed_by();

revoke all on function public.validate_cash_request_needed_by() from public, anon, authenticated;

