"use client"

import * as React from "react"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
} from "@tabler/icons-react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export const documentSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  documentNumber: z.string(),
  documentType: z.string(),
  date: z.string(),
  counterparty: z.string(),
  amount: z.string(),
  status: z.string(),
  templateId: z.string(),
})

function FilterableHeader({ title, column, values }: { title: string; column: any; values: string[] }) {
  const filterValue = column.getFilterValue() as string | undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 p-0 -ml-3 hover:bg-muted/50 justify-start text-left">
          <span>{title}</span>
          <IconChevronDown className="ml-1 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => column.setFilterValue(undefined)} className={!filterValue ? "bg-accent" : ""}>
          Все
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {values.map((value) => (
          <DropdownMenuItem
            key={value}
            onClick={() => column.setFilterValue(value)}
            className={filterValue === value ? "bg-accent" : ""}
          >
            {value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const createColumns = (
  documentTypes: string[],
  counterparties: string[],
  statuses: string[],
  onOpenDocument?: (documentId: string, templateId: string) => void,
  onDeleteDocument?: (documentId: string) => void,
): ColumnDef<z.infer<typeof documentSchema>>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex w-12 items-center justify-center pl-4">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex w-12 items-center justify-center pl-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "documentNumber",
    header: "Название",
    cell: ({ row }) => {
      if (onOpenDocument) {
        return (
          <Button
            variant="link"
            className="text-foreground w-fit px-0 text-left"
            onClick={() => {
              onOpenDocument(row.original.documentId, row.original.templateId)
            }}
          >
            {row.original.documentNumber}
          </Button>
        )
      }
      return <div>{row.original.documentNumber}</div>
    },
    enableHiding: false,
  },
  {
    accessorKey: "documentType",
    header: ({ column }) => <FilterableHeader title="Тип документа" column={column} values={documentTypes} />,
    cell: ({ row }) => {
      const displayType = row.original.documentType === "Коммерческое предложение" ? "КП" : row.original.documentType
      return (
        <div className="w-40">
          <Badge variant="outline" className="text-muted-foreground px-1.5">
            {displayType}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "date",
    header: "Дата",
    cell: ({ row }) => <div className="w-28">{row.original.date}</div>,
  },
  {
    accessorKey: "counterparty",
    header: ({ column }) => <FilterableHeader title="Контрагент" column={column} values={counterparties} />,
    cell: ({ row }) => <div className="min-w-40">{row.original.counterparty}</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <FilterableHeader title="Статус" column={column} values={statuses} />,
    cell: ({ row }) => {
      const statusColors: Record<string, string> = {
        Оплачен: "bg-green-500/10 text-green-700 dark:text-green-400",
        "Ожидает оплаты": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        Просрочен: "bg-red-500/10 text-red-700 dark:text-red-400",
        Черновик: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
      }
      return (
        <Badge variant="outline" className={`px-1.5 ${statusColors[row.original.status] || ""}`}>
          {row.original.status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="data-[state=open]:bg-muted text-muted-foreground flex size-8" size="icon">
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() => {
              if (onOpenDocument) {
                onOpenDocument(row.original.documentId, row.original.templateId)
              }
            }}
          >
            Открыть
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (onOpenDocument) {
                onOpenDocument(row.original.documentId, row.original.templateId)
              }
            }}
          >
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuItem>Скачать</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (onDeleteDocument) {
                onDeleteDocument(row.original.documentId)
              }
            }}
          >
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function DocumentsTable({
  data: initialData,
  onOpenDocument,
  onDeleteDocument,
}: {
  data: z.infer<typeof documentSchema>[]
  onOpenDocument?: (documentId: string, templateId: string) => void
  onDeleteDocument?: (documentId: string) => void
}) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    console.log("[v0] Table data updated, rows:", initialData.length)
  }, [initialData])

  const documentTypes = React.useMemo(() => Array.from(new Set(initialData.map((d) => d.documentType))), [initialData])
  const counterparties = React.useMemo(() => Array.from(new Set(initialData.map((d) => d.counterparty))), [initialData])
  const statuses = React.useMemo(() => Array.from(new Set(initialData.map((d) => d.status))), [initialData])

  const columns = React.useMemo(
    () => createColumns(documentTypes, counterparties, statuses, onOpenDocument, onDeleteDocument),
    [documentTypes, counterparties, statuses, onOpenDocument, onDeleteDocument],
  )

  const table = useReactTable({
    data: initialData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex flex-col gap-0">
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 pt-1.5">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-muted-foreground">Нет документов</p>
                      <p className="text-sm text-muted-foreground">Создайте первый документ, используя шаблон</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} из {table.getFilteredRowModel().rows.length} строк
            выбрано.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Строк на странице
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex bg-transparent"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-transparent"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 bg-transparent"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex bg-transparent"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
