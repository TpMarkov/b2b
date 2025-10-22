import React from "react";
import { type JSONContent } from "@tiptap/react";
import { convertJsonToHtml } from "@/lib/helpers/json-to-html";
import DOMPurify from "dompurify";
import parse from "html-react-parser";

interface MessageProps {
  content: JSONContent;
  className?: string;
}
const SafeContent = ({ content, className }: MessageProps) => {
  const html = convertJsonToHtml(content);

  const clean = DOMPurify.sanitize(html);

  return <div className={className}>{parse(clean)}</div>;
};

export default SafeContent;
