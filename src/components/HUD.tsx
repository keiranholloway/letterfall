// File: src/components/HUD.tsx
import React from 'react';

interface HUDProps {
  score: number;
  level: number;
  lines: number;
  combo?: number;
  connectionStatus?: 'disconnected' | 'connecting' | 'connected' | 'error';
  incomingAttacks?: number;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  level,
  lines,
  combo = 0,
  connectionStatus,
  incomingAttacks = 0
}) => {
  return (
    <div className="hud bg-gray-800 text-white p-4 rounded-lg space-y-3">
      <div className="score-section">
        <div className="text-sm text-gray-400">SCORE</div>
        <div className="text-2xl font-bold text-yellow-400">
          {score.toLocaleString()}
        </div>
      </div>
      
      <div className="flex justify-between">
        <div>
          <div className="text-sm text-gray-400">LEVEL</div>
          <div className="text-lg font-bold">{level}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">LINES</div>
          <div className="text-lg font-bold">{lines}</div>
        </div>
      </div>
      
      {combo > 0 && (
        <div className="combo-section">
          <div className="text-sm text-gray-400">COMBO</div>
          <div className="text-xl font-bold text-orange-400">
            {combo}x
          </div>
        </div>
      )}
      
      {connectionStatus && connectionStatus !== 'disconnected' && (
        <div className="connection-section">
          <div className="text-sm text-gray-400">CONNECTION</div>
          <div className={`text-sm font-semibold ${getConnectionColor(connectionStatus)}`}>
            {connectionStatus.toUpperCase()}
          </div>
        </div>
      )}
      
      {incomingAttacks > 0 && (
        <div className="attack-warning bg-red-600 p-2 rounded text-center animate-pulse">
          <div className="text-sm font-bold">INCOMING!</div>
          <div className="text-lg">{incomingAttacks} rows</div>
        </div>
      )}
    </div>
  );
};

function getConnectionColor(status: string): string {
  switch (status) {
    case 'connected': return 'text-green-400';
    case 'connecting': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    default: return 'text-gray-400';
  }
}