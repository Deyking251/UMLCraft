# Architecture: Crack UML

Date: 2026-10-26  
Based on: `replica/recon.md` and `replica/features.csv`  
Product stage: architecture for a first MVP, not a production deployment plan

## Product boundary

Crack UML is a clean-room UML modeling product for learners and small product
teams. The first release proves one reliable loop:

1. Start a guided project.
2. Create a class diagram.
3. Add two typed classes and a relationship.
4. Reuse the same model element in a second view.
5. Explain the model in plain language.
6. Save a portable project and export SVG/PDF.

The product may reproduce observable modeling workflows and interoperable
formats, but it does not copy StarUML source code, assets, copy, logo,
trademark, private APIs, license backend, or extension registry.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js App Router + TypeScript | A shareable browser viewer and editor are core audience differentiators; server routes and UI can live in one deployable app. |
| editor | React with a custom SVG scene graph and pointer/keyboard commands | UML compartments, labels, connectors, and multiple views need more control than a generic node editor gives. Keep rendering deterministic for export. |
| styling | Tailwind CSS plus CSS variables | Fast responsive shell, accessible themes, and design tokens without hard-coding the reference product's visual identity. |
| client state | React state for UI plus a small command/history store | Separate transient selection/tool state from model commands so undo/redo and autosave have one source of truth. |
| local cache | IndexedDB through a small repository adapter | Drafts and autosave remain usable during intermittent connectivity; the adapter can later support a Tauri desktop wrapper. |
| database | Postgres on Neon | One relational source of truth for workspaces, projects, model elements, views, comments, revisions, and export jobs; branching helps migration work. |
| ORM/data access | Drizzle ORM with a repository/data-access layer | Typed schema and SQL remain visible; every repository method receives an authenticated actor and checks workspace membership. |
| authentication | Auth.js with Google OAuth and email magic links | Low-friction classroom/team sign-in without putting credentials in the application database. Add school SSO only after demand is proven. |
| file/object storage | S3-compatible storage such as Cloudflare R2, added when exports and attachments need durable files | Keep large exports and future images out of Postgres; do not add it to the first local-only vertical slice. |
| export | Shared server-side renderer using the same scene-graph model as the editor | Prevent PDF/SVG output from drifting from the visible diagram; run small exports synchronously, queue large ones. |
| background jobs | Database-backed `export_jobs` plus Vercel Cron for cleanup | Avoid a second service initially; use a worker only when export volume or collaboration warrants it. |
| hosting | Vercel | Fits Next.js and preview deployments; the editor can later be packaged with Tauri without changing the domain layer. |
| email | Resend for invitations and share notifications, after the pilot | Not required for the first local project flow; all templates will be written fresh. |
| billing | Stripe Checkout/Billing after education validation | Pricing is a hypothesis, not an MVP dependency. Keep free education and team-plan rules behind a billing boundary. |
| observability | Sentry plus structured server logs | Canvas, parser, export, and collaboration failures need actionable evidence without logging model content unnecessarily. |

There is one application database and no microservices. The first deploy can
run the Next.js UI, route handlers, repository layer, and small export jobs as
one application.

## System shape

```text
Browser editor / future Tauri shell
  ├─ command store: create, update, connect, move, delete, undo, redo
  ├─ scene renderer: model elements -> diagram nodes/edges -> SVG
  ├─ local draft cache: IndexedDB
  └─ API client
          │ authenticated requests; project revision included
          ▼
Next.js route handlers
  ├─ input validation and request size limits
  ├─ authorization: actor -> workspace membership -> project
  ├─ domain services: model, diagram, validation, revisions, exports
  └─ repository layer (Drizzle)
          │
          ▼
Neon Postgres
  ├─ users / workspaces / membership
  ├─ projects / packages / model elements
  ├─ diagrams / views / relationships
  ├─ revisions / comments / share links
  └─ export jobs
```

The editor treats a model mutation as a command. A command updates the local
draft immediately, increments a project revision on save, and is persisted in
a transaction. Dragging a node is coalesced into one command on pointer-up so
the revision history is useful rather than recording every pixel.

## Domain rules and constraints

