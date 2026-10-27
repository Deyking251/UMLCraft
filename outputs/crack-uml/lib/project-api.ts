import { z } from "zod";
import { createProject as createStoredProject, getProject as getStoredProject, listProjects as listStoredProjects, projectSchema, requireActor, updateProject as updateStoredProject, validateProject } from "@/lib/backend";
import type { Project } from "@/lib/model";

const updateSchema = z.object({ project: projectSchema, baseRevision: z.number().int().positive() });

export { requireActor };

export async function listProjects() {
  return listStoredProjects();
}

export async function getProject(id: string) {
  return getStoredProject(id);
}

export async function createProject(input: unknown) {
  const parsed = projectSchema.parse((input as { project?: unknown })?.project ?? input);
  return createStoredProject(parsed);
}

export async function handleProjectRequest(id: string, request: Request) {
  if (request.method === "GET") return getStoredProject(id);
  const body = updateSchema.parse(await request.json());
  return updateStoredProject(id, body.project, body.baseRevision);
}

export function validateProjectRequest(project: Project) {
  return validateProject(project);
}
