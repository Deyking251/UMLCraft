"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import {
  cloneProject,
  createEmptyProject,
  createSeedProject,
  type DiagramType,
  type ElementKind,
  type ModelElement,
  type Project,
  type Relationship
} from "@/lib/model";

type Snapshot = {
  diagramType: DiagramType;
  elements: ModelElement[];
  relationships: Relationship[];
};

type DragState = {
  id: string;
  pointerId: number;
  offsetX: number;
  offsetY: number;
  origin: Snapshot;
};

const kindLabel: Record<ElementKind, string> = {
  class: "Class",
  interface: "Interface",
  actor: "Actor",
  usecase: "Use case",
  action: "Action",
  initial: "Start node",
  final: "End node",
  decision: "Decision",
  lifeline: "Lifeline",
  state: "State",
  entity: "Entity",
  process: "Process",
  datastore: "Data store",
  component: "Component",
  deployment: "Deployment node",
  package: "Package",
  object: "Object",
  note: "Note",
  service: "Service",
  cloud: "Cloud"
};

const kindGlyph: Record<ElementKind, string> = {
  class: "C",
  interface: "I",
  actor: "A",
  usecase: "U",
  action: "→",
  initial: "●",
  final: "■",
  decision: "◇",
  lifeline: "L",
  state: "S",
  entity: "E",
  process: "P",
  datastore: "D",
  component: "C",
  deployment: "N",
  package: "P",
  object: "O",
  note: "N",
  service: "S",
  cloud: "☁"
};

const emptySnapshot = (project: Project): Snapshot => ({
  diagramType: project.diagramType,
  elements: project.elements,
  relationships: project.relationships
});

const diagramLabels: Record<DiagramType, string> = {
  class: "Class",
  activity: "Activity",
  sequence: "Sequence",
  usecase: "Use-case",
  statechart: "Statechart",
  dfd: "Data-flow",
  erd: "ERD",
  flowchart: "Flowchart",
  component: "Component",
  deployment: "Deployment",
  package: "Package",
  object: "Object",
  communication: "Communication",
  timing: "Timing",
  interaction: "Interaction overview",
  informationflow: "Information flow",
  profile: "Profile",
  composite: "Composite structure",
  bpmn: "BPMN",
  c4: "C4",
  wireframe: "Wireframe",
  mindmap: "Mindmap",
  cloud: "Cloud architecture"
};

const diagramDescriptions: Record<DiagramType, string> = {
  class: "Concepts, properties, operations, and associations.",
  activity: "Actions and decisions that describe a behavior.",
  sequence: "Participants and messages in time order.",
  usecase: "People and goals around a system boundary.",
  statechart: "States and transitions for one concept.",
  dfd: "Processes, data stores, and data movement.",
  erd: "Entities, fields, and data relationships.",
  flowchart: "Steps and decisions in a readable process.",
  component: "Software parts and their contracts.",
  deployment: "Runtime nodes and deployed artifacts.",
  package: "Organize related model elements.",
  object: "Example instances at one moment.",
  communication: "Objects collaborating through messages.",
  timing: "State changes across a time axis.",
  interaction: "A high-level map of interactions.",
  informationflow: "Information moving between system areas.",
  profile: "Stereotypes and modeling vocabulary.",
  composite: "Parts inside a structured classifier.",
  bpmn: "Business activities, events, and gateways.",
  c4: "Context, containers, components, and code.",
  wireframe: "A simple product-screen structure.",
  mindmap: "Ideas branching from a central topic.",
  cloud: "Services and boundaries in a cloud system."
};

const diagramDefaultKinds: Record<DiagramType, ElementKind> = {
  class: "class",
  activity: "action",
  sequence: "lifeline",
  usecase: "actor",
  statechart: "state",
  dfd: "process",
  erd: "entity",
  flowchart: "action",
  component: "component",
  deployment: "deployment",
  package: "package",
  object: "object",
  communication: "object",
  timing: "state",
  interaction: "process",
  informationflow: "process",
  profile: "package",
  composite: "component",
  bpmn: "process",
  c4: "component",
  wireframe: "note",
  mindmap: "note",
  cloud: "cloud"
};

const diagramLinkKinds: Record<DiagramType, Relationship["kind"]> = {
  class: "association",
  activity: "flow",
  sequence: "message",
  usecase: "association",
  statechart: "flow",
  dfd: "flow",
  erd: "association",
  flowchart: "flow",
  component: "association",
  deployment: "association",
  package: "association",
  object: "association",
  communication: "message",
  timing: "flow",
  interaction: "flow",
  informationflow: "flow",
  profile: "association",
  composite: "association",
  bpmn: "flow",
  c4: "association",
  wireframe: "association",
  mindmap: "association",
  cloud: "association"
};

