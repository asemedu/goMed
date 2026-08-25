import React, { useState } from "react";
import { Heart, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface AuthScreenProps {
  onNext: () => void;
}

export function AuthScreen({ onNext }: AuthScreenProps) {
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
              className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all duration-200 ${
                mode === m
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
              {mode === "signup" ? "Email Address" : "Username or Email"}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === "signup" ? "Enter your email" : "Enter your username or email"}
              className="w-full px-4 py-3.5 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
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
                className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#D8E8D0] bg-[#F7FBF5] text-[#1A2816] placeholder-[#6B7C6B] focus:outline-none focus:border-[#B3D59F] focus:ring-2 focus:ring-[#B3D59F]/30 transition-all text-[14px]"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7C6B] hover:text-[#3D6B2A] transition-colors"
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
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 mt-6 disabled:opacity-70 disabled:active:scale-100"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
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
