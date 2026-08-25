import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Edit3,
  Check,
  Mail,
  Lock,
  Key,
  LogOut,
  ArrowLeft,
  Zap,
  Globe,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { storage, STORAGE_KEYS } from "../../lib/storage";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface ProfileScreenProps {
  onBack: () => void;
  onSignOut?: () => void;
}

export function ProfileScreen({ onBack, onSignOut }: ProfileScreenProps) {
  const { language, setLanguage, t } = useLanguage();

  const [profile, setProfile] = useState<{
    display_name?: string;
    username?: string;
    email?: string;
    points?: number;
    ranking?: number;
    activities_count?: number;
    streak?: number;
  } | null>(() => storage.get(STORAGE_KEYS.PROFILE, null));

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [sendingReset, setSendingReset] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
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

          const loadedName =
            data?.display_name ||
            user.user_metadata?.display_name ||
            "Alex Chen";
          const newProfile = {
            display_name: loadedName,
            username: user.email?.split("@")[0] || "alexchen",
            email: user.email || "alex.chen@example.com",
            points: data?.points ?? 0,
            ranking: userRank,
            activities_count: data?.activities_count ?? 0,
            streak: data?.streak ?? 0,
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
  const rankDisplay =
    profile?.ranking && profile.ranking > 0 ? `#${profile.ranking}` : "—";

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
      setFeedbackMsg({ type: "error", text: t("profile.nameEmpty", "Display name cannot be empty.") });
      return;
    }
    if (trimmed === displayName) {
      setIsEditingName(false);
      return;
    }

    setSavingName(true);
    setFeedbackMsg(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
        setFeedbackMsg({
          type: "success",
          text: t("profile.nameUpdated", "Display name updated successfully!"),
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Failed to update display name.",
      });
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
        text: t("profile.resetSent", "Password reset link sent! Please check your email inbox."),
      });
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || t("profile.resetError", "Failed to send password reset email."),
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
          {t("profile.title", "My Profile")}
        </h2>
        <p
          className="text-[13px] text-[#6B7C6B]"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {t("profile.subtitle", "Account details & medical training stats")}
        </p>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`mb-4 px-4 py-3 rounded-2xl text-[13px] font-semibold flex items-center justify-between transition-all ${
            feedbackMsg.type === "success"
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
        <p
          className="text-[13px] text-[#6B7C6B] font-semibold"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          @{username}
        </p>

        {/* Stats inside Profile */}
        <div className="grid grid-cols-2 gap-3 w-full mt-4 pt-4 border-t border-[#E0EBDC]">
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p
              className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("profile.totalPoints", "Total Points")}
            </p>
            <p
              className="text-[20px] font-extrabold text-[#3D6B2A] mt-0.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {points.toLocaleString()} <span className="text-[12px]">{t("common.points", "PTS")}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p
              className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("profile.globalRank", "Global Rank")}
            </p>
            <p
              className="text-[20px] font-extrabold text-[#1A2816] mt-0.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {rankDisplay}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p
              className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("profile.activities", "Activities")}
            </p>
            <p
              className="text-[20px] font-extrabold text-[#1A2816] mt-0.5"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {profile?.activities_count || 0}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-[#E8EDE6] text-center">
            <p
              className="text-[11px] font-bold text-[#6B7C6B] uppercase tracking-wider"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("profile.dayStreak", "Day Streak")}
            </p>
            <p
              className="text-[20px] font-extrabold text-[#1A2816] mt-0.5 flex items-center justify-center gap-1"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {profile?.streak || 0} <Zap size={16} className="text-[#B3D59F]" />
            </p>
          </div>
        </div>
      </div>

      {/* App Preferences & Language Toggle */}
      <div className="space-y-3 mb-5">
        <p
          className="text-[13px] font-bold text-[#1A2816] px-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("profile.preferences", "App Preferences")}
        </p>
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <p
                className="text-[11px] text-[#6B7C6B] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("profile.language", "Language")}
              </p>
              <p
                className="text-[14px] font-extrabold text-[#1A2816]"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {language === "ro" ? "Română (RO)" : "English (EN)"}
              </p>
            </div>
          </div>

          <div className="flex items-center p-1 bg-[#F0F5EE] rounded-xl border border-[#E0EBDC]">
            <button
              type="button"
              onClick={() => setLanguage("ro")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                language === "ro"
                  ? "bg-[#B3D59F] text-[#1A3312] shadow-sm"
                  : "text-[#6B7C6B] hover:text-[#1A2816]"
              }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              🇷🇴 RO
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-extrabold transition-all cursor-pointer ${
                language === "en"
                  ? "bg-[#B3D59F] text-[#1A3312] shadow-sm"
                  : "text-[#6B7C6B] hover:text-[#1A2816]"
              }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="space-y-3 mb-5">
        <p
          className="text-[13px] font-bold text-[#1A2816] px-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("profile.accountInfo", "Account Information")}
        </p>

        {/* Display Name Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
            <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
              <User size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[11px] text-[#6B7C6B] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("profile.displayName", "Display Name")}
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
                  placeholder={t("profile.enterDisplayName", "Enter display name")}
                  className="w-full px-2.5 py-1 mt-0.5 rounded-lg border border-[#B3D59F] bg-[#F7FBF5] text-[#1A2816] text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-[#B3D59F]"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                />
              ) : (
                <p
                  className="text-[14px] font-extrabold text-[#1A2816] truncate"
                  style={{ fontFamily: "'Lexend', sans-serif" }}
                >
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
                className="px-3 py-1.5 rounded-xl bg-[#B3D59F] text-[#1A3312] text-[12px] font-extrabold hover:bg-[#9DC885] active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                <Check size={13} strokeWidth={3} /> {savingName ? "..." : t("common.save", "Save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditNameValue(displayName);
                  setIsEditingName(false);
                }}
                className="px-2 py-1.5 text-[#6B7C6B] text-[12px] font-bold hover:text-[#1A2816] cursor-pointer"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("common.cancel", "Cancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditNameValue(displayName);
                setIsEditingName(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F0F5EE] text-[#3D6B2A] text-[12px] font-bold hover:bg-[#E2EBE0] active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              <Edit3 size={13} /> {t("profile.change", "Change")}
            </button>
          )}
        </div>

        {/* Username Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
            <span className="font-extrabold text-[15px]">@</span>
          </div>
          <div>
            <p
              className="text-[11px] text-[#6B7C6B] font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t("profile.username", "Username")}
            </p>
            <p
              className="text-[14px] font-extrabold text-[#1A2816]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
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
            <p
              className="text-[11px] text-[#6B7C6B] font-semibold"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t("profile.emailAddress", "Email Address")}
            </p>
            <p
              className="text-[14px] font-extrabold text-[#1A2816] truncate"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-3 mb-6">
        <p
          className="text-[13px] font-bold text-[#1A2816] px-1"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("profile.security", "Security")}
        </p>

        {/* Password Item */}
        <div className="bg-white border border-[#E8EDE6] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F0F8EC] border border-[#D4ECC5] flex items-center justify-center text-[#3D6B2A] shrink-0">
              <Lock size={18} />
            </div>
            <div>
              <p
                className="text-[11px] text-[#6B7C6B] font-semibold"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("profile.password", "Password")}
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
            className="px-3 py-1.5 rounded-xl bg-[#F0F5EE] text-[#3D6B2A] text-[12px] font-bold hover:bg-[#E2EBE0] active:scale-95 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60 cursor-pointer"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            <Key size={13} /> {sendingReset ? "..." : t("profile.change", "Change")}
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
        className="w-full py-3.5 rounded-2xl bg-white border border-[#FAD2D2] text-[#D93838] font-extrabold text-[15px] hover:bg-[#FFF5F5] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-3 shadow-sm cursor-pointer"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        <LogOut size={18} strokeWidth={2.2} /> {t("profile.signOut", "Sign Out of goMed")}
      </button>

      {/* Back / Done button */}
      <button
        onClick={onBack}
        className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[16px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-auto cursor-pointer"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        <ArrowLeft size={18} strokeWidth={2.5} /> {t("profile.backToDashboard", "Back to Dashboard")}
      </button>
    </div>
  );
}
