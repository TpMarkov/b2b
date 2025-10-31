import prisma from "@/lib/db";
import { standartWriteSecurityMiddleware } from "../middlewares/arcjet/standart-write";
import { heavyWriteSecurityMiddleware } from "../middlewares/arcjet/write";
import { requiredAuthMiddleware } from "../middlewares/auth";
import { base } from "../middlewares/base";
import { requiredWorkspaceMiddleware } from "../middlewares/workspaceMiddleware";
import { z } from "zod";
import { createMessageSchema, updateMessageSchema } from "../schemas/message";
import { getAvatar } from "@/lib/helpers";
import { Message } from "@/lib/generated/prisma";
import { readSecurityMiddleware } from "../middlewares/arcjet/read";
import { threadId } from "worker_threads";

export const createMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standartWriteSecurityMiddleware)
  .use(heavyWriteSecurityMiddleware)
  .route({
    method: "POST",
    path: "/messages",
    summary: "Create a message",
    tags: ["Messages"],
  })
  .input(createMessageSchema)
  .output(z.custom<Message>())
  .handler(async ({ input, context, errors }) => {
    // verify channel belongs to organization
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });
    if (!channel) {
      throw errors.FORBIDDEN();
    }

    // If this is thread reply, validate parent message
    if (input.threadId) {
      const parentMessage = await prisma.message.findFirst({
        where: {
          id: input.threadId,
          Channel: {
            workspaceId: context.workspace.orgCode,
          },
        },
      });

      if (
        !parentMessage ||
        parentMessage.channelId !== input.channelId ||
        parentMessage.threadId !== null
      ) {
        throw errors.BAD_REQUEST();
      }
    }

    const created = await prisma.message.create({
      data: {
        channelId: input.channelId,
        content: input.content,
        imageUrl: input.imageUrl,
        threadId: input.threadId,
        authorId: context.user.id,
        authorEmail: context.user.email!,
        authorName: context.user.given_name ?? "John Doe",
        authorAvatar: getAvatar(context.user.picture, context.user.email!),
      },
    });
    return {
      ...created,
    };
  });

export const listMessages = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standartWriteSecurityMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages",
    summary: "List all messages",
    tags: ["Messages"],
  })
  .input(
    z.object({
      channelId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).optional(),
    })
  )
  .output(
    z.object({
      items: z.array(z.custom<Message>()),
      nextCursor: z.string().optional(),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const channel = await prisma.channel.findFirst({
      where: {
        id: input.channelId,
        workspaceId: context.workspace.orgCode,
      },
    });

    if (!channel) {
      throw errors.FORBIDDEN();
    }

    const limit = input.limit ?? 30;

    const messages = await prisma.message.findMany({
      where: {
        channelId: input.channelId,
        threadId: null,
      },
      ...(input.cursor
        ? {
            cursor: { id: input.cursor },
            skip: 1,
          }
        : {}),
      take: limit,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const nextCursor = messages.length
      ? messages[messages.length - 1].id
      : undefined;

    return {
      items: messages,
      nextCursor,
    };
  });

export const updateMessage = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(standartWriteSecurityMiddleware)
  .route({
    method: "PUT",
    path: "/messages/:messageId",
    summary: "Update message",
    tags: ["Messages"],
  })
  .input(updateMessageSchema)
  .output(
    z.object({
      message: z.custom<Message>(),
      canEdit: z.boolean(),
    })
  )
  .handler(async ({ context, input, errors }) => {
    const message = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!message) throw errors.NOT_FOUND();

    if (message.authorId !== context.user.id) {
      throw errors.FORBIDDEN();
    }

    const updated = await prisma.message.update({
      where: {
        id: input.messageId,
      },
      data: {
        content: input.content,
      },
    });

    return {
      message: updated,
      canEdit: updated.authorId === context.user.id,
    };
  });

export const listThreadReplies = base
  .use(requiredAuthMiddleware)
  .use(requiredWorkspaceMiddleware)
  .use(readSecurityMiddleware)
  .route({
    method: "GET",
    path: "/messages/:messageId/thread",
    summary: "List replies in a thread",
    tags: ["Messages"],
  })
  .input(
    z.object({
      messageId: z.string(),
    })
  )
  .output(
    z.object({
      parent: z.custom<Message>(),
      messages: z.array(z.custom<Message>()),
    })
  )
  .handler(async ({ input, context, errors }) => {
    const parentRow = await prisma.message.findFirst({
      where: {
        id: input.messageId,
        Channel: {
          workspaceId: context.workspace.orgCode,
        },
      },
    });

    if (!parentRow) throw errors.NOT_FOUND();
    //  Fetch replies
    const replies = await prisma.message.findMany({
      where: {
        threadId: input.messageId,
      },
      orderBy: [
        {
          createdAt: "asc",
        },
        { id: "asc" },
      ],
    });

    const parent = {
      ...parentRow,
    };

    const messages = replies.map((reply) => ({
      ...reply,
    }));

    return {
      parent,
      messages,
    };
  });
