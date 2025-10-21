import React, { useState } from "react";
import {
  FiFileText,
  FiType,
  FiImage,
  FiSquare,
  FiLink,
  FiList,
  FiArrowRight,
  FiMoreHorizontal,
  FiCircle,
  FiStar,
  FiTriangle,
  FiBold,
  FiGrid,
} from "react-icons/fi";

// Whiteboard Toolbar component for adding different types of items to the whiteboard
// Provides a comprehensive set of tools for creating various whiteboard elements

interface WhiteboardToolbarProps {
  onAddItem: (
    type:
      | "sticky"
      | "text"
      | "image"
      | "shape"
      | "connection"
      | "heading"
      | "bulletpoints"
      | "arrow"
      | "table"
  ) => void;
  selectedItemType: string | null;
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  onClick: () => void;
  isSelected?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  title,
  color,
  onClick,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 ${
        isSelected
          ? `bg-${color} text-white scale-110`
          : isHovered
          ? "bg-gray-100 scale-110"
          : ""
      } text-${color}`}
      title={title}
    >
      {icon}
      {isHovered && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          {title}
        </div>
      )}
    </button>
  );
};

const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  onAddItem,
  selectedItemType,
}) => {
  const [showShapes, setShowShapes] = useState(false);

  const handleAddItem = (
    type:
      | "sticky"
      | "text"
      | "image"
      | "shape"
      | "connection"
      | "heading"
      | "bulletpoints"
      | "arrow"
      | "table"
  ) => {
    console.log("Adding item:", type);
    onAddItem(type);
    if (showShapes) setShowShapes(false);
  };

  return (
    <div className="fixed top-20 left-4 bg-white rounded-lg shadow-md p-2 space-y-2 z-10">
      <ToolbarButton
        icon={<FiFileText size={20} />}
        title="Add Sticky Note"
        color="yellow-500"
        onClick={() => handleAddItem("sticky")}
        isSelected={selectedItemType === "sticky"}
      />
      <ToolbarButton
        icon={<FiType size={20} />}
        title="Add Text"
        color="gray-700"
        onClick={() => handleAddItem("text")}
        isSelected={selectedItemType === "text"}
      />
      <ToolbarButton
        icon={<FiBold size={20} />}
        title="Add Heading"
        color="blue-700"
        onClick={() => handleAddItem("heading")}
        isSelected={selectedItemType === "heading"}
      />
      <ToolbarButton
        icon={<FiList size={20} />}
        title="Add Bullet Points"
        color="green-700"
        onClick={() => handleAddItem("bulletpoints")}
        isSelected={selectedItemType === "bulletpoints"}
      />
      <ToolbarButton
        icon={<FiGrid size={20} />}
        title="Add Table"
        color="blue-600"
        onClick={() => handleAddItem("table")}
        isSelected={selectedItemType === "table"}
      />
      <ToolbarButton
        icon={<FiImage size={20} />}
        title="Add Image"
        color="purple-700"
        onClick={() => handleAddItem("image")}
        isSelected={selectedItemType === "image"}
      />
      <ToolbarButton
        icon={<FiArrowRight size={20} />}
        title="Add Arrow"
        color="red-500"
        onClick={() => handleAddItem("arrow")}
        isSelected={selectedItemType === "arrow"}
      />
      <div className="relative">
        <ToolbarButton
          icon={<FiMoreHorizontal size={20} />}
          title="Shapes"
          color="indigo-500"
          onClick={() => setShowShapes(!showShapes)}
          isSelected={selectedItemType === "shape"}
        />

        {showShapes && (
          <div className="absolute left-full top-0 ml-2 bg-white rounded-lg shadow-md p-2 grid grid-cols-2 gap-1">
            <ToolbarButton
              icon={<FiSquare size={20} />}
              title="Rectangle"
              color="blue-500"
              onClick={() => handleAddItem("shape")}
              isSelected={selectedItemType === "shape"}
            />
            <ToolbarButton
              icon={<FiCircle size={20} />}
              title="Circle"
              color="green-500"
              onClick={() => handleAddItem("shape")}
              isSelected={selectedItemType === "shape"}
            />
            <ToolbarButton
              icon={<FiTriangle size={20} />}
              title="Triangle"
              color="yellow-500"
              onClick={() => handleAddItem("shape")}
              isSelected={selectedItemType === "shape"}
            />
            <ToolbarButton
              icon={<FiStar size={20} />}
              title="Star"
              color="pink-500"
              onClick={() => handleAddItem("shape")}
              isSelected={selectedItemType === "shape"}
            />
          </div>
        )}
      </div>
      <ToolbarButton
        icon={<FiLink size={20} />}
        title="Add Connection"
        color="green-500"
        onClick={() => handleAddItem("connection")}
        isSelected={selectedItemType === "connection"}
      />
    </div>
  );
};

export default WhiteboardToolbar;
