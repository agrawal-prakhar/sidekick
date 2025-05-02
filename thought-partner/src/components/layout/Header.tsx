import React from "react";
import { useWhiteboard } from "../../context/WhiteboardContext";

const Header: React.FC = () => {
  const { project, updateProject } = useWhiteboard();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProject({ name: e.target.value });
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-2xl font-bold text-primary mr-4">
          ThoughtPartner
        </div>
        <input
          type="text"
          value={project.name}
          onChange={handleNameChange}
          className="border-none focus:outline-none text-xl font-medium"
          placeholder="Untitled Project"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition">
          Share
        </button>
        <button className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition">
          Save
        </button>
      </div>
    </header>
  );
};

export default Header;
