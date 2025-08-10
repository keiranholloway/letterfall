// File: src/game/gravity.ts
import type { Board } from './types';
import { applyGravity } from './board';
import { findWords, markWordsForClear } from './wordFinder';
import { clearMarkedCells } from './board';

export interface CascadeResult {
  board: Board;
  wordsCleared: string[];
  cascadeCount: number;
}

export function processCascades(initialBoard: Board): CascadeResult {
  let board = initialBoard;
  let cascadeCount = 0;
  const allWordsCleared: string[] = [];
  
  while (true) {
    // Find words in current board state
    const words = findWords(board);
    
    if (words.length === 0) {
      break; // No more words to clear
    }
    
    // Mark words for clearing
    board = markWordsForClear(board, words);
    
    // Track cleared words
    words.forEach(word => allWordsCleared.push(word.word));
    
    // Clear marked cells
    board = clearMarkedCells(board);
    
    // Apply gravity
    board = applyGravity(board);
    
    cascadeCount++;
    
    // Safety check to prevent infinite loops
    if (cascadeCount > 20) {
      console.warn('Cascade limit reached');
      break;
    }
  }
  
  return {
    board,
    wordsCleared: allWordsCleared,
    cascadeCount
  };
}