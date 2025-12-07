"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { CounterpartiesTable } from "@/components/counterparties-table"
import { PartyStatusFilter } from "@/components/party-status-filter"
import { CounterpartyDialog, type Counterparty } from "@/components/counterparty-dialog"
import { useToast } from "@/hooks/use-toast"

const mockCounterparties: Counterparty[] = [
  {
    id: "1",
    name: "ООО Поставщик-1",
    type: "Поставщик",
    inn: "1234567890",
    contact: "+7 (495) 111-22-33",
    status: "active",
  },
  {
    id: "2",
    name: "ИП Клиент-1",
    type: "Клиент",
    inn: "9876543210",
    contact: "+7 (495) 444-55-66",
    status: "active",
  },
]

interface PartyContentProps {
  initialFilter?: string
}

export function PartyContent({ initialFilter }: PartyContentProps = {}) {
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Determine active filter from URL
  const getActiveFilterFromPath = () => {
    if (pathname) {
      const pathParts = pathname.split("/")
      const section = pathParts[pathParts.length - 1]
      if (["counterparties", "contracts", "reconciliation"].includes(section)) {
        return section
      }
    }
    return initialFilter || "counterparties"
  }
  
  const [activeFilter, setActiveFilter] = React.useState(getActiveFilterFromPath())
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const filterFromPath = getActiveFilterFromPath()
    if (filterFromPath !== activeFilter) {
      setActiveFilter(filterFromPath)
    }
  }, [pathname])

  const [counterparties, setCounterparties] = React.useState<Counterparty[]>(mockCounterparties)
  const [counterpartyDialogOpen, setCounterpartyDialogOpen] = React.useState(false)
  const [editingCounterparty, setEditingCounterparty] = React.useState<Counterparty | null>(null)

  const handleCreateClick = () => {
    if (activeFilter === "counterparties") {
      setCounterpartyDialogOpen(true)
    }
  }

  const handleAddCounterparty = (counterparty: Omit<Counterparty, "id">) => {
    if (editingCounterparty) {
      setCounterparties(counterparties.map((c) => (c.id === editingCounterparty.id ? { ...c, ...counterparty } : c)))
      setEditingCounterparty(null)
      toast({
        title: "Контрагент обновлён",
        description: "Информация о контрагенте успешно обновлена",
      })
    } else {
      const newCounterparty: Counterparty = {
        ...counterparty,
        id: Date.now().toString(),
      }
      setCounterparties([...counterparties, newCounterparty])
      toast({
        title: "Контрагент добавлен",
        description: "Новый контрагент успешно добавлен",
      })
    }
    setCounterpartyDialogOpen(false)
  }

  const handleDeleteCounterparty = (id: string) => {
    setCounterparties(counterparties.filter((c) => c.id !== id))
    toast({
      title: "Контрагент удалён",
      description: "Контрагент успешно удалён из системы",
    })
  }

  const handleEditCounterparty = (counterparty: Counterparty) => {
    setEditingCounterparty(counterparty)
    setCounterpartyDialogOpen(true)
  }

  const closeCounterpartyDialog = () => {
    setCounterpartyDialogOpen(false)
    setEditingCounterparty(null)
  }

  const renderContent = () => {
    switch (activeFilter) {
      case "counterparties":
        return (
          <CounterpartiesTable
            searchQuery={searchQuery}
            counterparties={counterparties}
            onEditCounterparty={handleEditCounterparty}
            onDeleteCounterparty={handleDeleteCounterparty}
          />
        )
      case "contracts":
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Раздел "Договоры" в разработке
          </div>
        )
      case "reconciliation":
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Раздел "Акты сверок" в разработке
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0">
        <PartyStatusFilter
          activeFilter={activeFilter}
          onFilterChange={(filterId) => {
            setActiveFilter(filterId)
            setSearchQuery("")
          }}
          onCreateClick={handleCreateClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showEmployeeButton={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto">{renderContent()}</div>

      <CounterpartyDialog
        open={counterpartyDialogOpen}
        onOpenChange={closeCounterpartyDialog}
        onSubmit={handleAddCounterparty}
        counterparty={editingCounterparty}
        availableContacts={[]}
      />
    </div>
  )
}
