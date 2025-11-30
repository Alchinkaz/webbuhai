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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { IconX, IconUser, IconUsers, IconChevronRight } from "@tabler/icons-react"
import type { Employee } from "@/components/employee-dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type Department = {
  id: string
  name: string
  type: string
  description?: string
  employeeCount: number
  parentId?: string | null
  order?: number
  managers?: string[] // IDs of manager employees
  deputies?: string[] // IDs of deputy employees
  subordinates?: string[] // IDs of subordinate employees
}

type DepartmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (department: Omit<Department, "id" | "employeeCount">) => void
  department?: Department | null
  departments?: Department[]
  employees?: Employee[]
  defaultParentId?: string | null
}

const steps = ["Название", "Сотрудники", "Коммуникации"]

export function DepartmentDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  department, 
  departments = [], 
  employees = [],
  defaultParentId 
}: DepartmentDialogProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [type, setType] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [parentId, setParentId] = React.useState<string | null>(null)
  const [managers, setManagers] = React.useState<string[]>([])
  const [deputies, setDeputies] = React.useState<string[]>([])
  const [subordinates, setSubordinates] = React.useState<string[]>([])

  // Для поиска сотрудников
  const [managerSearchOpen, setManagerSearchOpen] = React.useState(false)
  const [deputySearchOpen, setDeputySearchOpen] = React.useState(false)
  const [subordinateSearchOpen, setSubordinateSearchOpen] = React.useState(false)

  React.useEffect(() => {
    if (department) {
      setName(department.name)
      setType(department.type)
      setDescription(department.description || "")
      setParentId(department.parentId || null)
      setManagers(department.managers || [])
      setDeputies(department.deputies || [])
      setSubordinates(department.subordinates || [])
      setCurrentStep(0)
    } else {
      setName("")
      setType("")
      setDescription("")
      setParentId(defaultParentId || null)
      setManagers([])
      setDeputies([])
      setSubordinates([])
      setCurrentStep(0)
    }
  }, [department, open, defaultParentId])

  // Преобразуем parentId для Select (null -> "none")
  const selectParentId = parentId || "none"

  const handleSubmit = () => {
    onSubmit({ 
      name, 
      type, 
      description,
      parentId: parentId || null,
      managers,
      deputies,
      subordinates,
    })
    // Сброс формы
    setName("")
    setType("")
    setDescription("")
    setParentId(null)
    setManagers([])
    setDeputies([])
    setSubordinates([])
    setCurrentStep(0)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    if (currentStep === 0) {
      return name.trim() !== "" && type.trim() !== ""
    }
    return true
  }

  // Фильтруем отделы, исключая текущий редактируемый отдел
  const availableDepartments = React.useMemo(() => {
    if (!department) return departments
    return departments.filter((d) => d.id !== department.id)
  }, [departments, department])

  // Получаем родительский отдел
  const parentDepartment = React.useMemo(() => {
    if (!parentId) return null
    return departments.find((d) => d.id === parentId) || null
  }, [parentId, departments])

  // Получаем сотрудников по ID
  const getEmployeeById = (id: string) => employees.find((e) => e.id === id)
  const getEmployeeName = (id: string) => getEmployeeById(id)?.name || "Неизвестно"

  // Доступные сотрудники для выбора (исключаем уже выбранных)
  const availableEmployees = React.useMemo(() => {
    const selectedIds = new Set([...managers, ...deputies, ...subordinates])
    return employees.filter((e) => !selectedIds.has(e.id) && e.status === "active")
  }, [employees, managers, deputies, subordinates])

  const addManager = (employeeId: string) => {
    if (!managers.includes(employeeId)) {
      setManagers([...managers, employeeId])
    }
    setManagerSearchOpen(false)
  }

  const removeManager = (employeeId: string) => {
    setManagers(managers.filter((id) => id !== employeeId))
  }

  const addDeputy = (employeeId: string) => {
    if (!deputies.includes(employeeId)) {
      setDeputies([...deputies, employeeId])
    }
    setDeputySearchOpen(false)
  }

  const removeDeputy = (employeeId: string) => {
    setDeputies(deputies.filter((id) => id !== employeeId))
  }

  const addSubordinate = (employeeId: string) => {
    if (!subordinates.includes(employeeId)) {
      setSubordinates([...subordinates, employeeId])
    }
    setSubordinateSearchOpen(false)
  }

  const removeSubordinate = (employeeId: string) => {
    setSubordinates(subordinates.filter((id) => id !== employeeId))
  }

  const renderStepContent = () => {
    if (currentStep === 0) {
      // Шаг 1: Название
      return (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Вышестоящий отдел</Label>
              {parentDepartment ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    {parentDepartment.name}
                    <button
                      type="button"
                      onClick={() => setParentId(null)}
                      className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </Badge>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-blue-600"
                    onClick={() => setParentId(null)}
                  >
                    + Изменить
                  </Button>
                </div>
              ) : (
                <Select value={selectParentId} onValueChange={(value) => setParentId(value === "none" ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите вышестоящий отдел" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без родительского отдела</SelectItem>
                    {availableDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите название отдела"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание отдела"
                rows={4}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Отдел в компании</Label>
              <div className="mt-4 space-y-4">
                {parentDepartment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    {parentDepartment.name}
                  </div>
                )}
                {parentDepartment && (
                  <div className="ml-6 w-0.5 h-8 bg-blue-500" />
                )}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">
                    {name || "Новый отдел"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <IconUser className="h-3 w-3" />
                    Должность не указана
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Подчинённые:</span>
                      <IconUsers className="h-3 w-3" />
                      <span>0 сотрудников</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Заместители:</span>
                      <IconUser className="h-3 w-3" />
                      <span>{deputies.length} {deputies.length === 1 ? "заместитель" : "заместителей"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else if (currentStep === 1) {
      // Шаг 2: Сотрудники
      return (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Руководители</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Поиск сотрудника..." readOnly />
                <Popover open={managerSearchOpen} onOpenChange={setManagerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      + Добавить
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Поиск сотрудника..." />
                      <CommandList>
                        <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                        <CommandGroup>
                          {availableEmployees.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={employee.name}
                              onSelect={() => addManager(employee.id)}
                            >
                              {employee.name} - {employee.position}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">Можно добавить несколько руководителей</p>
              {managers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {managers.map((id) => {
                    const emp = getEmployeeById(id)
                    return emp ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {emp.name}
                        <button
                          type="button"
                          onClick={() => removeManager(id)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Заместители</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Поиск сотрудника..." readOnly />
                <Popover open={deputySearchOpen} onOpenChange={setDeputySearchOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      + Добавить
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Поиск сотрудника..." />
                      <CommandList>
                        <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                        <CommandGroup>
                          {availableEmployees.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={employee.name}
                              onSelect={() => addDeputy(employee.id)}
                            >
                              {employee.name} - {employee.position}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">Можно добавить несколько заместителей</p>
              {deputies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {deputies.map((id) => {
                    const emp = getEmployeeById(id)
                    return emp ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {emp.name}
                        <button
                          type="button"
                          onClick={() => removeDeputy(id)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Подчинённые</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="Поиск сотрудника..." readOnly />
                <Popover open={subordinateSearchOpen} onOpenChange={setSubordinateSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      + Добавить
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Поиск сотрудника..." />
                      <CommandList>
                        <CommandEmpty>Сотрудники не найдены</CommandEmpty>
                        <CommandGroup>
                          {availableEmployees.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={employee.name}
                              onSelect={() => addSubordinate(employee.id)}
                            >
                              {employee.name} - {employee.position}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {subordinates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subordinates.map((id) => {
                    const emp = getEmployeeById(id)
                    return emp ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {emp.name}
                        <button
                          type="button"
                          onClick={() => removeSubordinate(id)}
                          className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                        >
                          <IconX className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Отдел в компании</Label>
              <div className="mt-4 space-y-4">
                {parentDepartment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconUser className="h-4 w-4" />
                    {parentDepartment.name}
                  </div>
                )}
                {parentDepartment && (
                  <div className="ml-6 w-0.5 h-8 bg-blue-500" />
                )}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="text-sm font-medium mb-2">
                    {name || "Новый отдел"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <IconUser className="h-3 w-3" />
                    {managers.length > 0 
                      ? `${getEmployeeName(managers[0])} - ${getEmployeeById(managers[0])?.position || "Должность не указана"}`
                      : "Должность не указана"}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Подчинённые:</span>
                      <IconUsers className="h-3 w-3" />
                      <span>{subordinates.length} {subordinates.length === 1 ? "сотрудник" : "сотрудников"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Заместители:</span>
                      <IconUser className="h-3 w-3" />
                      <span>{deputies.length} {deputies.length === 1 ? "заместитель" : "заместителей"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    } else {
      // Шаг 3: Коммуникации (пока простой заглушка)
      return (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Настройки коммуникаций будут доступны в будущих обновлениях.
          </p>
        </div>
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {department ? "Редактирование отдела" : "Создание отдела"}
          </DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-2 text-xs">
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <span className={index === currentStep ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {step}
                  </span>
                  {index < steps.length - 1 && (
                    <IconChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderStepContent()}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0}>
            НАЗАД
          </Button>
          <Button type="button" onClick={handleNext} disabled={!canProceed()}>
            {currentStep === steps.length - 1 ? "СОЗДАТЬ" : "ПРОДОЛЖИТЬ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
