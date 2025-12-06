"use client"

import React, { useState, useMemo } from "react"
import { Employee } from "@/hooks/use-employees"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isWeekend } from "date-fns"

type AttendanceCode = "8" | "4" | "Н" | "У" | "О" | "Б" | ""

interface TimesheetData {
  [employeeId: number]: {
    [date: string]: AttendanceCode
  }
}

interface TimesheetTableProps {
  employees: Employee[]
}

const dayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]

export function TimesheetTable({ employees }: TimesheetTableProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [timesheetData, setTimesheetData] = useState<TimesheetData>({})

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Инициализация данных для активных сотрудников
  const activeEmployees = useMemo(() => {
    return employees.filter(emp => emp.status === "active")
  }, [employees])

  const handleCellChange = (employeeId: number, date: string, value: AttendanceCode) => {
    setTimesheetData(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [date]: value,
      },
    }))
  }

  const getCellValue = (employeeId: number, date: string): AttendanceCode => {
    return timesheetData[employeeId]?.[date] || ""
  }

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
                <TableHead className="sticky left-[200px] z-10 bg-background min-w-[120px]">ЗП начало</TableHead>
                {daysInMonth.map((day) => {
                  const dayOfWeek = getDay(day)
                  const isWeekendDay = isWeekend(day)
                  return (
                    <TableHead
                      key={day.toISOString()}
                      className={`min-w-[60px] text-center ${isWeekendDay ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-normal">{format(day, "dd")}</span>
                        <span className="text-xs text-muted-foreground">{dayNames[dayOfWeek]}</span>
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEmployees.map((employee) => {
                const salaryNumber = employee.salary.replace(/[^\d]/g, "")
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="sticky left-0 z-10 bg-background font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell className="sticky left-[200px] z-10 bg-background">
                      ₸ {Number(salaryNumber).toLocaleString()}
                    </TableCell>
                    {daysInMonth.map((day) => {
                      const dateStr = format(day, "yyyy-MM-dd")
                      const isWeekendDay = isWeekend(day)
                      const value = getCellValue(employee.id, dateStr)
                      return (
                        <TableCell
                          key={dateStr}
                          className={`p-1 ${isWeekendDay ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}`}
                        >
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const inputValue = e.target.value.toUpperCase()
                              if (inputValue === "" || ["8", "4", "Н", "У", "О", "Б"].includes(inputValue)) {
                                handleCellChange(employee.id, dateStr, inputValue as AttendanceCode)
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur()
                              }
                            }}
                            className="w-12 h-8 text-center text-sm p-0 border-2 focus:border-primary"
                            placeholder=""
                            maxLength={1}
                            title={value ? getCodeDescription(value) : "Введите: 8, 4, Н, У, О, Б"}
                          />
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

