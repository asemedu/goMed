import React from "react";
import { Home, BookOpen, Boxes, HelpCircle } from "lucide-react";
import { Screen } from "../../types";
import { useLanguage } from "../../lib/i18n/LanguageContext";

interface BottomNavBarProps {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

export function BottomNavBar({ current, onNavigate }: BottomNavBarProps) {
  const { t } = useLanguage();

  const tabs: {
    id: Screen;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { id: "dashboard", label: t("nav.home", "Home"), icon: Home },
    { id: "quizzes", label: t("nav.quizzes", "Quizzes"), icon: HelpCircle },
    { id: "ar-hub", label: t("nav.arPractice", "AR Practice"), icon: Boxes },
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
