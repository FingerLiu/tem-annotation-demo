
import React, { useState, useEffect, useRef } from 'react';
import { Annotation } from '../types';

interface AnnotationListProps {
  annotations: Annotation[];
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onDeleteAnnotation: (id:string) => void;
  onUpdateLabel: (id: string, newLabel: string) => void;
}

const AnnotationItem: React.FC<{
  annotation: Annotation;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateLabel: (newLabel: string) => void;
}> = ({ annotation, isSelected, onSelect, onDelete, onUpdateLabel }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(annotation.label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isEditing]);
    
    const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    };
    
    const handleBlur = () => {
        setIsEditing(false);
        onUpdateLabel(label);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setLabel(annotation.label);
            setIsEditing(false);
        }
    };

    const getTypeColor = (type: Annotation['type']) => {
        switch (type) {
            case 'rectangle': return 'bg-yellow-500';
            case 'point': return 'bg-green-500';
            case 'polygon': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
      <div
        onClick={onSelect}
        onDoubleClick={() => setIsEditing(true)}
        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
          isSelected ? 'bg-gray-700' : 'hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
            <span className={`w-2 h-2 rounded-full ${getTypeColor(annotation.type)}`}></span>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={label}
                    onChange={handleLabelChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="bg-gray-600 text-white p-1 rounded-md text-sm w-full"
                />
            ) : (
                <span className="text-sm truncate" title={annotation.label}>{annotation.label}</span>
            )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>
    );
};


const AnnotationList: React.FC<AnnotationListProps> = ({ 
    annotations, 
    selectedAnnotationId, 
    onSelectAnnotation, 
    onDeleteAnnotation,
    onUpdateLabel
}) => {
  if (annotations.length === 0) {
    return <div className="text-center text-gray-500 text-sm mt-4">No annotations yet.</div>;
  }
  
  return (
    <div className="space-y-2">
       <h3 className="text-sm font-semibold text-gray-400 px-2 mt-4">ANNOTATIONS</h3>
      {annotations.map(ann => (
        <AnnotationItem 
            key={ann.id}
            annotation={ann}
            isSelected={ann.id === selectedAnnotationId}
            onSelect={() => onSelectAnnotation(ann.id)}
            onDelete={() => onDeleteAnnotation(ann.id)}
            onUpdateLabel={(newLabel) => onUpdateLabel(ann.id, newLabel)}
        />
      ))}
    </div>
  );
};

export default AnnotationList;
