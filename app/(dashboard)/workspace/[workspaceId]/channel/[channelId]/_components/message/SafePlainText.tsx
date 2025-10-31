import React from "react";
import { extractTextFromJson } from "@/lib/helpers/json-to-text";

interface Props {
  content: string | object;
  className?: string;
}

const SafePlainText = ({ content, className }: Props) => {
  const text = extractTextFromJson(content);
  return <p className={className}>{text}</p>;
};

export default SafePlainText;
