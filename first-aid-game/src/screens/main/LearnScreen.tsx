import React from "react";
import { Heart, Shield, Activity, Sparkles, BookOpen } from "lucide-react";

interface LearnScreenProps {
  onExploreCPR: () => void;
}

export function LearnScreen({ onExploreCPR }: LearnScreenProps) {
  const modules = [
    {
      id: "cpr",
      title: "Basic Life Support (BLS) & CPR",
      desc: "Chest compression mechanics, rescue breaths, automated external defibrillator (AED).",
      icon: Heart,
      tag: "ESSENTIAL",
      xp: "+120 XP",
      time: "8 min",
      status: "Available",
    },
    {
      id: "choking",
      title: "Choking & Airway Obstruction",
      desc: "Recognizing universal distress signal, back blows, and Heimlich maneuver.",
      icon: Shield,
      tag: "HIGH PRIORITY",
      xp: "+100 XP",
      time: "6 min",
      status: "Available",
    },
    {
      id: "hemorrhage",
      title: "Severe Bleeding & Tourniquets",
      desc: "Direct wound pressure, wound packing, and commercial tourniquet application.",
      icon: Activity,
      tag: "TRAUMA",
      xp: "+150 XP",
      time: "10 min",
      status: "Available",
    },
    {
      id: "burns",
      title: "Burns & Thermal Injuries",
      desc: "Assessing 1st to 3rd degree burns, cooling protocols, and dressing rules.",
      icon: Sparkles,
      tag: "FIRST AID",
      xp: "+80 XP",
      time: "5 min",
      status: "Coming Soon",
    },
  ];

  return (
    <div className="flex flex-col px-5 py-5 pb-24" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="mb-5">
        <span
          className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          First Aid Curriculum
        </span>
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Learn & Practice
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Interactive medical education modules and clinical flashcards
        </p>
      </div>

      {/* Overview Progress Card */}
      <div className="bg-[#F0F8EC] border border-[#D4ECC5] rounded-3xl p-5 mb-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p
              className="text-[15px] font-extrabold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Core Curriculum Progress
            </p>
            <p className="text-[12px] text-[#6B7C6B]">2 of 4 modules unlocked</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#B3D59F] flex items-center justify-center text-[#1A3312]">
            <BookOpen size={20} />
          </div>
        </div>
        <div className="w-full h-2 bg-[#D8E8D0] rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-[#3D6B2A] rounded-full" />
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-3.5 flex-1">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => {
                if (mod.id === "cpr") onExploreCPR();
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
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                    mod.status === "Available"
                      ? "bg-[#B3D59F] text-[#1A3312]"
                      : "bg-[#E8EDE6] text-[#6B7C6B]"
                  }`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {mod.status === "Available" ? "Start Lesson →" : "Locked"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
