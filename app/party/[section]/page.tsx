"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PartyContent } from "@/components/pages/party-content"
import { useEffect } from "react"
import { useNavigation } from "@/hooks/use-navigation"
import { useParams, useRouter } from "next/navigation"

const validSections = ["counterparties", "contracts", "reconciliation"]

export default function PartySectionPage() {
  const { setCurrentPage } = useNavigation()
  const params = useParams()
  const router = useRouter()
  const section = params?.section as string

  useEffect(() => {
    setCurrentPage("party")
    
    // Redirect to counterparties if no section or invalid section
    if (!section || !validSections.includes(section)) {
      router.replace("/party/counterparties")
    }
  }, [setCurrentPage, section, router])

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
            <PartyContent initialFilter={section || "counterparties"} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

