"use client";
import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import MessageComposer from "../message/MessageComposer";
import { useAttachmentUpload } from "@/app/hooks/use-attachment-upload";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/helpers";
import { MessageListItem } from "@/lib/types";
import { Zen_Old_Mincho } from "next/font/google";

interface ThreadReplyProps {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
}

const ThreadReplyForm = ({ threadId, user }: ThreadReplyProps) => {
  const { channelId } = useParams<{ channelId: string }>();
  const upload = useAttachmentUpload();
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId: channelId,
      threadId: threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createThreadReplyMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: {
            messageId: threadId,
          },
        });
        await queryClient.cancelQueries({
          queryKey: listOptions.queryKey,
        });

        type MessagePage = {
          items: Array<MessageListItem>;
          nextCursor?: string;
        };

        type InfiniteMessages = InfiniteData<MessagePage>;

        const previous = queryClient.getQueryData(listOptions.queryKey);

        const optimistic: Message = {
          id: `optimistic-${crypto.randomUUID()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name!,
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
        };

        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...old.messages, optimistic],
          };
        });

        // Optimisticly bump reliesCount in main message list for the parent message

        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((message) =>
                message.id === threadId
                  ? { ...message, repliesCount: message.repliesCount + 1 }
                  : message
              ),
            }));

            return {
              ...old,
              pages,
            };
          }
        );

        return {
          listOptions,
          previous,
        };
      },
      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx.listOptions.queryKey });
        form.reset({ channelId, content: "", threadId });
        upload.clear();
        setEditorKey((k) => k + 1);

        toast.success("Message created successfully");
      },

      onError: (_error, _vars, ctx) => {
        if (!ctx) return;

        const { listOptions, previous } = ctx;

        if (previous) {
          queryClient.setQueryData(listOptions.queryKey, previous);
        }

        toast.error(_error.message);
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
      <form
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            form.handleSubmit(onSubmit)();
          }
        }}
        onSubmit={form.control.handleSubmit(onSubmit)}
      >
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
                  isSubmiting={createThreadReplyMutation.isPending}
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
