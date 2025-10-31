import z from "zod";

export const createMessageSchema = z.object({
  channelId: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
});

export const updateMessageSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

export type CreateMessageSchemaType = z.infer<typeof createMessageSchema>;
export type UpdateMessageSchema = z.infer<typeof updateMessageSchema>;
