import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: ReactNode
  variant?: "default" | "success" | "danger"
}

export function MetricCard({ title, value, description, icon, variant = "default" }: MetricCardProps) {
  const variantStyles = {
    default: "text-foreground",
    success: "text-green-600",
    danger: "text-red-600",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${variantStyles[variant]}`}>{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}
