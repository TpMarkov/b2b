"use client";
import { buttonVariants } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import Link from "next/link";
import React from "react";

const ChannelList = () => {
  const {
    data: { channels },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  return (
    <div className="space-y-0.5 py-1">
      {channels.map((ch) => (
        <Link
          key={ch.name}
          href="#"
          className={buttonVariants({
            variant: "ghost",
            className: cn(
              "w-full justify-start px-2 py-1 h-7 text-muted-foreground hover:text-accent-foreground hover:bg-accent"
            ),
          })}
        >
          <Hash className="size-4" />
          <span className="truncate">{ch.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default ChannelList;
