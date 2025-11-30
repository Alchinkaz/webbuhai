"use client"

import { IconCreditCard, IconLogout, IconNotification, IconUserCircle } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useLanguage } from "@/hooks/use-language"
import { useNavigation } from "@/hooks/use-navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile, state } = useSidebar()
  const { setCurrentPage } = useNavigation()
  const isCollapsed = state === "collapsed"

  const handleClick = () => {
    setCurrentPage("settings")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <button
          onClick={handleClick}
          className={`flex w-full items-center gap-3 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 rounded-md py-2 transition-colors ${isCollapsed ? "" : "hover:bg-accent"}`}
        >
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">ИП</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
        </button>
        <DropdownMenu>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={24}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">ИП</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                {/* Added translation for account */}
                {useLanguage().t("account")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                {/* Added translation for billing */}
                {useLanguage().t("billing")}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                {/* Added translation for notifications */}
                {useLanguage().t("notifications")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout />
              {/* Added translation for logOut */}
              {useLanguage().t("logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
