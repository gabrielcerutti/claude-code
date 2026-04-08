"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/react";

type NoteEditorProps = {
  content?: JSONContent;
  onChange?: (content: JSONContent) => void;
};

export default function NoteEditor({ content, onChange }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-md border border-foreground/20">
      <Toolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 focus-within:outline-none [&_.tiptap]:min-h-48 [&_.tiptap]:outline-none"
      />
    </div>
  );
}

function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  const items = [
    {
      label: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive("bold"),
    },
    {
      label: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive("italic"),
    },
    {
      label: "H1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor.isActive("heading", { level: 3 }),
    },
    {
      label: "Bullet list",
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive("bulletList"),
    },
    {
      label: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive("code"),
    },
    {
      label: "Code block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive("codeBlock"),
    },
    {
      label: "Rule",
      action: () => editor.chain().focus().setHorizontalRule().run(),
      active: false,
    },
  ];

  return (
    <div
      className="flex flex-wrap gap-1 border-b border-foreground/10 px-2 py-1.5"
      role="toolbar"
      aria-label="Text formatting"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.action}
          aria-pressed={item.active}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            item.active ? "bg-foreground text-background" : "hover:bg-foreground/10"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
