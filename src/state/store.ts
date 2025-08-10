// File: src/state/store.ts
import { create } from 'zustand';
import type { GameState, Settings, ConnectionState, Attack, GameMode } from '../game/types';
import { createEmptyBoard } from '../game/board';
import { SplitMix64 } from '../game/rng';

interface GameStore {
  // Game state
  gameState: GameState;
  gameMode: GameMode;
  isPlaying: boolean;
  
  // Settings
  settings: Settings;
  
  // P2P state
  connection: ConnectionState;
  attackQueue: Attack[];
  
  // Actions
  setGameState: (state: Partial<GameState>) => void;
  resetGame: (mode: GameMode, seed?: number) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setConnection: (connection: Partial<ConnectionState>) => void;
  addAttack: (attack: Attack) => void;
  clearAttacks: () => void;
  setPlaying: (playing: boolean) => void;
}

const defaultSettings: Settings = {
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  colorBlindMode: false,
  leftHandedControls: false,
  showGhost: true,
  dropSpeed: 1.0,
};

const defaultConnection: ConnectionState = {
  status: 'disconnected',
  isHost: false,
};

export const useGameStore = create<GameStore>((set) => ({
  gameState: createInitialGameState(),
  gameMode: 'solo',
  isPlaying: false,
  settings: defaultSettings,
  connection: defaultConnection,
  attackQueue: [],
  
  setGameState: (newState) =>
    set((state) => ({
      gameState: { ...state.gameState, ...newState },
    })),
    
  resetGame: (mode, seed) =>
    set(() => ({
      gameState: createInitialGameState(seed),
      gameMode: mode,
      isPlaying: false,
    })),
    
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
    
  setConnection: (newConnection) =>
    set((state) => ({
      connection: { ...state.connection, ...newConnection },
    })),
    
  addAttack: (attack) =>
    set((state) => ({
      attackQueue: [...state.attackQueue, attack],
    })),
    
  clearAttacks: () =>
    set({ attackQueue: [] }),
    
  setPlaying: (playing) =>
    set({ isPlaying: playing }),
}));

function createInitialGameState(seed?: number): GameState {
  const rng = new SplitMix64(seed);
  
  return {
    board: createEmptyBoard(10, 20),
    active: undefined,
    queue: [],
    score: 0,
    combo: 0,
    level: 1,
    linesCleared: 0,
    over: false,
    paused: false,
    dropTimer: 0,
    lockTimer: 0,
    rng,
  };
}

// Persistent settings
export function loadSettings(): Settings {
  try {
    const saved = localStorage.getItem('letterfall-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem('letterfall-settings', JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}