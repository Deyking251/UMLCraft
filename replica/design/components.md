# Crack UML component specifications

Design direction: a welcoming modeling studio. The visual language is calm,
high-contrast and instructional: purple is reserved for actions and focus,
the canvas is nearly white, and guidance surfaces use a soft lavender tint.
The system is original to Crack UML and does not reuse StarUML branding,
icons, illustrations, copy, or proprietary assets.

## Foundations

### Typography

- `Inter` is the open, readable interface face; use the system fallback if it
  is unavailable.
- `ui-monospace` is used only for Mermaid/code input, keyboard shortcuts, and
  model identifiers.
- Body text is 16/24 on learning surfaces and 14/20 in dense editor chrome.
- Use sentence case. Avoid unexplained UML jargon in first-run instructions.

### Layout

- Header: 64px desktop, 56px compact/mobile.
- Desktop editor: left model rail 264px, flexible canvas, right guidance/
  inspector rail 320px. Rails are resizable only after the MVP.
- Tablet: collapse the right rail into a drawer; keep the model rail visible
  if space allows.
- Mobile: single-column project viewer/editor. Toolbox and inspector become
  bottom sheets; the canvas supports pan and pinch/keyboard zoom.
- Minimum touch target: 44px. Minimum visible focus outline: 2px with a 2px
  offset.
- Do not put essential actions only in hover tooltips. Every tool has an
  accessible name and a keyboard command where appropriate.

### Canvas

- Canvas background: `canvas`; grid lines: `canvas-grid` at 16px spacing;
  snap uses 8px increments.
- Model nodes use `node-fill` with `node-stroke`; selection uses a purple
  outline and a pale selection fill, never color alone.
- Relationships use `relationship` with arrowheads/line patterns that remain
  distinguishable in grayscale.
- Diagram content has a visible empty-state explanation and a “Try a lesson”
  action. The empty state never looks like a broken canvas.

## Components

### App shell

Variants: full editor, read-only share viewer, classroom lesson view.  
States: loading, ready, no project, offline draft, permission denied, fatal
error.  
Tokens: `bg`, `surface`, `border`, `text`, header 64px.  
A11y: landmark regions for header, navigation, main canvas, inspector and
status; announce save/offline/conflict state in a live region.  
Used on: S01-S18.

### Project launcher

Variants: blank project, guided template, recent project, open/import.  
States: empty recent list, loading, invalid file, trial/local mode.  
Tokens: `surface`, `surface-subtle`, `accent`, `accent-soft`, `card`.  
A11y: cards are buttons with descriptive labels; recent items expose name,
last edited date, and workspace; keyboard order follows the visual order.  
Used on: S01.

### Button

Variants: primary, secondary, ghost, danger, icon-only.  
Sizes: sm 32px, md 40px, lg 48px.  
States: default, hover, active, focus-visible, disabled, loading.  
Tokens: primary `accent/on-accent`; secondary `surface/text/border`; danger
`danger/on-accent`; radius `md`; focus `focus`.  
A11y: real `<button>`, accessible name, loading keeps its label for screen
readers, icon-only buttons require a tooltip plus `aria-label`.

### Text input and combobox

Variants: single-line, multiline, search, property value, Mermaid editor.  
States: empty, filled, focused, invalid, disabled, read-only, loading.  
Tokens: `surface`, `text`, `text-muted`, `border-input`, `danger`, `focus`.  
A11y: visible label or labelled-by relationship; errors are linked with
`aria-describedby`; autocomplete results are keyboard navigable.  
Used on: S01, S03, S07, S08, S13, S16, S17.

### Model tree

Variants: project root, package, element, diagram, filtered results.  
States: collapsed, expanded, selected, rename, empty, loading.  
Tokens: `surface`, `surface-subtle`, `accent-soft`, `text`, `text-muted`.  
A11y: implement the tree pattern with `role=tree`, `aria-expanded`, roving
tabindex, and keyboard create/rename/delete actions. Never rely on indentation
alone to communicate hierarchy.  
Used on: S02, S03, S06, S08.

### Diagram canvas

Variants: class, use case, sequence, activity, state, ERD, Mermaid-generated,
read-only shared view.  
States: empty, populated, panned, zoomed, selected, multi-selected, invalid
drop, rendering, export-disabled.  
Tokens: `canvas`, `canvas-grid`, `node-*`, `relationship`, `selection-*`.  
A11y: provide a parallel outline/list view of model elements and relationships
for keyboard and screen-reader users; announce selection and tool changes;
support keyboard move by grid increments.  
Used on: S04, S09, S13, S14.

### Toolbox

Variants: elements, relationships, annotations, lesson-recommended tools.  
States: active tool, select mode, disabled, invalid target, collapsed.  
Tokens: `surface`, `border`, `accent`, `accent-soft`, `text-muted`.  
A11y: grouped toolbar with roving focus; each tool exposes the element type,
shortcut, and one-line plain-language explanation. Escape returns to select.  
Used on: S04-S05.

### Model element node

Variants: class, interface, actor, use case, action, state, entity, package.  
States: default, hovered, selected, editing, invalid, linked, locked.  
Tokens: `node-fill`, `node-stroke`, `selection-fill`, `selection-stroke`,
`danger`, `shadow-node`.  
A11y: node name is exposed in the outline; compartment labels are not the
only source of meaning; invalid nodes have text and icon indicators.  
Used on: S04-S07.

