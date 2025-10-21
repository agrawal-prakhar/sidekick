import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { WhiteboardItem, ChatMessage, Project } from "../types";

// Whiteboard Context for managing whiteboard state and operations

interface WhiteboardContextProps {
  project: Project;
  whiteboardItems: WhiteboardItem[];
  chatMessages: ChatMessage[];
  addItem: (
    item: Omit<WhiteboardItem, "id" | "createdAt" | "updatedAt">
  ) => string;
  updateItem: (id: string, updates: Partial<WhiteboardItem>) => void;
  deleteItem: (id: string) => void;
  deleteAllItems: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateProject: (updates: Partial<Project>) => void;
}

const WhiteboardContext = createContext<WhiteboardContextProps | undefined>(
  undefined
);

export const useWhiteboard = () => {
  const context = useContext(WhiteboardContext);
  if (!context) {
    throw new Error("useWhiteboard must be used within a WhiteboardProvider");
  }
  return context;
};

// Local storage key for saving the project
const STORAGE_KEY = "thought-partner-project";

interface WhiteboardProviderProps {
  children: ReactNode;
}

export const WhiteboardProvider: React.FC<WhiteboardProviderProps> = ({
  children,
}) => {
  // Create a default project with unique ID
  const createDefaultProject = (): Project => ({
    id: uuidv4(),
    name: "New Project",
    description: "A new whiteboard project",
    items: [],
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Initialize project from localStorage or create a new one
  const [project, setProject] = useState<Project>(() => {
    try {
      const savedProject = localStorage.getItem(STORAGE_KEY);
      if (savedProject) {
        const parsedProject = JSON.parse(savedProject);

        // Convert string dates back to Date objects
        return {
          ...parsedProject,
          createdAt: new Date(parsedProject.createdAt),
          updatedAt: new Date(parsedProject.updatedAt),
          items: parsedProject.items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          })),
          messages: parsedProject.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        };
      }
    } catch (error) {
      console.error("Error loading project from localStorage:", error);
    }

    return createDefaultProject();
  });

  // Save to localStorage whenever project changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (error) {
      console.error("Error saving project to localStorage:", error);
    }
  }, [project]);

  // Use project's items and messages directly
  // instead of storing them separately to avoid sync issues
  const whiteboardItems = project.items;
  const chatMessages = project.messages;

  const addItem = (
    item: Omit<WhiteboardItem, "id" | "createdAt" | "updatedAt">
  ) => {
    const newItem: WhiteboardItem = {
      ...item,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProject((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      updatedAt: new Date(),
    }));

    return newItem.id;
  };

  const updateItem = (id: string, updates: Partial<WhiteboardItem>) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      ),
      updatedAt: new Date(),
    }));
  };

  const deleteItem = (id: string) => {
    setProject((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
      updatedAt: new Date(),
    }));
  };

  const deleteAllItems = () => {
    setProject((prev) => ({
      ...prev,
      items: [],
      updatedAt: new Date(),
    }));
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };

    setProject((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      updatedAt: new Date(),
    }));
  };

  const updateProject = (updates: Partial<Project>) => {
    setProject((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date(),
    }));
  };

  return (
    <WhiteboardContext.Provider
      value={{
        project,
        whiteboardItems,
        chatMessages,
        addItem,
        updateItem,
        deleteItem,
        deleteAllItems,
        addMessage,
        updateProject,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
};
