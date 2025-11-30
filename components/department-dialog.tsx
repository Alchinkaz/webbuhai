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

export type Department = {
  id: string
  name: string
  type: string
  employeeCount: number
  parentId?: string | null
  order?: number
}

type DepartmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (department: Omit<Department, "id" | "employeeCount">) => void
  department?: Department | null
  departments?: Department[]
}

export function DepartmentDialog({ open, onOpenChange, onSubmit, department, departments = [] }: DepartmentDialogProps) {
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (department) {
      setName(department.name)
      setType(department.type)
      setParentId(department.parentId || null)
    } else {
      setName("")
      setType("")
      setParentId(null)
    }
  }, [department, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, type, parentId: parentId || null })
    setName("")
    setType("")
    setParentId(null)
  }

  // Фильтруем отделы, исключая текущий редактируемый отдел и его дочерние отделы
  const availableDepartments = React.useMemo(() => {
    if (!department) return departments
    const excludeIds = new Set([department.id])
    // Простая проверка - исключаем только сам отдел
    return departments.filter((d) => d.id !== department.id)
  }, [departments, department])

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
            <div className="grid gap-2">
              <Label htmlFor="parentId">Родительский отдел</Label>
              <Select value={parentId || ""} onValueChange={(value) => setParentId(value || null)}>
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Без родительского отдела" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Без родительского отдела</SelectItem>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
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
