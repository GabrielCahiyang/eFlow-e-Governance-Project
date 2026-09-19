-- Repair the publication budget linker for databases that already ran the
-- task-budget workflow migration. Draft task titles may retain author-entered
-- leading/trailing whitespace, while operational task titles are normalized.

begin;

do $$
declare
  function_source text;
  updated_source text;
begin
  select pg_get_functiondef(
    'public.commit_single_department_proposal_budget()'::regprocedure
  ) into function_source;

  updated_source := replace(
    function_source,
    'and task.title = task_json ->> ''title''',
    'and btrim(task.title) = btrim(task_json ->> ''title'')'
  );

  if updated_source = function_source then
    -- Fresh schemas already contain the corrected function. The migration is
    -- deliberately idempotent so deploys can run safely in either order.
    if position('btrim(task.title) = btrim(task_json ->> ''title'')' in function_source) = 0 then
      raise exception 'Could not locate the task-title matcher in commit_single_department_proposal_budget()';
    end if;
  else
    execute updated_source;
  end if;
end;
$$;

commit;
