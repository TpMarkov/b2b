"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import { baseExtensions, editorExtensions } from "./extensions";
import Menubar from "./Menubar";

const RichTextEditor = () => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    editorProps: {
      attributes: {
        class: "max-w-none min-h-[125px] focus:outline-none p-4",
      },
    },
  });

  return (
    <div className="relative w-full border border-input rounded-lg overflow-hidden dark:bg-input/30 flex flex-col">
      <Menubar editor={editor} />
      <EditorContent
        editor={editor}
        className="max-w-[200px] overflow-y-auto"
      />
    </div>
  );
};

export default RichTextEditor;
