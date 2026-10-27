# Crack UML bug report

## Fixed bugs

### B-001 — Saved project briefly showed the seed lesson after refresh

- Severity: S3
- Status: fixed in working tree; no repository commit exists in this workspace.
- Steps to reproduce: save a changed project, refresh the editor, and inspect the first rendered state before the backend request completes.
- Expected: show a loading state until the saved project is restored.
- Actual: the seed Library Planner state rendered briefly, then changed to the saved project.
- Evidence: reproduced during the 2026-10-26 browser pass; `.data/projects.json` contained the saved project while the first refresh snapshot still showed Library Planner.
- Fix: added an explicit hydration loading state and only render the editor after the backend response or a controlled fallback completes.

### B-002 — Connect created overlapping or backwards arrows

- Severity: S2
- Status: fixed in working tree; no repository commit exists in this workspace.
- Steps to reproduce: open a Use-case diagram with a selected element, click Connect repeatedly, and inspect the connector lines.
- Expected: choose a source and target explicitly, create one relationship, and keep the arrow outside the node shapes.
- Actual: Connect immediately created a relationship from the selected element to the first other element; repeated use could create reverse or overlapping arrows.
- Evidence: reproduced in the live browser on 2026-10-27; the canvas showed opposing connectors between Student and Model a feature.
- Fix: changed connection creation to source-then-target selection, blocked duplicate associations, and selected the nearest horizontal node edges for connector endpoints.

## To check in the next pass

- S2: verify the production Postgres adapter rejects cross-workspace reads once Auth.js and membership queries are wired.
- S3: verify a deliberately slow network does not allow a user action before hydration; the new loading gate should prevent it.
- S3: verify compact mobile layout at a true narrow viewport; the current canvas remains horizontally scrollable.
- S3: verify SVG downloads in browsers with download restrictions.
