import './styles/fonts.css';
import './styles/tailwind.css';
import './styles/globals.css';
import './styles/index.css';
import './App.css';
import { supabase } from './lib/supabaseClient';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        'ios-src'?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean;
        'touch-action'?: string;
        'quick-look-browsers'?: string;
        autoplay?: boolean;
        'shadow-intensity'?: string;
        alt?: string;
      }, HTMLElement>;
    }
  }
}

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart, Shield, QrCode, ChevronRight, Smartphone,
  Zap, Users, Trophy, BookOpen, Lock,
  Eye, EyeOff, CheckCircle, Wifi, Camera,
  ArrowRight, Send, Clock, Star, Apple, ArrowLeft,
  Play, Pause
} from "lucide-react";

type Screen = "landing" | "cpr" | "onboarding" | "auth" | "dashboard" | "lobby";
const SCREENS: Screen[] = ["landing", "cpr", "onboarding", "auth", "dashboard", "lobby"];
const LABELS = ["Landing", "CPR 3D", "Onboard", "Sign In", "Dashboard", "Lobby"];

// Simple SVG QR code pattern
function QRCodeSVG({ size = 120 }: { size?: number }) {
  const rows = [
    "1111111011010111111",
    "1000001001010100001",
    "1011101011000101101",
    "1011101000110101101",
    "1011101010100101101",
    "1000001010010100001",
    "1111111010101111111",
    "0000000011000000000",
    "1011011101101101011",
    "0100100010100010100",
    "1101011011010110101",
    "0010100100001001010",
    "1010111010110101011",
    "0000000001010010101",
    "1111111011001010111",
    "1000001001010101010",
    "1011101010110110101",
    "1000001001001001010",
    "1111111010101010101",
  ];
  const cols = rows[0].length;
  const cell = size / cols;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rows.map((row, y) =>
        row.split("").map((c, x) =>
          c === "1" ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              rx={cell * 0.15}
              fill="#1A2816"
            />
          ) : null
        )
      )}
    </svg>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[390px] bg-white rounded-[48px] shadow-2xl border-[8px] border-[#1A2816] overflow-hidden flex flex-col"
      style={{ minHeight: 820 }}>
      {/* Status bar */}
      <div className="flex items-center justify-between px-7 pt-3.5 pb-1.5 shrink-0">
        <span className="text-[11px] font-bold text-[#1A2816]">9:41</span>
        <div className="w-[88px] h-[26px] bg-[#1A2816] rounded-full" />
        <div className="flex items-center gap-1">
          <Wifi size={11} className="text-[#1A2816]" />
          <span className="text-[11px] font-bold text-[#1A2816]">100%</span>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none">{children}</div>
      {/* Home indicator */}
      <div className="flex justify-center py-2.5 shrink-0">
        <div className="w-32 h-1 bg-[#1A2816] rounded-full opacity-25" />
      </div>
    </div>
  );
}

