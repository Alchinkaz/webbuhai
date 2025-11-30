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
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconPencil, IconTrash, IconUsers, IconGripVertical, IconArrowRight, IconPlus, IconDots, IconBuilding } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardAction } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  onAddSubDepartment?: (parentId: string, childId: string) => void
  onCreateNewSubDepartment?: (parentId: string) => void
}

interface DepartmentCardProps {
  department: Department
  level: number
  subDepartmentsCount: number
  manager?: Employee | null
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  onAddSubDepartment?: (parentId: string, childId: string) => void
  onCreateNewSubDepartment?: (parentId: string) => void
  isDragging?: boolean
  hasChildren: boolean
  availableDepartments?: Department[]
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
  onCreateNewSubDepartment,
  isDragging = false,
  hasChildren,
  availableDepartments = [],
}: DepartmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({
    id: department.id,
  })

  const [selectDialogOpen, setSelectDialogOpen] = React.useState(false)
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string>("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  }

  // Фильтруем доступные отделы (исключаем текущий и уже являющиеся подотделами)
  const availableDepts = React.useMemo(() => {
    return availableDepartments.filter(
      (d) => d.id !== department.id && d.parentId !== department.id && !d.parentId
    )
  }, [availableDepartments, department.id])

  const handleSelectDepartment = () => {
    if (selectedDepartmentId && onAddSubDepartment) {
      onAddSubDepartment(department.id, selectedDepartmentId)
      setSelectDialogOpen(false)
      setSelectedDepartmentId("")
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      {/* Маленькая карточка отдела */}
      <Card
        className={`cursor-pointer transition-all hover:shadow-md border w-[200px] ${
          isSortableDragging ? "ring-2 ring-primary border-primary" : "border-border"
        }`}
        onClick={() => onDepartmentClick(department)}
      >
        <CardHeader className="p-3">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold mb-1 truncate">{department.name}</CardTitle>
              {manager && (
                <div className="text-xs text-muted-foreground mb-1 truncate">
                  {manager.name}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-0.5">
                  <IconUsers className="h-3 w-3" />
                  {department.employeeCount}
                </span>
                {subDepartmentsCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <IconBuilding className="h-3 w-3" />
                    {subDepartmentsCount}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mr-1 -mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconDots className="h-3.5 w-3.5" />
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
                {onCreateNewSubDepartment && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      onCreateNewSubDepartment(department.id)
                    }}
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Создать новый подотдел
                  </DropdownMenuItem>
                )}
                {onAddSubDepartment && availableDepts.length > 0 && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectDialogOpen(true)
                    }}
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Добавить существующий отдел
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
      {(onAddSubDepartment || onCreateNewSubDepartment) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white border-2 border-background shadow-md z-10"
            onClick={(e) => {
              e.stopPropagation()
              // Если есть доступные отделы, показываем диалог выбора, иначе создаем новый
              if (availableDepts.length > 0 && onAddSubDepartment) {
                setSelectDialogOpen(true)
              } else if (onCreateNewSubDepartment) {
                onCreateNewSubDepartment(department.id)
              }
            }}
            title={availableDepts.length > 0 ? "Добавить подотдел" : "Создать новый подотдел"}
          >
            <IconPlus className="h-3 w-3" />
          </Button>

          {/* Диалог выбора отдела */}
          {onAddSubDepartment && (
            <Dialog open={selectDialogOpen} onOpenChange={setSelectDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Выбрать подотдел</DialogTitle>
                  <DialogDescription>
                    Выберите отдел, который будет подчинен отделу "{department.name}"
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department-select">Отдел</Label>
                    <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                      <SelectTrigger id="department-select">
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepts.length > 0 ? (
                          availableDepts.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Нет доступных отделов
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setSelectDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="button" onClick={handleSelectDepartment} disabled={!selectedDepartmentId}>
                    Выбрать
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {/* Иконка для drag */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <IconGripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

interface TreeNodeProps {
  department: Department
  level: number
  departments: Department[]
  employees: Employee[]
  getDepartmentManager: (dept: Department) => Employee | null
  getSubDepartmentsCount: (id: string) => number
  onDepartmentClick: (department: Department) => void
  onEditDepartment: (department: Department) => void
  onDeleteDepartment: (id: string) => void
  onAddSubDepartment?: (parentId: string, childId: string) => void
  onCreateNewSubDepartment?: (parentId: string) => void
  activeId: string | null
  availableDepartments?: Department[]
}

function TreeNode({
  department,
  level,
  departments,
  employees,
  getDepartmentManager,
  getSubDepartmentsCount,
  onDepartmentClick,
  onEditDepartment,
  onDeleteDepartment,
  onAddSubDepartment,
  onCreateNewSubDepartment,
  activeId,
  availableDepartments = [],
}: TreeNodeProps) {
  const children = React.useMemo(() => {
    return departments
      .filter((d) => d.parentId === department.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [departments, department.id])

  const subCount = getSubDepartmentsCount(department.id)
  const manager = getDepartmentManager(department)
  const hasChildren = children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Карточка отдела */}
      <div className="relative mb-4">
        <DepartmentCard
          department={department}
          level={level}
          subDepartmentsCount={subCount}
          manager={manager}
          onDepartmentClick={onDepartmentClick}
          onEditDepartment={onEditDepartment}
          onDeleteDepartment={onDeleteDepartment}
          onAddSubDepartment={onAddSubDepartment}
          onCreateNewSubDepartment={onCreateNewSubDepartment}
          isDragging={activeId === department.id}
          hasChildren={hasChildren}
          availableDepartments={availableDepartments}
        />

        {/* Вертикальная линия вниз от карточки, если есть дети */}
        {hasChildren && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-4 bg-blue-500" />
        )}
      </div>

      {/* Дочерние отделы */}
      {hasChildren && (
        <div className="relative flex items-start gap-6 mt-6">
          {/* Горизонтальная линия над дочерними отделами */}
          {children.length > 1 && (
            <div className="absolute left-0 right-0 top-0 h-0.5 bg-blue-500" />
          )}
          
          {/* Вертикальные линии от горизонтальной к каждому дочернему отделу */}
          {children.map((child, index) => {
            const isFirst = index === 0
            const isLast = index === children.length - 1
            
            return (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Вертикальная линия сверху */}
                <div className={`w-0.5 h-4 bg-blue-500 ${children.length > 1 ? '' : ''}`} />
                
                {/* Горизонтальная линия со стрелкой (только для первого) */}
                {isFirst && children.length > 1 && (
                  <div className="absolute top-0 left-1/2 w-1/2 h-0.5 bg-blue-500" />
                )}
                
                {/* Горизонтальная линия для всех кроме первого и последнего */}
                {!isFirst && !isLast && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
                )}
                
                {/* Горизонтальная линия для последнего */}
                {isLast && children.length > 1 && (
                  <div className="absolute top-0 right-1/2 w-1/2 h-0.5 bg-blue-500" />
                )}
                
                {/* Стрелка справа от карточки */}
                <div className="absolute top-2 -right-3">
                  <IconArrowRight className="h-3 w-3 text-blue-500" />
                </div>
              
                {/* Рекурсивно рендерим дочерний узел */}
                <div className="mt-4">
                  <TreeNode
                    department={child}
                    level={level + 1}
                    departments={departments}
                    employees={employees}
                    getDepartmentManager={getDepartmentManager}
                    getSubDepartmentsCount={getSubDepartmentsCount}
                    onDepartmentClick={onDepartmentClick}
                    onEditDepartment={onEditDepartment}
                    onDeleteDepartment={onDeleteDepartment}
                    onAddSubDepartment={onAddSubDepartment}
                    onCreateNewSubDepartment={onCreateNewSubDepartment}
                    activeId={activeId}
                    availableDepartments={availableDepartments}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
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
  onCreateNewSubDepartment,
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

  // Получаем корневые отделы (без родителя)
  const rootDepartments = React.useMemo(() => {
    const filtered = departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
    
    return filtered
      .filter((d) => !d.parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [departments, searchQuery])

  const filteredDepartments = React.useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [departments, searchQuery])

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
    <div className="px-4 lg:px-6 py-4 overflow-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={filteredDepartments.map((d) => d.id)}>
          <div className="flex flex-col items-center min-h-full">
            {rootDepartments.length > 0 ? (
              rootDepartments.map((rootDept) => (
                <TreeNode
                  key={rootDept.id}
                  department={rootDept}
                  level={0}
                  departments={filteredDepartments}
                  employees={employees}
                  getDepartmentManager={getDepartmentManager}
                  getSubDepartmentsCount={getSubDepartmentsCount}
                  onDepartmentClick={onDepartmentClick}
                  onEditDepartment={onEditDepartment}
                  onDeleteDepartment={onDeleteDepartment}
                  onAddSubDepartment={onAddSubDepartment}
                  onCreateNewSubDepartment={onCreateNewSubDepartment}
                  activeId={activeId}
                  availableDepartments={filteredDepartments}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Отделы не найдены</p>
              </div>
            )}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeDepartment ? (
            <div className="w-[200px]">
              <Card className="opacity-90 shadow-lg border">
                <CardHeader className="p-3">
                  <CardTitle className="text-sm font-semibold">{activeDepartment.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-0.5">
                      <IconUsers className="h-3 w-3" />
                      {activeDepartment.employeeCount}
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

