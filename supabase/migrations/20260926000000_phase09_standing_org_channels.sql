-- Phase 9: standing organization channels.
--
-- Task-channel membership remains materialized because task assignment is
-- arbitrary. Organization-channel membership is derived from the org path so
-- moving a person in the org tree never requires re-synchronizing rows in
-- chat_channel_members.

create unique index if not exists chat_channels_org_unique
  on public.chat_channels (org_id)
  where org_id is not null and channel_type = 'org';

create or replace function public.ensure_org_chat_channel()
returns trigger
as $$
begin
  insert into public.chat_channels (channel_type, org_id, name)
  values ('org', new.id, new.name || ' Chat')
  on conflict do nothing;
  return new;
end;
$$
language plpgsql
security definer;

drop trigger if exists organizations_create_chat_channel on public.organizations;
create trigger organizations_create_chat_channel
  after insert on public.organizations
  for each row execute function public.ensure_org_chat_channel();

-- Existing organizations predate the trigger and need exactly one channel.
insert into public.chat_channels (channel_type, org_id, name)
select 'org', organization.id, organization.name || ' Chat'
from public.organizations as organization
where not exists (
  select 1
  from public.chat_channels as channel
  where channel.org_id = organization.id
    and channel.channel_type = 'org'
);

-- A standing channel belongs to the channel organization and may be read or
-- posted to by members of that organization or any descendant organization.
-- Organization paths are stored as dot-separated text in this deployment, so
-- an exact-prefix comparison is the text-safe equivalent of an ltree ancestor
-- test (and avoids treating underscore characters in slugs as LIKE wildcards).
-- Reusing this helper keeps the existing task and direct-channel policy paths
-- unchanged while making the organization path direction explicit.
create or replace function public.is_channel_member(p_channel uuid, caller uuid)
returns boolean
as $$
  select exists (
    select 1
    from public.chat_channel_members as member
    where member.channel_id = p_channel
      and member.user_id = caller
  ) or exists (
    select 1
    from public.chat_channels as channel
    join public.organizations as channel_org
      on channel_org.id = channel.org_id
    join public.profiles as profile
      on profile.id = caller
    join public.organizations as user_org
      on user_org.id = profile.org_id
    where channel.id = p_channel
      and channel.channel_type = 'org'
      and (
        user_org.path::text = channel_org.path::text
        or pg_catalog.starts_with(user_org.path::text, channel_org.path::text || '.')
      )
  );
$$
language sql
security definer;

revoke all on function public.ensure_org_chat_channel() from public, anon, authenticated;