const createStarterSnapshot = (diagramType: DiagramType): Snapshot => {
  if (diagramType === "activity") {
    return {
      diagramType,
      elements: [
        { id: "activity-start", kind: "initial", name: "Start", attributes: [], operations: [], description: "The behavior begins here.", x: 150, y: 130, width: 84, height: 52 },
        { id: "activity-check", kind: "action", name: "Check request", attributes: [], operations: [], description: "Inspect the learner's request before changing the model.", x: 330, y: 110, width: 230, height: 92 },
        { id: "activity-decision", kind: "decision", name: "Valid model?", attributes: [], operations: [], description: "Choose the next path based on validation findings.", x: 650, y: 110, width: 170, height: 110 },
        { id: "activity-save", kind: "action", name: "Save project", attributes: [], operations: [], description: "Persist the updated model for the learner.", x: 900, y: 90, width: 210, height: 92 },
        { id: "activity-review", kind: "action", name: "Review finding", attributes: [], operations: [], description: "Explain what needs attention in plain language.", x: 900, y: 270, width: 210, height: 92 },
        { id: "activity-end", kind: "final", name: "Done", attributes: [], operations: [], description: "The activity reaches a completed outcome.", x: 1150, y: 165, width: 84, height: 52 }
      ],
      relationships: [
        { id: "activity-flow-1", kind: "flow", sourceId: "activity-start", targetId: "activity-check", label: "begin" },
        { id: "activity-flow-2", kind: "flow", sourceId: "activity-check", targetId: "activity-decision", label: "inspect" },
        { id: "activity-flow-3", kind: "flow", sourceId: "activity-decision", targetId: "activity-save", label: "yes" },
        { id: "activity-flow-4", kind: "flow", sourceId: "activity-decision", targetId: "activity-review", label: "no" },
        { id: "activity-flow-5", kind: "flow", sourceId: "activity-save", targetId: "activity-end", label: "finish" },
        { id: "activity-flow-6", kind: "flow", sourceId: "activity-review", targetId: "activity-check", label: "try again" }
      ]
    };
  }

  if (diagramType === "sequence") {
    return {
      diagramType,
      elements: [
        { id: "sequence-learner", kind: "lifeline", name: "Learner", attributes: [], operations: [], description: "The person asking Crack UML to validate a model.", x: 180, y: 90, width: 180, height: 430 },
        { id: "sequence-studio", kind: "lifeline", name: "Crack UML", attributes: [], operations: [], description: "The modeling studio that receives commands and returns guidance.", x: 560, y: 90, width: 180, height: 430 },
        { id: "sequence-backend", kind: "lifeline", name: "Project store", attributes: [], operations: [], description: "The project service that saves the model revision.", x: 940, y: 90, width: 180, height: 430 }
      ],
      relationships: [
        { id: "sequence-message-1", kind: "message", sourceId: "sequence-learner", targetId: "sequence-studio", label: "open lesson" },
        { id: "sequence-message-2", kind: "message", sourceId: "sequence-studio", targetId: "sequence-backend", label: "load project" },
        { id: "sequence-message-3", kind: "message", sourceId: "sequence-backend", targetId: "sequence-studio", label: "return model" },
        { id: "sequence-message-4", kind: "message", sourceId: "sequence-studio", targetId: "sequence-learner", label: "show canvas" }
      ]
    };
  }

  if (diagramType === "usecase") {
    return {
      diagramType,
      elements: [
        { id: "usecase-student", kind: "actor", name: "Student", attributes: [], operations: [], description: "A learner who wants a clear first diagram.", x: 140, y: 220, width: 170, height: 150 },
        { id: "usecase-model", kind: "usecase", name: "Model a feature", attributes: [], operations: [], description: "Create concepts and relationships for a product idea.", x: 520, y: 160, width: 260, height: 110 },
        { id: "usecase-review", kind: "usecase", name: "Review guidance", attributes: [], operations: [], description: "Read explanations and validation findings.", x: 520, y: 330, width: 260, height: 110 }
      ],
      relationships: [
        { id: "usecase-association-1", kind: "association", sourceId: "usecase-student", targetId: "usecase-model", label: "starts" },
        { id: "usecase-association-2", kind: "association", sourceId: "usecase-student", targetId: "usecase-review", label: "learns" }
      ]
    };
  }

  if (diagramType === "statechart") {
    return {
      diagramType,
      elements: [
        { id: "state-start", kind: "initial", name: "Start", attributes: [], operations: [], description: "The state machine begins here.", x: 150, y: 170, width: 84, height: 52 },
        { id: "state-draft", kind: "state", name: "Draft", attributes: [], operations: [], description: "The item can still be edited.", x: 340, y: 140, width: 220, height: 100 },
        { id: "state-review", kind: "state", name: "In review", attributes: [], operations: [], description: "Someone is checking the item.", x: 660, y: 140, width: 220, height: 100 },
        { id: "state-published", kind: "state", name: "Published", attributes: [], operations: [], description: "The item is visible to its audience.", x: 980, y: 140, width: 220, height: 100 },
        { id: "state-end", kind: "final", name: "End", attributes: [], operations: [], description: "The state machine reaches a terminal outcome.", x: 1130, y: 340, width: 84, height: 52 }
      ],
      relationships: [
        { id: "state-flow-1", kind: "flow", sourceId: "state-start", targetId: "state-draft", label: "create" },
        { id: "state-flow-2", kind: "flow", sourceId: "state-draft", targetId: "state-review", label: "submit" },
        { id: "state-flow-3", kind: "flow", sourceId: "state-review", targetId: "state-published", label: "approve" },
        { id: "state-flow-4", kind: "flow", sourceId: "state-review", targetId: "state-draft", label: "request changes" },
        { id: "state-flow-5", kind: "flow", sourceId: "state-published", targetId: "state-end", label: "archive" }
      ]
    };
  }

  if (diagramType === "dfd") {
    return {
      diagramType,
      elements: [
        { id: "dfd-student", kind: "actor", name: "Learner", attributes: [], operations: [], description: "The person who provides modeling input.", x: 110, y: 250, width: 170, height: 150 },
        { id: "dfd-studio", kind: "process", name: "Modeling studio", attributes: ["diagram", "findings"], operations: [], description: "Transforms input into a model and explanations.", x: 430, y: 230, width: 250, height: 130 },
        { id: "dfd-store", kind: "datastore", name: "Project store", attributes: ["revision", "project"], operations: [], description: "Keeps the current project snapshot.", x: 850, y: 230, width: 230, height: 130 },
        { id: "dfd-reviewer", kind: "actor", name: "Reviewer", attributes: [], operations: [], description: "A teacher or teammate who reads the result.", x: 1120, y: 460, width: 170, height: 150 }
      ],
      relationships: [
        { id: "dfd-flow-1", kind: "flow", sourceId: "dfd-student", targetId: "dfd-studio", label: "model input" },
        { id: "dfd-flow-2", kind: "flow", sourceId: "dfd-studio", targetId: "dfd-store", label: "save revision" },
        { id: "dfd-flow-3", kind: "flow", sourceId: "dfd-store", targetId: "dfd-studio", label: "load model" },
        { id: "dfd-flow-4", kind: "flow", sourceId: "dfd-studio", targetId: "dfd-reviewer", label: "share result" }
      ]
    };
  }

  if (diagramType === "erd") {
    return {
      diagramType,
      elements: [
        { id: "erd-student", kind: "entity", name: "Student", attributes: ["student_id", "name", "email"], operations: [], description: "A learner who owns practice work.", x: 150, y: 150, width: 260, height: 170 },
        { id: "erd-project", kind: "entity", name: "Project", attributes: ["project_id", "title", "updated_at"], operations: [], description: "A saved modeling workspace.", x: 520, y: 330, width: 260, height: 170 },
        { id: "erd-diagram", kind: "entity", name: "Diagram", attributes: ["diagram_id", "type", "revision"], operations: [], description: "One view inside a project.", x: 900, y: 150, width: 260, height: 170 }
      ],
      relationships: [
        { id: "erd-link-1", kind: "association", sourceId: "erd-student", targetId: "erd-project", label: "owns" },
        { id: "erd-link-2", kind: "association", sourceId: "erd-project", targetId: "erd-diagram", label: "contains" }
      ]
    };
  }

  if (diagramType === "flowchart") {
    return {
      diagramType,
      elements: [
        { id: "flow-start", kind: "initial", name: "Begin", attributes: [], operations: [], description: "The process begins.", x: 160, y: 150, width: 84, height: 52 },
        { id: "flow-input", kind: "action", name: "Collect input", attributes: [], operations: [], description: "Gather the information needed for the next step.", x: 330, y: 130, width: 230, height: 92 },
        { id: "flow-valid", kind: "decision", name: "Ready?", attributes: [], operations: [], description: "Choose whether the process can continue.", x: 660, y: 120, width: 170, height: 110 },
        { id: "flow-finish", kind: "action", name: "Publish result", attributes: [], operations: [], description: "Make the finished result available.", x: 930, y: 100, width: 220, height: 92 },
        { id: "flow-fix", kind: "action", name: "Improve input", attributes: [], operations: [], description: "Fix the missing information and try again.", x: 930, y: 300, width: 220, height: 92 },
        { id: "flow-end", kind: "final", name: "Finish", attributes: [], operations: [], description: "The process is complete.", x: 1160, y: 160, width: 84, height: 52 }
      ],
      relationships: [
        { id: "flow-link-1", kind: "flow", sourceId: "flow-start", targetId: "flow-input", label: "start" },
        { id: "flow-link-2", kind: "flow", sourceId: "flow-input", targetId: "flow-valid", label: "check" },
        { id: "flow-link-3", kind: "flow", sourceId: "flow-valid", targetId: "flow-finish", label: "yes" },
        { id: "flow-link-4", kind: "flow", sourceId: "flow-valid", targetId: "flow-fix", label: "no" },
        { id: "flow-link-5", kind: "flow", sourceId: "flow-finish", targetId: "flow-end", label: "done" },
        { id: "flow-link-6", kind: "flow", sourceId: "flow-fix", targetId: "flow-input", label: "retry" }
      ]
    };
  }

  const genericKinds: Partial<Record<DiagramType, ElementKind>> = {
    component: "component",
    deployment: "deployment",
    package: "package",
    object: "object",
    communication: "object",
    timing: "state",
    interaction: "process",
    informationflow: "process",
    profile: "package",
    composite: "component",
    bpmn: "process",
    c4: "component",
    wireframe: "note",
    mindmap: "note",
    cloud: "cloud"
  };
  const kind = genericKinds[diagramType] ?? "note";
  const label = diagramLabels[diagramType];
  return {
    diagramType,
    elements: [
      { id: `${diagramType}-one`, kind, name: `${label} idea`, attributes: ["purpose"], operations: [], description: `A first ${label.toLowerCase()} concept for the learner to expand.`, x: 260, y: 190, width: 260, height: 140 },
      { id: `${diagramType}-two`, kind, name: `${label} detail`, attributes: ["owner"], operations: [], description: `A related ${label.toLowerCase()} concept connected to the first one.`, x: 760, y: 360, width: 260, height: 140 }
    ],
    relationships: [{ id: `${diagramType}-link`, kind: "association", sourceId: `${diagramType}-one`, targetId: `${diagramType}-two`, label: "relates to" }]
  };

  return { diagramType: "class", elements: [], relationships: [] };
};

