import { Message } from "@/lib/generated/prisma";
import { getAvatar } from "@/lib/helpers";
import Image from "next/image";
import React, { useState } from "react";
import SafeContent from "./SafeContent";
import MessageHoverToolbar from "../toolbar/MessageHoverToolbar";
import EditMessage from "../toolbar/EditMessage";

interface Props {
  message: Message;
  currentUserId: string;
}

const MessageItem = ({ message, currentUserId }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="flex space-x-3 relative p-3 rounded-lg hover:bg-muted group">
      {" "}
      {/* Add 'group' here */}
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        width={32}
        height={32}
        alt="User avatar"
        className="size-8 rounded-lg"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>
        {isEditing ? (
          <EditMessage
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => {
              setIsEditing(false);
            }}
          />
        ) : (
          <>
            <SafeContent
              className="prose list-disc list-outside [&_ul]:ml-6 [&_ol]:ml-6"
              content={
                message.content && message.content !== ""
                  ? JSON.parse(message.content)
                  : { type: "doc", content: [] } // empty TipTap doc
              }
            />

            {message.imageUrl && (
              <div className="mt-3">
                <Image
                  width={512}
                  height={512}
                  src={message.imageUrl}
                  alt="Message Image"
                  className="rounded-md max-h-[320px] w-auto object-contain"
                />
              </div>
            )}
          </>
        )}
      </div>
      <MessageHoverToolbar
        messageId={message.id}
        canEdit={message.authorId === currentUserId}
        onEdit={() => setIsEditing(true)}
      />
    </div>
  );
};

export default MessageItem;
