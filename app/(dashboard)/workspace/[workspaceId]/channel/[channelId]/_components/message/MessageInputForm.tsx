"use client";
import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import MessageComposer from "./MessageComposer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useAttachmentUpload } from "@/app/hooks/use-attachment-upload";

interface iAppProps {
  channelId: string;
}

const MessgeInputForm = ({ channelId }: iAppProps) => {
  const queryClient = useQueryClient();
  const [editorKey, setEditorKey] = useState(0);
  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId: channelId,
      content: "",
    },
  });
  // const [isSubmiting, setIsSubmiting] = useState();

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: (newMessage) => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key(),
        });

        toast.success("Message created successfuly");
        setEditorKey((k) => k + 1);

        form.reset({ channelId, content: "" });
      },
      onError: () => {
        toast.error("Something went wrong");
      },
    })
  );

  function onSubmit(data: CreateMessageSchemaType) {
    console.log("Submitting", data);

    createMessageMutation.mutate(data);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
      >
        <FormField
          name="content"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  key={editorKey}
                  upload={upload}
                  value={field.value}
                  onChange={field.onChange}
                  onSubmit={() => {
                    onSubmit(form.getValues());
                  }}
                  isSubmiting={createMessageMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default MessgeInputForm;
