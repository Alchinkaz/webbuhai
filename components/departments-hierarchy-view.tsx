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
import { IconPencil, IconTrash, IconUsers, IconGripVertical, IconArrowRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Department } from "@/components/department-dialog"

interface DepartmentsHierarchyViewProps {
  searchQuery: string
  departments: Department[]
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  onOrderChange: (departments: Department[]) => void
}

interface DepartmentCardProps {
  department: Department
  level: number
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  isDragging?: boolean
}

function DepartmentCard({
  department,
  level,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  isDragging = false,
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
      <div className="flex items-start gap-2">
        {/* Стрелки иерархии - как в Битрикс */}
        {level > 0 && (
          <div className="flex items-center pt-4 pr-2 min-w-[32px]">
            <div className="relative flex items-center w-full">
              {/* Вертикальная линия сверху */}
              <div className="absolute left-0 top-0 w-0.5 h-4 bg-border" />
              {/* Горизонтальная линия со стрелкой */}
              <div className="relative flex items-center w-full">
                <div className="w-6 h-0.5 bg-border" />
                <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground -ml-0.5" />
              </div>
            </div>
          </div>
        )}
        {level === 0 && <div className="w-0" />}

        {/* Карточка отдела */}
        <Card
          className={`cursor-pointer transition-all hover:shadow-md flex-1 ${
            isSortableDragging ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => onDepartmentClick(department)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardDescription>{department.type}</CardDescription>
                <CardTitle className="text-xl">{department.name}</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-grab active:cursor-grabbing"
                  {...attributes}
                  {...listeners}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconGripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
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
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <IconUsers className="h-4 w-4" />
              {department.employeeCount} сотрудников
            </Badge>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export function DepartmentsHierarchyView({
  searchQuery,
  departments,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  onOrderChange,
}: DepartmentsHierarchyViewProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
    <div className="px-4 lg:px-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredDepartments.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {departmentsWithLevels.map(({ dept, level }) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                level={level}
                onDepartmentClick={onDepartmentClick}
                onEditDepartment={onEditDepartment}
                onDeleteDepartment={onDeleteDepartment}
                isDragging={activeId === dept.id}
              />
            ))}
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
              <Card className="opacity-90 shadow-lg">
                <CardHeader>
                  <CardDescription>{activeDepartment.type}</CardDescription>
                  <CardTitle className="text-xl">{activeDepartment.name}</CardTitle>
                </CardHeader>
                <CardFooter>
                  <Badge variant="outline" className="flex items-center gap-2">
                    <IconUsers className="h-4 w-4" />
                    {activeDepartment.employeeCount} сотрудников
                  </Badge>
                </CardFooter>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

