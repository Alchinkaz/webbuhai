"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { parseWordTemplate } from "@/lib/word-parser"
import { saveTemplate } from "@/lib/storage"

interface TemplateUploadProps {
  onClose: () => void
  onComplete: () => void
  documentType?: string
}

export function TemplateUpload({ onClose, onComplete, documentType }: TemplateUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".docx")) {
        setError("Пожалуйста, выберите файл .docx")
        return
      }
      setFile(selectedFile)
      setTemplateName(selectedFile.name.replace(".docx", ""))
      setError("")
    }
  }

  const handleUpload = async () => {
    if (!file || !templateName.trim()) {
      setError("Заполните все поля")
      return
    }

    setLoading(true)
    setError("")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const { variables, content } = await parseWordTemplate(arrayBuffer)

      if (variables.length === 0) {
        setError("В документе не найдены переменные {{}}")
        setLoading(false)
        return
      }

      await saveTemplate({
        id: Date.now().toString(),
        name: templateName,
        fileName: file.name,
        variables,
        content,
        createdAt: new Date().toISOString(),
        documentType,
      })

      onComplete()
    } catch (err) {
      console.error("[v0] Error uploading template:", err)
      setError("Ошибка при обработке файла")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Загрузить шаблон</CardTitle>
              <CardDescription className="mt-2">
                Загрузите Word документ с переменными в формате {"{{имя_переменной}}"}. Шаблон будет сохранен постоянно
                и доступен на всех устройствах.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Word документ (.docx)</Label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept=".docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Нажмите для выбора файла</p>
                </div>
              )}
            </div>
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Название шаблона</Label>
            <Input
              id="name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Например: Договор аренды"
            />
          </div>

          {/* Error Message */}
          {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{error}</div>}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                "Загрузить"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
