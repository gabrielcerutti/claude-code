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
  setNotePublic: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";
import { POST } from "@/app/api/notes/[id]/share/route";

const mockSession = { user: { id: "user-1" } };
const mockParams = Promise.resolve({ id: "note-1" });

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(body: object) {
  return new Request("http://localhost/api/notes/note-1/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/notes/[id]/share", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const response = await POST(makeRequest({ isPublic: true }), { params: mockParams });

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when isPublic is not a boolean", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);

    const response = await POST(makeRequest({ isPublic: "yes" }), { params: mockParams });

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/boolean/i);
  });

  it("returns 404 when note not found", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(setNotePublic).mockReturnValue(null);

    const response = await POST(makeRequest({ isPublic: true }), { params: mockParams });

    expect(response.status).toBe(404);
  });

  it("returns 200 with public note data when publishing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(setNotePublic).mockReturnValue({
      id: "note-1",
      user_id: "user-1",
      title: "Test",
      content_json: "{}",
      is_public: 1,
      public_slug: "abc123def456ghi7",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    });

    const response = await POST(makeRequest({ isPublic: true }), { params: mockParams });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("note-1");
    expect(body.is_public).toBe(1);
    expect(body.public_slug).toBe("abc123def456ghi7");
    expect(setNotePublic).toHaveBeenCalledWith("user-1", "note-1", true);
  });

  it("returns 200 with cleared slug when unpublishing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as never);
    vi.mocked(setNotePublic).mockReturnValue({
      id: "note-1",
      user_id: "user-1",
      title: "Test",
      content_json: "{}",
      is_public: 0,
      public_slug: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    });

    const response = await POST(makeRequest({ isPublic: false }), { params: mockParams });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.is_public).toBe(0);
    expect(body.public_slug).toBeNull();
    expect(setNotePublic).toHaveBeenCalledWith("user-1", "note-1", false);
  });
});
