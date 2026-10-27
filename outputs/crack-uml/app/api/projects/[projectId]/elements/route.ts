import { NextResponse } from "next/server";
import { getProject, projectSchema, requireActor, updateProject } from "@/lib/backend";
import { handleApiError } from "@/lib/api-response";
import { z } from "zod";

export const runtime = "nodejs";

const elementInput = z.object({
  element: projectSchema.shape.elements.element,
  baseRevision: z.number().int().positive()
});

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    requireActor(request);
    const body = elementInput.parse(await request.json());
    const current = await getProject(context.params.projectId);
    if (current.revision !== body.baseRevision) return NextResponse.json({ code: "REVISION_CONFLICT", message: "This project changed since it was loaded." }, { status: 409 });
    if (current.project.elements.some((element) => element.id === body.element.id)) return NextResponse.json({ code: "DUPLICATE_ELEMENT", message: "That model element already exists." }, { status: 409 });
    const next = await updateProject(context.params.projectId, { ...current.project, elements: [...current.project.elements, body.element] }, body.baseRevision);
    return NextResponse.json({ element: body.element, project: next }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
