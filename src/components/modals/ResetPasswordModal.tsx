import React, { useState } from "react";
import { X, Key, Check, Eye, EyeOff } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
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
              <label
                className="text-[11px] font-bold text-[#6B7C6B] uppercase mb-1 block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
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
              <label
                className="text-[11px] font-bold text-[#6B7C6B] uppercase mb-1 block"
                style={{ fontFamily: "'Lexend', sans-serif" }}
              >
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
