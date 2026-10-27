import { NextResponse } from "next/server";
import { createProject, listProjects, requireActor } from "@/lib/project-api";
import { handleApiError } from "@/lib/api-response";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    requireActor(request);
    return NextResponse.json({ projects: await listProjects() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    requireActor(request);
    return NextResponse.json({ project: await createProject(await request.json()) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
