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
import type { Employee } from "@/components/employee-dialog"

interface EmployeesTableProps {
  searchQuery: string
  employees: Employee[]
  departmentId?: string | null
  onAddEmployee: () => void
  onEditEmployee: (employee: Employee) => void
  onDeleteEmployee: (id: string) => void
}

export function EmployeesTable({
  searchQuery,
  employees,
  departmentId,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeesTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([])
  const [positionFilter, setPositionFilter] = React.useState<string[]>([])
  const [departmentFilter, setDepartmentFilter] = React.useState<string[]>([])
  const [statusFilter, setStatusFilter] = React.useState<string[]>([])

  const filteredEmployees = React.useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.contact.includes(searchQuery)
      const matchesPosition = positionFilter.length === 0 || positionFilter.includes(employee.position)
      const matchesDepartment = departmentFilter.length === 0 || departmentFilter.includes(employee.department)
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(employee.status)
      const matchesDepartmentId = !departmentId || employee.department === departmentId
      return matchesSearch && matchesPosition && matchesDepartment && matchesStatus && matchesDepartmentId
    })
  }, [searchQuery, positionFilter, departmentFilter, statusFilter, employees, departmentId])

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) => (prev.length === filteredEmployees.length ? [] : filteredEmployees.map((e) => e.id)))
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === filteredEmployees.length && filteredEmployees.length > 0}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              <TableHead>ФИО</TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 -ml-2 hover:bg-muted/50 justify-start text-left">
                      <span>Должность</span>
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Array.from(new Set(employees.map((e) => e.position))).map((position) => (
                      <DropdownMenuCheckboxItem
                        key={position}
                        checked={positionFilter.includes(position)}
                        onCheckedChange={(checked) => {
                          setPositionFilter((prev) =>
                            checked ? [...prev, position] : prev.filter((p) => p !== position),
                          )
                        }}
                      >
                        {position}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 p-0 -ml-2 hover:bg-muted/50 justify-start text-left">
                      <span>Отдел</span>
                      <IconChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Array.from(new Set(employees.map((e) => e.department))).map((department) => (
                      <DropdownMenuCheckboxItem
                        key={department}
                        checked={departmentFilter.includes(department)}
                        onCheckedChange={(checked) => {
                          setDepartmentFilter((prev) =>
                            checked ? [...prev, department] : prev.filter((d) => d !== department),
                          )
                        }}
                      >
                        {department}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableHead>
              <TableHead>Контакт</TableHead>
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
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(employee.id)}
                    onCheckedChange={() => toggleRowSelection(employee.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.contact}</TableCell>
                <TableCell>
                  <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                    {employee.status === "active" ? "Активный" : "Неактивный"}
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
                      <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
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
                      <DropdownMenuItem className="text-destructive" onClick={() => onDeleteEmployee(employee.id)}>
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
