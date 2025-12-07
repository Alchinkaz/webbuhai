"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSearch, IconFileText } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Template } from "@/lib/storage"

const filters = [
  { id: "incoming", label: "Входящие", path: "/documents/incoming" },
  { id: "outgoing", label: "Исходящие", path: "/documents/outgoing" },
  { id: "templates", label: "Шаблоны", path: "/documents/templates" },
]

interface DocumentStatusFilterProps {
  onCreateClick?: () => void
  onTemplateSelect?: (templateId: string) => void
  templates?: Template[]
  createButtonDisabled?: boolean
  activeFilter?: string
  onFilterChange?: (filterId: string) => void
  documentType?: string | null
}

export function DocumentStatusFilter({
  onCreateClick,
  onTemplateSelect,
  templates = [],
  createButtonDisabled,
  activeFilter: externalActiveFilter,
  onFilterChange,
  documentType,
}: DocumentStatusFilterProps) {
  const pathname = usePathname()
  const [internalActiveFilter, setInternalActiveFilter] = React.useState("incoming")

  // Determine active filter from URL
  const getActiveFilterFromPath = () => {
    if (pathname) {
      const filter = filters.find(f => f.path === pathname)
      return filter?.id || "incoming"
    }
    return "incoming"
  }

  const activeFilter = externalActiveFilter ?? getActiveFilterFromPath()

  React.useEffect(() => {
    const filterFromPath = getActiveFilterFromPath()
    if (filterFromPath !== activeFilter && onFilterChange) {
      onFilterChange(filterFromPath)
    }
  }, [pathname])

  const handleTemplateSelect = (templateId: string) => {
    if (onTemplateSelect) {
      onTemplateSelect(templateId)
    }
  }

  const shouldShowSearchAndButton = activeFilter !== "templates"

  return (
    <>
      <div className="sticky top-0 z-10 border-b px-4 lg:px-6 mb-3 pt-4 pb-0 bg-background/95 backdrop-blur-md">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Document status filter">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id || pathname === filter.path
            return (
              <Link
                key={filter.id}
                href={filter.path}
                onClick={() => {
                  if (onFilterChange) {
                    onFilterChange(filter.id)
                  }
                }}
                className={`text-muted-foreground hover:text-foreground relative whitespace-nowrap border-b-2 text-sm font-medium transition-colors pb-3.5 ${
                  isActive ? "text-foreground border-foreground" : "border-transparent"
                }`}
              >
                {filter.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {shouldShowSearchAndButton && (
        <div className="px-4 lg:px-6 mb-3 flex items-center gap-3 pt-1">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Поиск документов..." className="pl-9" />
          </div>
          {templates.length > 0 && onTemplateSelect ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={createButtonDisabled}>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Новый документ
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {templates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="cursor-pointer"
                  >
                    <IconFileText className="h-4 w-4 mr-2" />
                    <span>{template.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onCreateClick} disabled={createButtonDisabled}>
              <IconPlus className="h-4 w-4 mr-2" />
              Новый документ
            </Button>
          )}
        </div>
      )}
    </>
  )
}
