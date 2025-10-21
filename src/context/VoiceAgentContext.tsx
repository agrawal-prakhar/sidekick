import React, { createContext, useContext, useState, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

// Voice Agent Context for managing Vapi integration and voice interactions

interface VoiceAgentContextType {
  isVoiceActive: boolean;
  startVoiceAgent: (designJson: any) => Promise<void>;
  stopVoiceAgent: () => void;
  sendVoiceMessage: (text: string) => void;
  updateDesignContext: (designJson: any) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

// Utility: build the system prompt dynamically from whiteboard JSON
function buildSystemPrompt(basePrompt: string, designJson: any) {
  const designPretty = JSON.stringify(designJson, null, 2);
  return `${basePrompt}

Here is the CURRENT DESIGN as JSON:
\`\`\`json
${designPretty}
\`\`\`
Please take that into account when asking clarifying questions or suggesting improvements.`;
}

export const VoiceAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [vapi, setVapi] = useState<Vapi | null>(null);

  const startVoiceAgent = useCallback(async (designJson: any) => {
    try {
      const vapiInstance = new Vapi(process.env.REACT_APP_VAPI_KEY || '');
      
      const basePrompt =
        "You are a voice-based AI assistant for technical Product Managers working " +
        "on complex software systems. Your role is to act as a collaborative design " +
        "partner who helps PMs think through their system architecture, understand " +
        "trade-offs, and make technically sound decisions. You should be highly fluent " +
        "in backend and frontend architecture, cloud infrastructure, databases, caching, " +
        "CI/CD, observability, and modern development practices. You are capable of having " +
        "deep technical conversations about scaling strategies, service boundaries, API design, " +
        "data models, event-driven systems, and deployment trade-offs.\n\n" +
        "Begin the conversation by asking what system or project the PM is currently working on. " +
        "Then, ask smart, targeted follow-up questions to understand the purpose of the system, " +
        "user flows, usage patterns, expected scale, tech constraints, and existing architectural " +
        "decisions. Do not offer suggestions prematurely — first gather all necessary context.\n\n" +
        "Once you understand the system in detail, provide thoughtful feedback and suggestions " +
        "to improve scalability, maintainability, cost-efficiency, or reliability. Offer alternatives " +
        "when appropriate (e.g. \"You could use Redis here, or maybe an in-memory cache if latency " +
        "is critical\"). Always back your suggestions with clear reasoning.\n\n" +
        "Your responses should be short, clear, and voice-friendly — like you're in a fast-paced " +
        "design meeting. Speak like a confident peer: casual, but never vague. Use real technical " +
        "language when necessary, and never over-explain basic concepts to a technical audience. " +
        "If the PM is uncertain or brainstorming, help them think through their ideas by summarizing, " +
        "reframing, or asking clarifying questions.\n\n" +
        "Avoid going off-topic. Your only job is to help the PM move toward a clearer, more technically " +
        "viable system design. Once the design seems solid or the PM indicates they're done, help " +
        "summarize the architecture and wrap up the conversation naturally. You are sharp, articulate, " +
        "and extremely efficient — like a world-class staff engineer who speaks in 30-second bursts.";

      const assistantConfig = {
        name: "PM Design Assistant (Voice)",
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2",
          language: "en-US" as const,
        },
        model: {
          provider: "openai" as const,
          model: "gpt-4.1" as const,
          messages: [
            {
              role: "system" as const,
              content: buildSystemPrompt(basePrompt, designJson),
            },
          ],
        },
        voice: {
          provider: "playht" as const,
          voiceId: "jennifer",
        },
        tools: [
          {
            type: "function",
            name: "create_whiteboard_element",
            description: "Draws a UI component on the shared whiteboard",
            parameters: {
              type: "object",
              properties: {
                component: { type: "string" },
                x: { type: "number" },
                y: { type: "number" },
              },
              required: ["component", "x", "y"],
            },
          },
        ],
      };

      await navigator.mediaDevices.getUserMedia({ audio: true });
      await vapiInstance.start(assistantConfig);
      
      // Handle tool calls for whiteboard updates
      vapiInstance.on("message", async (evt: any) => {
        if (evt.type === "tool-call" && evt.name === "create_whiteboard_element") {
          try {
            await fetch("/api/whiteboard", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(evt.arguments),
            });
          } catch (err) {
            console.error("Whiteboard update failed:", err);
          }
          // ACK back to Vapi
          vapiInstance.send({
            type: "add-message",
            message: { role: "assistant", content: "Tool call completed successfully" }
          });
        }
      });
      
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

  const updateDesignContext = useCallback((designJson: any) => {
    if (vapi) {
      const prompt = buildSystemPrompt(
        "Context update for the assistant. Keep helping the PM.",
        designJson
      );
      vapi.send({
        type: "add-message",
        message: { role: "system", content: prompt },
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
        updateDesignContext,
      }}
    >
      {children}
    </VoiceAgentContext.Provider>
  );
};

export const useVoiceAgent = () => {
  const context = useContext(VoiceAgentContext);
  if (context === undefined) {
    throw new Error('useVoiceAgent must be used within a VoiceAgentProvider');
  }
  return context;
}; 