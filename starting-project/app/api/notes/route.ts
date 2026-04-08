import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const contentJson = typeof body.contentJson === "string" ? body.contentJson : undefined;

  const note = createNote(session.user.id, {
    title: title || undefined,
    contentJson,
  });

  return NextResponse.json(note, { status: 201 });
}
