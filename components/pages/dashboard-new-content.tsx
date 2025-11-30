"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Receipt, BarChart3, ArrowUp, Plus, Settings } from "lucide-react"

export function DashboardNewContent() {
  const [prompt, setPrompt] = useState("")

  const quickActions = [
    {
      icon: FileText,
      label: "Создать документ",
    },
    {
      icon: Receipt,
      label: "Заполнить отчет",
    },
    {
      icon: BarChart3,
      label: "Анализ данных",
    },
  ]

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Чем я могу помочь?</h1>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Опишите, что вам нужно создать..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] resize-none px-4 pt-4 pb-12 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                // Handle send
              }
            }}
          />
          <div className="absolute left-3 bottom-3 flex items-center gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md bg-background dark:bg-background border border-border hover:bg-muted"
              title="Добавить"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md bg-background dark:bg-background border border-border hover:bg-muted"
              title="Настройки"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-9 w-9 rounded-lg bg-foreground hover:bg-foreground/90 text-background"
            disabled={!prompt.trim()}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto gap-2 px-4 py-2 rounded-full bg-transparent hover:bg-muted text-sm"
            >
              {React.createElement(action.icon, { className: "h-3.5 w-3.5 text-muted-foreground" })}
              <span className="text-muted-foreground">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
