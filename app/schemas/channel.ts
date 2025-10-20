import { z } from "zod";

export function transformChannelName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // remove invalid characters
    .replace(/-+/g, "-") // collapse multiple hyphens into one
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

export const channelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Channel name must be at least 2 chars")
    .max(50, "Chnnel must be at most 50 chars long")
    .transform((name, ctx) => {
      const transformed = transformChannelName(name);

      if (transformed.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel name must contain at least 2 characters after transformatioN",
        });

        return z.NEVER;
      }

      return transformed;
    }),
});

export type ChannelSchemaType = z.infer<typeof channelNameSchema>;
