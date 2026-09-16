# eFlow feature inventory and compatibility baseline

This inventory is the no-feature-loss baseline for the modularisation effort. Every listed entry must remain reachable with the same role access and sidebar destination until a separately approved product change says otherwise.

## Shared shell

- Authentication, loading state, profile preferences, quick account switching, notifications, chat, incoming-call listener, account settings, and logout.
- Optional first-login onboarding, a role-specific full-system walkthrough above Settings, and a replayable page walkthrough in every workspace assistance bar. Users may enable smooth English AI voice narration before or during a tour; the preference is remembered per user and role.
- Role routing: superadmin, depthead, employee, teamleader, executive, legislative, councilor_pad, hrmo, and finance.

## Active workflow roles

- Department Head: Overview, Projects, Task Board, Work I'm Leading, My Subtasks, Reviews, Team Supervision, Team Intelligence, Reports, and Announcements.
  - Team Supervision is the live operations command center: actionable overdue/blocker/stalled/review queues, employee workload signals calculated from current tasks and subtasks, person-level work drill-down, and separate safe controls for replacing a member versus changing the accountable Team Lead.
  - Team Intelligence contains department delivery health, Employee 360 operational signals, skills coverage/single-person dependency detection, and the existing manager context editor. AI proposal assignment compatibility is preserved through the unchanged `employee_notes.strengths`, `weaknesses`, `notes`, and `tags` contract.
  - Reports provides department operations, project delivery, task/subtask contribution, review/revision, evidence, attention/risk, and lifecycle reports with exact filters, task drill-down, exact-row CSV/PDF exports, and an optional permission-scoped AI management brief.
- Employee / Team Leader: My Tasks, Work I'm Leading, My Subtasks, Leader Reviews, Deadlines, Task History, Performance, Work Report, and Announcements. Leadership entries remain conditional on leading work.
- Shared workflow operations: task lifecycle, assignments, reviews, subtasks, project milestones, task discussions/activity, reports, announcements, and employee performance/workload views.

## Administration and specialist roles

- Super Admin: dashboard, projects, tasks, reports, announcements, users, organization tree, permissions, audit log, system settings, and migration.
- Executive: Portfolio Intelligence, Project Transformation, Financial Oversight, and Immutable Audit; default `portfolio / City Project Pulse`.
- Legislative: Legislative Dashboard, Session Management, Committee Affairs, and Councilor Workspace; defaults remain the first registered page in each section.
- HRMO: Workforce Intelligence, Wellness & Attendance, and Performance Compliance; default `workforce / Burnout Prediction Radar`.
- Finance: Project Finance, Liquidation, and Immutable Ledger; default `projfin / Programmatic Buckets`.
- Councilor Pad opens the Councilor Dashboard and retains access to legislative measures, sessions, and committees.
- Proposal import and PDS parsing, AI recommendation/decomposition, audit, notifications, chat/calls, and the FastAPI administration endpoints remain behaviourally and contractually unchanged.

## Verification baseline

- npm run build passes before this program begins.
- Sidebar section identifiers, page labels, default destinations, and role mappings are tested as a public navigation contract.

## Vibe and Motion presentation contract

- Vibe is the primary control, typography, status, form, tab, modal, loading, and empty-state system. Feature-owned components retain domain meaning and permissions.
- Figtree is the only application presentation font. Financial values, percentages, counts, dates, durations, hashes, and identifiers use tabular numerals where alignment matters.
- The desktop navigation is a rounded 280px floating sidebar with a 68px compact rail. Mobile navigation preserves the existing destinations and access rules in a full-view Vibe modal.
- `InspectorPanel` is the shared task, subtask, project, proposal, announcement, and audit detail surface. It owns portal rendering, background inertness, scroll locking, focus trapping/restoration, Escape handling, and reduced-motion-aware presence.
- Motion is limited to panel presence, local view continuity, and other orientation/feedback cases. Initial tables, realtime rows, security actions, and KPI values do not receive ornamental animation.
- Shared compatibility adapters may preserve an existing feature API while delegating behavior to Vibe. They must not perform authorization or change persisted workflow state.
- See [Vibe and Motion redesign migration](./vibe-motion-redesign.md) for the implementation boundaries and verification record.
