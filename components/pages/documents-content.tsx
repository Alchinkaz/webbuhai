"use client"

import { useState } from "react"
import { DocumentsTable } from "@/components/documents-table"
import * as React from "react"
import { getDocuments, type SavedDocument, deleteDocument } from "@/lib/documents"
import { DocumentStatusFilter } from "@/components/document-status-filter"
import { CreateDocumentModal } from "@/components/create-document-modal"
import { EditDocumentModal } from "@/components/edit-document-modal"
import { hasTemplateForType } from "@/lib/storage"
import { DOCUMENT_TYPES } from "@/lib/document-types"
import { useNavigation } from "@/hooks/use-navigation"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IconFileInvoice, IconCheck, IconPlus, IconFileText } from "@tabler/icons-react"
import { useLanguage } from "@/hooks/use-language"
import { TemplateUpload } from "@/components/template-upload"
import { TemplateList } from "@/components/template-list"
import { getTemplatesByType } from "@/lib/storage"
import type { Template } from "@/lib/storage"

export function DocumentsContent() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editDocumentId, setEditDocumentId] = useState<string | null>(null)
  const [editTemplateId, setEditTemplateId] = useState<string>("")
  const [newDocumentMetadata, setNewDocumentMetadata] = useState<any>(null)
  const [hasAnyTemplate, setHasAnyTemplate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = React.useState<SavedDocument[]>([])
  const [activeFilter, setActiveFilter] = React.useState("incoming")
  const { currentPage, documentType, setDocumentType } = useNavigation()
  const { t } = useLanguage()

  const [invoiceHasTemplate, setInvoiceHasTemplate] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])

  React.useEffect(() => {
    console.log("[v0] Documents updated, current count:", docs.length)
  }, [docs])

  React.useEffect(() => {
    const checkTemplates = async () => {
      setLoading(true)
      for (const docType of DOCUMENT_TYPES) {
        const hasTemplate = await hasTemplateForType(docType.id)
        if (hasTemplate) {
          setHasAnyTemplate(true)
          setLoading(false)
          return
        }
      }
      setHasAnyTemplate(false)
      setLoading(false)
    }
    checkTemplates()
  }, [])

  React.useEffect(() => {
    const checkInvoiceTemplate = async () => {
      const hasInvoice = await hasTemplateForType("invoice")
      setInvoiceHasTemplate(hasInvoice)
    }
    checkInvoiceTemplate()

    const handleUpdate = () => checkInvoiceTemplate()
    window.addEventListener("templates-updated", handleUpdate)
    return () => window.removeEventListener("templates-updated", handleUpdate)
  }, [])

  React.useEffect(() => {
    if (documentType) {
      const loadTemplates = async () => {
        const typeTemplates = await getTemplatesByType(documentType)
        setTemplates(typeTemplates)
      }
      loadTemplates()

      const handleUpdate = () => loadTemplates()
      window.addEventListener("templates-updated", handleUpdate)
      return () => window.removeEventListener("templates-updated", handleUpdate)
    }
  }, [documentType])

  React.useEffect(() => {
    const load = async () => {
      const loadedDocs = await getDocuments()
      console.log("[v0] Loading documents:", loadedDocs.length)
      setDocs(loadedDocs)
    }
    load()
    
    const handler = () => {
      console.log("[v0] Documents update event triggered")
      load()
    }
    
    const storageHandler = (e: StorageEvent) => {
      // Only handle storage events for documents key
      if (e.key === "documents" && e.newValue) {
        console.log("[v0] Storage event triggered for documents")
        load()
      }
    }
    
    if (typeof window !== "undefined") {
      window.addEventListener("documents-updated", handler)
      window.addEventListener("focus", handler)
      window.addEventListener("storage", storageHandler)
      window.addEventListener("pageshow", handler)
      window.addEventListener("popstate", handler)
    }
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handler)
    }
    
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("documents-updated", handler)
        window.removeEventListener("focus", handler)
        window.removeEventListener("storage", storageHandler)
        window.removeEventListener("pageshow", handler)
        window.removeEventListener("popstate", handler)
      }
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handler)
      }
    }
  }, [])

  React.useEffect(() => {
    if (currentPage === "documents") {
      console.log("[v0] Current page is documents, reloading...")
      ;(async () => {
        const loadedDocs = await getDocuments()
        setDocs(loadedDocs)
      })()
    }
  }, [currentPage])

  const handleOpenDocument = (documentId: string, templateId: string) => {
    console.log("[v0] Opening document:", documentId, "with template:", templateId)
    setEditDocumentId(documentId)
    setEditTemplateId(templateId)
    setNewDocumentMetadata(null)
    setShowEditModal(true)
  }

  const handleDeleteDocument = async (documentId: string) => {
    console.log("[v0] Deleting document:", documentId)
    const success = await deleteDocument(documentId)
    if (success) {
      console.log("[v0] Document deleted successfully, reloading list")
      const loadedDocs = await getDocuments()
      setDocs(loadedDocs)
    } else {
      console.log("[v0] Failed to delete document")
    }
  }

  const handleCreateSuccess = (templateId: string, metadata: any) => {
    console.log("[v0] Create success, metadata:", metadata)
    setEditTemplateId(templateId)
    setEditDocumentId(null)
    setNewDocumentMetadata(metadata)
    setShowEditModal(true)
  }

  const handleEditModalClose = async () => {
    console.log("[v0] Edit modal closed, reloading documents")
    setShowEditModal(false)
    setEditDocumentId(null)
    setNewDocumentMetadata(null)
    const loadedDocs = await getDocuments()
    setDocs(loadedDocs)
  }

  const handleUploadComplete = async () => {
    setShowUpload(false)
    const typeTemplates = await getTemplatesByType(documentType!)
    setTemplates(typeTemplates)
    const checkTemplates = async () => {
      setLoading(true)
      for (const docType of DOCUMENT_TYPES) {
        const hasTemplate = await hasTemplateForType(docType.id)
        if (hasTemplate) {
          setHasAnyTemplate(true)
          setLoading(false)
          return
        }
      }
      setHasAnyTemplate(false)
      setLoading(false)
    }
    checkTemplates()
  }

  const handleTemplateUpdate = async () => {
    if (documentType) {
      const typeTemplates = await getTemplatesByType(documentType)
      setTemplates(typeTemplates)
    }
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
    if (filterId === "templates") {
      setDocumentType(null)
    } else if (filterId !== "templates") {
      setDocumentType(null)
    }
  }

  const renderTemplatesContent = () => {
    if (!documentType) {
      const documentTypeCards = [
        {
          id: "invoice",
          title: "Счет на оплату",
          description: "Шаблон для создания счетов на оплату",
          icon: IconFileInvoice,
          hasTemplate: invoiceHasTemplate,
          onClick: () => setDocumentType("invoice"),
        },
      ]

      return (
        <div className="px-4 lg:px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentTypeCards.map((card) => {
              const Icon = card.icon
              return (
                <Card
                  key={card.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 relative"
                  onClick={card.onClick}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{card.title}</CardTitle>
                          <CardDescription className="mt-1">{card.description}</CardDescription>
                        </div>
                      </div>
                      {card.hasTemplate && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/10">
                          <IconCheck className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      )
    }

    const getDocumentTypeInfo = () => {
      switch (documentType) {
        case "invoice":
          return {
            title: "Счет на оплату",
            description: "Управление шаблонами для счетов на оплату",
          }
        default:
          return {
            title: "Документ",
            description: "Управление шаблонами документов",
          }
      }
    }

    const info = getDocumentTypeInfo()

    return (
      <div className="px-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{info.title}</h2>
            <p className="text-muted-foreground text-sm">{info.description}</p>
          </div>
          <div className="flex gap-2">
            {/* Кнопка будет неактивна когда нет шаблонов */}
            <Button onClick={() => setShowUpload(true)} size="sm">
              <IconPlus className="h-4 w-4 mr-2" />
              Загрузить шаблон
            </Button>
          </div>
        </div>

        {showUpload && (
          <div className="mb-4">
            <TemplateUpload
              onClose={() => setShowUpload(false)}
              onComplete={handleUploadComplete}
              documentType={documentType}
            />
          </div>
        )}

        {templates.length === 0 ? (
          <div className="border-dashed border-2 rounded-lg p-12 text-center">
            <IconFileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет шаблонов</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Загрузите Word шаблон с переменными {"{{}}"} чтобы начать создавать документы
            </p>
            <Button onClick={() => setShowUpload(true)} size="lg" className="gap-2">
              <IconPlus className="h-5 w-5" />
              Загрузить первый шаблон
            </Button>
          </div>
        ) : (
          <TemplateList templates={templates} onUpdate={handleTemplateUpdate} />
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0">
        <DocumentStatusFilter
          onCreateClick={() => setShowCreateModal(true)}
          createButtonDisabled={loading || !hasAnyTemplate}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          documentType={documentType}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeFilter === "templates" ? (
          renderTemplatesContent()
        ) : (
          <DocumentsTable
            data={docs.map((d, i) => ({
              id: i + 1,
              documentId: d.id,
              documentNumber: d.name,
              date: d.date,
              counterparty: d.counterparty,
              amount: d.values.calculated_total || "—",
              status: d.status,
              templateId: d.templateId,
              documentType: d.documentType,
            }))}
            onOpenDocument={handleOpenDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </div>

      {hasAnyTemplate && (
        <>
          <CreateDocumentModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
          <EditDocumentModal
            isOpen={showEditModal}
            onClose={handleEditModalClose}
            templateId={editTemplateId}
            documentId={editDocumentId}
            documentMetadata={newDocumentMetadata}
          />
        </>
      )}
    </div>
  )
}
