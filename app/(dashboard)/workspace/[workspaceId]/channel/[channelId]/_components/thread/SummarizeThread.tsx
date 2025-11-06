import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SparkleIcon } from "lucide-react";
import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Skeleton } from "@/components/ui/skeleton";

interface SummarizeThreadProps {
  messageId: string;
}

const SummarizeThread = ({ messageId }: SummarizeThreadProps) => {
  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    clearError,
    stop,
  } = useChat({
    id: `thread-summary:${messageId}`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.thread.summary.generate(
            { messageId },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  const [open, setOpen] = useState(false);

  const lastAssistant = messages.findLast((m) => m.role === "assistant");
  const summaryText =
    lastAssistant?.parts
      ?.filter((p) => p.type === "text")
      ?.map((p) => p.text)
      ?.join("\n\n") ?? "";

  // Handle opening/closing logic
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      // If already has a summary, just open the popover without re-fetching
      if (hasAssistantMessage || summaryText) return;

      // Otherwise, trigger AI summary generation
      if (status === "ready") {
        sendMessage({ text: "Summarize thread" });
      }
    } else {
      // Close popover cleanup
      stop();
      clearError();
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(!open)}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 transition-all duration-300 ease-in-out relative overflow-hidden focus-visible:ring-2"
        >
          <span className="flex items-center gap-x-2 text-xs font-medium">
            <SparkleIcon className="size-3.5" />
            Summarize
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={6}
        className="w-[380px] max-w-sm bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl rounded-xl border-none p-5 transition-opacity duration-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <SparkleIcon className="w-4 h-4" />
          <span className="font-semibold text-sm tracking-wide">
            AI Summary (Preview)
          </span>
        </div>

        <p className="text-xs text-white/90 leading-snug mb-4">
          This feature uses AI to summarize message threads into clear, concise
          highlights of key discussions and decisions.
        </p>

        {status === "streaming" && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={stop}
            className="mb-4"
          >
            Stop
          </Button>
        )}
        {/* add bg-muted-foreground to change summarized text bg */}
        <div className="px-3 py-2 max-h-80 overflow-y-auto text-sm rounded-lg bg-white/10 backdrop-blur-sm shadow-inner">
          {error ? (
            <div>
              <p className="text-red-300 mb-2">{error.message}</p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: "Summarize Thread" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : summaryText ? (
            <p className="whitespace-pre-wrap leading-relaxed text-white/95">
              {summaryText}
            </p>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-xs text-white/80">
              Click summarize to generate.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SummarizeThread;
