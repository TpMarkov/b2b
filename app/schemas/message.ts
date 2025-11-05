import { Message } from "react-hook-form";
import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
  threadId: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

export const toggleReactionSchema = z.object({
  messageId: z.string(),
  emoji: z.string().min(1),
});

export const GroupedReactionsSchema = z.object({
  emoji: z.string(),
  count: z.number(),
  reactedByMe: z.boolean(),
});
export type CreateMessageSchemaType = z.infer<typeof createMessageSchema>;
export type UpdateMessageSchema = z.infer<typeof updateMessageSchema>;
export type GroupedReactionsType = z.infer<typeof GroupedReactionsSchema>;
