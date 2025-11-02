"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "./message/MessageItem";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/general/EmptyState";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";

const MessageList = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBotom, setIsAtBottom] = useState(false);
  const lastItemIdRef = useRef<string | undefined>(undefined);

  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId: channelId,
      cursor: pageParam,
      limit: 10,
    }),
    queryKey: ["message.list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((p) => ({
          ...p,
          items: [...p.items].reverse(),
        }))
        .reverse(),
      pageParam: [...data.pageParams].reverse(),
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const items = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const isEmpty = !isLoading && items.length === 0;

  useEffect(() => {
    if (!items.length) return;

    const lastId = items[items.length - 1].id;

    const prevLastId = lastItemIdRef.current;

    const el = scrollRef.current;

    if (prevLastId && lastId !== prevLastId) {
      if (el && isNearbottom(el)) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });
        setIsAtBottom(true);
      }
    }
    lastItemIdRef.current = lastId;
  }, [items]);

  //  Scroll to the bottom when messages first load
  useEffect(() => {
    if (!hasInitialScroll && data?.pages.length) {
      const el = scrollRef.current;

      if (el) {
        bottomRef.current?.scrollIntoView({ block: "end" });
        setHasInitialScroll(true);
        setIsAtBottom(true);
      }
    }
  }, [hasInitialScroll, data?.pages.length]);

  //  Keep view pinned to bottom on late content growth (e.g images)
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const scrollToBottomIfNeeded = () => {
      if (isAtBotom || !hasInitialScroll) {
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
  }, [hasInitialScroll, isAtBotom]);

  const isNearbottom = (el: HTMLDivElement) =>
    el.scrollHeight - el.scrollTop - el.clientHeight <= 80;

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    if (el.scrollTop <= 80 && hasNextPage && !isFetching) {
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;
      fetchNextPage().then(() => {
        const newScrollHeight = el.scrollHeight;

        el.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
    }

    setIsAtBottom(isNearbottom(el));
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;

    if (!el) return;

    bottomRef.current?.scrollIntoView({ block: "end" });

    setIsAtBottom(true);
  };

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-y-auto px-4 flex flex-col space-y-1"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isEmpty ? (
          <div className="flex h-full pt-4">
            <EmptyState
              title="No messages yet"
              description="Start the conversation by sending the first message"
              buttonText="Send a message"
              href="#"
            />
          </div>
        ) : (
          items?.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={user.id}
            />
          ))
        )}
        <div ref={bottomRef}></div>
      </div>
      {isFetching && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-center py-2">
          <div className="flex items-center gap-2 rounded-md bg-gradient-to-b from-white/80 to-transparent dark:from-neutral-900/80 backdrop-blur px-3 py-1">
            <Loader2Icon className="size-4 animate-spin text-primary" />
            <span>Loading previous messages...</span>
          </div>
        </div>
      )}

      {!isAtBotom && (
        <Button
          onClick={scrollToBottom}
          type="button"
          className="absolute bottom-0 m-2 right-5 z-20 size-10 rounded-full hover:shadow-xl transition-all duration-200"
          size="sm"
        >
          <ChevronDownIcon className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageList;
