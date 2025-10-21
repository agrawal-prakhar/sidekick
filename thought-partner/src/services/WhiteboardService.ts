import { WhiteboardItem } from "../types";

// Whiteboard Service for parsing AI responses and calculating item positions

// Default dimensions for whiteboard items created from AI responses
const DEFAULT_DIMENSIONS: Record<
  WhiteboardItem["type"],
  { width: number; height: number }
> = {
  sticky: { width: 240, height: 200 },
  text: { width: 300, height: 150 },
  image: { width: 300, height: 200 },
  shape: { width: 150, height: 150 },
  connection: { width: 200, height: 100 },
  heading: { width: 400, height: 100 },
  bulletpoints: { width: 300, height: 200 },
  arrow: { width: 200, height: 50 },
  table: { width: 400, height: 250 },
};

// Commands recognized in chat that will trigger whiteboard item creation
const WHITEBOARD_COMMANDS = {
  CREATE_STICKY: /\[create sticky\](.*?)\[\/create sticky\]/is,
  CREATE_HEADING: /\[create heading\](.*?)\[\/create heading\]/is,
  CREATE_BULLETPOINTS:
    /\[create bulletpoints\](.*?)\[\/create bulletpoints\]/is,
  CREATE_TEXT: /\[create text\](.*?)\[\/create text\]/is,
  CREATE_TABLE: /\[create table\](.*?)\[\/create table\]/is,
};

/**
 * Parse agent responses for any whiteboard item creation commands
 * Returns both the cleaned message and any items to create
 */
export const parseAgentResponseForWhiteboardItems = (
  response: string
): {
  cleanedContent: string;
  whiteboardItems: Omit<WhiteboardItem, "id" | "createdAt" | "updatedAt">[];
} => {
  let cleanedContent = response;
  const whiteboardItems: Omit<
    WhiteboardItem,
    "id" | "createdAt" | "updatedAt"
  >[] = [];

  // Function to extract all matches for a specific command
  const extractAllItems = (
    commandRegex: RegExp,
    itemType: WhiteboardItem["type"]
  ) => {
    let matches;
    let content = cleanedContent;
    const regex = new RegExp(commandRegex); // Create a new regex to avoid issues with global flag

    // Find all matches
    while ((matches = regex.exec(content)) !== null) {
      if (matches && matches[1]) {
        const itemContent = matches[1].trim();
        whiteboardItems.push({
          type: itemType,
          position: { x: 100, y: 100 }, // Will be positioned properly later
          content: itemContent,
          width: DEFAULT_DIMENSIONS[itemType].width,
          height: DEFAULT_DIMENSIONS[itemType].height,
          createdBy: "agent",
        });

        // Remove the matched command from the content
        content = content.replace(matches[0], "");
      }
    }

    return content;
  };

  // Extract all sticky notes
  cleanedContent = extractAllItems(WHITEBOARD_COMMANDS.CREATE_STICKY, "sticky");

  // Extract all headings
  cleanedContent = extractAllItems(
    WHITEBOARD_COMMANDS.CREATE_HEADING,
    "heading"
  );

  // Extract all bulletpoints
  cleanedContent = extractAllItems(
    WHITEBOARD_COMMANDS.CREATE_BULLETPOINTS,
    "bulletpoints"
  );

  // Extract all text blocks
  cleanedContent = extractAllItems(WHITEBOARD_COMMANDS.CREATE_TEXT, "text");

  // Extract all tables
  cleanedContent = extractAllItems(WHITEBOARD_COMMANDS.CREATE_TABLE, "table");

  // If we found any commands to create items, add a note about it
  if (whiteboardItems.length > 0) {
    cleanedContent = cleanedContent.trim();
    if (cleanedContent.length > 0) {
      cleanedContent +=
        "\n\n(I've added some items to the whiteboard to help organize our thoughts.)";
    } else {
      cleanedContent =
        "I've added some items to the whiteboard to help organize our thoughts.";
    }
  }

  return { cleanedContent, whiteboardItems };
};

/**
 * Calculate positions for new whiteboard items to avoid overlap
 * and ensure they are visible in the viewport
 */
export const calculateItemPositions = (
  items: Omit<WhiteboardItem, "id" | "createdAt" | "updatedAt">[],
  existingItems: WhiteboardItem[],
  viewportWidth: number,
  viewportHeight: number
): Omit<WhiteboardItem, "id" | "createdAt" | "updatedAt">[] => {
  if (items.length === 0) return [];

  // Use a grid-like layout for better organization
  const margin = 20; // Space between items
  const columns = Math.min(3, items.length); // Max 3 columns
  const columnWidth = Math.floor((viewportWidth - margin) / columns) - margin;

  // Find a good starting position - avoid overlap with existing items if possible
  let startX = margin;
  let startY = margin;

  // If there are existing items, try to find empty space
  if (existingItems.length > 0) {
    // Simple approach - find the bottom of the last item and start there
    const lastItem = existingItems[existingItems.length - 1];
    startY = lastItem.position.y + (lastItem.height || 200) + margin;

    // If we're too far down, start at the top again but shift right
    if (startY > viewportHeight - 100) {
      startY = margin;
      startX = Math.min(viewportWidth - 300, lastItem.position.x + 300);
    }
  }

  return items.map((item, index) => {
    // Calculate grid position
    const column = index % columns;
    const row = Math.floor(index / columns);

    // Calculate position within the grid
    const x = startX + column * (columnWidth + margin);
    const y = startY + row * (Math.max(item.height || 200, 200) + margin);

    // Ensure the item is within viewport bounds
    const boundedX = Math.min(x, viewportWidth - (item.width || 200) - margin);
    const boundedY = Math.min(
      y,
      viewportHeight - (item.height || 200) - margin
    );

    // Create positioned item
    const newItem = {
      ...item,
      position: {
        x: Math.max(margin, boundedX),
        y: Math.max(margin, boundedY),
      },
    };

    return newItem;
  });
};
