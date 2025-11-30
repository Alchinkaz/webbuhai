import FileSaver from "file-saver"
import type { Template } from "./storage"
import { replaceTemplatePlaceholders } from "./template-replacer"
import { numberToWordsRu } from "./number-to-words"

function formatDate(isoDate: string): string {
  if (!isoDate) return ""

  try {
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return isoDate
  }
}

function mapFormValuesToTemplate(values: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = { ...values }

  // Map beneficiary section
  if (values.beneficiary) mapped.COMPANY_NAME = values.beneficiary
  if (values.iin_bin) mapped.COMPANY_IIN = values.iin_bin
  if (values.iik) mapped.COMPANY_IIC = values.iik
  if (values.kbe) mapped.COMPANY_KBE = values.kbe
  if (values.bank) mapped.BENEFICIARY_BANK = values.bank
  if (values.bik) mapped.COMPANY_BIC = values.bik
  if (values.payment_code) mapped.PAYMENT_CODE = values.payment_code

  // Map invoice section
  if (values.invoice_number) mapped.INVOICE_NUMBER = values.invoice_number
  if (values.invoice_date) mapped.INVOICE_DATE = formatDate(values.invoice_date)

  if (values.supplier_iin) mapped.SUPPLIER_IIN = values.supplier_iin
  if (values.supplier_name) mapped.SUPPLIER_NAME = values.supplier_name
  if (values.supplier_address) mapped.SUPPLIER_ADDRESS = values.supplier_address

  if (values.client_iin) mapped.CLIENT_IIN = values.client_iin
  if (values.client_name) mapped.CLIENT_NAME = values.client_name
  if (values.client_address) mapped.CLIENT_ADDRESS = values.client_address

  // Map contract
  if (values.contract) mapped.CONTRACT = values.contract

  // Map totals
  if (values.calculated_total) {
    mapped.TOTAL_SUM = values.calculated_total
    const totalNum = Number.parseFloat(values.calculated_total) || 0
    mapped.TOTAL_SUM_IN_WORDS = numberToWordsRu(totalNum)
  }
  if (values.vat) mapped.VAT = values.vat
  if (values.items_count) mapped.ITEMS_TOTAL_LINE = values.items_count

  // Map executor
  if (values.position) mapped.POSITION = values.position
  if (values.executor_name) mapped.EXECUTOR_NAME = values.executor_name

  // Keep TABLE_ROWS as is
  if (values.TABLE_ROWS) mapped.TABLE_ROWS = values.TABLE_ROWS

  return mapped
}

export async function generateDocument(template: Template, values: Record<string, any>, format: "docx"): Promise<void> {
  try {
    const mappedValues = mapFormValuesToTemplate(values)

    // Use template-based approach: load template and replace placeholders
    const processedBuffer = replaceTemplatePlaceholders(template.content, mappedValues)

    // Convert to blob
    const blob = new Blob([processedBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0]
    const fileName = `${template.name}_${timestamp}`

    FileSaver.saveAs(blob, `${fileName}.docx`)
  } catch (error) {
    console.error("Error generating document:", error)
    throw new Error("Failed to generate document")
  }
}

export async function previewDocument(template: Template, values: Record<string, any>): Promise<string> {
  try {
    const mappedValues = mapFormValuesToTemplate(values)

    // Generate preview text from values
    const tableRows = Array.isArray(mappedValues.TABLE_ROWS) ? mappedValues.TABLE_ROWS : []
    const preview = `
ОБРАЗЕЦ ПЛАТЕЖНОГО ПОРУЧЕНИЯ

Бенефициар: ${mappedValues.COMPANY_NAME || ""}
ИИН/БИН: ${mappedValues.COMPANY_IIN || ""}
ИИК: ${mappedValues.COMPANY_IIC || ""}
КБе: ${mappedValues.COMPANY_KBE || ""}

Банк бенефициара: ${mappedValues.BENEFICIARY_BANK || ""}
БИК: ${mappedValues.COMPANY_BIC || ""}
Код назначения платежа: ${mappedValues.PAYMENT_CODE || ""}

СЧЕТ НА ОПЛАТУ № ${mappedValues.INVOICE_NUMBER || ""} от ${mappedValues.INVOICE_DATE || ""}

Поставщик:
ИИН/БИН: ${mappedValues.SUPPLIER_IIN || ""}
Наименование: ${mappedValues.SUPPLIER_NAME || ""}
Адрес: ${mappedValues.SUPPLIER_ADDRESS || ""}

Покупатель:
ИИН/БИН: ${mappedValues.CLIENT_IIN || ""}
Наименование: ${mappedValues.CLIENT_NAME || ""}
Адрес: ${mappedValues.CLIENT_ADDRESS || ""}

Договор: ${mappedValues.CONTRACT || ""}

ТАБЛИЦА ТОВАРОВ/УСЛУГ:
№ | Код | Наименование | Кол-во | Ед. изм. | Цена за ед. | Сумма
${tableRows
  .map(
    (row, index) =>
      `${index + 1} | ${row.code || ""} | ${row.name || ""} | ${row.quantity || ""} | ${row.unit || ""} | ${row.price || ""} | ${row.total || ""}`,
  )
  .join("\n")}

Итого: ${mappedValues.TOTAL_SUM || ""}
В том числе НДС: ${mappedValues.VAT || ""}

Всего наименований ${tableRows.length}, на сумму ${mappedValues.TOTAL_SUM || ""} KZT
Всего к оплате: ${mappedValues.TOTAL_SUM_IN_WORDS || ""}

Исполнитель: ${mappedValues.POSITION || ""} ${mappedValues.EXECUTOR_NAME || ""}
М.П.
    `.trim()

    return preview
  } catch (error) {
    console.error("Error previewing document:", error)
    throw new Error("Failed to preview document")
  }
}

export async function generateDocumentAsBlob(template: Template, values: Record<string, any>): Promise<Blob> {
  try {
    const mappedValues = mapFormValuesToTemplate(values)

    // Use template-based approach: load template and replace placeholders
    const processedBuffer = replaceTemplatePlaceholders(template.content, mappedValues)

    // Convert to blob
    const blob = new Blob([processedBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    return blob
  } catch (error) {
    console.error("Error generating document blob:", error)
    throw new Error("Failed to generate document blob")
  }
}
