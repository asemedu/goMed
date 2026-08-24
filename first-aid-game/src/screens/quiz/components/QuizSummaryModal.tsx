import React, { useEffect, useState } from "react";
import { CheckCircle, Clock, Zap, Target } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { storage, STORAGE_KEYS } from "../../../lib/storage";

interface QuizSummaryModalProps {
  totalXP: number;
  correctCount: number;
  totalQuestions: number;
  averageTimeMs: number;
  onClose: () => void;
}

export function QuizSummaryModal({
  totalXP,
  correctCount,
  totalQuestions,
  averageTimeMs,
  onClose,
}: QuizSummaryModalProps) {
  const [isSyncing, setIsSyncing] = useState(true);

  const avgTimeSeconds = (averageTimeMs / 1000).toFixed(1);
  const accuracy = Math.round((correctCount / totalQuestions) * 100) || 0;

  useEffect(() => {
    const syncXP = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Fetch current
          const { data: profile } = await supabase
            .from("profiles")
            .select("points")
            .eq("id", user.id)
            .single();

          const currentPoints = profile?.points || 0;
          const newTotal = currentPoints + totalXP;

          // Update DB
          await supabase
            .from("profiles")
            .update({ points: newTotal })
            .eq("id", user.id);

          // Update local cache
          const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
          if (cachedProfile) {
            storage.set(STORAGE_KEYS.PROFILE, {
              ...cachedProfile,
              points: newTotal,
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync Quiz XP:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    syncXP();
  }, [totalXP]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A2816]/40 backdrop-blur-md" />

      {/* Modal Content */}
      <div className="relative w-full max-w-[340px] bg-white rounded-[32px] p-6 shadow-2xl overflow-hidden border border-[#E8EDE6] animate-slideUp">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-3xl bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#3D6B2A] flex items-center justify-center shadow-lg">
            <CheckCircle size={32} strokeWidth={2.5} />
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-[11px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            Quiz Complete
          </span>
          <h2 className="text-[24px] font-extrabold text-[#1A2816] leading-tight mt-1">
            Great Knowledge!
          </h2>
        </div>

        {/* The Grid of Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total XP Earned (Takes full width if you want, or just a prominent block) */}
          <div className="col-span-2 bg-[#F7FBF5] rounded-2xl p-4 flex items-center justify-between border border-[#E8EDE6]">
            <div>
              <p className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider">
                Total XP Earned
              </p>
              <div className="flex items-center gap-1 mt-1 text-[#1A3312]">
                <Zap size={18} className="text-[#3D6B2A] fill-current" />
                <span className="text-[28px] font-extrabold leading-none">
                  +{totalXP}
                </span>
              </div>
            </div>
            {isSyncing && (
              <div className="w-5 h-5 border-2 border-[#B3D59F] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Accuracy */}
          <div className="bg-[#FAFCF9] rounded-2xl p-3 border border-[#E8EDE6]">
            <p className="text-[10px] font-bold text-[#A0B09A] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Target size={12} /> Accuracy
            </p>
            <p className="text-[20px] font-extrabold text-[#1A2816]">
              {accuracy}%
            </p>
            <p className="text-[11px] text-[#6B7C6B] font-semibold mt-0.5">
              {correctCount} / {totalQuestions}
            </p>
          </div>

          {/* Average Speed */}
          <div className="bg-[#FAFCF9] rounded-2xl p-3 border border-[#E8EDE6]">
            <p className="text-[10px] font-bold text-[#A0B09A] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock size={12} /> Avg Speed
            </p>
            <p className="text-[20px] font-extrabold text-[#1A2816]">
              {avgTimeSeconds}s
            </p>
            <p className="text-[11px] text-[#6B7C6B] font-semibold mt-0.5">
              per question
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          disabled={isSyncing}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
