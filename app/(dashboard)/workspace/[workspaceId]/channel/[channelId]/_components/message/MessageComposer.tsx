"use client";
import { UseAttachmentUploadType } from "@/app/hooks/use-attachment-upload";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import ImageUploadModal from "@/components/rich-text-editor/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { ImageIcon, SendIcon } from "lucide-react";

interface iAppProps {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  isSubmiting?: boolean;
  upload: UseAttachmentUploadType;
}

const MessageComposer = ({
  value,
  onChange,
  onSubmit,
  isSubmiting,
  upload,
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
          <Button
            type="button"
            size="sm"
            variant={"outline"}
            onClick={() => upload.setIsOpen(true)}
          >
            <ImageIcon className="size-4 mr-1" />
            Attach
          </Button>
        }
      />
      <ImageUploadModal
        open={upload.isOpen}
        onOpenChange={upload.setIsOpen}
        onUploaded={(url) => upload.onUploaded(url)}
      />
    </>
  );
};

export default MessageComposer;
