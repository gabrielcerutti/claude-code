import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("@/lib/notes", () => ({
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  getNoteById: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { updateNote, deleteNote, getNoteById } from "@/lib/notes";
import { PUT, DELETE } from "@/app/api/notes/[id]/route";

const mockSession = { user: { id: "user-1" } };

const mockNote = {
  id: "note-1",
  user_id: "user-1",
  title: "Test Note",
  content_json: '{"type":"doc","content":[]}',
  is_public: 0,
  public_slug: null,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
};

const mockParams = Promise.resolve({ id: "note-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

function makePutRequest(body: object) {
  return new Request("http://localhost/api/notes/note-1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest() {
  return new Request("http://localhost/api/notes/note-1", { method: "DELETE" });
}

describe("PUT /api/notes/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await PUT(makePutRequest({ title: "New" }), { params: mockParams });

    expect(response.status).toBe(401);
  });

  it("returns 404 when note not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(updateNote).mockReturnValue(null);

    const response = await PUT(makePutRequest({ title: "New" }), { params: mockParams });

    expect(response.status).toBe(404);
  });

  it("returns 200 with updated note on success", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(updateNote).mockReturnValue({ ...mockNote, title: "New Title" });

    const response = await PUT(makePutRequest({ title: "New Title" }), { params: mockParams });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.title).toBe("New Title");
  });

  it("passes trimmed title to updateNote", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(updateNote).mockReturnValue(mockNote);

    await PUT(makePutRequest({ title: "  Trimmed  " }), { params: mockParams });

    expect(updateNote).toHaveBeenCalledWith(
      "user-1",
      "note-1",
      expect.objectContaining({ title: "Trimmed" }),
    );
  });
});

describe("DELETE /api/notes/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await DELETE(makeDeleteRequest(), { params: mockParams });

    expect(response.status).toBe(401);
  });

  it("returns 404 when note not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(getNoteById).mockReturnValue(null);

    const response = await DELETE(makeDeleteRequest(), { params: mockParams });

    expect(response.status).toBe(404);
  });

  it("returns 204 and calls deleteNote on success", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(getNoteById).mockReturnValue(mockNote);

    const response = await DELETE(makeDeleteRequest(), { params: mockParams });

    expect(response.status).toBe(204);
    expect(deleteNote).toHaveBeenCalledWith("user-1", "note-1");
  });
});
