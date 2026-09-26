# Vibe migration inventory

This is the Phase 1 presentation inventory for the current `main` checkout. It is a change-control document, not a permission to remove libraries. Feature migrations must preserve navigation IDs, role visibility, authorization, data calls, workflow states, and existing test contracts.

## Foundation already active

- `@vibe/core` 4.5.22 and `@vibe/icons` 4.1.0 are installed and used directly.
- `src/main.tsx` imports `@vibe/core/tokens` and the bundled Figtree variable font.
- `src/app/features/app-shell/AppProviders.tsx` mounts `EflowVibeProvider` at the application provider boundary.
- `src/app/shared/vibe/EflowVibeProvider.tsx` owns the supported Vibe `ThemeProvider` integration and light/dark preference bridge.
- `src/app/shared/vibe/eflowVibeTheme.ts` contains only restrained product-brand overrides.
- `src/styles/index.css` owns global box sizing and imports compatibility styles while unmigrated screens still depend on them.
- `tests/unit/vibeFoundation.test.tsx` is the Vibe proof fixture. It exercises Button, IconButton, TextField, Tabs, Table, Label, Chips, Avatar, Tooltip, Dialog, EmptyState, Loader, Skeleton, theme switching, focus, and dialog behavior.

## Current consumer snapshot

Counts are source-file counts from `src/` at the Phase 1 implementation point. They are directional and should be regenerated before each cleanup phase.

| Presentation system | Current consumers | Phase 1 disposition |
| --- | ---: | --- |
| Vibe core | 91 TSX files | Migrate now; primary system |
| Vibe icons | 38 TSX files | Migrate now for touched surfaces |
| Radix packages | 32 TSX files | Migrate with feature phase; preserve behavior until replacement is proven |
| Carbon icons | 61 TSX files | Migrate with feature phase; retain where the touched surface is not yet migrated |
| Lucide icons | 266 TSX files | Migrate with feature phase; no mechanical icon swap |
| MUI imports | 0 TSX files | Keep package only until package-level consumer/config search confirms it is unused |
| `src/app/components/ui` primitives | 61 files | Migrate adapter-by-adapter; keep compatibility APIs until callers are moved |
| Feature-specific CSS/SCSS | 6 files | Migrate with feature phase; do not delete shared compatibility CSS in Phase 1 |

## Classification

### Migrate now: shared presentation foundations

- Root typography loading and entrypoint font consistency
- Vibe tokens and ThemeProvider boundary
- Global focus-visible behavior and box sizing
- Shared loading, empty, error, status, modal, table, and metric adapters
- Shared icon policy for newly touched UI
- Accessible Vibe proof and regression tests

### Migrate with the feature phase

- Projects and project-command views: `features/projects/**`
- Tasks, subtasks, reviews, and work-plan views: `features/tasks/**`, `features/subtasks/**`, `features/reviews/**`, `features/proposal-import/**`
- Team supervision, identity/access, intelligence, and reports: `features/team-management/**`, `features/role-department-head/**`, `features/reports/**`
- Department budget and governance: `features/budget/**`, `features/interdepartment-collaboration/**`
- Role-specific specialist screens: executive, finance, HRMO, legislative, councilor, and administration features

Each feature migration must first identify its navigation caller, permission boundary, queries/mutations, read-only behavior, and existing tests.

### Keep because it is not presentation

- Supabase/FastAPI clients, service operations, selectors, mappers, and domain types
- Role/permission resolution and authorization checks
- Workflow state transitions, review authority, fiscal controls, evidence/audit semantics
- Database migrations, RLS policies, API payloads, and generated data contracts
- Motion policy and reduced-motion preference behavior

### Final cleanup only

- `src/styles/default_theme.css` and compatibility portions of `src/styles/globals.css`
- Legacy Radix wrappers after all consumers are migrated
- Carbon/Lucide imports after surface-by-surface replacement and visual review
- Unused generated Figma styles and obsolete custom primitives after repository-wide consumer search
- Unused package dependencies after a clean lockfile install and build

## Rules for future phases

1. Do not introduce new hardcoded font families, one-off visual tokens, or another button/table/dialog system.
2. Use Vibe primitives directly when they carry no eFlow-specific meaning; create semantic eFlow components only when they map domain state or workflow meaning.
3. Do not infer authorization in presentation components.
4. Use text plus semantic color for status; never color alone.
5. Prefer Vibe Table for operational data, with wrapping/truncation/detail affordances for long strings.
6. Skeletons should preserve the eventual layout and be replaced only when data is ready; do not use decorative spinners for page loading.
7. Every visible feature change requires desktop, tablet, mobile, keyboard/focus, and reduced-motion review plus the affected unit/e2e tests.
8. Remove a legacy dependency only after `rg` proves zero consumers and the full check/test/build suite passes.

## Phase 1 acceptance evidence

- Real Vibe packages are installed and directly imported.
- Root Vibe token import and ThemeProvider are active.
- Figtree is bundled and the HTML entrypoint no longer loads or declares Montserrat.
- Global box sizing is present.
- The Vibe proof test covers representative controls, focus, tabs, table, dialog, empty/loading states, and semantic status.
- This inventory records remaining consumers and the safe migration order.
