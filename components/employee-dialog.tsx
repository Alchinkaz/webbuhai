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

export type Employee = {
  id: string
  name: string
  position: string
  department: string
  contact: string
  status: "active" | "inactive"
}

type EmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (employee: Omit<Employee, "id">) => void
  employee?: Employee | null
  departments: Array<{ id: string; name: string }>
  defaultDepartment?: string
}

export function EmployeeDialog({
  open,
  onOpenChange,
  onSubmit,
  employee,
  departments,
  defaultDepartment,
}: EmployeeDialogProps) {
  const [name, setName] = React.useState("")
  const [position, setPosition] = React.useState("")
  const [department, setDepartment] = React.useState("")
  const [contact, setContact] = React.useState("")
  const [status, setStatus] = React.useState<"active" | "inactive">("active")

  React.useEffect(() => {
    if (employee) {
      setName(employee.name)
      setPosition(employee.position)
      setDepartment(employee.department)
      setContact(employee.contact)
      setStatus(employee.status)
    } else {
      setName("")
      setPosition("")
      setDepartment(defaultDepartment || "")
      setContact("")
      setStatus("active")
    }
  }, [employee, open, defaultDepartment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      position,
      department,
      contact,
      status,
    })
    setName("")
    setPosition("")
    setDepartment("")
    setContact("")
    setStatus("active")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{employee ? "Редактировать сотрудника" : "Новый сотрудник"}</DialogTitle>
          <DialogDescription>
            {employee ? "Редактировать информацию о сотруднике" : "Добавить нового сотрудника в организацию"}
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
                placeholder="Менеджер"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Отдел</Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
