import React, { useState, useRef, MouseEvent, useCallback, useEffect } from 'react';
import { Annotation, Tool, Point, Rectangle, Polygon } from '../types';

interface ImageAnnotatorProps {
  imageSrc: string;
  annotations: Annotation[];
  tool: Tool;
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'label'>) => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
}

// --- Helper Functions and Renderers defined outside the main component ---

const getMousePosition = (e: MouseEvent, container: HTMLDivElement | null): Point | null => {
  if (!container) return null;
  const rect = container.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
};

const normalizeRect = (start: Point, end: Point): Rectangle => {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.abs(start.x - end.x);
  const height = Math.abs(start.y - end.y);
  return { x, y, width, height };
};

const AnnotationRenderer: React.FC<{
  annotation: Annotation;
  isSelected: boolean;
  // Fix: The onClick handler for an SVG element receives a MouseEvent.
  // The type was updated from `() => void` to `(e: React.MouseEvent) => void` to match the event handler signature.
  onClick: (e: React.MouseEvent) => void;
}> = ({ annotation, isSelected, onClick }) => {
  const baseStrokeWidth = isSelected ? 3 : 2;
  const selectionStyle = {
    filter: isSelected ? 'drop-shadow(0px 0px 8px #67e8f9)' : 'none',
  };

  switch (annotation.type) {
    case 'rectangle':
      const rect = annotation.shape as Rectangle;
      return (
        <rect
          {...rect}
          onClick={onClick}
          className="stroke-yellow-400 fill-yellow-500/30 cursor-pointer"
          strokeWidth={baseStrokeWidth}
          style={selectionStyle}
        />
      );
    case 'point':
      const point = annotation.shape as Point;
      const size = 12; // Length of the arms from the center box
      const boxSize = 4; // half size of the center box
      return (
          <g transform={`translate(${point.x}, ${point.y})`} onClick={onClick} className="cursor-pointer" style={selectionStyle}>
              {/* Center box */}
              <rect x={-boxSize} y={-boxSize} width={boxSize * 2} height={boxSize * 2} className="stroke-green-400 fill-transparent" strokeWidth={baseStrokeWidth / 2} />

              {/* Arms of the crosshair */}
              <line x1={-boxSize - size} y1="0" x2={-boxSize} y2="0" className="stroke-green-400" strokeWidth={baseStrokeWidth / 2} />
              <line x1={boxSize} y1="0" x2={boxSize + size} y2="0" className="stroke-green-400" strokeWidth={baseStrokeWidth / 2} />
              <line x1="0" y1={-boxSize - size} x2="0" y2={-boxSize} className="stroke-green-400" strokeWidth={baseStrokeWidth / 2} />
              <line x1="0" y1={boxSize} x2="0" y2={boxSize + size} className="stroke-green-400" strokeWidth={baseStrokeWidth / 2} />
          </g>
      );
    case 'polygon':
      const polygon = annotation.shape as Polygon;
      const pointsString = polygon.points.map(p => `${p.x},${p.y}`).join(' ');
      return (
        <polygon
          points={pointsString}
          onClick={onClick}
          className="stroke-purple-400 fill-purple-500/30 cursor-pointer"
          strokeWidth={baseStrokeWidth}
          style={selectionStyle}
        />
      );
    default:
      return null;
  }
};


// --- Main Component ---

const ImageAnnotator: React.FC<ImageAnnotatorProps> = ({
  imageSrc,
  annotations,
  tool,
  onAddAnnotation,
  selectedAnnotationId,
  onSelectAnnotation,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);

  const finishPolygon = useCallback(() => {
    if (polygonPoints.length > 2) {
      onAddAnnotation({ type: 'polygon', shape: { points: polygonPoints } });
    }
    setPolygonPoints([]);
    setIsDrawing(false);
  }, [polygonPoints, onAddAnnotation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsDrawing(false);
            setStartPoint(null);
            setCurrentPoint(null);
            setPolygonPoints([]);
        } else if (e.key === 'Enter' && tool === 'polygon' && isDrawing) {
            finishPolygon();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tool, isDrawing, finishPolygon]);

  const handleMouseDown = (e: MouseEvent) => {
    const pos = getMousePosition(e, containerRef.current);
    if (!pos) return;

    if (tool === 'select') {
        onSelectAnnotation(null);
        return;
    }

    e.preventDefault();

    if (tool === 'rectangle') {
      setIsDrawing(true);
      setStartPoint(pos);
      setCurrentPoint(pos);
    } else if (tool === 'point') {
      onAddAnnotation({ type: 'point', shape: pos });
    } else if (tool === 'polygon') {
      setIsDrawing(true);
      setPolygonPoints(prev => [...prev, pos]);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    const pos = getMousePosition(e, containerRef.current);
    if (!pos) return;

    if (isDrawing) {
      setCurrentPoint(pos);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDrawing || !startPoint || !currentPoint || tool !== 'rectangle') {
      return;
    }

    setIsDrawing(false);
    const finalRect = normalizeRect(startPoint, currentPoint);
    if (finalRect.width > 2 && finalRect.height > 2) { // Minimum size
      onAddAnnotation({ type: 'rectangle', shape: finalRect });
    }
    setStartPoint(null);
    setCurrentPoint(null);
  };
  
  const handleDoubleClick = (e: MouseEvent) => {
    if (tool === 'polygon' && isDrawing) {
        e.preventDefault();
        finishPolygon();
    }
  };

  const renderDrawingPreview = () => {
    if (!isDrawing) return null;

    if (tool === 'rectangle' && startPoint && currentPoint) {
      const rect = normalizeRect(startPoint, currentPoint);
      return <rect {...rect} className="stroke-yellow-400 fill-yellow-500/10 stroke-dasharray-4" strokeWidth="2" />;
    }

    if (tool === 'polygon' && polygonPoints.length > 0 && currentPoint) {
      const points = [...polygonPoints, currentPoint];
      const lines = [];
      for(let i=0; i<points.length -1; i++){
          lines.push(<line key={i} x1={points[i].x} y1={points[i].y} x2={points[i+1].x} y2={points[i+1].y} className="stroke-purple-400" strokeWidth="2" strokeDasharray="4" />)
      }
      return (
        <g>
            {lines}
            {polygonPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-purple-400" />)}
        </g>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full max-w-[1200px] max-h-[900px] rounded-lg overflow-hidden bg-black shadow-2xl cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <img src={imageSrc} alt="TEM Sample" className="w-full h-full object-contain pointer-events-none select-none" />
      <svg className="absolute top-0 left-0 w-full h-full">
        {annotations.map(ann => (
          <AnnotationRenderer
            key={ann.id}
            annotation={ann}
            isSelected={ann.id === selectedAnnotationId}
            onClick={(e) => { e.stopPropagation(); onSelectAnnotation(ann.id); }}
          />
        ))}
        {renderDrawingPreview()}
      </svg>
      {tool === 'polygon' && isDrawing && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-3 py-1 rounded-full">
        Click to add points. Double-click or Press Enter to finish. Press Esc to cancel.
      </div>}
    </div>
  );
};

export default ImageAnnotator;
