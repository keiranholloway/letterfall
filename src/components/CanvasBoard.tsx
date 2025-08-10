// File: src/components/CanvasBoard.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import type { Board, Piece } from '../game/types';
import { getShapeCells } from '../game/shapes';

interface CanvasBoardProps {
  board: Board;
  activePiece?: Piece;
  width: number;
  height: number;
  className?: string;
}

const CELL_SIZE = 24;

export const CanvasBoard: React.FC<CanvasBoardProps> = ({
  board,
  activePiece,
  width,
  height,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up canvas properties
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw board background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#2d2d44';
    ctx.lineWidth = 1;
    
    for (let row = 0; row <= height; row++) {
      ctx.beginPath();
      ctx.moveTo(0, row * CELL_SIZE);
      ctx.lineTo(width * CELL_SIZE, row * CELL_SIZE);
      ctx.stroke();
    }
    
    for (let col = 0; col <= width; col++) {
      ctx.beginPath();
      ctx.moveTo(col * CELL_SIZE, 0);
      ctx.lineTo(col * CELL_SIZE, height * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw board cells
    for (let row = 0; row < Math.min(height, board.length); row++) {
      for (let col = 0; col < Math.min(width, board[row].length); col++) {
        const cell = board[row][col];
        drawCell(ctx, col, row, cell);
      }
    }
    
    // Draw active piece
    if (activePiece) {
      const cells = getShapeCells(activePiece.shape);
      cells.forEach(([r, c], index) => {
        const boardRow = activePiece.row + r;
        const boardCol = activePiece.col + c;
        
        if (boardRow >= 0 && boardRow < height && 
            boardCol >= 0 && boardCol < width) {
          const letter = activePiece.letters[index];
          drawActiveCell(ctx, boardCol, boardRow, letter);
        }
      });
    }
  }, [board, activePiece, width, height]);
  
  const drawCell = (
    ctx: CanvasRenderingContext2D, 
    col: number, 
    row: number, 
    cell: any
  ) => {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    if (cell.kind === 'empty') {
      return;
    }
    
    // Cell background
    let bgColor = '#4a4a6a';
    if (cell.kind === 'junk') bgColor = '#6a4a4a';
    if (cell.kind === 'wild') bgColor = '#6a6a4a';
    if (cell.kind === 'bomb') bgColor = '#6a4a6a';
    if (cell.marked) bgColor = '#ff6b6b';
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
    // Letter
    if (cell.ch) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        cell.ch,
        x + CELL_SIZE / 2,
        y + CELL_SIZE / 2
      );
    }
  };
  
  const drawActiveCell = (
    ctx: CanvasRenderingContext2D,
    col: number,
    row: number,
    letter: string
  ) => {
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    // Active piece background
    ctx.fillStyle = '#7c7cf0';
    ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    
    // Letter
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      letter,
      x + CELL_SIZE / 2,
      y + CELL_SIZE / 2
    );
  };
  
  useEffect(() => {
    draw();
  }, [draw]);
  
  useEffect(() => {
    // Set canvas size
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width * CELL_SIZE;
      canvas.height = height * CELL_SIZE;
    }
  }, [width, height]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-600 ${className}`}
      style={{
        imageRendering: 'pixelated',
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};