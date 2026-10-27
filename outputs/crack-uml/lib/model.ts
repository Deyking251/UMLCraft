export type DiagramType =
  | "class"
  | "activity"
  | "sequence"
  | "usecase"
  | "statechart"
  | "dfd"
  | "erd"
  | "flowchart"
  | "component"
  | "deployment"
  | "package"
  | "object"
  | "communication"
  | "timing"
  | "interaction"
  | "informationflow"
  | "profile"
  | "composite"
  | "bpmn"
  | "c4"
  | "wireframe"
  | "mindmap"
  | "cloud";

export type ElementKind =
  | "class"
  | "interface"
  | "actor"
  | "usecase"
  | "action"
  | "initial"
  | "final"
  | "decision"
  | "lifeline"
  | "state"
  | "entity"
  | "process"
  | "datastore"
  | "component"
  | "deployment"
  | "package"
  | "object"
  | "note"
  | "service"
  | "cloud";

export type ModelElement = {
  id: string;
  kind: ElementKind;
  name: string;
  attributes: string[];
  operations: string[];
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Relationship = {
  id: string;
  kind: "association" | "generalization" | "flow" | "message" | "include";
  sourceId: string;
  targetId: string;
  label: string;
};

export type Project = {
  name: string;
  lesson: string | null;
  diagramType: DiagramType;
  elements: ModelElement[];
  relationships: Relationship[];
};

export const createSeedProject = (): Project => ({
  name: "Library Planner",
  lesson: "Map a small library system",
  diagramType: "class",
  elements: [
    {
      id: "library",
      kind: "class",
      name: "Library",
      attributes: ["name: string", "address: string"],
      operations: ["addBook(book: Book)", "findBook(title: string)"],
      description: "The place that keeps the catalogue and lends books.",
      x: 160,
      y: 190,
      width: 260,
      height: 220
    },
    {
      id: "book",
      kind: "class",
      name: "Book",
      attributes: ["title: string", "isbn: string"],
      operations: ["checkout()", "returnBook()"],
      description: "A title that can be found, borrowed, and returned.",
      x: 700,
      y: 320,
      width: 260,
      height: 190
    }
  ],
  relationships: [
    {
      id: "library-books",
      kind: "association",
      sourceId: "library",
      targetId: "book",
      label: "catalogues"
    }
  ]
});

export const createEmptyProject = (): Project => ({
  name: "Untitled model",
  lesson: null,
  diagramType: "class",
  elements: [],
  relationships: []
});

export const cloneProject = (project: Project): Project =>
  JSON.parse(JSON.stringify(project)) as Project;
