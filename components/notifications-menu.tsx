"use client"

import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: Date
}

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Новый документ",
      message: "Документ 'Контракт №123' был успешно создан",
      read: false,
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "2",
      title: "Система",
      message: "Резервная копия выполнена успешно",
      read: false,
      timestamp: new Date(Date.now() - 30 * 60000),
    },
    {
      id: "3",
      title: "Обновление",
      message: "Доступно новое обновление приложения",
      read: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Только что"
    if (minutes < 60) return `${minutes}м назад`
    if (hours < 24) return `${hours}ч назад`
    if (days < 7) return `${days}д назад`
    return date.toLocaleDateString("ru-RU")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-md bg-background dark:bg-background border border-border hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 rounded-lg p-0" side="bottom" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-lg">Уведомления</h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p>Нет уведомлений</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-96">
              <div className="flex flex-col">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        notification.read
                          ? "bg-background hover:bg-muted"
                          : "bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground line-clamp-1">{notification.title}</p>
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                    </div>
                    {index < notifications.length - 1 && <DropdownMenuSeparator className="m-0" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
            {unreadCount > 0 && (
              <div className="border-t px-4 py-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Прочитать все</span>
                </button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
