"use client"

import * as React from "react"
import { IconPlus, IconPencil, IconTrash, IconChevronDown, IconDots } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { ResourceDialog } from "@/components/resource-dialog"
import type { Resource } from "@/lib/types/inventory"

type ResourcesTableProps = {
  warehouseId: string
  resources: Resource[]
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>
}

export function ResourcesTable({ warehouseId, resources, setResources }: ResourcesTableProps) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null)

  const filteredResources = React.useMemo(() => {
    return resources.filter((resource) => {
      const matchesWarehouse = resource.warehouseId === warehouseId
      const matchesSearch =
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = typeFilter.length === 0 || typeFilter.includes(resource.type)
      return matchesWarehouse && matchesSearch && matchesType
    })
  }, [resources, warehouseId, searchQuery, typeFilter])

  const uniqueTypes = Array.from(new Set(resources.filter((r) => r.warehouseId === warehouseId).map((r) => r.type)))

  const handleAddResource = (resource: Omit<Resource, "id">) => {
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString(),
    }
    setResources([...resources, newResource])
    setDialogOpen(false)
  }

  const handleEditResource = (resource: Omit<Resource, "id">) => {
    if (editingResource) {
      setResources(resources.map((r) => (r.id === editingResource.id ? { ...r, ...resource } : r)))
      setEditingResource(null)
      setDialogOpen(false)
    }
  }

  const handleDeleteResource = (id: string) => {
    setResources(resources.filter((r) => r.id !== id))
  }

  const openEditDialog = (resource: Resource) => {
    setEditingResource(resource)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingResource(null)
  }

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) => (prev.length === filteredResources.length ? [] : filteredResources.map((r) => r.id)))
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder={t("search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => setDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          {t("addResource")}
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredResources.length && filteredResources.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead className="p-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-full w-full px-4 hover:bg-muted/50 justify-start text-left font-medium text-sm"
                    >
                      {t("type")}
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {uniqueTypes.map((type) => (
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
              <TableHead className="text-center">{t("quantity")}</TableHead>
              <TableHead className="text-center">{t("unit")}</TableHead>
              <TableHead className="text-right">{t("price")}</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(resource.id)}
                    onCheckedChange={() => toggleRowSelection(resource.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{resource.name}</TableCell>
                <TableCell>{resource.type}</TableCell>
                <TableCell className="text-center">{resource.quantity}</TableCell>
                <TableCell className="text-center">{resource.unit}</TableCell>
                <TableCell className="text-right">${resource.price}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <IconDots className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(resource)}>
                        <IconPencil className="mr-2 h-4 w-4" />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteResource(resource.id)}>
                        <IconTrash className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={closeDialog}
        onSubmit={editingResource ? handleEditResource : handleAddResource}
        resource={editingResource}
        warehouseId={warehouseId}
      />
    </div>
  )
}
