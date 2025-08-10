// File: src/game/attacks.ts
import type { Attack } from './types';

export function createAttack(wordLength: number, timestamp: number): Attack {
  const rows = calculateAttackRows(wordLength);
  
  return {
    timestamp: timestamp + 1000, // Apply 1 second later
    rows,
    applied: false
  };
}

function calculateAttackRows(wordLength: number): number {
  if (wordLength < 3) return 0;
  if (wordLength <= 4) return 1;
  if (wordLength <= 6) return 2;
  return 5; // 7+ letters
}

export function processAttacks(
  attacks: Attack[],
  currentTime: number,
  applyAttack: (rows: number) => void
): Attack[] {
  const remaining: Attack[] = [];
  
  for (const attack of attacks) {
    if (!attack.applied && currentTime >= attack.timestamp) {
      applyAttack(attack.rows);
      attack.applied = true;
    }
    
    // Keep unapplied attacks
    if (!attack.applied) {
      remaining.push(attack);
    }
  }
  
  return remaining;
}