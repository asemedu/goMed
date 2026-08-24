import React from 'react';
import { CPRMetrics } from '../../../services/cprMetricsCalculator';

interface Props {
  metrics: CPRMetrics | null;
  timeLeft: number;
}

export function LiveHUDOverlay({ metrics, timeLeft }: Props) {
  if (!metrics) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      {/* Top Bar: Timer & Pace */}
      <div className="flex justify-between items-start">
        {/* Timer Box */}
        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Time Left</span>
          <span className="text-3xl font-mono font-bold text-white">00:{Math.max(0, timeLeft).toString().padStart(2, '0')}</span>
        </div>
        
        {/* Cadence Box */}
        <div className={`bg-black/50 backdrop-blur-md rounded-2xl p-4 border flex flex-col items-center transition-colors shadow-lg
          ${metrics.isGoodPace ? 'border-green-500/50 shadow-green-500/20' : 
           (metrics.bpm > 0 ? 'border-red-500/50 shadow-red-500/20' : 'border-white/10')}`}>
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Pace</span>
          <span className={`text-4xl font-bold ${metrics.isGoodPace ? 'text-green-400' : (metrics.bpm > 0 ? 'text-red-400' : 'text-gray-300')}`}>
            {metrics.bpm} <span className="text-sm font-normal">BPM</span>
          </span>
          <span className="text-[10px] text-gray-400 mt-1">TARGET: 100-120</span>
        </div>
      </div>

      {/* Bottom Area: Form Feedback */}
      <div className="flex flex-col items-center justify-end pb-8">
        <div className={`px-6 py-4 rounded-2xl backdrop-blur-md border text-center transition-all shadow-xl
          ${metrics.isArmsLocked 
            ? 'bg-black/50 border-white/10' 
            : 'bg-red-500/20 border-red-500/50 scale-105 shadow-red-500/30'}`}>
          <p className={`font-bold text-lg ${metrics.isArmsLocked ? 'text-white' : 'text-red-400'}`}>
            {metrics.isArmsLocked ? "✓ Arms Locked" : "⚠ Keep Arms Straight"}
          </p>
          {!metrics.isArmsLocked && (
            <p className="text-xs text-red-300 mt-1">Don't bend your elbows during compressions</p>
          )}
        </div>
      </div>
    </div>
  );
}
