import React, { useState, useEffect, useRef } from "react";
import { WhiteboardItem as WhiteboardItemType } from "../../types";
import { useWhiteboard } from "../../context/WhiteboardContext";
import { motion } from "framer-motion";
import { FiX, FiEdit2, FiMove, FiCornerRightDown } from "react-icons/fi";
import { Resizable } from "re-resizable";

interface WhiteboardItemProps {
  item: WhiteboardItemType;
  maxWidth?: number;
  maxHeight?: number;
}

const WhiteboardItem: React.FC<WhiteboardItemProps> = ({
  item,
  maxWidth = 800,
  maxHeight = 800,
}) => {
  const { updateItem, deleteItem } = useWhiteboard();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(item.content);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentSize, setCurrentSize] = useState({
    width: item.width || 200,
    height: item.height || 200,
  });
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStartPoint, setArrowStartPoint] = useState(
    item.startPoint || { x: 0, y: 0 }
  );
  const [arrowEndPoint, setArrowEndPoint] = useState(
    item.endPoint || { x: 150, y: 0 }
  );
  const itemRef = useRef<HTMLDivElement>(null);

  // Ensure the component is fully mounted before enabling drag
  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  // Update local state when item changes (for example, when loaded from localStorage)
  useEffect(() => {
    setContent(item.content);
    setCurrentSize({
      width: item.width || 200,
      height: item.height || 200,
    });
  }, [item]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleContentBlur = () => {
    setIsEditing(false);
    updateItem(item.id, { content });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(item.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleContentClick = () => {
    if (!isEditing && !isDragging) {
      setIsEditing(true);
    }
  };

  const handleResize = (e: any, direction: any, ref: HTMLElement, d: any) => {
    const newWidth = Math.min(currentSize.width + d.width, maxWidth);
    const newHeight = Math.min(currentSize.height + d.height, maxHeight);

    setCurrentSize({
      width: newWidth,
      height: newHeight,
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    d: any
  ) => {
    const newWidth = Math.min(currentSize.width + d.width, maxWidth);
    const newHeight = Math.min(currentSize.height + d.height, maxHeight);

    updateItem(item.id, {
      width: newWidth,
      height: newHeight,
    });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (item.type === "image" && e.clipboardData.files.length > 0) {
      e.preventDefault();
      const file = e.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            updateItem(item.id, {
              content: event.target.result as string,
            });
            setContent(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const getBgColor = () => {
    if (item.color) return item.color;

    switch (item.type) {
      case "sticky":
        return "bg-yellow-100";
      case "text":
        return "bg-white";
      case "heading":
        return "bg-blue-50";
      case "bulletpoints":
        return "bg-green-50";
      case "shape":
        return "bg-blue-100";
      case "image":
        return "bg-transparent";
      case "connection":
        return "bg-green-100";
      case "arrow":
        return "bg-transparent";
      case "table":
        return "bg-white";
      default:
        return "bg-white";
    }
  };

  const handleArrowMouseDown = (e: React.MouseEvent) => {
    if (item.type !== "arrow" || isDragging) return;

    setIsDrawingArrow(true);
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setArrowStartPoint({ x, y });
    setArrowEndPoint({ x, y });

    document.addEventListener("mousemove", handleArrowMouseMove);
    document.addEventListener("mouseup", handleArrowMouseUp);
  };

  const handleArrowMouseMove = (e: MouseEvent) => {
    if (!isDrawingArrow || !itemRef.current) return;

    const svg = itemRef.current.querySelector("svg");
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = Math.min(Math.max(0, e.clientX - rect.left), currentSize.width);
    const y = Math.min(Math.max(0, e.clientY - rect.top), currentSize.height);

    setArrowEndPoint({ x, y });
  };

  const handleArrowMouseUp = () => {
    setIsDrawingArrow(false);
    document.removeEventListener("mousemove", handleArrowMouseMove);
    document.removeEventListener("mouseup", handleArrowMouseUp);

    updateItem(item.id, {
      startPoint: arrowStartPoint,
      endPoint: arrowEndPoint,
    });
  };

  const renderArrow = () => {
    const startX = arrowStartPoint.x;
    const startY = arrowStartPoint.y;
    const endX = arrowEndPoint.x;
    const endY = arrowEndPoint.y;

    return (
      <svg
        width="100%"
        height="100%"
        className="cursor-crosshair"
        onMouseDown={handleArrowMouseDown}
      >
        <defs>
          <marker
            id={`arrowhead-${item.id}`}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
          </marker>
        </defs>
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#000"
          strokeWidth="2"
          markerEnd={`url(#arrowhead-${item.id})`}
        />
        {isEditing && (
          <g>
            <circle
              cx={startX}
              cy={startY}
              r="6"
              fill="blue"
              stroke="white"
              strokeWidth="2"
              className="cursor-move"
              onMouseDown={(e) => {
                e.stopPropagation();
                // Handle start point dragging
                setIsDrawingArrow(true);
                document.addEventListener("mousemove", (evt) => {
                  if (!itemRef.current) return;
                  const svg = itemRef.current.querySelector("svg");
                  if (!svg) return;
                  const rect = svg.getBoundingClientRect();
                  const x = Math.min(
                    Math.max(0, evt.clientX - rect.left),
                    currentSize.width
                  );
                  const y = Math.min(
                    Math.max(0, evt.clientY - rect.top),
                    currentSize.height
                  );
                  setArrowStartPoint({ x, y });
                });
                document.addEventListener("mouseup", handleArrowMouseUp, {
                  once: true,
                });
              }}
            />
            <circle
              cx={endX}
              cy={endY}
              r="6"
              fill="blue"
              stroke="white"
              strokeWidth="2"
              className="cursor-move"
              onMouseDown={(e) => {
                e.stopPropagation();
                // Handle end point dragging
                setIsDrawingArrow(true);
                document.addEventListener("mousemove", (evt) => {
                  if (!itemRef.current) return;
                  const svg = itemRef.current.querySelector("svg");
                  if (!svg) return;
                  const rect = svg.getBoundingClientRect();
                  const x = Math.min(
                    Math.max(0, evt.clientX - rect.left),
                    currentSize.width
                  );
                  const y = Math.min(
                    Math.max(0, evt.clientY - rect.top),
                    currentSize.height
                  );
                  setArrowEndPoint({ x, y });
                });
                document.addEventListener("mouseup", handleArrowMouseUp, {
                  once: true,
                });
              }}
            />
          </g>
        )}
      </svg>
    );
  };

  const renderShape = () => {
    const shape = item.shapeType || "rectangle";

    switch (shape) {
      case "rectangle":
        return (
          <div
            className="w-full h-full border-2 border-blue-500 rounded-md flex items-center justify-center"
            onClick={handleContentClick}
          >
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                autoFocus
                className="w-3/4 h-3/4 p-2 bg-transparent focus:outline-none resize-none text-center"
              />
            ) : (
              <div className="text-center p-2">{content}</div>
            )}
          </div>
        );
      case "circle":
        return (
          <div
            className="w-full h-full rounded-full border-2 border-green-500 flex items-center justify-center"
            onClick={handleContentClick}
          >
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                autoFocus
                className="w-2/3 h-2/3 p-2 bg-transparent focus:outline-none resize-none text-center"
              />
            ) : (
              <div className="text-center p-2">{content}</div>
            )}
          </div>
        );
      case "triangle":
        return (
          <div className="w-full h-full relative" onClick={handleContentClick}>
            <div
              className="absolute inset-0"
              style={{
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                border: "2px solid #f59e0b",
                backgroundColor: "rgba(245, 158, 11, 0.1)",
              }}
            ></div>
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                autoFocus
                className="absolute bottom-1/4 left-1/4 w-1/2 h-1/3 p-2 bg-transparent focus:outline-none resize-none text-center"
              />
            ) : (
              <div className="absolute bottom-1/4 left-0 w-full text-center p-2">
                {content}
              </div>
            )}
          </div>
        );
      case "star":
        return (
          <div className="w-full h-full relative" onClick={handleContentClick}>
            <div
              className="absolute inset-0"
              style={{
                clipPath:
                  "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                border: "2px solid #ec4899",
                backgroundColor: "rgba(236, 72, 153, 0.1)",
              }}
            ></div>
            {isEditing ? (
              <textarea
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                autoFocus
                className="absolute top-1/3 left-1/4 w-1/2 h-1/3 p-2 bg-transparent focus:outline-none resize-none text-center"
              />
            ) : (
              <div className="absolute top-1/3 left-0 w-full text-center p-2">
                {content}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderTableContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={content}
          onChange={handleContentChange}
          onBlur={handleContentBlur}
          className="w-full h-full p-2 bg-transparent resize-none focus:outline-none"
          autoFocus
          placeholder="Use CSV format: cell1,cell2,cell3"
        />
      );
    }

    // Split content into rows and cells
    const rows = content.split("\n");

    return (
      <div className="overflow-auto h-full">
        <table className="min-w-full border-collapse">
          <tbody>
            {rows.map((row, rowIndex) => {
              const cells = row.split(",");
              return (
                <tr
                  key={rowIndex}
                  className={rowIndex === 0 ? "bg-gray-100" : ""}
                >
                  {cells.map((cell, cellIndex) => {
                    return rowIndex === 0 ? (
                      <th
                        key={cellIndex}
                        className="border border-gray-300 p-2 text-left"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={cellIndex}
                        className="border border-gray-300 p-2"
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={content}
          onChange={handleContentChange}
          onBlur={handleContentBlur}
          onPaste={handlePaste}
          autoFocus
          className="w-full h-full min-h-[100px] p-2 bg-transparent focus:outline-none border border-gray-300 rounded"
        />
      );
    }

    if (item.type === "image") {
      if (content.startsWith("data:image") || content.startsWith("http")) {
        return (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleContentClick}
          >
            <img
              src={content}
              alt="Image content"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        );
      } else {
        return (
          <div
            className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-100 text-gray-500"
            onClick={handleContentClick}
          >
            Click to paste an image
          </div>
        );
      }
    }

    if (item.type === "heading") {
      return (
        <div
          className="w-full h-full cursor-pointer p-2 overflow-auto"
          onClick={handleContentClick}
        >
          <div className="text-2xl font-bold">
            {content.replace(/^#+\s*/, "")}
          </div>
        </div>
      );
    }

    if (item.type === "bulletpoints") {
      return (
        <div
          className="w-full h-full cursor-pointer p-2 overflow-auto"
          onClick={handleContentClick}
        >
          <ul className="list-disc pl-5">
            {content.split("\n").map((line, index) => (
              <li key={index} className="mb-1">
                {line.replace(/^[•*-]\s*/, "")}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (item.type === "arrow") {
      return renderArrow();
    }

    if (item.type === "shape") {
      return renderShape();
    }

    if (item.type === "table") {
      return renderTableContent();
    }

    return (
      <div
        className="whitespace-pre-wrap cursor-pointer h-full overflow-auto p-2"
        onClick={handleContentClick}
      >
        {content}
      </div>
    );
  };

  // Skip standard rendering for arrow type
  if (item.type === "arrow") {
    return (
      <motion.div
        ref={itemRef}
        drag={isMounted && !isEditing}
        dragMomentum={false}
        dragElastic={0.1}
        whileDrag={{ scale: 1.02, opacity: 0.9 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          updateItem(item.id, {
            position: {
              x: item.position.x + info.offset.x,
              y: item.position.y + info.offset.y,
            },
          });
        }}
        style={{
          position: "absolute",
          left: item.position.x,
          top: item.position.y,
          zIndex: isDragging ? 10 : isHovered ? 5 : 1,
        }}
        transition={{ type: "spring", damping: 20 }}
        className="transition-shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Resizable
          size={currentSize}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          minWidth={100}
          minHeight={50}
          className="relative"
          handleComponent={{
            bottomRight: (
              <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize text-gray-400 flex justify-center items-center">
                <FiCornerRightDown size={14} />
              </div>
            ),
          }}
          handleClasses={{
            bottomRight:
              "absolute bottom-0 right-0 w-4 h-4 bg-transparent z-10",
          }}
        >
          {isHovered && (
            <div className="absolute top-0 right-0 flex space-x-1 bg-white rounded-md shadow-sm z-10">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          )}
          {renderArrow()}
        </Resizable>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={itemRef}
      drag={isMounted && !isEditing}
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.02, opacity: 0.9 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(_, info) => {
        setIsDragging(false);
        updateItem(item.id, {
          position: {
            x: item.position.x + info.offset.x,
            y: item.position.y + info.offset.y,
          },
        });
      }}
      style={{
        position: "absolute",
        left: item.position.x,
        top: item.position.y,
        zIndex: isDragging ? 10 : isHovered ? 5 : 1,
      }}
      transition={{ type: "spring", damping: 20 }}
      className="transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Resizable
        size={currentSize}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        minWidth={150}
        minHeight={100}
        className={`relative rounded-md shadow-md ${getBgColor()} ${
          item.createdBy === "agent" ? "border-2 border-primary" : ""
        } ${isHovered ? "shadow-lg" : "shadow-md"}`}
        handleComponent={{
          bottomRight: (
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize text-gray-400 flex justify-center items-center">
              <FiCornerRightDown size={14} />
            </div>
          ),
        }}
        handleClasses={{
          bottomRight: "absolute bottom-0 right-0 w-4 h-4 bg-transparent z-10",
        }}
      >
        <div className="h-full flex flex-col p-3">
          <div className="flex justify-between mb-2">
            <div className="text-xs font-medium text-gray-500 uppercase flex items-center">
              {isDragging ? <FiMove className="mr-1" size={12} /> : null}
              {item.type}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handleEdit}
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-500 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-auto">{renderContent()}</div>

          {isHovered && !isEditing && !isDragging && (
            <div className="absolute bottom-1 right-1 text-xs text-gray-400 italic">
              Click to edit • Drag to move • Resize from corner
            </div>
          )}
        </div>
      </Resizable>
    </motion.div>
  );
};

export default WhiteboardItem;
