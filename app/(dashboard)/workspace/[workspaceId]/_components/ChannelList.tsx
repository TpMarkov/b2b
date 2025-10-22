"use client";
import { buttonVariants } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const ChannelList = () => {
  const {
    data: { channels },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  const { workspaceId, channelId } = useParams<{
    workspaceId: string;
    channelId: string;
  }>();

  return (
    <div className="space-y-0.5 py-1">
      {channels.map((ch) => {
        const isActive = ch.id === channelId; // ✅ check if this is the current channel

        return (
          <Link
            key={ch.id}
            href={`/workspace/${workspaceId}/channel/${ch.id}`}
            className={buttonVariants({
              variant: isActive ? "secondary" : "ghost", // different variant when active
              className: cn(
                "w-full justify-start px-2 py-1 h-7 text-muted-foreground hover:text-accent-foreground hover:bg-accent",
                isActive &&
                  "bg-accent  text-accent-foreground  text-xl text-bold" // or your own highlight style
              ),
            })}
          >
            <Hash className="size-4 mr-1" />
            <span className="truncate">{ch.name}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default ChannelList;
