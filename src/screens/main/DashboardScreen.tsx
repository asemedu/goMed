import React, { useState, useEffect } from "react";
import {
  Loader2,
  X,
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
import { useLanguage } from "../../lib/i18n/LanguageContext";

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
  const { t } = useLanguage();

  const [profile, setProfile] = useState<{
    display_name?: string;
    points?: number;
    ranking?: number;
    activities_count?: number;
    streak?: number;
    id?: string;
  } | null>(() => storage.get(STORAGE_KEYS.PROFILE, null));

  const [leaderboardModal, setLeaderboardModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    data: any[];
  }>({ isOpen: false, loading: false, data: [] });

  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    icon: "Trophy" | "Zap";
  }>({ isOpen: false, title: "", description: "", icon: "Trophy" });

  const [activities, setActivities] = useState<Array<{
    id: string;
    title: string;
    xp_earned: number;
    created_at: string;
  }>>([]);

  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return t("dashboard.timeJustNow", "Just now");
    if (diffInMins < 60) return `${diffInMins}${t("dashboard.timeMinutesAgo", "m ago")}`;
    if (diffInHours < 24) return `${diffInHours}${t("dashboard.timeHoursAgo", "h ago")}`;
    if (diffInDays === 1) return t("dashboard.timeYesterday", "Yesterday");
    return `${diffInDays}${t("dashboard.timeDaysAgo", "d ago")}`;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("display_name, points, activities_count, streak")
            .eq("id", user.id)
            .single();

          let userRank = 0;
          try {
            const { data: rankData } = await supabase.rpc('get_user_rank');
            if (rankData) userRank = rankData;
          } catch (e) {
            console.error("Failed to fetch rank", e);
          }

          if (data && !error) {
            const fullProfile = { ...data, ranking: userRank, id: user.id };
            setProfile(fullProfile);
            storage.set(STORAGE_KEYS.PROFILE, fullProfile);
          } else {
            const fallbackProfile = {
              display_name:
                user.user_metadata?.display_name ||
                user.email?.split("@")[0] ||
                "User",
              points: 0,
              ranking: 0,
              activities_count: 0,
              streak: 0,
              id: user.id,
            };
            setProfile(fallbackProfile);
            storage.set(STORAGE_KEYS.PROFILE, fallbackProfile);
          }
          // Fetch recent user activities
          try {
            const { data: actData } = await supabase
              .from("user_activities")
              .select("id, title, xp_earned, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(3);

            if (actData) {
              setActivities(actData);
            }
          } catch (actErr) {
            console.error("Failed to fetch user activities", actErr);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return t("dashboard.greetingMorning", "Good morning,");
    } else if (hour >= 12 && hour < 18) {
      return t("dashboard.greetingAfternoon", "Good afternoon,");
    } else {
      return t("dashboard.greetingEvening", "Good evening,");
    }
  };

  return (
    <div className="flex flex-col px-5 py-5" style={{ minHeight: 740 }}>
      {/* Greeting row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p
            className="text-[13px] text-[#6B7C6B] font-semibold"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {getGreeting()}
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
          title={t("dashboard.viewProfile", "View My Profile")}
          aria-label={t("dashboard.viewProfile", "View My Profile")}
        >
          <span
            className="text-[#1A3312] font-extrabold text-[15px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {initials}
          </span>
        </button>
      </div>

      {/* Skill Score card - Remodeled */}
      <div className="bg-[#1A2816] rounded-[28px] p-6 mb-4 relative overflow-hidden shadow-sm border border-[#23351F]">
        {/* Minimal geometric background shapes */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#B3D59F]/5 -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-[#B3D59F]/5 translate-y-6 -translate-x-4" />

        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-[#B3D59F]/10 border border-[#B3D59F]/20 px-5 py-1.5 rounded-full shadow-sm">
              <p
                className="text-[#9DC885] text-[10px] font-extrabold uppercase tracking-widest"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("dashboard.learningProgress", "Learning Progress")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Activities */}
            <button
              onClick={() => setInfoModal({
                isOpen: true,
                title: t("dashboard.activities", "Activities"),
                description: t("dashboard.activitiesDesc", "Activities are a count of all the training modules, quizzes, and CPR sessions you have completed. Complete more modules to grow this number!"),
                icon: "Trophy"
              })}
              className="bg-white/10 border border-white/5 rounded-2xl p-3 text-center hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center cursor-pointer"
            >
              <Trophy size={18} className="text-[#B3D59F] mb-1.5" />
              <p
                className="text-[20px] font-extrabold text-white leading-none mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {profile?.activities_count || 0}
              </p>
              <p
                className="text-[10px] text-[#9DC885] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("dashboard.activities", "Activities")}
              </p>
            </button>

            {/* Day Streak */}
            <button
              onClick={() => setInfoModal({
                isOpen: true,
                title: t("dashboard.dayStreak", "Day Streak"),
                description: t("dashboard.dayStreakDesc", "Your Day Streak increases for every training activity you complete. If you don't complete any activity within 24 hours, your streak resets to 0!"),
                icon: "Zap"
              })}
              className="bg-white/10 border border-white/5 rounded-2xl p-3 text-center hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center cursor-pointer"
            >
              <Zap size={18} className="text-[#B3D59F] mb-1.5" />
              <p
                className="text-[20px] font-extrabold text-white leading-none mb-1 flex items-center justify-center gap-0.5"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {profile?.streak || 0}<span className="text-[14px]">🔥</span>
              </p>
              <p
                className="text-[10px] text-[#9DC885] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("dashboard.dayStreak", "Day Streak")}
              </p>
            </button>

            {/* Global Rank */}
            <button
              onClick={async () => {
                setLeaderboardModal({ isOpen: true, loading: true, data: [] });
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data, error } = await supabase.rpc('get_leaderboard_context', { p_user_id: user.id });
                    if (!error && data) {
                      setLeaderboardModal({ isOpen: true, loading: false, data });
                    } else {
                      setLeaderboardModal({ isOpen: true, loading: false, data: [] });
                    }
                  } else {
                    setLeaderboardModal({ isOpen: true, loading: false, data: [] });
                  }
                } catch (err) {
                  setLeaderboardModal({ isOpen: true, loading: false, data: [] });
                }
              }}
              className="bg-white/10 border border-white/5 rounded-2xl p-3 text-center hover:bg-white/20 active:scale-95 transition-all flex flex-col items-center cursor-pointer"
            >
              <Star size={18} className="text-[#B3D59F] mb-1.5" />
              <p
                className="text-[20px] font-extrabold text-white leading-none mb-1"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {rankDisplay}
              </p>
              <p
                className="text-[10px] text-[#9DC885] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("dashboard.globalRank", "Global Rank")}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* QR Scan CTA — large, prominent */}
      <button
        onClick={onScan}
        className="w-full bg-[#F0F8EC] border-2 border-[#B3D59F] rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-[#E8F5E2] active:scale-[0.98] transition-all duration-150 mb-4 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#B3D59F] flex items-center justify-center shadow-md">
          <QrCode size={32} className="text-[#1A3312]" strokeWidth={2} />
        </div>
        <div className="text-center">
          <p
            className="font-extrabold text-[#1A2816] text-[18px]"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {t("dashboard.scanQRTitle", "Scan QR to Enter Lobby")}
          </p>
          <p
            className="text-[13px] text-[#6B7C6B] mt-0.5"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {t("dashboard.scanQRSubtitle", "Join a live challenge session with your team")}
          </p>
        </div>
        <div
          className="flex items-center gap-1 text-[#3D6B2A] text-[13px] font-bold"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("dashboard.tapToOpenCamera", "Tap to open camera")} <ArrowRight size={14} strokeWidth={2.5} />
        </div>
      </button>

      {/* Create Lobby CTA */}
      <button
        onClick={onCreateLobby}
        className="w-full bg-white border border-[#D8E8D0] rounded-2xl p-4 flex items-center justify-between hover:bg-[#F7FBF5] active:scale-[0.98] transition-all shadow-sm mb-4 cursor-pointer"
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
              {t("dashboard.createLobbyTitle", "Create a Challenge Lobby")}
            </p>
            <p
              className="text-[12px] text-[#6B7C6B]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t("dashboard.createLobbySubtitle", "Host a live multiplayer session for students")}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-[#6B7C6B]" />
      </button>

      {/* Live CPR Practice CTA */}
      <button
        onClick={() => {
          // Unlock Audio on iOS (needs a direct user gesture)
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            audioCtx.resume();
          }
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('');
            utterance.volume = 0;
            window.speechSynthesis.speak(utterance);
          }
          onStartCPRPractice();
        }}
        className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between hover:bg-blue-100 active:scale-[0.98] transition-all shadow-sm mb-4 cursor-pointer"
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

      {/* Recent activity */}
      <p
        className="text-[14px] font-bold text-[#1A2816] mb-2.5"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        {t("dashboard.recentActivity", "Recent Activity")}
      </p>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="bg-white border border-[#E8EDE6] rounded-xl p-4 text-center">
            <p className="text-[13px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {t("dashboard.noRecentActivity", "No recent activity yet. Complete a quiz or CPR drill to track your progress!")}
            </p>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
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
                  {formatRelativeTime(item.created_at)}
                </p>
              </div>
              <span
                className="text-[11px] font-bold text-[#3D6B2A] bg-[#E8F5E2] px-2 py-1 rounded-lg shrink-0"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                +{item.xp_earned} {t("common.points", "PTS")}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Info Modal */}
      {infoModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A2816]/60 backdrop-blur-sm" onClick={() => setInfoModal({ ...infoModal, isOpen: false })} />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-7 shadow-2xl animate-slideUp">
            <button
              onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
              className="absolute top-5 right-5 text-[#6B7C6B] hover:text-[#1A2816] transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
            <div className="mb-5 text-center pr-4 pl-4 mt-2">
              {infoModal.icon === "Trophy" && <Trophy size={28} className="text-[#B3D59F] mx-auto mb-2" />}
              {infoModal.icon === "Zap" && <Zap size={28} className="text-[#B3D59F] mx-auto mb-2" />}
              <h3 className="text-[20px] font-extrabold text-[#1A2816]" style={{ fontFamily: "'Lexend', sans-serif" }}>
                {infoModal.title}
              </h3>
            </div>
            <p className="text-[15px] font-semibold text-[#587058] leading-relaxed text-center px-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {infoModal.description}
            </p>
            <button
              onClick={() => setInfoModal({ ...infoModal, isOpen: false })}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#F0F8EC] text-[#3D6B2A] font-extrabold text-[15px] hover:bg-[#E8F5E2] active:scale-[0.98] transition-all cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("dashboard.gotIt", "Got it")}
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1A2816]/60 backdrop-blur-sm" onClick={() => setLeaderboardModal({ ...leaderboardModal, isOpen: false })} />
          <div className="relative w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl animate-slideUp">
            <button
              onClick={() => setLeaderboardModal({ ...leaderboardModal, isOpen: false })}
              className="absolute top-5 right-5 text-[#6B7C6B] hover:text-[#1A2816] transition-colors cursor-pointer"
            >
              <X size={22} />
            </button>
            <div className="mb-5 text-center pr-4 pl-4 mt-2">
              <Star size={28} className="text-[#B3D59F] mx-auto mb-2" />
              <h3 className="text-[20px] font-extrabold text-[#1A2816]" style={{ fontFamily: "'Lexend', sans-serif" }}>
                {t("dashboard.leaderboardTitle", "Global Leaderboard")}
              </h3>
            </div>

            {leaderboardModal.loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#B3D59F]" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {leaderboardModal.data.length === 0 ? (
                  <p className="text-center text-[#6B7C6B] text-[13px] py-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    {t("dashboard.noLeaderboardData", "No leaderboard data found. Please run the SQL script in Supabase!")}
                  </p>
                ) : (
                  leaderboardModal.data.map((player) => {
                    const isMe = player.id === profile?.id;
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border ${isMe
                            ? "bg-[#E8F5E2] border-[#B3D59F] shadow-sm"
                            : "bg-white border-[#E8EDE6]"
                          }`}
                      >
                        <span className="w-6 text-center text-[13px] font-bold text-[#6B7C6B]">
                          #{player.rank}
                        </span>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-[14px] shrink-0 ${isMe ? "bg-[#B3D59F] text-[#1A3312]" : "bg-[#F7FBF5] text-[#6B7C6B] border border-[#E8EDE6]"
                          }`}>
                          {getInitials(player.display_name || "User")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] font-bold truncate ${isMe ? "text-[#1A2816]" : "text-[#4A5D4A]"}`} style={{ fontFamily: "'Lexend', sans-serif" }}>
                            {player.display_name || "User"} {isMe && t("dashboard.you", "(You)")}
                          </p>
                          <p className="text-[11px] font-semibold text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            {player.points} {t("common.points", "PTS")} · {player.streak}🔥
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            <button
              onClick={() => setLeaderboardModal({ ...leaderboardModal, isOpen: false })}
              className="w-full mt-6 py-3.5 rounded-xl bg-[#F0F8EC] text-[#3D6B2A] font-extrabold text-[15px] hover:bg-[#E8F5E2] active:scale-[0.98] transition-all cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("common.close", "Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

