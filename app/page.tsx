"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNavigation } from "@/hooks/use-navigation"
import { useLanguage } from "@/hooks/use-language"
import { useEffect } from "react"

import { DashboardOldContent } from "@/components/pages/dashboard-old-content"
import { DashboardNewContent } from "@/components/pages/dashboard-new-content"
import { ProjectsContent } from "@/components/pages/projects-content"
import { FinanceContent } from "@/components/pages/finance-content"
import { InventoryContent } from "@/components/pages/inventory-content"
import { PartyContent } from "@/components/pages/party-content"
import { HRContent } from "@/components/pages/hr-content"
import { SettingsContent } from "@/components/pages/settings-content"
import { GetHelpContent } from "@/components/pages/get-help-content"
import { DocumentsContent } from "@/components/pages/documents-content"
import { ReportsContent } from "@/components/pages/reports-content"

export default function Page() {
  const { currentPage } = useNavigation()
  const { t } = useLanguage()

  // Handle query param navigation, e.g., /?goto=documents
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const goto = params.get("goto")
      if (goto) {
        // Import setter lazily to avoid re-render issues
        import("@/hooks/use-navigation").then(({ useNavigation }) => {
          const { setCurrentPage } = useNavigation.getState()
          setCurrentPage(goto)
        })
      }
    } catch {}
  }, [])

  const getPageTitle = () => {
    switch (currentPage) {
      case "dashboard-old":
        return t("dashboardOld")
      case "deals":
        return t("finance")
      case "inventory":
        return t("inventory")
      case "party":
        return t("party")
      case "hr":
        return t("hr")
      case "projects":
        return t("projects")
      case "documents":
        return t("documents")
      case "settings":
        return t("settings")
      case "help":
        return t("getHelp")
      case "reports":
        return "Отчёты"
      case "Home":
      default:
        return t("home")
    }
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard-old":
        return <DashboardOldContent />
      case "deals":
        return <FinanceContent />
      case "inventory":
        return <InventoryContent />
      case "party":
        return <PartyContent />
      case "hr":
        return <HRContent />
      case "projects":
        return <ProjectsContent />
      case "documents":
        return <DocumentsContent />
      case "settings":
        return <SettingsContent />
      case "help":
        return <GetHelpContent />
      case "reports":
        return <ReportsContent />
      case "Home":
      default:
        return <DashboardNewContent />
    }
  }

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
      <SidebarInset className="overflow-hidden md:h-[calc(100vh-16px)]">
        <div className="shrink-0">
          <SiteHeader />
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="@container/main flex flex-1 flex-col gap-2">{renderContent()}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
