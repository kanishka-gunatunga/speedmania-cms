"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered 
} from "lucide-react";
import { useCallback } from "react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const extensions = [
  StarterKit,
  Image.configure({
    inline: true,
    HTMLAttributes: {
      class: "max-w-full h-auto rounded-md my-4",
    },
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-blue-500 underline underline-offset-4 hover:text-blue-700 cursor-pointer",
    },
  }),
];

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 prose prose-neutral max-w-none dark:prose-invert",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    
    // cancelled
    if (url === null) return;
    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2 border rounded-md">
      <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/50 rounded-t-md">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-accent text-accent-foreground" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-accent text-accent-foreground" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent text-accent-foreground" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-accent text-accent-foreground" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent text-accent-foreground" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-accent text-accent-foreground" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="mx-1 w-px bg-border my-1" />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={setLink}
          className={editor.isActive("link") ? "bg-accent text-accent-foreground" : ""}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
