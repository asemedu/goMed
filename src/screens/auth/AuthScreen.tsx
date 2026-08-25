import React, { useState } from "react";
import { Heart, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface AuthScreenProps {
  onNext: () => void;
}

export function AuthScreen({ onNext }: AuthScreenProps) {
  const { t } = useLanguage();
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
      setErrorMsg(t("auth.enterEmailFirst", "Please enter your email in the field above first."));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(username.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfoMsg(t("auth.resetLinkSent", "Password reset link has been sent to your email!"));
    } catch (err: any) {
      setErrorMsg(err.message || t("common.error", "Failed to send reset link."));
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    setErrorMsg("");
    setInfoMsg("");
    if (!username || !password) {
      setErrorMsg(t("auth.fillAllFields", "Please fill in all fields."));
      return;
    }

    if (mode === "signup") {
      if (!displayName.trim()) {
        setErrorMsg(t("auth.enterDisplayName", "Please enter a display name."));
        return;
      }
      if (password !== confirm) {
        setErrorMsg(t("auth.passwordsDoNotMatch", "Passwords do not match."));
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
      setErrorMsg(err.message || t("auth.authFailed", "Authentication failed."));
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
            {mode === "login" ? t("auth.welcomeBack", "Welcome back!") : t("auth.createAccount", "Create Account")}
          </h1>
          <p
            className="text-[14px] text-[#6B7C6B] mt-1"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {mode === "login"
              ? t("auth.loginSubtitle", "Sign in to continue your training")
              : t("auth.signupSubtitle", "Start your first-aid journey today")}
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
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 cursor-pointer ${
                mode === m
                  ? "bg-white text-[#1A2816] shadow-sm"
                  : "text-[#6B7C6B]"
              }`}
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {m === "login" ? t("auth.loginTab", "Log In") : t("auth.signupTab", "Sign Up")}
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
                {t("auth.displayName", "Display Name")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("auth.displayNamePlaceholder", "e.g. Alex C. or Dr. Smith")}
                className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
          )}

          <div>
            <label
              className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {mode === "signup" ? t("auth.emailAddress", "Email Address") : t("auth.usernameOrEmail", "Username or Email")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === "signup" ? t("auth.emailPlaceholder", "Enter your email") : t("auth.usernamePlaceholder", "Enter your username or email")}
              className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            />
          </div>
          <div>
            <label
              className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("auth.password", "Password")}
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder", "Enter your password")}
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7C6B] hover:text-[#3D6B2A] transition-colors cursor-pointer"
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
                className="text-[13px] text-[#3D6B2A] font-bold hover:underline disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {t("auth.forgotPassword", "Forgot password?")}
              </button>
            </div>
          )}
          {mode === "signup" && (
            <div>
              <label
                className="text-[13px] font-bold text-[#1A2816] mb-1.5 block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
                {t("auth.confirmPassword", "Confirm Password")}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("auth.confirmPasswordPlaceholder", "Confirm your password")}
                className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
            </div>
          )}
        </div>

        {infoMsg && (
          <div
            className="mt-4 bg-[#F0F8EC] border border-[#D4ECC5] text-[#3D6B2A] text-[13px] px-4 py-3 rounded-xl font-semibold"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {infoMsg}
          </div>
        )}

        {errorMsg && (
          <div
            className="mt-4 bg-[#FFF4F6] border border-[#FCC8D0] text-[#C0384E] text-[13px] px-4 py-3 rounded-xl font-semibold"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 mt-6 disabled:opacity-70 disabled:active:scale-100 cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {loading ? t("auth.pleaseWait", "Please wait...") : mode === "login" ? t("auth.loginTab", "Log In") : t("auth.createAccount", "Create Account")}
        </button>

        <p
          className="text-center text-[14px] text-[#6B7C6B] mt-5"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {mode === "login" ? (
            <>
              {t("auth.noAccount", "Don't have an account?") + " "}
              <button
                onClick={() => setMode("signup")}
                className="text-[#3D6B2A] font-extrabold hover:underline cursor-pointer"
              >
                {t("auth.signupTab", "Sign Up")}
              </button>
            </>
          ) : (
            <>
              {t("auth.haveAccount", "Already have an account?") + " "}
              <button
                onClick={() => setMode("login")}
                className="text-[#3D6B2A] font-extrabold hover:underline cursor-pointer"
              >
                {t("auth.loginTab", "Log In")}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
