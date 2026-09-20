# Mobile responsiveness rollout

The navigation definitions in `coreWorkflowNavigation.tsx`, `roleNavigation.tsx`, and `sidebarContent.tsx` are the inventory for this work. A destination belongs in the mobile audit only when the existing RBAC and permission checks make it visible to that account. Responsive changes must keep the same operations, role visibility, data scope, routes, and service calls.

## Phase 1 — Login and shared shell

- Login at 320, 375, 768, and 1024 px: show the Vibe form and project preview board, avoid document-wide horizontal overflow, keep inputs and actions usable with the keyboard and touch, and respect reduced motion.
- App shell: verify top bar, account controls, mobile menu, page scroll, settings, overlays, and safe-area spacing. Navigation must close after choosing a permitted destination and preserve the current role's item list.
- Status: login layout and board visibility implemented; shell controls checked at 320 px. Login Playwright smoke checks pass at 320, 375, 768, and 1024 px.

## Phase 2 — Super Admin

Audit every visible destination: Dashboard Overview; All Users, Role Defaults, User Access; Org Structure; All Projects; All Tasks; System Reports; Announcements; Audit Log; System Settings; Backup & Export. Permission controls live under User Management. For each, check cards, filters, data tables, drawers, modals, charts, and primary actions. Dense tables may scroll inside a labeled container; columns and row actions must remain accessible.

## Phase 3 — Head

Audit Overview, Plans & Projects, Task Board, Department Budget, Work I'm Leading, My Subtasks, Reviews, Team Supervision, Identity & Access, Team Intelligence, Reports, and Announcements. Confirm department scope and leadership-only entries are unchanged. Check task composer, review drawers, team controls, budget forms, and nested project views.

## Phase 4 — Accounting assignment

The Department Head can assign or remove accounting access for active employees in the same department. The current implementation stores that assignment as `profiles.role = accounting_staff`; those users retain employee destinations and gain the accounting group. The assignment is dynamic, but differs technically from contextual Task Lead access. Audit Accounting Overview, Voucher & Cash Releases, General Journal, Financial Audit Trail, and Department Budget Ledgers, plus all employee destinations visible to the assignee. Check journal line editing, voucher and settlement dialogs, fiscal year controls, ledgers, and evidence tables without changing approval boundaries.

## Phase 5 — Employee

Audit My Tasks, Projects, Work I'm Leading and Leader Reviews when eligible, My Subtasks, Deadlines, Task History, Performance, Work Report, and Announcements. Check card/board views, task details, comments, uploads, reports, and empty states. Leadership destinations must stay hidden or visible exactly as before.

## Release gate for each phase

1. At 320, 375, 768, 1024 px, and desktop width, reach each visible tab and its primary action. No page-level horizontal clipping or hidden action; use local scrolling only for genuinely wide data or boards.
2. Test the role's visible navigation and denied access with the existing RBAC tests; add focused regression coverage for any interaction changed by the slice.
3. Run `npm run check`, `npm test`, and `npm run build`. Run the affected Playwright smoke test when a browser and test account are configured.

## Current audit status

- At 320, 375, 768, and 1024 px, local development accounts opened every visible top-level destination for Super Admin, Department Head, Assistant Department Head, and an employee with accounting access. None produced document-wide horizontal overflow. The plain Employee workspace shares its destinations with the accounting assignee; a separate plain Employee account was not available in the local quick-login list.
- At 320 and 375 px, visible Vibe tabs in Reports, Reviews, Team Intelligence, Tasks, History, and Announcements were opened and checked. At 320 px, the Super Admin User Management subpages, all eight Department Budget panels for Head and Accounting Staff, Team Supervision tabs, and Head Identity & Access tabs were opened. The tab strips that need extra width scroll inside their own containers.
- Shared table regions, review and reports tabs, department intelligence, summary cards, announcement filters, Head people controls, and subtask rows have targeted mobile layout fixes. Shared page headings and metric labels wrap on narrow screens. Data tables retain horizontal scrolling inside their own region.
- At 320 px, opened and inspected the New Announcement editor, Create User dialog, Create Work Plan dialog, Head task editor, and Accounting journal adjustment dialog. The shared Vibe modal shell now fits the viewport; the user and work-plan forms use the available width. The admin creation dialogs have a focused browser regression test.
- At 320 px, opened an employee-visible draft work plan and checked its Overview, Work Breakdown, and Collaboration tabs. The Overview tool row wraps, and Source PDF, Team Roster, Budget, Requested Changes, and Revisions panels each fit the viewport.
- At 320 px, Super Admin Reports → Monthly Contribution has a table-scoped horizontal viewport with a swipe cue and keyboard focus. The task Submit for Review, Task Editor, and Team Assignment dialogs now fit within the phone width.
- Populated financial release forms, the remaining drawers and dialogs, and primary write actions still need phase-by-phase touch and keyboard checks before claiming full mobile coverage.

References: [Vibe design system](https://vibe.monday.com/?path=/docs/welcome--docs), [Vibe Table](https://vibe.monday.com/?path=/docs/components-table--docs), [Motion for React](https://motion.dev/docs/react), [Motion accessibility](https://motion.dev/docs/react-accessibility).
