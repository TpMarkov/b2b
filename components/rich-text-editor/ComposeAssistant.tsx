import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { SparkleIcon, SparklesIcon } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { eventIteratorToStream } from "@orpc/client";
import { client } from "@/lib/orpc";
import { Response } from "../ai-elements/response";
import { Skeleton } from "../ui/skeleton";

interface ComposeAssistantProps {
  content: string;
  onAccept?: (markdown: string) => void;
}

function ComposeAssistant({ content, onAccept }: ComposeAssistantProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(content);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const {
    messages,
    status,
    error,
    sendMessage,
    setMessages,
    stop,
    clearError,
  } = useChat({
    id: `compose-assistant`,
    transport: {
      async sendMessages(options) {
        return eventIteratorToStream(
          await client.ai.compose.generate(
            {
              content: contentRef.current,
            },
            { signal: options.abortSignal }
          )
        );
      },
      reconnectToStream() {
        throw new Error("Unsupported");
      },
    },
  });

  const lastAssistant = messages.findLast((m) => m.role === "assistant");
  const composedText =
    lastAssistant?.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n") ?? "";

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      const hasAssistantMessage = messages.some((m) => m.role === "assistant");

      if (status !== "ready" || hasAssistantMessage) {
        return;
      }

      sendMessage({
        text: "Rewrite",
      });
    } else {
      stop();
      clearError();
      setMessages([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 transition-all duration-300 ease-in-out relative overflow-hidden focus-visible:ring-2"
        >
          <span className="flex items-center gap-x-2 text-xs font-medium">
            <SparkleIcon className="size-3.5" />
            Compose
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[25rem] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-1.5 px-4 gap-3">
            <SparklesIcon className="size-3.5" />
            <span>Compose Assistant (Preview)</span>
          </div>
          {status === "streaming" && (
            <Button
              onClick={() => {
                stop();
              }}
            >
              Stop
            </Button>
          )}
        </div>
        <div className="px-4 py-3 max-h-80 overflow-y-auto">
          {error ? (
            <div>
              <p className="text-red-500 mb-2">{error.message}</p>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  clearError();
                  setMessages([]);
                  sendMessage({ text: "Compose Message" });
                }}
              >
                Try Again
              </Button>
            </div>
          ) : composedText ? (
            <Response parseIncompleteMarkdown={status !== "ready"}>
              {composedText}
            </Response>
          ) : status === "submitted" || status === "streaming" ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Click Compose to improve your message
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-3 py-2 bg-muted/30">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            onClick={() => {
              stop();
              setMessages([]);
              setOpen(false);
            }}
          >
            Decline
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="default"
            onClick={() => {
              if (!composedText) {
                return;
              }
              onAccept?.(composedText);
              stop();
              clearError();
              setMessages([]);
              setOpen(false);
            }}
            disabled={!composedText}
          >
            Accept
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ComposeAssistant;
