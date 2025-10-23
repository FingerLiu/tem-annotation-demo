
import React from 'react';
import { Tool } from '../types';

interface ToolbarProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
}

const SelectIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const RectangleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
  </svg>
);

const PointIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4m-8-8h4m8 0h4m-4-4a4 4 0 100 8 4 4 0 000-8z"/>
    </svg>
);

const PolygonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
  </svg>
);


const tools: { id: Tool; name: string; icon: React.ReactNode }[] = [
  { id: 'select', name: 'Select', icon: <SelectIcon /> },
  { id: 'rectangle', name: 'Rectangle', icon: <RectangleIcon /> },
  { id: 'point', name: 'Point Marker', icon: <PointIcon /> },
  { id: 'polygon', name: 'Polygon', icon: <PolygonIcon /> },
];

const Toolbar: React.FC<ToolbarProps> = ({ selectedTool, onSelectTool }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-400 px-2">TOOLS</h3>
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors ${
            selectedTool === tool.id
              ? 'bg-cyan-500 text-white'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tool.icon}
          <span>{tool.name}</span>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;
