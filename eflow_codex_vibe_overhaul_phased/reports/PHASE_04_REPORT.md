# Phase 04 — Tasks, My Work, Subtasks & Reviews

## Status

- Phase: 04
- Status: Complete for the Task Board slice; stopped before the remaining specialist review/subtask surfaces.
- Product behavior changed: task-board presentation now has contextual navigation, addable work views, and a workload visualization. Existing task filtering, lifecycle transitions, evidence/review actions, and permission checks remain intact.

## Implemented

### Task Board workspace

- Removed the repeated KPI card row from the Department Head Task Board header so the work surface starts with the actual board.
- Added a readable left context rail for project scope selection and record-scope guidance.
- Added an Add view menu with real, data-backed views:
  - Work breakdown
  - Workload
  - My work
  - Due soon
  - Overdue
  - For review
  - Completed
- Optional views become tabs and can be closed without changing task data.
- Kept List, Kanban, and Timeline as the core views.
- Added a Workload view that groups current records by owner and shows open, review, overdue, and completion signals.
- Renamed the former Hierarchy presentation to Work breakdown and clarified its proposal → program → project → activity → task meaning.
- Kept Subtask Evidence inside the shared Reviews shell so changing review categories does not replace the entire page layout.
- Replaced Task Review and Subtask Review spinner states with Vibe skeleton loading surfaces.

### Filtering and behavior safety

- Added pure selectors for My work, due-soon, overdue, review, and completed views using existing task fields and real calendar deadlines.
- The record scope and project scope still feed the existing board controllers.
- Existing drag/status guards, review submission actions, task editing, assignment, archive/delete/cancel flows, and read-only behavior were not bypassed.

## Regression coverage

- Added selector coverage for all additive task views with a deterministic reference date.
- Added presentation checks for the context rail, Add view menu, workload option, KPI removal, and Work breakdown language.

## Validation

| Validation | Result |
| --- | --- |
| `npm run check` | Passed |
| Focused Phase 04/task-board tests | Passed |
| Full test suite | 116 files, 401 tests passed |
| Production build | Passed; 5,909 modules transformed |
| `git diff --check` | Passed |

## Scope boundary

This slice does not yet redesign the full Reviews inbox, employee My Work surfaces, Subtasks workspace, or Task Detail drawer. Those remain in the Phase 04 follow-up scope.
