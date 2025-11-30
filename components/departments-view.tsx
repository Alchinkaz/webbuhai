"use client"

import * as React from "react"
import { IconPencil, IconTrash, IconUsers } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Department } from "@/components/department-dialog"

const mockDepartments: Department[] = [
  { id: "1", name: "Руководство", type: "Управление", employeeCount: 3 },
  { id: "2", name: "Бухгалтерия", type: "Финансы", employeeCount: 5 },
  { id: "3", name: "Продажи", type: "Коммерческий", employeeCount: 8 },
  { id: "4", name: "Кадры", type: "HR", employeeCount: 2 },
  { id: "5", name: "IT-отдел", type: "Техническая поддержка", employeeCount: 4 },
  { id: "6", name: "Маркетинг", type: "Коммерческий", employeeCount: 6 },
]

interface DepartmentsViewProps {
  searchQuery: string
  departments: Department[]
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
}

export function DepartmentsView({
  searchQuery,
  departments,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
}: DepartmentsViewProps) {
  const filteredDepartments = React.useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [departments, searchQuery])

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {filteredDepartments.map((department) => (
        <Card
          key={department.id}
          className="cursor-pointer transition-all hover:shadow-md"
          onClick={() => onDepartmentClick(department)}
        >
          <CardHeader>
            <CardDescription>{department.type}</CardDescription>
            <CardTitle className="text-xl">{department.name}</CardTitle>
            <CardAction>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditDepartment(department)
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
                    onDeleteDepartment(department.id)
                  }}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              </div>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              {department.employeeCount} сотрудников
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
