"use client"

import type * as React from "react"
import {
  IconHome,
  IconSettings,
  IconBriefcase,
  IconDatabase,
  IconUsers,
  IconBriefcase2,
  IconCoin,
  IconFileText,
  IconChartBar,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar"
import { useLanguage } from "@/hooks/use-language"

const data = {
  user: {
    name: "ИП Alchin",
    email: "960821350108",
    avatar: "/placeholder-user.jpg",
  },
  navClouds: [
    {
      title: "Capture",
      icon: IconBriefcase,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconBriefcase,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconBriefcase,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useLanguage()

  const navMain = [
    {
      title: t("home"),
      url: "/",
      icon: IconHome,
    },
    {
      title: t("finance"),
      url: "/deals",
      icon: IconCoin,
    },
    {
      title: "Отчёты",
      url: "/reports",
      icon: IconChartBar,
    },
    {
      title: t("documents"),
      url: "/documents",
      icon: IconFileText,
    },
    {
      title: t("inventory"),
      url: "/inventory",
      icon: IconDatabase,
    },
    {
      title: t("party"),
      url: "/party",
      icon: IconUsers,
    },
    {
      title: t("hr"),
      url: "/hr",
      icon: IconBriefcase2,
    },
    {
      title: t("settings"),
      url: "/settings",
      icon: IconSettings,
    },
  ]

  const navSecondary: any[] = []

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between py-1.5 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 pt-0 pb-0">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold">Acme Inc.</span>
          </div>
          <SidebarTrigger className="h-8 w-8" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {navSecondary.length > 0 && <NavSecondary items={navSecondary} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
