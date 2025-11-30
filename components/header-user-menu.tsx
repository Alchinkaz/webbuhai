"use client"

import { IconCreditCard, IconLogout, IconNotification, IconUserCircle } from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"

export function HeaderUserMenu({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0 hover:bg-accent">
          <Avatar className="h-8 w-8 rounded-full shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_#9ca3af]">
            <AvatarFallback className="rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white text-xs font-medium">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-lg" side="bottom" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-full shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_#9ca3af]">
              <AvatarFallback className="rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white text-xs font-medium">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
            {t("account")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            {t("billing")}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconNotification />
            {t("notifications")}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <IconLogout />
          {t("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
