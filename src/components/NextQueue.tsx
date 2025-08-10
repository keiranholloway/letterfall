// File: src/components/NextQueue.tsx
import React from 'react';
import type { Shape } from '../game/types';
import { getShapeCells } from '../game/shapes';

interface NextQueueProps {
  queue: Shape[];
  maxShow?: number;
}

export const NextQueue: React.FC<NextQueueProps> = ({ 
  queue, 
  maxShow = 3 
}) => {
  const displayQueue = queue.slice(0, maxShow);

  return (
    <div className="next-queue bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white text-lg font-bold mb-3">Next</h3>
      <div className="space-y-3">
        {displayQueue.map((shape, index) => (
          <div key={index} className="next-piece">
            <ShapePreview shape={shape} />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ShapePreviewProps {
  shape: Shape;
}

const ShapePreview: React.FC<ShapePreviewProps> = ({ shape }) => {
  const cells = getShapeCells(shape);
  const maxRow = Math.max(...cells.map(([r]) => r));
  const maxCol = Math.max(...cells.map(([, c]) => c));
  
  return (
    <div 
      className="shape-preview grid gap-1 p-2"
      style={{
        gridTemplateColumns: `repeat(${maxCol + 1}, 1fr)`,
        gridTemplateRows: `repeat(${maxRow + 1}, 1fr)`
      }}
    >
      {Array.from({ length: (maxRow + 1) * (maxCol + 1) }, (_, i) => {
        const row = Math.floor(i / (maxCol + 1));
        const col = i % (maxCol + 1);
        const isActive = cells.some(([r, c]) => r === row && c === col);
        
        return (
          <div
            key={i}
            className={`w-4 h-4 rounded-sm ${
              isActive 
                ? 'bg-blue-500' 
                : 'bg-gray-700 opacity-30'
            }`}
          />
        );
      })}
    </div>
  );
};