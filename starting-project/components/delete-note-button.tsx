"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  noteId: string;
};

export default function DeleteNoteButton({ noteId }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setDeleting(true);
    setError("");

    const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });

    if (!res.ok) {
      setError("Failed to delete note");
      setDeleting(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
      >
        Delete
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto rounded-lg border border-foreground/20 bg-background text-foreground p-6 shadow-lg backdrop:bg-black/50 max-w-sm w-full"
      >
        <h2 className="text-lg font-semibold mb-2">Delete note?</h2>
        <p className="text-sm text-foreground/70 mb-6">This action cannot be undone.</p>

        {error && (
          <p role="alert" className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={deleting}
            className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
