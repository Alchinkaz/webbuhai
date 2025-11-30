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
import type { Contact } from "@/components/contact-dialog"

interface ContactsTableProps {
  searchQuery: string
  contacts: Contact[]
  onEditContact: (contact: Contact) => void
  onDeleteContact: (id: string) => void
}

export function ContactsTable({ searchQuery, contacts, onEditContact, onDeleteContact }: ContactsTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [companyFilter, setCompanyFilter] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])

  const filteredContacts = React.useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCompany = companyFilter.length === 0 || companyFilter.includes(contact.company)
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(contact.status)
      return matchesSearch && matchesCompany && matchesStatus
    })
  }, [searchQuery, companyFilter, statusFilter, contacts])

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) => (prev.length === filteredContacts.length ? [] : filteredContacts.map((c) => c.id)))
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredContacts.length && filteredContacts.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 -ml-2 hover:bg-muted/50 justify-start text-left">
                      <span>Компания</span>
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Array.from(new Set(contacts.map((c) => c.company))).map((company) => (
                      <DropdownMenuCheckboxItem
                        key={company}
                        checked={companyFilter.includes(company)}
                        onCheckedChange={(checked) => {
                          setCompanyFilter((prev) => (checked ? [...prev, company] : prev.filter((c) => c !== company)))
                        }}
                      >
                        {company}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
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
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(contact.id)}
                    onCheckedChange={() => toggleRowSelection(contact.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.position}</TableCell>
                <TableCell>{contact.company}</TableCell>
                <TableCell>{contact.phone}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  <Badge variant={contact.status === "active" ? "default" : "secondary"}>
                    {contact.status === "active" ? "Активный" : "Неактивный"}
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
                      <DropdownMenuItem onClick={() => onEditContact(contact)}>
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
                      <DropdownMenuItem className="text-destructive" onClick={() => onDeleteContact(contact.id)}>
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
