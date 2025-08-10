// File: src/game/board.ts
import type { Board, Cell, Piece } from './types';
import { getShapeCells, rotateShape } from './shapes';

export function createEmptyBoard(width: number, height: number): Board {
  return Array(height).fill(null).map(() => 
    Array(width).fill(null).map((): Cell => ({ kind: 'empty' }))
  );
}

export function isValidPosition(board: Board, piece: Piece, row?: number, col?: number, rot?: number): boolean {
  const testRow = row ?? piece.row;
  const testCol = col ?? piece.col;
  const testShape = rot !== undefined ? getRotatedShape(piece.shape, rot) : piece.shape;
  
  const cells = getShapeCells(testShape);
  
  for (const [r, c] of cells) {
    const boardRow = testRow + r;
    const boardCol = testCol + c;
    
    // Check bounds
    if (boardRow < 0 || boardRow >= board.length || 
        boardCol < 0 || boardCol >= board[0].length) {
      return false;
    }
    
    // Check collision
    if (board[boardRow][boardCol].kind !== 'empty') {
      return false;
    }
  }
  
  return true;
}

function getRotatedShape(shape: any, rotations: number) {
  let rotated = shape;
  for (let i = 0; i < rotations; i++) {
    rotated = rotateShape(rotated);
  }
  return rotated;
}

export function placePiece(board: Board, piece: Piece): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const cells = getShapeCells(piece.shape);
  
  cells.forEach(([r, c], index) => {
    const boardRow = piece.row + r;
    const boardCol = piece.col + c;
    
    if (boardRow >= 0 && boardRow < newBoard.length && 
        boardCol >= 0 && boardCol < newBoard[0].length) {
      const letter = piece.letters[index];
      newBoard[boardRow][boardCol] = {
        kind: letter === '?' ? 'wild' : letter === '💣' ? 'bomb' : 'letter',
        ch: letter === '💣' ? undefined : letter
      };
    }
  });
  
  return newBoard;
}

export function canMoveDown(board: Board, piece: Piece): boolean {
  return isValidPosition(board, piece, piece.row + 1);
}

export function canMoveLeft(board: Board, piece: Piece): boolean {
  return isValidPosition(board, piece, undefined, piece.col - 1);
}

export function canMoveRight(board: Board, piece: Piece): boolean {
  return isValidPosition(board, piece, undefined, piece.col + 1);
}

export function canRotate(board: Board, piece: Piece): boolean {
  const newRot = (piece.rot + 1) % 4;
  return isValidPosition(board, piece, undefined, undefined, newRot);
}

export function getHardDropRow(board: Board, piece: Piece): number {
  let dropRow = piece.row;
  while (isValidPosition(board, piece, dropRow + 1)) {
    dropRow++;
  }
  return dropRow;
}

export function addJunkRows(board: Board, numRows: number, rng: any): Board {
  if (numRows <= 0) return board;
  
  const width = board[0].length;
  const newBoard = board.slice(numRows).map(row => row.map(cell => ({ ...cell })));
  
  // Add junk rows at bottom
  for (let i = 0; i < numRows; i++) {
    const junkRow: Cell[] = [];
    for (let j = 0; j < width; j++) {
      // Leave some gaps for counterplay
      if (rng.nextBool(0.1)) {
        junkRow.push({ kind: 'empty' });
      } else {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const letter = letters[rng.nextInt(letters.length)];
        junkRow.push({ kind: 'junk', ch: letter });
      }
    }
    newBoard.push(junkRow);
  }
  
  return newBoard;
}

export function clearMarkedCells(board: Board): Board {
  return board.map(row => 
    row.map(cell => 
      cell.marked ? { kind: 'empty' } : { ...cell, marked: false }
    )
  );
}

export function applyGravity(board: Board): Board {
  const newBoard: Board = Array(board.length).fill(null).map(() => 
    Array(board[0].length).fill(null).map((): Cell => ({ kind: 'empty' }))
  );
  
  // Apply gravity column by column
  for (let col = 0; col < board[0].length; col++) {
    let writeRow = board.length - 1;
    
    // Scan from bottom to top
    for (let row = board.length - 1; row >= 0; row--) {
      const cell = board[row][col];
      if (cell.kind !== 'empty') {
        newBoard[writeRow][col] = { ...cell };
        writeRow--;
      }
    }
  }
  
  return newBoard;
}