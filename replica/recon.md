# Recon map: StarUML alternative (desktop-first, web-ready)

Working product name: **Crack UML**. This is a provisional name only; it has
not been checked for trademark, domain, store, or handle availability.

Scope: StarUML's core model-first workflow: start a project, create UML
diagrams, build a shared model from elements and relationships, inspect and
document the model, then export or share it.

For: students, teachers, bootcamp cohorts, junior developers, and small
product teams that need guided UML modeling without enterprise-tool overhead.

Date: 2026-10-26

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | official product page | https://staruml.io/ | Current product positioning, supported modeling languages, platform and major capabilities. |
| 2 | official pricing | https://staruml.io/pricing/ | V7 Standard/Professional packaging, device-based one-time pricing, educational discount. |
| 3 | official download page | https://staruml.io/download/ | Windows, macOS and Linux availability. |
| 4 | official help center | https://staruml.io/help/ | Commercial licensing, 30-day evaluation, watermark behavior, device activation and offline activation. |
| 5 | user interface guide | https://docs.staruml.io/user-guide/user-interface | Main window, diagram area, sidebar, toolbox, model explorer, editors, dialogs, quick find and command palette. |
| 6 | basic concepts | https://docs.staruml.io/v3/user-guide/basic-concepts | Project file, model-versus-view distinction and reusable fragments. |
| 7 | managing projects | https://docs.staruml.io/master/user-guide/managing-project | New/open/save/template projects, fragments, profiles and HTML documentation export. |
| 8 | managing diagrams | https://docs.staruml.io/user-guide/managing-diagrams | Create/open/close/delete diagrams and switch between working diagrams. |
| 9 | diagram editor | https://docs.staruml.io/user-guide/diagram-editor | Selection, panning, minimap, zoom and viewport behavior. |
| 10 | class diagrams | https://docs.staruml.io/working-with-uml-diagrams/class-diagram | Classifier elements, quick edit, attributes, operations and relationships. |
| 11 | activity diagrams | https://docs.staruml.io/working-with-uml-diagrams/activity-diagram | Actions, flows, decisions, forks, joins and initial/final nodes. |
| 12 | sequence diagrams | https://docs.staruml.io/v3/working-with-diagrams/sequence-diagram | Lifelines, messages and sequence-number behavior. |
| 13 | formatting | https://docs.staruml.io/user-guide/formatting-diagram | Style editing, layout, visibility, labels, auto-resize and alignment. |
| 14 | Mermaid support | https://docs.staruml.io/user-guide/mermaid-support | Text-to-diagram generation and supported Mermaid diagram types. |
| 15 | extensions | https://docs.staruml.io/v3/user-guide/managing-extensions | Registry, GitHub URL and manual extension installation. |
| 16 | CLI | https://docs.staruml.io/user-guide/cli-command-line-interface | Image, HTML, PDF and EJS generation from `.mdj` model files. |
| 17 | changelog | https://staruml.io/changelog/ | V7 device licensing, Mermaid, Azure architecture, MCP and recent fixes. |

## Core loop

Create or open a model project, choose a diagram type, place and connect
typed elements on a canvas, edit the shared model through the explorer and
property editors, then validate, document, export or share the result.

## Alternative opportunity

Crack UML should preserve StarUML's model-first integrity but change the
learning and collaboration experience:

- Start every project with a guided scenario such as “design a library app”
  instead of a blank enterprise-style workspace.
- Explain UML elements in plain language and show examples beside the toolbox.
- Make a student/classroom workspace, shareable links, comments and version
  history first-class features rather than extension or file-based workflows.
- Provide a browser-friendly viewer and lightweight editor for reviewers who
  do not install a desktop application.
- Keep exports interoperable and transparent: SVG/PNG/PDF, Markdown/Mermaid,
  and a documented project format.
- Use a free education tier and transparent low-cost team pricing as a
  product hypothesis; this must be validated with users before launch.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Welcome / project launcher | App start; File > New, Open, New From Template | Start a blank project, open an existing `.mdj`, or choose a template. | Recent projects, new/open buttons, template cards, license/trial status | empty recent list, recent projects, missing/invalid file, evaluation mode |
