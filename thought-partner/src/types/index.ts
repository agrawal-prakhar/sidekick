// Type definitions for the Thought Partner application

// Whiteboard component types
export type WhiteboardItem = {
  id: string;
  type:
    | "sticky"
    | "text"
    | "image"
    | "shape"
    | "connection"
    | "heading"
    | "bulletpoints"
    | "arrow"
    | "table";
  position: { x: number; y: number };
  content: string;
  width?: number;
  height?: number;
  color?: string;
  createdBy: "user" | "agent";
  createdAt: Date;
  updatedAt: Date;
  // For shapes
  shapeType?: "rectangle" | "circle" | "triangle" | "star";
  // For arrows
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  // For tables
  columns?: number;
  rows?: number;
};

// Chat message types
export type MessageRole = "user" | "agent" | "system";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  relatedItems?: string[]; // IDs of whiteboard items related to this message
};

// Agent types
export type Agent = {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  capabilities: string[];
};

// Project types
export type Project = {
  id: string;
  name: string;
  description?: string;
  items: WhiteboardItem[];
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};
