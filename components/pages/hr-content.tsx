"use client"

import * as React from "react"
import { DepartmentsView } from "@/components/departments-view"
import { DepartmentsHierarchyView } from "@/components/departments-hierarchy-view"
import { EmployeesTable } from "@/components/employees-table"
import { EmployeeDialog, type Employee } from "@/components/employee-dialog"
import { DepartmentDialog, type Department } from "@/components/department-dialog"
import { useNavigation } from "@/hooks/use-navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const filters = [
  { id: "departments", label: "Отделы" },
  { id: "employees", label: "Сотрудники" },
  { id: "salary", label: "Зарплата" },
  { id: "timesheet", label: "Табель" },
]

const mockDepartments: Department[] = [
  { id: "1", name: "Руководство", type: "Управление", employeeCount: 3, parentId: null, order: 0 },
  { id: "2", name: "Бухгалтерия", type: "Финансы", employeeCount: 5, parentId: "1", order: 0 },
  { id: "3", name: "Продажи", type: "Коммерческий", employeeCount: 8, parentId: "1", order: 1 },
  { id: "4", name: "Кадры", type: "HR", employeeCount: 2, parentId: "1", order: 2 },
  { id: "5", name: "IT-отдел", type: "Техническая поддержка", employeeCount: 4, parentId: "1", order: 3 },
  { id: "6", name: "Маркетинг", type: "Коммерческий", employeeCount: 6, parentId: "3", order: 0 },
]

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Иванов Иван Иванович",
    position: "Генеральный директор",
    department: "Руководство",
    contact: "+7 (495) 111-11-11",
    status: "active",
  },
  {
    id: "2",
    name: "Петрова Мария Сергеевна",
    position: "Главный бухгалтер",
    department: "Бухгалтерия",
    contact: "+7 (495) 222-22-22",
    status: "active",
  },
  {
    id: "3",
    name: "Сидоров Петр Александрович",
    position: "Менеджер по продажам",
    department: "Продажи",
    contact: "+7 (495) 333-33-33",
    status: "active",
  },
  {
    id: "4",
    name: "Козлова Анна Дмитриевна",
    position: "HR-менеджер",
    department: "Кадры",
    contact: "+7 (495) 444-44-44",
    status: "active",
  },
  {
    id: "5",
    name: "Смирнов Алексей Викторович",
    position: "IT-специалист",
    department: "IT-отдел",
    contact: "+7 (495) 555-55-55",
    status: "inactive",
  },
]

