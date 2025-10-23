
export type Tool = 'select' | 'rectangle' | 'point' | 'polygon';

export interface Point {
  x: number;
  y: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Polygon {
  points: Point[];
}

export type Shape = Rectangle | Point | Polygon;

export interface Annotation {
  id: string;
  type: Exclude<Tool, 'select'>;
  shape: Shape;
  label: string;
}
