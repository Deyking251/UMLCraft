# UMLCraft

UMLCraft is a learner-oriented UML modeling studio built as an independent,
clean-room alternative for students, teachers, and small teams.

## Run locally

```bash
cd outputs/crack-uml
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

The studio includes class, use-case, activity, sequence, statechart, DFD,
ERD, flowchart, and additional starter diagram views. Model elements can be
selected, moved, connected, edited, deleted, and saved through the local API.

## Project layout

- `outputs/crack-uml/` — Next.js application and local backend adapter
- `replica/` — recon, architecture, design tokens, feature matrix, and QA notes

Runtime data, environment files, dependencies, and build output are excluded
from source control. See the application README for backend and deployment
notes.
