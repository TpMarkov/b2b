"use client";
import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import MessageComposer from "../message/MessageComposer";
import { useAttachmentUpload } from "@/app/hooks/use-attachment-upload";
import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { errorMonitor } from "events";
import { getAvatar } from "@/lib/helpers";

interface ThreadReplyProps {
  threadId: string;
}

const ThreadReplyForm = ({ threadId }: ThreadReplyProps) => {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });

  const createThreadReplyMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        form.reset({ channelId, content: "", threadId });

        upload.clear();
        setEditorKey((k) => k + 1);

        toast.success("It's all good broskins");
      },
      onMutate: () => {},
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const onSubmit = (data: CreateMessageSchemaType) => {
    createThreadReplyMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  };
  return (
    <Form {...form}>
      <form onSubmit={form.control.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  onSubmit={() => onSubmit(form.getValues())}
                  value={field.value}
                  upload={upload}
                  onChange={field.onChange}
                  key={editorKey}
                />
              </FormControl>
            </FormItem>
          )}
        ></FormField>
      </form>
    </Form>
  );
};

export default ThreadReplyForm;
