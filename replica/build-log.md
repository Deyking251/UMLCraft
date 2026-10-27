# Crack UML build log

Date: 2026-10-26

- S01 App shell — done. Original Crack UML branding, top actions, three-pane studio layout, and responsive overflow behavior.
- S02 Blank project — done. New project creates an empty model with an explicit empty state and a guided-lesson escape hatch.
- S03 Guided lesson — done. Start lesson loads the Library Planner learning scenario with steps, hint, and modeling tip.
- S04 Class diagram — done. Custom SVG canvas renders typed class nodes, relationship line, labels, grid, selection, and status.
- S05 Model explorer — done. Project, domain model, elements, and diagram appear as an accessible tree.
- S07 Element inspector — done. Selected classes expose editable name, plain-language explanation, attributes, and operations.
- S09 Diagram-type creation flow — partial. Added original starter canvases and typed controls for activity, sequence, and use-case diagrams; multi-diagram persistence, fork/join tooling, and richer relationship editing remain.
- S09 Extended diagram catalog — partial. Added Statechart, DFD, ERD, Flowchart, Component, Deployment, Package, Object, Communication, Timing, Information Flow, Profile, Composite, BPMN, C4, Wireframe, Mindmap, and Cloud starter canvases; notation-specific editing rules remain.
- S04 Canvas interaction fix — partial. SVG model elements, including actors, now support pointer drag, canvas clamping, selection, unsaved state, and one-step undo; keyboard nudging and multi-select remain.
- S04 Element deletion — done. Selected actors and model elements can be deleted from the toolbar or with Delete/Backspace; attached relationships are cleaned up and Undo restores the snapshot.
- S04 Connection tool fix — done. Relationship controls now use an explicit source-then-target flow, block duplicate associations, and route arrows from the nearest node edges so reverse links do not overlap nodes.
- S09 Local persistence — partial. Save project writes through the local durable backend and falls back to browser localStorage; portable project-file export and production persistence remain.
- S14 SVG export — partial. Export SVG downloads the current diagram; PNG, JPEG, PDF, and shareable viewer remain.
- Backend M0/M1 — done for local development. API health, project reads/creates, revision-checked saves, element/relationship validation, and project validation are available through Next.js route handlers.

## Verification

- `npm run build` passed with Next.js 14.2.35, TypeScript checks, and static page generation.
- The localhost preview rendered the seeded Library Planner diagram in the in-app browser.
- The New project action rendered the zero-element empty state and announced the change through the live region.
- `GET /api/health` returned `backend: local-file`; the validation route rejected a relationship with a missing endpoint.
- Activity, sequence, and use-case starter views render with selectable typed nodes and connectors; the diagram picker switches the current practice view and Undo returns to the previous view.
- QA added `replica/test-plan.md`, `replica/bugs.md`, and an optional Playwright spec under `outputs/crack-uml/e2e/`.
- The visual preview was inspected at a narrow browser viewport; the studio remains usable with horizontal canvas scrolling, while a dedicated compact mobile layout is a follow-up.

## Scope boundary

This is a clean-room editor with a durable local backend adapter. Production Postgres/Auth.js, export jobs, share links, and cross-workspace authorization remain before deployment; then `$replica-test` should cover the complete flow matrix.
