import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { updateNote, deleteNote, getNoteById } from "@/lib/notes";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const contentJson = typeof body.contentJson === "string" ? body.contentJson : undefined;

  const note = updateNote(session.user.id, id, { title, contentJson });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(note);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const note = getNoteById(session.user.id, id);

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  deleteNote(session.user.id, id);
  return new Response(null, { status: 204 });
}
