"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FinanceContent } from "@/components/pages/finance-content"
import { useEffect } from "react"
import { useNavigation } from "@/hooks/use-navigation"

export default function FinancePage() {
  const { setCurrentPage } = useNavigation()
  
  useEffect(() => {
    // Устанавливаем текущую страницу для корректной работы навигации
    setCurrentPage("deals")
  }, [setCurrentPage])

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <FinanceContent />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

