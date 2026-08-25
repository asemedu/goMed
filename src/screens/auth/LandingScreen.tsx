import React from "react";
import { Heart, ArrowRight, Shield, Users, Star } from "lucide-react";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface LandingScreenProps {
  onNext: () => void;
}

export function LandingScreen({ onNext }: LandingScreenProps) {
  const { t } = useLanguage();

  const featurePills = [
    t("landing.pillGamified", "Gamified Learning"),
    t("landing.pillXP", "XP & Levels"),
    t("landing.pillReal", "Real Scenarios"),
    t("landing.pillCertified", "Certified"),
  ];

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
            {t("landing.titlePart1", "Master First Aid,")}<br />{t("landing.titlePart2", "Save Lives.")}
          </h1>
          <p className="text-[15px] text-[#6B7C6B] leading-relaxed" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {t("landing.subtitle", "Level up your emergency response skills through gamified, real-world training scenarios.")}
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {featurePills.map((label) => (
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
          className="w-full py-4 rounded-2xl bg-[#B3D59F] text-[#1A3312] font-extrabold text-[17px] shadow-md hover:bg-[#9DC885] active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          style={{ fontFamily: "'Lexend', sans-serif" }}
        >
          {t("landing.getStarted", "Get Started")} <ArrowRight size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Sponsor footer */}
      <div className="border-t border-[#E8F0E4] mx-5 pt-4 pb-3">
        <p
          className="text-center text-[11px] text-[#6B7C6B] mb-3 font-semibold uppercase tracking-widest"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {t("landing.supportedBy", "Supported by")}
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
                className="text-[10px] text-[#6B7C6B] font-bold"
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
