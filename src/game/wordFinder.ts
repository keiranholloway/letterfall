// File: src/game/wordFinder.ts
import type { Board, Cell, WordMatch } from './types';
import { WILDCARD_CHAR } from './letters';

let wordSet: Set<string> = new Set();

export async function loadDictionary(): Promise<void> {
  try {
    // Try multiple possible paths for the dictionary file
    const possiblePaths = [
      '/letterfall/words.txt',
      '/letterfall/assets/words.txt',
      'words.txt',
      'assets/words.txt'
    ];
    
    let loaded = false;
    for (const path of possiblePaths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const text = await response.text();
          const words = text.trim().split('\n').map(w => w.trim().toUpperCase());
          wordSet = new Set(words);
          console.log(`Dictionary loaded from ${path} with ${words.length} words`);
          loaded = true;
          break;
        }
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    if (!loaded) {
      throw new Error('No dictionary path worked');
    }
  } catch (error) {
    console.warn('Failed to load dictionary, using fallback:', error);
    // Fallback word list - expanded for better gameplay
    wordSet = new Set([
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
      'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW',
      'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY',
      'DID', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'MAN', 'GOT', 'HIM',
      'BAD', 'BIG', 'CAT', 'DOG', 'EAR', 'EYE', 'FAR', 'FUN', 'GUN', 'HAD',
      'JOB', 'KEY', 'LAW', 'LOT', 'MAP', 'NET', 'OIL', 'PAN', 'RED', 'RUN',
      'SUN', 'TAX', 'TOP', 'VAN', 'WAR', 'WIN', 'YES', 'ZOO', 'ACE', 'AGE',
      'ARM', 'ART', 'BAG', 'BAR', 'BAT', 'BED', 'BEE', 'BOX', 'BUS', 'CAR',
      'COW', 'CUP', 'EGG', 'END', 'FAN', 'FLY', 'FOX', 'GAS', 'HAT', 'ICE',
      'JAM', 'JOY', 'KID', 'LEG', 'LIP', 'MOM', 'MUD', 'NUT', 'PEN', 'PIG',
      'RAT', 'SEA', 'SKY', 'TEA', 'TOY', 'TREE', 'WORD', 'GAME', 'PLAY', 'TIME'
    ]);
    console.log('Using fallback dictionary with', wordSet.size, 'words');
  }
}

export function isValidWord(word: string): boolean {
  return word.length >= 3 && wordSet.has(word.toUpperCase());
}

export function findWords(board: Board): WordMatch[] {
  const words: WordMatch[] = [];
  
  // Find horizontal words
  for (let row = 0; row < board.length; row++) {
    const horizontalWords = findWordsInLine(board[row], row, 'horizontal');
    words.push(...horizontalWords);
  }
  
  // Find vertical words
  for (let col = 0; col < board[0].length; col++) {
    const column = board.map(row => row[col]);
    const verticalWords = findWordsInLine(column, col, 'vertical');
    words.push(...verticalWords);
  }
  
  // Debug logging
  if (words.length > 0) {
    const horizontal = words.filter(w => w.direction === 'horizontal');
    const vertical = words.filter(w => w.direction === 'vertical');
    console.log(`Found ${words.length} total words: ${horizontal.length} horizontal, ${vertical.length} vertical`);
    words.forEach(word => {
      console.log(`${word.direction}: "${word.word}" at`, word.cells);
    });
  }
  
  return words;
}

function findWordsInLine(
  line: Cell[], 
  index: number, 
  direction: 'horizontal' | 'vertical'
): WordMatch[] {
  const words: WordMatch[] = [];
  let currentWord = '';
  let startPos = 0;
  let hasWildcard = false;
  
  for (let pos = 0; pos < line.length; pos++) {
    const cell = line[pos];
    
    if (cell.kind === 'letter' || cell.kind === 'wild' || cell.kind === 'junk') {
      if (currentWord === '') {
        startPos = pos;
        hasWildcard = false;
      }
      
      if (cell.kind === 'wild') {
        hasWildcard = true;
        currentWord += WILDCARD_CHAR;
      } else {
        currentWord += cell.ch || '';
      }
    } else {
      if (currentWord.length >= 3) {
        const resolvedWord = resolveWildcards(currentWord);
        if (resolvedWord && isValidWord(resolvedWord)) {
          const cells: Array<[number, number]> = [];
          for (let i = 0; i < currentWord.length; i++) {
            if (direction === 'horizontal') {
              cells.push([index, startPos + i]);
            } else {
              cells.push([startPos + i, index]);
            }
          }
          
          words.push({
            word: resolvedWord,
            cells,
            direction,
            length: currentWord.length,
            hasWildcard
          });
        }
      }
      currentWord = '';
    }
  }
  
  // Check word at end of line
  if (currentWord.length >= 3) {
    const resolvedWord = resolveWildcards(currentWord);
    if (resolvedWord && isValidWord(resolvedWord)) {
      const cells: Array<[number, number]> = [];
      for (let i = 0; i < currentWord.length; i++) {
        if (direction === 'horizontal') {
          cells.push([index, startPos + i]);
        } else {
          cells.push([startPos + i, index]);
        }
      }
      
      words.push({
        word: resolvedWord,
        cells,
        direction,
        length: currentWord.length,
        hasWildcard
      });
    }
  }
  
  return words;
}

function resolveWildcards(word: string): string | null {
  if (!word.includes(WILDCARD_CHAR)) {
    return word;
  }
  
  // Try all possible letter combinations for wildcards
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  function tryResolve(w: string, pos: number): string | null {
    const wildcardIndex = w.indexOf(WILDCARD_CHAR, pos);
    if (wildcardIndex === -1) {
      return isValidWord(w) ? w : null;
    }
    
    for (const letter of letters) {
      const candidate = w.substring(0, wildcardIndex) + letter + w.substring(wildcardIndex + 1);
      const result = tryResolve(candidate, wildcardIndex + 1);
      if (result) return result;
    }
    
    return null;
  }
  
  return tryResolve(word, 0);
}

export function markWordsForClear(board: Board, words: WordMatch[]): Board {
  const newBoard = board.map(row => row.map(cell => ({ ...cell, marked: false })));
  
  for (const word of words) {
    for (const [row, col] of word.cells) {
      if (newBoard[row] && newBoard[row][col]) {
        newBoard[row][col].marked = true;
      }
    }
  }
  
  return newBoard;
}