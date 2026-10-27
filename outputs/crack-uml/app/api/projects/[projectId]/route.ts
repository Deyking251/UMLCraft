import { NextResponse } from "next/server";
import { handleProjectRequest, requireActor } from "@/lib/project-api";
import { handleApiError } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: { projectId: string } }) {
  try {
    requireActor(request);
    return NextResponse.json({ project: await handleProjectRequest(context.params.projectId, request) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: { params: { projectId: string } }) {
  try {
    requireActor(request);
    return NextResponse.json({ project: await handleProjectRequest(context.params.projectId, request) });
  } catch (error) {
    return handleApiError(error);
  }
}
