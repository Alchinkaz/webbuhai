"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { IconPlus, IconPencil, IconTrash, IconPackage, IconSearch } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/hooks/use-language"
import { useNavigation } from "@/hooks/use-navigation"
import { WarehouseDialog } from "@/components/warehouse-dialog"
import { ResourcesTable } from "@/components/resources-table"
import type { Warehouse, Resource } from "@/lib/types/inventory"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const filters = [
  { id: "warehouse", label: "Склад", path: "/inventory/warehouse" },
  { id: "nomenclature", label: "Номенклатура", path: "/inventory/nomenclature" },
]

const mockWarehouses: Warehouse[] = [
  { id: "1", name: "Центральный склад", type: "Основной", resourceCount: 45 },
  { id: "2", name: "Склад №2", type: "Региональный", resourceCount: 23 },
  { id: "3", name: "Временное хранилище", type: "Временный", resourceCount: 12 },
]

const mockResourcesData: Resource[] = [
  { id: "1", warehouseId: "1", name: "Сталь листовая", type: "Металл", quantity: 500, unit: "кг", price: 150 },
  { id: "2", warehouseId: "1", name: "Болты М10", type: "Крепеж", quantity: 1000, unit: "шт", price: 5 },
  { id: "3", warehouseId: "1", name: "Краска белая", type: "Материалы", quantity: 50, unit: "л", price: 300 },
  { id: "4", warehouseId: "2", name: "Доски сосновые", type: "Дерево", quantity: 200, unit: "м", price: 250 },
  { id: "5", warehouseId: "2", name: "Гвозди", type: "Крепеж", quantity: 5000, unit: "шт", price: 2 },
]

interface InventoryContentProps {
  initialFilter?: string
}

