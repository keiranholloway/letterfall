// File: src/game/engine.ts
import type { GameState, Piece, GameConfig } from './types';
import { PieceGenerator } from './pieceGen';
import { 
  canMoveDown, 
  canMoveLeft, 
  canMoveRight, 
  canRotate,
  placePiece, 
  getHardDropRow,
  addJunkRows
} from './board';
import { rotateShape } from './shapes';
import { processCascades } from './gravity';
import { calculateScore } from './scoring';

const DEFAULT_CONFIG: GameConfig = {
  boardWidth: 10,
  boardHeight: 20,
  dropSpeed: 1000, // ms
  lockDelay: 500, // ms
  queueSize: 5,
};

export class GameEngine {
  private config: GameConfig;
  private pieceGenerator: PieceGenerator;
  
  constructor(config: Partial<GameConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.pieceGenerator = new PieceGenerator(null); // Will be set when game starts
  }
  
  initGame(gameState: GameState): GameState {
    this.pieceGenerator = new PieceGenerator(gameState.rng);
    
    // Generate initial queue
    const queue = this.pieceGenerator.generateQueue(this.config.queueSize);
    
    // Spawn first piece
    const active = this.spawnNextPiece(gameState, queue);
    
    return {
      ...gameState,
      queue: queue.slice(1),
      active,
      dropTimer: 0,
      lockTimer: 0,
    };
  }
  
  tick(gameState: GameState, deltaTime: number): GameState {
    if (gameState.over || gameState.paused || !gameState.active) {
      return gameState;
    }
    
    let newState = { ...gameState };
    
    // Update drop timer
    newState.dropTimer += deltaTime;
    
    // Calculate current drop speed (increases with level)
    const dropInterval = Math.max(50, this.config.dropSpeed - (gameState.level - 1) * 50);
    
    // Handle automatic dropping
    if (newState.dropTimer >= dropInterval) {
      newState = this.moveDown(newState);
      newState.dropTimer = 0;
    }
    
    return newState;
  }
  
  moveLeft(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active || !canMoveLeft(gameState.board, active)) {
      return gameState;
    }
    
    return {
      ...gameState,
      active: { ...active, col: active.col - 1 },
      lockTimer: 0, // Reset lock timer on successful movement
    };
  }
  
  moveRight(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active || !canMoveRight(gameState.board, active)) {
      return gameState;
    }
    
    return {
      ...gameState,
      active: { ...active, col: active.col + 1 },
      lockTimer: 0, // Reset lock timer on successful movement
    };
  }
  
  rotate(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active || !canRotate(gameState.board, active)) {
      return gameState;
    }
    
    const newRot = (active.rot + 1) % 4;
    let newShape = active.shape;
    for (let i = 0; i < newRot; i++) {
      newShape = rotateShape(newShape);
    }
    
    return {
      ...gameState,
      active: { ...active, rot: newRot, shape: newShape },
      lockTimer: 0, // Reset lock timer on successful rotation
    };
  }
  
  moveDown(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active) return gameState;
    
    if (canMoveDown(gameState.board, active)) {
      return {
        ...gameState,
        active: { ...active, row: active.row + 1 },
        lockTimer: 0,
      };
    } else {
      // Piece can't move down, start lock timer
      if (gameState.lockTimer >= this.config.lockDelay) {
        return this.lockPiece(gameState);
      } else {
        return {
          ...gameState,
          lockTimer: gameState.lockTimer + 100, // Increment lock timer
        };
      }
    }
  }
  
  hardDrop(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active) return gameState;
    
    const dropRow = getHardDropRow(gameState.board, active);
    const newActive = { ...active, row: dropRow };
    
    return this.lockPiece({
      ...gameState,
      active: newActive,
    });
  }
  
  private lockPiece(gameState: GameState): GameState {
    const { active } = gameState;
    if (!active) return gameState;
    
    // Place piece on board
    const boardWithPiece = placePiece(gameState.board, active);
    
    // Process cascades and word clearing
    const cascadeResult = processCascades(boardWithPiece);
    
    // Calculate score
    let totalScore = 0;
    cascadeResult.wordsCleared.forEach((word, index) => {
      const comboLevel = Math.floor(index / cascadeResult.cascadeCount);
      totalScore += calculateScore(word, comboLevel);
    });
    
    // Update level based on lines cleared
    const newLinesCleared = gameState.linesCleared + cascadeResult.wordsCleared.length;
    const newLevel = Math.floor(newLinesCleared / 10) + 1;
    
    // Spawn next piece
    const newQueue = [...gameState.queue];
    if (newQueue.length < this.config.queueSize) {
      newQueue.push(this.pieceGenerator.generatePiece().shape);
    }
    
    const nextActive = this.spawnNextPiece(
      { ...gameState, queue: newQueue },
      newQueue
    );
    
    // Check for game over
    const gameOver = !nextActive || !this.isValidSpawn(cascadeResult.board);
    
    return {
      ...gameState,
      board: cascadeResult.board,
      active: gameOver ? undefined : nextActive,
      queue: newQueue.slice(1),
      score: gameState.score + totalScore,
      combo: cascadeResult.cascadeCount > 1 ? cascadeResult.cascadeCount : 0,
      level: newLevel,
      linesCleared: newLinesCleared,
      over: gameOver || false,
      lockTimer: 0,
    };
  }
  
  private spawnNextPiece(_gameState: GameState, queue: any[]): Piece | undefined {
    if (queue.length === 0) return undefined;
    
    const piece = this.pieceGenerator.generatePiece();
    piece.shape = queue[0];
    
    return piece;
  }
  
  private isValidSpawn(board: any): boolean {
    // Check if piece can spawn at the top
    // Simple check: if top rows are not completely filled
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < board[0].length; col++) {
        if (board[row][col].kind === 'empty') {
          return true;
        }
      }
    }
    return false;
  }
  
  addJunkRows(gameState: GameState, numRows: number): GameState {
    if (numRows <= 0) return gameState;
    
    const newBoard = addJunkRows(gameState.board, numRows, gameState.rng);
    
    return {
      ...gameState,
      board: newBoard,
    };
  }
}