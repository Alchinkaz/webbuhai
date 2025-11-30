"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardOldContent } from "@/components/pages/dashboard-old-content"
import { useLanguage } from "@/hooks/use-language"

export default function DashboardOldPage() {
  const { t } = useLanguage()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 16)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset>
        <SiteHeader title={t("dashboardOld")} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <DashboardOldContent />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
