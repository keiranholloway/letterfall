// File: src/routes/Daily.tsx
import React, { useEffect, useCallback, useRef, useState } from 'react';
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

// Daily words for bonus scoring
const DAILY_WORDS = [
  'DREAM', 'LIGHT', 'MAGIC', 'QUEST', 'SPARK', 'POWER', 'BRAVE', 'SWIFT',
  'SMART', 'LUCKY', 'HAPPY', 'SUPER', 'NINJA', 'ROYAL', 'FLAME', 'STORM',
  'FROST', 'EARTH', 'OCEAN', 'SPACE', 'TIGER', 'EAGLE', 'SWORD', 'CROWN',
  'JEWEL', 'PEARL', 'CRYSTAL', 'GOLDEN', 'SILVER', 'BRONZE', 'VICTORY'
];

function getDailySeed(): number {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // Simple hash function for consistent daily seed
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash);
}

function getDailyWord(): string {
  const seed = getDailySeed();
  return DAILY_WORDS[seed % DAILY_WORDS.length];
}

export const Daily: React.FC = () => {
  const {
    gameState,
    isPlaying,
    setGameState,
    resetGame,
    setPlaying,
  } = useGameStore();
  
  const [dailyWord, setDailyWord] = useState<string>('');
  const [dailyWordFound, setDailyWordFound] = useState(false);
  const [dailyBonus, setDailyBonus] = useState(0);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  
  // Initialize
  useEffect(() => {
    loadDictionary();
    const word = getDailyWord();
    setDailyWord(word);
    
    // Check if played today
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('letterfall-daily-last-played');
    setHasPlayedToday(lastPlayed === today);
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
        
        // Check for daily word bonus
        if (newState.score > gameState.score && !dailyWordFound) {
          checkForDailyWord(newState.board);
        }
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, gameState, setGameState, dailyWordFound]);
  
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
  
  const checkForDailyWord = useCallback((board: any) => {
    // Simple check for daily word in board
    const boardText = board.flat()
      .filter((cell: any) => cell.kind === 'letter' && cell.ch)
      .map((cell: any) => cell.ch)
      .join('');
    
    if (boardText.includes(dailyWord)) {
      setDailyWordFound(true);
      const bonus = dailyWord.length * 1000; // 1000 points per letter
      setDailyBonus(bonus);
      setGameState({
        ...gameState,
        score: gameState.score + bonus
      });
    }
  }, [dailyWord, gameState, setGameState]);
  
  // Keyboard controls
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
    const seed = getDailySeed();
    resetGame('daily', seed);
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
      rng: new SplitMix64(seed),
      wordsFound: [],
    };
    const initializedState = gameEngine.initGame(newGameState);
    setGameState(initializedState);
    setPlaying(true);
    setDailyWordFound(false);
    setDailyBonus(0);
    
    // Mark as played today
    const today = new Date().toDateString();
    localStorage.setItem('letterfall-daily-last-played', today);
    setHasPlayedToday(true);
  }, [resetGame, gameState, setGameState, setPlaying]);
  
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
    <div className="daily-game min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Board */}
          <div className="flex-1 flex flex-col items-center">
            <div className="mb-4 text-center">
              <h1 className="text-3xl font-bold mb-2">Daily Challenge</h1>
              <p className="text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              
              {!isPlaying && !gameState.over && (
                <div className="mt-4">
                  <button
                    onClick={startGame}
                    disabled={hasPlayedToday && !gameState.over}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg text-lg"
                  >
                    {hasPlayedToday && !gameState.over ? 'Already Played Today' : 'Start Daily Challenge'}
                  </button>
                </div>
              )}
              
              {gameState.over && (
                <div className="mt-4 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-2">Challenge Complete!</div>
                  <div className="text-lg mb-2">Final Score: {gameState.score.toLocaleString()}</div>
                  {dailyWordFound && (
                    <div className="text-lg text-yellow-400 mb-4">
                      Daily Word Bonus: +{dailyBonus.toLocaleString()}
                    </div>
                  )}
                  <p className="text-gray-400">Come back tomorrow for a new challenge!</p>
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
          
          {/* Side Panel */}
          <div className="w-full lg:w-64 space-y-4">
            <HUD
              score={gameState.score}
              level={gameState.level}
              lines={gameState.linesCleared}
              combo={gameState.combo}
            />
            
            <div className="bg-purple-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Daily Word</h3>
              <div className="text-center">
                <div className="text-2xl font-bold tracking-wider mb-2">
                  {dailyWord}
                </div>
                <div className="text-sm text-purple-200">
                  {dailyWordFound ? (
                    <span className="text-yellow-400">✓ Found! +{dailyBonus}</span>
                  ) : (
                    'Form this word for bonus points!'
                  )}
                </div>
                <div className="text-xs text-purple-300 mt-2">
                  Bonus: {dailyWord.length * 1000} points
                </div>
              </div>
            </div>
            
            <NextQueue queue={gameState.queue} />
            
            <WordsList words={gameState.wordsFound} />
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-3">Daily Challenge</h3>
              <div className="text-sm space-y-2">
                <p>• Same puzzle for all players</p>
                <p>• One attempt per day</p>
                <p>• Find the daily word for huge bonus</p>
                <p>• Compete on global leaderboard</p>
              </div>
            </div>
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
            disabled={!isPlaying || gameState.over}
          />
        </div>
      </div>
    </div>
  );
};