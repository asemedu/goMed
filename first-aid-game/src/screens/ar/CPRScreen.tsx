import React, { useState, useRef } from "react";
import "@google/model-viewer";
import { Play, Pause, ChevronRight } from "lucide-react";

interface CPRScreenProps {
  onNext: () => void;
}

export function CPRScreen({ onNext }: CPRScreenProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const modelRef = useRef<any>(null);

  const toggleAnimation = () => {
    if (modelRef.current) {
      if (isPlaying) {
        modelRef.current.pause();
      } else {
        modelRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const iosSrc = "/assets/recv_cpr.usdz#allowsContentScaling=1";
  const glbSrc = "/assets/New-CPR-dummy.glb";

  return (
    <div className="flex flex-col h-full relative" style={{ minHeight: 740 }}>
      {/* Title Area */}
      <div className="px-6 pt-4 pb-2 text-center">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          CPR Motion Study
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Interactive 3D Dummy & AR View
        </p>
      </div>

      {/* Model Viewer Container */}
      <div className="flex-1 w-full relative min-h-[400px]">
        {/* Play/Pause Button Overlay for Web Viewer */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={toggleAnimation}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-[#E8EDE6] text-[#1A2816] font-bold text-[12px] active:scale-95 transition-all"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {isPlaying ? (
              <>
                <Pause size={16} className="text-[#3D6B2A]" /> Pause Anim
              </>
            ) : (
              <>
                <Play size={16} className="text-[#3D6B2A]" /> Play Anim
              </>
            )}
          </button>
        </div>

        <model-viewer
          ref={modelRef}
          src={glbSrc}
          ios-src={iosSrc}
          ar
          ar-modes="quick-look scene-viewer webxr"
          ar-scale="auto"
          ar-placement="floor"
          camera-controls
          touch-action="pan-y"
          quick-look-browsers="safari chrome"
          autoplay
          shadow-intensity="1"
          style={{ width: "100%", height: "100%", minHeight: "420px" }}
        >
          <button
            slot="ar-button"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-[#3D6B2A] text-white font-extrabold text-[14px] shadow-lg hover:bg-[#2e5220] active:scale-95 transition-all whitespace-nowrap cursor-pointer z-20"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            View Dummy on Floor (AR)
          </button>
        </model-viewer>
      </div>

      {/* Continue CTA */}
      <div className="p-5 bg-white border-t border-[#E8EDE6]">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Continue <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
