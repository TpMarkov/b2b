import StarterKt from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { all, createLowlight } from "lowlight";
import { Placeholder } from "@tiptap/extensions";
import CodeBlock from "@tiptap/extension-code-block-lowlight";
const lowlight = createLowlight(all);

export const baseExtensions = [
  StarterKt.configure({
    codeBlock: false,
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  CodeBlock.configure({
    lowlight,
  }),
];

export const editorExtensions = [
  ...baseExtensions,
  Placeholder.configure({
    placeholder: "Type your Message",
  }),
];
