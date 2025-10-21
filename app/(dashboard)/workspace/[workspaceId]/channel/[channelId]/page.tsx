import React from "react";
import ChannelHeader from "./_components/ChannelHeader";
import MessageList from "./_components/MessageList";
import MessageInputForm from "./_components/message/MessageInputForm";

const ChannelPageMain = () => {
  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {/* Fixed Header */}
        <ChannelHeader />
        {/* Scrollable messages Area */}

        <div className="flex-1 mb-4 overflow-hidden">
          <MessageList />
        </div>
        {/* Fixed input */}
        <div className="border-t bg-background p-4">
          <MessageInputForm />
        </div>
      </div>
    </div>
  );
};

export default ChannelPageMain;
