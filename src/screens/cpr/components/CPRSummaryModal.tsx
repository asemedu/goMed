import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { storage, STORAGE_KEYS, CachedProfile } from '../../../lib/storage';
import { Trophy, Activity, ArrowRight, ShieldCheck, Timer } from 'lucide-react';

interface Props {
  stats: {
    totalCompressions: number;
    goodCompressions: number;
    lockedPercentage: number;
  };
  onFinish: () => void;
}

export function CPRSummaryModal({ stats, onFinish }: Props) {
  const [xpEarned, setXpEarned] = useState(0);
  const [saving, setSaving] = useState(true);
  const [mounted, setMounted] = useState(false);
  const hasProcessed = useRef(false);

  // Calculate Rhythm %
  const pacePercentage = stats.totalCompressions > 0 
    ? Math.round((stats.goodCompressions / stats.totalCompressions) * 100) 
    : 0;

  const isPaceGood = pacePercentage >= 80;
  const isFormGood = stats.lockedPercentage >= 85;

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setMounted(true), 100);

    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      // XP Calculation logic
      const baseXP = 50; // Base for completing the 1 minute drill
      const cadenceXP = stats.goodCompressions; // +1 XP per good compression
      const formBonusXP = isFormGood ? 20 : 0; // Bonus for good form
      const rhythmBonusXP = isPaceGood ? 20 : 0; // Bonus for consistent rhythm

      const totalXpEarned = baseXP + cadenceXP + formBonusXP + rhythmBonusXP;
      setXpEarned(totalXpEarned);

      // Save to Supabase
      const profile = storage.get<CachedProfile | null>(STORAGE_KEYS.PROFILE, null);
      if (profile && profile.id) {
        try {
          // Call the new RPC function to securely update XP, streak, and activities count
          await supabase.rpc('record_activity', { xp_earned: totalXpEarned, activity_title: 'CPR Practice Drill' });
          
          // Re-fetch the updated profile to sync local storage accurately
          const { data: updatedProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile.id)
            .single();
            
          if (updatedProfile) {
            storage.set(STORAGE_KEYS.PROFILE, updatedProfile);
          }
        } catch (error) {
          console.error("Failed to sync XP:", error);
        }
      }
      setSaving(false);
    };

    processSession();
  }, [stats, isPaceGood, isFormGood]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-50 bg-black/60 backdrop-blur-sm">
      <div 
        className={`w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl border border-white/50 transition-all duration-700 ease-out transform ${mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
      >
        {/* Top Trophy Icon */}
        <div className="w-20 h-20 bg-[#F0F8EC] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#B3D59F]/30 relative">
          <Trophy size={40} className="text-[#84B663] absolute z-10" />
          <div className="absolute inset-0 bg-[#84B663] opacity-20 rounded-full animate-ping" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#1A3312] mb-1" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Session Complete!
        </h2>
        <p className="text-sm font-bold text-[#6B7C6B] uppercase tracking-widest mb-8">
          CPR Practice Drill
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 mb-8">
          {/* Total Compressions Stat */}
          <div className="p-3 rounded-2xl flex flex-col items-center justify-center border bg-gray-50 border-gray-200">
            <Activity size={20} className="mb-2 text-gray-400" />
            <span className="text-xl font-bold text-[#1A2816] mb-0.5">{stats.totalCompressions}</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-center">
              Total<br/>Comps
            </span>
          </div>

          {/* Rhythm/Pace Stat */}
          <div className={`p-3 rounded-2xl flex flex-col items-center justify-center border ${isPaceGood ? 'bg-[#F0F8EC] border-[#B3D59F]/50' : 'bg-gray-50 border-gray-200'}`}>
            <Timer size={20} className={`mb-2 ${isPaceGood ? 'text-[#84B663]' : 'text-gray-400'}`} />
            <span className="text-xl font-bold text-[#1A2816] mb-0.5">{pacePercentage}%</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-center">
              Good<br/>Rhythm
            </span>
          </div>

          {/* Form Stat */}
          <div className={`p-3 rounded-2xl flex flex-col items-center justify-center border ${isFormGood ? 'bg-[#F0F8EC] border-[#B3D59F]/50' : 'bg-gray-50 border-gray-200'}`}>
            <ShieldCheck size={20} className={`mb-2 ${isFormGood ? 'text-[#84B663]' : 'text-gray-400'}`} />
            <span className="text-xl font-bold text-[#1A2816] mb-0.5">{stats.lockedPercentage}%</span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide text-center">
              Elbows<br/>Locked
            </span>
          </div>
        </div>

        {/* XP Reward Section */}
        <div className="w-full bg-[#1A3312] rounded-2xl p-5 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[11px] font-bold text-[#B3D59F] uppercase tracking-wider mb-1">XP Earned</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-lexend">+{saving ? '...' : xpEarned}</span>
                <span className="text-sm font-bold text-white/70">XP</span>
              </div>
            </div>
            {!saving && (
              <div className="bg-[#B3D59F]/20 px-3 py-1.5 rounded-full border border-[#B3D59F]/30">
                <span className="text-xs font-bold text-[#B3D59F]">Awesome!</span>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onFinish}
          disabled={saving}
          className="w-full h-14 bg-[#1A3312] text-white rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#2A4A1F] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {saving ? 'Saving...' : 'Continue'}
          {!saving && <ArrowRight size={20} strokeWidth={2.5} />}
        </button>
      </div>
    </div>
  );
}
