"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { IconFileText, IconPlus } from "@tabler/icons-react"
import { DOCUMENT_TYPES } from "@/lib/document-types"
import { hasTemplateForType, getTemplatesByType } from "@/lib/storage"

interface CreateDocumentModalProps {
  open?: boolean
  onClose: () => void
  onSuccess?: (templateId: string, metadata: any) => void
}

export function CreateDocumentModal({ open = false, onClose, onSuccess }: CreateDocumentModalProps) {
  const [documentTypeId, setDocumentTypeId] = useState("")
  const [documentName, setDocumentName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [counterparty, setCounterparty] = useState("")
  const [status, setStatus] = useState("Черновик")
  const [availableTypes, setAvailableTypes] = useState<string[]>([])

  useEffect(() => {
    const checkTemplates = async () => {
      const typesWithTemplates: string[] = []
      for (const docType of DOCUMENT_TYPES) {
        const hasTemplate = await hasTemplateForType(docType.id)
        if (hasTemplate) {
          typesWithTemplates.push(docType.id)
        }
      }
      setAvailableTypes(typesWithTemplates)
    }
    if (open) {
      checkTemplates()
      // Reset form when modal opens
      setDocumentName("")
      setDocumentTypeId("")
      setDate(new Date().toISOString().split("T")[0])
      setCounterparty("")
      setStatus("Черновик")
    }
  }, [open])

  const handleCreate = async () => {
    if (!documentTypeId || !documentName.trim()) return

    // Get the template for this document type
    const templates = await getTemplatesByType(documentTypeId)
    if (templates.length === 0) {
      alert("Шаблон для этого типа документа не найден")
      return
    }

    // Use the first template for this document type
    const template = templates[0]

    const documentMetadata = {
      name: documentName,
      documentType: DOCUMENT_TYPES.find((t) => t.id === documentTypeId)?.name || "Счет",
      date,
      counterparty,
      status,
    }

    onClose()
    if (onSuccess) {
      onSuccess(template.id, documentMetadata)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Создать новый документ</DialogTitle>
          <DialogDescription>Заполните информацию о документе</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Тип документа</Label>
            <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип документа" />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.length > 0 ? (
                  DOCUMENT_TYPES.filter((type) => availableTypes.includes(type.id)).map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <IconFileText className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-types" disabled>
                    Нет доступных типов документов с шаблонами
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Название документа</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Введите название документа"
            />
          </div>

          <div className="space-y-2">
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Контрагент</Label>
            <Input
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              placeholder="Введите название контрагента"
            />
          </div>

          <div className="space-y-2">
            <Label>Статус</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Черновик">Черновик</SelectItem>
                <SelectItem value="Ожидает оплаты">Ожидает оплаты</SelectItem>
                <SelectItem value="Оплачен">Оплачен</SelectItem>
                <SelectItem value="Просрочен">Просрочен</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={!documentTypeId || !documentName.trim()}>
            <IconPlus className="h-4 w-4 mr-2" />
            Создать документ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
