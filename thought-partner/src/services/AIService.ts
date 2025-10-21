import OpenAI from "openai";
import { ChatMessage } from "../types";

// AI Service for handling OpenAI API calls and generating agent responses

// Check if OpenAI API key is available
const hasApiKey =
  process.env.REACT_APP_OPENAI_API_KEY &&
  process.env.REACT_APP_OPENAI_API_KEY.length > 0;

// Initialize OpenAI client only if API key is available
const openai = hasApiKey
  ? new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // This is for demo purposes only
    })
  : null;

// Sample responses for the demo mode (when no API key is provided)
const mockResponses = [
  "I think we should focus on user research first to better understand our target audience.",
  "Let's break down this feature into smaller, manageable tasks and prioritize them by business impact.",
  "Have you considered approaching this from a different angle? Maybe we could simplify the user flow.",
  "I suggest adding a section to document the technical requirements and constraints for this project.",
  "That's a great start! Let's also consider how this will integrate with our existing systems.",
  "We should define clear success metrics for this initiative before proceeding further.",
  "Let's create a roadmap with key milestones to track progress on this project.",
  "I recommend conducting a competitive analysis to see how other products solve this problem.",
  "This looks good! Let's also think about potential edge cases and how to handle them.",
  "Let's organize these ideas into themes to better structure our approach to this problem.",
];

// For testing whiteboard item creation
const debugCreateWhiteboardItems = (content: string): string => {
  // If the message contains a trigger word, return response with whiteboard creation commands
  const triggerWords = [
    "whiteboard",
    "organize",
    "create",
    "plan",
    "structure",
    "table",
  ];

  if (triggerWords.some((word) => content.toLowerCase().includes(word))) {
    // Return a response with whiteboard creation commands
    return `Let me help you organize those thoughts!

[create heading]Project Plan Overview[/create heading]

Here's how we might structure this project:

[create sticky]Key Project Goals
- Improve user engagement
- Increase conversion rate
- Reduce churn[/create sticky]

[create bulletpoints]• Phase 1: Research & Discovery
• Phase 2: Design & Prototyping
• Phase 3: Development
• Phase 4: Testing
• Phase 5: Launch & Monitoring[/create bulletpoints]

[create table]Project Timeline,Phase 1,Phase 2,Phase 3
Research,2 weeks,N/A,N/A
Design,1 week,3 weeks,N/A
Development,N/A,2 weeks,4 weeks
Testing,N/A,1 week,2 weeks[/create table]

[create text]This approach will help us maintain focus on our key objectives while ensuring we follow a structured methodology. Let me know if you'd like to adjust any of these phases or goals.[/create text]`;
  }

  return content; // Return original content if no trigger words found
};

export const generateAgentResponse = async (
  messages: ChatMessage[],
  projectContext?: string
): Promise<string> => {
  // Extract the last user message to check for testing keywords
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop();

  // Check if the user is explicitly requesting whiteboard items
  if (
    lastUserMessage &&
    (lastUserMessage.content
      .toLowerCase()
      .includes("create whiteboard items") ||
      lastUserMessage.content.toLowerCase().includes("add to whiteboard"))
  ) {
    return debugCreateWhiteboardItems(lastUserMessage.content);
  }

  // If no API key, return a mock response instead
  if (!hasApiKey || !openai) {
    console.log("Using mock AI response (no API key provided)");

    // Simple random selection from mock responses
    const randomIndex = Math.floor(Math.random() * mockResponses.length);

    // Add a short delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if we should create whiteboard items for this mock response
    const mockResponse = mockResponses[randomIndex];
    return debugCreateWhiteboardItems(mockResponse);
  }

  try {
    // Format messages for OpenAI API
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "agent" ? ("assistant" as const) : msg.role,
      content: msg.content,
    }));

    // Add project context if available
    if (projectContext) {
      formattedMessages.unshift({
        role: "system",
        content: `You are a Master Agent, a helpful thought partner for product managers. 
        You help with project planning, structuring thoughts, and ideation.
        You can edit items on the whiteboard to help organize information.
        
        You can create items on the whiteboard by using the following commands in your response:
        - [create sticky]content for sticky note[/create sticky]
        - [create heading]heading text[/create heading]
        - [create bulletpoints]• point 1\n• point 2\n• point 3[/create bulletpoints]
        - [create text]longer text content[/create text]
        - [create table]Header 1,Header 2,Header 3\nRow 1 Cell 1,Row 1 Cell 2,Row 1 Cell 3\nRow 2 Cell 1,Row 2 Cell 2,Row 2 Cell 3[/create table]
        
        Use these commands to help organize information visually on the whiteboard.
        Always create multiple components to represent different aspects of the information.
        For project planning, include at least one table with tasks, assignments, and timelines.
        For technical discussions, include code snippets and architecture diagrams.
        For user stories, include acceptance criteria and user flows.
        
        Context about the current project: ${projectContext}`,
      });
    } else {
      formattedMessages.unshift({
        role: "system",
        content: `You are a Master Agent, a helpful thought partner for product managers. 
        You help with project planning, structuring thoughts, and ideation.
        You can edit items on the whiteboard to help organize information.
        
        You can create items on the whiteboard by using the following commands in your response:
        - [create sticky]content for sticky note[/create sticky]
        - [create heading]heading text[/create heading]
        - [create bulletpoints]• point 1\n• point 2\n• point 3[/create bulletpoints]
        - [create text]longer text content[/create text]
        - [create table]Header 1,Header 2,Header 3\nRow 1 Cell 1,Row 1 Cell 2,Row 1 Cell 3\nRow 2 Cell 1,Row 2 Cell 2,Row 2 Cell 3[/create table]
        
        Use these commands to help organize information visually on the whiteboard.
        Always create multiple components to represent different aspects of the information.
        For project planning, include at least one table with tasks, assignments, and timelines.
        For technical discussions, include code snippets and architecture diagrams.
        For user stories, include acceptance criteria and user flows.`,
      });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Return the generated response
    return (
      response.choices[0]?.message?.content ||
      "I apologize, but I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error calling AI service:", error);
    return "Sorry, there was an error generating a response. Please try again.";
  }
};
