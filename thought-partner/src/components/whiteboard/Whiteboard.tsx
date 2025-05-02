import React, { useRef, useState } from "react";
import WhiteboardItem from "./WhiteboardItem";
import WhiteboardToolbar from "./WhiteboardToolbar";
import { useWhiteboard } from "../../context/WhiteboardContext";
import { WhiteboardItem as WhiteboardItemType } from "../../types";
import { FiTrash2, FiZoomIn, FiZoomOut, FiMaximize } from "react-icons/fi";

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

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

const Whiteboard: React.FC = () => {
  const { whiteboardItems, addItem, deleteAllItems } = useWhiteboard();
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const [selectedItemType, setSelectedItemType] = useState<
    WhiteboardItemType["type"] | null
  >(null);
  const [zoom, setZoom] = useState(1);

  const handleAddItem = (type: WhiteboardItemType["type"]) => {
    setSelectedItemType(type);
  };

  const handleWhiteboardClick = (e: React.MouseEvent) => {
    if (!selectedItemType || !whiteboardRef.current) return;

    // Get the click position relative to the whiteboard
    const rect = whiteboardRef.current.getBoundingClientRect();
    const scrollLeft = whiteboardRef.current.scrollLeft;
    const scrollTop = whiteboardRef.current.scrollTop;

    // Calculate the exact position where the user clicked, accounting for zoom
    const x =
      (e.clientX - rect.left + scrollLeft) / zoom -
      DEFAULT_DIMENSIONS[selectedItemType].width / 2;
    const y =
      (e.clientY - rect.top + scrollTop) / zoom -
      DEFAULT_DIMENSIONS[selectedItemType].height / 2;

    // For arrow type, add start and end points
    const startPoint =
      selectedItemType === "arrow" ? { x: 0, y: 0 } : undefined;
    const endPoint =
      selectedItemType === "arrow" ? { x: 150, y: 0 } : undefined;

    // For shape type, default to rectangle unless specified
    const shapeType = selectedItemType === "shape" ? "rectangle" : undefined;

    // For table type, default to 3x3
    const columns = selectedItemType === "table" ? 3 : undefined;
    const rows = selectedItemType === "table" ? 3 : undefined;

    addItem({
      type: selectedItemType,
      position: { x, y },
      content: DEFAULT_CONTENT[selectedItemType],
      width: DEFAULT_DIMENSIONS[selectedItemType].width,
      height: DEFAULT_DIMENSIONS[selectedItemType].height,
      createdBy: "user",
      startPoint,
      endPoint,
      shapeType,
      columns,
      rows,
    });

    // Reset the selected type after placing the item
    setSelectedItemType(null);
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

            // Calculate position based on center of viewport, accounting for zoom
            const rect = whiteboardEl.getBoundingClientRect();
            const scrollLeft = whiteboardEl.scrollLeft;
            const scrollTop = whiteboardEl.scrollTop;

            const x = (rect.width / 2 + scrollLeft) / zoom - 150;
            const y = (rect.height / 2 + scrollTop) / zoom - 100;

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

  // Define cursor style based on selected item
  const getCursorStyle = () => {
    if (!selectedItemType) return "default";
    switch (selectedItemType) {
      case "arrow":
        return "crosshair";
      case "sticky":
        return "cell";
      case "text":
        return "text";
      case "heading":
        return "text";
      case "bulletpoints":
        return "text";
      case "table":
        return "cell";
      default:
        return "copy";
    }
  };

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div
      className={`flex-1 relative bg-gray-50 overflow-auto whiteboard-container ${
        selectedItemType ? "cursor-" + getCursorStyle() : ""
      }`}
      ref={whiteboardRef}
      onPaste={handlePaste}
      onClick={handleWhiteboardClick}
      tabIndex={0} // Make div focusable to capture paste events
    >
      <div 
        className="absolute inset-0 min-w-full min-h-full"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          transition: 'transform 0.1s ease-out'
        }}
      >
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
      <WhiteboardToolbar
        onAddItem={handleAddItem}
        selectedItemType={selectedItemType}
      />

      {/* Selection mode indicator */}
      {selectedItemType && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-md p-2 z-10">
          <span className="text-sm font-medium">
            Click on the whiteboard to place a{" "}
            <span className="capitalize">{selectedItemType}</span>
            <button
              className="ml-2 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemType(null);
              }}
            >
              Cancel
            </button>
          </span>
        </div>
      )}

      {/* Bottom controls */}
      <div className="fixed left-4 bottom-4 flex items-center gap-2 bg-white rounded-lg shadow-md p-2 z-10">
        {/* Zoom controls */}
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Zoom out"
          disabled={zoom <= MIN_ZOOM}
        >
          <FiZoomOut />
        </button>
        <span className="text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Zoom in"
          disabled={zoom >= MAX_ZOOM}
        >
          <FiZoomIn />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="Reset zoom"
          disabled={zoom === 1}
        >
          <FiMaximize />
        </button>
      </div>

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
          className="fixed bottom-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-full bg-white shadow-md"
          title="Clear whiteboard"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
};

export default Whiteboard;
