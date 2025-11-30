"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Language, TranslationKey } from "@/lib/translations"
import { translations } from "@/lib/translations"

type LanguageState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

export const useLanguage = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "ru",
      setLanguage: (language) => set({ language }),
      t: (key) => {
        const { language } = get()
        return translations[language][key] || key
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
