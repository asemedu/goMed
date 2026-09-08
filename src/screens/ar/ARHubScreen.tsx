import React, { useState, useRef } from "react";
import "@google/model-viewer";
import { Play, Pause, Phone, Zap, ChevronRight } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface ARHubScreenProps {
  onSelectMovement: (movement: any, mode: "learn" | "try") => void;
  onStartCPRPractice: () => void;
}

export function ARHubScreen({ onStartCPRPractice }: ARHubScreenProps) {
  const { t } = useLanguage();
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

  // Use the Vite base path dynamically so it works on both localhost and gh-pages
  const base = import.meta.env.BASE_URL || "/";
  const iosSrc = `${base}assets/New-CPR-with-audio.usdz#allowsContentScaling=1`;
  const glbSrc = `${base}assets/New-CPR-dummy.glb`;

  return (
    <div className="flex flex-col px-5 py-5 pb-24" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {t("ar.badge", "AR & Computer Vision")}
          </span>
          <span className="bg-[#B3D59F] text-[#1A3312] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            {t("ar.interactive", "Interactive")}
          </span>
        </div>
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("ar.title", "Practică AR")}
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {t("ar.subtitle", "Vizualizează manechinul în 3D și exersează RCP în timp real")}
        </p>
      </div>

      {/* 112 AR Mannequin Card */}
      <div className="bg-white border border-[#E8EDE6] rounded-3xl overflow-hidden mb-4 shadow-sm flex flex-col">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-red-500" />
            </div>
            <div>
              <p
                className="text-[13px] font-extrabold text-[#1A2816]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("ar.mannequinTitle", "Apel 112 – Manechin CPR")}
              </p>
              <p
                className="text-[11px] text-[#6B7C6B]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("ar.mannequinSubtitle", "Vizualizează sau plasează manechinul în AR")}
              </p>
            </div>
          </div>
        </div>

        {/* Play/Pause Button Overlay for Web Viewer - exactly like CPRScreen */}
        <div className="relative w-full min-h-[400px]">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleAnimation}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-[#E8EDE6] text-[#1A2816] font-bold text-[12px] active:scale-95 transition-all cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {isPlaying ? (
                <>
                  <Pause size={16} className="text-[#3D6B2A]" /> Pauză
                </>
              ) : (
                <>
                  <Play size={16} className="text-[#3D6B2A]" /> Play
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
            {/* The exact solution from alex_gemini branch: an <a> tag with href and rel="ar" */}
            <a
              slot="ar-button"
              href={iosSrc}
              rel="ar"
              className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-red-500 text-white font-extrabold text-[14px] shadow-lg hover:bg-red-600 active:scale-95 transition-all whitespace-nowrap flex items-center gap-2"
              style={{ fontFamily: "'Lexend', sans-serif", textDecoration: "none" }}
            >
              <Phone size={16} />
              {t("ar.viewMannequinAR", "Plasează manechinul (AR)")}
            </a>
          </model-viewer>
        </div>
      </div>

      {/* Live CPR Practice Card */}
      <button
        onClick={onStartCPRPractice}
        className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between hover:bg-blue-100 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p
              className="font-extrabold text-[#1A2816] text-[15px]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("dashboard.liveCPRTitle", "Live CPR Practice")}
            </p>
            <p
              className="text-[12px] text-[#6B7C6B]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t("dashboard.liveCPRSubtitle", "Real-time AI camera feedback")}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[#6B7C6B]" />
      </button>
    </div>
  );
}
