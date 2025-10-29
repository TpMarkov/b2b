import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

interface AttachmentChipProps {
  url: string;
  onRemove: () => void;
}

export default function AttachmentChip({ url, onRemove }: AttachmentChipProps) {
  return (
    <div className="group relative overflow-hidden size-12 rounded-md bg-muted">
      <Image src={url} alt="image-preview" fill className="onbject-cover" />
      <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
        <Button
          type="button"
          variant={"destructive"}
          className="size-6 p-0 rounded-full"
          onClick={onRemove}
        >
          <XIcon />
        </Button>
      </div>
    </div>
  );
}