| S02 | Main modeling window | Open or create a project | Hosts the model explorer, diagram editor, toolbox, inspectors and status bar. | menu bar, toolbar, sidebar, navigator, bottom panel, status bar | project loaded, no active diagram, active diagram, panels hidden |
| S03 | Model Explorer | Navigator > Model Explorer | Browse the hierarchical project/model/package/element tree and search it. | tree, search, sort menu, expand/collapse controls | empty model, expanded tree, filtered results, selected element |
| S04 | Diagram Editor | Double-click a diagram in Model Explorer | Create and arrange visual views of shared model elements. | canvas, selection, connectors, grid, minimap, zoom/status controls | blank, populated, multi-select, off-canvas, large diagram |
| S05 | Toolbox and context actions | Select a diagram; sidebar/toolbox or context menu | Choose typed elements and relationships, then place or connect them. | element groups, relationship tools, select mode, quick-create actions | diagram-specific tools, invalid connection, drag placement, cancel |
| S06 | Working Diagrams panel | Sidebar > Working Diagrams | Switch among open diagrams and close one or all. | open-diagram list, active tab/item, close controls | one diagram, multiple diagrams, unsaved close warning |
| S07 | Property / Style / Documentation editors | Select a model or view element | Edit semantics, appearance and documentation without relying only on canvas text. | property grid, style controls, documentation editor, tag editor | no selection, model selected, view selected, invalid value |
| S08 | Quick Find and Command Palette | View > Quick Find / View > Command Palette | Locate elements/diagrams or execute commands by keyboard. | search field, result list, command list, shortcuts | no results, matching results, command unavailable, keyboard navigation |
| S09 | Diagram-type creation flow | Model > Add Diagram or context menu | Create a class, use case, sequence, activity, state, ERD, flowchart or other diagram under a model element. | diagram type menu, target selection, new diagram | supported type list, wrong target, duplicate name, empty diagram |
| S10 | Formatting and layout tools | Format menu or context menu | Make a diagram readable through styles, alignment, visibility and automatic layout. | font/color dialogs, line style, alignment, layout, auto-resize | one selected view, multi-selection, inherited style, layout result |
| S11 | Validation results | Validation command or bottom panel extension | Surface model consistency problems and guide corrections. | results list, severity, element links, bottom panel | no findings, warnings/errors, selected offending element |
| S12 | Documentation / Markdown workspace | Documentation editor or bottom-panel Markdown editor | Add explanatory text and generate readable project documentation. | markdown editor, preview, model links, generated docs entry point | empty docs, formatted docs, invalid markdown, long content |
| S13 | Mermaid generation dialog | Tools > Generate Diagram by Mermaid | Convert text definitions into a diagram and place it in a package. | code editor, generate button, package picker, result diagram | empty input, syntax error, supported diagram, unsupported syntax |
| S14 | Export / print dialogs | File > Export, File > Print, or CLI | Produce HTML, PDF, SVG/PNG/JPEG, fragments or printed diagrams. | destination picker, format/options, diagram selector, page layout | current/all diagrams, invalid destination, watermark/trial output |
| S15 | Extension Manager | Tools > Extension Manager | Find, install, update and remove extensions from a registry or GitHub URL. | Registry tab, Installed tab, search, install/update/remove controls | no extensions, available update, install failure, restart required |
| S16 | Preferences and customization | Edit/StarUML > Preferences | Configure editor behavior, keymaps, fonts, theme and other preferences. | preference categories, values, restore defaults | default settings, changed settings, invalid keymap, restart needed |
| S17 | License and device activation | Help > License Activation; License Manager | Start evaluation, activate/deactivate a device and handle offline activation. | license key field, device list, activation status, help links | trial, activated, expired, wrong version, offline mode |
| S18 | CLI / automation surface | `staruml` command outside the GUI | Generate images, HTML, PDF or EJS artifacts from `.mdj` files. | command arguments, selectors, output path, logs | missing file, selected diagrams, output exists, command error |

