# Vibe and Motion redesign migration

## Scope

This migration implements the presentation-only redesign described in `implementation_plan_v2.md`. It preserves navigation identifiers, role access, Supabase and FastAPI contracts, queries, mutations, workflow states, review rules, fiscal controls, exports, evidence, and audit semantics.

## Implemented foundation

- Figtree is loaded at the application entry point and is the single presentation font.
- Radius, focus, elevation, and numeric typography styles converge on the Vibe token language.
- `EflowMotionProvider` uses `MotionConfig` with the user reduced-motion preference and `LazyMotion` with `domAnimation`.
- Motion durations and easings are named in `src/app/shared/motion/motionTokens.ts` and follow the productive/expressive timing model.
- `InspectorPanel` provides a reusable accessible portal and Motion presence contract.
- The application shell includes a keyboard skip link and a rounded, floating desktop sidebar with a compact rail and responsive mobile treatment.

## Phase R4–R9 migration

| Phase | Implemented presentation work |
| --- | --- |
| R4 — Projects | Portfolio and command tabs use Vibe controls/icons; project, plan, tools, and proposal inspection use the shared inspector contract. Existing project views and mutations remain unchanged. |
| R5 — Team, reports, announcements | Team supervision/intelligence and reports use Vibe tabs, filters, alerts, search, loading, and empty states. Announcement administration and reading use Vibe controls and an accessible inspector. Realtime/data behavior is unchanged. |
| R6 — Administration and settings | Shared administration dialogs now delegate to Vibe Modal for focus trapping/restoration and Escape/backdrop behavior. Users, organization, settings, audit, and data-tool primitives use Vibe status, progress, loading, and alert treatments. |
| R7 — Overview surfaces | Department, executive, finance, HRMO, and system overview primitives share the Figtree/Vibe typography, 12px overview surfaces, semantic labels, and tabular metric treatment without changing KPI calculations. |
| R8 — Specialist workflows | Finance, HRMO, legislative/session/committee, proposal import, and governance presentation primitives use Vibe headings, text, buttons, labels, upload/loading/alert states, and Vibe icons where migrated. Ledger and audit meaning remains static. |
| R9 — Accessibility and legacy convergence | Legacy Lexend/Montserrat presentation declarations were removed. Shared table sorting and row activation are keyboard-operable; loading skeletons are deterministic; focus visibility, reduced-motion CSS, landmarks, and the skip link are centralized. |

## Shared compatibility adapters

- `src/app/components/workflow/primitives.tsx` keeps the feature-facing workspace API while rendering Vibe buttons, dropdowns, search, progress, headings, text, loaders, and empty states.
- `src/app/components/ui/Modal.tsx` keeps the existing `Modal` and `ModalButton` signatures while using Vibe Modal and Button internally.
- `src/app/components/ui/DataTable.tsx` keeps its generic data contract while using Vibe Search, Skeleton, EmptyState, and Text and providing keyboard sorting/action behavior.

These adapters are intentionally presentation-only. They do not own permissions, service calls, workflow rules, or persisted state.

## Motion rules

- Ordinary hover, focus, color, border, and pressed feedback remains CSS/Vibe behavior.
- Motion is used for inspector presence and selected local view transitions, with stable record keys.
- The app does not stagger initial tables, animate live rows continuously, animate KPI numbers, or run global route entrance effects.
- Reduced motion is respected both in Motion configuration and the global CSS media query.

## Automated safeguards

- `tests/unit/inspectorPanel.test.tsx` covers background inertness, scroll locking, Escape/backdrop close, focus trapping/restoration, and reduced-motion inheritance.
- `tests/unit/sharedUiVibeAdapters.test.tsx` covers the legacy modal adapter and keyboard-accessible data-table behavior.
- `tests/unit/redesignFoundation.test.ts` prevents reintroduction of Lexend/Montserrat and protects the root Motion policy.
- Existing navigation, permissions, project, review, budget, report, team, announcement, and specialist workflow tests remain the compatibility suite.

## Final presentation and bundle audit

| Signal | Result |
| --- | ---: |
| TSX files importing Vibe core | 79 |
| TSX files importing Vibe icons | 37 |
| Lexend/Montserrat declarations in application TS/TSX/CSS | 0 |
| MUI imports in application TSX | 0 |
| Live Lucide imports retained | 257 files |
| Live Carbon icon imports retained | 61 files |

Lucide and Carbon remain active dependencies in legacy/domain-heavy screens and were not removed because repository search proves they still have consumers. Their continued migration should happen surface-by-surface with visual review; removing or mechanically remapping those live imports would violate the no-feature-loss rule.

The production build's largest application chunk is 1,420.12 kB (421.98 kB gzip), compared with the recorded baseline of 1,325.87 kB (391.15 kB gzip): +94.25 kB raw and +30.83 kB gzip. The build continues to report its pre-existing circular-chunk and 500 kB size warnings. `LazyMotion`/`m` is retained so the redesign does not import the full Motion component runtime through each animated consumer. Further reduction belongs in route/module chunk-boundary work rather than weakening the shared accessibility components.

## Verification commands

```powershell
npm run check
npm test
npm run build
npm run verify:client-secrets
npm run verify:live-schema
npm run test:e2e
```

The live-schema and Playwright commands require their configured backend, database, credentials, and browser environment. A missing external environment is reported separately from code/test failures.
