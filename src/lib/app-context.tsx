"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { themes, Theme } from "./themes";
import { languages, Language } from "./i18n";

type TimeFormat = "24h" | "12h";

interface AppContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  t: (key: string) => string;
}

const defaultTheme = themes[0];
const defaultLanguage = languages[0];
const defaultTimeFormat: TimeFormat = "24h";

const AppContext = createContext<AppContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  language: defaultLanguage,
  setLanguage: () => {},
  timeFormat: defaultTimeFormat,
  setTimeFormat: () => {},
  t: (key: string) => key,
});

export const useApp = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(defaultTimeFormat);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  // Load settings from localStorage on client side
  useEffect(() => {
    const storedThemeId = localStorage.getItem("theme");
    const storedLanguageId = localStorage.getItem("language");
    const storedTimeFormat = localStorage.getItem("timeFormat") as TimeFormat | null;

    if (storedThemeId) {
      const foundTheme = themes.find(t => t.id === storedThemeId);
      if (foundTheme) setTheme(foundTheme);
    }

    if (storedLanguageId) {
      const foundLanguage = languages.find(l => l.id === storedLanguageId);
      if (foundLanguage) setLanguage(foundLanguage);
    }

    if (storedTimeFormat && (storedTimeFormat === "24h" || storedTimeFormat === "12h")) {
      setTimeFormat(storedTimeFormat);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("theme", theme.id);
    document.documentElement.className = theme.className;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("language", language.id);
    // Load translations directly
    import("./i18n").then(module => {
      const { translations } = module;
      setTranslations(translations[language.id] || translations["en"]);
    });
  }, [language]);

  useEffect(() => {
    localStorage.setItem("timeFormat", timeFormat);
  }, [timeFormat]);

  // Translation function
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        language,
        setLanguage,
        timeFormat,
        setTimeFormat,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
