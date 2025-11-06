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
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { useAttachmentUpload } from "@/app/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { getAvatar } from "@/lib/helpers";
import { MessageListItem } from "@/lib/types";

interface iAppProps {
  channelId: string;
  user: KindeUser<Record<string, undefined>>;
}

type MessagePage = {
  items: Message[];
  nextCursor?: string;
};

type InfiniteMessages = InfiniteData<MessagePage>;

const MessgeInputForm = ({ channelId, user }: iAppProps) => {
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
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });
        const previousData = queryClient.getQueryData<InfiniteMessages>([
          "message.list",
          channelId,
        ]);
        const tempId = `optimistic-${crypto.randomUUID()}`;

        const optimisticMessage: MessageListItem = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: channelId,
          threadId: null,
          replyCount: 0,
          reactions: [], // ✅ Fix crash
        };

        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (existingData) => {
            if (!existingData)
              return {
                pages: [
                  {
                    items: [optimisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies InfiniteMessages;

            const firstPage = existingData.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };

            const updatedFirstPage = {
              ...firstPage,
              items: [optimisticMessage, ...firstPage.items],
            };

            return {
              ...existingData,
              pages: [updatedFirstPage, ...existingData.pages.slice(1)],
            };
          }
        );

        return {
          previousData,
          tempId,
        };
      },
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) {
              return old;
            }

            const updatedPages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((message) =>
                message.id === context.tempId
                  ? {
                      ...data,
                    }
                  : message
              ),
            }));

            return { ...old, pages: updatedPages };
          }
        );

        form.reset({
          channelId,
          content: "",
        });
        upload.clear();
        setEditorKey((k) => k + 1);

        toast.success("Message created");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["message.list", channelId],
            context.previousData
          );
        }

        return toast.error("Something went wrong");
      },
    })
  );

  function onSubmit(data: CreateMessageSchemaType) {
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
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
