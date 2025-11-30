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

export interface Contact {
  id: string
  name: string
  position: string
  company: string
  phone: string
  email: string
  status: "active" | "inactive"
}

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (contact: Omit<Contact, "id">) => void
  contact?: Contact | null
  companies: string[]
}

export function ContactDialog({ open, onOpenChange, onSubmit, contact, companies }: ContactDialogProps) {
  const [name, setName] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "inactive">("active")

  React.useEffect(() => {
    if (contact) {
      setName(contact.name)
      setPosition(contact.position)
      setCompany(contact.company)
      setPhone(contact.phone)
      setEmail(contact.email)
      setStatus(contact.status)
    } else {
      setName("")
      setPosition("")
      setCompany("")
      setPhone("")
      setEmail("")
      setStatus("active")
    }
  }, [contact, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      position,
      company,
      phone,
      email,
      status,
    })
    setName("")
    setPosition("")
    setCompany("")
    setPhone("")
    setEmail("")
    setStatus("active")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{contact ? "Редактировать контакт" : "Новый контакт"}</DialogTitle>
          <DialogDescription>
            {contact ? "Обновите информацию о контакте" : "Добавьте новый контакт в систему"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ФИО</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Должность</Label>
              <Input
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Менеджер по продажам"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Компания</Label>
              <Select value={company} onValueChange={setCompany} required>
                <SelectTrigger id="company">
                  <SelectValue placeholder="Выберите компанию" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (495) 123-45-67"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.ru"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={status} onValueChange={(value: "active" | "inactive") => setStatus(value)}>
                <SelectTrigger id="status">
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
            <Button type="submit">{contact ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
