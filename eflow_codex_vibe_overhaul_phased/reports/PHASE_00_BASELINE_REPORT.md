# Phase 00 Baseline Report

## Status

- Phase: 00 — Reconcile Local State & Establish Baseline
- Status: Complete; implementation is intentionally stopped before Phase 01
- Baseline date: 2026-09-26 (Asia/Singapore)
- Product code changed: No
- Business logic, backend routes, database schema, RLS, payloads, permissions, and service return values changed: No
- Phase 00 additions: this report and the visual evidence pack under `artifacts/phase-00-baseline/`

## 1. Repository baseline

| Check | Result |
| --- | --- |
| Branch | `main` |
| Current HEAD | `b48cd9ad7417849d92f59dbae9e1dfb503b65235` |
| `origin/main` comparison | `0` ahead / `0` behind |
| Plan authoring baseline | `508aabc8881630b37a62a973645ecb0bb386e99e` |
| Historical change from plan baseline to current HEAD | 3,587 files changed; 41,037 insertions; 511,691 deletions |
| Current tracked working-tree diff | 3 files changed; 5 insertions; 23 deletions |
| Current tracked diff check | Pass |

The current checkout is substantially newer than the snapshot used to author the original phased pack. Recent history already contains Vibe foundation, shell/navigation, login, project command workspace, responsive, cash, and AI endpoint work. Those changes are treated as the current compatibility baseline. Phase 00 did not attempt to rewind or replay the old plan over the newer architecture.

### Pre-existing local changes

These files and artifacts existed before Phase 00 and remain untouched:

| Item | Classification | Baseline assessment |
| --- | --- | --- |
| `README.md` | Documentation | Four link/path adjustments; unrelated to the UI overhaul |
| `package-lock.json` | Dependency metadata | Removes platform markers from optional esbuild packages; preserve pending owner review |
| `server/start.py` | Backend/support code | Variable naming and more specific exception handling; functional, not design-only |
| `database_dump.json` | Generated/data artifact | Potentially sensitive and unrelated; do not add or remove without owner decision |
| `eflow_use_case_diagram.drawio` | Design/documentation artifact | Untracked; preserve |
| `eflow_use_case_diagram.xml` | Design/documentation artifact | Untracked; preserve |
| `eflow_use_case_diagram.jpg` | Generated preview | Untracked; preserve |
| `eflow_use_case_diagram_revised.jpg` | Generated preview | Untracked; preserve |

No local change was discarded, reverted, staged, or reformatted.

## 2. Current architecture and compatibility contracts

### Navigation

- Role navigation is defined in `src/app/components/Layout/coreWorkflowNavigation.tsx` and exposed through `src/app/features/navigation/roleNavigation.tsx`.
- Department-head destinations resolve through `src/app/features/role-department-head/DeptHeadContent.tsx` and `src/app/components/Layout/RolePageRouter.tsx`.
- The main shell and sidebar live in `src/app/features/app-shell/EflowAppShell.tsx` and `src/app/features/app-shell/components/ProductivitySidebar.tsx`.
- Active section/page state currently lives only in `src/app/features/navigation/useRoleNavigationState.ts`; it is not synchronized to the browser URL.
- Navigation visibility remains role- and permission-driven. URL work in a later phase must preserve the current section IDs, page labels, role visibility, and permission checks.

### Scoped screen inventory

