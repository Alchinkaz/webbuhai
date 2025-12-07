"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { DocumentsTable } from "@/components/documents-table"
import * as React from "react"
import { getDocuments, type SavedDocument, deleteDocument } from "@/lib/documents"
import { DocumentStatusFilter } from "@/components/document-status-filter"
import { EditDocumentModal } from "@/components/edit-document-modal"
import { hasTemplateForType } from "@/lib/storage"
import { DOCUMENT_TYPES } from "@/lib/document-types"
import { useNavigation } from "@/hooks/use-navigation"
import { Button } from "@/components/ui/button"
import { IconPlus, IconFileText } from "@tabler/icons-react"
import { useLanguage } from "@/hooks/use-language"
import { TemplateUpload } from "@/components/template-upload"
import { TemplateList } from "@/components/template-list"
import type { Template } from "@/lib/storage"

interface DocumentsContentProps {
  initialFilter?: string
}

export function DocumentsContent({ initialFilter }: DocumentsContentProps) {
  const pathname = usePathname()
  const [showEditModal, setShowEditModal] = useState(false)
  const [editDocumentId, setEditDocumentId] = useState<string | null>(null)
  const [editTemplateId, setEditTemplateId] = useState<string>("")
  const [newDocumentMetadata, setNewDocumentMetadata] = useState<any>(null)
  const [hasAnyTemplate, setHasAnyTemplate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = React.useState<SavedDocument[]>([])
  
  // Determine active filter from URL
  const getActiveFilterFromPath = () => {
    if (pathname) {
      const pathParts = pathname.split("/")
      const section = pathParts[pathParts.length - 1]
      if (["incoming", "outgoing", "templates"].includes(section)) {
        return section
      }
    }
    return initialFilter || "incoming"
  }
  
  const [activeFilter, setActiveFilter] = React.useState(getActiveFilterFromPath())
  const { currentPage } = useNavigation()
  const { t } = useLanguage()

  React.useEffect(() => {
    const filterFromPath = getActiveFilterFromPath()
    if (filterFromPath !== activeFilter) {
      setActiveFilter(filterFromPath)
    }
  }, [pathname])

  const [showUpload, setShowUpload] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [allTemplates, setAllTemplates] = useState<Template[]>([])

  React.useEffect(() => {
    console.log("[v0] Documents updated, current count:", docs.length)
  }, [docs])

  // Load all templates for dropdown menu and templates section
  React.useEffect(() => {
    const loadAllTemplates = async () => {
      const { getTemplates } = await import("@/lib/storage")
      const all = await getTemplates()
      setAllTemplates(all)
      // Also set templates for templates section
      setTemplates(all)
    }
    loadAllTemplates()

    const handleUpdate = () => loadAllTemplates()
    if (typeof window !== "undefined") {
      window.addEventListener("templates-updated", handleUpdate)
      return () => window.removeEventListener("templates-updated", handleUpdate)
    }
  }, [])

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
    if (typeof window !== "undefined") window.addEventListener("documents-updated", handler)
    if (typeof window !== "undefined") window.addEventListener("focus", handler)
    if (typeof document !== "undefined") document.addEventListener("visibilitychange", handler)
    if (typeof window !== "undefined") window.addEventListener("pageshow", handler)
    if (typeof window !== "undefined") window.addEventListener("popstate", handler)
    if (typeof window !== "undefined") window.addEventListener("storage", handler)
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("documents-updated", handler)
      if (typeof window !== "undefined") window.removeEventListener("focus", handler)
      if (typeof document !== "undefined") document.removeEventListener("visibilitychange", handler)
      if (typeof window !== "undefined") window.removeEventListener("pageshow", handler)
      if (typeof window !== "undefined") window.removeEventListener("popstate", handler)
      if (typeof window !== "undefined") window.removeEventListener("storage", handler)
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

  const handleTemplateSelect = async (templateId: string) => {
    console.log("[v0] Template selected:", templateId)
    // Find the selected template to get its name and document type
    const selectedTemplate = allTemplates.find(t => t.id === templateId)
    if (!selectedTemplate) {
      console.error("[v0] Template not found:", templateId)
      return
    }

    const documentTypeName = selectedTemplate.documentType 
      ? DOCUMENT_TYPES.find(dt => dt.id === selectedTemplate.documentType)?.name || "Счет на оплату"
      : "Счет на оплату"
    
    // Use template name as document name
    const defaultMetadata = {
      name: selectedTemplate.name, // Use template name as document name
      documentType: documentTypeName,
      date: new Date().toISOString().split("T")[0],
      counterparty: "",
      status: "Черновик",
    }
    setEditTemplateId(templateId)
    setEditDocumentId(null)
    setNewDocumentMetadata(defaultMetadata)
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
    const { getTemplates } = await import("@/lib/storage")
    const all = await getTemplates()
    setTemplates(all)
    setAllTemplates(all)
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
    const { getTemplates } = await import("@/lib/storage")
    const all = await getTemplates()
    setTemplates(all)
    setAllTemplates(all)
  }

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId)
  }

  const renderTemplatesContent = () => {
    return (
      <div className="px-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Шаблоны документов</h2>
            <p className="text-muted-foreground text-sm">Управление шаблонами для создания документов</p>
          </div>
          <div className="flex gap-2">
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
              documentType={null}
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
          onTemplateSelect={handleTemplateSelect}
          templates={allTemplates}
          createButtonDisabled={loading || !hasAnyTemplate}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
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
        <EditDocumentModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          templateId={editTemplateId}
          documentId={editDocumentId}
          documentMetadata={newDocumentMetadata}
        />
      )}
    </div>
  )
}
