import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import { Activity } from "lucide-react";

interface ARTryScreenProps {
  movement: any;
  onBack: () => void;
}

export function ARTryScreen({ movement, onBack }: ARTryScreenProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span
            className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            AI Movement Analysis
          </span>
          <h2
            className="text-[18px] font-extrabold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {movement?.title || "Movement Tracking"}
          </h2>
        </div>
        <span className="bg-[#B3D59F] text-[#1A3312] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
          MediaPipe Live
        </span>
      </div>

      {/* Camera Viewfinder */}
      <div
        className="bg-[#1A2816] rounded-3xl overflow-hidden mb-4 relative mx-auto w-full shadow-lg"
        style={{ aspectRatio: "4/5", maxWidth: 330 }}
      >
        <Webcam
          audio={false}
          ref={webcamRef}
          videoConstraints={{ facingMode: "user" }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Corner brackets */}
        {([
          ["top-4 left-4", "rounded-tl-xl border-t-2 border-l-2 border-r-0 border-b-0"],
          ["top-4 right-4", "rounded-tr-xl border-t-2 border-r-2 border-l-0 border-b-0"],
          ["bottom-4 left-4", "rounded-bl-xl border-b-2 border-l-2 border-r-0 border-t-0"],
          ["bottom-4 right-4", "rounded-br-xl border-b-2 border-r-2 border-l-0 border-t-0"],
        ] as [string, string][]).map(([pos, border], i) => (
          <div
            key={i}
            className={`absolute ${pos} w-9 h-9 ${border} border-[#B3D59F] z-10`}
          />
        ))}

        {/* Calibration Box / Posture Guide Skeleton Outline */}
        <div className="absolute inset-10 border border-dashed border-[#B3D59F]/50 rounded-2xl flex flex-col items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 rounded-full border border-[#B3D59F]/60 mb-2" />
          <div className="w-28 h-20 border border-[#B3D59F]/60 rounded-xl" />
          <span className="text-[10px] text-[#B3D59F] font-bold mt-2 bg-black/50 px-2 py-0.5 rounded-full">
            Align torso & arms here
          </span>
        </div>

        {/* Status tag */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          <span
            className="bg-black/65 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#B3D59F] animate-ping" />
            {isAnalyzing
              ? "Tracking Posture · 30 FPS"
              : "Camera Initialized & Calibrated"}
          </span>
        </div>
      </div>

      {/* Feedback Card */}
      <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <Activity size={16} className="text-[#3D6B2A]" />
          <p
            className="text-[13px] font-extrabold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Live Posture Guidelines
          </p>
        </div>
        <ul
          className="text-[12px] text-[#6B7C6B] space-y-1 list-disc pl-4"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <li>Keep arms straight with locked elbows at 90° angle.</li>
          <li>Position body directly above the patient.</li>
          <li>Maintain target compression rhythm of 100-120 per minute.</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-2 mt-auto">
        <button
          onClick={() => setIsAnalyzing(!isAnalyzing)}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {isAnalyzing ? "Stop Analysis" : "Start Live Movement Tracking"}
        </button>

        <button
          onClick={onBack}
          className="w-full py-2.5 text-[#6B7C6B] font-bold text-[13px] hover:text-[#1A2816]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Back to AR Movements
        </button>
      </div>
    </div>
  );
}
