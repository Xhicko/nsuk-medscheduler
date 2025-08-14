# AI agent guide (generalized)

Keep answers short and concrete. Prefer actionable edits over generic advice. Follow these defaults across repositories; adapt to the project’s tech after a quick discovery.

## Before you start (new project)
- Check if there’s a newer/better way to perform tasks for the chosen stack (framework’s latest docs, official guides, deprecations).
- Detect stack and versions (framework, React, Node, package manager) and choose compatible libs.
- Confirm branding primary color (and OKLCh) before UI edits.
- Verify UI kit baseline (Tailwind + shadcn/ui + icons) or the project’s chosen kit; install if missing.
- Decide segments and protected areas; set up middleware/guards if applicable.
- Confirm auth provider and environment keys; scaffold auth utilities and protected layouts.
- Create segment API config files under `src/config/`.
- Run lint/build to validate the baseline before feature work.

## Fast discovery (adapt to the stack)
- Detect framework/language by files: Next.js (next.config.*, src/app or pages), React (src/index.*), Vite (vite.config.*), Node/Express (app.js/server.js), PHP/Laravel (artisan, composer.json), Python (pyproject/requirements.txt), etc.
- Find package manager and scripts from package.json/yarn.lock/pnpm-lock.yaml/bun.lockb. Prefer scripts exposed there.
- Identify UI/system libs: Tailwind (tailwind.config.*), shadcn/ui components, Zustand/Redux stores, data libs (Supabase/Prisma/Mongoose), email templates.
- Locate API/backend routes (e.g., src/app/api/**, api/**, routes/**) and auth utilities.
- Note any “segments” under src/app/<segment>/**; protected areas often live in group routes like (protected).

## Default project structure (baseline)
- Root configs: `package.json`, `next.config.*`, `eslint.config.*`, `tailwind.config.*`, `postcss.config.*`, `jsconfig.json`.
- Public assets: `public/`.
- App routes: `src/app/` with segments (e.g., `<segment>/`, `<segment>/(protected)/`, `api/`, `dev/preview/`).
- UI primitives: `src/components/ui/` (shadcn) and `src/components/custom/` (+ optional `custom/<segment>/`).
- Hooks: `src/hooks/` (+ optional `hooks/<segment>/`).
- Lib/services: `src/lib/` (auth, email, db clients, utils).
- Stores: `src/store/` (+ optional `store/<segment>/`).
- Emails/templates: `emails/`.
- Feature configs: `src/config/`.

## Coding style & guardrails (Xhicko)
- Clear names; avoid single-letter vars except trivial indices.
- Small units (≈ ≤40 lines); add a one-line justification if longer.
- Minimize useEffect; prefer server-side data fetching, declarative libs (SWR/React Query), custom hooks, or direct handlers. If you add useEffect, include a short technical reason and an alternative.
- SSR-first for initial loads; CSR for user actions/refreshes when using Next.js.
- No TypeScript—use concise JSDoc and light runtime validation for external inputs.
- Always handle async/I/O errors; don’t swallow them.
- No unsafe dynamic-code patterns (eval, unsanitized template compilation) without explicit justification.
- Dependency changes: list affected files, alternatives, risk; for majors add a brief migration plan.
- Lint/format: follow repo rules; propose minimal ESLint+Prettier only if missing and wait for approval.

### Best current patterns
- Composition-first UI: prefer small reusable atoms and the project’s UI kit over ad‑hoc markup.
- Split responsibilities: keep state/handlers in Logic files; keep Views presentational and prop-driven.
- Forms: use controlled inputs via shared atoms; validate at edges; map snake_case (API) to camelCase (UI) in Logic.
- Lists and search: centralize pagination/filter/search in Logic; debounce search; keep URL/query in sync when appropriate.
- UX: sticky headers/footers for modals/sheets; confirmation dialogs for high‑intent actions; toasts for success/failure.
- Interactivity: ensure all clickable elements (Buttons, Select triggers, icon buttons) use `cursor-pointer` and have visible focus styles.
- Security: do privileged actions only on the server; enforce role checks in API/routes.
- Verification flows: store tokens with expiries on the primary entity; implement resend cooldowns; prefer OTP inputs where applicable.
- Accessibility: label controls clearly; use descriptive titles/aria where helpful.
- Styling: Tailwind utility‑first; keep icon sizes/colors consistent with the design system.
- Branding: each project defines a default primary color. Before making UI updates, confirm the primary color (or read it from theme/Tailwind config); if unknown, ask for it. Use it consistently across buttons, accents, and icons.
- Auth gating: containers wait for auth store readiness before rendering feature views; show skeletons until ready.
- Middleware protection: enforce protected segments at the edge (e.g., middleware.js) in addition to layout/guard checks.
- Route progress: expose a global route progress bar for navigation feedback.
- Data tables: use a shared DataTable baseline; define columns in View, manage data/pagination in Logic.

Brand palette (project-level)

| Primary (hex) | Primary (OKLCh) |
| --- | --- |
| #0077B6 | 0.5464 0.1313 242.68 |

Tip: when using OKLCh in CSS, prefer `oklch(0.5464 0.1313 242.68)` and provide a hex fallback where needed.

### DRY & reuse placement
- Apply DRY: avoid duplicating logic/UI; extract shared pieces early.
- Utilities/services: place reusable functions in `src/lib/` (e.g., validators, mappers, API clients). Keep pure and framework-agnostic when possible.
- Components: put cross-segment reusable UI in `src/components/custom/`. For segment-specific variants, use `src/components/custom/<segment>/`.
- Hooks: place shared hooks in `src/hooks/`; for segment-specific hooks, use `src/hooks/<segment>/`.
- Prefer composition over configuration flags. If branching grows, refactor shared core + thin segment wrappers.

Examples in this repo
- Custom atom: `src/components/custom/floating-label-input.jsx`.
- Confirmation dialog: `src/components/custom/admin/ConfirmationDialog.jsx`.
- DataTable: `src/components/custom/admin/data-table.jsx`.
- Service clients/utils: `src/lib/supabaseServer.js`, `src/lib/email.js`, `src/lib/utils.js`.
- Admin module reference: `src/app/admin/(protected)/admin-management/`.

## API patterns
- Structure routes by segment and resource: `/api/<segment>/<resource>` (or the framework’s equivalent foldering).
- Implement CRUD via HTTP method handlers per resource route file:
  - GET: list with pagination (`page`, `limit`), search (`search`), and filters (resource-specific). Support single item via `id` when applicable.
  - POST: create with input validation; return 201 on success.
  - PUT/PATCH: update by `id`; validate and return 200 on success.
  - DELETE: remove by `id`; return 200/204 on success.
- Enforce auth and role checks at the start of each handler; perform privileged actions only on the server.
- Validate inputs at the edge; surface clear 4xx errors (use 409 for conflicts) and 5xx for unexpected failures.
- Keep responses consistent: `{ data, error }` or `{ success, data }`; avoid mixing shapes.
- Keep route files thin; extract non-trivial business logic into `lib/` or service modules.

### Segment API config
- Centralize endpoints per segment under `src/config/` as `<segment>Config.js` (e.g., `adminConfig.js`, `studentConfig.js`).
- Expose a single `ENDPOINTS` object per file (e.g., `ADMIN_ENDPOINTS`, `STUDENT_ENDPOINTS`) grouped by resource.
- Reference endpoints only via these configs in Logic files and services—avoid hard-coding paths in Views/components.
- Keep naming consistent and descriptive; prefer singular resource keys with clear actions (e.g., `ADMIN_ENDPOINTS.VERIFY_EMAIL`, `...ADMIN_MANAGEMENT`).

## Authentication pattern
- Provider & clients: use an auth provider (e.g., Supabase). Create a session-bound server client for per-request auth and a service-role client for privileged server-only operations.
- Middleware & protected segments: enforce access at the edge via middleware (e.g., `middleware.js`) and group protected routes under `(protected)` segments.
- Store-gated rendering: containers read an auth store (e.g., Zustand) and render skeletons until initialized; then render Views.
- Hooks & bridges: provide `useRequire...Auth` and `use...ReAuthenticate` hooks. Use a bridge component (e.g., an Access*Bridge) to delay page rendering until auth and roles are asserted.
- API guards: every API handler checks session/user and role before CRUD; only run privileged ops with the service client on the server.
- Server-driven messages: surface server error/success messages in client UI; avoid hard-coded strings.

## Default page scaffolding (global)
- Placement
  - Protected feature: `src/app/<segment>/(protected)/<feature>/`
  - Unprotected feature: `src/app/<segment>/<feature>/` (or framework equivalent)
  - Root public page: `src/app/<feature>/`
- Files per feature (web UIs)
  - `page.jsx` (server/SSR): export `metadata`; render `<FeatureContainer initialData={...} />`.
  - `<Feature>Container.jsx` (client): guards + wiring; show `<FeatureSkeleton />` until ready.
  - `<Feature>Logic.js`: state, handlers, API calls; map snake_case -> camelCase for UI where needed.
  - `<Feature>View.jsx` (client): presentational only; use the project’s UI kit (e.g., shadcn/ui) and custom atoms.
  - `<Feature>Skeleton.jsx`: loading UI mirroring layout.
- Conventions
  - SSR-first; CSR for user actions.
  - Use confirmation dialogs for destructive/high-intent actions by default.

## Patterns & conventions
- Server-driven messages: surface server response messages in client UI (toasts, inline errors). Avoid hard-coded strings; fall back only when the server provides none.
- Keep server response shapes vs UI state consistent; map snake_case to camelCase at the Logic layer if backend returns snake_case.
- Prefer existing UI primitives before adding new libs (e.g., reuse Buttons, Dialogs, DataTable).
- Feature flow: View triggers → Logic handlers → API calls → toast/alerts → refresh list/state.
- If OTP/email verification exists, gate creation flows in UI and enforce on server.

## UI kit baseline & checklist
- Discovery: list the current UI stack (Tailwind, shadcn/ui or other kit, icon set, table/chart libs) from package.json and components folders.
- Baseline defaults (web React/Next): Tailwind CSS + shadcn/ui (Radix) + lucide-react icons. Prefer these unless the repo mandates another kit.
- Installation guidance (version-aware):
  - Next.js (App Router, React 18+): use shadcn/ui compatible with the detected Next/React versions; ensure Tailwind is configured.
  - React (non-Next): prefer Radix Primitives + Tailwind + lucide-react, or the project’s standard UI kit.
- Components checklist to exist or be added: accordion, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, chart, collapsible, dialog, dropdown-menu, input, input-otp, label, popover, radio-group, select, separator, sheet, sidebar, skeleton, table, tabs, textarea, tooltip..
- If the baseline UI is missing, propose installing the compatible versions and scaffolding the primitives before proceeding with feature work.


## Forms & validation
- Prefer React Hook Form + Zod with `zodResolver`:
  - Define schema with Zod; keep server/DB constraints aligned.
  - Initialize `useForm({ resolver: zodResolver(schema), defaultValues })`.
  - Use controlled inputs via shared atoms; register fields, and show errors from `formState.errors`.
  - Surface server validation messages in the UI (inline/toasts). Map server field names (snake_case) to form fields.
  - Avoid useEffect for form setup; use RHF defaults and event handlers instead.

## Dev workflows & quality gates
- Use project scripts where available. Typical Node scripts:
  - dev: start local server (e.g., `npm run dev`)
  - build: production build (e.g., `npm run build`)
  - start: run built server
  - lint: lint/format
- Before proposing a commit, always:
  - run lint/format
  - run build
  - run tests if present
  - run any migration dry-run if maintained
- If any check fails, revert your changes and provide a succinct error report with remediation steps.
- Deliverables per change:
  - PR-style summary (what/why, risk, rollback plan)
  - One-line Conventional Commit message
  - Short smoke-test checklist (exact commands and manual steps)
