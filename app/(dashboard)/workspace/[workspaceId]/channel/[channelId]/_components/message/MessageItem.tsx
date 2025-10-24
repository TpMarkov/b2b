import { Message } from "@/lib/generated/prisma";
import { getAvatar } from "@/lib/helpers";
import Image from "next/image";
import React from "react";
import SafeContent from "./SafeContent";

interface Props {
  message: Message;
}

const MessageItem = ({ message }: Props) => {
  return (
    <div className="flex space-x-3 relative p-3 rounded-lg hover:bg-muted">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        width={32}
        height={32}
        // className="object-cover"
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
        <SafeContent
          className="prose list-disc list-outside [&_ul]:ml-6 [&_ol]:ml-6"
          content={JSON.parse(message.content)}
        />
      </div>
    </div>
  );
};

export default MessageItem;
