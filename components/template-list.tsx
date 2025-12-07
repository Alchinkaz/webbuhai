"use client"

import { FileText, Calendar, Trash2, Edit, Download, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { deleteTemplate, updateTemplate, type Template } from "@/lib/storage"
import Link from "next/link"
import { useState } from "react"
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

interface TemplateListProps {
  templates: Template[]
  onUpdate: () => void
}

export function TemplateList({ templates, onUpdate }: TemplateListProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editName, setEditName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот шаблон?")) {
      await deleteTemplate(id)
      onUpdate()
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setEditName(template.name)
  }

  const handleSaveEdit = async () => {
    if (!editingTemplate || !editName.trim()) return

    setIsSaving(true)
    try {
      await updateTemplate(editingTemplate.id, { name: editName.trim() })
      setEditingTemplate(null)
      setEditName("")
      onUpdate()
    } catch (error) {
      console.error("Error updating template:", error)
      alert("Ошибка при обновлении шаблона")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingTemplate(null)
    setEditName("")
  }

  const handleDownload = async (template: Template) => {
    try {
      setDownloading(template.id)
      const response = await fetch(`/api/templates/download/${template.id}`)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = template.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Error downloading template:", error)
      alert("Ошибка при загрузке шаблона")
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {templates && templates.length > 0 ? (
        templates.map((template) => (
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(template)}
                  title="Редактировать название"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownload(template)}
                  disabled={downloading === template.id}
                  title="Скачать образец"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-muted-foreground">Нет шаблонов для отображения</div>
      )}

      <Dialog open={editingTemplate !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать название шаблона</DialogTitle>
            <DialogDescription>Измените название шаблона</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Название</Label>
              <Input
                id="template-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Введите название шаблона"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
              Отмена
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim() || isSaving}>
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