1. A project belongs to exactly one workspace. A workspace member can read a
   project according to their role; only editors or owners can mutate it.
2. A model element belongs to a project and optionally a model package. A
   diagram belongs to a project and optionally a package.
3. A diagram node references a model element. The same model element may have
   multiple nodes in one or many diagrams.
4. A model relationship connects two model elements. A diagram edge references
   that relationship and the diagram-local source and target nodes.
5. Deleting a model element is restricted when diagrams or relationships still
   reference it. The first UI offers “remove from diagram” separately from
   “delete from model”.
6. A project save is optimistic but revision-checked. If the server revision
   differs, the client receives `409 REVISION_CONFLICT` and must offer compare,
   reload, or save-as-copy; it must never silently overwrite another user's
   work.
7. Public share links are read-only projections. They cannot expose workspace
   membership, comments, private notes, or edit endpoints.
8. Lesson templates are authored content owned by Crack UML or a workspace;
   user model data is never inserted into a global template.
9. The renderer accepts a bounded, typed model document. It never evaluates
   user-provided JavaScript, templates, or arbitrary HTML.
10. Project JSON and revision snapshots are versioned. A migration converts an
    older format before it reaches the editor.

## Data model

The authoritative first migration is `replica/schema.sql`. It contains 17
tables:

1. `users`
2. `workspaces`
3. `workspace_members`
4. `workspace_invites`
5. `projects`
6. `lesson_templates`
7. `project_lessons`
8. `model_packages`
9. `model_elements`
10. `model_relationships`
11. `diagrams`
12. `diagram_nodes`
13. `diagram_edges`
14. `project_revisions`
15. `comments`
16. `share_links`
17. `export_jobs`

Auth.js adapter tables can be added as a separate migration when the chosen
adapter is wired. They are deliberately not mixed into the modeling schema.

### Authorization boundary

The MVP uses application-level authorization rather than Postgres RLS because
the chosen Neon setup keeps the domain logic portable for a later desktop
wrapper. Every data-access function takes an authenticated actor and performs
the equivalent of:

```text
actor -> workspace_membership -> project.workspace_id -> requested record
```

There must be no repository method that accepts only a record ID and returns
data. A second workspace member test is required for every read and write
path. Public share reads use a hashed token and a deliberately limited query.

## API surface

Auth.js owns `/api/auth/*`; the application routes below are the 28 planned
route surfaces. JSON request and response schemas are validated with Zod.

| method and path | who | input | output | flow |
| --- | --- | --- | --- | --- |
| `GET /api/health` | public | none | version and dependency status | ops |
| `GET, POST /api/workspaces` | signed-in user | name, kind | workspace summary | F01, F10 |
| `GET, PATCH /api/workspaces/:workspaceId` | member/owner | name, settings | workspace summary | F10 |
| `POST /api/workspaces/:workspaceId/invites` | owner/editor | email, role | invite status | F10 |
| `GET /api/workspaces/:workspaceId/projects` | member | cursor, filter | project summaries | F01, F06 |
| `POST /api/projects` | member | workspace, name, template ID | project and first package | F01 |
| `GET /api/projects/:projectId` | member or valid share token | revision, projection | project shell and model document | F01-F09 |
| `PATCH /api/projects/:projectId` | editor/owner | name, settings, `baseRevision` | new revision | F01, F06 |
| `DELETE /api/projects/:projectId` | owner | confirmation | `204` | account/workspace management |
| `POST /api/projects/:projectId/model-packages` | editor | parent, name | package | F01, F06 |
| `POST /api/projects/:projectId/elements` | editor | package, kind, name, properties | model element | F02-F07 |
| `PATCH, DELETE /api/elements/:elementId` | editor/owner | changed properties, `baseRevision` | element or `204` | F02-F07 |
| `POST /api/projects/:projectId/relationships` | editor | type, source, target, labels | relationship | F02-F06 |
| `DELETE /api/relationships/:relationshipId` | editor/owner | `baseRevision` | `204` | F02-F06 |
| `POST /api/projects/:projectId/diagrams` | editor | package, type, name | diagram | F01-F05 |
| `GET, PATCH, DELETE /api/diagrams/:diagramId` | member/editor/owner | settings, name, revision | diagram summary | F03-F06 |
| `POST /api/diagrams/:diagramId/nodes` | editor | model element, geometry, style | diagram node | F02-F06 |
| `PATCH, DELETE /api/diagram-nodes/:nodeId` | editor | geometry/style, revision | node or `204` | F02-F06, F09 |
| `POST /api/diagrams/:diagramId/edges` | editor | relationship, source/target node, points | diagram edge | F02-F05 |
| `PATCH, DELETE /api/diagram-edges/:edgeId` | editor | points/style, revision | edge or `204` | F02-F05, F09 |
| `POST /api/projects/:projectId/validate` | member | optional diagram/package scope | findings with severity and anchors | F07 |
| `POST /api/projects/:projectId/mermaid-import` | editor | Mermaid source, type, package | created diagram/elements or parse errors | F08 |
| `GET, POST /api/projects/:projectId/revisions` | member/editor | cursor or snapshot metadata | revision list or saved revision | F06, F10 |
| `GET, POST /api/projects/:projectId/comments` | member/editor | anchor, body, mentions | comment thread or list | future collaboration |
| `POST /api/projects/:projectId/exports` | member/editor | format, diagram selector, options | export job | F09, F11 |
| `GET /api/exports/:exportId` | requester/member | none | status and short-lived download URL | F09, F11 |
| `POST /api/projects/:projectId/share-links` | editor/owner | permission, expiry | one-time share URL | audience differentiator |
| `GET /api/share/:token` | public with token | projection query | read-only project/diagram view | browser viewer |

