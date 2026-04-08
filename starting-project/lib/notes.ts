import { query, run, get } from "./db";

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

export function createNote(userId: string, data: { title?: string; contentJson?: string }): Note {
  const id = crypto.randomUUID();
  const title = data.title || "Untitled note";
  const contentJson = data.contentJson ?? JSON.stringify({ type: "doc", content: [] });

  run(
    `INSERT INTO notes (id, user_id, title, content_json) VALUES ($id, $userId, $title, $contentJson)`,
    { $id: id, $userId: userId, $title: title, $contentJson: contentJson },
  );

  return get<Note>(`SELECT * FROM notes WHERE id = $id`, { $id: id })!;
}

export function getNotesByUserId(userId: string): Note[] {
  return query<Note>(`SELECT * FROM notes WHERE user_id = $userId ORDER BY updated_at DESC`, {
    $userId: userId,
  });
}

export function getNoteById(userId: string, noteId: string): Note | null {
  return get<Note>(`SELECT * FROM notes WHERE id = $id AND user_id = $userId`, {
    $id: noteId,
    $userId: userId,
  });
}

export function updateNote(
  userId: string,
  noteId: string,
  data: { title?: string; contentJson?: string },
): Note | null {
  const fields: string[] = [];
  const params: Record<string, string> = { $id: noteId, $userId: userId };

  if (data.title !== undefined) {
    fields.push("title = $title");
    params.$title = data.title;
  }
  if (data.contentJson !== undefined) {
    fields.push("content_json = $contentJson");
    params.$contentJson = data.contentJson;
  }
  if (fields.length === 0) return getNoteById(userId, noteId);

  fields.push("updated_at = datetime('now')");
  run(`UPDATE notes SET ${fields.join(", ")} WHERE id = $id AND user_id = $userId`, params);
  return getNoteById(userId, noteId);
}

export function deleteNote(userId: string, noteId: string): void {
  run(`DELETE FROM notes WHERE id = $id AND user_id = $userId`, {
    $id: noteId,
    $userId: userId,
  });
}

export function setNotePublic(userId: string, noteId: string, isPublic: boolean): Note | null {
  const note = getNoteById(userId, noteId);
  if (!note) return null;

  if (isPublic) {
    const slug = note.public_slug ?? crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    run(
      `UPDATE notes SET is_public = 1, public_slug = $slug, updated_at = datetime('now') WHERE id = $id AND user_id = $userId`,
      { $slug: slug, $id: noteId, $userId: userId },
    );
  } else {
    run(
      `UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = $id AND user_id = $userId`,
      { $id: noteId, $userId: userId },
    );
  }

  return getNoteById(userId, noteId);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  return (
    get<Note>(`SELECT * FROM notes WHERE public_slug = $slug AND is_public = 1`, {
      $slug: slug,
    }) ?? null
  );
}
