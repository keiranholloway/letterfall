// File: src/routes/Home.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';

export const Home: React.FC = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    }
  };
  
  return (
    <div className="home min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🅻 LetterFall
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            The ultimate word puzzle battle royale
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Combine the fast-paced action of Tetris with the strategic word-building of Wordle. 
            Play solo, challenge friends, or take on the daily challenge!
          </p>
        </div>
        
        {/* Install Prompt */}
        {showInstallPrompt && (
          <div className="bg-blue-800 border border-blue-600 rounded-lg p-4 mb-8 flex items-center justify-between">
            <div>
              <h3 className="font-bold">Install LetterFall</h3>
              <p className="text-sm text-gray-300">Play offline and get the full app experience</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Install
              </button>
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="text-gray-300 hover:text-white px-2"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        {/* Game Modes */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Solo Mode */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-xl p-6 text-center hover:bg-opacity-70 transition-all">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold mb-3">Solo</h3>
            <p className="text-gray-300 mb-6">
              Endless gameplay with increasing difficulty. Build your skills and chase high scores.
            </p>
            <Link
              to="/solo"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block transition-colors"
            >
              Play Solo
            </Link>
          </div>
          
          {/* Versus Mode */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-xl p-6 text-center hover:bg-opacity-70 transition-all">
            <div className="text-4xl mb-4">⚔️</div>
            <h3 className="text-2xl font-bold mb-3">Versus</h3>
            <p className="text-gray-300 mb-6">
              Battle friends with peer-to-peer connection. No servers needed - just scan QR codes!
            </p>
            <Link
              to="/versus"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg inline-block transition-colors"
            >
              Battle Friends
            </Link>
          </div>
          
          {/* Daily Mode */}
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur rounded-xl p-6 text-center hover:bg-opacity-70 transition-all">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-2xl font-bold mb-3">Daily</h3>
            <p className="text-gray-300 mb-6">
              Same challenge for everyone, every day. Find the secret word for massive bonus points!
            </p>
            <Link
              to="/daily"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg inline-block transition-colors"
            >
              Daily Challenge
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-8">Game Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-bold mb-2">Mobile First</h4>
              <p className="text-sm text-gray-300">Optimized for touch controls and mobile gameplay</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="font-bold mb-2">No Servers</h4>
              <p className="text-sm text-gray-300">Direct peer-to-peer multiplayer via WebRTC</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">📴</div>
              <h4 className="font-bold mb-2">Offline Ready</h4>
              <p className="text-sm text-gray-300">PWA with full offline support for solo play</p>
            </div>
            
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold mb-2">Lightning Fast</h4>
            <p className="text-sm text-gray-300">Canvas-based rendering for smooth 60fps gameplay</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            How to Play
          </button>
          
          <Link
            to="/settings"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg inline-block transition-colors"
          >
            Settings
          </Link>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-16 text-gray-400 text-sm">
          <p>Built with React, TypeScript, and WebRTC</p>
          <p>No data collection • No ads • No accounts required</p>
        </div>
      </div>
      
      {/* How to Play Modal */}
      <Modal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
        title="How to Play LetterFall"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-2">🎯 Objective</h4>
            <p className="text-gray-300">Form words by dropping letter-filled Tetris pieces. Clear words to score points and attack opponents!</p>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">🎮 Controls</h4>
            <div className="text-gray-300 space-y-1">
              <p>• <strong>Move:</strong> ← → or swipe left/right</p>
              <p>• <strong>Rotate:</strong> ↑ or tap/click the piece</p>
              <p>• <strong>Soft Drop:</strong> ↓ or swipe down</p>
              <p>• <strong>Hard Drop:</strong> Space or swipe up</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">📝 Word Rules</h4>
            <div className="text-gray-300 space-y-1">
              <p>• Words must be 3+ letters long</p>
              <p>• Form words horizontally or vertically</p>
              <p>• <strong>?</strong> = Wildcard (any letter)</p>
              <p>• <strong>💣</strong> = Bomb clears 3×3 area</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">⚔️ Versus Mode</h4>
            <div className="text-gray-300 space-y-1">
              <p>• Clear words to send junk to opponent</p>
              <p>• 3-4 letters = +1 junk row</p>
              <p>• 5-6 letters = +2 junk rows</p>
              <p>• 7+ letters = +5 junk rows</p>
              <p>• Connect via QR codes - no servers!</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-2">📅 Daily Challenge</h4>
            <p className="text-gray-300">Same puzzle daily for all players. Find the secret word for bonus points!</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};