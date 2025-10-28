"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "./message/MessageItem";
import { useInfiniteQuery } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const MessageList = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isAtBotom, setIsAtBottom] = useState(false);
  const [newMessages, setNewMessages] = useState(false);
  const lastItemIdRef = useRef<string | undefined>(undefined);

  const [hasInitialScroll, setHasInitialScroll] = useState(false);
  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId: channelId,
      cursor: pageParam,
      limit: 10,
    }),
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

        setNewMessages(false);
        setIsAtBottom(true);
      } else {
        setNewMessages(true);
      }
    }
    lastItemIdRef.current = lastId;
  }, [items]);

  useEffect(() => {
    if (!hasInitialScroll && data?.pages.length) {
      const el = scrollRef.current;

      if (el) {
        el.scrollTop = el.scrollHeight;
        setHasInitialScroll(true);
        setIsAtBottom(true);
      }
    }
  }, [hasInitialScroll, data?.pages.length]);

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

    el.scrollTop = el.scrollHeight;

    setNewMessages(false);
    setIsAtBottom(true);
  };

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-y-auto px-4 "
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {items?.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        <div ref={bottomRef}></div>
      </div>
      {newMessages && !isAtBotom ? (
        <Button
          onClick={() => {
            scrollToBottom();
          }}
          type="button"
          className="absolute bottom-4 right-8 rounded-full
        "
        >
          New Messages
        </Button>
      ) : null}
    </div>
  );
};

export default MessageList;
