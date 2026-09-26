-- Run inside a transaction that will be rolled back, as authenticated.
-- The caller supplies eflow.test_task_id and eflow.test_actor_id for a
-- manageable To Do task with at least two active members in the same office.
do $$
declare
  before_task public.tasks;
  saved_task public.tasks;
  next_lead uuid;
  denied_actor uuid;
begin
  perform set_config('request.jwt.claim.sub', current_setting('eflow.test_actor_id'), true);
  select * into strict before_task from public.tasks
  where id = current_setting('eflow.test_task_id')::uuid;

  select * into saved_task from public.assign_task_with_details(
    p_task_id => before_task.id,
    p_assignee => before_task.assigned_to,
    p_team_member_ids => to_jsonb(before_task.team_member_ids),
    p_team_member_names => to_jsonb(before_task.team_member_names),
    p_reviewer => before_task.reviewer_id,
    p_backup_reviewer => before_task.backup_reviewer_id,
    p_set_reviewers => true
  );
  if saved_task.team_member_ids is distinct from before_task.team_member_ids
     or saved_task.team_member_names is distinct from before_task.team_member_names
     or saved_task.reviewer_id is distinct from before_task.reviewer_id then
    raise exception 'Assignment snapshot did not round-trip';
  end if;

  select * into saved_task from public.assign_task_with_details(
    p_task_id => before_task.id, p_assignee => before_task.assigned_to
  );
  if saved_task.team_member_ids is distinct from before_task.team_member_ids
     or saved_task.team_member_names is distinct from before_task.team_member_names then
    raise exception 'Omitted arrays must preserve existing team members';
  end if;

  begin
    perform public.assign_task_with_details(
      p_task_id => before_task.id, p_assignee => before_task.assigned_to,
      p_team_member_ids => '{}'::jsonb
    );
    raise exception 'Non-array input was accepted';
  exception when invalid_parameter_value then null;
  end;

  select id into strict next_lead from public.profiles
  where id = any(before_task.team_member_ids)
    and id <> before_task.assigned_to and id <> before_task.reviewer_id
    and org_id = before_task.org_id and is_active
  order by id limit 1;
  select * into saved_task from public.assign_task_with_details(
    p_task_id => before_task.id, p_assignee => next_lead,
    p_team_member_ids => to_jsonb(before_task.team_member_ids),
    p_team_member_names => to_jsonb(before_task.team_member_names)
  );
  if saved_task.id is distinct from before_task.id
     or saved_task.assigned_to is distinct from next_lead
     or saved_task.status is distinct from before_task.status then
    raise exception 'Lead change did not return the correct task record';
  end if;

  select id into strict denied_actor from public.profiles
  where is_active and public.can_manage_task(before_task.id, id) is false
  order by id limit 1;
  perform set_config('request.jwt.claim.sub', denied_actor::text, true);
  begin
    perform public.assign_task_with_details(before_task.id, before_task.assigned_to);
    raise exception 'Unauthorized assignment was accepted';
  exception when insufficient_privilege then null;
  end;
  perform set_config('request.jwt.claim.sub', '', true);
  begin
    perform public.assign_task_with_details(before_task.id, before_task.assigned_to);
    raise exception 'Unauthenticated assignment was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;
