import { baseExtensions } from "@/components/rich-text-editor/extensions";
import { generateHTML, type JSONContent } from "@tiptap/react";

export function convertJsonToHtml(jsonContent: JSONContent): string {
  try {
    const content =
      typeof jsonContent === "string" ? JSON.parse(jsonContent) : jsonContent;

    return generateHTML(content, baseExtensions);
  } catch {
    console.log("Error:", "Error converting Json to HTML");
    return "";
  }
}
