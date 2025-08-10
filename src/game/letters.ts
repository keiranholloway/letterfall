// File: src/game/letters.ts
export const LETTER_FREQUENCY: Record<string, number> = {
  A: 8.12, B: 1.49, C: 2.78, D: 4.25, E: 12.02, F: 2.23, G: 2.02,
  H: 6.09, I: 6.97, J: 0.15, K: 0.77, L: 4.03, M: 2.41, N: 6.75,
  O: 7.51, P: 1.93, Q: 0.10, R: 5.99, S: 6.33, T: 9.06, U: 2.76,
  V: 0.98, W: 2.36, X: 0.15, Y: 1.97, Z: 0.07
};

export const LETTER_RARITY: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2,
  H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1,
  V: 4, W: 4, X: 8, Y: 4, Z: 10
};

export const SCRABBLE_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2,
  H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1,
  O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1,
  V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const LETTERS = Object.keys(LETTER_FREQUENCY);
const FREQUENCIES = Object.values(LETTER_FREQUENCY);

// Create weighted distribution
const WEIGHTED_LETTERS: string[] = [];
LETTERS.forEach((letter, i) => {
  const count = Math.round(FREQUENCIES[i] * 10);
  for (let j = 0; j < count; j++) {
    WEIGHTED_LETTERS.push(letter);
  }
});

export function getRandomLetter(rng: any): string {
  const index = rng.nextInt(WEIGHTED_LETTERS.length);
  return WEIGHTED_LETTERS[index];
}

export function getLetterScore(letter: string): number {
  return SCRABBLE_SCORES[letter] || 0;
}

export function getWordScore(word: string): number {
  return word.split('').reduce((sum, letter) => sum + getLetterScore(letter), 0);
}

export function isValidLetter(ch: string): boolean {
  return ch >= 'A' && ch <= 'Z';
}

export const WILDCARD_CHAR = '?';
export const BOMB_CHAR = '💣';