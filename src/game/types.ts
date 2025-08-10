// File: src/game/types.ts
export type Cell = { 
  kind: 'empty' | 'letter' | 'junk' | 'wild' | 'bomb'; 
  ch?: string;
  marked?: boolean;
};

export type Board = Cell[][];

export type Shape = boolean[][];

export interface Piece {
  shape: Shape;
  letters: string[];
  row: number;
  col: number;
  rot: number;
}

export interface GameState {
  board: Board;
  active?: Piece;
  queue: Shape[];
  score: number;
  combo: number;
  level: number;
  linesCleared: number;
  over: boolean;
  paused: boolean;
  dropTimer: number;
  lockTimer: number;
  rng: any; // Will be SplitMix64
  wordsFound: string[];
}

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  dropSpeed: number;
  lockDelay: number;
  queueSize: number;
}

export type GameMode = 'solo' | 'versus' | 'daily';

export interface Player {
  id: string;
  gameState: GameState;
  attackQueue: Attack[];
}

export interface Attack {
  timestamp: number;
  rows: number;
  applied: boolean;
}

// P2P Message types
export type P2PMessage =
  | { t: 'hello'; seed: number; ver: string; now: number }
  | { t: 'attack'; at: number; rows: number }
  | { t: 'emote'; id: number }
  | { t: 'gameover'; winner: 'me' | 'you' };

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  isHost: boolean;
  peerId?: string;
  channel?: RTCDataChannel;
  error?: string;
}

export interface WordMatch {
  word: string;
  cells: Array<[number, number]>;
  direction: 'horizontal' | 'vertical';
  length: number;
  hasWildcard: boolean;
}

export interface ScoreEvent {
  word: string;
  points: number;
  combo: number;
  position: { row: number; col: number };
}

export interface Settings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  colorBlindMode: boolean;
  leftHandedControls: boolean;
  showGhost: boolean;
  dropSpeed: number;
}