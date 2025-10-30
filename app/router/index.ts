import { createChannel, getChannel, listChannels } from "./channel";
import { createMessage, listMessages } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
  },
  channel: {
    create: createChannel,
    get: getChannel,
    list: listChannels,
  },

  message: {
    create: createMessage,
    list: listMessages,
  },
};
