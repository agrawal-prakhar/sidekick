import React, { useState } from 'react';
import { FiMic, FiMicOff, FiSend } from 'react-icons/fi';
import { useVoiceAgent } from '../../../src/context/VoiceAgentContext';
import { useWhiteboard } from '../../../src/context/WhiteboardContext';

// Chat Input component with voice and text input capabilities
// Handles message submission, voice agent toggling, and user interaction
// Integrates with both voice and whiteboard contexts for seamless functionality

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');
  const { isVoiceActive, startVoiceAgent, stopVoiceAgent } = useVoiceAgent();
  const { whiteboardItems } = useWhiteboard();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleVoiceAgent = async () => {
    if (isVoiceActive) {
      stopVoiceAgent();
    } else {
      try {
        await startVoiceAgent(whiteboardItems);
      } catch (error) {
        console.error('Failed to start voice agent:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 border rounded-lg resize-none"
        rows={1}
        disabled={isLoading}
      />
      <button
        type="button"
        onClick={toggleVoiceAgent}
        className={`p-2 rounded-full ${
          isVoiceActive ? 'bg-red-500 text-white' : 'bg-gray-200'
        }`}
        title={isVoiceActive ? 'Stop voice input' : 'Start voice input'}
        disabled={isLoading}
      >
        {isVoiceActive ? <FiMicOff /> : <FiMic />}
      </button>
      <button
        type="submit"
        className="p-2 bg-blue-500 text-white rounded-full disabled:opacity-50"
        disabled={!message.trim() || isLoading}
      >
        <FiSend />
      </button>
    </form>
  );
};

export default ChatInput;