### Relationship connector

Variants: association, dependency, generalization, aggregation, composition,
control flow, message.  
States: preview, valid, invalid, selected, labelled, routed.  
Tokens: `relationship`, `selection-stroke`, `danger`.  
A11y: relationship type and endpoints appear in the outline; arrowheads and
line patterns remain distinct without color; invalid connections explain the
rule in a nearby message.  
Used on: S04-S05, S10.

### Quick editor

Variants: name, attribute, operation, message, inline documentation.  
States: open, saved, cancelled, validation error, conflict.  
Tokens: `surface`, `border-input`, `focus`, `danger`, `shadow-pop`.  
A11y: focus moves into the editor, Enter commits only when valid, Escape
cancels, and the original node remains identifiable.  
Used on: S04, S07.

### Property and style editor

Variants: model properties, view properties, style, tags.  
States: no selection, editable, read-only, mixed values, invalid, saving.  
Tokens: `surface`, `surface-subtle`, `border`, `text-muted`, `focus`.  
A11y: every field has a label; mixed values are stated; changes announce save
status; destructive actions require confirmation.  
Used on: S07, S10, S16.

### Documentation and Markdown editor

Variants: short note, model documentation, Markdown source, preview.  
States: empty, editing, preview, invalid Markdown, long content, unsaved.  
Tokens: `surface`, `text`, `text-muted`, `accent-soft`, `danger`.  
A11y: preview has a heading structure; source and preview are separately
labelled; links identify their target; autosave status is announced.  
Used on: S07, S12.

### Navigation/search

Variants: working diagrams, quick find, command palette.  
States: closed, open, no results, results, keyboard focus, unavailable command.  
Tokens: `surface`, `shadow-pop`, `text`, `text-muted`, `accent-soft`.  
A11y: dialog focus trap, Escape close, arrow-key navigation, command labels
that include shortcuts and scope.  
Used on: S06, S08.

### Dialog and picker

Variants: element picker, list editor, font, color, print, preferences,
confirmation.  
States: open, loading, empty, validation error, cancel, confirm.  
Tokens: `surface`, `border`, `shadow-pop`, `danger`, `focus`.  
A11y: modal dialog semantics, initial focus, labelled title, focus return to
the trigger, and no destructive default action.  
Used on: S07, S10, S14, S16, S17.

### Bottom panel

Variants: find results, validation results, thumbnails, Markdown preview.  
States: hidden, expanded, empty, populated, error.  
Tokens: `surface`, `border`, `surface-subtle`, `success`, `warning`, `danger`.  
A11y: panel has a heading and can be collapsed; findings link back to the
canvas and are also available as a list.  
Used on: S02, S11, S12.

### Export job and status

Variants: SVG, PNG, JPEG, PDF, HTML, fragment.  
States: queued, running, complete, failed, expired.  
Tokens: `surface`, `accent`, `success`, `danger`, `text-muted`.  
A11y: status is announced; failed exports expose a retry action and a useful
reason; download buttons name the format and project.  
Used on: S14, S18.

### Extension and lesson cards

Variants: lesson, installed extension, available extension, update.  
States: searching, installable, installed, update available, failed, restart.  
Tokens: `surface`, `border`, `accent-soft`, `success`, `warning`, `danger`.  
A11y: card actions are separate buttons; version and permissions are visible
before install; lesson cards state the outcome and estimated time.  
Used on: S01, S15.

### Share and collaboration controls

Variants: view link, invite, comment, revision compare.  
States: private, copied, expired, revoked, pending, resolved, conflict.  
Tokens: `surface`, `accent`, `success`, `warning`, `danger`, `text-muted`.  
A11y: permission is explicit in the button label; copied/revoked states are
announced; comments are anchored in both canvas and outline views.  
Used on: S12, S14 and future classroom screens.

## Responsive behavior matrix

| viewport | shell | canvas | guidance/inspector | primary action |
| --- | --- | --- | --- | --- |
| 1440px+ | header + model rail + canvas + inspector | full grid, minimap and zoom controls | persistent right rail | guided lesson / add element |
| 1024-1439px | header + collapsible model rail + canvas | full grid, smaller minimap | inspector drawer or 280px rail | add element |
| 768-1023px | header + model rail + canvas | pan/zoom, reduced chrome | bottom sheet | add element |
| under 768px | compact header + single column | touch pan/zoom, outline toggle | bottom sheets for toolbox and inspector | “Add” action opens tool sheet |

## Content rules

- Use original, instructional copy: “Choose a starting lesson” rather than
  reproducing competitor labels.
- Explain the first action beside the tool, not only in a tooltip.
- Error format: what happened, why it matters, and the smallest repair.
- Never claim UML validity beyond the rule set actually implemented.
- Every exported artifact carries Crack UML metadata, not StarUML metadata.

## Primitive build order

1. Tokens, theme switch, focus ring, typography and responsive shell.
2. Button, input, dialog, toast, tabs and status/live-region primitives.
3. Model tree and outline navigation.
4. SVG canvas, grid, selection rectangle, pan/zoom and keyboard movement.
5. Model nodes, relationship connectors, toolbox and quick editor.
6. Property/style/documentation panels.
7. Lesson cards, validation findings, export status and share controls.

The first `/design` route should render all states above with representative
library-app model data and no external competitor assets.
