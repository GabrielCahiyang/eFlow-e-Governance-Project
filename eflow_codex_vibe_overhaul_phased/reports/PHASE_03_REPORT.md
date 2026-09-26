# Phase 03 — Projects & Project Workspace

## Status

- Phase: 03
- Status: Complete for the scoped Projects and Project Command presentation slice; stopped before Phase 04.
- Product behavior changed: project workspace presentation, loading states, and source-document access were clarified. Project lifecycle, permissions, workflow mutations, and service/API contracts remain unchanged.

## 1. Scope inspected

The implementation follows `phases/PHASE_03_PROJECTS_AND_PROJECT_WORKSPACE.md` and the Phase 00 baseline findings for:

- Projects landing and project selection context
- Project Command workspace view tabs and Add view behavior
- Workspace tools, proposal/source-document context, governance, collaboration scope, delivery, work-plan, and sign-off surfaces
- Existing project command loaders and read-only/permission paths

## 2. Implemented

### Project workspace shell

- Kept the project context rail visible while the workspace canvas scrolls on desktop.
- Added a bounded, horizontally scrolling view-tab lane with a dedicated Add view action lane so additional views cannot overlap the tabs.
- Preserved a usable stacked layout on narrow screens instead of forcing a desktop-height sticky rail.
- Replaced project portfolio, project command, and collaboration planning spinners with accessible Vibe skeleton states.
- Scoped very-small workspace copy and inspector text to readable sizes without changing data or labels.

### Workspace tools and source documents

- Existing source documents now expose a direct **View source PDF** action.
- Removed the replacement-PDF control from the existing-source state while retaining the attach flow for projects that have no source document.
- Kept the existing preview dialog and source service contract intact.

### Governance and collaboration clarity

- Removed the redundant Governance sub-pills; the outer workspace view bar is now the single navigation source for Governance, Sign-off Status, Evidence Register, and Decision History.
- Moved Collaboration Scope save controls inside the scope container.
- Added a clear interdepartmental/departments identity mark and changed the owner pill to a neutral, readable treatment.
- Added an inline confirmation step before requesting a collaboration review.
- Improved the soft-delete panel with a trash icon, readable controls, and explicit 30-day restore/audit copy.

## 3. Behavior preserved

- Project selection, view dispatch, lifecycle/status/health/schedule state, read-only rendering, permission checks, proposal/task mutations, and existing service/API payloads are unchanged.
- Source-document replacement remains available at the service layer for compatibility; this phase removes only the replacement action from the existing-source presentation.
- No database schema, RLS policy, Python endpoint, or workflow transition was changed.

## 4. Regression coverage

Added or updated focused coverage for:

- non-overlapping project view-tab lanes and sticky context styling
- Governance navigation without redundant internal sub-navigation
- source PDF view-only presentation and absence of “Replace PDF” in the existing-source state
- collaboration review confirmation behavior

## 5. Validation

| Validation | Result |
| --- | --- |
| `npm run check` | Passed |
| Focused Phase 03 tests | 3 files, 13 tests passed |
| `npm test -- --run` | 115 files, 394 tests passed |
| `npm run build` | Passed; 5,908 modules transformed |
| `git diff --check` | Passed |

The existing test/build output still includes the known Radix dialog ref warnings, expected proposal-import mocked-service stderr, circular Rollup chunk notices, and large-chunk warnings.

## 6. Visual QA note

The implementation was reviewed against the Phase 00 baseline DOM/CSS and focused component tests. An authenticated screenshot run could not be completed in this environment: the in-app browser could not reach the local Vite host, and the local login smoke path was blocked because the Python gateway executable was unavailable. No screenshot is claimed as Phase 03 evidence; repeat the authenticated desktop/narrow visual pass when the normal frontend and gateway runtime are available.

## 7. Recommendation

Before proceeding, a Phase 03 follow-up corrected the project Tasks view and view overflow behavior:

- The task board is now constrained to the workspace canvas and scrolls inside that region when its four-lane minimum width is larger than the available viewport.
- The More view menu now lives in the fixed action lane rather than the horizontally scrolling tab lane, so its dropdown is not clipped.
- The More control now exposes menu semantics and keyboard activation for overflow project views.

The follow-up validation passed the full suite (115 files, 396 tests), type-check, production build, and `git diff --check`. Keep the next pass focused on Task Board, Department Budget, People/Team Supervision, and Insights/Reports as defined in the remaining phased plan; do not expand this phase into those feature areas.