## Flows

```
F01 Student starts a guided UML project
    S01 -> S09 -> S04 -> S03
    happy path clicks: 5-8
    edge: no recent project, template not available, learner does not know which diagram to choose

F02 Model a class-based feature
    S01 -> S02 -> S09 (Class Diagram) -> S05 -> S04 -> S07 -> S03
    happy path clicks: 10-15
    edge: duplicate class, invalid relationship, long class name, shared element appears in another diagram

F03 Describe a user goal with a use-case diagram
    S09 -> S05 -> S04 -> S07
    happy path clicks: 8-12
    edge: actor/use-case connection rejected, missing system boundary, empty diagram

F04 Explain a request as a sequence
    S09 -> S05 -> S04 -> S07 -> S06
    happy path clicks: 8-12
    edge: lifeline from an existing classifier, message ordering, crowded diagram, missing sequence number

F05 Build behavior with an activity or state diagram
    S09 -> S05 -> S04 -> S10
    happy path clicks: 8-15
    edge: invalid flow, missing initial/final node, fork/join ambiguity, layout makes the diagram unreadable

F06 Reuse one model across multiple views
    S03 -> S09 -> S04 -> S03 -> S06
    happy path clicks: 8-12
    edge: element moved to wrong package, stale view, duplicate representation, broken reference

F07 Document and validate a model
    S03 -> S07 -> S11 -> S12
    happy path clicks: 6-10
    edge: no findings, warning without a clear explanation, documentation formatting error, unresolved model reference

F08 Generate a first diagram from text
    S02 -> S13 -> S03 -> S04 -> S07
    happy path clicks: 5-8
    edge: Mermaid syntax error, unsupported syntax, target package missing, generated layout needs manual cleanup

F09 Export a deliverable for a class or stakeholder
    S04 -> S10 -> S14
    happy path clicks: 4-8
    edge: clipped labels, missing fonts, unsupported characters, trial watermark, output folder not writable

F10 Extend the tool for a team workflow
    S02 -> S15 -> S16 -> S04
    happy path clicks: 6-10
    edge: extension version mismatch, restart required, extension crashes, keymap conflict

F11 Automate documentation or image generation
    S01 -> S18
    happy path clicks: 3-6
    edge: missing `.mdj`, query selects nothing, output already exists, headless render differs from GUI
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| App shell | desktop, compact panels, light/dark | loading, ready, no project, error | S01-S18 |
| Project launcher | blank, template, recent, open | empty, loading, invalid file, trial | S01 |
| Model tree | project, model, package, element, diagram | collapsed, expanded, filtered, selected, rename | S02-S03, S08 |
| Diagram canvas | UML, ERD, flowchart, Mermaid-generated | empty, populated, zoomed, panned, multi-select | S04, S09, S13 |
| Toolbox | element palette, relationship palette, annotation palette | active tool, select mode, disabled, invalid target | S04-S05 |
| Model element node | class, actor, use case, action, state, entity | selected, edited, invalid, linked, referenced | S04-S07 |
| Relationship connector | association, dependency, generalization, flow, message | valid, invalid, selected, routed, labeled | S04-S05, S10 |
| Quick editor | name, attribute, operation, message text | open, saved, cancelled, validation error | S04, S07 |
| Property editor | model properties, view properties, tags | no selection, editable, read-only, invalid | S07 |
| Documentation editor | plain text, Markdown | empty, editing, preview, long content | S07, S12 |
| Style editor | typography, color, line, visibility | inherited, overridden, reset, multi-select | S04, S07, S10 |
| Navigation/search | working diagrams, quick find, command palette | no results, results, keyboard focus, unavailable command | S06, S08 |
| Dialog | picker, list editor, font, color, print, preferences | open, cancel, confirm, validation error | S07, S10, S14, S16 |
| Bottom panel | find results, validation, thumbnails, Markdown | hidden, expanded, empty, populated | S02, S11, S12 |
| Export job | HTML, PDF, SVG/PNG/JPEG, fragment, EJS | queued, complete, failed, partial output | S14, S18 |
| Extension manager | registry, installed, GitHub URL | searching, installable, installed, update, failed | S15 |
| License status | evaluation, activated, expired, offline | pending, success, failure, device conflict | S01, S17 |

## Inferred data model

```
Project  id, name, file_path, version, root_elements, applied_profiles,
         diagrams, metadata, created_at, updated_at
         evidence: S01-S03; .mdj project behavior in sources 6 and 7
         confidence: high

