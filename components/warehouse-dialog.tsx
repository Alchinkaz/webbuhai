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
import { useLanguage } from "@/hooks/use-language"
import type { Warehouse } from "@/lib/types/inventory"

type WarehouseDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (warehouse: Omit<Warehouse, "id" | "resourceCount">) => void
  warehouse?: Warehouse | null
}

export function WarehouseDialog({ open, onOpenChange, onSubmit, warehouse }: WarehouseDialogProps) {
  const { t } = useLanguage()
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")

  React.useEffect(() => {
    if (warehouse) {
      setName(warehouse.name)
      setType(warehouse.type)
    } else {
      setName("")
      setType("")
    }
  }, [warehouse, open])

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
          <DialogTitle>{warehouse ? t("editWarehouse") : t("addWarehouse")}</DialogTitle>
          <DialogDescription>
            {warehouse ? "Редактировать информацию о складе" : "Добавить новый склад в систему"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t("warehouseName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Центральный склад"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">{t("warehouseType")}</Label>
              <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Основной" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit">{t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
