import { NextResponse } from "next/server";
import { backendStatus } from "@/lib/backend";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, service: "crack-uml", backend: backendStatus(), schema: "initial-domain-v1" });
}
