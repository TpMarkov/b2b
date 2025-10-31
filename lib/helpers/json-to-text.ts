import { JSONContent } from "@tiptap/react";

/**
 * Safely extracts plain text from TipTap JSON content.
 */
export function extractTextFromJson(
  content: string | JSONContent | null | undefined
): string {
  if (!content) return "";

  // If it's a string, try to parse it
  let parsed: JSONContent;
  if (typeof content === "string") {
    try {
      parsed = JSON.parse(content) as JSONContent;
    } catch {
      return content; // already plain text
    }
  } else {
    parsed = content;
  }

  // Handle text node
  if (parsed.text) return parsed.text;

  // Recursively handle nested content
  if (Array.isArray(parsed.content)) {
    return parsed.content.map(extractTextFromJson).join(" ").trim();
  }

  return "";
}
