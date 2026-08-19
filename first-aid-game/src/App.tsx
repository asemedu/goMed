import './styles/fonts.css';
import './styles/tailwind.css';
import './styles/globals.css';
import './styles/index.css';
import './App.css';
import { supabase } from './lib/supabaseClient';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
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
  Play, Pause, X, User, Mail, Edit3, Key, LogOut, Check,
  Plus, Crown, Home, Boxes, Sparkles, Activity, Layers, Video
} from "lucide-react";
import { storage, STORAGE_KEYS } from "./lib/storage";

type Screen =
  | "landing"
  | "cpr"
  | "onboarding"
  | "auth"
  | "dashboard"
  | "lobby"
  | "profile"
  | "create-lobby"
  | "quiz"
  | "learn"
  | "ar-hub"
  | "ar-try";
const SCREENS: Screen[] = [
  "landing",
  "cpr",
  "onboarding",
  "auth",
  "dashboard",
  "lobby",
  "profile",
  "create-lobby",
  "quiz",
  "learn",
  "ar-hub",
  "ar-try",
];
const LABELS = [
  "Landing",
  "CPR 3D",
  "Onboard",
  "Sign In",
  "Dashboard",
  "Lobby",
  "Profile",
  "Create Lobby",
  "Quiz",
  "Learn",
  "AR Practice",
  "AI Vision",
];

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
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setInfoMsg("");

    if (!username.trim()) {
      setErrorMsg("Please enter your email in the field above first.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(username.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfoMsg("Password reset link has been sent to your email!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setErrorMsg("");
    setInfoMsg("");
    if (!username || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (mode === "signup") {
      if (!displayName.trim()) {
        setErrorMsg("Please enter a display name.");
        return;
      }
      if (password !== confirm) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: username,
          password: password,
          options: {
            data: {
              display_name: displayName.trim(),
            },
          },
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
              onClick={() => {
                setMode(m);
                setErrorMsg("");
                setInfoMsg("");
              }}
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
          {mode === "signup" && (
            <div>
              <label
                className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex C. or Dr. Smith"
                className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
          )}

          <div>
            <label
              className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {mode === "signup" ? "Email Address" : "Username or Email"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === "signup" ? "Enter your email" : "Enter your username or email"}
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
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-[13px] text-[#3D6B2A] font-bold hover:underline disabled:opacity-50"
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

        {infoMsg && (
          <div className="mt-4 bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] text-[13px] px-4 py-3 rounded-xl font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {infoMsg}
          </div>
        )}

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
function DashboardScreen({
  onScan,
  onOpenProfile,
  onCreateLobby,
}: {
  onScan: () => void;
  onOpenProfile: () => void;
  onCreateLobby: () => void;
}) {
  const [profile, setProfile] = useState<{
    display_name?: string;
    points?: number;
    ranking?: number;
  } | null>(() => storage.get(STORAGE_KEYS.PROFILE, null));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("display_name, points, ranking")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setProfile(data);
            storage.set(STORAGE_KEYS.PROFILE, data);
          } else {
            const fallbackProfile = {
              display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
              points: 0,
              ranking: 0,
            };
            setProfile(fallbackProfile);
            storage.set(STORAGE_KEYS.PROFILE, fallbackProfile);
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const displayName = profile?.display_name || "";
  const points = profile?.points ?? 0;
  const rankDisplay = profile?.ranking && profile.ranking > 0 ? `#${profile.ranking}` : "—";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(displayName);

  const level = Math.max(1, Math.floor(points / 200) + 1);
  const progress = Math.min(100, Math.round(((points % 200) / 200) * 100));

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
            {displayName} 👋
          </h2>
        </div>
        <button
          onClick={onOpenProfile}
          className="w-12 h-12 rounded-full bg-[#B3D59F] flex items-center justify-center shadow-sm hover:bg-[#9DC885] active:scale-95 transition-all cursor-pointer border border-[#9DC885]/40"
          title="View My Profile"
          aria-label="View My Profile"
        >
          <span
            className="text-[#1A3312] font-extrabold text-[15px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {initials}
          </span>
        </button>
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
              {points.toLocaleString()}
            </span>
            <span
              className="text-[#9DC885] text-[15px] mb-1.5 font-bold"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              PTS
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
              {progress}% to next level · {(200 - (points % 200)).toLocaleString()} PTS needed
            </p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Challenges", value: "24", icon: Trophy },
          { label: "Day Streak", value: "7🔥", icon: Zap },
          { label: "Global Rank", value: rankDisplay, icon: Star },
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

      {/* Create Lobby CTA */}
      <button
        onClick={onCreateLobby}
        className="w-full bg-white border border-[#D8E8D0] rounded-2xl p-4 flex items-center justify-between hover:bg-[#F7FBF5] active:scale-[0.98] transition-all shadow-sm mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A]">
            <Plus size={22} strokeWidth={2.5} />
          </div>
          <div className="text-left">
            <p
              className="font-extrabold text-[#1A2816] text-[15px]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Create a Challenge Lobby
            </p>
            <p
              className="text-[12px] text-[#6B7C6B]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Host a live multiplayer session for students
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[#A0B09A]" />
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

// ─── Screen: Profile ─────────────────────────────────────────────────
function ProfileScreen({
  onBack,
  onSignOut,
}: {
  onBack: () => void;
  onSignOut?: () => void;
}) {
  const [profile, setProfile] = useState<{
    display_name?: string;
    username?: string;
    email?: string;
    points?: number;
    ranking?: number;
  } | null>(() => storage.get(STORAGE_KEYS.PROFILE, null));

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("display_name, points, ranking")
            .eq("id", user.id)
            .single();

          const loadedName = data?.display_name || user.user_metadata?.display_name || "Alex Chen";
          const newProfile = {
            display_name: loadedName,
            username: user.email?.split("@")[0] || "alexchen",
            email: user.email || "alex.chen@example.com",
            points: data?.points ?? 0,
            ranking: data?.ranking ?? 0,
          };
          setProfile(newProfile);
          storage.set(STORAGE_KEYS.PROFILE, newProfile);
          setEditNameValue(loadedName);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  const displayName = profile?.display_name || "Alex Chen";
  const username = profile?.username || "alexchen";
  const email = profile?.email || "alex.chen@example.com";
  const points = profile?.points ?? 0;
  const rankDisplay = profile?.ranking && profile.ranking > 0 ? `#${profile.ranking}` : "—";

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(displayName);

  // Handle saving new display name
  const handleSaveDisplayName = async () => {
    const trimmed = editNameValue.trim();
    if (!trimmed) {
      setFeedbackMsg({ type: "error", text: "Display name cannot be empty." });
      return;
    }
    if (trimmed === displayName) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    setFeedbackMsg(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Update in profiles table
        await supabase
          .from("profiles")
          .update({ display_name: trimmed })
          .eq("id", user.id);

        // 2. Update user metadata
        await supabase.auth.updateUser({
          data: { display_name: trimmed },
        });

        const updated = profile ? { ...profile, display_name: trimmed } : null;
        setProfile(updated);
        if (updated) storage.set(STORAGE_KEYS.PROFILE, updated);
        setIsEditingName(false);
        setFeedbackMsg({ type: "success", text: "Display name updated successfully!" });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to update display name." });
    } finally {
      setSavingName(false);
    }
  };

  // Handle sending password reset email
  const handleRequestPasswordReset = async () => {
    if (!email) return;
    setSendingReset(true);
    setFeedbackMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setFeedbackMsg({
        type: "success",
        text: "Password reset link sent! Please check your email inbox.",
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to send password reset email.",
      });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Header */}
      <div className="mb-5">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          My Profile
        </h2>
        <p className="text-[13px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Account details & medical training stats
        </p>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded-2xl text-[13px] font-semibold flex items-center justify-between transition-all ${feedbackMsg.type === "success"
            ? "bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A]"
            : "bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E]"
            }`}
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-current opacity-70 hover:opacity-100 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Hero Avatar Card */}
      <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-3xl p-5 flex flex-col items-center text-center mb-5 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#B3D59F] flex items-center justify-center shadow-md mb-3 border-2 border-white">
          <span
            className="text-[#1A3312] font-extrabold text-[24px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {initials}
          </span>
        </div>
        <h3
          className="text-[19px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {displayName}
        </h3>
        <p className="text-[13px] text-[#6B7C6B] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
          @{username}
        </p>

        {/* Stats inside Profile */}
        <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-[#E0EBDC]">
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider" style={{ fontFamily: "'Lexend', sans-serif" }}>
              Total Points
            </p>
            <p className="text-[20px] font-extrabold text-[#3D6B2A] mt-0.5" style={{ fontFamily: "'Lexend', sans-serif" }}>
              {points.toLocaleString()} <span className="text-[12px]">PTS</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider" style={{ fontFamily: "'Lexend', sans-serif" }}>
              Global Rank
            </p>
            <p className="text-[20px] font-extrabold text-[#1A2816] mt-0.5" style={{ fontFamily: "'Lexend', sans-serif" }}>
              {rankDisplay}
            </p>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="space-y-3 mb-5">
        <p className="text-[13px] font-bold text-[#1A2816] px-1" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Account Information
        </p>

        {/* Display Name Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#6B7C6B] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Display Name
              </p>
              {isEditingName ? (
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveDisplayName();
                    if (e.key === "Escape") {
                      setEditNameValue(displayName);
                      setIsEditingName(false);
                    }
                  }}
                  autoFocus
                  placeholder="Enter display name"
                  className="w-full px-2.5 py-1 mt-0.5 rounded-lg border border-[#B3D59F] bg-[#F7FBF5] text-[#1A2816] text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-[#B3D59F]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                />
              ) : (
                <p className="text-[14px] font-extrabold text-[#1A2816] truncate" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  {displayName}
                </p>
              )}
            </div>
          </div>

          {isEditingName ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleSaveDisplayName}
                disabled={savingName}
                className="px-3 py-1.5 rounded-xl bg-[#B3D59F] text-[#1A3312] text-[12px] font-extrabold hover:bg-[#9DC885] active:scale-95 transition-all flex items-center gap-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                <Check size={13} strokeWidth={3} /> {savingName ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditNameValue(displayName);
                  setIsEditingName(false);
                }}
                className="px-2 py-1.5 text-[#6B7C6B] text-[12px] font-bold hover:text-[#1A2816]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditNameValue(displayName);
                setIsEditingName(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F0F5EE] text-[#3D6B2A] text-[12px] font-bold hover:bg-[#E2EBE0] active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              <Edit3 size={13} /> Change
            </button>
          )}
        </div>

        {/* Username Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
            <span className="font-extrabold text-[15px]">@</span>
          </div>
          <div>
            <p className="text-[11px] text-[#6B7C6B] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Username
            </p>
            <p className="text-[14px] font-extrabold text-[#1A2816]" style={{ fontFamily: "'Lexend', sans-serif" }}>
              {username}
            </p>
          </div>
        </div>

        {/* Email Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
            <Mail size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] text-[#6B7C6B] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Email Address
            </p>
            <p className="text-[14px] font-extrabold text-[#1A2816] truncate" style={{ fontFamily: "'Lexend', sans-serif" }}>
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-3 mb-6">
        <p className="text-[13px] font-bold text-[#1A2816] px-1" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Security
        </p>

        {/* Password Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <p className="text-[11px] text-[#6B7C6B] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
                Password
              </p>
              <p className="text-[14px] font-extrabold text-[#1A2816] tracking-widest">
                ••••••••
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRequestPasswordReset}
            disabled={sendingReset}
            className="px-3 py-1.5 rounded-xl bg-[#F0F5EE] text-[#3D6B2A] text-[12px] font-bold hover:bg-[#E2EBE0] active:scale-95 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <Key size={13} /> {sendingReset ? "Sending..." : "Change"}
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          storage.clearUserSession();
          onSignOut?.();
        }}
        className="w-full py-3.5 rounded-2xl bg-white border border-[#FAD2D2] text-[#D93838] font-extrabold text-[15px] hover:bg-[#FFF5F5] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 shadow-sm"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        <LogOut size={18} strokeWidth={2.2} /> Sign Out of goMed
      </button>

      {/* Back / Done button */}
      <button
        onClick={onBack}
        className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        <ArrowLeft size={18} strokeWidth={2.5} /> Back to Dashboard
      </button>
    </div>
  );
}

// ─── Modal: Lobby QR Code ─────────────────────────────────────────────
function LobbyQRCodeModal({
  isOpen,
  lobby,
  onClose,
}: {
  isOpen: boolean;
  lobby: { code: string; school: string } | null;
  onClose: () => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (lobby?.code) {
      QRCode.toDataURL(lobby.code, {
        width: 320,
        margin: 2,
        color: {
          dark: "#1A2816",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation error:", err));
    }
  }, [lobby?.code]);

  if (!isOpen || !lobby) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-[350px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8EDE6] text-center relative"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A0B09A] hover:text-[#1A2816] p-1.5 rounded-full hover:bg-[#F0F5EE]"
          aria-label="Close QR Code"
        >
          <X size={18} />
        </button>

        <span
          className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Join Challenge Session
        </span>
        <h3
          className="text-[18px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {lobby.school}
        </h3>
        <p className="text-[12px] text-[#6B7C6B] mb-4">
          Scan this QR code with your camera or enter room code below
        </p>

        {/* Rendered QR Code */}
        <div className="bg-[#F7FBF5] border border-[#D4ECC5] p-4 rounded-2xl inline-block mb-4 shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Lobby QR Code" className="w-52 h-52 mx-auto rounded-lg" />
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-[#6B7C6B]">
              Generating QR...
            </div>
          )}
        </div>

        {/* Code badge */}
        <div className="bg-[#F0F8EC] border border-[#D4ECC5] py-2 px-4 rounded-xl mb-5 inline-block">
          <span className="text-[12px] text-[#6B7C6B] font-bold mr-2">ROOM CODE:</span>
          <span
            className="text-[20px] font-extrabold text-[#1A3312] font-mono tracking-widest"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby.code}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-sm hover:bg-[#9DC885] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Close & Open Lobby Room
        </button>
      </div>
    </div>
  );
}

// ─── Screen: Create Lobby ─────────────────────────────────────────────
function CreateLobbyScreen({
  onLobbyCreated,
  onBack,
}: {
  onLobbyCreated: (lobby: any) => void;
  onBack: () => void;
}) {
  const [school, setSchool] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [category, setCategory] = useState("cpr");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!school.trim()) {
      setErrorMsg("Please enter your school or organization name.");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to host a lobby.");
      }

      // Generate a random 6-char code: MED + 3 digits (e.g. MED842)
      const randomDigits = Math.floor(100 + Math.random() * 900);
      const generatedCode = `MED${randomDigits}`;

      // 1. Insert into lobbies table
      const { data: newLobby, error: insertError } = await supabase
        .from("lobbies")
        .insert({
          code: generatedCode,
          school: school.trim(),
          host_id: user.id,
          status: "waiting",
          max_players: maxPlayers,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Link relevant questions to this lobby in lobby_questions
      const { data: qData } = await supabase
        .from("questions")
        .select("id")
        .eq("category", category)
        .limit(10);

      if (qData && qData.length > 0) {
        const links = qData.map((q: any, idx: number) => ({
          lobby_id: newLobby.id,
          question_id: q.id,
          order_index: idx + 1,
        }));
        await supabase.from("lobby_questions").insert(links);
      }

      // 3. Ensure host profile exists & add host to participants
      const hostDisplayName =
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Host";

      await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: hostDisplayName,
        },
        { onConflict: "id" }
      );

      await supabase.from("lobby_participants").upsert(
        {
          lobby_id: newLobby.id,
          user_id: user.id,
          current_score: 0,
        },
        { onConflict: "lobby_id,user_id" }
      );

      onLobbyCreated({ ...newLobby, isNewlyCreated: true });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create lobby.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col px-6 py-6" style={{ minHeight: 740 }}>
      {/* Header */}
      <div className="mb-6">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Host a Challenge
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B] mt-0.5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Configure room settings and generate invite QR code
        </p>
      </div>

      {errorMsg && (
        <div
          className="mb-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-2xl font-semibold flex items-center justify-between"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="p-1 opacity-70 hover:opacity-100">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="space-y-4 flex-1">
        {/* School / Organization input */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            School or Organization
          </label>
          <input
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="e.g. Colegiul National Sfantul Sava"
            className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] text-[14px]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          />
        </div>

        {/* Max players selection */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Maximum Players
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 8, 12, 24].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxPlayers(num)}
                className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                  maxPlayers === num
                    ? "bg-[#B3D59F] text-[#1A3312] border-[#9DC885] shadow-sm"
                    : "bg-[#F7FBF5] text-[#6B7C6B] border-[#D8E8D0] hover:bg-white"
                }`}
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {num} max
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Category */}
        <div>
          <label
            className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            Challenge Module
          </label>
          <div className="space-y-2">
            {[
              { id: "cpr", title: "CPR & Cardiac Arrest", desc: "Chest compressions, airway & rhythm" },
              { id: "burns", title: "Burns & Wound Care", desc: "Bandaging, triage & thermal injuries" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  category === cat.id
                    ? "bg-[#F0F8EC] border-[#B3D59F] ring-1 ring-[#B3D59F]"
                    : "bg-white border-[#E8EDE6] hover:bg-[#F7FBF5]"
                }`}
              >
                <div>
                  <p
                    className="text-[14px] font-extrabold text-[#1A2816]"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    {cat.title}
                  </p>
                  <p
                    className="text-[12px] text-[#6B7C6B]"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {cat.desc}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    category === cat.id ? "border-[#3D6B2A] bg-[#3D6B2A]" : "border-[#D8E8D0]"
                  }`}
                >
                  {category === cat.id && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="pt-4 space-y-2">
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {loading ? "Creating Lobby..." : "Create Lobby & Show QR Code"}
        </button>

        <button
          onClick={onBack}
          type="button"
          className="w-full py-3 text-[#6B7C6B] font-bold text-[14px] hover:text-[#1A2816]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Screen 5: Lobby ─────────────────────────────────────────────────
function LobbyScreen({
  initialLobby,
  _onLeave,
  onStartGame,
  onLobbyJoined,
  onKicked,
}: {
  initialLobby?: any;
  _onLeave?: () => void;
  onStartGame?: (lobby: any) => void;
  onLobbyJoined?: (lobby: any) => void;
  onKicked?: (lobbyId?: string) => void;
}) {
  const [code, setCode] = useState(initialLobby?.code || "");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lobby, setLobby] = useState<any>(initialLobby || null);
  const [participants, setParticipants] = useState<
    { userId: string; name: string; isCurrentUser: boolean; isHost: boolean }[]
  >([]);
  const [showQRModal, setShowQRModal] = useState(Boolean(initialLobby?.isNewlyCreated));
  const [startingLobby, setStartingLobby] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  // Temporary 5-second kick cooldown map to prevent initial flicker without blocking re-joining
  const kickedUserCooldownsRef = useRef<Map<string, number>>(new Map());

  const webcamRef = useRef<Webcam>(null);
  const lastScannedRef = useRef<string>("");

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  const isHost = Boolean(currentUserId && lobby && lobby.host_id === currentUserId);

  // Helper to extract clean lobby code from text or full URL
  const extractCode = (raw: string) => {
    try {
      if (raw.includes("://")) {
        const url = new URL(raw);
        const param = url.searchParams.get("code");
        if (param) return param.trim().toUpperCase();
      }
      return raw.trim().toUpperCase();
    } catch {
      return raw.trim().toUpperCase();
    }
  };

  const fetchParticipants = useCallback(
    async (lobbyId: string, currentLobbyHostId?: string) => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const currentUserName =
          user?.user_metadata?.display_name ||
          user?.email?.split("@")[0] ||
          "User";

        const { data, error } = await supabase
          .from("lobby_participants")
          .select("user_id, profiles(display_name)")
          .eq("lobby_id", lobbyId);

        const effectiveHostId = currentLobbyHostId || lobby?.host_id;

        // If regular user joined previously but was deleted from participants by host, trigger onKicked
        if (data && !error && user && user.id !== effectiveHostId) {
          const userStillInLobby = data.some((p: any) => p.user_id === user.id);
          if (!userStillInLobby && participants.length > 0) {
            onKicked?.(lobbyId);
            return;
          }
        }

        const list: {
          userId: string;
          name: string;
          isCurrentUser: boolean;
          isHost: boolean;
        }[] = [];

        if (data && !error && data.length > 0) {
          const now = Date.now();
          data
            // Filter out only if user was kicked in the last 5 seconds (allows re-join after 5s or on re-scan)
            .filter((p: any) => (kickedUserCooldownsRef.current.get(p.user_id) ?? 0) <= now)
            .forEach((p: any) => {
              const isCurrent = Boolean(user && p.user_id === user.id);
              const isLobbyHost = Boolean(effectiveHostId && p.user_id === effectiveHostId);
              const name =
                p.profiles?.display_name || (isCurrent ? currentUserName : "Participant");
              list.push({
                userId: p.user_id,
                name,
                isCurrentUser: isCurrent,
                isHost: isLobbyHost,
              });
            });

          // Only ensure host is present if host is viewing and not in participant rows
          if (user && effectiveHostId === user.id && !list.some((item) => item.userId === user.id)) {
            list.unshift({
              userId: user.id,
              name: currentUserName,
              isCurrentUser: true,
              isHost: true,
            });
          }
        } else if (user && effectiveHostId === user.id) {
          list.push({
            userId: user.id,
            name: currentUserName,
            isCurrentUser: true,
            isHost: true,
          });
        }

        setParticipants(list);
      } catch (err) {
        console.error("Error fetching participants:", err);
      }
    },
    [lobby?.host_id, participants.length, onKicked]
  );

  const verifyAndJoinLobby = useCallback(
    async (rawCode: string) => {
      const cleanCode = extractCode(rawCode);
      if (!cleanCode) {
        setErrorMsg("Please enter a valid lobby code.");
        return;
      }

      setLoading(true);
      setErrorMsg("");

      try {
        // 1. Check if lobby code exists in database
        const { data: lobbyData, error: lobbyError } = await supabase
          .from("lobbies")
          .select("id, code, school, status, max_players, host_id")
          .ilike("code", cleanCode)
          .single();

        if (lobbyError || !lobbyData) {
          setErrorMsg(`Lobby "${cleanCode}" not found. Please check code.`);
          setLobby(null);
          return;
        }

        setLobby(lobbyData);
        setCode(lobbyData.code);
        onLobbyJoined?.(lobbyData);

        // 2. Add logged-in user to lobby_participants
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const fallbackName =
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User";

          await supabase.from("profiles").upsert(
            {
              id: user.id,
              display_name: fallbackName,
            },
            { onConflict: "id" }
          );

          await supabase.from("lobby_participants").upsert(
            {
              lobby_id: lobbyData.id,
              user_id: user.id,
              current_score: 0,
            },
            { onConflict: "lobby_id,user_id" }
          );
        }

        // 3. Fetch participants list
        await fetchParticipants(lobbyData.id, lobbyData.host_id);

        // 4. Broadcast join event to host and peers
        roomChannelRef.current?.send({
          type: "broadcast",
          event: "participant_joined",
          payload: { userId: user?.id, code: lobbyData.code },
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to join lobby.");
      } finally {
        setLoading(false);
      }
    },
    [fetchParticipants, onLobbyJoined]
  );

  const roomChannelRef = useRef<any>(null);

  // If initial lobby provided, fetch participants on mount
  useEffect(() => {
    if (initialLobby?.id) {
      fetchParticipants(initialLobby.id, initialLobby.host_id);
    }
  }, [initialLobby, fetchParticipants]);

  // Robust Dual-Sync: Supabase Realtime (Postgres Changes + Direct Broadcast) + Periodic Heartbeat
  useEffect(() => {
    if (!lobby?.id) return;

    // 1. Unified Real-Time Channel
    const channel = supabase.channel(`lobby-room-${lobby.id}`, {
      config: {
        broadcast: { self: true },
      },
    });
    roomChannelRef.current = channel;

    channel
      // A. Listen to Postgres table changes for participants
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lobby_participants",
          filter: `lobby_id=eq.${lobby.id}`,
        },
        () => {
          fetchParticipants(lobby.id);
        }
      )
      // B. Listen to Postgres table changes for lobby status
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lobbies",
          filter: `id=eq.${lobby.id}`,
        },
        (payload: any) => {
          if (payload.new?.status) {
            setLobby((prev: any) => ({ ...prev, status: payload.new.status }));
          }
        }
      )
      // C. Instant Peer-to-Peer Broadcast Events (0ms network latency)
      .on("broadcast", { event: "participant_joined" }, (payload: any) => {
        if (payload?.payload?.userId) {
          // Immediately unblock user if they re-scan / re-join
          kickedUserCooldownsRef.current.delete(payload.payload.userId);
        }
        fetchParticipants(lobby.id);
      })
      .on("broadcast", { event: "participant_kicked" }, (payload: any) => {
        if (payload?.payload?.targetUserId && payload.payload.targetUserId === currentUserId) {
          onKicked?.(lobby.id);
        } else {
          fetchParticipants(lobby.id);
        }
      })
      .on("broadcast", { event: "game_started" }, () => {
        setLobby((prev: any) => ({ ...prev, status: "active" }));
      })
      .subscribe();

    // 2. Heartbeat Sync Polling Fallback (Runs every 2s to guarantee mobile sync)
    const heartbeatTimer = setInterval(async () => {
      try {
        const { data: latestLobby } = await supabase
          .from("lobbies")
          .select("status")
          .eq("id", lobby.id)
          .single();

        if (latestLobby?.status && latestLobby.status !== lobby.status) {
          setLobby((prev: any) => ({ ...prev, status: latestLobby.status }));
        }

        // Periodically refresh participant count
        fetchParticipants(lobby.id);
      } catch (e) {
        console.warn("[LobbySync] Heartbeat poll error:", e);
      }
    }, 2000);

    return () => {
      clearInterval(heartbeatTimer);
      supabase.removeChannel(channel);
      roomChannelRef.current = null;
    };
  }, [lobby?.id, lobby?.status, fetchParticipants, currentUserId, onKicked]);

  // Trigger game start when lobby status becomes active
  useEffect(() => {
    if (lobby?.status === "active") {
      const timer = setTimeout(() => {
        onStartGame?.(lobby);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lobby?.status, lobby, onStartGame]);

  // Kick participant handler (Host only)
  const handleKickParticipant = async (targetUserId: string) => {
    if (!lobby || !isHost) return;
    try {
      // 1. Add 5-second cooldown to avoid instant flicker
      kickedUserCooldownsRef.current.set(targetUserId, Date.now() + 5000);

      // 2. Immediately remove from local state
      setParticipants((prev) => prev.filter((p) => p.userId !== targetUserId));

      // 3. Delete from database
      await supabase
        .from("lobby_participants")
        .delete()
        .eq("lobby_id", lobby.id)
        .eq("user_id", targetUserId);

      // 4. Broadcast kick event to peer
      roomChannelRef.current?.send({
        type: "broadcast",
        event: "participant_kicked",
        payload: { targetUserId },
      });

      // 5. Re-fetch participants to verify
      await fetchParticipants(lobby.id);
    } catch (err) {
      console.error("Error kicking participant:", err);
    }
  };

  // Start lobby challenge handler (Host only)
  const handleStartLobby = async () => {
    if (!lobby || !isHost) return;
    setStartingLobby(true);
    try {
      const { error } = await supabase
        .from("lobbies")
        .update({ status: "active" })
        .eq("id", lobby.id);

      if (error) throw error;

      // Broadcast game started event immediately across the room
      roomChannelRef.current?.send({
        type: "broadcast",
        event: "game_started",
        payload: { lobbyId: lobby.id },
      });

      setLobby((prev: any) => ({ ...prev, status: "active" }));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start lobby.");
    } finally {
      setStartingLobby(false);
    }
  };

  // Webcam QR scanner loop
  const capture = useCallback(() => {
    if (webcamRef.current && !loading && !lobby) {
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
            if (qrCodeData && qrCodeData.data) {
              const scanned = qrCodeData.data.trim();
              if (scanned && scanned !== lastScannedRef.current) {
                lastScannedRef.current = scanned;
                verifyAndJoinLobby(scanned);
              }
            }
          }
        };
      }
    }
  }, [webcamRef, loading, lobby, verifyAndJoinLobby]);

  useEffect(() => {
    const interval = setInterval(capture, 500);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
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
            {lobby ? "Waiting room & participants" : "Scan QR or enter code to join live session"}
          </p>
        </div>

        {lobby && (
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] px-3 py-1.5 rounded-xl text-[12px] font-extrabold shadow-sm hover:bg-[#E2F0DC] active:scale-95 transition-all"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <QrCode size={16} /> QR Code
          </button>
        )}
      </div>

      {/* Feedback / Error banner */}
      {errorMsg && (
        <div
          className="mb-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-2xl font-semibold flex items-center justify-between"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="text-current opacity-70 hover:opacity-100 p-1"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Lobby Active Info Card */}
      {lobby && (
        <div
          className="mb-4 bg-[#F0F8EC] border border-[#D4ECC5] text-[#1A3312] p-4 rounded-2xl flex items-center justify-between shadow-sm"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-[11px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                Room Code · {lobby.code}
              </span>
              {isHost && (
                <span
                  className="bg-[#1A3312] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  <Crown size={10} /> You are Host
                </span>
              )}
            </div>
            <p
              className="text-[16px] font-extrabold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby.school}
            </p>
          </div>
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
              lobby.status === "active"
                ? "bg-[#3D6B2A] text-white animate-pulse"
                : "bg-[#B3D59F] text-[#1A3312]"
            }`}
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby.status}
          </span>
        </div>
      )}

      {/* Camera viewfinder (hidden once joined) */}
      {!lobby && (
        <div
          className="bg-[#1A2816] rounded-3xl overflow-hidden mb-4 relative mx-auto w-full"
          style={{ aspectRatio: "1/1", maxWidth: 300 }}
        >
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

          {/* Scan line */}
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
              className="bg-black/60 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full backdrop-blur-sm"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {loading ? "Verifying QR Code..." : "Point camera at lobby QR"}
            </span>
          </div>
        </div>
      )}

      {/* Manual code input form */}
      {!lobby && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#E0EAD8]" />
            <span
              className="text-[12px] font-bold text-[#A0B09A] bg-[#F0F5EE] px-3 py-1 rounded-full"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              OR ENTER CODE
            </span>
            <div className="flex-1 h-px bg-[#E0EAD8]" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyAndJoinLobby(code);
            }}
            className="flex gap-2 mb-4"
          >
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MED123"
              maxLength={12}
              className="flex-1 px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#A0B09A] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[15px] font-mono tracking-widest uppercase font-bold"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-12 h-12 rounded-xl bg-[#B3D59F] flex items-center justify-center hover:bg-[#9DC885] active:scale-95 transition-all shrink-0 shadow-sm self-center disabled:opacity-60"
              title="Join Lobby"
            >
              <Send size={16} className="text-[#1A3312]" />
            </button>
          </form>
        </>
      )}

      {/* Participants waiting area */}
      <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-4 flex-1 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#B3D59F]"
            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <p
            className="text-[14px] font-bold text-[#1A2816]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {lobby ? "Participants Ready" : "Lobby Participants"}
          </p>
          <span
            className="ml-auto text-[11px] text-[#6B7C6B] bg-white border border-[#D4ECC5] px-2.5 py-0.5 rounded-lg font-bold"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {participants.length}/{lobby?.max_players || 8}
          </span>
        </div>

        <div className="space-y-2.5">
          {participants.map((p, i) => (
            <div
              key={p.userId || i}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                p.isCurrentUser
                  ? "bg-[#F0F8EC] border-[#B3D59F] shadow-sm"
                  : "bg-white border-[#E8EDE6]"
              }`}
            >
              {/* Host kick button (shown on left for other participants) */}
              {isHost && !p.isCurrentUser && (
                <button
                  type="button"
                  onClick={() => handleKickParticipant(p.userId)}
                  className="w-7 h-7 rounded-lg bg-[#FFF0F2] text-[#C0384E] hover:bg-[#FDE2E6] flex items-center justify-center transition-colors shrink-0"
                  title={`Kick ${p.name}`}
                  aria-label={`Kick ${p.name}`}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  p.isCurrentUser ? "bg-[#3D6B2A] text-white" : "bg-[#B3D59F] text-[#1A3312]"
                }`}
              >
                <span className="text-[12px] font-bold" style={{ fontFamily: "'Lexend', sans-serif" }}>
                  {p.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[14px] truncate ${
                    p.isCurrentUser ? "text-[#1A3312] font-extrabold" : "text-[#1A2816] font-semibold"
                  }`}
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {p.name}
                </span>

                {p.isHost && (
                  <span
                    className="text-[9px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-1.5 py-0.5 rounded flex items-center gap-0.5 uppercase tracking-wider shrink-0"
                    style={{ fontFamily: "'Lexend', sans-serif" }}
                  >
                    <Crown size={9} /> HOST
                  </span>
                )}
              </div>

              {p.isCurrentUser && (
                <span
                  className="ml-auto text-[10px] font-extrabold text-[#3D6B2A] bg-white border border-[#B3D59F] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  YOU
                </span>
              )}
            </div>
          ))}

          {participants.length === 0 && (
            <div
              className="py-6 text-center text-[#6B7C6B] text-[13px]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {lobby
                ? "Waiting for participants to scan and join..."
                : "Scan a QR code or enter a room code above."}
            </div>
          )}
        </div>
      </div>

      {/* Host Controls & Action Buttons */}
      {lobby && (
        <div className="pt-2">
          {lobby.status === "active" ? (
            <div className="bg-[#3D6B2A] text-white p-4 rounded-2xl text-center font-extrabold text-[15px] shadow-lg animate-pulse flex items-center justify-center gap-2" style={{ fontFamily: "'Lexend', sans-serif" }}>
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              Starting Challenge Questions...
            </div>
          ) : isHost ? (
            <button
              onClick={handleStartLobby}
              disabled={startingLobby || participants.length === 0}
              className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {startingLobby ? "Starting Session..." : "Start Challenge Now"}
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 p-3 bg-white border border-[#E8EDE6] rounded-2xl text-[#6B7C6B] text-[13px] font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <Clock size={15} className="text-[#3D6B2A] animate-spin" />
              Waiting for host to start challenge...
            </div>
          )}
        </div>
      )}

      {/* Modal to Broadcast QR Code to Classroom */}
      <LobbyQRCodeModal
        isOpen={showQRModal}
        lobby={lobby}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}

// ─── Screen 6: Quiz Gameplay ──────────────────────────────────────────
function QuizScreen({
  lobby,
  onFinish,
}: {
  lobby: any;
  onFinish: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Load questions for this lobby
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        let loadedQuestions: any[] = [];

        // 1. Try to fetch questions linked to this lobby
        if (lobby?.id) {
          const { data: lqData, error: lqError } = await supabase
            .from("lobby_questions")
            .select(`
              order_index,
              questions (
                id,
                question_text,
                category,
                points,
                time_limit_seconds,
                answers (
                  id,
                  answer_text,
                  is_correct,
                  order_index
                )
              )
            `)
            .eq("lobby_id", lobby.id)
            .order("order_index", { ascending: true });

          if (!lqError && lqData && lqData.length > 0) {
            loadedQuestions = lqData
              .map((item: any) => item.questions)
              .filter(Boolean);
          }
        }

        // 2. Fallback: If no lobby_questions, fetch from questions table
        if (loadedQuestions.length === 0) {
          const { data: allQ, error: allQError } = await supabase
            .from("questions")
            .select(`
              id,
              question_text,
              category,
              points,
              time_limit_seconds,
              answers (
                id,
                answer_text,
                is_correct,
                order_index
              )
            `)
            .limit(5);

          if (!allQError && allQ) {
            loadedQuestions = allQ;
          }
        }

        // Sort answers by order_index
        loadedQuestions.forEach((q) => {
          if (q.answers) {
            q.answers.sort(
              (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)
            );
          }
        });

        setQuestions(loadedQuestions);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [lobby?.id]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (answerId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerId(answerId);
  };

  const handleSubmitOrNext = () => {
    if (!isAnswerSubmitted) {
      if (!selectedAnswerId) return;

      const selected = currentQ?.answers?.find(
        (a: any) => a.id === selectedAnswerId
      );
      if (selected?.is_correct) {
        setScore((prev) => prev + (currentQ.points || 100));
      }
      setIsAnswerSubmitted(true);
    } else {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswerId(null);
        setIsAnswerSubmitted(false);
      } else {
        setIsCompleted(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12" style={{ minHeight: 600 }}>
        <div className="w-12 h-12 rounded-full border-4 border-[#B3D59F] border-t-transparent animate-spin mb-4" />
        <p className="text-[14px] font-bold text-[#1A2816]" style={{ fontFamily: "'Lexend', sans-serif" }}>
          Loading Challenge Questions...
        </p>
      </div>
    );
  }

  if (errorMsg || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center" style={{ minHeight: 600 }}>
        <div className="w-14 h-14 rounded-2xl bg-[#FFF4F6] text-[#C0384E] flex items-center justify-center mb-3">
          <X size={28} />
        </div>
        <h3 className="text-[18px] font-extrabold text-[#1A2816] mb-1" style={{ fontFamily: "'Lexend', sans-serif" }}>
          No Questions Found
        </h3>
        <p className="text-[13px] text-[#6B7C6B] mb-5 max-w-[260px]" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {errorMsg || "No questions have been attached to this lobby yet."}
        </p>
        <button
          onClick={onFinish}
          className="px-6 py-3 rounded-xl bg-[#B3D59F] text-[#1A3312] font-bold text-[14px]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center" style={{ minHeight: 650 }}>
        <div className="w-20 h-20 rounded-3xl bg-[#F0F8EC] border-2 border-[#B3D59F] text-[#3D6B2A] flex items-center justify-center mb-4 shadow-lg">
          <Trophy size={40} />
        </div>

        <span
          className="text-[11px] font-extrabold text-[#3D6B2A] bg-[#E8F5E2] border border-[#B3D59F] px-3 py-1 rounded-full uppercase tracking-wider mb-2"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Challenge Complete
        </span>

        <h3
          className="text-[24px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Great Job!
        </h3>
        <p className="text-[13px] text-[#6B7C6B] mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
          You have completed all questions in this session.
        </p>

        {/* Score Card */}
        <div className="w-full bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-5 mb-6">
          <p className="text-[12px] font-bold text-[#6B7C6B] uppercase tracking-wider mb-1" style={{ fontFamily: "'Lexend', sans-serif" }}>
            Total Score Earned
          </p>
          <p className="text-[36px] font-extrabold text-[#1A3312]" style={{ fontFamily: "'Lexend', sans-serif" }}>
            +{score} <span className="text-[16px] text-[#3D6B2A]">XP</span>
          </p>
        </div>

        <button
          onClick={onFinish}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Finish & Return to Dashboard
        </button>
      </div>
    );
  }

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="flex flex-col h-full justify-between px-4 pt-3 pb-5 overflow-hidden">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <span
              className="text-[10px] font-bold text-[#3D6B2A] uppercase tracking-wider block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {lobby?.school || "Challenge Session"}
            </span>
            <p
              className="text-[12px] font-bold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          <div className="bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold">
            +{currentQ.points || 100} XP
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#E0EAD8] rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-[#3D6B2A] transition-all duration-300 rounded-full"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-[#F7FBF5] border border-[#D4ECC5] rounded-2xl p-3.5 mb-2.5 shadow-sm">
          <span
            className="text-[9px] font-extrabold text-[#3D6B2A] bg-white border border-[#B3D59F] px-1.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1.5"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {currentQ.category?.toUpperCase() || "FIRST AID"}
          </span>
          <h3
            className="text-[14px] font-bold text-[#1A2816] leading-tight"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {currentQ.question_text}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-2 mb-2 flex-1 flex flex-col justify-center">
          {(currentQ.answers || []).map((ans: any, idx: number) => {
            const isSelected = selectedAnswerId === ans.id;
            let cardStyle =
              "bg-white border-[#E8EDE6] text-[#1A2816] hover:bg-[#F7FBF5]";
            let badgeStyle = "bg-[#F0F5EE] text-[#6B7C6B]";

            if (isAnswerSubmitted) {
              if (ans.is_correct) {
                cardStyle =
                  "bg-[#E8F5E2] border-[#3D6B2A] text-[#1A3312] ring-1 ring-[#3D6B2A]";
                badgeStyle = "bg-[#3D6B2A] text-white";
              } else if (isSelected && !ans.is_correct) {
                cardStyle = "bg-[#FFF0F2] border-[#C0384E] text-[#C0384E]";
                badgeStyle = "bg-[#C0384E] text-white";
              } else {
                cardStyle =
                  "bg-white border-[#E8EDE6] text-[#A0B09A] opacity-60";
              }
            } else if (isSelected) {
              cardStyle =
                "bg-[#F0F8EC] border-[#B3D59F] text-[#1A3312] ring-2 ring-[#B3D59F]/50 shadow-sm";
              badgeStyle = "bg-[#B3D59F] text-[#1A3312]";
            }

            return (
              <button
                key={ans.id || idx}
                type="button"
                onClick={() => handleSelectOption(ans.id)}
                disabled={isAnswerSubmitted}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${cardStyle}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center shrink-0 text-[12px] transition-colors ${badgeStyle}`}
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
                  {optionLabels[idx] || idx + 1}
                </div>
                <span
                  className="text-[13px] font-semibold flex-1 leading-snug"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {ans.answer_text}
                </span>
                {isAnswerSubmitted && ans.is_correct && (
                  <CheckCircle size={16} className="text-[#3D6B2A] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSubmitOrNext}
        disabled={!selectedAnswerId}
        className="w-full py-3.5 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[15px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 mt-2"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        {isAnswerSubmitted
          ? currentIndex + 1 < questions.length
            ? "Next Question"
            : "View Results"
          : "Submit Answer"}
        <ArrowRight size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Component: Bottom Navigation Bar ─────────────────────────────────
function BottomNavBar({
  current,
  onNavigate,
}: {
  current: Screen;
  onNavigate: (s: Screen) => void;
}) {
  const tabs: {
    id: Screen;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "learn", label: "Learn", icon: BookOpen },
    { id: "ar-hub", label: "AR Practice", icon: Boxes },
  ];

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E8EDE6] px-4 pt-2 flex items-center justify-around shadow-lg"
      style={{
        paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-5 rounded-2xl transition-all duration-150 ${
              isActive
                ? "bg-[#F0F8EC] text-[#1A3312] font-extrabold shadow-sm scale-105"
                : "text-[#8A9C87] hover:text-[#1A2816] hover:bg-[#F7FBF5]"
            }`}
          >
            <Icon
              size={20}
              className={isActive ? "text-[#3D6B2A]" : "text-[#8A9C87]"}
            />
            <span
              className="text-[11px] mt-0.5 tracking-tight"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Screen: Learn & Curriculum ───────────────────────────────────────
function LearnScreen({ onExploreCPR }: { onExploreCPR: () => void }) {
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

// ─── Screen: AR Movements Hub ─────────────────────────────────────────
function ARHubScreen({
  onSelectMovement,
}: {
  onSelectMovement: (movement: any, mode: "learn" | "try") => void;
}) {
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
                    <span className="text-[10px] text-[#A0B09A] font-bold ml-auto uppercase">
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
              className="absolute top-4 right-4 text-[#A0B09A] hover:text-[#1A2816] p-1.5 rounded-full hover:bg-[#F0F5EE]"
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
                <ArrowRight size={16} className="text-[#A0B09A]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Screen: AR Try (Camera & Body Vision) ─────────────────────────────
function ARTryScreen({
  movement,
  onBack,
}: {
  movement: any;
  onBack: () => void;
}) {
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

// ─── Reset Password Modal ─────────────────────────────────────────────
function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    setErrorMsg("");
    if (!newPassword) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setNewPassword("");
        setConfirmPassword("");
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8EDE6] relative"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A0B09A] hover:text-[#1A2816] p-1.5 rounded-full hover:bg-[#F0F5EE]"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] flex items-center justify-center mb-4">
          <Key size={22} />
        </div>

        <h3
          className="text-[18px] font-extrabold text-[#1A2816] mb-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          Change Password
        </h3>
        <p className="text-[12px] text-[#6B7C6B] mb-4">
          Enter your new password below.
        </p>

        {isSuccess ? (
          <div className="bg-[#E8F5E2] border border-[#B3D59F] text-[#1A3312] p-4 rounded-2xl text-center">
            <p className="text-[13px] font-bold flex items-center justify-center gap-1.5">
              <Check size={16} className="text-[#3D6B2A]" /> Password updated successfully!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {errorMsg && (
              <div className="bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[12px] p-2.5 rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-[#6B7C6B] uppercase mb-1 block" style={{ fontFamily: "'Lexend', sans-serif" }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] text-[13px] focus:outline-none focus:border-[#B3D59F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0B09A]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#6B7C6B] uppercase mb-1 block" style={{ fontFamily: "'Lexend', sans-serif" }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] text-[13px] focus:outline-none focus:border-[#B3D59F]"
              />
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[14px] shadow-sm hover:bg-[#9DC885] active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App shell ───────────────────────────────────────────────────────
export default function App() {
  const [historyStack, setHistoryStack] = useState<Screen[]>(() => {
    // Check if user has an active cached profile and saved screen
    const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
    const cachedScreen = storage.get<Screen>(
      STORAGE_KEYS.LAST_SCREEN,
      "dashboard"
    );
    if (
      cachedProfile &&
      ["dashboard", "learn", "ar-hub", "profile"].includes(cachedScreen)
    ) {
      return [cachedScreen];
    }
    return ["landing"];
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [activeLobby, setActiveLobby] = useState<any>(() =>
    storage.get(STORAGE_KEYS.ACTIVE_LOBBY, null)
  );
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [kickedToast, setKickedToast] = useState<string | null>(null);
  const current = historyStack[historyStack.length - 1];

  const handleUserKicked = async (lobbyId?: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && (lobbyId || activeLobby?.id)) {
        await supabase
          .from("lobby_participants")
          .delete()
          .eq("lobby_id", lobbyId || activeLobby?.id)
          .eq("user_id", user.id);
      }
    } catch (e) {
      console.warn("Error deleting self from lobby participants:", e);
    }
    setActiveLobby(null);
    storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
    navigate("dashboard", true);
    setKickedToast("You were kicked by the host.");
    setTimeout(() => {
      setKickedToast(null);
    }, 2000);
  };

  const showBottomNav =
    current === "dashboard" || current === "learn" || current === "ar-hub";

  useEffect(() => {
    // Check live Supabase session and hydrate state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const lastScreen = storage.get<Screen>(
          STORAGE_KEYS.LAST_SCREEN,
          "dashboard"
        );
        const targetScreen = [
          "dashboard",
          "learn",
          "ar-hub",
          "profile",
        ].includes(lastScreen)
          ? lastScreen
          : "dashboard";
        setHistoryStack([targetScreen]);
        window.history.replaceState(
          { screen: targetScreen, index: 0 },
          "",
          `?screen=${targetScreen}`
        );
      } else {
        // If not logged in, ensure we don't land on a protected screen
        setHistoryStack((prev) => {
          const cur = prev[prev.length - 1];
          if (["dashboard", "learn", "ar-hub", "profile", "quiz", "lobby"].includes(cur)) {
            return ["landing"];
          }
          return prev;
        });
      }
    });

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && typeof e.state.index === "number") {
        const newIndex = e.state.index;
        // Keep the stack aligned with the history index
        setHistoryStack((prev) => prev.slice(0, newIndex + 1));
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Listen for password recovery from Supabase email link
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setShowResetModal(true);
      } else if (event === "SIGNED_OUT") {
        storage.clearUserSession();
        setHistoryStack(["auth"]);
      } else if (event === "SIGNED_IN" && session) {
        setHistoryStack(["dashboard"]);
      }
    });

    if (window.location.hash.includes("type=recovery")) {
      setShowResetModal(true);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      subscription.unsubscribe();
    };
  }, []);

  const navigate = (s: Screen, replace = false) => {
    if (["dashboard", "learn", "ar-hub"].includes(s)) {
      storage.set(STORAGE_KEYS.LAST_SCREEN, s);
    }

    if (replace) {
      const index = Math.max(0, historyStack.length - 1);
      window.history.replaceState({ screen: s, index }, "", `?screen=${s}`);
      setHistoryStack((prev) => [...prev.slice(0, -1), s]);
    } else {
      const newIndex = historyStack.length;
      window.history.pushState({ screen: s, index: newIndex }, "", `?screen=${s}`);
      setHistoryStack((prev) => [...prev, s]);
    }
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
        className="min-h-[100dvh] h-full w-full bg-white sm:bg-[#EDF3E9] flex flex-col items-center justify-start sm:justify-center py-0 sm:py-8 px-0 sm:px-4"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {/* The "Invisible Frame" that fixes the layout and scrolling */}
        <div
          className="w-full sm:max-w-[390px] h-[100dvh] sm:h-[820px] bg-white sm:rounded-[48px] sm:shadow-2xl overflow-hidden flex flex-col relative"
          style={{
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Back Button Header */}
          {historyStack.length > 1 && (
            <div className="w-full px-5 pt-3 pb-1 flex items-center justify-between z-10 shrink-0 bg-transparent gap-2">
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
                Asociatia pentru Sustinerea
                <br />
                Educatiei Medicale
              </span>

              <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#E8EDE6] p-0.5 overflow-hidden">
                <img
                  src="/logo_asem.png"
                  alt="ASEM Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* This inner div is what actually enables the scrolling! */}
          <div
            className={`flex-1 overflow-y-auto scrollbar-none relative ${
              showBottomNav ? "pb-24" : ""
            }`}
          >
            {current === "landing" && (
              <LandingScreen onNext={() => navigate("cpr")} />
            )}
            {current === "cpr" && (
              <CPRScreen onNext={() => navigate("onboarding")} />
            )}
            {current === "onboarding" && (
              <OnboardingScreen onNext={() => navigate("auth")} />
            )}
            {current === "auth" && (
              <AuthScreen onNext={() => navigate("dashboard")} />
            )}
            {current === "dashboard" && (
              <DashboardScreen
                onScan={() => {
                  setActiveLobby(null);
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  navigate("lobby");
                }}
                onOpenProfile={() => navigate("profile")}
                onCreateLobby={() => navigate("create-lobby")}
              />
            )}
            {current === "learn" && (
              <LearnScreen onExploreCPR={() => navigate("cpr")} />
            )}
            {current === "ar-hub" && (
              <ARHubScreen
                onSelectMovement={(move, mode) => {
                  setSelectedMovement(move);
                  if (mode === "learn") {
                    navigate("cpr");
                  } else {
                    navigate("ar-try");
                  }
                }}
              />
            )}
            {current === "ar-try" && (
              <ARTryScreen
                movement={selectedMovement}
                onBack={goBack}
              />
            )}
            {current === "create-lobby" && (
              <CreateLobbyScreen
                onBack={goBack}
                onLobbyCreated={(lobby) => {
                  setActiveLobby(lobby);
                  storage.set(STORAGE_KEYS.ACTIVE_LOBBY, lobby);
                  navigate("lobby");
                }}
              />
            )}
            {current === "lobby" && (
              <LobbyScreen
                initialLobby={activeLobby}
                _onLeave={() => {
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  goBack();
                }}
                onLobbyJoined={(lobby) => {
                  setActiveLobby(lobby);
                  storage.set(STORAGE_KEYS.ACTIVE_LOBBY, lobby);
                }}
                onStartGame={(lobby) => {
                  setActiveLobby(lobby);
                  navigate("quiz", true);
                }}
                onKicked={handleUserKicked}
              />
            )}
            {current === "quiz" && (
              <QuizScreen
                lobby={activeLobby}
                onFinish={() => {
                  storage.remove(STORAGE_KEYS.ACTIVE_LOBBY);
                  navigate("dashboard");
                }}
              />
            )}
            {current === "profile" && (
              <ProfileScreen
                onBack={goBack}
                onSignOut={() => {
                  storage.clearUserSession();
                  navigate("auth", true);
                }}
              />
            )}
          </div>

          {/* Kicked by Host Notification Banner */}
          {kickedToast && (
            <div className="absolute top-14 left-4 right-4 z-50 bg-[#F0F8EC] border-2 border-[#B3D59F] rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-[#FFF0F2] border border-[#FAD2D2] flex items-center justify-center text-[#D93838] shrink-0 font-extrabold text-[14px]">
                ✕
              </div>
              <p
                className="text-[13px] font-extrabold text-[#C0384E]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {kickedToast}
              </p>
            </div>
          )}

          {/* Persistent Bottom Navigation Bar */}
          {showBottomNav && (
            <BottomNavBar
              current={current}
              onNavigate={(tab) => {
                if (tab !== current) {
                  navigate(tab);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Password Reset Modal */}
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => {
          navigate("auth");
        }}
      />
    </>
  );
}