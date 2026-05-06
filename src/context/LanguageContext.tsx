import React, { createContext, useContext, useState } from "react";
import { translations } from "../translations";
import type { Language } from "../types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: any) => {
  const [language, setLanguage] = useState<Language>("en");

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside provider");
  return context;
};
