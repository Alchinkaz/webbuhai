"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  IconHome,
  IconFileText,
  IconUsers,
  IconBuildingWarehouse,
  IconUsersGroup,
  IconCoin,
  IconSettings,
} from "@tabler/icons-react"
import { useNavigation } from "@/hooks/use-navigation"

const navigationItems = [
  { id: "dashboard", label: "Главная", icon: IconHome },
  { id: "documents", label: "Документы", icon: IconFileText },
  { id: "party", label: "Контрагенты", icon: IconUsers },
  { id: "inventory", label: "Инвентарь", icon: IconBuildingWarehouse },
  { id: "hr", label: "Сотрудники", icon: IconUsersGroup },
  { id: "finance", label: "Финансы", icon: IconCoin },
  { id: "settings", label: "Настройки", icon: IconSettings },
]

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const { setCurrentPage } = useNavigation()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open on "/" key
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if user is typing in an input
        const target = e.target as HTMLElement
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return
        }
        e.preventDefault()
        setOpen((open) => !open)
      }
      // Also support Cmd+K / Ctrl+K
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (pageId: string) => {
    setCurrentPage(pageId)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Введите</span>
        <Kbd>/</Kbd>
        <span>для поиска</span>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Поиск по приложению..." />
        <CommandList>
          <CommandEmpty>Ничего не найдено.</CommandEmpty>
          <CommandGroup heading="Навигация">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.id)}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Search className="h-4 w-4" />
      <span>Введите</span>
      <Kbd>/</Kbd>
      <span>для поиска</span>
    </button>
  )
}
