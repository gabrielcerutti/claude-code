import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

import { query, get, run } from "@/lib/db";
import {
  createNote,
  getNotesByUserId,
  getNoteById,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
  type Note,
} from "@/lib/notes";

const mockNote = (overrides: Partial<Note> = {}): Note => ({
  id: "note-1",
  user_id: "user-1",
  title: "Test Note",
  content_json: '{"type":"doc","content":[]}',
  is_public: 0,
  public_slug: null,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createNote", () => {
  it("uses default title when none provided", () => {
    const note = mockNote({ title: "Untitled note" });
    vi.mocked(get).mockReturnValue(note);

    const result = createNote("user-1", {});

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO notes"),
      expect.objectContaining({ $title: "Untitled note", $userId: "user-1" }),
    );
    expect(result.title).toBe("Untitled note");
  });

  it("uses provided title and contentJson", () => {
    const note = mockNote({ title: "My Note" });
    vi.mocked(get).mockReturnValue(note);

    createNote("user-1", { title: "My Note", contentJson: '{"type":"doc"}' });

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO notes"),
      expect.objectContaining({
        $title: "My Note",
        $contentJson: '{"type":"doc"}',
        $userId: "user-1",
      }),
    );
  });

  it("returns the created note", () => {
    const note = mockNote();
    vi.mocked(get).mockReturnValue(note);

    const result = createNote("user-1", { title: "Test Note" });

    expect(result).toEqual(note);
  });
});

describe("getNotesByUserId", () => {
  it("queries notes filtered by userId", () => {
    vi.mocked(query).mockReturnValue([]);

    getNotesByUserId("user-1");

    expect(query).toHaveBeenCalledWith(expect.stringContaining("WHERE user_id = $userId"), {
      $userId: "user-1",
    });
  });

  it("returns the list of notes", () => {
    const notes = [mockNote(), mockNote({ id: "note-2" })];
    vi.mocked(query).mockReturnValue(notes);

    const result = getNotesByUserId("user-1");

    expect(result).toEqual(notes);
  });
});

describe("getNoteById", () => {
  it("returns the note when found", () => {
    const note = mockNote();
    vi.mocked(get).mockReturnValue(note);

    const result = getNoteById("user-1", "note-1");

    expect(result).toEqual(note);
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = $id AND user_id = $userId"),
      {
        $id: "note-1",
        $userId: "user-1",
      },
    );
  });

  it("returns null when not found", () => {
    vi.mocked(get).mockReturnValue(null);

    const result = getNoteById("user-1", "missing");

    expect(result).toBeNull();
  });
});

describe("updateNote", () => {
  it("returns current note without SQL update when no fields provided", () => {
    const note = mockNote();
    vi.mocked(get).mockReturnValue(note);

    const result = updateNote("user-1", "note-1", {});

    expect(run).not.toHaveBeenCalled();
    expect(result).toEqual(note);
  });

  it("updates title only", () => {
    const updated = mockNote({ title: "New Title" });
    vi.mocked(get).mockReturnValue(updated);

    updateNote("user-1", "note-1", { title: "New Title" });

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("title = $title"),
      expect.objectContaining({ $title: "New Title" }),
    );
  });

  it("updates contentJson only", () => {
    const updated = mockNote({ content_json: '{"type":"doc","content":[{"type":"paragraph"}]}' });
    vi.mocked(get).mockReturnValue(updated);

    updateNote("user-1", "note-1", {
      contentJson: '{"type":"doc","content":[{"type":"paragraph"}]}',
    });

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("content_json = $contentJson"),
      expect.objectContaining({ $contentJson: '{"type":"doc","content":[{"type":"paragraph"}]}' }),
    );
  });

  it("updates both title and contentJson", () => {
    vi.mocked(get).mockReturnValue(mockNote());

    updateNote("user-1", "note-1", { title: "New", contentJson: "{}" });

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("title = $title"),
      expect.objectContaining({ $title: "New", $contentJson: "{}" }),
    );
  });

  it("returns null when note not found", () => {
    vi.mocked(get).mockReturnValue(null);

    const result = updateNote("user-1", "note-1", { title: "New" });

    expect(result).toBeNull();
  });
});

describe("deleteNote", () => {
  it("deletes the note scoped by userId", () => {
    deleteNote("user-1", "note-1");

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM notes WHERE id = $id AND user_id = $userId"),
      { $id: "note-1", $userId: "user-1" },
    );
  });
});

describe("setNotePublic", () => {
  it("returns null when note not found", () => {
    vi.mocked(get).mockReturnValue(null);

    const result = setNotePublic("user-1", "note-1", true);

    expect(result).toBeNull();
    expect(run).not.toHaveBeenCalled();
  });

  it("generates a 16-char slug on first publish", () => {
    const note = mockNote({ public_slug: null });
    // First get: fetch note; second get: return updated note after run
    vi.mocked(get)
      .mockReturnValueOnce(note)
      .mockReturnValueOnce(mockNote({ is_public: 1, public_slug: "abc" }));

    setNotePublic("user-1", "note-1", true);

    const callArgs = vi.mocked(run).mock.calls[0];
    const params = callArgs[1] as Record<string, unknown>;
    expect(typeof params.$slug).toBe("string");
    expect((params.$slug as string).length).toBe(16);
  });

  it("reuses the existing slug when re-publishing", () => {
    const existingSlug = "existingslug1234";
    const note = mockNote({ public_slug: existingSlug, is_public: 0 });
    vi.mocked(get)
      .mockReturnValueOnce(note)
      .mockReturnValueOnce(mockNote({ is_public: 1, public_slug: existingSlug }));

    setNotePublic("user-1", "note-1", true);

    expect(run).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ $slug: existingSlug }),
    );
  });

  it("clears is_public and public_slug when unpublishing", () => {
    const note = mockNote({ is_public: 1, public_slug: "someslug12345678" });
    vi.mocked(get)
      .mockReturnValueOnce(note)
      .mockReturnValueOnce(mockNote({ is_public: 0, public_slug: null }));

    const result = setNotePublic("user-1", "note-1", false);

    expect(run).toHaveBeenCalledWith(
      expect.stringContaining("is_public = 0, public_slug = NULL"),
      expect.objectContaining({ $id: "note-1", $userId: "user-1" }),
    );
    expect(result?.is_public).toBe(0);
    expect(result?.public_slug).toBeNull();
  });
});

describe("getNoteByPublicSlug", () => {
  it("returns the note when found", () => {
    const note = mockNote({ is_public: 1, public_slug: "testslug12345678" });
    vi.mocked(get).mockReturnValue(note);

    const result = getNoteByPublicSlug("testslug12345678");

    expect(result).toEqual(note);
    expect(get).toHaveBeenCalledWith(
      expect.stringContaining("WHERE public_slug = $slug AND is_public = 1"),
      { $slug: "testslug12345678" },
    );
  });

  it("returns null when not found", () => {
    vi.mocked(get).mockReturnValue(null);

    const result = getNoteByPublicSlug("missing");

    expect(result).toBeNull();
  });
});
