import React, { useState, FormEvent } from "react";
import { FiSend, FiMic, FiMicOff } from "react-icons/fi";
import { useVoiceAgent } from "../../context/VoiceAgentContext";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading = false,
}) => {
  const [message, setMessage] = useState("");
  const { isVoiceActive, startVoiceAgent, stopVoiceAgent } = useVoiceAgent();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const toggleVoiceAgent = async () => {
    try {
      if (isVoiceActive) {
        stopVoiceAgent();
      } else {
        const sampleWhiteboard = {
          projectName: "Checkout Flow",
          components: [
            { id: "btn-pay", type: "button", text: "Pay", x: 120, y: 60 },
            { id: "txt-amount", type: "textbox", placeholder: "$0.00", x: 40, y: 60 },
            { id: "icon-card", type: "icon", name: "credit-card", x: 10, y: 55 }
          ],
          constraints: {
            stack: "React + Node 18",
            db: "Postgres",
            cloud: "AWS"
          },
          targetQPS: 75
        };
        await startVoiceAgent(sampleWhiteboard);
      }
    } catch (error) {
      console.error('Failed to toggle voice agent:', error);
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
          type="button"
          onClick={toggleVoiceAgent}
          className={`p-3 ${
            isVoiceActive
              ? "text-red-500 hover:bg-red-50"
              : "text-gray-500 hover:bg-gray-100"
          }`}
          title={isVoiceActive ? "Stop voice input" : "Start voice input"}
        >
          {isVoiceActive ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
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
        {isVoiceActive && " • Voice input active"}
      </div>
    </form>
  );
};

export default ChatInput; 