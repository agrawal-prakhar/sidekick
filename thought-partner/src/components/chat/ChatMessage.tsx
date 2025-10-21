import React from "react";
import { ChatMessage as ChatMessageType } from "../../types";
import { formatDistanceToNow } from "date-fns";

// Chat Message component for displaying individual chat messages
// Handles both user and agent message styling and formatting

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAgent = message.role === "agent";

  return (
    <div className={`flex mb-4 ${isAgent ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl ${
          isAgent
            ? "bg-gray-100 text-gray-800 rounded-bl-none"
            : "bg-primary text-white rounded-br-none"
        }`}
      >
        <div className="flex items-center mb-1">
          <span className="font-semibold">
            {isAgent ? "Master Agent" : "You"}
          </span>
          <span className="text-xs opacity-70 ml-2">
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </span>
        </div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
