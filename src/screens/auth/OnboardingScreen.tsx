import React from "react";
import {
  BookOpen,
  Trophy,
  Zap,
  Star,
  Users,
  Smartphone,
  Apple,
  CheckCircle,
  Lock,
  Shield,
  Camera,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface OnboardingScreenProps {
  onNext: () => void;
}

export function OnboardingScreen({ onNext }: OnboardingScreenProps) {
  const { t } = useLanguage();

  const resumeItems = [
    { icon: Trophy, text: t("onboarding.resumePoint1", "Earn XP and level up your first-aid rank through live challenges") },
    { icon: Zap, text: t("onboarding.resumePoint2", "Real-time multiplayer scenarios via QR lobby system") },
    { icon: Star, text: t("onboarding.resumePoint3", "Unlock badges and certifications as you progress") },
    { icon: Users, text: t("onboarding.resumePoint4", "Compete and collaborate with peers in live training sessions") },
  ];

  return (
    <div className="relative flex flex-col" style={{ minHeight: 740 }}>
      <div className="px-6 pt-5 pb-2">
        <h2
          className="text-[22px] font-extrabold text-[#1A2816]"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("onboarding.title", "Before You Begin")}
        </h2>
        <p className="text-[13px] text-[#6B7C6B] mt-0.5" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {t("onboarding.subtitle", "Please review the following information")}
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
                {t("onboarding.resumeTitle", "App Resumé")}
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {t("onboarding.resumeSubtitle", "What you will learn & earn")}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {resumeItems.map(({ icon: Icon, text }, i) => (
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
                {t("onboarding.sysReqTitle", "System Requirements")}
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {t("onboarding.sysReqSubtitle", "Supported browsers only")}
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              {
                icon: Apple,
                iconColor: "text-[#1A2816]",
                iconBg: "bg-[#F5F5F8]",
                title: t("onboarding.iphoneUsers", "iPhone users"),
                sub: t("onboarding.iphoneSub", "Use Safari browser"),
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
                title: t("onboarding.androidUsers", "Android users"),
                sub: t("onboarding.androidSub", "Use Chrome browser"),
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
                {t("onboarding.privacyTitle", "Privacy & GDPR")}
              </h3>
              <p className="text-[12px] text-[#6B7C6B]" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {t("onboarding.privacySubtitle", "Your data is protected")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center py-4 mb-3 bg-[#F7FBF5] rounded-xl border border-[#E0F0D8]">
            <Shield size={40} className="text-[#B3D59F] mb-2" />
            <p
              className="font-extrabold text-[#1A2816] text-[16px]"
              style={{ fontFamily: "'Lexend', sans-serif" }}
            >
              {t("onboarding.dataSafe", "Your data is 100% safe.")}
            </p>
            <p
              className="text-center text-[13px] text-[#6B7C6B] mt-1 px-4"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {t("onboarding.privacyDesc", "We never collect personal medical data or share information with third parties.")}
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
              {t("onboarding.videosNeverSaved", "Videos are NEVER saved.")}
            </p>
          </div>
        </div>
      </div>

      {/* Pinned Next */}
      <div className="absolute bottom-8 left-0 right-0 px-5">
        <div className="bg-white/90 backdrop-blur-sm pt-3 rounded-t-2xl">
          <button
            onClick={onNext}
            className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontFamily: "'Lexend', sans-serif" }}
          >
            {t("onboarding.next", "Next")} <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
