# Crack UML test plan

Date: 2026-10-26

The local target is `http://localhost:3001` during normal development. Seed data is the Library Planner lesson. F01, F02, F07, and F09 are in the current vertical slice; the remaining flows are explicitly tracked as not implemented rather than silently skipped.

## F01 — Student starts a guided UML project

- F01-H1: Load the app, wait for hydration, click Start lesson. Expect Library Planner, two classes, a relationship, lesson steps 2/2, and a modeling tip.
- F01-E1: Click New project. Expect zero elements, a clear empty state, no selected inspector, and 1/2 lesson progress.
- F01-E2: Refresh during hydration. Expect a loading state, then the saved project without a seed-state flicker or accidental overwrite.
- F01-E3: Use a narrow viewport. Expect the shell to remain operable with a scrollable canvas.
- F01-E4: Navigate with Tab only. Expect named buttons and editable fields in a usable order.
- F01-N1: If the backend is unavailable, expect a visible local-save fallback rather than data loss.

## F02 — Model a class-based feature

- F02-H1: Create a blank project, add two classes, select the source, choose Association, then select the target. Expect one correctly routed labeled connector and the edited name in the explorer and inspector.
- F02-E1: Add a class with a long name. Expect bounded rendering without a server error.
- F02-E2: Add a duplicate class name. Expect the validation route to return a warning.
- F02-E3: Add a relationship before two classes exist. Expect an announcement explaining that another class is required.
- F02-E4: Add attributes and operations. Expect them in the selected inspector and diagram compartments.
- F02-E5: Use emoji and accented names. Expect them to remain escaped in SVG export and visible in the editor.
- F02-N1: Submit a relationship referencing a missing element. Expect `INVALID_RELATIONSHIP` and no mutation.

## F03 — Describe a user goal with a use-case diagram

- F03-H1: Choose Use-case in the diagram picker. Expect a system boundary, Student actor, two use cases, associations, and selectable nodes.
- F03-E1: Empty input, long labels, duplicate connections, invalid actor/use-case connection, keyboard-only selection, actor dragging, actor deletion with relationship cleanup, and mobile width remain to be tested in the browser.
- F03-N1: Permission-denied creation must return a safe error without creating a partial diagram.

## F04 — Explain a request as a sequence

- F04-H1: Choose Sequence in the diagram picker. Expect Learner, Crack UML, and Project store lifelines with numbered message connectors.
- F04-E1: Crowded canvas, long message text, existing classifier lifeline, refresh mid-flow, and narrow viewport remain to be tested in the browser.
- F04-N1: Invalid message endpoints must be rejected without a partial edge.

## F05 — Build behavior with an activity or state diagram

- F05-H1: Choose Activity in the diagram picker. Expect initial/final nodes, actions, a decision, labeled flows, and selectable nodes.
- F05-E1: Missing initial/final node, invalid flow, fork/join ambiguity, long labels, and keyboard navigation remain to be tested in the browser.
- F05-N1: Invalid transitions must produce a plain-language finding.

## Extended diagram catalog

- Statechart: starter states, initial/final nodes, and labeled transitions are available; guards and composite states remain to be tested.
- DFD: starter actors, processes, data stores, and flows are available; data-flow validation and balancing remain to be tested.
- ERD: starter entities, fields, and relations are available; keys, cardinality, and normalization guidance remain to be tested.
- Flowchart: starter steps, decisions, initial/final nodes, and flows are available; automatic layout and branch validation remain to be tested.
- Component, deployment, package, object, communication, timing, interaction, information-flow, profile, composite, BPMN, C4, wireframe, mindmap, and cloud modes expose reusable starter canvases; notation-specific behavior remains future coverage.

## F06 — Reuse one model across multiple views

- F06-H1: Not implemented; expected the same model element to appear in multiple diagrams.
- F06-E1: Stale view, wrong package, duplicate representation, refresh, simultaneous tabs, and deleted diagram must be tested when available.
- F06-N1: A non-member must not read another workspace's project.

## F07 — Document and validate a model

- F07-H1: Select a class, edit its plain-language explanation, and call validation. Expect the explanation to persist and findings to include actionable anchors.
- F07-E1: Validate an empty model, duplicate names, a broken relationship, long documentation, and emoji/accents.
- F07-E2: Refresh after save. Expect documentation and model structure to match the backend snapshot.
- F07-N1: Malformed JSON or invalid payload must return `VALIDATION_ERROR` without a write.

## F08 — Generate a first diagram from text

- F08-H1: Not implemented; expected supported Mermaid input and a generated editable model.
- F08-E1: Empty input, syntax error, unsupported syntax, long input, and missing target package must be tested when available.
- F08-N1: Generated input must never execute user-provided code.

## F09 — Export a deliverable

- F09-H1: Open a populated class diagram and click Export SVG. Expect a downloadable SVG with node labels and relationship text.
- F09-E1: Export empty, long labels, emoji/accents, narrow viewport, and unwritable destination.
- F09-N1: Unsupported PNG/PDF requests must return a clear not-yet-supported response rather than a corrupt file.

## F10 — Extend the tool for a team workflow

- F10-H1: Not implemented; expected extension manager and preferences.
- F10-E1: Version mismatch, restart-required extension, keymap conflict, and extension failure must be tested when available.
- F10-N1: A non-member must not install or mutate workspace extensions.

## F11 — Automate documentation or image generation

- F11-H1: Not implemented; expected CLI input/output and deterministic headless rendering.
- F11-E1: Missing input, empty query, existing output, long path, timezone-sensitive metadata, and differing headless layout must be tested when available.
- F11-N1: A path outside the allowed output directory must be rejected.

## Cross-cutting checks

- Console errors: fail the automated run on browser errors.
- HTTP errors: fail on any unexpected 5xx response.
- Accessibility: named controls, labels, live announcements, keyboard focus, and `aria-busy` loading state.
- Security: no secrets in client bundles or URLs; local demo auth remains disabled in production mode.

## 2026-10-26 execution summary

- Passed manually in the local browser: F01-H1, F01-E1, F02-H1 including source-to-target connection and duplicate prevention, F07-N1, F09-H1, save, refresh hydration, and backend status.
- Passed by API smoke check: health route returned `backend: local-file`; broken relationship returned `INVALID_RELATIONSHIP` without mutation.
- Passed build: isolated production build completed successfully with Next.js 14.2.35.
- Passed browser smoke check in the existing local session: the picker switched to Activity, Sequence, and Use-case and exposed the expected starter nodes and tools. A fresh preview could not be started because the environment refused an additional local listening port (`EPERM`); mode-specific save/refresh persistence remains unclaimed.
- Playwright spec authored but not executed in this environment because the package download returned `EAI_AGAIN`; the browser click-through covered the available local flows instead.
