import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import NoteContentRenderer from "@/components/note-content-renderer";

export default async function PublicNotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold">{note.title}</h1>
      <time className="mt-1 block text-sm text-foreground/50">
        Last updated: {new Date(note.updated_at + "Z").toLocaleDateString()}
      </time>
      <div className="mt-8">
        <NoteContentRenderer content={note.content_json} />
      </div>
    </main>
  );
}
