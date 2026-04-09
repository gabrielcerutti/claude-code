"use client";

import { useState } from "react";

type Props = {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
  onPublicChange?: (isPublic: boolean) => void;
};

export default function ShareToggle({
  noteId,
  initialIsPublic,
  initialSlug,
  onPublicChange,
}: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleToggle() {
    const next = !isPublic;
    setIsPublic(next); // optimistic update
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.is_public === 1);
        setSlug(data.public_slug);
        onPublicChange?.(data.is_public === 1);
      } else {
        setIsPublic(!next); // revert
        setError("Failed to update sharing settings.");
      }
    } catch {
      setIsPublic(!next); // revert
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const publicUrl = slug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${slug}`
    : "";

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Public Sharing</p>
          <p className="mt-0.5 text-sm text-foreground/60">
            {isPublic ? "Anyone with the link can view this note" : "Only you can view this note"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={handleToggle}
          disabled={loading}
          className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${isPublic ? "bg-green-500" : "bg-foreground/20"}`}
        >
          <span
            className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5.5" : "translate-x-0.5"}`}
          />
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {isPublic && slug && (
        <div className="mt-4 flex gap-2">
          <input
            readOnly
            value={publicUrl}
            className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
