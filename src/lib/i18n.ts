export type Language = {
  id: string;
  name: string;
  nativeName: string;
};

export const languages: Language[] = [
  {
    id: "en",
    name: "English",
    nativeName: "English",
  },
  {
    id: "pl",
    name: "Polish",
    nativeName: "Polski",
  },
];

export type Translations = {
  [key: string]: string;
};

export const translations: Record<string, Translations> = {
  en: {
    // App
    "app.title": "Sleep Phase Calculator",
    "app.description": "Find the optimal time to wake up based on your sleep cycles.",
    
    // Form
    "form.bedtime.label": "What time do you go to bed?",
    "form.bedtime.description": "Enter the time you get into bed.",
    "form.fallAsleepTime.label": "How long does it take you to fall asleep? (minutes)",
    "form.fallAsleepTime.description": "Enter how many minutes it typically takes you to fall asleep.",
    "form.wakeUpTime.label": "What time do you need to wake up at the latest?",
    "form.wakeUpTime.description": "Enter the latest time you need to be awake.",
    "form.submit": "Calculate Optimal Wake-Up Times",
    
    // Results
    "results.title": "Recommended Wake-Up Times",
    "results.description": "These times align with the end of your sleep cycles, making it easier to wake up feeling refreshed.",
    "results.footer": "Sleep cycles typically last about 90 minutes. Waking up at the end of a cycle, rather than in the middle, helps you feel more rested.",
    "results.hours": "hours of sleep",
    "results.cycles": "complete cycles",
    "results.quality": "Sleep quality",
    "results.recommended": "Recommended",
    
    // Settings
    "settings.title": "Settings",
    "settings.theme.label": "Theme",
    "settings.theme.description": "Choose your preferred theme.",
    "settings.language.label": "Language",
    "settings.language.description": "Choose your preferred language.",
    "settings.timeFormat.label": "Time Format",
    "settings.timeFormat.description": "Choose your preferred time format.",
    "settings.timeFormat.24h": "24-hour",
    "settings.timeFormat.12h": "12-hour",
    "settings.save": "Save Settings",
  },
  pl: {
    // App
    "app.title": "Kalkulator Faz Snu",
    "app.description": "Znajdź optymalny czas na obudzenie się w oparciu o cykle snu.",
    
    // Form
    "form.bedtime.label": "O której godzinie kładziesz się spać?",
    "form.bedtime.description": "Wprowadź godzinę, o której kładziesz się do łóżka.",
    "form.fallAsleepTime.label": "Ile czasu zajmuje Ci zaśnięcie? (minuty)",
    "form.fallAsleepTime.description": "Wprowadź, ile minut zazwyczaj zajmuje Ci zaśnięcie.",
    "form.wakeUpTime.label": "O której godzinie musisz wstać najpóźniej?",
    "form.wakeUpTime.description": "Wprowadź najpóźniejszą godzinę, o której musisz być na nogach.",
    "form.submit": "Oblicz Optymalne Godziny Budzenia",
    
    // Results
    "results.title": "Zalecane Godziny Budzenia",
    "results.description": "Te godziny są dostosowane do końca cykli snu, co ułatwia budzenie się i sprawia, że czujesz się bardziej wypoczęty.",
    "results.footer": "Cykle snu trwają zwykle około 90 minut. Budzenie się pod koniec cyklu, a nie w jego środku, pomaga czuć się bardziej wypoczętym.",
    "results.hours": "godzin snu",
    "results.cycles": "pełne cykle",
    "results.quality": "Jakość snu",
    "results.recommended": "Zalecane",
    
    // Settings
    "settings.title": "Ustawienia",
    "settings.theme.label": "Motyw",
    "settings.theme.description": "Wybierz preferowany motyw.",
    "settings.language.label": "Język",
    "settings.language.description": "Wybierz preferowany język.",
    "settings.timeFormat.label": "Format Czasu",
    "settings.timeFormat.description": "Wybierz preferowany format czasu.",
    "settings.timeFormat.24h": "24-godzinny",
    "settings.timeFormat.12h": "12-godzinny",
    "settings.save": "Zapisz Ustawienia",
  },
};

export function getTranslation(key: string, language: string): string {
  return translations[language]?.[key] || translations["en"][key] || key;
}
