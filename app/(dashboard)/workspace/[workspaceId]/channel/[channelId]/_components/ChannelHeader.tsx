import { ModeToggle } from "@/components/theme-provider/ThemeSwitcher";
import React from "react";
import InviteMember from "./member/InviteMember";
import MembersOverview from "./member/MembersOverview";
interface ChnnelHeaderProp {
  channelName: string | undefined;
}

const ChannelHeader = ({ channelName }: ChnnelHeaderProp) => {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <h1 className="text-lg font-semibold">{channelName}</h1>

      <div className="flex items-center space-x-3">
        <MembersOverview />
        <InviteMember />
        <ModeToggle />
      </div>
    </div>
  );
};

export default ChannelHeader;
