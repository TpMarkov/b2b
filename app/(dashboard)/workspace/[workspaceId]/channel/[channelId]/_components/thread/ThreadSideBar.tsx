"use client";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, MessageSquareIcon, XIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import ThreadReply from "./ThreadReply";
import ThreadReplyForm from "./ThreadReplyForm";
import { useThread } from "@/providers/ThreadProvider";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import SafeContent from "../message/SafeContent";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import ThreadSidebarSkeleton from "./ThreadSidebarSkeleton";

interface ThreadSidebarProps {
  user: KindeUser<Record<string, unknown>>;
}

const ThreadSideBar = ({ user }: ThreadSidebarProps) => {
  const { selectedThreadId, closeThread } = useThread();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBotom, setIsAtBottom] = useState(false);
  const lastMessageCountRef = useRef(0);

  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    })
  );

  const messageCount = data?.messages.length ?? 0;

  const isNearbottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    setIsAtBottom(isNearbottom(el));
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;

    if (!el) return;

    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });

    setIsAtBottom(true);
  };

  useEffect(() => {
    if (messageCount === 0) return;

    const previousMessageCount = lastMessageCountRef.current;
    const el = scrollRef.current;

    if (previousMessageCount > 0 && messageCount !== previousMessageCount) {
      if (el && isNearbottom(el)) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        });
        setIsAtBottom(true);
      }

      lastMessageCountRef.current = messageCount;
    }
  }, [messageCount]);

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const scrollToBottomIfNeeded = () => {
      if (isAtBotom) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ block: "end" });
        });
      }
    };

    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        scrollToBottomIfNeeded();
      }
    };

    el.addEventListener("load", onImageLoad, true);

    //  ResizeObserver watches for changes in the container size => when the container change size it triggers
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottomIfNeeded();
    });

    resizeObserver.observe(el);

    //  Mutation observer watches for DOM changes (e.g. , images loading, content update)
    const mutationObserver = new MutationObserver(() => {
      scrollToBottomIfNeeded();
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("load", onImageLoad, true);
      mutationObserver.disconnect();
    };
  }, [isAtBotom]);

  if (isLoading) return <ThreadSidebarSkeleton />;

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
      <div className="flex-1 overflow-y-auto relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto"
        >
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
                    <ThreadReply
                      key={reply.id}
                      message={reply}
                      selectedThreadId={selectedThreadId!}
                    />
                  ))}
                </div>
              </div>
              <div ref={bottomRef}></div>
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        {!isAtBotom && (
          <Button
            onClick={scrollToBottom}
            type="button"
            className="absolute bottom-0 m-4 right-5 z-20 size-10 rounded-full hover:shadow-xl transition-all duration-200"
            size="sm"
          >
            <ChevronDownIcon className="size-4" />
          </Button>
        )}
      </div>

      {/* Thread reply form */}
      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} user={user} />
      </div>
    </div>
  );
};

export default ThreadSideBar;
