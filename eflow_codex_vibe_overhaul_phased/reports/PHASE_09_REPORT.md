# Phase 09 — Standing Department/Team Channels & Rich Submission Editor

## Status

Code and migration: complete. Live activation: pending application of the new Supabase migration to the intended environment and the live acceptance checks below.

## Delivered

- Added [20260926000000_phase09_standing_org_channels.sql](../../../supabase/migrations/20260926000000_phase09_standing_org_channels.sql) for one standing organization channel per organization, automatic creation for future organizations, and a backfill for existing organizations.
- Organization-channel access is derived from the current user’s organization path. A user can read and post to their organization’s standing channel and ancestor channels; task and direct channel membership remains unchanged.
- The organization-channel unique index applies only to `channel_type = 'org'`. This is essential because task channels can also contain `org_id`; the migration does not block normal task channels in the same organization.
- The existing global drawer continues to separate Direct Messages, standing channels, lead-owned task chats, and other task chats. It receives the signed-in user’s organization context from the top bar.
- The rich submission editor now synchronizes its external note value, has accessible formatting controls, escapes all table-cell input before emitting note HTML, and uses explicit non-submit controls for table editing.
- Rich submission note rendering is sanitized in both the Board feedback cards and the shared task inspector.

## Deployment requirement

Apply `supabase/migrations/20260926000000_phase09_standing_org_channels.sql` through the project’s normal Supabase migration process before considering the standing-channel feature live. The migration requires the existing Phase 8 chat tables and task-chat trigger.

## Live acceptance checklist

- Create a new organization and verify one `org` channel is created.
- Confirm existing organizations each receive one `org` channel after backfill, without changing or deleting task/direct channels.
- As a user in a child organization, verify the channel list includes that organization and its ancestors, not sibling or child organizations.
- Send a message in a standing channel from an allowed descendant user; verify realtime delivery in another allowed user session.
- Assign and reassign a task; verify its task channel membership still follows the existing task trigger and the message history remains intact.
- Submit a rich-text note and a table note; verify both render as formatted content in List, Kanban, Hierarchy, and the task inspector, with unsafe markup removed.

## Regression coverage

- Added `tests/unit/phase09StandingChannels.test.tsx` for ancestor selection, organization-channel migration invariants, channel grouping, safe table HTML output, task-chat mounting, and sanitized rich-note rendering.

## Validation

| Validation | Result |
| --- | --- |
| `npm run check` | Passed |
| Focused Phase 09 tests | Passed — 6 tests |
| Full unit suite | Passed — 119 files, 415 tests |
| `npm run build` | Passed; existing Rollup circular-import and large-chunk warnings remain |

## Scope boundary

- No Supabase migration was applied from this workspace, and no live organization, task, chat message, or user data was altered.
- The existing realtime, moderation, direct-message, task-chat, permission, and backend contracts remain in place.
