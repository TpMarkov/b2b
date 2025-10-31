import { Message } from "@/lib/generated/prisma";
import { extractTextFromJson } from "@/lib/helpers/json-to-text";
import Image from "next/image";
import React from "react";
import SafeContent from "../message/SafeContent";

function parseMessageContent(content: string | null | undefined) {
  if (!content || content === "") return { type: "doc", content: [] };
  try {
    return JSON.parse(content);
  } catch {
    console.error("Invalid message content:", content);
    return { type: "doc", content: [] };
  }
}

interface ThreadReplyProps {
  message: Message;
}

const ThreadReply = ({ message }: ThreadReplyProps) => {
  // const replyText = extractTextFromJson(message.content);

  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        alt="Author-avatar"
        src={message.authorAvatar}
        width={32}
        height={32}
        className="rounded-full size-8 shrink-0 mt-1"
      />

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              month: "short",
              day: "numeric",
            }).format(message.createdAt)}
          </span>
        </div>
        <SafeContent
          content={parseMessageContent(message.content)}
          className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary"
        />
        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="Message Image"
              width={512}
              height={512}
              className="rounded-md max-h-[320px] w-auto object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadReply;