| User area | Current navigation entry | Primary implementation | Important existing coverage/contract |
| --- | --- | --- | --- |
| Reviews | `reviews` → `For Review` | `features/reviews/components/ForReviewInbox.tsx`, `SubtaskReviewInbox.tsx` | `reviewRouting`, `reviewDecisionError`, `reviewEvidenceDetails`, `reviewCashClearance` |
| Plans & Projects | `projects` → `Projects` | `features/projects/components/DeptHeadProjectsWorkspace.tsx`, `ProjectsWorkspace.tsx` | project lifecycle, command selectors, board, financial report, deletion migration |
| Project context | Within Projects | `ProjectContextSidebar.tsx`, project-command components | Selected project, planning, membership, proposal, task, finance, and lifecycle contracts |
| Task Board | `tasks` → `Task Board` | `features/tasks/components/DeptHeadTaskBoardView.tsx` | selectors, normalization, project filter, discussion, assignment, readiness, cash clearance |
| Department Budget | `budget` → `Department Budget` | `features/budget/components/DepartmentBudgetWorkspace.tsx` | budget selectors plus task cash-clearance service/selector tests |
| Team Supervision | `team` → `Team Supervision` | `role-department-head/components/TeamSupervision.tsx` | assignment, composition note, and analytics tests |
| Identity & Access | `identity` → `Identity & Access` | `team-management/components/supervision/DepartmentIdentityAccessWorkspace.tsx` | existing role, organization, permission, and membership behavior must remain unchanged |
| Team Intelligence | `intelligence` → `Team Intelligence` | `role-department-head/components/EmployeeInsights.tsx` | team analytics contracts |
| Reports | `reports` → `Reports` | `features/reports/components/DeptHeadReportsWorkspace.tsx` | report formatting tests and existing report data sources |

### Behavior that must remain stable

- Existing sidebar destinations and role visibility
- Permission checks and administrative navigation restrictions
- Supabase reads, mutations, realtime subscriptions, and service return values
- Project/task/subtask/review lifecycle transitions
- Budget, cash-release, settlement, and audit calculations
- Existing modal outcomes, error paths, and review decisions
- Current backend routes and API payloads

## 3. Manual UX/QA baseline

Severity definitions used here: P1 blocks a core workflow or makes state unsafe; P2 materially harms usability or confidence; P3 is a consistency/readability defect.

| Area | Baseline finding | Priority | Phase owner recommendation |
| --- | --- | --- | --- |
| Global typography | 303 TSX files contain text below 12 px. Literal utility counts: 9 px 285; 9.5 px 197; 10 px 734; 10.5 px 250; 11 px 669; 11.5 px 161. | P2 | Phase 01 establishes a semantic type scale; feature phases migrate scoped screens |
| Loading states | 119 loader references exist; spinner/text loaders are inconsistent and several areas reflow after data arrives. | P2 | Phase 01 shared skeleton primitives, then migrate per feature |
| URL/state | Main section and page selection do not update a shareable/back-button-safe URL. | P1 | Phase 02 routing contract and regression tests |
| Reviews tabs | Project review tabs render in the inbox shell, while the Subtasks selection returns a separate full-page component path. This explains the visible placement shift/full-page reload impression. | P2 | Phase 04 shared review shell and content-only tab transitions |
| Projects context rail | Projects, Planning, and Team Members are a dedicated context aside, but its long-page positioning is not persistently anchored. | P2 | Phase 03 sticky context rail with responsive drawer fallback |
| Project view tabs | `ProjectViewTabBar` centers tabs while placing Add view separately; optional view accumulation can compete for the same horizontal space. | P2 | Phase 03 scrollable/overflow-aware view strip and duplicate prevention |
| Workspace tools | Source document interaction includes a Replace PDF path; budget, governance, and revision helper text is too small. | P2 | Phase 03 direct source viewing, clearer tool hierarchy, readable helper text |
| Governance/collaboration | Save actions and scope content do not consistently stay inside their visual container; action hierarchy is unclear. | P1/P2 | Phase 03 container ownership, sticky action footer where needed, validation states |
| Commit gate | Supporting text is undersized; soft delete lacks an explicit visible 30-day retention contract and review request lacks a confirmation step. | P1 | Phase 03 confirmation dialog, recoverability copy, real retention contract verification before UI claim |
| Work plans/sign-off | Repeated process blocks create scanning cost and hide the next action. | P2 | Phase 03 progressive disclosure, status summary, and action-oriented list rows |
| Task Board | Four KPI cards consume the first scan area; list/kanban/timeline/hierarchy are fixed; project context and filters compete with the work surface. | P2 | Phase 04 project-like workspace shell with context rail, saved/addable views, and compact filters |
| Hierarchy view | Current information architecture does not clearly express parent/child work relationships. | P2 | Phase 04 tree/graph semantics while preserving task relationships |
| Department Budget | Eight top-level tabs, stretched cards, and very small labels make scanning and comparison difficult. | P1/P2 | Phase 07 budget information architecture, grouped workflow stages, denser tables, readable metrics |
| Team Supervision | Useful content exists, but tiny metadata and card repetition dilute action priority. | P2 | Phase 05 exception-first workspace, full-width canvas, right-side live status panel |
| Identity & Access | Explanatory text and row metadata are too small; permission implications are not easy to understand at a glance. | P1/P2 | Phase 05/06 explicit access summaries and safer change confirmation |
| Team Intelligence | Sparse content is spread across large surfaces while key labels remain small. | P2 | Phase 05 stronger analytic hierarchy and comparison layouts |
| Reports | Filters are narrowly stacked, metadata is tiny, and long Work item values can collide/clip in rows. | P1/P2 | Phase 05 responsive filter bar and resilient table cells with wrap/truncate/detail affordances |
| Sidebar alerts | An alert dot already exists, but it is a boolean decoration and does not explain count/type/urgency. | P2 | Phase 02 accessible badge/status model linked to actionable destinations |
| Responsive shell | The Overview page stacks correctly at 390 px, but long productivity screens require scoped responsive QA and interaction alternatives. | P2 | Each feature phase validates desktop/tablet/mobile |