export function HRContent() {
  const { selectedDepartment, setSelectedDepartment } = useNavigation()
  const { toast } = useToast()
  const [activeFilter, setActiveFilter] = React.useState("departments")
  const [searchQuery, setSearchQuery] = React.useState("")

  const [departments, setDepartments] = React.useState<Department[]>(mockDepartments)
  const [employees, setEmployees] = React.useState<Employee[]>(mockEmployees)

  const [employeeDialogOpen, setEmployeeDialogOpen] = React.useState(false)
  const [departmentDialogOpen, setDepartmentDialogOpen] = React.useState(false)
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null)
  const [editingDepartment, setEditingDepartment] = React.useState<Department | null>(null)
  const [newDepartmentParentId, setNewDepartmentParentId] = React.useState<string | null>(null)

  const departmentsWithCounts = React.useMemo(() => {
    return departments.map((dept) => ({
      ...dept,
      employeeCount: employees.filter((e) => e.department === dept.name).length,
    }))
  }, [departments, employees])

  const filteredEmployees = React.useMemo(() => {
    if (!selectedDepartment) return employees
    return employees.filter((e) => e.department === selectedDepartment.name)
  }, [employees, selectedDepartment])

  const handleCreateClick = () => {
    if (activeFilter === "departments" && !selectedDepartment) {
      setDepartmentDialogOpen(true)
    } else {
      setEmployeeDialogOpen(true)
    }
  }

  const handleDepartmentClick = (department: Department) => {
    setSelectedDepartment({ id: department.id, name: department.name })
  }

  const handleAddEmployee = (employee: Omit<Employee, "id">) => {
    if (editingEmployee) {
      setEmployees(employees.map((e) => (e.id === editingEmployee.id ? { ...e, ...employee } : e)))
      setEditingEmployee(null)
    } else {
      const newEmployee: Employee = {
        ...employee,
        id: Date.now().toString(),
      }
      setEmployees((prev) => [...prev, newEmployee])
    }
    setEmployeeDialogOpen(false)
    toast({
      title: editingEmployee ? "Сотрудник обновлен" : "Сотрудник добавлен",
      description: editingEmployee ? "Информация о сотруднике успешно обновлена" : "Новый сотрудник успешно добавлен",
    })
  }

  const handleAddDepartment = (department: Omit<Department, "id" | "employeeCount">) => {
    if (editingDepartment && editingDepartment.id) {
      // Редактирование существующего отдела
      const updatedDepartments = departments.map((d) => 
        d.id === editingDepartment.id 
          ? { ...d, ...department, parentId: department.parentId || null }
          : d
      )
      setDepartments(updatedDepartments)
      setEditingDepartment(null)
      toast({
        title: "Отдел обновлен",
        description: "Информация об отделе успешно обновлена",
      })
    } else {
      // Создание нового отдела
      const parentId = newDepartmentParentId || department.parentId || null
      const siblings = departments.filter((d) => d.parentId === parentId)
      const maxOrder = siblings.length > 0 
        ? Math.max(...siblings.map((d) => d.order ?? 0), -1)
        : -1
      const newDepartment: Department = {
        ...department,
        parentId: parentId,
        id: Date.now().toString(),
        employeeCount: 0,
        order: maxOrder + 1,
      }
      setDepartments([...departments, newDepartment])
      toast({
        title: "Отдел добавлен",
        description: "Новый отдел успешно добавлен",
      })
    }
    setDepartmentDialogOpen(false)
    setNewDepartmentParentId(null)
    setEditingDepartment(null)
  }

  const handleOrderChange = (reorderedDepartments: Department[]) => {
    setDepartments(reorderedDepartments)
    toast({
      title: "Порядок обновлен",
      description: "Иерархия отделов успешно обновлена",
    })
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id))
    toast({
      title: "Сотрудник удален",
      description: "Сотрудник успешно удален из системы",
    })
  }

  const handleDeleteDepartment = (id: string) => {
    const dept = departments.find((d) => d.id === id)
    if (!dept) return

    // Проверяем наличие сотрудников
    const departmentEmployees = employees.filter((e) => e.department === dept.name)
    if (departmentEmployees.length > 0) {
      toast({
        title: "Невозможно удалить отдел",
        description: "В отделе есть сотрудники. Сначала переместите или удалите их.",
        variant: "destructive",
      })
      return
    }

    // Проверяем наличие подотделов
    const subDepartments = departments.filter((d) => d.parentId === id)
    if (subDepartments.length > 0) {
      toast({
        title: "Невозможно удалить отдел",
        description: "В отделе есть подотделы. Сначала удалите или переместите их.",
        variant: "destructive",
      })
      return
    }

    // Удаляем отдел
    const updatedDepartments = departments.filter((d) => d.id !== id)
    
    setDepartments(updatedDepartments)
    toast({
      title: "Отдел удален",
      description: "Отдел успешно удален из системы",
    })
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEmployeeDialogOpen(true)
  }

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department)
    setDepartmentDialogOpen(true)
  }

  const closeEmployeeDialog = () => {
    setEmployeeDialogOpen(false)
    setEditingEmployee(null)
  }

  const closeDepartmentDialog = () => {
    setDepartmentDialogOpen(false)
    setEditingDepartment(null)
    setNewDepartmentParentId(null)
  }

  const getPlaceholder = () => {
    if (selectedDepartment) {
      return "Поиск сотрудников..."
    }
    switch (activeFilter) {
      case "departments":
        return "Поиск отделов..."
      case "employees":
        return "Поиск сотрудников..."
      case "salary":
        return "Поиск по зарплате..."
      case "timesheet":
        return "Поиск в табеле..."
      default:
        return "Поиск..."
    }
  }

  const getButtonText = () => {
    if (selectedDepartment) {
      return "Новый сотрудник"
    }
    switch (activeFilter) {
      case "departments":
        return "Новый отдел"
      case "employees":
        return "Новый сотрудник"
      default:
        return "Создать"
    }
  }

  const showSearchAndButton = activeFilter === "departments" || activeFilter === "employees"

  const renderContent = () => {
    if (activeFilter === "departments" && selectedDepartment) {
      return (
        <EmployeesTable
          searchQuery={searchQuery}
          employees={filteredEmployees}
          onAddEmployee={() => setEmployeeDialogOpen(true)}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )
    }

    if (activeFilter === "departments") {
      return (
        <DepartmentsHierarchyView
          searchQuery={searchQuery}
          departments={departmentsWithCounts}
          employees={employees}
          onDepartmentClick={handleDepartmentClick}
          onEditDepartment={handleEditDepartment}
          onDeleteDepartment={handleDeleteDepartment}
          onOrderChange={handleOrderChange}
          onAddSubDepartment={(parentId, childId) => {
            // Устанавливаем parentId для выбранного отдела
            const childDept = departments.find((d) => d.id === childId)
            if (childDept) {
              const updatedDepartments = departments.map((d) =>
                d.id === childId ? { ...d, parentId: parentId } : d
              )
              setDepartments(updatedDepartments)
              toast({
                title: "Подотдел добавлен",
                description: `Отдел "${childDept.name}" теперь подчинен выбранному отделу`,
              })
            }
          }}
          onCreateNewSubDepartment={(parentId) => {
            setNewDepartmentParentId(parentId)
            setEditingDepartment(null)
            setDepartmentDialogOpen(true)
          }}
        />
      )
    } else if (activeFilter === "employees") {
      return (
        <EmployeesTable
          searchQuery={searchQuery}
          employees={employees}
          onAddEmployee={() => setEmployeeDialogOpen(true)}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      )
    } else if (activeFilter === "salary") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Раздел в разработке</p>
          <p className="text-sm">Управление зарплатами скоро будет доступно</p>
        </div>
      )
    } else if (activeFilter === "timesheet") {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">Раздел в разработке</p>
          <p className="text-sm">Табель учёта рабочего времени скоро будет доступен</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 border-b px-4 lg:px-6 mb-3 pt-4 pb-0 bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <nav className="flex gap-6 overflow-x-auto" aria-label="HR tabs">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id)
                setSearchQuery("")
                setSelectedDepartment(null)
              }}
              className={`text-muted-foreground hover:text-foreground relative whitespace-nowrap border-b-2 text-sm font-medium transition-colors pb-3.5 ${
                activeFilter === filter.id ? "text-foreground border-foreground" : "border-transparent"
              }`}
            >
              {filter.label}
            </button>
          ))}
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
            <Button onClick={handleCreateClick}>
              <IconPlus className="h-4 w-4 mr-2" />
              {getButtonText()}
            </Button>
          </div>
        )}

        {renderContent()}
      </div>

      <EmployeeDialog
        open={employeeDialogOpen}
        onOpenChange={closeEmployeeDialog}
        onSubmit={handleAddEmployee}
        employee={editingEmployee}
        departments={departments}
        defaultDepartment={selectedDepartment?.name}
      />

      <DepartmentDialog
        open={departmentDialogOpen}
        onOpenChange={closeDepartmentDialog}
        onSubmit={handleAddDepartment}
        department={editingDepartment}
        departments={departments}
        employees={employees}
        defaultParentId={newDepartmentParentId}
      />
    </div>
  )
}
