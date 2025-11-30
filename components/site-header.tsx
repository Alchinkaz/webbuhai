"use client"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { HeaderUserMenu } from "@/components/header-user-menu"
import { NotificationsMenu } from "@/components/notifications-menu"
import { GlobalSearch } from "@/components/global-search"
import { HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const user = {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/placeholder.svg",
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Breadcrumbs />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md bg-background dark:bg-background border border-border hover:bg-muted"
            title="Поддержка"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          <NotificationsMenu />
          <HeaderUserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
