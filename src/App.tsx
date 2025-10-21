import React, { useEffect } from "react";
import { WhiteboardProvider } from "./context/WhiteboardContext";
import { VoiceAgentProvider } from "./context/VoiceAgentContext";
import Layout from "./components/layout/Layout";
import Whiteboard from "./components/whiteboard/Whiteboard";
import ChatPanel from "./components/chat/ChatPanel";
import { useWhiteboard } from "./context/WhiteboardContext";

// Welcome component to add initial messages
const WelcomeMessages: React.FC = () => {
  const { chatMessages, addMessage } = useWhiteboard();

  useEffect(() => {
    // Only add welcome messages if there are no messages yet
    if (chatMessages.length === 0) {
      // Add welcome message
      addMessage({
        role: "agent",
        content:
          "Welcome to SideKick! I'm your PM assistant. To get started, try adding items to the whiteboard using the toolbar on the left, or ask me a question about product management. You can also use voice input by clicking the microphone icon in the chat input.",
        relatedItems: [],
      });

      // Add API key info message
      if (!process.env.REACT_APP_OPENAI_API_KEY) {
        addMessage({
          role: "agent",
          content:
            "Add your OpenAI API key to a .env file as REACT_APP_OPENAI_API_KEY for real AI functionality. Currently showing pre-written responses.",
          relatedItems: [],
        });
      }
    }
  }, [chatMessages.length, addMessage]);

  return null; // This component doesn't render anything
};

function AppContent() {
  return (
    <Layout>
      <div className="flex h-full">
        <Whiteboard />
        <ChatPanel />
      </div>
      <WelcomeMessages />
    </Layout>
  );
}

function App() {
  return (
    <WhiteboardProvider>
      <VoiceAgentProvider>
        <AppContent />
      </VoiceAgentProvider>
    </WhiteboardProvider>
  );
}

export default App; 