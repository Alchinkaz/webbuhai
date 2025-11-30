"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

export type Counterparty = {
  id: string
  name: string
  type: string
  contact: string
  inn: string
  status: "active" | "inactive"
  contactIds?: string[]
}

type CounterpartyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (counterparty: Omit<Counterparty, "id">) => void
  counterparty?: Counterparty | null
  availableContacts?: Array<{ id: string; name: string; position: string }>
}

export function CounterpartyDialog({
  open,
  onOpenChange,
  onSubmit,
  counterparty,
  availableContacts = [],
}: CounterpartyDialogProps) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [inn, setInn] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "inactive">("active")
  const [selectedContactIds, setSelectedContactIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (counterparty) {
      setName(counterparty.name)
      setType(counterparty.type)
      setContact(counterparty.contact)
      setInn(counterparty.inn)
      setStatus(counterparty.status)
      setSelectedContactIds(counterparty.contactIds || [])
    } else {
      setName("")
      setType("")
      setContact("")
      setInn("")
      setStatus("active")
      setSelectedContactIds([])
    }
  }, [counterparty, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      type,
      contact,
      inn,
      status,
      contactIds: selectedContactIds,
    })
    setName("")
    setType("")
    setContact("")
    setInn("")
    setStatus("active")
    setSelectedContactIds([])
  }

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{counterparty ? "Редактировать компанию" : "Новая компания"}</DialogTitle>
          <DialogDescription>
            {counterparty ? "Редактировать информацию о компании" : "Добавить новую компанию"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ООО Компания"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Тип</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Поставщик">Поставщик</SelectItem>
                  <SelectItem value="Клиент">Клиент</SelectItem>
                  <SelectItem value="Партнер">Партнер</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="inn">ИНН</Label>
              <Input id="inn" value={inn} onChange={(e) => setInn(e.target.value)} placeholder="1234567890" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Контакт</Label>
              <Input
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+7 (495) 123-45-67"
                required
              />
            </div>
            {availableContacts.length > 0 && (
              <div className="grid gap-2">
                <Label>Связанные контакты</Label>
                <ScrollArea className="h-[120px] rounded-md border p-3">
                  <div className="space-y-2">
                    {availableContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`contact-${contact.id}`}
                          checked={selectedContactIds.includes(contact.id)}
                          onCheckedChange={() => toggleContact(contact.id)}
                        />
                        <label htmlFor={`contact-${contact.id}`} className="text-sm cursor-pointer flex-1">
                          {contact.name} - {contact.position}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
