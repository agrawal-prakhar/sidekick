import React, { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { useWhiteboard } from "../../context/WhiteboardContext";
import { generateAgentResponse } from "../../services/AIService";
import {
  parseAgentResponseForWhiteboardItems,
  calculateItemPositions,
} from "../../services/WhiteboardService";
import { FiMinimize2, FiMaximize2 } from "react-icons/fi";

const ChatPanel: React.FC = () => {
  const { chatMessages, addMessage, addItem, whiteboardItems, project } =
    useWhiteboard();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const whiteboardRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Get a reference to the whiteboard element
  useEffect(() => {
    whiteboardRef.current = document.querySelector(
      ".whiteboard-container"
    ) as HTMLDivElement;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage({
      role: "user",
      content,
      relatedItems: [],
    });

    // Generate agent response
    setIsLoading(true);
    try {
      const agentResponse = await generateAgentResponse(
        [
          ...chatMessages,
          { id: "temp", role: "user", content, timestamp: new Date() },
        ],
        project.description
      );

      // Parse response for any whiteboard item creation commands
      const { cleanedContent, whiteboardItems: newItems } =
        parseAgentResponseForWhiteboardItems(agentResponse);

      // Debug logs
      console.log("Original AI response:", agentResponse);
      console.log("Cleaned content:", cleanedContent);
      console.log("Detected whiteboard items:", newItems);

      // Add agent message with cleaned content (commands removed)
      addMessage({
        role: "agent",
        content: cleanedContent,
        relatedItems: [],
      });

      // Add any whiteboard items found in the response
      if (newItems.length > 0) {
        console.log("Adding whiteboard items:", newItems);

        // Fallback viewport dimensions if we can't get them from the ref
        const viewportWidth = whiteboardRef.current?.clientWidth || 800;
        const viewportHeight = whiteboardRef.current?.clientHeight || 600;

        // Debug the whiteboard reference and dimensions
        console.log("Whiteboard element:", whiteboardRef.current);
        console.log("Viewport dimensions:", {
          width: viewportWidth,
          height: viewportHeight,
        });

        // Calculate positions for new items
        const positionedItems = calculateItemPositions(
          newItems,
          whiteboardItems,
          viewportWidth,
          viewportHeight
        );

        // Add each item to the whiteboard
        positionedItems.forEach((item) => {
          addItem(item);
        });
      }
    } catch (error) {
      console.error("Error getting agent response:", error);

      // Add error message
      addMessage({
        role: "agent",
        content: "Sorry, I encountered an error. Please try again.",
        relatedItems: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div
      className={`flex flex-col bg-white border-l border-gray-200 transition-all duration-300 ${
        isMinimized ? "w-16" : "w-96"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className={`font-semibold ${isMinimized ? "hidden" : "block"}`}>
          Master Agent
        </h2>
        <button
          onClick={toggleMinimize}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        >
          {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p className="mb-2">Welcome to SideKick!</p>
                <p>Ask the Master Agent anything about your project.</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </>
      )}
    </div>
  );
};

export default ChatPanel;
