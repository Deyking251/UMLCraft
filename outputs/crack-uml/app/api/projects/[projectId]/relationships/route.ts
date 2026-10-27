import { NextResponse } from "next/server";
import { getProject, projectSchema, requireActor, updateProject } from "@/lib/backend";
import { handleApiError } from "@/lib/api-response";
import { z } from "zod";

export const runtime = "nodejs";

const relationshipInput = z.object({
  relationship: projectSchema.shape.relationships.element,
  baseRevision: z.number().int().positive()
});

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    requireActor(request);
    const body = relationshipInput.parse(await request.json());
    const current = await getProject(context.params.projectId);
    if (current.revision !== body.baseRevision) return NextResponse.json({ code: "REVISION_CONFLICT", message: "This project changed since it was loaded." }, { status: 409 });
    const ids = new Set(current.project.elements.map((element) => element.id));
    if (!ids.has(body.relationship.sourceId) || !ids.has(body.relationship.targetId)) return NextResponse.json({ code: "INVALID_RELATIONSHIP", message: "Both relationship endpoints must exist in the project." }, { status: 400 });
    if (body.relationship.sourceId === body.relationship.targetId) return NextResponse.json({ code: "INVALID_RELATIONSHIP", message: "A relationship must connect two different model elements." }, { status: 400 });
    const next = await updateProject(context.params.projectId, { ...current.project, relationships: [...current.project.relationships, body.relationship] }, body.baseRevision);
    return NextResponse.json({ relationship: body.relationship, project: next }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
