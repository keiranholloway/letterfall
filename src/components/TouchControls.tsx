// File: src/components/TouchControls.tsx
import React, { useCallback } from 'react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  disabled?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onSoftDrop,
  onHardDrop,
  disabled = false
}) => {
  const handleVibration = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const createHandler = useCallback((action: () => void) => {
    return () => {
      if (!disabled) {
        handleVibration();
        action();
      }
    };
  }, [disabled, handleVibration]);

  return (
    <div className="touch-controls bg-gray-900 p-4 flex justify-between items-center">
      <div className="flex gap-2">
        <button
          className="control-btn bg-gray-700 text-white p-3 rounded-lg text-xl font-bold min-w-[60px] h-[60px] flex items-center justify-center active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onTouchStart={createHandler(onMoveLeft)}
          onClick={createHandler(onMoveLeft)}
          disabled={disabled}
          aria-label="Move left"
        >
          ←
        </button>
        
        <button
          className="control-btn bg-gray-700 text-white p-3 rounded-lg text-xl font-bold min-w-[60px] h-[60px] flex items-center justify-center active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onTouchStart={createHandler(onRotate)}
          onClick={createHandler(onRotate)}
          disabled={disabled}
          aria-label="Rotate clockwise"
        >
          ↻
        </button>
        
        <button
          className="control-btn bg-gray-700 text-white p-3 rounded-lg text-xl font-bold min-w-[60px] h-[60px] flex items-center justify-center active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onTouchStart={createHandler(onMoveRight)}
          onClick={createHandler(onMoveRight)}
          disabled={disabled}
          aria-label="Move right"
        >
          →
        </button>
      </div>
      
      <div className="flex gap-2">
        <button
          className="control-btn bg-gray-700 text-white p-3 rounded-lg text-xl font-bold min-w-[60px] h-[60px] flex items-center justify-center active:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          onTouchStart={createHandler(onSoftDrop)}
          onClick={createHandler(onSoftDrop)}
          disabled={disabled}
          aria-label="Soft drop"
        >
          ↓
        </button>
        
        <button
          className="control-btn bg-blue-600 text-white p-3 rounded-lg text-xl font-bold min-w-[60px] h-[60px] flex items-center justify-center active:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onTouchStart={createHandler(onHardDrop)}
          onClick={createHandler(onHardDrop)}
          disabled={disabled}
          aria-label="Hard drop"
        >
          ⤓
        </button>
      </div>
    </div>
  );
};