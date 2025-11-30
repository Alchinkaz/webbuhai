import PizZip from "pizzip"
import Docxtemplater from "docxtemplater"

/**
 * Replaces placeholders in Word template with actual values using docxtemplater
 * Preserves all original template styling
 */
export function replaceTemplatePlaceholders(templateBuffer: ArrayBuffer, values: Record<string, any>): ArrayBuffer {
  try {
    const zip = new PizZip(templateBuffer)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      // Handle errors gracefully
      nullGetter: () => "",
    })

    // Prepare data for template
    const templateData = prepareTemplateData(values)

    try {
      // Render the document (replace all placeholders)
      doc.render(templateData)
    } catch (error: any) {
      console.error("Error rendering document:", error.message)

      if (error.properties) {
        console.error("Error properties:", JSON.stringify(error.properties, null, 2))

        if (error.properties.errors) {
          console.error("Detailed errors:")
          error.properties.errors.forEach((err: any, index: number) => {
            console.error(`Error ${index + 1}:`, {
              message: err.message,
              name: err.name,
              properties: err.properties,
            })
          })
        }
      }

      throw new Error(`Docxtemplater error: ${error.message}`)
    }

    // Generate the new docx file
    const newBuffer = doc.getZip().generate({
      type: "arraybuffer",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    return newBuffer
  } catch (error) {
    console.error("Error replacing template placeholders:", error)
    throw new Error("Failed to process template: " + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * Prepares data for docxtemplater
 * Converts TABLE_ROWS array to format expected by template loops
 */
function prepareTemplateData(values: Record<string, any>): Record<string, any> {
  const data: Record<string, any> = {}

  // Copy all simple values
  for (const [key, value] of Object.entries(values)) {
    if (key === "TABLE_ROWS") continue
    data[key] = value != null ? String(value) : ""
  }

  // Handle table rows - docxtemplater expects an array for loops
  if (values.TABLE_ROWS && Array.isArray(values.TABLE_ROWS)) {
    // Add the rows array for template loop
    data.items = values.TABLE_ROWS.map((row, index) => ({
      number: String(index + 1),
      code: row.code || "",
      name: row.name || "",
      quantity: row.quantity || "",
      unit: row.unit || "",
      price: row.price || "",
      total: row.total || "",
    }))
  } else {
    data.items = []
  }

  return data
}
