import { createChannel, getChannel, listChannels } from "./channel";
import { inviteMember, listMembers } from "./member";
import { createMessage, listMessages } from "./message";
import { createWorkspace, listWorkspaces } from "./workspace";

export const router = {
  workspace: {
    list: listWorkspaces,
    create: createWorkspace,
    member: {
      invite: inviteMember,
      list: listMembers,
    },
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
