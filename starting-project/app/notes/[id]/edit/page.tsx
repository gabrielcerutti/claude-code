import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import EditNoteForm from "@/components/edit-note-form";

export default async function NoteEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const { id } = await params;
  const note = getNoteById(session.user.id, id);

  if (!note) {
    notFound();
  }

  const initialContent = JSON.parse(note.content_json);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={`/notes/${id}`}
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Back to note
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-bold">Edit Note</h1>
      <EditNoteForm noteId={id} initialTitle={note.title} initialContent={initialContent} />
    </main>
  );
}
