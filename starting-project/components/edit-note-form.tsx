"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import NoteEditor from "./note-editor";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: JSONContent;
};

export default function EditNoteForm({ noteId, initialTitle, initialContent }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<JSONContent>(initialContent);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        contentJson: JSON.stringify(content),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save note");
      setSaving(false);
      return;
    }

    router.push(`/notes/${noteId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <NoteEditor content={content} onChange={setContent} />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
    </form>
  );
}