ModelPackage  id, name, parent_id, owned_elements, owned_diagrams,
              documentation, stereotypes
              evidence: S03, S09, source 6's project/model/package hierarchy
              confidence: high

ModelElement  id, type, name, visibility, stereotype, properties, tags,
              documentation, owner_id
              evidence: S03, S07, S10, source 10's classifier and QuickEdit fields
              confidence: high

Diagram  id, name, type, owner_id, view_elements, settings, documentation
         evidence: S04, S06, S09, sources 7-9
         confidence: high

ViewElement  id, diagram_id, model_element_id, x, y, width, height,
             style, visibility_options, labels
             evidence: source 6's model-versus-view distinction and S04/S10
             confidence: high

Relationship  id, type, source_element_id, target_element_id, labels,
              multiplicities, direction, style
              evidence: S04-S05, source 10's relationship list
              confidence: high

Profile  id, name, version, stereotype_definitions, tag_definitions
         evidence: S01/S09 and source 7's UML Standard Profile behavior
         confidence: medium

Fragment  id, file_path, root_element_ids, imported_from, version
          evidence: source 6 and source 7's fragment import/export behavior
          confidence: high

ExportJob  id, project_id, format, selection_query, destination, status,
           options, error_message
           evidence: S14/S18 and source 16's image/html/pdf/ejs commands
           confidence: medium

Extension  id, name, version, source_url, package_metadata, enabled,
           installed_at
           evidence: S15 and source 15's registry/GitHub installation flow
           confidence: high

LicenseDevice  id, license_version, device_id, status, activated_at,
               deactivated_at, offline_activation
               evidence: S17 and sources 2, 4 and 17
               confidence: medium

CrackUMLWorkspace  id, owner_id, members, invite_links, comments,
                   revision_history, lesson_templates
                   evidence: proposed alternative capability, not observed in StarUML
                   confidence: guess
```

Relationships: Project 1-n ModelPackage; ModelPackage 1-n ModelElement;
ModelPackage 1-n Diagram; Diagram 1-n ViewElement; ViewElement n-1
ModelElement; ModelElement n-n ModelElement through Relationship; Project 1-n
Fragment; Project 1-n ExportJob; Workspace 1-n Project; Workspace 1-n
Comment and Revision.

## Feature matrix

See `features.csv`. Must: 20, should: 16, could: 8, skip: 4.

The `clone` column is intentionally `no` for all implementable features: the
alternative has not been built yet. Rows marked `skip` are not appropriate to
copy, such as StarUML's license backend or its private extension ecosystem.

## Out of scope (cannot or should not be cloned)

- StarUML's source code, proprietary UI assets, logo, copy, and trademark.
- StarUML's license manager, payment processing, device records, and private
  account data.
- StarUML's extension registry, third-party network, and publisher-owned
  content. Crack UML can provide its own extension API and curated examples.
- Any private API, network endpoint, bundled JavaScript, or decompiled binary.
- A full enterprise replacement in the first release: advanced SysML/BPMN,
  every architecture notation, and every code-engineering extension.

## Size

Screens 18, flows 11, entities 11. Hard parts: shared model/view semantics,
diagram rendering and connectors, undo/redo and persistence, export fidelity,
accessible onboarding, cross-platform packaging, and optional collaborative
editing/version history. Size: **L** for a credible desktop-first MVP;
**XL** if web collaboration, classroom management, real-time editing and
code engineering are included in v1.

Recommended first vertical slice: create a guided project, add a class
diagram, add two classes and a relationship, explain the model in a side
panel, save a portable project, and export a clean SVG/PDF. Next skill:
`$replica-architect`.