### Typography recommendation

The redesign should not globally replace every numeric font value in one mechanical pass. That would create regressions in icons, badges, tables, and dense controls. Establish semantic tokens first, then migrate screen-by-screen:

- Body and control text: 14 px minimum default
- Secondary/helper text: 12–13 px minimum with WCAG-compliant contrast
- Table metadata: 12 px minimum; use truncation, wrapping, tooltips, or detail drawers instead of shrinking text
- Eyebrows/labels: 11–12 px only when uppercase/tracking is genuinely useful
- Headings: consistent semantic levels rather than local one-off sizes

## 4. Visual evidence

The evidence pack was captured against the current department-head development workspace. It is a baseline, not a proposed redesign.

| Viewport | Evidence |
| --- | --- |
| Login, mobile 390 × 844 | `artifacts/phase-00-baseline/login-mobile-390.png` |
| Overview, mobile 390 × 844 | `artifacts/phase-00-baseline/overview-mobile-390.png` |
| Overview, tablet 1024 × 768 | `artifacts/phase-00-baseline/overview-tablet-1024.png` |
| Overview, desktop 1366 × 768 | `artifacts/phase-00-baseline/overview-desktop-1366.png` |
| Overview, desktop 1600 × 1000 | `artifacts/phase-00-baseline/overview-desktop-1600.png` |
| Plans & Projects, desktop | `artifacts/phase-00-baseline/plans-projects-desktop-1600.png` |
| Task Board, desktop | `artifacts/phase-00-baseline/task-board-desktop-1600.png` |
| Department Budget, desktop | `artifacts/phase-00-baseline/department-budget-desktop-1600.png` |
| Reviews, desktop | `artifacts/phase-00-baseline/reviews-desktop-1600.png` |
| Team Supervision, desktop | `artifacts/phase-00-baseline/team-supervision-desktop-1600.png` |
| Identity & Access, desktop | `artifacts/phase-00-baseline/identity-access-desktop-1600.png` |
| Team Intelligence, desktop | `artifacts/phase-00-baseline/team-intelligence-desktop-1600.png` |
| Reports, desktop | `artifacts/phase-00-baseline/reports-desktop-1600.png` |

## 5. UI dependency baseline

| Package | Installed version | Baseline note |
| --- | --- | --- |
| `@vibe/core` | 4.5.22 | Primary Monday.com-aligned component system already present |
| `@vibe/icons` | 4.1.0 | Vibe icon set present |
| React / ReactDOM | 18.3.1 | Current runtime |
| Vite | 6.3.5 | Build tool |
| TypeScript | 6.0.3 | Type checker |
| Tailwind CSS | 4.1.12 | Utility styling |
| MUI | 7.3.5 | Secondary UI dependency; migration/containment needed, not blind removal |
| Carbon icons | 11.79.0 installed | Widely used navigation/icon dependency |
| Lucide React | 0.487.0 | Additional icon dependency |
| Radix Dialog | 1.1.6 | Existing overlays; two test suites expose a ref warning |

