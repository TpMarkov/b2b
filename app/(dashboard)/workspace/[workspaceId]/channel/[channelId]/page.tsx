"use client";
import React from "react";
import ChannelHeader from "./_components/ChannelHeader";
import MessageList from "./_components/MessageList";
import MessageInputForm from "./_components/message/MessageInputForm";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";

const ChannelPageMain = () => {
  const { channelId } = useParams<{ channelId: string }>();

  const { data, error, isLoading } = useQuery(
    orpc.channel.get.queryOptions({
      input: {
        channelId: channelId,
      },
    })
  );

  if (error) return <p>Error</p>;

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        <ChannelHeader />
        {/* Scrollable messages Area */}

        <div className="flex-1 mb-4 overflow-hidden">
          <MessageList />
        </div>
        {/* Fixed input */}
        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, undefined>>}
          />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;
