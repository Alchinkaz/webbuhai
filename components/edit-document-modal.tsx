"use client"

import { useState, useEffect } from "react"
import { X, FileDown, Loader2, Eye, Plus, Save, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getTemplate, type Template } from "@/lib/storage"
import { generateDocument, previewDocument, generateDocumentAsBlob } from "@/lib/document-generator"
import { convertDocxToPdfViaGotenberg } from "@/lib/gotenberg-pdf-converter"
import { DocumentPreview } from "@/components/document-preview"
import { saveDocument, updateDocument, getDocumentById } from "@/lib/documents"

interface TableRow {
  id: string
  code: string
  name: string
  quantity: string
  unit: string
  price: string
  total: string
}

interface EditDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  templateId: string
  documentId?: string | null
  documentMetadata?: {
    name: string
    documentType: string
    date: string
    counterparty: string
    status: string
  }
}

export function EditDocumentModal({
  isOpen,
  onClose,
  templateId,
  documentId,
  documentMetadata: initialMetadata,
}: EditDocumentModalProps) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [tableRows, setTableRows] = useState<TableRow[]>([
    { id: "1", code: "", name: "", quantity: "", unit: "", price: "", total: "" },
  ])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewText, setPreviewText] = useState("")
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(documentId || null)
  const [documentMetadata, setDocumentMetadata] = useState(
    initialMetadata || {
      name: "",
      documentType: "Счет",
      date: new Date().toISOString().split("T")[0],
      counterparty: "",
      status: "Черновик",
    },
  )

  useEffect(() => {
    if (initialMetadata) {
      console.log("[v0] Setting document metadata from props:", initialMetadata)
      setDocumentMetadata(initialMetadata)
    }
  }, [initialMetadata])

  useEffect(() => {
    if (!isOpen) return

    const loadTemplate = async () => {
      setLoading(true)
      const data = await getTemplate(templateId)
      if (!data) {
        alert("Шаблон не найден")
        onClose()
        return
      }
      setTemplate(data)

      if (documentId) {
        // Load existing document
        console.log("[v0] Loading existing document:", documentId)
        const existingDoc = await getDocumentById(documentId)
        if (existingDoc) {
          setCurrentDocumentId(existingDoc.id)
          setValues(existingDoc.values)
          setTableRows(
            existingDoc.tableRows.length > 0
              ? existingDoc.tableRows
              : [{ id: "1", code: "", name: "", quantity: "", unit: "", price: "", total: "" }],
          )
          setDocumentMetadata({
            name: existingDoc.name,
            documentType: existingDoc.documentType,
            date: existingDoc.date,
            counterparty: existingDoc.counterparty,
            status: existingDoc.status,
          })
        }
      } else {
        // Initialize values for new document
        console.log("[v0] Initializing new document with metadata:", initialMetadata)
        const initialValues: Record<string, string> = {}
        data.variables.forEach((variable) => {
          initialValues[variable] = ""
        })
        setValues(initialValues)
        if (initialMetadata) {
          setDocumentMetadata(initialMetadata)
        }
      }

      setLoading(false)
    }

    loadTemplate()
  }, [isOpen, templateId, documentId, onClose, initialMetadata])

  const handleValueChange = (variable: string, value: string) => {
    setValues((prev) => ({ ...prev, [variable]: value }))
  }

  const addTableRow = () => {
    const newRow: TableRow = {
      id: Date.now().toString(),
      code: "",
      name: "",
      quantity: "",
      unit: "",
      price: "",
      total: "",
    }
    setTableRows([...tableRows, newRow])
  }

  const removeTableRow = (id: string) => {
    if (tableRows.length > 1) {
      setTableRows(tableRows.filter((row) => row.id !== id))
    }
  }

  const clearAllRows = () => {
    setTableRows([{ id: "1", code: "", name: "", quantity: "", unit: "", price: "", total: "" }])
  }

  const updateTableRow = (id: string, field: keyof TableRow, value: string) => {
    setTableRows(
      tableRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value }
          // Auto-calculate total if quantity or price changes
          if (field === "quantity" || field === "price") {
            const qty = Number.parseFloat(field === "quantity" ? value : updatedRow.quantity) || 0
            const price = Number.parseFloat(field === "price" ? value : updatedRow.price) || 0
            updatedRow.total = (qty * price).toFixed(2)
          }
          return updatedRow
        }
        return row
      }),
    )
  }

  const calculateTotal = () => {
    return tableRows.reduce((sum, row) => sum + (Number.parseFloat(row.total) || 0), 0).toFixed(2)
  }

  const handleSaveDocument = async () => {
    if (!template) return

    console.log("[v0] Saving document with metadata:", documentMetadata)

    const documentData = {
      name: documentMetadata.name,
      templateId: templateId,
      documentType: documentMetadata.documentType,
      date: documentMetadata.date,
      counterparty: documentMetadata.counterparty,
      status: documentMetadata.status,
      values: { ...values, calculated_total: calculateTotal() },
      tableRows,
    }

    console.log("[v0] Document data to save:", documentData)

    if (currentDocumentId) {
      // Update existing document
      await updateDocument(currentDocumentId, documentData)
      console.log("[v0] Document updated:", currentDocumentId)
      alert("Документ успешно обновлен!")
    } else {
      // Create new document
      const saved = await saveDocument(documentData)
      setCurrentDocumentId(saved.id)
      console.log("[v0] New document saved:", saved.id)
      alert("Документ успешно сохранен!")
    }

    // Trigger documents list refresh
    if (typeof window !== "undefined") {
      console.log("[v0] Dispatching documents-updated event")
      window.dispatchEvent(new Event("documents-updated"))
      // Also dispatch storage event for cross-tab sync
      window.dispatchEvent(new Event("storage"))
    }

    onClose()
  }

  const handlePreview = async () => {
    if (!template) return

    try {
      const valuesWithTable = {
        ...values,
        TABLE_ROWS: tableRows.map((row) => ({
          code: row.code,
          name: row.name,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          total: row.total,
        })),
        calculated_total: calculateTotal(),
        items_count: tableRows.length.toString(),
      }

      const text = await previewDocument(template, valuesWithTable)
      setPreviewText(text)
      setShowPreview(true)
    } catch (error) {
      console.error("Error previewing:", error)
      alert("Ошибка при создании предпросмотра")
    }
  }

  const handleGenerate = async () => {
    if (!template) return

    setGenerating(true)
    try {
      const valuesWithTable = {
        ...values,
        TABLE_ROWS: tableRows.map((row, index) => ({
          number: (index + 1).toString(),
          code: row.code,
          name: row.name,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          total: row.total,
        })),
        calculated_total: calculateTotal(),
        items_count: tableRows.length.toString(),
      }

      await generateDocument(template, valuesWithTable, "docx")
    } catch (error) {
      console.error("Error generating document:", error)
      alert("Ошибка при генерации документа")
    } finally {
      setGenerating(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (!template) return

    setGeneratingPdf(true)
    try {
      const valuesWithTable = {
        ...values,
        TABLE_ROWS: tableRows.map((row, index) => ({
          number: (index + 1).toString(),
          code: row.code,
          name: row.name,
          quantity: row.quantity,
          unit: row.unit,
          price: row.price,
          total: row.total,
        })),
        calculated_total: calculateTotal(),
        items_count: tableRows.length.toString(),
      }

      const docxBlob = await generateDocumentAsBlob(template, valuesWithTable)
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]
      const fileName = `${template.name}_${timestamp}`
      await convertDocxToPdfViaGotenberg(docxBlob, fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Ошибка при генерации PDF: " + (error instanceof Error ? error.message : String(error)))
    } finally {
      setGeneratingPdf(false)
    }
  }

  const fillDefaultValues = () => {
    setValues({
      beneficiary: "Ип Alchin",
      iin_bin: "960821350108",
      iik: "KZ9496511F000831429119",
      kbe: "17",
      bank: "АО ForteBank",
      bik: "IRTYKZKA",
      payment_code: "952",
      invoice_number: "1",
      invoice_date: "2025-10-08",
      supplier_iin: "960821350108",
      supplier_name: "Ип Alchin",
      supplier_address: "г. Актау 11 мкр. 27 дом",
      client_iin: "0",
      client_name: "Розничный покупатель",
      client_address: "г. Актау 11 мкр. 27 дом",
      contract: "Без договора",
      vat: "0,00",
      position: "Директор",
      executor_name: "Цуриев Ч. Д.",
    })

    setTableRows([
      {
        id: "1",
        code: "789897",
        name: "Установка системы GPS",
        quantity: "1",
        unit: "услуга",
        price: "30000.00",
        total: "30000.00",
      },
    ])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-2xl font-bold">{currentDocumentId ? "Редактировать документ" : "Создать документ"}</h2>
            {template && <p className="text-sm text-muted-foreground mt-1">Шаблон: {template.name}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fillDefaultValues} variant="secondary" size="sm">
              Заполнить по умолчанию
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Order Form Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg">Образец платежного поручения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-lg">
                    {/* Row 1 */}
                    <div className="md:border-r border-b p-3">
                      <Label className="text-sm font-medium mb-2 block">Бенефициар:</Label>
                      <Textarea
                        value={values.beneficiary || ""}
                        onChange={(e) => handleValueChange("beneficiary", e.target.value)}
                        className="min-h-[60px] text-sm"
                        placeholder="Введите бенефициара"
                      />
                    </div>
                    <div className="md:border-r border-b p-3">
                      <Label className="text-sm font-medium mb-2 block">ИИК:</Label>
                      <Input
                        value={values.iik || ""}
                        onChange={(e) => handleValueChange("iik", e.target.value)}
                        className="text-sm"
                        placeholder="Введите ИИК"
                      />
                    </div>
                    <div className="border-b p-3">
                      <Label className="text-sm font-medium mb-2 block">КБе:</Label>
                      <Input
                        value={values.kbe || ""}
                        onChange={(e) => handleValueChange("kbe", e.target.value)}
                        className="text-sm"
                        placeholder="Введите КБе"
                      />
                    </div>

                    {/* Row 2 */}
                    <div className="md:border-r p-3">
                      <Label className="text-sm font-medium mb-2 block">ИИН/БИН:</Label>
                      <Input
                        value={values.iin_bin || ""}
                        onChange={(e) => handleValueChange("iin_bin", e.target.value)}
                        className="text-sm"
                        placeholder="Введите ИИН/БИН"
                      />
                    </div>
                    <div className="md:border-r p-3 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Банк бенефициара:</Label>
                        <Input
                          value={values.bank || ""}
                          onChange={(e) => handleValueChange("bank", e.target.value)}
                          className="text-sm"
                          placeholder="Введите банк"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">БИК:</Label>
                          <Input
                            value={values.bik || ""}
                            onChange={(e) => handleValueChange("bik", e.target.value)}
                            className="text-sm"
                            placeholder="БИК"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Код назначения платежа:</Label>
                          <Input
                            value={values.payment_code || ""}
                            onChange={(e) => handleValueChange("payment_code", e.target.value)}
                            className="text-sm"
                            placeholder="Код"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Header Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <CardTitle className="text-base sm:text-lg">Счет на оплату №</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        value={values.invoice_number || ""}
                        onChange={(e) => handleValueChange("invoice_number", e.target.value)}
                        className="w-20 sm:w-24 text-sm"
                        placeholder="№"
                      />
                      <span className="text-sm">от</span>
                      <Input
                        type="date"
                        value={values.invoice_date || ""}
                        onChange={(e) => handleValueChange("invoice_date", e.target.value)}
                        className="w-36 sm:w-40 text-sm"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Поставщик:</Label>
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">ИИН/БИН:</Label>
                          <Input
                            value={values.supplier_iin || ""}
                            onChange={(e) => handleValueChange("supplier_iin", e.target.value)}
                            className="text-sm"
                            placeholder="ИИН/БИН поставщика"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Наименование:</Label>
                          <Input
                            value={values.supplier_name || ""}
                            onChange={(e) => handleValueChange("supplier_name", e.target.value)}
                            className="text-sm"
                            placeholder="Наименование поставщика"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Адрес:</Label>
                          <Textarea
                            value={values.supplier_address || ""}
                            onChange={(e) => handleValueChange("supplier_address", e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Адрес поставщика"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Покупатель:</Label>
                      <div className="space-y-3 pl-4 border-l-2 border-muted">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">ИИН/БИН:</Label>
                          <Input
                            value={values.client_iin || ""}
                            onChange={(e) => handleValueChange("client_iin", e.target.value)}
                            className="text-sm"
                            placeholder="ИИН/БИН покупателя"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Наименование:</Label>
                          <Input
                            value={values.client_name || ""}
                            onChange={(e) => handleValueChange("client_name", e.target.value)}
                            className="text-sm"
                            placeholder="Наименование покупателя"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Адрес:</Label>
                          <Textarea
                            value={values.client_address || ""}
                            onChange={(e) => handleValueChange("client_address", e.target.value)}
                            className="min-h-[60px] text-sm"
                            placeholder="Адрес покупателя"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-2 block">Договор:</Label>
                      <Input
                        value={values.contract || ""}
                        onChange={(e) => handleValueChange("contract", e.target.value)}
                        className="text-sm"
                        placeholder="Номер договора или 'Без договора'"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Items Table Section */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base sm:text-lg">Товары и услуги</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Table Header */}
                      <div className="grid grid-cols-[50px_100px_1fr_100px_120px_120px_120px] gap-2 bg-muted p-2 text-sm font-medium border-b">
                        <div>№</div>
                        <div>Код</div>
                        <div>Наименование</div>
                        <div>Кол-во</div>
                        <div>Ед. изм.</div>
                        <div>Цена за ед.</div>
                        <div>Сумма</div>
                      </div>

                      {/* Table Rows */}
                      {tableRows.map((row, index) => (
                        <div
                          key={row.id}
                          className="grid grid-cols-[50px_100px_1fr_100px_120px_120px_120px] gap-2 p-2 border-b last:border-b-0 items-center"
                        >
                          <div className="text-sm text-center">{index + 1}</div>
                          <Input
                            value={row.code}
                            onChange={(e) => updateTableRow(row.id, "code", e.target.value)}
                            className="h-9 text-sm"
                            placeholder="Код"
                          />
                          <Input
                            value={row.name}
                            onChange={(e) => updateTableRow(row.id, "name", e.target.value)}
                            className="h-9 text-sm"
                            placeholder="Наименование товара/услуги"
                          />
                          <Input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => updateTableRow(row.id, "quantity", e.target.value)}
                            className="h-9 text-sm"
                            placeholder="0"
                          />
                          <Input
                            value={row.unit}
                            onChange={(e) => updateTableRow(row.id, "unit", e.target.value)}
                            className="h-9 text-sm"
                            placeholder="шт"
                          />
                          <Input
                            type="number"
                            value={row.price}
                            onChange={(e) => updateTableRow(row.id, "price", e.target.value)}
                            className="h-9 text-sm"
                            placeholder="0.00"
                          />
                          <div className="flex items-center gap-2">
                            <Input value={row.total} readOnly className="h-9 text-sm bg-muted" />
                            {tableRows.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                onClick={() => removeTableRow(row.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Totals Row */}
                      <div className="bg-muted/50 p-4 space-y-2">
                        <div className="flex justify-end items-center gap-4">
                          <Label className="text-sm font-medium">Итого:</Label>
                          <Input value={calculateTotal()} readOnly className="w-40 text-sm bg-background" />
                        </div>
                        <div className="flex justify-end items-center gap-4">
                          <Label className="text-sm font-medium">В том числе НДС:</Label>
                          <Input
                            value={values.vat || "0.00"}
                            onChange={(e) => handleValueChange("vat", e.target.value)}
                            className="w-40 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Table Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <Button
                      onClick={addTableRow}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить
                    </Button>
                    <Button
                      onClick={clearAllRows}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto bg-transparent"
                    >
                      Очистить все
                    </Button>
                  </div>

                  {/* Summary Text */}
                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      Всего наименований {tableRows.length}, на сумму {calculateTotal()} KZT
                    </p>
                    <div className="text-muted-foreground">
                      <p className="text-xs">Сумма прописью будет сгенерирована автоматически</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Executor Section */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Должность:</Label>
                      <Input
                        value={values.position || ""}
                        onChange={(e) => handleValueChange("position", e.target.value)}
                        className="text-sm"
                        placeholder="Например: Директор, Генеральный директор, Исполнитель"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">ФИО исполнителя:</Label>
                      <Input
                        value={values.executor_name || ""}
                        onChange={(e) => handleValueChange("executor_name", e.target.value)}
                        className="text-sm"
                        placeholder="Например: Иванов И. И."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3">
                    <Button onClick={handlePreview} variant="outline" size="lg" className="w-full bg-transparent">
                      <Eye className="h-5 w-5 mr-2" />
                      Предпросмотр
                    </Button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={handleGenerate}
                        disabled={generating || generatingPdf}
                        className="w-full"
                        size="lg"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Генерация...
                          </>
                        ) : (
                          <>
                            <FileDown className="h-5 w-5 mr-2" />
                            Скачать Word
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleGeneratePdf}
                        disabled={generating || generatingPdf}
                        className="w-full"
                        size="lg"
                        variant="secondary"
                      >
                        {generatingPdf ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Генерация PDF...
                          </>
                        ) : (
                          <>
                            <FileText className="h-5 w-5 mr-2" />
                            Скачать PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button size="lg" className="w-full bg-green-600 hover:bg-green-700" onClick={handleSaveDocument}>
                      <Save className="h-5 w-5 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {showPreview && template && (
        <DocumentPreview text={previewText} onClose={() => setShowPreview(false)} templateName={template.name} />
      )}
    </div>
  )
}
