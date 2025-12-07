"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const filters = [
  { id: "counterparties", label: "Контрагенты", path: "/party/counterparties" },
  { id: "contracts", label: "Договоры", path: "/party/contracts" },
  { id: "reconciliation", label: "Акты сверок", path: "/party/reconciliation" },
]

interface PartyStatusFilterProps {
  activeFilter: string
  onFilterChange: (filterId: string) => void
  onCreateClick: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  viewMode?: "departments" | "table"
  onViewModeChange?: (mode: "departments" | "table") => void
  showEmployeeButton?: boolean
}

export function PartyStatusFilter({
  activeFilter,
  onFilterChange,
  onCreateClick,
  searchQuery,
  onSearchChange,
}: PartyStatusFilterProps) {
  const showSearchAndButton = activeFilter === "counterparties"

  return (
    <>
      <div className="sticky top-0 z-10 border-b px-4 lg:px-6 mb-3 pt-4 pb-0 bg-background/95 backdrop-blur-md">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Party status filter">
          {filters.map((filter) => {
            const pathname = usePathname()
            const isActive = activeFilter === filter.id || pathname === filter.path
            return (
              <Link
                key={filter.id}
                href={filter.path}
                onClick={() => onFilterChange(filter.id)}
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

      {showSearchAndButton && (
        <div className="px-4 lg:px-6 mb-3 flex items-center gap-3 pt-1">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск контрагентов..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Button onClick={onCreateClick}>
            <IconPlus className="h-4 w-4 mr-2" />
            Новый контрагент
          </Button>
        </div>
      )}
    </>
  )
}