// ─── Screen 1: Landing ────────────────────────────────────────────────
function LandingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col" style={{ minHeight: 740 }}>
      <div className="flex-1 flex flex-col items-center justify-center px-7 gap-7 pt-10">
        {/* Logo */}
        <div className="w-[140px] h-[140px] rounded-[36px] bg-[#F0F8EC] border-2 border-[#B3D59F] flex flex-col items-center justify-center shadow-lg gap-1.5">
          <Heart size={44} strokeWidth={2} className="text-[#B3D59F]" fill="#B3D59F" />
          <span
            className="text-2xl font-extrabold text-[#1A3312] tracking-[0.15em]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            ASEM
          </span>
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1
            className="text-[32px] font-extrabold text-[#1A2816] leading-tight mb-3"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Master First Aid,<br />Save Lives.
          </h1>
          <p className="text-[15px] text-[#6B7C6B] leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Level up your emergency response skills through gamified, real-world training scenarios.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {["Gamified Learning", "XP & Levels", "Real Scenarios", "Certified"].map((label) => (
            <span
              key={label}
              className="px-3 py-1.5 rounded-full bg-[#F0F8EC] text-[#3D6B2A] text-[12px] font-bold border border-[#C8E8B5]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-7 pb-4">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Get Started <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Sponsor footer */}
      <div className="border-t border-[#E8F0E4] mx-5 pt-4 pb-3">
        <p
          className="text-center text-[11px] text-[#A0B09A] mb-3 font-semibold uppercase tracking-widest"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Supported by
        </p>
        <div className="flex items-center justify-center gap-5">
          {[
            { icon: Shield, label: "WHO" },
            { icon: Heart, label: "ICRC" },
            { icon: Users, label: "NGO" },
            { icon: Star, label: "UN" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center">
                <Icon size={17} className="text-[#B3D59F]" />
              </div>
              <span
                className="text-[10px] text-[#A0B09A] font-bold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Screen: CPR 3D Dummy ──────────────────────────────────────────────
function CPRScreen({ onNext }: { onNext: () => void }) {
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
        <p className="text-[13px] text-[#6B7C6B] mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
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
          <a
            slot="ar-button"
            href={iosSrc}
            rel="ar"
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-[#3D6B2A] text-white font-extrabold text-[14px] shadow-lg hover:bg-[#2e5220] active:scale-95 transition-all whitespace-nowrap"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            View Dummy on Floor (AR)
          </a>
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

// ─── Screen 2: Onboarding ────────────────────────────────────────────
function OnboardingScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="relative flex flex-col" style={{ minHeight: 740 }}>
      <div className="px-6 pt-5 pb-2">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Before You Begin
        </h2>
        <p className="text-[13px] text-[#6B7C6B] mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Please review the following information
        </p>
      </div>

      <div className="px-5 space-y-4 pb-28 overflow-y-auto">
        {/* Card 1: App Resumé */}
        <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#B3D59F] flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-[#1A3312]" />
            </div>
            <div>
              <h3
                className="font-bold text-[#1A2816] text-[15px]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                App Resumé
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                What you will learn & earn
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { icon: Trophy, text: "Earn XP and level up your first-aid rank through live challenges" },
              { icon: Zap, text: "Real-time multiplayer scenarios via QR lobby system" },
              { icon: Star, text: "Unlock badges and certifications as you progress" },
              { icon: Users, text: "Compete and collaborate with peers in live training sessions" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#E0F2D8] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={12} className="text-[#3D6B2A]" />
                </div>
                <p
                  className="text-[13px] text-[#3D4A3D] leading-snug"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: System Requirements */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F0F0F8] flex items-center justify-center shrink-0">
              <Smartphone size={18} className="text-[#4A4A7A]" />
            </div>
            <div>
              <h3
                className="font-bold text-[#1A2816] text-[15px]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                System Requirements
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Supported browsers only
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              {
                icon: Apple,
                iconColor: "text-[#1A2816]",
                iconBg: "bg-[#F5F5F8]",
                title: "iPhone users",
                sub: "Use Safari browser",
              },
              {
                icon: () => (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                ),
                iconColor: "",
                iconBg: "bg-white",
                title: "Android users",
                sub: "Use Chrome browser",
              },
            ].map(({ icon: Icon, iconColor, iconBg, title, sub }, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F8FB] border border-[#EBEBF2]">
                <div className={`w-8 h-8 rounded-lg ${iconBg} border border-[#E0E0EA] flex items-center justify-center shrink-0`}>
                  <Icon className={iconColor} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-[13px] font-bold text-[#1A2816]"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {title}
                  </p>
                  <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {sub}
                  </p>
                </div>
                <CheckCircle size={16} className="text-[#B3D59F]" />
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Privacy & GDPR */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E2] flex items-center justify-center shrink-0">
              <Lock size={18} className="text-[#3D6B2A]" />
            </div>
            <div>
              <h3
                className="font-bold text-[#1A2816] text-[15px]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                Privacy & GDPR
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Your data is protected
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center py-4 mb-3 bg-[#F7FBF5] rounded-xl border border-[#E0F0D8]">
            <Shield size={40} className="text-[#B3D59F] mb-2" />
            <p
              className="font-extrabold text-[#1A2816] text-[16px]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Your data is 100% safe.
            </p>
            <p
              className="text-center text-[13px] text-[#6B7C6B] mt-1 px-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              We never collect personal medical data or share information with third parties.
            </p>
          </div>
          <div className="bg-[#FFF4F6] border border-[#FCC8D0] rounded-xl p-3 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#FDE8EB] flex items-center justify-center shrink-0">
              <Camera size={14} className="text-[#C0384E]" />
            </div>
            <p
              className="text-[13px] font-bold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Videos are{" "}
              <span className="text-[#C0384E]">NEVER</span> saved.
            </p>
          </div>
        </div>
      </div>

      {/* Pinned Next */}
      <div className="absolute bottom-8 left-0 right-0 px-5">
        <div className="bg-white/90 backdrop-blur-sm pt-3 rounded-t-2xl">
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Next <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 3: Auth ──────────────────────────────────────────────────
function AuthScreen({ onNext }: { onNext: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuth = async () => {
    setErrorMsg("");
    if (!username || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (mode === "signup" && password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: username,
          password: password,
        });
        if (error) throw error;
        onNext();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: username,
          password: password,
        });
        if (error) throw error;
        onNext();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-7 py-7" style={{ minHeight: 740 }}>
      <div className="flex-1 flex flex-col justify-center">
        {/* Icon + heading */}
        <div className="mb-7">
          <div className="w-14 h-14 rounded-2xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center mb-5">
            <Heart size={26} className="text-[#B3D59F]" fill="#B3D59F" />
          </div>
          <h1
            className="text-[26px] font-extrabold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {mode === "login" ? "Welcome back!" : "Create Account"}
          </h1>
          <p
            className="text-[14px] text-[#6B7C6B] mt-1"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {mode === "login"
              ? "Sign in to continue your training"
              : "Start your first-aid journey today"}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#F0F5EE] rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 ${mode === m
                ? "bg-white text-[#1A2816] shadow-sm"
                : "text-[#6B7C6B]"
                }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label
              className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username or email"
              className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            />
          </div>
          <div>
            <label
              className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0B09A] hover:text-[#3D6B2A] transition-colors"
              >
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          {mode === "login" && (
            <div className="text-right">
              <button
                className="text-[13px] text-[#3D6B2A] font-bold hover:underline"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Forgot password?
              </button>
            </div>
          )}
          {mode === "signup" && (
            <div>
              <label
                className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-xl font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 mt-6 disabled:opacity-70 disabled:active:scale-100"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {loading ? "Please wait..." : (mode === "login" ? "Log In" : "Create Account")}
        </button>

        <p
          className="text-center text-[14px] text-[#6B7C6B] mt-5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {mode === "login" ? (
            <>
              {"Don't have an account? "}
              <button
                onClick={() => setMode("signup")}
                className="text-[#3D6B2A] font-extrabold hover:underline"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {"Already have an account? "}
              <button
                onClick={() => setMode("login")}
                className="text-[#3D6B2A] font-extrabold hover:underline"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// ─── Screen 4: Dashboard ─────────────────────────────────────────────
function DashboardScreen({ onScan }: { onScan: () => void }) {
  const xp = 1240;
  const level = 7;
  const progress = 68;

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Greeting row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p
            className="text-[13px] text-[#6B7C6B] font-semibold"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Good morning,
          </p>
          <h2
            className="text-[22px] font-extrabold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Alex Chen 👋
          </h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-[#B3D59F] flex items-center justify-center shadow-sm">
          <span
            className="text-[#1A3312] font-extrabold text-[15px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            AC
          </span>
        </div>
      </div>

      {/* Skill Score card */}
      <div className="bg-[#1A2816] rounded-2xl p-5 mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-[#B3D59F]/10 -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-[#B3D59F]/5 translate-y-8 -translate-x-5" />
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <p
              className="text-[#9DC885] text-[11px] font-bold uppercase tracking-widest"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              First-Aid Skill Score
            </p>
            <span
              className="bg-[#B3D59F]/20 text-[#B3D59F] text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              LVL {level}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span
              className="text-[42px] font-extrabold text-white leading-none"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {xp.toLocaleString()}
            </span>
            <span
              className="text-[#9DC885] text-[15px] mb-1.5 font-bold"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              XP
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span
                className="text-[#9DC885] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Level {level}
              </span>
              <span
                className="text-[#587058] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Level {level + 1}
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B3D59F] rounded-full"
                style={{ width: `${progress}%`, transition: "width 0.7s ease" }}
              />
            </div>
            <p
              className="text-[#587058] text-[11px] mt-1.5"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {progress}% to next level · {(2000 - (xp % 2000)).toLocaleString()} XP needed
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Challenges", value: "24", icon: Trophy },
          { label: "Day Streak", value: "7🔥", icon: Zap },
          { label: "Global Rank", value: "#142", icon: Star },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3 text-center"
          >
            <Icon size={15} className="text-[#B3D59F] mx-auto mb-1" />
            <p
              className="text-[17px] font-extrabold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {value}
            </p>
            <p
              className="text-[10px] text-[#6B7C6B] font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* QR Scan CTA — large, prominent */}
      <button
        onClick={onScan}
        className="w-full bg-[#F0F8EC] border-2 border-[#B3D59F] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#E8F5E2] active:scale-[0.98] transition-all duration-150 mb-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#B3D59F] flex items-center justify-center shadow-md">
          <QrCode size={32} className="text-[#1A3312]" strokeWidth={2} />
        </div>
        <div className="text-center">
          <p
            className="font-extrabold text-[#1A2816] text-[18px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Scan QR to Enter Lobby
          </p>
          <p
            className="text-[13px] text-[#6B7C6B] mt-0.5"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Join a live challenge session with your team
          </p>
        </div>
        <div
          className="flex items-center gap-1 text-[#3D6B2A] text-[13px] font-bold"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Tap to open camera <ArrowRight size={14} strokeWidth={2.5} />
        </div>
      </button>

      {/* Recent activity */}
      <p
        className="text-[14px] font-bold text-[#1A2816] mb-2.5"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        Recent Activity
      </p>
      <div className="space-y-2">
        {[
          { title: "CPR Basic Challenge", xp: "+120 XP", time: "2h ago" },
          { title: "Wound Care Module", xp: "+80 XP", time: "Yesterday" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-[#E8EDE6] rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-xl bg-[#E8F5E2] flex items-center justify-center shrink-0">
              <CheckCircle size={14} className="text-[#3D6B2A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13px] font-bold text-[#1A2816] truncate"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {item.title}
              </p>
              <p
                className="text-[11px] text-[#6B7C6B]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {item.time}
              </p>
            </div>
            <span
              className="text-[11px] font-bold text-[#3D6B2A] bg-[#E8F5E2] px-2 py-1 rounded-lg shrink-0"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {item.xp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Screen 5: Lobby ─────────────────────────────────────────────────
function LobbyScreen() {
  const [code, setCode] = useState("");
  const participants = ["Alex C.", "Maria L.", "James K."];
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCodeData) {
              setCode(qrCodeData.data);
            }
          }
        };
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    const interval = setInterval(capture, 500); // scan every 500ms
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      <div className="mb-5">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Challenge Lobby
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Scan QR or enter code to join
        </p>
      </div>

      {/* Camera viewfinder */}
      <div className="bg-[#1A2816] rounded-3xl overflow-hidden mb-5 relative mx-auto w-full"
        style={{ aspectRatio: "1/1", maxWidth: 300 }}>

        {/* Real camera feed */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "environment" }}
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

        {/* Scan line overlay over webcam */}
        <div
          className="absolute left-8 right-8 h-0.5 bg-[#B3D59F]/70 z-10"
          style={{
            top: "50%",
            boxShadow: "0 0 10px #B3D59F",
            animation: "scanline 2.2s ease-in-out infinite",
          }}
        />

        {/* Bottom label */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          <span
            className="bg-black/50 text-white text-[11px] font-bold px-3 py-1.5 rounded-full backdrop-blur-sm"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Scan QR to start challenge
          </span>
        </div>
      </div>

      {/* OR divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E0EAD8]" />
        <span
          className="text-[12px] font-bold text-[#A0B09A] bg-[#F0F5EE] px-3 py-1 rounded-full"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          OR
        </span>
        <div className="flex-1 h-px bg-[#E0EAD8]" />
      </div>

      {/* Manual code input */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter challenge code"
          maxLength={8}
          className="flex-1 px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[15px] font-mono tracking-widest uppercase"
        />
        <button className="w-12 h-12 rounded-xl bg-[#B3D59F] flex items-center justify-center hover:bg-[#9DC885] active:scale-95 transition-all shrink-0 shadow-sm self-center">
          <Send size={16} className="text-[#1A3312]" />
        </button>
      </div>

      {/* Waiting area */}
      <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-4 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#B3D59F]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
          <p
            className="text-[14px] font-bold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Waiting for participants...
          </p>
          <span
            className="ml-auto text-[11px] text-[#6B7C6B] bg-white border border-[#D4ECC5] px-2 py-0.5 rounded-lg font-bold"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {participants.length}/8
          </span>
        </div>
        <div className="space-y-2.5">
          {participants.map((name, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#B3D59F] flex items-center justify-center shrink-0">
                <span
                  className="text-[#1A3312] text-[12px] font-bold"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {name.charAt(0)}
                </span>
              </div>
              <span
                className="text-[14px] text-[#1A2816] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {name}
              </span>
              <div className="w-2 h-2 rounded-full bg-[#B3D59F] ml-auto" />
            </div>
          ))}
          <div className="flex items-center gap-2.5 opacity-45">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#B3D59F] flex items-center justify-center shrink-0">
              <span
                className="text-[#3D6B2A] text-[12px]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                ?
              </span>
            </div>
            <span
              className="text-[13px] text-[#6B7C6B]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Waiting to join...
            </span>
            <Clock size={13} className="text-[#A0B09A] ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App shell ───────────────────────────────────────────────────────
export default function App() {
  const [historyStack, setHistoryStack] = useState<Screen[]>(["landing"]);
  const current = historyStack[historyStack.length - 1];

  useEffect(() => {
    // Set initial state in history so we can detect back navigation to it
    window.history.replaceState({ screen: "landing", index: 0 }, "");

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.index === "number") {
        const newIndex = e.state.index;
        // Keep the stack aligned with the history index
        setHistoryStack(prev => prev.slice(0, newIndex + 1));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (s: Screen) => {
    const newIndex = historyStack.length;
    window.history.pushState({ screen: s, index: newIndex }, "", `?screen=${s}`);
    setHistoryStack(prev => [...prev, s]);
  };

  const goBack = () => {
    if (historyStack.length > 1) {
      window.history.back();
    }
  };

  return (
    <>
      <style>{`
        @keyframes scanline {
          0%   { top: 20%; }
          50%  { top: 80%; }
          100% { top: 20%; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        className="min-h-screen bg-[#EDF3E9] flex flex-col items-center justify-center py-0 sm:py-8 px-0 sm:px-4"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* The "Invisible Frame" that fixes the layout and scrolling */}
        <div className="w-full sm:max-w-[390px] h-[100dvh] sm:h-[820px] bg-white sm:rounded-[48px] sm:shadow-2xl overflow-hidden flex flex-col relative">

          {/* Back Button Header */}
          {historyStack.length > 1 && (
            <div className="w-full px-5 pt-5 pb-1 flex items-center justify-between z-10 shrink-0 bg-transparent gap-2">
              <button
                onClick={goBack}
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E8EDE6] flex items-center justify-center text-[#1A2816] hover:bg-white active:scale-95 transition-all shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>

              <span
                className="flex-1 text-center text-[10px] sm:text-[11px] font-extrabold text-[#1A3312] leading-tight uppercase tracking-wide"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                Asociatia pentru Sustinerea<br />Educatiei Medicale
              </span>

              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E8EDE6] p-0.5 overflow-hidden">
                <img src="/logo_asem.png" alt="ASEM Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          )}

          {/* This inner div is what actually enables the scrolling! */}
          <div className="flex-1 overflow-y-auto scrollbar-none relative">
            {current === "landing" && <LandingScreen onNext={() => navigate("cpr")} />}
            {current === "cpr" && <CPRScreen onNext={() => navigate("onboarding")} />}
            {current === "onboarding" && <OnboardingScreen onNext={() => navigate("auth")} />}
            {current === "auth" && <AuthScreen onNext={() => navigate("dashboard")} />}
            {current === "dashboard" && <DashboardScreen onScan={() => navigate("lobby")} />}
            {current === "lobby" && <LobbyScreen />}
          </div>

        </div>
      </div>
    </>
  );
}