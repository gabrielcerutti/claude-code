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
  createNote: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
import { POST } from "@/app/api/notes/route";

const mockSession = { user: { id: "user-1", email: "test@example.com" } };

const mockNote = {
  id: "note-1",
  user_id: "user-1",
  title: "My Note",
  content_json: '{"type":"doc","content":[]}',
  is_public: 0,
  public_slug: null,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
};

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(body: object) {
  return new Request("http://localhost/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/notes", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await POST(makeRequest({ title: "Test" }));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 201 with created note when authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createNote).mockReturnValue(mockNote);

    const response = await POST(makeRequest({ title: "My Note" }));

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.id).toBe("note-1");
    expect(body.title).toBe("My Note");
  });

  it("passes empty title so createNote uses its default", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createNote).mockReturnValue({ ...mockNote, title: "Untitled note" });

    await POST(makeRequest({}));

    expect(createNote).toHaveBeenCalledWith("user-1", {
      title: undefined,
      contentJson: undefined,
    });
  });

  it("trims whitespace from title", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createNote).mockReturnValue(mockNote);

    await POST(makeRequest({ title: "  My Note  " }));

    expect(createNote).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ title: "My Note" }),
    );
  });

  it("passes contentJson when provided", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(createNote).mockReturnValue(mockNote);

    const contentJson = '{"type":"doc","content":[]}';
    await POST(makeRequest({ title: "Test", contentJson }));

    expect(createNote).toHaveBeenCalledWith("user-1", expect.objectContaining({ contentJson }));
  });
});
