-- Keep task discussion updates live on databases created through incremental
-- migrations. The fresh schema already publishes this table.

do $$
begin
  begin
    alter publication supabase_realtime add table public.task_comments;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end;
$$;

