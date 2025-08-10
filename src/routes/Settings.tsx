// File: src/routes/Settings.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../state/store';
import { loadSettings, saveSettings } from '../state/store';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useGameStore();
  const [localSettings, setLocalSettings] = useState(settings);
  
  useEffect(() => {
    const loaded = loadSettings();
    setLocalSettings(loaded);
    updateSettings(loaded);
  }, [updateSettings]);
  
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings(newSettings);
    saveSettings(newSettings);
  };
  
  const resetSettings = () => {
    const defaultSettings = {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      colorBlindMode: false,
      leftHandedControls: false,
      showGhost: true,
      dropSpeed: 1.0,
    };
    
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
    saveSettings(defaultSettings);
  };
  
  const clearData = () => {
    if (confirm('Clear all saved data? This cannot be undone.')) {
      localStorage.clear();
      alert('All data cleared. Refresh the page to reset.');
    }
  };
  
  return (
    <div className="settings min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Link
            to="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            ← Back
          </Link>
        </div>
        
        {/* Audio Settings */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Audio</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Sound Effects</span>
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <span>Background Music</span>
              <input
                type="checkbox"
                checked={localSettings.musicEnabled}
                onChange={(e) => handleSettingChange('musicEnabled', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
        </section>
        
        {/* Gameplay Settings */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Gameplay</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Show Ghost Piece</span>
              <input
                type="checkbox"
                checked={localSettings.showGhost}
                onChange={(e) => handleSettingChange('showGhost', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            
            <div>
              <label className="block mb-2">
                Drop Speed: {localSettings.dropSpeed.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localSettings.dropSpeed}
                onChange={(e) => handleSettingChange('dropSpeed', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Accessibility Settings */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Accessibility</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div>Color Blind Mode</div>
                <div className="text-sm text-gray-400">Enhanced contrast for better visibility</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.colorBlindMode}
                onChange={(e) => handleSettingChange('colorBlindMode', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <div>Left-Handed Controls</div>
                <div className="text-sm text-gray-400">Mirror control layout for left-handed users</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.leftHandedControls}
                onChange={(e) => handleSettingChange('leftHandedControls', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            
            <label className="flex items-center justify-between">
              <div>
                <div>Vibration</div>
                <div className="text-sm text-gray-400">Haptic feedback on mobile devices</div>
              </div>
              <input
                type="checkbox"
                checked={localSettings.vibrationEnabled}
                onChange={(e) => handleSettingChange('vibrationEnabled', e.target.checked)}
                className="w-5 h-5"
              />
            </label>
          </div>
        </section>
        
        {/* Data Management */}
        <section className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Data</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div>Reset Settings</div>
                <div className="text-sm text-gray-400">Restore all settings to defaults</div>
              </div>
              <button
                onClick={resetSettings}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Reset
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div>Clear All Data</div>
                <div className="text-sm text-gray-400">Remove all saved scores and settings</div>
              </div>
              <button
                onClick={clearData}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        </section>
        
        {/* About */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>LetterFall</strong> v1.0.0</p>
            <p>A competitive word puzzle game combining Tetris and Wordle mechanics.</p>
            <p>Built with React, TypeScript, and WebRTC for peer-to-peer multiplayer.</p>
            <p>No servers, no tracking, no accounts required.</p>
            <p className="pt-2">
              <a 
                href="https://github.com/user/letterfall" 
                className="text-blue-400 hover:text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                View source on GitHub
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};