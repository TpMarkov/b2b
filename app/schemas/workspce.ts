import { z } from "zod";

export const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Add at least 2 chars")
    .max(50, "Name is too long. Max lenght - 50 chars"),
});

export type workspaceSchemaType = z.infer<typeof workspaceSchema>;
