import { NextResponse } from "next/server";
import { projectSchema, requireActor, validateProject } from "@/lib/backend";
import { handleApiError } from "@/lib/api-response";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: { projectId: string } }) {
  try {
    requireActor(request);
    const body = await request.json().catch(() => ({}));
    const project = projectSchema.parse(body.project);
    return NextResponse.json({ projectId: context.params.projectId, findings: validateProject(project) });
  } catch (error) {
    return handleApiError(error);
  }
}
