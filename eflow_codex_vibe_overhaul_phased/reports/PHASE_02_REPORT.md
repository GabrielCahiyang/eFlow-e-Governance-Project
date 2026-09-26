# Phase 02 — App Shell, Navigation & Authentication

## Status

- Phase: 02
- Status: Complete; stopped before Projects/feature redesign
- Product behavior changed: Navigation state is now shareable and browser-history aware. Workflow behavior, permissions, and content dispatch are unchanged.

## 1. Baseline inspected

The current shell already included the Phase 2 presentation foundation:

- Vibe productivity sidebar with compact desktop rail and hover expansion
- Vibe top bar with brand, notifications, chat, calls, walkthrough actions, and account menu
- Vibe full-view mobile navigation modal
- Vibe login inputs, password reveal control, usage-scenarios menu, loading screen, and account utilities
- skip link, focus-visible styling, reduced-motion handling, and role/permission-filtered navigation

The remaining gap was that `useRoleNavigationState` held section/page state only in React state. Reloads, deep links, and browser back/forward could not restore the selected destination.

## 2. Implemented

### URL-backed navigation

Added `src/app/features/navigation/navigationUrl.ts` with:

- readable section paths such as `/overview`, `/projects`, `/reviews`, `/department-budget`, and `/team-supervision`
- stable `?page=` state for the selected page label
- compatibility parsing for the previous `?view=` query name
- direct-link parsing with role-aware defaults
- history writes using `pushState` for user selections
- normalization using `replaceState` for initial/default state
- `popstate` handling for browser back/forward
- settings/account deep-link support

Updated `useRoleNavigationState` to use this adapter while preserving its existing `{ activePage, activeSection, selectPage }` API. Existing callers and content dispatch do not change.

### Navigation semantics

Added `aria-current="page"` to active section and page controls in the Vibe sidebar. Existing `aria-pressed` behavior remains intact for compatibility and state styling.

### Regression coverage

- Added `tests/unit/navigationUrl.test.ts` for readable paths, deep links, selection writes, and `popstate` restoration.
- Updated `tests/e2e/navigation.spec.ts` to assert the current active workspace landmark instead of the removed `eFlow Console` copy, and to verify each destination updates the expected pathname.

## 3. Behavior preserved

- Section IDs, role navigation manifests, default destinations, and page labels remain unchanged.
- Permission checks still run through `canOpenNavigationSection`, `getNavigationPermission`, and the existing AuthContext capability resolver.
- Leadership visibility remains contextual and unchanged.
- Guided tours still receive the same active section/page and navigation callback.
- Notification, chat, incoming-call, account, settings, profile, logout, quick-login, and session-security paths remain unchanged.
- Login automation IDs remain `login-email`, `login-password`, `login-submit`, and `quick-login-picker`.
- No Projects, Task Board, Reviews, Budget, database, service, API, RLS, or workflow-state implementation was redesigned in this phase.

## 4. URL contract examples

| User action | URL |
| --- | --- |
| Open Overview | `/overview?page=Dashboard` |
| Open Plans & Projects | `/projects?page=Projects` |
| Open Reviews | `/reviews?page=For+Review` |
| Open Department Budget | `/department-budget?page=Department+Budget` |
| Open Settings → Appearance | `/settings?page=Appearance` |

The query value is URL-encoded by `URLSearchParams`; callers continue to use the existing human-readable page labels.

## 5. Tests and build

| Validation | Result |
| --- | --- |
| Focused Phase 2 and URL tests | 5 files, 10 tests passed |
| `npm run check` | Passed |
| `npm test` | 115 files, 391 tests passed |
| `npm run build` | Passed; 5,908 modules transformed |
| `git diff --check` | Passed |
| `tests/e2e/login-mobile.spec.ts` | 5/5 passed at 320, 375, 768, and 1024 px, including preview-card motion |

The full suite retains the existing Radix dialog ref warnings and expected proposal-import mocked-service stderr. The build retains existing circular-chunk and large-chunk warnings.

## 6. Responsive and authentication verification

- Existing Phase 2 mobile-navigation test confirms the Vibe modal opens, selects a destination, updates workspace content, and closes.
- Existing Phase 2 auth tests confirm Vibe inputs, stable automation IDs, credential submission, and usage-scenario account selection.
- Existing sidebar tests confirm compact/expanded desktop behavior and destination callbacks.
- The runtime URL adapter is covered with a jsdom hook test for direct links and browser history events.

## 7. Recommendation

Phase 2 is complete. Stop for review before Phase 3. The next phase should apply the established shell/URL contract to the Projects and Project Command workspace: sticky context navigation, stable view tabs, source-document viewing, readable workspace tools, and responsive work-plan/sign-off surfaces.
