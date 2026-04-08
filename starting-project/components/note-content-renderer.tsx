import type { ReactNode } from "react";

type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

function renderMarks(text: string, marks?: TipTapNode["marks"]): ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "code":
        return (
          <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-sm font-mono">{acc}</code>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return (
        <p key={index} className="mb-4 leading-7">
          {children}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      const sizes = { h1: "text-3xl", h2: "text-2xl", h3: "text-xl" };
      return (
        <Tag key={index} className={`${sizes[Tag]} font-bold mb-4 mt-6`}>
          {children}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={index} className="mb-4 list-disc pl-6 space-y-1">
          {children}
        </ul>
      );
    case "listItem":
      return (
        <li key={index} className="leading-7">
          {children}
        </li>
      );
    case "codeBlock":
      return (
        <pre
          key={index}
          className="mb-4 overflow-x-auto rounded-md bg-foreground/5 p-4 font-mono text-sm"
        >
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} className="my-6 border-foreground/20" />;
    case "text":
      return renderMarks(node.text ?? "", node.marks);
    default:
      return <>{children}</>;
  }
}

export default function NoteContentRenderer({ content }: { content: string }) {
  const doc: TipTapNode = JSON.parse(content);
  return <div className="max-w-none">{renderNode(doc, 0)}</div>;
}
