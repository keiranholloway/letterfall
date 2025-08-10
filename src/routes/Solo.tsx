// File: src/routes/Solo.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { CanvasBoard } from '../components/CanvasBoard';
import { TouchControls } from '../components/TouchControls';
import { NextQueue } from '../components/NextQueue';
import { HUD } from '../components/HUD';
import { WordsList } from '../components/WordsList';
import { useGameStore } from '../state/store';
import { createEmptyBoard } from '../game/board';
import { SplitMix64 } from '../game/rng';
import { GameEngine } from '../game/engine';
import { loadDictionary } from '../game/wordFinder';

const gameEngine = new GameEngine();

export const Solo: React.FC = () => {
  const {
    gameState,
    isPlaying,
    setGameState,
    resetGame,
    setPlaying,
  } = useGameStore();
  
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  // Initialize dictionary
  useEffect(() => {
    loadDictionary();
  }, []);
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isPlaying) return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    if (deltaTime > 0) {
      const newState = gameEngine.tick(gameState, deltaTime);
      if (newState !== gameState) {
        setGameState(newState);
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, gameState, setGameState]);
  
  // Start game loop when playing
  useEffect(() => {
    if (isPlaying && !gameState.over) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameState.over, gameLoop]);
  
  // Keyboard controls - Updated for v1.1 with up arrow rotation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameState.over) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setGameState(gameEngine.moveLeft(gameState));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setGameState(gameEngine.moveRight(gameState));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setGameState(gameEngine.moveDown(gameState));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setGameState(gameEngine.rotate(gameState));
          break;
        case ' ':
          e.preventDefault();
          setGameState(gameEngine.hardDrop(gameState));
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          setGameState(gameEngine.rotate(gameState));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameState, setGameState]);
  
  const startGame = useCallback(() => {
    resetGame('solo');
    const newGameState = {
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
      rng: new SplitMix64(Date.now()),
      wordsFound: [],
    };
    const initializedState = gameEngine.initGame(newGameState);
    setGameState(initializedState);
    setPlaying(true);
  }, [resetGame, gameState, setGameState, setPlaying]);
  
  const pauseGame = useCallback(() => {
    setPlaying(!isPlaying);
    setGameState({ paused: !gameState.paused });
  }, [isPlaying, gameState.paused, setPlaying, setGameState]);
  
  // Touch/click handlers
  const handleMoveLeft = useCallback(() => {
    if (isPlaying && !gameState.over) {
      setGameState(gameEngine.moveLeft(gameState));
    }
  }, [isPlaying, gameState, setGameState]);
  
  const handleMoveRight = useCallback(() => {
    if (isPlaying && !gameState.over) {
      setGameState(gameEngine.moveRight(gameState));
    }
  }, [isPlaying, gameState, setGameState]);
  
  const handleRotate = useCallback(() => {
    if (isPlaying && !gameState.over) {
      setGameState(gameEngine.rotate(gameState));
    }
  }, [isPlaying, gameState, setGameState]);
  
  const handleSoftDrop = useCallback(() => {
    if (isPlaying && !gameState.over) {
      setGameState(gameEngine.moveDown(gameState));
    }
  }, [isPlaying, gameState, setGameState]);
  
  const handleHardDrop = useCallback(() => {
    if (isPlaying && !gameState.over) {
      setGameState(gameEngine.hardDrop(gameState));
    }
  }, [isPlaying, gameState, setGameState]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🅻 LetterFall Solo
          </h1>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <HUD
              score={gameState.score}
              level={gameState.level}
              lines={gameState.linesCleared}
              combo={gameState.combo}
            />
            
            <WordsList words={gameState.wordsFound} />
            
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-3 text-blue-300">How to Play</h3>
              <div className="text-sm space-y-2 text-slate-300">
                <p>• Form words horizontally or vertically</p>
                <p>• Words must be 3+ letters</p>
                <p>• Longer words = more points</p>
                <p>• ? = wildcard letter</p>
                <p>• 💣 = bomb clears 3×3 area</p>
              </div>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-3 text-green-300">Controls</h3>
              <div className="text-sm space-y-1 text-slate-300">
                <p>← → Move left/right</p>
                <p>↓ Soft drop</p>
                <p>↑/Z Rotate</p>
                <p>Space Hard drop</p>
              </div>
            </div>
          </div>

          {/* Game Board - Center */}
          <div className="lg:col-span-2 flex flex-col items-center">
            {/* Game Controls */}
            <div className="mb-6">
              {!isPlaying && !gameState.over && (
                <button
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  🚀 Start Game
                </button>
              )}
              
              {isPlaying && (
                <button
                  onClick={pauseGame}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-xl"
                >
                  {gameState.paused ? '▶️ Resume' : '⏸️ Pause'}
                </button>
              )}
              
              {gameState.over && (
                <div className="text-center bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 shadow-2xl">
                  <div className="text-3xl font-bold text-red-400 mb-4">💀 Game Over!</div>
                  <div className="text-xl mb-6 text-slate-300">
                    Final Score: <span className="text-yellow-400 font-bold">{gameState.score.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-lg shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    🔄 Play Again
                  </button>
                </div>
              )}
            </div>
            
            {/* Game Board */}
            <div className="game-board-container bg-slate-900/80 rounded-2xl p-4 border-2 border-purple-500/30 shadow-2xl backdrop-blur-sm">
              <CanvasBoard
                board={gameState.board}
                activePiece={gameState.active}
                width={10}
                height={20}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <NextQueue queue={gameState.queue} />
          </div>
          
        </div>
        
        {/* Touch Controls */}
        <div className="mt-8 lg:hidden">
          <TouchControls
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onRotate={handleRotate}
            onSoftDrop={handleSoftDrop}
            onHardDrop={handleHardDrop}
            disabled={!isPlaying || gameState.over || gameState.paused}
          />
        </div>
      </div>
    </div>
  );
};