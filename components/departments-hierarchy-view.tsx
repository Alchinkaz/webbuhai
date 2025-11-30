"use client"

import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconPencil, IconTrash, IconUsers, IconGripVertical, IconArrowRight, IconPlus, IconDots, IconBuilding } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Department } from "@/components/department-dialog"
import type { Employee } from "@/components/employee-dialog"

interface DepartmentsHierarchyViewProps {
  searchQuery: string
  departments: Department[]
  employees?: Employee[]
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  onOrderChange: (departments: Department[]) => void
  onAddSubDepartment?: (parentId: string) => void
}

interface DepartmentCardProps {
  department: Department
  level: number
  subDepartmentsCount: number
  manager?: Employee | null
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  onAddSubDepartment?: (parentId: string) => void
  isDragging?: boolean
  hasChildren: boolean
}

function DepartmentCard({
  department,
  level,
  subDepartmentsCount,
  manager,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  onAddSubDepartment,
  isDragging = false,
  hasChildren,
}: DepartmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: department.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-3 relative">
        {/* Визуальные связи иерархии - как в Битрикс */}
        {level > 0 && (
          <div className="flex flex-col items-center pt-3 min-w-[40px] relative">
            {/* Вертикальная линия сверху */}
            <div className="w-0.5 h-3 bg-blue-500" />
            {/* Горизонтальная линия со стрелкой */}
            <div className="flex items-center w-full">
              <div className="flex-1 h-0.5 bg-blue-500" />
              <div className="w-3 h-3 flex items-center justify-center -ml-1">
                <IconArrowRight className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          </div>
        )}
        {level === 0 && <div className="w-0" />}

        {/* Карточка отдела в стиле Битрикс */}
        <div className="flex-1 relative">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
              isSortableDragging ? "ring-2 ring-primary border-primary" : "border-border"
            }`}
            onClick={() => onDepartmentClick(department)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold mb-1">{department.name}</CardTitle>
                  {manager && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <div className="font-medium">{manager.name}</div>
                      <div className="text-xs">{manager.position}</div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconUsers className="h-3.5 w-3.5" />
                      {department.employeeCount} сотрудников
                    </span>
                    {subDepartmentsCount > 0 && (
                      <span className="flex items-center gap-1">
                        <IconBuilding className="h-3.5 w-3.5" />
                        {subDepartmentsCount} отделов
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditDepartment(department)
                      }}
                    >
                      <IconPencil className="mr-2 h-4 w-4" />
                      Редактировать
                    </DropdownMenuItem>
                    {onAddSubDepartment && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          onAddSubDepartment(department.id)
                        }}
                      >
                        <IconPlus className="mr-2 h-4 w-4" />
                        Добавить подотдел
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteDepartment(department.id)
                      }}
                    >
                      <IconTrash className="mr-2 h-4 w-4" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
          </Card>

          {/* Кнопка добавления подотдела (синий +) */}
          {onAddSubDepartment && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-background shadow-md"
              onClick={(e) => {
                e.stopPropagation()
                onAddSubDepartment(department.id)
              }}
            >
              <IconPlus className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Вертикальная линия для дочерних отделов */}
          {hasChildren && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-4 bg-blue-500" style={{ marginTop: '4px' }} />
          )}
        </div>

        {/* Иконка для drag */}
        <div
          {...attributes}
          {...listeners}
          className="pt-3 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <IconGripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

export function DepartmentsHierarchyView({
  searchQuery,
  departments,
  employees = [],
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  onOrderChange,
  onAddSubDepartment,
}: DepartmentsHierarchyViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Находим руководителя отдела (первый сотрудник с должностью, содержащей "руководитель" или "директор")
  const getDepartmentManager = React.useCallback(
    (department: Department): Employee | null => {
      const deptEmployees = employees.filter((e) => e.department === department.name && e.status === "active")
      const manager = deptEmployees.find(
        (e) =>
          e.position.toLowerCase().includes("руководитель") ||
          e.position.toLowerCase().includes("директор") ||
          e.position.toLowerCase().includes("начальник")
      )
      return manager || deptEmployees[0] || null
    },
    [employees]
  )

  // Подсчитываем количество подотделов
  const getSubDepartmentsCount = React.useCallback(
    (departmentId: string): number => {
      return departments.filter((d) => d.parentId === departmentId).length
    },
    [departments]
  )

  // Построение плоского списка с уровнями для отображения иерархии
  const buildFlatTree = React.useCallback((depts: Department[]): Array<{ dept: Department; level: number }> => {
    const deptMap = new Map<string, Department>()
    depts.forEach((dept) => {
      deptMap.set(dept.id, dept)
    })

    // Сортируем по order
    const sortByOrder = (a: Department, b: Department) => {
      const orderA = a.order ?? 0
      const orderB = b.order ?? 0
      return orderA - orderB
    }

    // Функция для получения дочерних отделов
    const getChildren = (parentId: string | null): Department[] => {
      return depts
        .filter((d) => (d.parentId || null) === parentId)
        .sort(sortByOrder)
    }

    // Рекурсивная функция для построения плоского списка
    const flattenWithLevels = (parentId: string | null, level: number = 0): Array<{ dept: Department; level: number }> => {
      const result: Array<{ dept: Department; level: number }> = []
      const children = getChildren(parentId)
      
      children.forEach((child) => {
        result.push({ dept: child, level })
        // Рекурсивно добавляем дочерние отделы
        result.push(...flattenWithLevels(child.id, level + 1))
      })
      
      return result
    }

    return flattenWithLevels(null, 0)
  }, [])

  const departmentsWithLevels = React.useMemo(() => {
    const filtered = departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    return buildFlatTree(filtered)
  }, [departments, searchQuery, buildFlatTree])

  const filteredDepartments = React.useMemo(() => {
    return departmentsWithLevels.map((item) => item.dept)
  }, [departmentsWithLevels])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = filteredDepartments.findIndex((d) => d.id === active.id)
      const newIndex = filteredDepartments.findIndex((d) => d.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(filteredDepartments, oldIndex, newIndex)
        
        // Обновляем order для всех отделов
        const updated = reordered.map((dept, index) => ({
          ...dept,
          order: index,
        }))
        
        onOrderChange(updated)
      }
    }

    setActiveId(null)
  }

  const activeDepartment = activeId ? departments.find((d) => d.id === activeId) : null

  return (
    <div className="px-4 lg:px-6 py-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredDepartments.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {departmentsWithLevels.map(({ dept, level }) => {
              const subCount = getSubDepartmentsCount(dept.id)
              const manager = getDepartmentManager(dept)
              const hasChildren = subCount > 0
              
              return (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  level={level}
                  subDepartmentsCount={subCount}
                  manager={manager}
                  onDepartmentClick={onDepartmentClick}
                  onEditDepartment={onEditDepartment}
                  onDeleteDepartment={onDeleteDepartment}
                  onAddSubDepartment={onAddSubDepartment}
                  isDragging={activeId === dept.id}
                  hasChildren={hasChildren}
                />
              )
            })}
            {departmentsWithLevels.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Отделы не найдены</p>
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeDepartment ? (
            <div className="w-64">
              <Card className="opacity-90 shadow-lg border-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">{activeDepartment.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <IconUsers className="h-3.5 w-3.5" />
                      {activeDepartment.employeeCount} сотрудников
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

