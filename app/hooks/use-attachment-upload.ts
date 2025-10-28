"use client";

import { useCallback, useMemo, useState } from "react";

export function useAttachmentUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isUploding, setIsUploading] = useState(false);

  const onUploaded = useCallback((url: string) => {
    setStagedUrl(url);
    setIsUploading(false);
    setIsOpen(false);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      onUploaded,
      isUploding,
      stagedUrl,
    }),
    [isOpen, setIsOpen, onUploaded, isUploding, stagedUrl]
  );
}

export type UseAttachmentUploadType = ReturnType<typeof useAttachmentUpload>;
