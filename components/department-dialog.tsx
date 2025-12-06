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

export type Department = {
  id: string
  name: string
  type: string
  employeeCount: number
}

type DepartmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (department: Omit<Department, "id" | "employeeCount">) => void
  department?: Department | null
}

export function DepartmentDialog({ open, onOpenChange, onSubmit, department }: DepartmentDialogProps) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")

  React.useEffect(() => {
    if (department) {
      setName(department.name)
      setType(department.type)
    } else {
      setName("")
      setType("")
    }
  }, [department, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, type })
    setName("")
    setType("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{department ? "Редактировать отдел" : "Новый отдел"}</DialogTitle>
          <DialogDescription>
            {department ? "Редактировать информацию об отделе" : "Добавить новый отдел в организацию"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название отдела</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Бухгалтерия"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Тип отдела</Label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Финансы" required />
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
