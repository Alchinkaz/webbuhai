"use client"

import * as React from "react"
import { IconChevronDown, IconPencil, IconTrash, IconMail, IconPhone } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import type { Counterparty } from "@/components/counterparty-dialog"

interface CounterpartiesTableProps {
  searchQuery: string
  counterparties: Counterparty[]
  onEditCounterparty: (counterparty: Counterparty) => void
  onDeleteCounterparty: (id: string) => void
}

export function CounterpartiesTable({
  searchQuery,
  counterparties,
  onEditCounterparty,
  onDeleteCounterparty,
}: CounterpartiesTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])

  const filteredCounterparties = React.useMemo(() => {
    return counterparties.filter((counterparty) => {
      const matchesSearch =
        counterparty.name.toLowerCase().includes(searchQuery.toLowerCase()) || counterparty.inn.includes(searchQuery)
      const matchesType = typeFilter.length === 0 || typeFilter.includes(counterparty.type)
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(counterparty.status)
      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchQuery, typeFilter, statusFilter, counterparties])

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) =>
      prev.length === filteredCounterparties.length ? [] : filteredCounterparties.map((c) => c.id),
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredCounterparties.length && filteredCounterparties.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead>Контрагент</TableHead>
              <TableHead>ИИН/БИН</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 -ml-2 hover:bg-muted/50 justify-start text-left">
                      <span>Тип</span>
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Array.from(new Set(counterparties.map((c) => c.type))).map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={typeFilter.includes(type)}
                        onCheckedChange={(checked) => {
                          setTypeFilter((prev) => (checked ? [...prev, type] : prev.filter((t) => t !== type)))
                        }}
                      >
                        {type}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 -ml-2 hover:bg-muted/50 justify-start text-left">
                      <span>Статус</span>
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {[
                      { value: "active", label: "Активный" },
                      { value: "inactive", label: "Неактивный" },
                    ].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status.value}
                        checked={statusFilter.includes(status.value)}
                        onCheckedChange={(checked) => {
                          setStatusFilter((prev) =>
                            checked ? [...prev, status.value] : prev.filter((s) => s !== status.value),
                          )
                        }}
                      >
                        {status.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCounterparties.map((counterparty) => (
              <TableRow key={counterparty.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(counterparty.id)}
                    onCheckedChange={() => toggleRowSelection(counterparty.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{counterparty.name}</TableCell>
                <TableCell>{counterparty.inn}</TableCell>
                <TableCell>{counterparty.type}</TableCell>
                <TableCell>
                  <Badge variant={counterparty.status === "active" ? "default" : "secondary"}>
                    {counterparty.status === "active" ? "Активный" : "Неактивный"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditCounterparty(counterparty)}>
                        <IconPencil className="mr-2 h-4 w-4" />
                        Редактировать
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconMail className="mr-2 h-4 w-4" />
                        Написать письмо
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <IconPhone className="mr-2 h-4 w-4" />
                        Позвонить
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteCounterparty(counterparty.id)}
                      >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
