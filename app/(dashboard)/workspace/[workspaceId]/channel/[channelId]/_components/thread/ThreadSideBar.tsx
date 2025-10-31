import { Button } from "@/components/ui/button";
import { getAvatar } from "@/lib/helpers";
import { MessageSquareIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React from "react";
import ThreadReply from "./ThreadReply";
import ThreadReplyForm from "./ThreadReplyForm";
import { useThread } from "@/providers/ThreadProvider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import SafeContent from "../message/SafeContent";
import { extractTextFromJson } from "@/lib/helpers/json-to-text";
import SafePlainText from "../message/SafePlainText";

const ThreadSideBar = () => {
  const { selectedThreadId, closeThread } = useThread();

  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    })
  );

  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      {/* Header */}
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-4" />
          <span>Thread</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={closeThread}>
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {data && (
          <>
            <div className="p-4 border-b bg-muted/20">
              <div className="flex space-x-3">
                <Image
                  src={data.parent.authorAvatar}
                  alt="author image"
                  width={32}
                  height={32}
                  className="rounded-full size-8 shrink-0"
                />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {data.parent.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        month: "short",
                        day: "numeric",
                      }).format(data.parent.createdAt)}
                    </span>
                  </div>
                  <SafeContent
                    className="text-sm break-words prose dark:prose-invert max-w-none"
                    content={
                      data.parent.content && data.parent.content !== ""
                        ? JSON.parse(data.parent.content)
                        : { type: "doc", content: [] }
                    }
                  />
                  {data.parent.imageUrl && (
                    <Image
                      src={data.parent.imageUrl}
                      width={320}
                      height={320}
                      alt="Post-image"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Thread replies */}
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-3 px-2">
                {data.messages.length}{" "}
                {data.messages.length === 1 ? "Reply" : "Replies"}
              </p>
              <div className="space-y-1">
                {data.messages.map((reply) => (
                  <ThreadReply key={reply.id} message={reply} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Thread reply form */}
      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} />
      </div>
    </div>
  );
};

export default ThreadSideBar;