export default function CrackUmlApp() {
  const [project, setProject] = useState<Project>(() => createSeedProject());
  const [selectedId, setSelectedId] = useState<string | null>("library");
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const [saveState, setSaveState] = useState<"saved" | "unsaved" | "saving">("saved");
  const [backendReady, setBackendReady] = useState(true);
  const [backendRevision, setBackendRevision] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const [announce, setAnnounce] = useState("Library Planner loaded.");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [connectKind, setConnectKind] = useState<Relationship["kind"]>("association");
  const dragMoved = useRef(false);

  useEffect(() => {
    let active = true;
    fetch("/api/projects/demo")
      .then(async (response) => {
        if (!response.ok) throw new Error("Backend unavailable");
        return response.json() as Promise<{ project: { project: Project; revision: number } }>;
      })
      .then((payload) => {
        if (!active) return;
        setProject(payload.project.project);
        setBackendRevision(payload.project.revision);
        setBackendReady(true);
        setSaveState("saved");
        setSelectedId(payload.project.project.elements[0]?.id ?? null);
        setAnnounce("Project loaded from the Crack UML backend.");
        setHydrated(true);
      })
      .catch(() => {
        if (active) {
          setBackendReady(false);
          setHydrated(true);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const selected = project.elements.find((element) => element.id === selectedId) ?? null;
  const selectedRelationships = useMemo(
    () => project.relationships.filter((relationship) => relationship.sourceId === selectedId || relationship.targetId === selectedId),
    [project.relationships, selectedId]
  );

  const commit = (next: Snapshot, message: string) => {
    setHistory((current) => [...current.slice(-19), emptySnapshot(project)]);
    setFuture([]);
    setProject((current) => ({ ...current, diagramType: next.diagramType, elements: next.elements, relationships: next.relationships }));
    setSaveState("unsaved");
    setAnnounce(message);
  };

  const restore = (snapshot: Snapshot, message: string) => {
    setProject((current) => ({ ...current, diagramType: snapshot.diagramType, elements: snapshot.elements, relationships: snapshot.relationships }));
    setSaveState("unsaved");
    setAnnounce(message);
  };

  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((current) => current.slice(0, -1));
    setFuture((current) => [...current, emptySnapshot(project)]);
    restore(previous, "Last change undone.");
  };

  const redo = () => {
    const next = future.at(-1);
    if (!next) return;
    setFuture((current) => current.slice(0, -1));
    setHistory((current) => [...current, emptySnapshot(project)]);
    restore(next, "Change restored.");
  };

  const startLesson = () => {
    const next = createSeedProject();
    setProject(next);
    setSelectedId("library");
    setConnectSourceId(null);
    setConnectKind("association");
    setHistory([]);
    setFuture([]);
    setSaveState("saved");
    setAnnounce("Guided library lesson ready.");
  };

  const newProject = () => {
    const next = createEmptyProject();
    setProject(next);
    setSelectedId(null);
    setConnectSourceId(null);
    setConnectKind("association");
    setHistory([]);
    setFuture([]);
    setSaveState("unsaved");
    setAnnounce("New empty project created.");
  };

  const changeDiagramType = (diagramType: DiagramType) => {
    if (diagramType === project.diagramType) return;
    const next = createStarterSnapshot(diagramType);
    commit(next, `${diagramLabels[diagramType]} diagram starter loaded. Use Undo to return to the previous view.`);
    setSelectedId(next.elements[0]?.id ?? null);
    setConnectSourceId(null);
    setConnectKind("association");
  };

  const saveProject = async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/projects/demo", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project, baseRevision: backendRevision })
      });
      if (!response.ok) throw new Error("Backend save failed");
      const payload = await response.json() as { project: { revision: number } };
      setBackendRevision(payload.project.revision);
      setBackendReady(true);
      setSaveState("saved");
      setAnnounce("Project saved to the Crack UML backend.");
    } catch {
      window.localStorage.setItem("crack-uml-project", JSON.stringify(project));
      setBackendReady(false);
      setSaveState("saved");
      setAnnounce("Backend unavailable; project saved to this browser instead.");
    }
  };

  const updateSelected = (changes: Partial<ModelElement>) => {
    if (!selected) return;
    const nextElements = project.elements.map((element) => (element.id === selected.id ? { ...element, ...changes } : element));
    commit({ diagramType: project.diagramType, elements: nextElements, relationships: project.relationships }, "Model element updated.");
  };

  const addElement = (kind: ElementKind) => {
    const index = project.elements.length + 1;
    const id = `${kind}-${Date.now()}`;
    const defaults: Record<ElementKind, { name: string; description: string; attributes: string[]; operations: string[]; width: number; height: number }> = {
      class: { name: `NewClass${index}`, description: "Describe what this concept is responsible for.", attributes: ["id: string"], operations: ["describe()"], width: 240, height: 170 },
      interface: { name: `NewInterface${index}`, description: "Describe the behavior this contract promises.", attributes: [], operations: ["execute()"], width: 240, height: 150 },
      actor: { name: `Actor${index}`, description: "A person or role that interacts with the system.", attributes: [], operations: [], width: 170, height: 150 },
      usecase: { name: `Goal${index}`, description: "A useful outcome the system helps someone achieve.", attributes: [], operations: [], width: 240, height: 110 },
      action: { name: `Action${index}`, description: "A step that changes or checks something in the workflow.", attributes: [], operations: [], width: 230, height: 92 },
      initial: { name: "Start", description: "The behavior begins here.", attributes: [], operations: [], width: 84, height: 52 },
      final: { name: "Done", description: "The behavior reaches a completed outcome.", attributes: [], operations: [], width: 84, height: 52 },
      decision: { name: `Decision${index}`, description: "A point where the flow chooses between paths.", attributes: [], operations: [], width: 170, height: 110 },
      lifeline: { name: `Participant${index}`, description: "A participant that sends or receives messages over time.", attributes: [], operations: [], width: 180, height: 430 },
      state: { name: `State${index}`, description: "A condition that the subject can be in.", attributes: [], operations: [], width: 220, height: 100 },
      entity: { name: `Entity${index}`, description: "A record type with fields and relationships.", attributes: ["id"], operations: [], width: 260, height: 150 },
      process: { name: `Process${index}`, description: "A transformation that receives and produces information.", attributes: [], operations: [], width: 230, height: 120 },
      datastore: { name: `DataStore${index}`, description: "A place where information is retained.", attributes: [], operations: [], width: 230, height: 120 },
      component: { name: `Component${index}`, description: "A replaceable software part with a clear responsibility.", attributes: [], operations: [], width: 240, height: 130 },
      deployment: { name: `Node${index}`, description: "A runtime location for a deployed artifact.", attributes: [], operations: [], width: 240, height: 130 },
      package: { name: `Package${index}`, description: "A boundary that groups related model concepts.", attributes: [], operations: [], width: 240, height: 130 },
      object: { name: `Object${index}`, description: "An example instance at a specific moment.", attributes: [], operations: [], width: 240, height: 130 },
      note: { name: `Note${index}`, description: "A short explanation attached to the diagram.", attributes: [], operations: [], width: 240, height: 110 },
      service: { name: `Service${index}`, description: "A service boundary that exposes a useful capability.", attributes: [], operations: [], width: 240, height: 130 },
      cloud: { name: `Cloud${index}`, description: "A cloud service or infrastructure boundary.", attributes: [], operations: [], width: 240, height: 130 }
    };
    const preset = defaults[kind];
    const newElement: ModelElement = {
      id,
      kind,
      name: preset.name,
      attributes: preset.attributes,
      operations: preset.operations,
      description: preset.description,
      x: 120 + (index % 4) * 250,
      y: 110 + (index % 3) * 170,
      width: preset.width,
      height: preset.height
    };
    commit({ diagramType: project.diagramType, elements: [...project.elements, newElement], relationships: project.relationships }, `${kindLabel[kind]} ${newElement.name} added.`);
    setSelectedId(id);
  };

  const addClass = () => addElement("class");

  const addRelationshipBetween = (source: ModelElement, target: ModelElement, kind: Relationship["kind"]) => {
    if (source.id === target.id) {
      setConnectSourceId(null);
      setAnnounce("Choose a different target element.");
      return;
    }
    const duplicate = project.relationships.some((relationship) => {
      const sameDirection = relationship.kind === kind && relationship.sourceId === source.id && relationship.targetId === target.id;
      const reverseAssociation = kind === "association" && relationship.kind === kind && relationship.sourceId === target.id && relationship.targetId === source.id;
      return sameDirection || reverseAssociation;
    });
    if (duplicate) {
      setConnectSourceId(null);
      setAnnounce(`${source.name} and ${target.name} are already connected.`);
      return;
    }
    const labels: Record<Relationship["kind"], string> = {
      association: project.diagramType === "usecase" ? "supports" : "relates to",
      generalization: "is a",
      flow: "next",
      message: "request()",
      include: "includes"
    };
    const relationship: Relationship = {
      id: `relationship-${Date.now()}`,
      kind,
      sourceId: source.id,
      targetId: target.id,
      label: labels[kind]
    };
    commit({ diagramType: project.diagramType, elements: project.elements, relationships: [...project.relationships, relationship] }, `${kindLabel[source.kind]} ${labels[kind]} ${kindLabel[target.kind]}.`);
    setSelectedId(target.id);
    setConnectSourceId(null);
  };

  const beginConnect = (kind: Relationship["kind"] = "association") => {
    const eligible = project.diagramType === "sequence"
      ? project.elements.filter((element) => element.kind === "lifeline")
      : project.elements.filter((element) => element.kind !== "initial" && element.kind !== "final");
    if (eligible.length < 2) {
      setAnnounce(`Add one more ${project.diagramType === "sequence" ? "lifeline" : "typed element"} before creating a relationship.`);
      return;
    }
    const source = selected && eligible.some((element) => element.id === selected.id) ? selected : null;
    if (!source) {
      setAnnounce("Select a source element before connecting.");
      return;
    }
    setConnectKind(kind);
    setConnectSourceId(source.id);
    setAnnounce(`${source.name} is ready to connect. Choose a target element on the canvas or in the model explorer.`);
  };

  const chooseElement = (element: ModelElement) => {
    if (!connectSourceId) {
      setSelectedId(element.id);
      return;
    }
    const source = project.elements.find((candidate) => candidate.id === connectSourceId);
    if (!source) {
      setConnectSourceId(null);
      setSelectedId(element.id);
      return;
    }
    addRelationshipBetween(source, element, connectKind);
  };

  const addListItem = (field: "attributes" | "operations") => {
    if (!selected) return;
    const base = field === "attributes" ? "property" : "action";
    const nextValue = field === "attributes" ? `${base}${selected.attributes.length + 1}: string` : `${base}${selected.operations.length + 1}()`;
    updateSelected({ [field]: [...selected[field], nextValue] });
  };

  const deleteSelected = () => {
    if (!selected) return;
    const nextElements = project.elements.filter((element) => element.id !== selected.id);
    const nextRelationships = project.relationships.filter((relationship) => relationship.sourceId !== selected.id && relationship.targetId !== selected.id);
    const nextSelected = nextElements[0]?.id ?? null;
    commit({ diagramType: project.diagramType, elements: nextElements, relationships: nextRelationships }, `${kindLabel[selected.kind]} ${selected.name} deleted.`);
    setSelectedId(nextSelected);
    if (connectSourceId === selected.id) setConnectSourceId(null);
  };

  const exportSvg = () => {
    const root = document.documentElement;
    const css = getComputedStyle(root);
    const color = (name: string) => css.getPropertyValue(name).trim();
    const nodes = project.elements.map((element) => {
      const attributes = element.attributes.map((item, index) => `<text x="${element.x + 16}" y="${element.y + 72 + index * 18}" class="body">${escapeXml(item)}</text>`).join("");
      const operations = element.operations.map((item, index) => `<text x="${element.x + 16}" y="${element.y + 108 + index * 18}" class="body">${escapeXml(item)}</text>`).join("");
      return `<g><rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" rx="10" fill="${color("--color-node-fill")}" stroke="${color("--color-node-stroke")}"/><line x1="${element.x}" y1="${element.y + 48}" x2="${element.x + element.width}" y2="${element.y + 48}" stroke="${color("--color-border")}"/><line x1="${element.x}" y1="${element.y + 92}" x2="${element.x + element.width}" y2="${element.y + 92}" stroke="${color("--color-border")}"/><text x="${element.x + 16}" y="${element.y + 30}" class="title">${escapeXml(element.name)}</text>${attributes}${operations}</g>`;
    }).join("");
    const edges = project.relationships.map((relationship) => {
      const source = project.elements.find((element) => element.id === relationship.sourceId);
      const target = project.elements.find((element) => element.id === relationship.targetId);
      if (!source || !target) return "";
      const x1 = source.x + source.width;
      const y1 = source.y + source.height / 2;
      const x2 = target.x;
      const y2 = target.y + target.height / 2;
      return `<g><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color("--color-relationship")}" stroke-width="2"/><text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 8}" class="label">${escapeXml(relationship.label)}</text></g>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><style>.title{font:700 18px Inter,Arial,sans-serif;fill:${color("--color-text")}}.body{font:500 13px ui-monospace,monospace;fill:${color("--color-text-muted")}}.label{font:600 12px Inter,Arial,sans-serif;fill:${color("--color-text-muted")}}</style><rect width="1200" height="720" fill="${color("--color-canvas")}"/>${edges}${nodes}</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "crack-uml"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setAnnounce("SVG export downloaded.");
  };

  const renderRelationship = (relationship: Relationship, index: number) => {
    const source = project.elements.find((element) => element.id === relationship.sourceId);
    const target = project.elements.find((element) => element.id === relationship.targetId);
    if (!source || !target) return null;
    if (project.diagramType === "sequence") {
      const x1 = source.x + source.width / 2;
      const x2 = target.x + target.width / 2;
      const y = 170 + index * 72;
      return (
        <g key={relationship.id} aria-label={`${relationship.kind} ${relationship.label} from ${source.name} to ${target.name}`}>
          <line x1={x1} y1={y} x2={x2} y2={y} className="relationship-line" markerEnd="url(#arrow)" />
          <text x={(x1 + x2) / 2} y={y - 9} textAnchor="middle" className="relationship-label">{index + 1}. {relationship.label}</text>
        </g>
      );
    }
    const sourceCenterX = source.x + source.width / 2;
    const targetCenterX = target.x + target.width / 2;
    const targetIsToTheRight = targetCenterX >= sourceCenterX;
    const x1 = targetIsToTheRight ? source.x + source.width : source.x;
    const y1 = source.y + source.height / 2;
    const x2 = targetIsToTheRight ? target.x : target.x + target.width;
    const y2 = target.y + target.height / 2;
    return (
      <g key={relationship.id} aria-label={`${relationship.kind} from ${source.name} to ${target.name}`}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} className={`relationship-line relationship-${relationship.kind}`} markerEnd="url(#arrow)" />
        <rect x={(x1 + x2) / 2 - 48} y={(y1 + y2) / 2 - 25} width="96" height="22" rx="11" className="relationship-label-bg" />
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} textAnchor="middle" className="relationship-label">{relationship.label}</text>
      </g>
    );
  };

  const canvasPoint = (event: PointerEvent<SVGGElement>) => {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return null;
    const bounds = svg.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    return {
      x: Math.max(0, Math.min(1280, (event.clientX - bounds.left) * 1280 / bounds.width)),
      y: Math.max(0, Math.min(720, (event.clientY - bounds.top) * 720 / bounds.height))
    };
  };

  const beginDrag = (event: PointerEvent<SVGGElement>, element: ModelElement) => {
    if (event.button !== 0) return;
    const point = canvasPoint(event);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(element.id);
    dragMoved.current = false;
    setDragState({
      id: element.id,
      pointerId: event.pointerId,
      offsetX: point.x - element.x,
      offsetY: point.y - element.y,
      origin: emptySnapshot(project)
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDragged = (event: PointerEvent<SVGGElement>) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const point = canvasPoint(event);
    if (!point) return;
    dragMoved.current = true;
    setProject((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        if (element.id !== dragState.id) return element;
        return {
          ...element,
          x: Math.max(0, Math.min(1280 - element.width, point.x - dragState.offsetX)),
          y: Math.max(0, Math.min(720 - element.height, point.y - dragState.offsetY))
        };
      })
    }));
    setSaveState("unsaved");
  };

  const endDrag = (event: PointerEvent<SVGGElement>) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const movedElement = project.elements.find((element) => element.id === dragState.id);
    const moved = dragMoved.current;
    setDragState(null);
    dragMoved.current = false;
    if (moved) {
      setHistory((current) => [...current.slice(-19), dragState.origin]);
      setFuture([]);
      setAnnounce(`${movedElement?.name ?? "Element"} moved.`);
    }
  };

  const renderElement = (element: ModelElement) => {
    const selectElement = () => chooseElement(element);
    const flowLike = project.diagramType === "activity" || project.diagramType === "flowchart" || project.diagramType === "statechart";
    const keyboardSelect = (event: KeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectElement();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelected();
      }
    };
    const commonProps = {
      key: element.id,
      role: "button" as const,
      tabIndex: 0,
      "aria-label": `${kindLabel[element.kind]} ${element.name}`,
      "aria-pressed": selectedId === element.id,
      "aria-grabbed": dragState?.id === element.id,
      className: "draggable-node",
      onClick: selectElement,
      onKeyDown: keyboardSelect,
      onPointerDown: (event: PointerEvent<SVGGElement>) => beginDrag(event, element),
      onPointerMove: moveDragged,
      onPointerUp: endDrag,
      onPointerCancel: endDrag
    };

    if (project.diagramType === "sequence" && element.kind === "lifeline") {
      const center = element.x + element.width / 2;
      return (
        <g {...commonProps}>
          <rect x={element.x} y={element.y} width={element.width} height="54" rx="12" className={`model-node ${selectedId === element.id ? "selected" : ""}`} />
          <text x={center} y={element.y + 33} textAnchor="middle" className="node-title">{element.name}</text>
          <line x1={center} y1={element.y + 54} x2={center} y2={element.y + element.height} className="lifeline-line" />
          <rect x={center - 8} y={element.y + element.height - 8} width="16" height="16" className="lifeline-end" />
        </g>
      );
    }

    if ((project.diagramType === "usecase" || project.diagramType === "dfd") && element.kind === "actor") {
      const center = element.x + element.width / 2;
      return (
        <g {...commonProps}>
          <circle cx={center} cy={element.y + 30} r="18" className={`actor-head ${selectedId === element.id ? "selected" : ""}`} />
          <line x1={center} y1={element.y + 48} x2={center} y2={element.y + 94} className="actor-line" />
          <line x1={center - 30} y1={element.y + 66} x2={center + 30} y2={element.y + 66} className="actor-line" />
          <line x1={center} y1={element.y + 94} x2={center - 26} y2={element.y + 128} className="actor-line" />
          <line x1={center} y1={element.y + 94} x2={center + 26} y2={element.y + 128} className="actor-line" />
          <text x={center} y={element.y + 148} textAnchor="middle" className="node-title">{element.name}</text>
        </g>
      );
    }

    if (project.diagramType === "usecase" && element.kind === "usecase") {
      return (
        <g {...commonProps}>
          <ellipse cx={element.x + element.width / 2} cy={element.y + element.height / 2} rx={element.width / 2} ry={element.height / 2} className={`usecase-node ${selectedId === element.id ? "selected" : ""}`} />
          <text x={element.x + element.width / 2} y={element.y + element.height / 2 + 5} textAnchor="middle" className="node-title">{element.name}</text>
        </g>
      );
    }

    if (project.diagramType === "statechart" && element.kind === "state") {
      return (
        <g {...commonProps}>
          <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="24" className={`state-node ${selectedId === element.id ? "selected" : ""}`} />
          <text x={element.x + element.width / 2} y={element.y + element.height / 2 + 5} textAnchor="middle" className="node-title">{element.name}</text>
        </g>
      );
    }

    if (project.diagramType === "dfd" && (element.kind === "process" || element.kind === "datastore")) {
      return (
        <g {...commonProps}>
          <rect x={element.x} y={element.y} width={element.width} height={element.height} rx={element.kind === "process" ? "60" : "8"} className={`dfd-node ${element.kind} ${selectedId === element.id ? "selected" : ""}`} />
          <text x={element.x + element.width / 2} y={element.y + 42} textAnchor="middle" className="node-title">{element.name}</text>
          {element.attributes.map((attribute, index) => <text key={attribute} x={element.x + element.width / 2} y={element.y + 72 + index * 18} textAnchor="middle" className="node-body">{attribute}</text>)}
        </g>
      );
    }

    if (project.diagramType === "erd" && element.kind === "entity") {
      return (
        <g {...commonProps}>
          <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="8" className={`entity-node ${selectedId === element.id ? "selected" : ""}`} />
          <rect x={element.x} y={element.y} width={element.width} height="44" rx="8" className="entity-header" />
          <text x={element.x + element.width / 2} y={element.y + 28} textAnchor="middle" className="node-title">{element.name}</text>
          {element.attributes.map((attribute, index) => <text key={attribute} x={element.x + 16} y={element.y + 74 + index * 20} className="node-body">{attribute}</text>)}
        </g>
      );
    }

    if (flowLike && (element.kind === "initial" || element.kind === "final")) {
      const center = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      return (
        <g {...commonProps}>
          <circle cx={center} cy={cy} r="22" className={`activity-node ${element.kind} ${selectedId === element.id ? "selected" : ""}`} />
          {element.kind === "final" && <circle cx={center} cy={cy} r="12" className="activity-final-core" />}
          <text x={center} y={element.y + element.height + 24} textAnchor="middle" className="node-body">{element.name}</text>
        </g>
      );
    }

    if (flowLike && element.kind === "decision") {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const points = `${centerX},${element.y} ${element.x + element.width},${centerY} ${centerX},${element.y + element.height} ${element.x},${centerY}`;
      return (
        <g {...commonProps}>
          <polygon points={points} className={`activity-decision ${selectedId === element.id ? "selected" : ""}`} />
          <text x={centerX} y={centerY + 5} textAnchor="middle" className="node-title">{element.name}</text>
        </g>
      );
    }

    if (flowLike && element.kind === "action") {
      return (
        <g {...commonProps}>
          <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="24" className={`activity-action ${selectedId === element.id ? "selected" : ""}`} />
          <text x={element.x + element.width / 2} y={element.y + element.height / 2 + 5} textAnchor="middle" className="node-title">{element.name}</text>
        </g>
      );
    }

    return (
      <g {...commonProps}>
        <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="12" className={`model-node ${selectedId === element.id ? "selected" : ""}`} />
        <line x1={element.x} y1={element.y + 50} x2={element.x + element.width} y2={element.y + 50} className="node-divider" />
        <line x1={element.x} y1={element.y + 98} x2={element.x + element.width} y2={element.y + 98} className="node-divider" />
        <text x={element.x + element.width / 2} y={element.y + 32} textAnchor="middle" className="node-title">{element.name}</text>
        {element.attributes.slice(0, 4).map((attribute, index) => <text key={attribute} x={element.x + 16} y={element.y + 73 + index * 18} className="node-body">{attribute}</text>)}
        {element.operations.slice(0, 3).map((operation, index) => <text key={operation} x={element.x + 16} y={element.y + 121 + index * 18} className="node-body">{operation}</text>)}
      </g>
    );
  };

  const renderDiagram = () => (
    <svg className="canvas-svg" viewBox="0 0 1280 720" role="img" aria-label={`${diagramLabels[project.diagramType]} diagram showing model elements and relationships`}>
      <defs>
        <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M 32 0 L 0 0 0 32" fill="none" className="grid-line" />
        </pattern>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-fill" />
        </marker>
      </defs>
      <rect width="1280" height="720" className="canvas-background" fill="url(#grid)" />
      {project.diagramType === "usecase" && <>
        <rect x="420" y="70" width="760" height="520" rx="18" className="system-boundary" />
        <text x="450" y="105" className="boundary-label">Crack UML learning system</text>
      </>}
      {project.relationships.map(renderRelationship)}
      {project.elements.map(renderElement)}
    </svg>
  );

  if (!hydrated) {
    return (
      <main className="studio loading-shell" aria-busy="true">
        <section className="loading-state" role="status" aria-live="polite">
          <div className="brand-mark" aria-hidden="true">C</div>
          <h1>Loading your workspace…</h1>
          <p>Restoring your latest Crack UML project.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="studio">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div>
            <div className="brand-name">Crack UML</div>
            <div className="brand-subtitle">Learn by modeling</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="button button-ghost" onClick={newProject}>New project</button>
          <button className="button button-secondary" onClick={startLesson}>Start lesson</button>
          <button className="button button-primary" onClick={saveProject}>Save project</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="left-rail" aria-label="Project navigation">
          <section className="panel-section">
            <div className="panel-heading">
              <h2>Project</h2>
              <div className="panel-heading-actions">
                <button className="icon-button" aria-label="Start guided lesson" title="Start guided lesson" onClick={startLesson}>✦</button>
                <button className="icon-button" aria-label="Add class" title="Add class" onClick={addClass}>＋</button>
              </div>
            </div>
            <div className="project-card">
              <strong>{project.name}</strong>
              <span>{project.elements.length} model elements · {diagramLabels[project.diagramType]} diagram</span>
            </div>
          </section>

          <section className="panel-section">
            <div className="panel-heading">
              <h2>Model explorer</h2>
              <button className="icon-button" aria-label="Add a model element" title="Add a model element" onClick={addClass}>＋</button>
            </div>
            <ul className="tree" role="tree" aria-label="Model explorer tree">
              <li>
                <button className="tree-button" role="treeitem" aria-expanded="true" onClick={() => setAnnounce("Project root selected.")}>
                  <span className="tree-icon" aria-hidden="true">◆</span>
                  <span>{project.name}</span>
                </button>
              </li>
              <li className="tree-indent">
                <button className="tree-button" role="treeitem" aria-expanded="true" onClick={() => setAnnounce("Domain model selected.")}>
                  <span className="tree-icon" aria-hidden="true">□</span>
                  <span>Domain model</span>
                </button>
              </li>
              {project.elements.map((element) => (
                <li className="tree-indent" key={element.id}>
                  <button className={`tree-button ${selectedId === element.id ? "selected" : ""}`} role="treeitem" aria-selected={selectedId === element.id} onClick={() => chooseElement(element)}>
                    <span className="tree-icon" aria-hidden="true">{kindGlyph[element.kind]}</span>
                    <span>{element.name}</span>
                  </button>
                </li>
              ))}
              <li className="tree-indent">
                <button className="tree-button selected" role="treeitem" aria-selected="true" onClick={() => setAnnounce(`${diagramLabels[project.diagramType]} diagram selected.`)}>
                  <span className="tree-icon diagram" aria-hidden="true">⌁</span>
                  <span>{diagramLabels[project.diagramType]} diagram</span>
                </button>
              </li>
            </ul>
          </section>

          <section className="panel-section">
            <div className="panel-heading"><h2>Shortcuts</h2></div>
            <div className="helper-text">Use Tab to move through the studio. Select a model element to edit it.</div>
          </section>
        </aside>

        <section className="main-stage" aria-label="Diagram workspace">
          {project.lesson && (
            <div className="lesson-banner">
              <div className="lesson-meta">
                <span className="lesson-badge" aria-hidden="true">1</span>
                <div className="lesson-copy">
                  <strong>Guided lesson · {project.lesson}</strong>
                  <span>Start with two concepts, then connect them to show how the system works.</span>
                </div>
              </div>
              <button className="button button-secondary button-small" onClick={() => setAnnounce("Lesson hint: a library keeps a catalogue of books.")}>Show hint</button>
            </div>
          )}

          <div className="canvas-toolbar">
            <div className="toolbar-group">
              <label className="diagram-picker" htmlFor="diagram-type">
                <span className="toolbar-label">Diagram</span>
                <select id="diagram-type" value={project.diagramType} onChange={(event) => changeDiagramType(event.target.value as DiagramType)}>
                  {(Object.keys(diagramLabels) as DiagramType[]).map((type) => <option key={type} value={type}>{diagramLabels[type]}</option>)}
                </select>
              </label>
              <span className="diagram-description">{diagramDescriptions[project.diagramType]}</span>
              {project.diagramType === "class" && <>
                <button className="button button-secondary button-small" onClick={addClass}>＋ Class</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("association")}>{connectSourceId ? "↗ Pick target" : "↗ Association"}</button>
              </>}
              {project.diagramType === "activity" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("action")}>＋ Action</button>
                <button className="button button-secondary button-small" onClick={() => addElement("decision")}>◇ Decision</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("flow")}>{connectSourceId ? "→ Pick target" : "→ Flow"}</button>
              </>}
              {project.diagramType === "sequence" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("lifeline")}>＋ Lifeline</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("message")}>{connectSourceId ? "→ Pick target" : "→ Message"}</button>
              </>}
              {project.diagramType === "usecase" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("actor")}>＋ Actor</button>
                <button className="button button-secondary button-small" onClick={() => addElement("usecase")}>＋ Use case</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("association")}>{connectSourceId ? "↗ Pick target" : "↗ Connect"}</button>
              </>}
              {project.diagramType === "statechart" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("state")}>＋ State</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("flow")}>{connectSourceId ? "→ Pick target" : "→ Transition"}</button>
              </>}
              {project.diagramType === "dfd" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("process")}>＋ Process</button>
                <button className="button button-secondary button-small" onClick={() => addElement("datastore")}>＋ Data store</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("flow")}>{connectSourceId ? "→ Pick target" : "→ Data flow"}</button>
              </>}
              {project.diagramType === "erd" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("entity")}>＋ Entity</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("association")}>{connectSourceId ? "↗ Pick target" : "↗ Relation"}</button>
              </>}
              {project.diagramType === "flowchart" && <>
                <button className="button button-secondary button-small" onClick={() => addElement("action")}>＋ Step</button>
                <button className="button button-secondary button-small" onClick={() => addElement("decision")}>◇ Decision</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect("flow")}>{connectSourceId ? "→ Pick target" : "→ Flow"}</button>
              </>}
              {!(["class", "activity", "sequence", "usecase", "statechart", "dfd", "erd", "flowchart"] as DiagramType[]).includes(project.diagramType) && <>
                <button className="button button-secondary button-small" onClick={() => addElement(diagramDefaultKinds[project.diagramType])}>＋ {kindLabel[diagramDefaultKinds[project.diagramType]]}</button>
                <button className={`button button-secondary button-small ${connectSourceId ? "active-tool" : ""}`} onClick={() => beginConnect(diagramLinkKinds[project.diagramType])}>{connectSourceId ? "→ Pick target" : "→ Link"}</button>
              </>}
            </div>
            <div className="toolbar-group">
              <button className="button button-ghost button-small" onClick={undo} disabled={!history.length}>↶ Undo</button>
              <button className="button button-ghost button-small" onClick={redo} disabled={!future.length}>↷ Redo</button>
              <button className="button button-danger button-small" onClick={deleteSelected} disabled={!selected} title="Delete the selected model element">⌫ Delete</button>
              <button className="button button-secondary button-small" onClick={exportSvg}>Export SVG</button>
            </div>
          </div>

          <div className="canvas-wrap">
            <div className="canvas-card">
              {project.elements.length === 0 ? (
                <div className="canvas-empty">
                  <h3>Start your {diagramLabels[project.diagramType].toLowerCase()} diagram</h3>
                  <p>{diagramDescriptions[project.diagramType]} Choose a typed element from the toolbar to begin.</p>
                  <button className="button button-primary" onClick={project.diagramType === "class" ? startLesson : () => addElement(diagramDefaultKinds[project.diagramType])}>{project.diagramType === "class" ? "Open guided lesson" : `Add first ${kindLabel[diagramDefaultKinds[project.diagramType]].toLowerCase()}`}</button>
                </div>
              ) : (
                renderDiagram()
              )}
              <div className="canvas-status" aria-label="Diagram status">
                <span className="canvas-status-item"><span className={`status-dot ${saveState !== "saved" ? "unsaved" : ""}`} aria-hidden="true" />{saveState === "saving" ? "Saving…" : saveState === "saved" && backendReady ? "Saved to backend" : saveState === "saved" ? "Saved locally" : "Unsaved changes"}</span>
                <span className="canvas-status-item">100%</span>
              </div>
            </div>
          </div>
        </section>

        <aside className="right-rail" aria-label="Model guidance and inspector">
          <section className="panel-section">
            <div className="inspector-heading">
              <div className="inspector-title">
                <span className="kind-chip" aria-hidden="true">{selected ? kindGlyph[selected.kind] : "?"}</span>
                <div>
                  <h2>{selected ? "Element details" : "Nothing selected"}</h2>
                  <p>{selected ? kindLabel[selected.kind] : "Select a model element"}</p>
                </div>
              </div>
            </div>

            {selected ? (
              <>
                <div className="field">
                  <label htmlFor="element-name">Name</label>
                  <input id="element-name" value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} />
                </div>
                <div className="field">
                  <label htmlFor="element-description">Plain-language explanation</label>
                  <textarea id="element-description" value={selected.description} onChange={(event) => updateSelected({ description: event.target.value })} />
                </div>
                <div className="field">
                  <div className="property-label-row"><label>Attributes</label><button className="icon-button" aria-label="Add attribute" title="Add attribute" onClick={() => addListItem("attributes")}>＋</button></div>
                  <div className="chip-list">{selected.attributes.map((attribute) => <div className="property-chip" key={attribute}><span>{attribute}</span><span aria-hidden="true">⋮</span></div>)}</div>
                </div>
                <div className="field">
                  <div className="property-label-row"><label>Operations</label><button className="icon-button" aria-label="Add operation" title="Add operation" onClick={() => addListItem("operations")}>＋</button></div>
                  <div className="chip-list">{selected.operations.map((operation) => <div className="property-chip" key={operation}><span>{operation}</span><span aria-hidden="true">⋮</span></div>)}</div>
                </div>
                {selectedRelationships.length > 0 && <div className="field"><label>Relationships</label><div className="chip-list">{selectedRelationships.map((relationship) => <div className="property-chip" key={relationship.id}><span>{relationship.label}</span><span>↗</span></div>)}</div></div>}
              </>
            ) : (
              <div className="empty-inspector">Choose a class in the model explorer or diagram to edit its name, explanation, attributes, and operations.</div>
            )}
          </section>

          <section className="panel-section">
            <div className="panel-heading"><h2>Lesson steps</h2><span className="muted">{project.elements.length >= 2 && project.relationships.length >= 1 ? "2/2" : "1/2"}</span></div>
            <ol className="lesson-list">
              <li className={`lesson-step ${project.elements.length >= 2 ? "done" : ""}`}><span className="step-number">{project.elements.length >= 2 ? "✓" : "1"}</span><span>Add two concepts to your model.</span></li>
              <li className={`lesson-step ${project.relationships.length >= 1 ? "done" : ""}`}><span className="step-number">{project.relationships.length >= 1 ? "✓" : "2"}</span><span>Connect them to explain the system.</span></li>
            </ol>
          </section>

          <section className="panel-section">
            <div className="tip-card">
              <div className="tip-title"><span aria-hidden="true">✦</span> Modeling tip</div>
              <p>A class names a concept. Its attributes describe what it knows; its operations describe what it can do.</p>
            </div>
          </section>
        </aside>
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </main>
  );
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({"<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;"}[character] ?? character));
}
