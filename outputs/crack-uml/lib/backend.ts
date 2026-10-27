import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { createSeedProject, type Project } from "@/lib/model";

const actorId = "00000000-0000-0000-0000-000000000001";
const dataFile = () => process.env.CRACK_UML_LOCAL_DATA_PATH || path.join(process.cwd(), ".data", "projects.json");

const elementSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["class", "interface", "actor", "usecase", "action", "initial", "final", "decision", "lifeline", "state", "entity", "process", "datastore", "component", "deployment", "package", "object", "note", "service", "cloud"]),
  name: z.string().trim().min(1).max(200),
  attributes: z.array(z.string().max(500)).max(40),
  operations: z.array(z.string().max(500)).max(40),
  description: z.string().max(5000),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().positive(),
  height: z.number().finite().positive()
});

const relationshipSchema = z.object({
  id: z.string().min(1).max(120),
  kind: z.enum(["association", "generalization", "flow", "message", "include"]),
  sourceId: z.string().min(1).max(120),
  targetId: z.string().min(1).max(120),
  label: z.string().max(200)
});

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(160),
  lesson: z.string().max(500).nullable(),
  diagramType: z.enum(["class", "activity", "sequence", "usecase", "statechart", "dfd", "erd", "flowchart", "component", "deployment", "package", "object", "communication", "timing", "interaction", "informationflow", "profile", "composite", "bpmn", "c4", "wireframe", "mindmap", "cloud"]).default("class"),
  elements: z.array(elementSchema).max(500),
  relationships: z.array(relationshipSchema).max(1000)
});

const recordSchema = z.object({
  id: z.string().min(1),
  revision: z.number().int().positive(),
  project: projectSchema,
  updatedAt: z.string().datetime()
});

export type ProjectRecord = z.infer<typeof recordSchema>;

export type ValidationFinding = {
  code: string;
  severity: "error" | "warning";
  message: string;
  anchorId?: string;
};

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string>
  ) {
    super(message);
    this.name = "BackendError";
  }
}

export function isLocalBackendEnabled() {
  return process.env.CRACK_UML_LOCAL_BACKEND === "true" || (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production");
}

export function backendStatus() {
  if (isLocalBackendEnabled()) return "local-file" as const;
  if (process.env.DATABASE_URL) return "postgres-pending-adapter" as const;
  return "unconfigured" as const;
}

export function requireActor(request: Request) {
  const rawSession = request.headers.get("cookie")?.match(/(?:^|;\s*)crack_uml_actor=([^;]+)/)?.[1];
  const session = verifyActorCookie(rawSession) ? rawSession?.split(".")[0] : undefined;
  if (isLocalBackendEnabled()) return { id: session || actorId, mode: "demo" as const };
  throw new BackendError(401, "AUTH_REQUIRED", "Sign in is required for this environment.");
}

export function ensureBackendAvailable() {
  if (!isLocalBackendEnabled()) {
    throw new BackendError(501, "POSTGRES_ADAPTER_REQUIRED", "Set CRACK_UML_LOCAL_BACKEND=true for local development or configure the Postgres adapter before production use.");
  }
}

async function readRecords(): Promise<ProjectRecord[]> {
  await ensureLocalDirectory();
  try {
    const raw = await readFile(dataFile(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    return z.array(recordSchema).parse(parsed);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      throw new BackendError(500, "LOCAL_DATA_INVALID", "The local project store is invalid and needs repair.");
    }
    throw error;
  }
}

async function writeRecords(records: ProjectRecord[]) {
  await ensureLocalDirectory();
  const target = dataFile();
  const temporary = `${target}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(records, null, 2), "utf8");
  await rename(temporary, target);
}

async function ensureLocalDirectory() {
  await mkdir(path.dirname(dataFile()), { recursive: true });
}

export async function getProject(id: string) {
  ensureBackendAvailable();
  const records = await readRecords();
  const existing = records.find((record) => record.id === id);
  if (existing) return existing;
  if (id !== "demo") throw new BackendError(404, "PROJECT_NOT_FOUND", "Project not found.");
  const seeded: ProjectRecord = {
    id: "demo",
    revision: 1,
    project: createSeedProject(),
    updatedAt: new Date().toISOString()
  };
  await writeRecords([...records, seeded]);
  return seeded;
}

export async function listProjects() {
  ensureBackendAvailable();
  const records = await readRecords();
  if (!records.some((record) => record.id === "demo")) await getProject("demo");
  return readRecords();
}

export async function createProject(project: Project) {
  ensureBackendAvailable();
  const parsed = projectSchema.parse(project);
  const records = await readRecords();
  const record: ProjectRecord = {
    id: randomUUID(),
    revision: 1,
    project: parsed,
    updatedAt: new Date().toISOString()
  };
  await writeRecords([...records, record]);
  return record;
}

export async function updateProject(id: string, project: Project, baseRevision: number) {
  ensureBackendAvailable();
  const parsed = projectSchema.parse(project);
  const records = await readRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new BackendError(404, "PROJECT_NOT_FOUND", "Project not found.");
  const current = records[index];
  if (current.revision !== baseRevision) {
    throw new BackendError(409, "REVISION_CONFLICT", "This project changed since it was loaded.", { serverRevision: String(current.revision) });
  }
  const next: ProjectRecord = { ...current, revision: current.revision + 1, project: parsed, updatedAt: new Date().toISOString() };
  records[index] = next;
  await writeRecords(records);
  return next;
}

export function validateProject(project: Project): ValidationFinding[] {
  const findings: ValidationFinding[] = [];
  const ids = new Set(project.elements.map((element) => element.id));
  const names = new Map<string, string>();
  for (const element of project.elements) {
    const key = element.name.toLowerCase();
    if (names.has(key)) findings.push({ code: "DUPLICATE_ELEMENT_NAME", severity: "warning", message: `“${element.name}” is used more than once. Give each concept a distinct name.`, anchorId: element.id });
    names.set(key, element.id);
  }
  for (const relationship of project.relationships) {
    if (!ids.has(relationship.sourceId) || !ids.has(relationship.targetId)) {
      findings.push({ code: "BROKEN_RELATIONSHIP", severity: "error", message: "This relationship points to a missing model element.", anchorId: relationship.id });
    }
    if (relationship.sourceId === relationship.targetId) {
      findings.push({ code: "SELF_RELATIONSHIP", severity: "warning", message: "Connect two different concepts so the relationship teaches a useful system rule.", anchorId: relationship.id });
    }
  }
  if (project.elements.length === 0) findings.push({ code: "EMPTY_MODEL", severity: "warning", message: "Add at least one class before validating the model." });
  return findings;
}

export function signActorCookie(value: string) {
  const secret = process.env.CRACK_UML_SESSION_SECRET || "local-development-only";
  return `${value}.${createHmac("sha256", secret).update(value).digest("hex")}`;
}

export function verifyActorCookie(value: string | undefined) {
  if (!value) return false;
  const [id, signature] = value.split(".");
  if (!id || !signature) return false;
  const expected = createHmac("sha256", process.env.CRACK_UML_SESSION_SECRET || "local-development-only").update(id).digest("hex");
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export { actorId };
