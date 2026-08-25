import React, { createContext, useContext, useState, useEffect } from "react";
import { en, Translations } from "./locales/en";
import { ro } from "./locales/ro";
import { storage, STORAGE_KEYS } from "../storage";

export type Language = "ro" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  translations: Translations;
}

const dictionaries: Record<Language, Translations> = {
  ro,
  en,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return storage.get<Language>(STORAGE_KEYS.LANGUAGE, "ro");
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storage.set(STORAGE_KEYS.LANGUAGE, lang);
  };

  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current: any = dictionaries[language];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary if key missing in current language
        let fallbackCurrent: any = dictionaries.en;
        for (const fKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === "object" && fKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fKey];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackCurrent === "string" ? fallbackCurrent : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translations: dictionaries[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
