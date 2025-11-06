import z from "zod";
import { base } from "../middlewares/base";

import { requiredAuthMiddleware } from "../middlewares/auth";
import { requiredWorkspaceMiddleware } from "../middlewares/workspaceMiddleware";

import prisma from "@/lib/db";

import { tipTapJsonToMarkdown } from "@/lib/json-to-markdown";

import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamToEventIterator } from "@orpc/client";

const openrouter = createOpenRouter({
  apiKey: process.env.LLM_KEY,
});

const MODEL_ID = "minimax/minimax-m2:free";
const model = openrouter.chat(MODEL_ID);

export const generateThreadSummary = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .route({
    method: "GET",
    path: "/ai/thread/summary",
    summary: "Generate thread summary",
    tags: ["Ai"],
  })
  .input(
    z.object({
      messageId: z.string(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const baseMessage = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        threadId: true,
        channelId: true,
      },
    });

    if (!baseMessage) throw errors.NOT_FOUND();

    const parentId = baseMessage.threadId ?? baseMessage.id;

    const parent = await prisma.message.findFirst({
      where: {
        id: parentId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        content: true,
        authorName: true,
        createdAt: true,
        replies: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorName: true,
          },
        },
      },
    });

    if (!parent) throw errors.NOT_FOUND();

    const replies = parent.replies.slice().reverse();
    const parentText = await tipTapJsonToMarkdown(parent.content);

    const lines = [];

    lines.push(
      `Thread Root - ${parent.authorName} - ${parent.createdAt.toISOString()}`
    );

    lines.push(parentText);

    if (replies.length > 0) {
      lines.push("\nReplies");

      for (const reply of replies) {
        const text = await tipTapJsonToMarkdown(reply.content);
        lines.push(
          `- ${reply.authorName} - ${reply.createdAt.toISOString()}: ${text}`
        );
      }
    }

    const compiled = lines.join("\n");

    const system = [
      "You are an expert asisstant summarizing Slack-like discussion threads for a product team.",
      "Use only the provided thread content; do not invent facts, names, or timelines.",
      "Output format (Markdown):",
      "-First, write single concise paragraph (2-4 sentences) that captures the thread purpose, key decisions, context, and blockers or next steps. No heading, no list, no intro text.",
      "-Then add a blank line followed by axactly 2-3 bullet points (using '-') with the most important takeaways. Each bullet is one sentence.",
      "Style: neutral, specific, and concise. Preserve terminology from the thread (names, acronyms). Avoid filler or meta-commentary. Do not add a closing sentence.",
      "If the context is insufficient, return a single-sentence summary and omit the bullet list..",
    ].join("\n");

    const result = streamText({
      model,
      system,
      messages: [{ role: "user", content: compiled }],
      temperature: 0.2,
    });

    return streamToEventIterator(result.toUIMessageStream());
  });
