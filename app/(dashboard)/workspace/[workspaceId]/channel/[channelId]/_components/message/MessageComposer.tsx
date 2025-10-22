import { CreateMessageSchemaType } from "@/app/schemas/message";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import { ImageIcon, SendIcon } from "lucide-react";
import React from "react";
interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmiting?: boolean;
}

const MessageComposer = ({
  value,
  onChange,
  onSubmit,
  isSubmiting,
}: iAppProps) => {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        sendButton={
          <Button
            type="button"
            size="sm"
            variant={"ghost"}
            onClick={onSubmit}
            disabled={isSubmiting}
          >
            <SendIcon className="size-4 mr-1" />
            Send
          </Button>
        }
        footerLeft={
          <Button type="button" size="sm" variant={"outline"}>
            <ImageIcon className="size-4 mr-1" />
            Attach
          </Button>
        }
      />
    </>
  );
};

export default MessageComposer;
