import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import NoteContentRenderer from "@/components/note-content-renderer";
import DeleteNoteButton from "@/components/delete-note-button";
import ShareToggle from "@/components/share-toggle";

export default async function NoteViewPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-foreground/60 hover:text-foreground transition-colors"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{note.title}</h1>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/notes/${id}/edit`}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      <div className="mt-1 flex items-center gap-3 text-sm text-foreground/50">
        <time>Updated: {new Date(note.updated_at + "Z").toLocaleDateString()}</time>
        <span>{note.is_public === 1 ? "Public" : "Private"}</span>
      </div>

      <hr className="my-6 border-foreground/10" />

      <NoteContentRenderer content={note.content_json} />

      <hr className="my-6 border-foreground/10" />

      <ShareToggle
        noteId={id}
        initialIsPublic={note.is_public === 1}
        initialSlug={note.public_slug}
      />
    </main>
  );
}
