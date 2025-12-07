"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FinanceContent } from "@/components/pages/finance-content"
import { useEffect } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { useParams, useRouter } from "next/navigation"

export default function FinanceTabPage() {
  const { setCurrentPage } = useNavigation()
  const params = useParams()
  const router = useRouter()
  const tab = params?.tab as string

  useEffect(() => {
    setCurrentPage("deals")
    
    // Redirect to analytics if no tab or invalid tab
    if (!tab || !["analytics", "bank", "cash"].includes(tab)) {
      router.replace("/deals/analytics")
    }
  }, [setCurrentPage, tab, router])

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
            <FinanceContent initialTab={tab || "analytics"} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

