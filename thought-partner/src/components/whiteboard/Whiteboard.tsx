import React, { useRef } from "react";
import WhiteboardItem from "./WhiteboardItem";
import WhiteboardToolbar from "./WhiteboardToolbar";
import { useWhiteboard } from "../../context/WhiteboardContext";
import { WhiteboardItem as WhiteboardItemType } from "../../types";
import { FiTrash2 } from "react-icons/fi";

const DEFAULT_CONTENT: Record<WhiteboardItemType["type"], string> = {
  sticky: "Add your notes here...",
  text: "Add text content here...",
  image: "Paste an image here or enter image URL...",
  shape: "Shape description...",
  connection: "Connection description...",
  heading: "# Main Heading",
  bulletpoints: "• First item\n• Second item\n• Third item",
  arrow: "→",
  table:
    "Header 1,Header 2,Header 3\nRow 1 Cell 1,Row 1 Cell 2,Row 1 Cell 3\nRow 2 Cell 1,Row 2 Cell 2,Row 2 Cell 3",
};

// Default width and height for different item types
const DEFAULT_DIMENSIONS: Record<
  WhiteboardItemType["type"],
  { width: number; height: number }
> = {
  sticky: { width: 200, height: 200 },
  text: { width: 300, height: 150 },
  image: { width: 300, height: 200 },
  shape: { width: 150, height: 150 },
  connection: { width: 200, height: 100 },
  heading: { width: 400, height: 100 },
  bulletpoints: { width: 300, height: 150 },
  arrow: { width: 200, height: 50 },
  table: { width: 400, height: 200 },
};

// Maximum allowed dimensions for resizing
const MAX_DIMENSIONS: Record<
  WhiteboardItemType["type"],
  { width: number; height: number }
> = {
  sticky: { width: 400, height: 600 },
  text: { width: 600, height: 800 },
  image: { width: 800, height: 800 },
  shape: { width: 400, height: 400 },
  connection: { width: 400, height: 200 },
  heading: { width: 800, height: 200 },
  bulletpoints: { width: 600, height: 800 },
  arrow: { width: 800, height: 200 },
  table: { width: 800, height: 600 },
};

const Whiteboard: React.FC = () => {
  const { whiteboardItems, addItem, deleteAllItems } = useWhiteboard();
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const handleAddItem = (type: WhiteboardItemType["type"]) => {
    const whiteboardEl = whiteboardRef.current;
    if (!whiteboardEl) return;

    // Calculate center position relative to the viewable area
    const rect = whiteboardEl.getBoundingClientRect();
    const scrollLeft = whiteboardEl.scrollLeft;
    const scrollTop = whiteboardEl.scrollTop;

    const x = rect.width / 2 + scrollLeft - DEFAULT_DIMENSIONS[type].width / 2;
    const y = rect.height / 2 + scrollTop - DEFAULT_DIMENSIONS[type].height / 2;

    // For arrow type, add start and end points
    const startPoint = type === "arrow" ? { x: 0, y: 0 } : undefined;
    const endPoint = type === "arrow" ? { x: 150, y: 0 } : undefined;

    // For shape type, default to rectangle unless specified
    const shapeType = type === "shape" ? "rectangle" : undefined;

    // For table type, default to 3x3
    const columns = type === "table" ? 3 : undefined;
    const rows = type === "table" ? 3 : undefined;

    addItem({
      type,
      position: { x, y },
      content: DEFAULT_CONTENT[type],
      width: DEFAULT_DIMENSIONS[type].width,
      height: DEFAULT_DIMENSIONS[type].height,
      createdBy: "user",
      startPoint,
      endPoint,
      shapeType,
      columns,
      rows,
    });
  };

  // Handle paste event at the whiteboard level to support direct image paste
  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      const file = e.clipboardData.files[0];

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const whiteboardEl = whiteboardRef.current;
            if (!whiteboardEl) return;

            // Calculate center position
            const rect = whiteboardEl.getBoundingClientRect();
            const scrollLeft = whiteboardEl.scrollLeft;
            const scrollTop = whiteboardEl.scrollTop;

            const x = rect.width / 2 + scrollLeft - 150;
            const y = rect.height / 2 + scrollTop - 100;

            addItem({
              type: "image",
              position: { x, y },
              content: event.target.result as string,
              width: 300,
              height: 200,
              createdBy: "user",
            });
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div
      className="flex-1 relative bg-gray-50 overflow-auto whiteboard-container"
      ref={whiteboardRef}
      onPaste={handlePaste}
      tabIndex={0} // Make div focusable to capture paste events
    >
      <div className="absolute inset-0 min-w-full min-h-full">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid-pattern" />

        {/* Whiteboard items */}
        {whiteboardItems.map((item) => (
          <WhiteboardItem
            key={item.id}
            item={item}
            maxWidth={MAX_DIMENSIONS[item.type].width}
            maxHeight={MAX_DIMENSIONS[item.type].height}
          />
        ))}
      </div>

      {/* Toolbar */}
      <WhiteboardToolbar onAddItem={handleAddItem} />

      {/* Clear All button */}
      {whiteboardItems.length > 0 && (
        <button
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to clear the whiteboard? This action cannot be undone."
              )
            ) {
              deleteAllItems();
            }
          }}
          className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center"
          title="Clear whiteboard"
        >
          <FiTrash2 size={20} />
        </button>
      )}
    </div>
  );
};

export default Whiteboard;
