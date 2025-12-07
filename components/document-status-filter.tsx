"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const filters = [
  { id: "incoming", label: "Документы" },
  { id: "templates", label: "Шаблоны" },
]

interface DocumentStatusFilterProps {
  onCreateClick: () => void
  createButtonDisabled?: boolean
  activeFilter?: string
  onFilterChange?: (filterId: string) => void
  documentType?: string | null
}

export function DocumentStatusFilter({
  onCreateClick,
  createButtonDisabled,
  activeFilter: externalActiveFilter,
  onFilterChange,
  documentType,
}: DocumentStatusFilterProps) {
  const [internalActiveFilter, setInternalActiveFilter] = React.useState("incoming")

  const activeFilter = externalActiveFilter ?? internalActiveFilter

  const handleFilterClick = (filterId: string) => {
    if (onFilterChange) {
      onFilterChange(filterId)
    } else {
      setInternalActiveFilter(filterId)
    }
  }

  const shouldShowSearchAndButton = activeFilter !== "templates"

  return (
    <>
      <div className="sticky top-0 z-10 border-b px-4 lg:px-6 mb-3 pt-4 pb-0 bg-background/95 backdrop-blur-md">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Document status filter">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              className={`text-muted-foreground hover:text-foreground relative whitespace-nowrap border-b-2 text-sm font-medium transition-colors pb-3.5 ${
                activeFilter === filter.id ? "text-foreground border-foreground" : "border-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </nav>
      </div>

      {shouldShowSearchAndButton && (
        <div className="px-4 lg:px-6 mb-3 flex items-center gap-3 pt-1">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Поиск документов..." className="pl-9" />
          </div>
          <Button onClick={onCreateClick} disabled={createButtonDisabled}>
            <IconPlus className="h-4 w-4 mr-2" />
            Новый документ
          </Button>
        </div>
      )}
    </>
  )
}
