export function parseMessageContent(content: string | null | undefined) {
  if (!content || content === "") {
    return { type: "doc", content: [] };
  }

  try {
    return JSON.parse(content);
  } catch {
    console.error("Invalid message content:", content);
    return { type: "doc", content: [] };
  }
}
