## Crack UML parity report

Date: 2026-10-26

Reference basis: the clean-room StarUML alternative recon map in
`replica/recon.md` and the feature matrix in `replica/features.csv`. The
comparison measures observable product behavior and excludes competitor
private APIs, licensing services, logos, and proprietary assets.

## Verdict

**Not shippable as a StarUML alternative yet.** Feature parity is **47.4 / 100**
with **5 of 16 must-have features complete**. Eleven must-haves remain partial
or missing. No S1 blocker is open in `replica/bugs.md`, and the current tested
vertical slice is usable. The requested activity, sequence, use-case,
statechart, DFD, ERD, and flowchart modes now exist as starter diagram
workflows, but they still need richer editing and model reuse before they match
the reference's full multi-diagram workflow.

The score is feature-only. A layout score was not produced because the recon
pass contains no permitted reference screenshots and the clone browser capture
was ephemeral rather than saved as an image. It would be misleading to treat
that missing evidence as either a pass or a zero.

## Score by area

| Area | Score | Counted features |
|---|---:|---:|
| Data modeling | 50.0 | 1 |
| Other models | 50.0 | 3 |
| Automation | 0.0 | 2 |
| Extensibility | 0.0 | 1 |
| Engineering | 0.0 | 1 |
| Education | 0.0 | 1 |
| UML | 59.4 | 6 |
| Persistence | 25.0 | 3 |
| Sharing | 25.0 | 3 |
| Documentation | 30.0 | 2 |
| Editing | 46.2 | 5 |
| Quality | 50.0 | 1 |
| Modeling | 75.0 | 2 |
| Onboarding | 83.3 | 3 |

## Must-have gaps

In the current build order, the remaining must-haves are:

- Activity, sequence, use-case, statechart, DFD, ERD, and flowchart diagrams
  now have starter canvases, typed nodes, and connectors; specialized notation
  rules, richer relationship editing, and full multi-diagram navigation are
  not implemented.
- Documentation is only a partial plain-language explanation field; a full
  documentation editor and Markdown preview are missing.
- Elements can be added through typed controls and moved by pointer drag, but
  palette drag/drop, multi-select, and keyboard nudging are not complete.
- Relationship creation exists, but shared relationship semantics and
  validation are incomplete.
- The model/view split is only partial; multi-diagram persistence is deferred.
- The application is browser-first rather than packaged as a cross-platform
  desktop application.
- Save/load uses the local backend adapter and localStorage fallback; portable
  model-file export remains missing.
- Validation is available through an API route, but asynchronous queued
  validation and a complete findings experience are missing.
- Export currently covers SVG only; PNG, JPEG, and PDF remain.

## Behavior differences from the recon target

- Crack UML leads with a guided Library Planner lesson and inline explanations;
  the reference workflow is a general-purpose modeling studio.
- The clone now supports starter slices across the major UML, data, process,
  and architecture families. The reference target still has deeper notation
  coverage, reusable model views, and a working-diagrams list.
- The clone's editor uses a compact typed-node workflow with pointer movement
  and a local durable project adapter. The target expects a richer palette,
  drag/drop creation, multi-select, model reuse across views, and portable
  project files.
- The clone exports the visible SVG. The target workflow also needs raster/PDF
  delivery, HTML documentation, printing, and shareable review output.
- Demo authentication and local authorization boundaries are present only for
  development. Production Auth.js, Postgres persistence, and cross-workspace
  authorization are still pending.
- Mermaid generation, extensions, code generation, CLI automation, team
  collaboration, comments, version history, and realtime editing are not yet
  implemented. Several are intentionally deferred rather than hidden.

## Verification evidence

- The production build passed with the current Next.js application and route
  handlers.
- Manual browser checks passed for the guided lesson, blank project, class
  modeling, save/refresh hydration, validation rejection, and SVG export.
- The health API reported the local backend adapter, and an invalid relationship
  was rejected without mutation.
- The Playwright spec is authored but was not executed because downloading the
  optional package failed with `EAI_AGAIN`; the available local flows were
  covered manually instead.

## Top five next build items

1. Finish specialized diagram semantics: drag/drop placement, editable
   relationship labels, activity fork/join behavior, state guards, sequence
   ordering, ERD cardinality, and DFD/flow validation.
2. Replace the single current view with a working-diagrams list and persistent
   model/view navigation so diagrams can coexist without replacing one another.
3. Build the documentation and review loop: rich/Markdown notes, preview,
   element anchors, and a visible asynchronous validation panel.
4. Complete persistence and delivery foundations: portable project files,
   production Postgres/Auth.js with workspace authorization, and a packaged
   cross-platform desktop shell.
5. Complete outputs: PNG/JPEG/PDF export, HTML documentation, and a
   shareable browser viewer; then add layout captures so visual parity can be
   scored rather than left unmeasured.

## Next skill

The next implementation pass should use `$replica-build` for the first item
and update `replica/features.csv` only when each behavior is actually verified.