The repository dependency installation was already present and usable. `npm ls`/executed scripts resolved the installed versions above. No dependency or lockfile mutation was made in Phase 00. The Playwright Chromium runtime was installed only to execute visual and responsive QA.

## 6. Automated validation

| Validation | Result | Detail |
| --- | --- | --- |
| `npm run check` | Pass | TypeScript completed with no errors |
| `npm test` | Pass | 114 test files passed; 387 tests passed; no failed tests reported |
| `npm run build` | Pass | 5,907 modules transformed; build completed in 17.84 s |
| `git diff --check` | Pass | No whitespace errors in the current tracked diff |
| `tests/e2e/login-mobile.spec.ts` | Pass | 5/5 tests at 320, 375, 768, and 1024 widths, including preview-card motion |
| `tests/e2e/navigation.spec.ts` | Partial | 1 passed / 1 failed; authentication and shell load succeeded, but one assertion still expects removed text `eFlow Console` |

### Existing non-blocking warnings

- React reports “Function components cannot be given refs” from the legacy Radix `DialogOverlay` path in the cash-release override and general-journal date-picker tests.
- Proposal-import tests intentionally write expected mocked AI failure messages to stderr.
- Vite reports circular chunk relationships around several feature barrels, including projects, tasks, subtasks, Monday board, and team analytics.
- `notificationService` is imported both statically and dynamically, so the dynamic import does not split it into a separate chunk.
- Large build chunks remain, notably the main application bundle (about 1.58 MB raw), monthly contribution selectors (about 1.07 MB raw), and the PDF worker (about 1.23 MB raw).

The stale navigation E2E assertion should be corrected in the phase that changes navigation. It is not a current authentication or routing failure, and Phase 00 deliberately does not modify the test.

## 7. Design-system assessment

Vibe is installed and already used, but the application is not yet operating from one consistently enforced product system. Current screens mix Vibe, Tailwind utilities, Carbon icons, MUI, Radix, Lucide, and feature-specific CSS. The principal Phase 01 need is therefore governance and migration infrastructure rather than another visual layer:

- One semantic typography scale
- Shared spacing, color, radius, elevation, and motion tokens
- Shared skeleton, empty, error, status, confirmation, tabs/view-strip, table, and panel patterns
- Contrast and focus-state rules
- A documented boundary for Vibe primitives versus retained specialist dependencies
- Feature-by-feature migration, with regression coverage before legacy presentation is removed

## 8. Risks and change-control gates

1. The old plan baseline and current HEAD have diverged heavily. Every later phase must inspect current callers before applying the historical instructions.
2. A visual rewrite that changes navigation IDs or page labels can silently break role pages, tours, tests, and permission mappings.
3. “30-day soft delete” cannot be presented as guaranteed UX until storage, purge, restore, and permission behavior are verified end-to-end.
4. Combining budget tabs may improve usability, but existing deep state, mutations, and approval workflows must remain independently addressable.
5. Global font-size replacement is unsafe. Semantic token rollout and focused visual regression are required.
6. The existing UI dependency mix should be reduced only after consumer searches prove a package/component is no longer used.
7. The untracked database dump should be reviewed for secrets or personal data before any future commit.

## 9. Files added by Phase 00

- `eflow_codex_vibe_overhaul_phased/reports/PHASE_00_BASELINE_REPORT.md`
- Thirteen PNG captures under `artifacts/phase-00-baseline/`

No source, test, configuration, backend, database, or dependency file was changed by Phase 00.

## 10. Recommendation and stop point

Phase 00 is complete. Approve Phase 01 only as a small foundation slice: define semantic design tokens and shared loading/empty/error primitives, add regression tests for those primitives, and do not redesign feature screens yet. Phase 02 should then establish URL-backed navigation before the large feature-area redesigns, because stable URLs and back/forward behavior are prerequisites for reliable tab and view work.

Implementation stops here pending explicit approval to begin Phase 01.
