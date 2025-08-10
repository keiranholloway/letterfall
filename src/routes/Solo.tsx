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
    <div className="solo-game min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">LetterFall Solo</h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            <HUD
              score={gameState.score}
              level={gameState.level}
              lines={gameState.linesCleared}
              combo={gameState.combo}
            />
            
            <WordsList words={gameState.wordsFound} />
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">How to Play</h3>
              <div className="text-sm space-y-2">
                <p>• Form words horizontally or vertically</p>
                <p>• Words must be 3+ letters</p>
                <p>• Longer words = more points</p>
                <p>• ? = wildcard letter</p>
                <p>• 💣 = bomb clears 3×3 area</p>
              </div>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Controls</h3>
              <div className="text-sm space-y-1">
                <p>← → Move left/right</p>
                <p>↓ Soft drop</p>
                <p>↑/Z Rotate</p>
                <p>Space Hard drop</p>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-4">
              {!isPlaying && !gameState.over && (
                <button
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  Start Game
                </button>
              )}
              
              {isPlaying && (
                <button
                  onClick={pauseGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                >
                  {gameState.paused ? 'Resume' : 'Pause'}
                </button>
              )}
              
              {gameState.over && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400 mb-4">Game Over!</div>
                  <div className="text-lg mb-4">Final Score: {gameState.score.toLocaleString()}</div>
                  <button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
            
            <div className="game-board-container">
              <CanvasBoard
                board={gameState.board}
                activePiece={gameState.active}
                width={10}
                height={20}
                className="mx-auto"
              />
            </div>
          </div>

          {/* Right Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            <NextQueue queue={gameState.queue} />
          </div>
        </div>
        
        {/* Touch Controls */}
        <div className="mt-6 lg:hidden">
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