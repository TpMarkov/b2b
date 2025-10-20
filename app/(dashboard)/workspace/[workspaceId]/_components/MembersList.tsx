"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/helpers";
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";

const MembersList = () => {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  return (
    <div className="space-y-0.5 py-1">
      {members.map((m) => (
        <div
          key={m.id}
          className="px-3 py-2 hover:bg-accent cursor-pointer transition-colors flex items-center space-x-3"
        >
          <div className="relative">
            <Avatar className="size-8 relative">
              <Image
                src={getAvatar(m.picture ?? null, m.email!)}
                className="object-cover"
                alt={"Image URL"}
                fill
              />
              <AvatarFallback>{m.full_name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate font-medium">{m.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{m.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MembersList;
