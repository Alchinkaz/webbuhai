"use client"

import { FileText, Calendar, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteTemplate, type Template } from "@/lib/storage"
import Link from "next/link"

interface TemplateListProps {
  templates: Template[]
  onUpdate: () => void
}

export function TemplateList({ templates, onUpdate }: TemplateListProps) {
  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот шаблон?")) {
      await deleteTemplate(id)
      onUpdate()
    }
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {templates && templates.length > 0 ? templates.map((template) => (
        <Card key={template.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-xs mt-1 break-all">{template.fileName}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(template.createdAt).toLocaleDateString("ru-RU")}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Переменные:</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.slice(0, 3).map((variable) => (
                  <Badge key={variable} variant="secondary" className="text-xs">
                    {variable}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.variables.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button asChild className="flex-1">
                <Link href={`/create/${template.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Создать счет
                </Link>
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDelete(template.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )) : (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          Нет шаблонов для отображения
        </div>
      )}
    </div>
  )
}
