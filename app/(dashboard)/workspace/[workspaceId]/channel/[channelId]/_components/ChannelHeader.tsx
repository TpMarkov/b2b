import { ModeToggle } from "@/components/theme-provider/ThemeSwitcher";
import React from "react";

const ChannelHeader = () => {
  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <h1 className="text-lg font-semibold"># Channel Header</h1>
      <div className="flex items-center space-x-2">
        <ModeToggle />
      </div>
    </div>
  );
};

export default ChannelHeader;
