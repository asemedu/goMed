import React, { useState } from "react";
import {
  Heart,
  Shield,
  Activity,
  Layers,
  Sparkles,
  Boxes,
  Camera,
  ArrowRight,
  X,
} from "lucide-react";

interface ARHubScreenProps {
  onSelectMovement: (movement: any, mode: "learn" | "try") => void;
}

export function ARHubScreen({ onSelectMovement }: ARHubScreenProps) {
  const [activeMovementModal, setActiveMovementModal] = useState<any | null>(
    null
  );

  const movements = [
    {
      id: "cpr",
      title: "Cardiopulmonary Resuscitation (CPR)",
      subtitle: "Chest compressions & rhythm control",
      category: "Basic Life Support",
      stats: "100-120 BPM · 5-6 cm Depth",
      difficulty: "High Priority",
      icon: Heart,
      has3D: true,
      details:
        "Perform rhythmic chest compressions directly on the center of the chest. Maintain locked elbows and vertical shoulder alignment to generate effective blood flow.",
    },
    {
      id: "heimlich",
      title: "Heimlich Maneuver",
      subtitle: "Abdominal thrusts for airway obstruction",
      category: "Choking Emergency",
      stats: "Upward & Inward Thrusts",
      difficulty: "Essential",
      icon: Shield,
      has3D: false,
      details:
        "Stand behind the patient, place a fist above the navel, and deliver quick, inward-and-upward abdominal thrusts to dislodge the foreign object.",
    },
    {
      id: "recovery",
      title: "Recovery Position (PLS)",
      subtitle: "Lateral alignment for breathing victim",
      category: "Patient Positioning",
      stats: "Clear Airway & Stable Base",
      difficulty: "Core Skill",
      icon: Activity,
      has3D: false,
      details:
        "Roll an unresponsive breathing patient onto their side to keep their airway open and prevent aspiration of fluids.",
    },
    {
      id: "tourniquet",
      title: "Pressure Dressing & Bandaging",
      subtitle: "Direct wound compression technique",
      category: "Trauma & Hemorrhage",
      stats: "Continuous Direct Force",
      difficulty: "Vital",
      icon: Layers,
      has3D: false,
      details:
        "Apply firm, uninterrupted pressure with both hands directly over the bleeding site using sterile gauze or a pressure dressing.",
    },
  ];

  return (
    <div className="flex flex-col px-5 py-5 pb-24" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            AR & Computer Vision
          </span>
          <span className="bg-[#B3D59F] text-[#1A3312] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Interactive
          </span>
        </div>
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          AR Medical Movements
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Learn 3D animations and analyze your own body movements with AI
        </p>
      </div>

      {/* Feature Banner */}
      <div className="bg-[#1A2816] text-white rounded-3xl p-5 mb-5 shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={16} className="text-[#B3D59F]" />
            <span
              className="text-[11px] font-bold text-[#B3D59F] uppercase tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              AI Movement Analysis
            </span>
          </div>
          <h3
            className="text-[16px] font-extrabold mb-1"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Real-Time Posture Feedback
          </h3>
          <p className="text-[12px] text-white/80 leading-relaxed max-w-[260px]">
            Select any medical procedure below to see it in 3D or practice with your camera.
          </p>
        </div>
        <div className="absolute right-3 -bottom-2 text-[#B3D59F]/15">
          <Boxes size={110} />
        </div>
      </div>

      {/* Movements Grid */}
      <div className="space-y-3.5 flex-1">
        {movements.map((move) => {
          const Icon = move.icon;
          return (
            <div
              key={move.id}
              onClick={() => setActiveMovementModal(move)}
              className="bg-white border border-[#E8EDE6] hover:border-[#B3D59F] hover:bg-[#F7FBF5] p-4 rounded-2xl shadow-sm cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-1.5 py-0.5 rounded uppercase"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      {move.category}
                    </span>
                    <span className="text-[10px] text-[#6B7C6B] font-bold ml-auto uppercase">
                      {move.difficulty}
                    </span>
                  </div>
                  <h3
                    className="text-[15px] font-bold text-[#1A2816] mt-1"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {move.title}
                  </h3>
                </div>
              </div>

              <p
                className="text-[12px] text-[#6B7C6B] line-clamp-1 mb-3"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {move.subtitle}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0F5EE]">
                <span
                  className="text-[11px] font-semibold text-[#6B7C6B] flex items-center gap-1"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  <Activity size={12} className="text-[#3D6B2A]" /> {move.stats}
                </span>
                <span
                  className="text-[11px] font-extrabold text-[#3D6B2A] bg-[#F0F8EC] border border-[#D4ECC5] px-2.5 py-1 rounded-xl"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  Options →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Movement Action Modal */}
      {activeMovementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-[350px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8EDE6] relative animate-fadeIn"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            <button
              onClick={() => setActiveMovementModal(null)}
              className="absolute top-4 right-4 text-[#6B7C6B] hover:text-[#1A2816] p-1.5 rounded-full hover:bg-[#F0F5EE]"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] flex items-center justify-center mb-3">
              <Boxes size={24} />
            </div>

            <span
              className="text-[10px] font-extrabold text-[#3D6B2A] uppercase tracking-wider block mb-0.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {activeMovementModal.category}
            </span>
            <h3
              className="text-[18px] font-extrabold text-[#1A2816] mb-1.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {activeMovementModal.title}
            </h3>
            <p className="text-[12px] text-[#6B7C6B] mb-5 leading-relaxed">
              {activeMovementModal.details}
            </p>

            {/* Action Choice Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  const m = activeMovementModal;
                  setActiveMovementModal(null);
                  onSelectMovement(m, "learn");
                }}
                className="w-full p-4 rounded-2xl bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#1A3312] flex items-center justify-between hover:bg-[#E2F0DC] active:scale-[0.98] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#B3D59F] flex items-center justify-center text-[#1A3312] shrink-0 shadow-sm">
                    <Boxes size={20} />
                  </div>
                  <div>
                    <p
                      className="text-[14px] font-extrabold"
                      style={{ fontFamily: "'Lexend', sans-serif" }}
                    >
                      1. Learn (3D & AR Demo)
                    </p>
                    <p className="text-[11px] text-[#6B7C6B]">
                      Inspect animated 3D model & step guide
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#3D6B2A]" />
              </button>

              <button
                onClick={() => {
                  const m = activeMovementModal;
                  setActiveMovementModal(null);
                  onSelectMovement(m, "try");
                }}
                className="w-full p-4 rounded-2xl bg-white border border-[#D8E8D0] text-[#1A2816] flex items-center justify-between hover:bg-[#F7FBF5] active:scale-[0.98] transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
                    <Camera size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-[14px] font-extrabold"
                        style={{ fontFamily: "'Lexend', sans-serif" }}
                      >
                        2. Try it Out
                      </p>
                      <span className="text-[8px] font-extrabold bg-[#B3D59F] text-[#1A3312] px-1.5 py-0.5 rounded uppercase">
                        AI
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7C6B]">
                      MediaPipe camera posture analysis
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#6B7C6B]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
