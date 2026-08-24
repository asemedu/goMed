import React, { useState, useEffect } from "react";
import {
  Trophy,
  Zap,
  Star,
  QrCode,
  ArrowRight,
  Plus,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { storage, STORAGE_KEYS } from "../../lib/storage";

interface DashboardScreenProps {
  onScan: () => void;
  onOpenProfile: () => void;
  onCreateLobby: () => void;
  onStartCPRPractice: () => void;
}

export function DashboardScreen({
  onScan,
  onOpenProfile,
  onCreateLobby,
  onStartCPRPractice,
}: DashboardScreenProps) {
  const [profile, setProfile] = useState<{
    display_name?: string;
    points?: number;
    ranking?: number;
  } | null>(() => storage.get(STORAGE_KEYS.PROFILE, null));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
              display_name:
                user.user_metadata?.display_name ||
                user.email?.split("@")[0] ||
                "User",
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
  const rankDisplay =
    profile?.ranking && profile.ranking > 0 ? `#${profile.ranking}` : "—";

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

      {/* Live CPR Practice CTA */}
      <button
        onClick={onStartCPRPractice}
        className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between hover:bg-blue-100 active:scale-[0.98] transition-all shadow-sm mb-4"
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
              Live CPR Practice
            </p>
            <p
              className="text-[12px] text-[#6B7C6B]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Real-time AI camera feedback
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
