import React from "react";
import { Heart, Shield, Activity, BookOpen, HelpCircle } from "lucide-react";

interface QuizzesScreenProps {
  onExploreCPR: () => void;
  onSelectQuiz: (category: string) => void;
}

export function QuizzesScreen({ onExploreCPR, onSelectQuiz }: QuizzesScreenProps) {
  const modules = [
    {
      id: "bls",
      title: "Basic Life Support & CPR",
      desc: "Chest compression mechanics, rescue breaths, and AED usage.",
      icon: Heart,
      tag: "QUIZ",
      xp: "Up to +200 XP",
      time: "5-10 min",
      status: "Available",
    },
    {
      id: "choking",
      title: "Choking & Airway Obstruction",
      desc: "Recognizing distress, back blows, and abdominal thrusts.",
      icon: Shield,
      tag: "QUIZ",
      xp: "Up to +160 XP",
      time: "5-8 min",
      status: "Available",
    },
    {
      id: "trauma",
      title: "Severe Bleeding & Trauma",
      desc: "Direct wound pressure, wound packing, and tourniquets.",
      icon: Activity,
      tag: "QUIZ",
      xp: "Up to +160 XP",
      time: "5-8 min",
      status: "Available",
    },
  ];

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="mb-5">
        <span
          className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Test Your Knowledge
        </span>
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Quizzes & Challenges
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Earn XP by completing time-based clinical quizzes.
        </p>
      </div>

      {/* Modules List */}
      <div className="space-y-3.5 flex-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (mod.status === "Available") {
                  onSelectQuiz(mod.id);
                }
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                mod.status === "Available"
                  ? "bg-white border-[#E8EDE6] hover:border-[#B3D59F] hover:bg-[#F7FBF5] shadow-sm active:scale-[0.99]"
                  : "bg-[#FAFCF9] border-[#E8EDE6] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-1.5 py-0.5 rounded uppercase"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      {mod.tag}
                    </span>
                    <span className="text-[11px] text-[#A0B09A] ml-auto font-semibold">
                      {mod.time}
                    </span>
                  </div>
                  <h3
                    className="text-[15px] font-bold text-[#1A2816] mt-1 truncate"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {mod.title}
                  </h3>
                </div>
              </div>

              <p
                className="text-[12px] text-[#6B7C6B] line-clamp-2 mb-3"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {mod.desc}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0F5EE]">
                <span
                  className="text-[11px] font-bold text-[#3D6B2A]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {mod.xp}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${
                    mod.status === "Available"
                      ? "bg-[#B3D59F] text-[#1A3312]"
                      : "bg-[#E8EDE6] text-[#6B7C6B]"
                  }`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {mod.status === "Available" ? (
                    <>
                      <HelpCircle size={14} /> Start Quiz
                    </>
                  ) : (
                    "Locked"
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