export function InventoryContent({ initialFilter }: InventoryContentProps = {}) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const { toast } = useToast()
  const { selectedWarehouse, setSelectedWarehouse } = useNavigation()
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>(mockWarehouses)
  const [resources, setResources] = React.useState<Resource[]>(mockResourcesData)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingWarehouse, setEditingWarehouse] = React.useState<Warehouse | null>(null)
  
  // Determine active filter from URL
  const getActiveFilterFromPath = () => {
    if (pathname) {
      const pathParts = pathname.split("/")
      const section = pathParts[pathParts.length - 1]
      if (["warehouse", "nomenclature"].includes(section)) {
        return section
      }
    }
    return initialFilter || "warehouse"
  }
  
  const [activeFilter, setActiveFilter] = React.useState(getActiveFilterFromPath())
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const filterFromPath = getActiveFilterFromPath()
    if (filterFromPath !== activeFilter) {
      setActiveFilter(filterFromPath)
    }
  }, [pathname])

  const warehousesWithCounts = React.useMemo(() => {
    return warehouses.map((warehouse) => ({
      ...warehouse,
      resourceCount: resources.filter((r) => r.warehouseId === warehouse.id).length,
    }))
  }, [warehouses, resources])

  const allResourcesWithWarehouse = React.useMemo(() => {
    return resources.map((resource) => {
      const warehouse = warehouses.find((w) => w.id === resource.warehouseId)
      return {
        ...resource,
        warehouseName: warehouse?.name || "Неизвестный склад",
      }
    })
  }, [resources, warehouses])

  const filteredResources = React.useMemo(() => {
    if (!searchQuery) return allResourcesWithWarehouse
    const query = searchQuery.toLowerCase()
    return allResourcesWithWarehouse.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query) ||
        r.warehouseName.toLowerCase().includes(query),
    )
  }, [allResourcesWithWarehouse, searchQuery])

  const handleAddWarehouse = (warehouse: Omit<Warehouse, "id" | "resourceCount">) => {
    const newWarehouse: Warehouse = {
      ...warehouse,
      id: Date.now().toString(),
      resourceCount: 0,
    }
    setWarehouses([...warehouses, newWarehouse])
    setDialogOpen(false)
  }

  const handleEditWarehouse = (warehouse: Omit<Warehouse, "id" | "resourceCount">) => {
    if (editingWarehouse) {
      setWarehouses(warehouses.map((w) => (w.id === editingWarehouse.id ? { ...w, ...warehouse } : w)))
      setEditingWarehouse(null)
      setDialogOpen(false)
    }
  }

  const handleDeleteWarehouse = (id: string) => {
    const warehouseResources = resources.filter((r) => r.warehouseId === id)
    if (warehouseResources.length > 0) {
      toast({
        title: t("cannotDeleteWarehouse"),
        description: t("warehouseHasResources"),
        variant: "destructive",
      })
      return
    }
    setWarehouses(warehouses.filter((w) => w.id !== id))
  }

  const openEditDialog = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingWarehouse(null)
  }

  const handleWarehouseClick = (warehouse: Warehouse) => {
    setSelectedWarehouse({ id: warehouse.id, name: warehouse.name })
  }

  const showSearchAndButton = activeFilter === "warehouse"

  const getPlaceholder = () => {
    if (selectedWarehouse) {
      return "Поиск ресурсов..."
    }
    switch (activeFilter) {
      case "warehouse":
        return "Поиск складов..."
      case "nomenclature":
        return "Поиск номенклатуры..."
      default:
        return "Поиск..."
    }
  }

  if (selectedWarehouse) {
    const warehouse = warehousesWithCounts.find((w) => w.id === selectedWarehouse.id)
    if (!warehouse) return null

    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <ResourcesTable warehouseId={selectedWarehouse.id} resources={resources} setResources={setResources} />
      </div>
    )
  }

  const renderContent = () => {
    if (activeFilter === "warehouse") {
      return (
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
          {warehousesWithCounts.map((warehouse) => (
            <Card
              key={warehouse.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWarehouseClick(warehouse)}
            >
              <CardHeader>
                <CardDescription>{warehouse.type}</CardDescription>
                <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                <CardAction>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(warehouse)
                      }}
                    >
                      <IconPencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteWarehouse(warehouse.id)
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-2">
                <Badge variant="outline" className="flex items-center gap-2">
                  <IconPackage className="h-4 w-4" />
                  {warehouse.resourceCount} {t("resourceCount")}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    } else if (activeFilter === "nomenclature") {
      return (
        <div className="px-4 lg:px-6">
          <div className="relative mb-4">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск номенклатуры..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Наименование</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead className="text-right">Количество</TableHead>
                  <TableHead className="text-right">Цена</TableHead>
                  <TableHead className="text-right">Сумма</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.name}</TableCell>
                    <TableCell>{resource.type}</TableCell>
                    <TableCell>{resource.warehouseName}</TableCell>
                    <TableCell className="text-right">
                      {resource.quantity} {resource.unit}
                    </TableCell>
                    <TableCell className="text-right">{resource.price} ₸</TableCell>
                    <TableCell className="text-right">
                      {(resource.quantity * resource.price).toLocaleString()} ₸
                    </TableCell>
                  </TableRow>
                ))}
                {filteredResources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Ничего не найдено
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b px-4 lg:px-6 mb-3 pt-4 pb-0 bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <nav className="flex gap-6 overflow-x-auto" aria-label="Inventory tabs">
          {filters.map((filter) => {
            const isActive = activeFilter === filter.id || pathname === filter.path
            return (
              <Link
                key={filter.id}
                href={filter.path}
                onClick={() => {
                  setSearchQuery("")
                }}
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

      <div className="flex-1 overflow-y-auto">
        {showSearchAndButton && (
          <div className="px-4 lg:px-6 mb-3 flex items-center gap-3 pt-1">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={getPlaceholder()}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-2" />
              {t("addWarehouse")}
            </Button>
          </div>
        )}

        {renderContent()}
      </div>

      <WarehouseDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onSubmit={editingWarehouse ? handleEditWarehouse : handleAddWarehouse}
        warehouse={editingWarehouse}
      />
    </div>
  )
}
