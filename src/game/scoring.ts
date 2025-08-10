// File: src/game/scoring.ts
import { getWordScore } from './letters';

export function calculateScore(
  word: string, 
  combo: number, 
  hasWildcard: boolean = false
): number {
  const baseScore = getWordScore(word);
  const lengthBonus = Math.max(0, word.length - 3) * 10;
  const wildcardPenalty = hasWildcard ? 0.8 : 1.0;
  const comboMultiplier = Math.pow(1.5, combo);
  
  return Math.floor((baseScore + lengthBonus) * wildcardPenalty * comboMultiplier);
}

export function calculateAttackRows(wordLength: number): number {
  if (wordLength < 3) return 0;
  if (wordLength <= 4) return 1;
  if (wordLength <= 6) return 2;
  return 5; // 7+ letters
}

export function calculateComboMultiplier(cascadeCount: number): number {
  return Math.pow(1.5, cascadeCount);
}