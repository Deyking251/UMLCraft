import { NextResponse } from "next/server";
import { actorId, isLocalBackendEnabled, signActorCookie } from "@/lib/backend";

export const runtime = "nodejs";

export async function POST() {
  if (!isLocalBackendEnabled()) return NextResponse.json({ code: "DEMO_AUTH_DISABLED", message: "Demo auth is available only in local development." }, { status: 404 });
  const response = NextResponse.json({ user: { id: actorId, name: "Crack UML demo learner", email: "demo@crack-uml.local" } });
  response.cookies.set("crack_uml_actor", signActorCookie(actorId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  return response;
}
