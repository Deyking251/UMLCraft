import { NextResponse } from "next/server";
import { BackendError } from "@/lib/backend";

export function handleApiError(error: unknown) {
  if (error instanceof BackendError) {
    return NextResponse.json({ code: error.code, message: error.message, fields: error.fields }, { status: error.status });
  }
  if (error instanceof Error && error.name === "ZodError") {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "The request contains invalid model data." }, { status: 400 });
  }
  console.error("Crack UML API error", error);
  return NextResponse.json({ code: "INTERNAL_ERROR", message: "The server could not complete this request." }, { status: 500 });
}
