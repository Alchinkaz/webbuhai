"use client"

import { useLanguage } from "@/hooks/use-language"

export function GetHelpContent() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold">{t("getHelpTitle")}</h1>
        <p className="text-muted-foreground">{t("getHelpDescription")}</p>
      </div>
    </div>
  )
}