### Route behavior

- Mutations include `Idempotency-Key` when a retry could create a duplicate
  project, invite, comment, revision, or export job.
- Mutations include `baseRevision`; stale writes return `409` with the server
  revision and a minimal conflict summary.
- Request bodies are bounded: model command batches 256 KB, Mermaid input 64
  KB, comments 10 KB, and export selectors 32 KB for the MVP.
- Errors use `{ code, message, fields?, requestId }`; messages are safe for
  the UI and detailed diagnostics stay in server logs.
- The public share route returns a projection with model names, diagrams and
  comments only when explicitly marked public; it never returns raw workspace
  membership or private documentation.

## Core SQL decisions

`schema.sql` uses UUID primary keys, UTC timestamps, foreign keys with explicit
delete behavior, indexes for every ownership/filter path, JSONB only for
typed extension points and rendering settings, and checks for non-empty names,
valid coordinates, valid relationships, and export status transitions.

Money is intentionally absent from the first migration. Billing is a later
boundary and will use Stripe IDs plus integer cents and an ISO currency code
when the education/team pricing hypothesis is validated.

## Parts that bite

| risk | decision / mitigation | acceptance evidence |
| --- | --- | --- |
| Model/view consistency | Store semantic model elements separately from diagram-local nodes and edges. Mutate through typed commands, not arbitrary JSON patches. | The same class renamed in one view updates every view; deleting a view does not delete the model element. |
| Canvas rendering and export fidelity | Use one normalized scene graph and deterministic SVG rendering for browser, SVG, and PDF paths. Keep unsupported effects explicit. | Golden fixtures render the same node labels, connectors, and page bounds in browser and exported SVG/PDF. |
| Undo/redo, autosave, and conflicts | Command history is local; saves are transactional and revision-checked. Coalesce pointer moves and reject stale writes. | Refresh preserves the last save; two clients cannot silently overwrite a newer revision. |
| UML validation | Keep a small rule engine with typed finding anchors and plain-language explanations. Do not attempt every UML rule in v1. | Invalid relationships produce a reproducible finding linked to the element and a repair hint. |
| Mermaid import | Parse only supported diagrams, cap input, report unsupported syntax, and never execute generated code. | Malformed input returns a safe parse error; supported input creates a model that can be edited. |
| Browser sharing and privacy | Public links are hashed, revocable, read-only projections with expiry. | A share token cannot access workspace members, private comments, or mutation routes. |
| Collaboration | Start with comments, revisions, and last-write-wins avoidance. Delay realtime cursors/CRDTs until user research proves need. | Conflict test shows compare/reload/save-as-copy behavior. |
| Offline/local use | IndexedDB draft cache is an adapter, not a second source of truth. Show unsynced status and provide export of local work. | Disconnect/reconnect test does not lose a saved or unsynced project. |
| File size and abuse | Limit model depth, element count, input sizes, export duration, and share expiry. | Oversized payloads fail before database writes and are logged by request ID. |
| Multi-tenancy | Every repository query resolves membership before selecting the record. | Cross-workspace test returns `404` or `403` consistently and no data. |
| Deletion and retention | Owner-only project/workspace deletion; queued exports expire; account deletion removes or anonymizes owned records according to policy. | Deletion test covers projects, revisions, comments, share links, and export files. |

