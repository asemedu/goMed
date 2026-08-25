import React from 'react';
import { CPRMetrics } from '../../../services/cprMetricsCalculator';
import { useLanguage } from '../../../lib/i18n/LanguageContext';

interface Props {
  metrics: CPRMetrics | null;
  timeLeft: number;
}

export function LiveHUDOverlay({ metrics, timeLeft }: Props) {
  const { t } = useLanguage();
  if (!metrics) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-40">
      {/* Top Bar: Timer & Pace */}
      <div className="flex justify-between items-start">
        {/* Timer Box */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50 flex flex-col items-center">
          <span className="text-[#1A2816]/60 text-[10px] uppercase font-bold tracking-widest mb-1">{t("cpr.timeLeft", "Time Left")}</span>
          <span className="text-3xl font-mono font-bold text-[#1A2816]">00:{Math.max(0, timeLeft).toString().padStart(2, '0')}</span>
        </div>
        
        {/* Cadence Box */}
        <div className={`bg-white/90 backdrop-blur-md rounded-2xl p-4 border flex flex-col items-center transition-colors shadow-lg
          ${metrics.isGoodPace ? 'border-green-500 shadow-green-500/20' : 
           (metrics.bpm > 0 ? 'border-red-500 shadow-red-500/20' : 'border-white/50')}`}>
          <span className="text-[#1A2816]/60 text-[10px] uppercase font-bold tracking-widest mb-1">{t("cpr.pace", "Pace")}</span>
          <span className={`text-4xl font-bold ${metrics.isGoodPace ? 'text-green-600' : (metrics.bpm > 0 ? 'text-red-600' : 'text-[#1A2816]')}`}>
            {metrics.bpm} <span className="text-sm font-normal text-[#1A2816]/60">BPM</span>
          </span>
          <span className="text-[10px] text-[#1A2816]/50 mt-1">{t("cpr.targetBpm", "TARGET: 100-120")}</span>
        </div>
      </div>

      {/* Bottom Area: Form Feedback */}
      <div className="flex flex-col items-center justify-end pb-8">
        <div className={`px-6 py-4 rounded-2xl backdrop-blur-md border text-center transition-all shadow-xl
          ${metrics.isArmsLocked 
            ? 'bg-white/90 border-white/50' 
            : 'bg-red-50 border-red-500 scale-105 shadow-red-500/30'}`}>
          <p className={`font-bold text-lg ${metrics.isArmsLocked ? 'text-[#1A2816]' : 'text-red-600'}`}>
            {metrics.isArmsLocked ? t("cpr.armsLocked", "✓ Arms Locked") : t("cpr.keepArmsStraight", "⚠ Keep Arms Straight")}
          </p>
          {!metrics.isArmsLocked && (
            <p className="text-xs text-red-500 mt-1">{t("cpr.dontBendElbows", "Don't bend your elbows during compressions")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
