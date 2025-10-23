
import React, { useState, useCallback, useRef } from 'react';
import { Annotation, Tool } from './types';
import Toolbar from './components/Toolbar';
import ImageAnnotator from './components/ImageAnnotator';
import AnnotationList from './components/AnnotationList';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );

const App: React.FC = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('rectangle');
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddAnnotation = useCallback((annotation: Omit<Annotation, 'id' | 'label'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann-${Date.now()}-${Math.random()}`,
      label: `Annotation ${annotations.length + 1}`,
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
  }, [annotations.length]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  }, [selectedAnnotationId]);

  const handleUpdateLabel = useCallback((id: string, newLabel: string) => {
    setAnnotations(prev =>
      prev.map(ann => (ann.id === id ? { ...ann, label: newLabel } : ann))
    );
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setImageSrc(result);
          setAnnotations([]);
          setSelectedAnnotationId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex h-screen w-full bg-gray-800 text-gray-200 font-sans">
      <aside className="w-72 bg-gray-900 p-4 flex flex-col border-r border-gray-700">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-cyan-400">TEM Annotation</h1>
          <p className="text-sm text-gray-400">Smart Preparation System</p>
        </header>
        <Toolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />

        <div className="mt-6 border-t border-gray-700 pt-4">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={triggerFileUpload}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                {imageSrc ? 'Change Image' : 'Upload Image'}
            </button>
        </div>

        <div className="flex-grow mt-6 overflow-y-auto">
          <AnnotationList
            annotations={annotations}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={setSelectedAnnotationId}
            onDeleteAnnotation={handleDeleteAnnotation}
            onUpdateLabel={handleUpdateLabel}
          />
        </div>
      </aside>

      <main className="flex-1 flex items-center justify-center p-4 bg-gray-800">
        {imageSrc ? (
            <ImageAnnotator
              imageSrc={imageSrc}
              annotations={annotations}
              tool={selectedTool}
              onAddAnnotation={handleAddAnnotation}
              selectedAnnotationId={selectedAnnotationId}
              onSelectAnnotation={setSelectedAnnotationId}
            />
        ) : (
            <div 
                className="flex flex-col items-center justify-center w-full h-full max-w-[1200px] max-h-[900px] border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-cyan-400 transition-colors"
                onClick={triggerFileUpload}
            >
                <UploadIcon />
                <p className="mt-4 text-lg text-gray-400">Click to upload an image</p>
                <p className="text-sm text-gray-500">Supported formats: PNG, JPG, WEBP, etc.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