## Build order

### M0 — foundation and editor shell

Screens: S01, S02, S03, S04.  
Tables: `users`, `workspaces`, `workspace_members`, `projects`,
`model_packages`, `model_elements`, `diagrams`, `diagram_nodes`,
`model_relationships`, `diagram_edges`.  
Routes: health, workspace/project list, create/get/patch project, package,
element, relationship, diagram, node and edge routes.  
Acceptance: a signed-in or local demo user can create a project and see a
blank class diagram with a model tree and a responsive shell.

### M1 — vertical slice: guided class model

Screens: S01, S03-S05, S07, S14.  
Tables: M0 tables plus `lesson_templates` and `project_lessons`.  
Routes: guided project creation, element/relationship mutations, validation,
and a synchronous SVG export.  
Acceptance: a learner follows a library-app template, creates two classes and
an association, renames one class in the property editor, and exports a clean
SVG. The model tree and diagram agree after refresh.

### M2 — modeling must-haves and reliability

Screens: S06, S08-S12.  
Tables: `project_revisions`.  
Routes: revisions, validation, Mermaid import, documentation, and formatting
settings.  
Acceptance: undo/redo, reload, keyboard navigation, quick find, model
validation, Markdown notes, minimap/zoom, and revision-conflict handling work
for the class/use-case/sequence paths.

### M3 — audience differentiators

Screens: S12, S14, share-view projection.  
Tables: `comments`, `share_links`.  
Routes: comments, share links, public share.  
Acceptance: a teacher or product lead can share a read-only link, leave an
anchored comment, and review a revision without installing the editor.

### M4 — export and automation

Screens: S14, S18.  
Tables: `export_jobs`.  
Routes: export creation and status/download.  
Acceptance: SVG, PNG, PDF and HTML exports have stable layout, bounded jobs,
useful errors, and no competitor branding. CLI support follows once the
renderer is deterministic.

### M5 — classroom and small-team operations

Screens: S15-S17.  
Tables: `workspace_invites` plus any Auth.js adapter tables.  
Routes: invitations, workspace settings, extension boundary, and billing
placeholder.  
Acceptance: a small cohort can join a workspace, use starter lessons, and
manage access. Do not add realtime co-editing until usability evidence exists.

### M6 — later / explicit validation required

Code generation, reverse engineering, SysML/BPMN/cloud notation, real-time
co-editing, school SSO, mobile clients, and paid plans. These are not part of
the first acceptance gate.

## Verification plan

- Unit tests for command reducers, model/view constraints, revision checks,
  validation rules, Mermaid parsing limits, and export selectors.
- Repository tests for workspace isolation, role checks, deletion behavior,
  share projections, and idempotency.
- Browser tests for F01-F09 at 390px and 1440px, keyboard-only operation,
  empty/loading/error states, and an accessibility scan.
- Golden SVG fixtures for class, use-case, sequence, activity and long-label
  diagrams; compare structure and text placement, not competitor colors.
- Manual checks for offline draft recovery, exported PDF opening, and public
  share revocation.

## Summary

Stack: Next.js + TypeScript + custom SVG editor + Drizzle + Neon Postgres +
Auth.js + Vercel, with optional Tauri packaging later.

Tables: 17 modeling/application tables in the first migration.  
Route surfaces: 28 planned application routes, excluding Auth.js internals.  
Three riskiest parts: model/view consistency, deterministic rendering/export,
and safe revision/conflict handling.  
Next step: `$replica-design` for tokens, accessible editor primitives, and
component states.

