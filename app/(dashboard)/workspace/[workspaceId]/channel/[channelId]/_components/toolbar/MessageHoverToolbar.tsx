import { Button } from "@/components/ui/button";
import { useThread } from "@/providers/ThreadProvider";
import { MessageSquareIcon, PencilIcon } from "lucide-react";
import React from "react";

interface toolbarProps {
  messageId: string;
  canEdit: boolean;
  onEdit: () => void;
}
const MessageHoverToolbar = ({ canEdit, messageId, onEdit }: toolbarProps) => {
  const { togleThread } = useThread();
  return (
    <div
      className="absolute -right-2 -top-3 items-center gap-1 rounded-md border border-gray-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur-md transition-opacity opacity-0 group-hover:opacity-100 mt-2
        dark:border-neutral-800 dark:bg-neutral-900/90"
    >
      {canEdit && (
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <PencilIcon className="size-4" />
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => togleThread(messageId)}
      >
        <MessageSquareIcon className="size-4" />
      </Button>
    </div>
  );
};

export default MessageHoverToolbar;
