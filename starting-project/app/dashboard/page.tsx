import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNotesByUserId } from "@/lib/notes";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth");
  }

  const notes = getNotesByUserId(session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="mt-8 text-center text-foreground/60">
          No notes yet. Create your first note to get started.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-foreground/10">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-foreground/5 -mx-4 px-4 rounded-md"
              >
                <span className="font-medium truncate">{note.title}</span>
                <time className="shrink-0 text-sm text-foreground/50">
                  {new Date(note.updated_at + "Z").toLocaleDateString()}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
