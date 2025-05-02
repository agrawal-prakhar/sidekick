import React, { useState, FormEvent } from "react";
import { FiSend } from "react-icons/fi";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-4"
    >
      <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask the Master Agent anything..."
          className="flex-1 px-4 py-2 resize-none h-12 max-h-40 focus:outline-none"
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`p-3 ${
            !message.trim() || isLoading
              ? "text-gray-400"
              : "text-primary hover:bg-gray-100"
          }`}
        >
          <FiSend size={20} />
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </form>
  );
};

export default ChatInput;
