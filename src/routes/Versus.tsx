// File: src/routes/Versus.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CanvasBoard } from '../components/CanvasBoard';
import { TouchControls } from '../components/TouchControls';
import { NextQueue } from '../components/NextQueue';
import { HUD } from '../components/HUD';
import { QRExchange } from '../components/QRExchange';
import { useGameStore } from '../state/store';
import { createEmptyBoard } from '../game/board';
import { SplitMix64 } from '../game/rng';
import { GameEngine } from '../game/engine';
import { WebRTCManager } from '../net/rtc';
import { loadDictionary } from '../game/wordFinder';
import { createAttack, processAttacks } from '../game/attacks';
import type { P2PMessage } from '../game/types';

type VersusState = 'setup' | 'hosting' | 'joining' | 'connecting' | 'playing' | 'finished';

const gameEngine = new GameEngine();

export const Versus: React.FC = () => {
  const {
    gameState,
    isPlaying,
    connection,
    attackQueue,
    setGameState,
    resetGame,
    setPlaying,
    setConnection,
    addAttack,
    clearAttacks
  } = useGameStore();
  
  const [state, setState] = useState<VersusState>('setup');
  const [offerCode, setOfferCode] = useState('');
  const [answerCode, setAnswerCode] = useState('');
  const [error, setError] = useState('');
  const [opponentScore] = useState(0);
  const [incomingAttacks, setIncomingAttacks] = useState(0);
  
  const rtcManagerRef = useRef<WebRTCManager | null>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(0);
  
  // Initialize
  useEffect(() => {
    loadDictionary();
    rtcManagerRef.current = new WebRTCManager();
    
    const rtc = rtcManagerRef.current;
    
    rtc.onConnected(() => {
      setConnection({ status: 'connected' });
      setState('playing');
      startGame();
    });
    
    rtc.onDisconnected(() => {
      setConnection({ status: 'disconnected' });
      setState('setup');
      setPlaying(false);
    });
    
    rtc.onErrorOccurred((error) => {
      setConnection({ status: 'error', error });
      setError(error);
    });
    
    rtc.onMessageReceived(handleMessage);
    
    return () => {
      rtc?.close();
    };
  }, []);
  
  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isPlaying || state !== 'playing') return;
    
    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;
    
    if (deltaTime > 0) {
      // Process incoming attacks
      const currentServerTime = Date.now() + timeOffsetRef.current;
      const remainingAttacks = processAttacks(
        attackQueue,
        currentServerTime,
        (rows) => {
          setGameState(gameEngine.addJunkRows(gameState, rows));
          setIncomingAttacks(prev => Math.max(0, prev - rows));
        }
      );
      
      if (remainingAttacks.length !== attackQueue.length) {
        clearAttacks();
        remainingAttacks.forEach(addAttack);
      }
      
      // Update game state
      const newState = gameEngine.tick(gameState, deltaTime);
      if (newState !== gameState) {
        setGameState(newState);
        
        // Check for game over
        if (newState.over && !gameState.over) {
          sendMessage({ t: 'gameover', winner: 'you' });
          setState('finished');
        }
      }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, state, gameState, attackQueue, setGameState, addAttack, clearAttacks]);
  
  // Start game loop when playing
  useEffect(() => {
    if (isPlaying && state === 'playing') {
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
  }, [isPlaying, state, gameLoop]);
  
  const handleMessage = useCallback((message: P2PMessage) => {
    switch (message.t) {
      case 'hello':
        // Sync time and seed
        timeOffsetRef.current = message.now - Date.now();
        resetGame('versus', message.seed);
        break;
        
      case 'attack':
        const attack = {
          timestamp: message.at + timeOffsetRef.current,
          rows: message.rows,
          applied: false
        };
        addAttack(attack);
        setIncomingAttacks(prev => prev + message.rows);
        break;
        
      case 'gameover':
        setState('finished');
        setPlaying(false);
        break;
        
      case 'emote':
        // Handle emotes if implemented
        break;
    }
  }, [resetGame, addAttack]);
  
  const sendMessage = useCallback((message: P2PMessage) => {
    rtcManagerRef.current?.sendMessage(message);
  }, []);
  
  const startAsHost = useCallback(async () => {
    setState('hosting');
    setConnection({ status: 'connecting', isHost: true });
    
    try {
      const offer = await rtcManagerRef.current?.createOffer();
      if (offer) {
        setOfferCode(offer);
      }
    } catch (error) {
      setError('Failed to create offer');
      setState('setup');
    }
  }, [setConnection]);
  
  const joinAsGuest = useCallback(() => {
    setState('joining');
    setConnection({ status: 'connecting', isHost: false });
  }, [setConnection]);
  
  const handleOfferScanned = useCallback(async (offer: string) => {
    try {
      const answer = await rtcManagerRef.current?.createAnswer(offer);
      if (answer) {
        setAnswerCode(answer);
      }
    } catch (error) {
      setError('Invalid offer code');
      setState('setup');
    }
  }, []);
  
  const handleAnswerScanned = useCallback(async (answer: string) => {
    try {
      await rtcManagerRef.current?.acceptAnswer(answer);
      setConnection({ status: 'connecting' });
    } catch (error) {
      setError('Invalid answer code');
      setState('hosting');
    }
  }, [setConnection]);
  
  const startGame = useCallback(() => {
    const seed = Date.now();
    resetGame('versus', seed);
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
    };
    const initializedState = gameEngine.initGame(newGameState);
    setGameState(initializedState);
    setPlaying(true);
    
    // Send hello message with seed
    if (connection.isHost) {
      sendMessage({
        t: 'hello',
        seed,
        ver: '1.0.0',
        now: Date.now()
      });
    }
  }, [connection.isHost, gameState, resetGame, setGameState, setPlaying, sendMessage]);
  
  // Game controls
  const handleMoveLeft = useCallback(() => {
    if (isPlaying && state === 'playing') {
      setGameState(gameEngine.moveLeft(gameState));
    }
  }, [isPlaying, state, gameState, setGameState]);
  
  const handleMoveRight = useCallback(() => {
    if (isPlaying && state === 'playing') {
      setGameState(gameEngine.moveRight(gameState));
    }
  }, [isPlaying, state, gameState, setGameState]);
  
  const handleRotate = useCallback(() => {
    if (isPlaying && state === 'playing') {
      setGameState(gameEngine.rotate(gameState));
    }
  }, [isPlaying, state, gameState, setGameState]);
  
  const handleSoftDrop = useCallback(() => {
    if (isPlaying && state === 'playing') {
      setGameState(gameEngine.moveDown(gameState));
    }
  }, [isPlaying, state, gameState, setGameState]);
  
  const handleHardDrop = useCallback(() => {
    if (isPlaying && state === 'playing') {
      const newState = gameEngine.hardDrop(gameState);
      setGameState(newState);
      
      // Send attack if words were cleared
      if (newState.score > gameState.score) {
        const attack = createAttack(5, Date.now()); // Example: 5-letter word
        sendMessage({
          t: 'attack',
          at: attack.timestamp,
          rows: attack.rows
        });
      }
    }
  }, [isPlaying, state, gameState, setGameState, sendMessage]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || state !== 'playing') return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleMoveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMoveRight();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleSoftDrop();
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          handleHardDrop();
          break;
        case 'z':
        case 'Z':
          e.preventDefault();
          handleRotate();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, state, handleMoveLeft, handleMoveRight, handleSoftDrop, handleHardDrop, handleRotate]);
  
  const backToSetup = useCallback(() => {
    rtcManagerRef.current?.close();
    rtcManagerRef.current = new WebRTCManager();
    setState('setup');
    setConnection({ status: 'disconnected', isHost: false });
    setOfferCode('');
    setAnswerCode('');
    setError('');
    setPlaying(false);
  }, [setConnection, setPlaying]);
  
  return (
    <div className="versus-game min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Setup Screen */}
        {state === 'setup' && (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-8">Versus Mode</h1>
            <div className="max-w-md mx-auto space-y-4">
              <p className="text-gray-400 mb-6">
                Connect with another player using QR codes or text exchange
              </p>
              
              {error && (
                <div className="bg-red-600 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <button
                onClick={startAsHost}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg"
              >
                Create Match
              </button>
              
              <button
                onClick={joinAsGuest}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg"
              >
                Join Match
              </button>
            </div>
          </div>
        )}
        
        {/* Hosting Screen */}
        {state === 'hosting' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Share This Code</h2>
            <p className="text-gray-400 mb-6">
              Have your opponent scan this QR code or copy the text
            </p>
            
            <QRExchange
              value={offerCode}
              onScan={handleAnswerScanned}
              title="Waiting for Answer"
              subtitle="Scan the QR code your opponent shows you"
            />
            
            <button
              onClick={backToSetup}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Back
            </button>
          </div>
        )}
        
        {/* Joining Screen */}
        {state === 'joining' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Scan Host's QR Code</h2>
            
            <QRExchange
              value={answerCode}
              onScan={handleOfferScanned}
              title="Join Match"
              subtitle="Show this QR code to the host after scanning theirs"
            />
            
            <button
              onClick={backToSetup}
              className="mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Back
            </button>
          </div>
        )}
        
        {/* Playing Screen */}
        {state === 'playing' && (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Game Board */}
            <div className="flex-1 flex flex-col items-center">
              <h1 className="text-3xl font-bold text-center mb-4">Versus Battle</h1>
              
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
                connectionStatus={connection.status}
                incomingAttacks={incomingAttacks}
              />
              
              <NextQueue queue={gameState.queue} />
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-3">Opponent</h3>
                <div className="text-2xl font-bold text-red-400">
                  {opponentScore.toLocaleString()}
                </div>
              </div>
              
              <button
                onClick={backToSetup}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
        
        {/* Finished Screen */}
        {state === 'finished' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
            <div className="text-xl mb-6">
              Final Score: {gameState.score.toLocaleString()}
            </div>
            
            <div className="space-y-4">
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                Play Again
              </button>
              
              <button
                onClick={backToSetup}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
              >
                New Match
              </button>
            </div>
          </div>
        )}
        
        {/* Touch Controls */}
        {state === 'playing' && (
          <div className="mt-6 lg:hidden">
            <TouchControls
              onMoveLeft={handleMoveLeft}
              onMoveRight={handleMoveRight}
              onRotate={handleRotate}
              onSoftDrop={handleSoftDrop}
              onHardDrop={handleHardDrop}
              disabled={!isPlaying}
            />
          </div>
        )}
      </div>
    </div>
  );
};