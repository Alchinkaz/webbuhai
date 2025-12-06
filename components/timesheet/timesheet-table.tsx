"use client"

import React, { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isWeekend, isToday, isSameMonth } from "date-fns"

type AttendanceCode = "8" | "4" | "Н" | "У" | "О" | "Б" | "clear"

interface TimesheetData {
  [employeeId: string]: {
    [date: string]: AttendanceCode | ""
  }
}

interface Employee {
  id: string
  name: string
  status: "active" | "inactive" | "pending" | "dismissed"
}

interface TimesheetTableProps {
  employees: Employee[]
}

const dayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]

export function TimesheetTable({ employees }: TimesheetTableProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timesheetData, setTimesheetData] = useState<TimesheetData>({})
  const today = new Date()

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Инициализация данных для активных сотрудников
  const activeEmployees = useMemo(() => {
    return employees.filter(emp => emp.status === "active")
  }, [employees])

  const handleCellChange = (employeeId: string, date: string, value: AttendanceCode) => {
    setTimesheetData(prev => {
      const newData = { ...prev }
      if (!newData[employeeId]) {
        newData[employeeId] = {}
      }
      if (value === "clear") {
        const { [date]: _, ...rest } = newData[employeeId]
        newData[employeeId] = rest
        if (Object.keys(newData[employeeId]).length === 0) {
          delete newData[employeeId]
        }
      } else {
        newData[employeeId] = {
          ...newData[employeeId],
          [date]: value,
        }
      }
      return newData
    })
  }

  const getCellValue = (employeeId: string, date: string): AttendanceCode | "" => {
    return timesheetData[employeeId]?.[date] || ""
  }

  const attendanceOptions: { value: AttendanceCode; label: string; description: string }[] = [
    { value: "8", label: "8", description: "Полный день (8 часов)" },
    { value: "4", label: "4", description: "Неполный день (4 часа)" },
    { value: "Н", label: "Н", description: "Отсутствовал" },
    { value: "У", label: "У", description: "Уволен" },
    { value: "О", label: "О", description: "Отпуск" },
    { value: "Б", label: "Б", description: "Болел" },
    { value: "clear", label: "—", description: "Очистить" },
  ]

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const getCodeDescription = (code: AttendanceCode): string => {
    const descriptions: Record<AttendanceCode, string> = {
      "8": "Полный день (8 часов)",
      "4": "Неполный день (4 часа)",
      "Н": "Отсутствовал",
      "У": "Уволен",
      "О": "Отпуск",
      "Б": "Болел",
      "": "",
    }
    return descriptions[code] || ""
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Табель учёта рабочего времени</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              <Calendar className="h-4 w-4 mr-2" />
              {(() => {
                const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
                return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              })()}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-background min-w-[200px]">Имя</TableHead>
                {daysInMonth.map((day) => {
                  const dayOfWeek = getDay(day)
                  const isWeekendDay = isWeekend(day)
                  const isTodayDate = isToday(day) && isSameMonth(day, currentDate)
                  return (
                    <TableHead
                      key={day.toISOString()}
                      className={`min-w-[60px] text-center ${
                        isTodayDate 
                          ? "bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-500" 
                          : isWeekendDay 
                          ? "bg-yellow-50 dark:bg-yellow-950/20" 
                          : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-xs font-normal ${isTodayDate ? "font-bold text-blue-700 dark:text-blue-300" : ""}`}>
                          {format(day, "dd")}
                        </span>
                        <span className="text-xs text-muted-foreground">{dayNames[dayOfWeek]}</span>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEmployees.map((employee) => {
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium">
                      {employee.name}
                    </TableCell>
                    {daysInMonth.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd")
                      const isWeekendDay = isWeekend(day)
                      const isTodayDate = isToday(day) && isSameMonth(day, currentDate)
                      const value = getCellValue(employee.id, dateStr)
                      return (
                        <TableCell
                          key={dateStr}
                          className={`p-1 ${
                            isTodayDate 
                              ? "bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-500" 
                              : isWeekendDay 
                              ? "bg-yellow-50 dark:bg-yellow-950/20" 
                              : ""
                          }`}
                        >
                          <Select
                            value={value || undefined}
                            onValueChange={(val) => handleCellChange(employee.id, dateStr, val as AttendanceCode)}
                          >
                            <SelectTrigger className="w-14 h-8 text-center text-sm p-0 px-1" size="sm">
                              <SelectValue placeholder="—">
                                {value || "—"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {attendanceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium min-w-[20px]">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">- {option.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold mb-2">Обозначения:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div><strong>8</strong> - Полный день (8 часов)</div>
            <div><strong>4</strong> - Неполный день (4 часа)</div>
            <div><strong>Н</strong> - Отсутствовал</div>
            <div><strong>У</strong> - Уволен</div>
            <div><strong>О</strong> - Отпуск</div>
            <div><strong>Б</strong> - Болел</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

