import React from "react";
import MessageItem from "./message/MessageItem";

const MessageList = () => {
  const messages = [
    {
      id: 1,
      message: "Hello how are you my friend",
      date: new Date(),
      avatar: "https://avatars.githubusercontent.com/u/195268847?v=4",
      username: "Tsvetan Markov",
    },
  ];
  return (
    <div className="relative h-full">
      <div className="h-full overflow-y-auto px-4">
        {messages.map((m) => (
          <MessageItem
            key={m.id}
            id={m.id}
            date={m.date}
            userName={m.username}
            avatar={m.avatar}
            message={m.message}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageList;
