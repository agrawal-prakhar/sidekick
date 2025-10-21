import React, { createContext, useContext, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { WhiteboardItem } from '../types';

// Voice Agent Context for managing Vapi integration and voice interactions

interface VoiceAgentContextType {
  isVoiceActive: boolean;
  startVoiceAgent: (whiteboardItems: WhiteboardItem[]) => Promise<void>;
  stopVoiceAgent: () => void;
  sendVoiceMessage: (text: string) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | null>(null);

export const useVoiceAgent = () => {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
};

const buildSystemPrompt = (basePrompt: string, whiteboardItems: WhiteboardItem[]) => {
  const whiteboardContext = JSON.stringify(whiteboardItems, null, 2);
  return `${basePrompt}

Current whiteboard context:
${whiteboardContext}

Please take this whiteboard context into account when responding. You can reference specific items on the whiteboard and suggest improvements or additions.`;
};

export const VoiceAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  const startVoiceAgent = useCallback(async (whiteboardItems: WhiteboardItem[]) => {
    try {
      // Initialize Vapi with your API key
      const vapiInstance = new Vapi(process.env.REACT_APP_VAPI_KEY || '');
      
      // Log events for debugging
      vapiInstance.on("message", (evt: any) => {
        console.log("[Vapi message]", evt);
      });

      const basePrompt =
        "You are a voice-based AI assistant for technical Product Managers. " +
        "Keep your responses short, clear, and voice-friendly. " +
        "Speak like a confident peer: casual, but never vague. " +
        "You can see the current state of the whiteboard and should reference it in your responses.";

      const assistantConfig = {
        name: "PM Assistant",
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2",
          language: "en-US" as const,
        },
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini" as const,
          messages: [
            {
              role: "system" as const,
              content: buildSystemPrompt(basePrompt, whiteboardItems),
            },
          ],
        },
        voice: {
          provider: "playht" as const,
          voiceId: "jennifer",
        }
      };

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the voice call
      await vapiInstance.start(assistantConfig);
      console.log("Voice call started");
      
      setVapi(vapiInstance);
      setIsVoiceActive(true);
    } catch (error) {
      console.error('Failed to start voice agent:', error);
      throw error;
    }
  }, []);

  const stopVoiceAgent = useCallback(() => {
    if (vapi) {
      vapi.stop();
      setVapi(null);
      setIsVoiceActive(false);
    }
  }, [vapi]);

  const sendVoiceMessage = useCallback((text: string) => {
    if (vapi) {
      vapi.send({
        type: "add-message",
        message: { role: "user", content: text },
      });
    }
  }, [vapi]);

  return (
    <VoiceAgentContext.Provider
      value={{
        isVoiceActive,
        startVoiceAgent,
        stopVoiceAgent,
        sendVoiceMessage,
      }}
    >
      {children}
    </VoiceAgentContext.Provider>
  );
}; 