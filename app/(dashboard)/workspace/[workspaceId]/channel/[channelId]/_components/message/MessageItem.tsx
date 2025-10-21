import { getAvatar } from "@/lib/helpers";
import Image from "next/image";
import React from "react";

type Props = {
  id: number;
  message: string;
  date: Date;
  avatar: string;
  userName: string;
  email?: string;
};

const MessageItem = ({
  id,
  message,
  date,
  avatar,
  userName,
  email = "markowcvetan@gmail.com",
}: Props) => {
  return (
    <div className="flex space-x-3 relative p-3 rounded-lg hover:bg-muted">
      <Image
        src={getAvatar(avatar, email)}
        width={32}
        height={32}
        // className="object-cover"
        alt="User avatar"
        className="size-8 rounded-lg"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{userName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(date)}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(date)}
          </p>
        </div>
        <p className="break-words text-sm max-w-none">{message}</p>
      </div>
    </div>
  );
};

export default MessageItem;
