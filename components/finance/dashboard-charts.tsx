"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"

interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  turnover: number
  profit: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

export function MonthlyRevenueChart({ data }: { data: MonthlyData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Выручка и расходы по месяцам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: "10px" }} />
            <Bar dataKey="revenue" fill="#10b981" name="Выручка" />
            <Bar dataKey="expenses" fill="#ef4444" name="Расходы" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ProfitChart({ data }: { data: MonthlyData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Прибыль по месяцам</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="profit" fill="#3b82f6" name="Прибыль" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function aggregateCategories(data: CategoryData[], maxCategories = 5): CategoryData[] {
  if (data.length <= maxCategories) return data

  const sorted = [...data].sort((a, b) => b.value - a.value)
  const topCategories = sorted.slice(0, maxCategories)
  const otherCategories = sorted.slice(maxCategories)

  if (otherCategories.length > 0) {
    const otherTotal = otherCategories.reduce((sum, cat) => sum + cat.value, 0)
    topCategories.push({
      name: "Прочее",
      value: otherTotal,
      color: "#9ca3af",
    })
  }

  return topCategories
}

export function CategoryExpensesChart({ data }: { data: CategoryData[] }) {
  const aggregatedData = aggregateCategories(data, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Расходы по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={aggregatedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              outerRadius={100}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => value.toLocaleString("ru-RU") + " KZT"}
            />
            <Legend
              verticalAlign="bottom"
              layout="horizontal"
              align="center"
              wrapperStyle={{
                paddingTop: "20px",
                maxHeight: "60px",
                overflow: "hidden",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
