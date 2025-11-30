import PizZip from "pizzip"

export function insertTableRows(
  docxArrayBuffer: ArrayBuffer,
  tableData: Array<{
    code: string
    name: string
    quantity: string
    unit: string
    price: string
    total: string
  }>,
): ArrayBuffer {
  try {
    console.log("[v0] Starting dynamic table row insertion")
    console.log("[v0] Table data:", tableData)

    const zip = new PizZip(docxArrayBuffer)
    const documentXml = zip.file("word/document.xml")?.asText()

    if (!documentXml) {
      throw new Error("Could not find document.xml in Word file")
    }

    console.log("[v0] Document XML loaded, searching for table with ###TABLE_ROWS### marker")

    const tableRowsMarkerRegex = /###TABLE_ROWS###/

    if (!tableRowsMarkerRegex.test(documentXml)) {
      console.log("[v0] No ###TABLE_ROWS### marker found, skipping table insertion")
      return docxArrayBuffer
    }

    // Find the table row that contains the marker
    // Word XML structure: <w:tr> contains table rows
    const tableRowRegex = /<w:tr[^>]*>[\s\S]*?###TABLE_ROWS###[\s\S]*?<\/w:tr>/
    const templateRow = documentXml.match(tableRowRegex)

    if (!templateRow) {
      console.log("[v0] Could not find template row with ###TABLE_ROWS### marker")
      return docxArrayBuffer
    }

    console.log("[v0] Found template row, generating new rows")

    const cleanTemplateRow = templateRow[0].replace(/###TABLE_ROWS###/g, "")

    // Generate new rows based on table data
    const newRows = tableData
      .map((row, index) => {
        let newRow = cleanTemplateRow

        // The template row should have cells that will be filled with data
        // We'll replace the cell content with actual values

        // Find all text elements in the row and replace them with data
        // This is a simplified approach - we'll replace cells in order
        const cellRegex = /<w:tc[^>]*>([\s\S]*?)<\/w:tc>/g
        let cellIndex = 0

        newRow = newRow.replace(cellRegex, (match) => {
          let cellContent = match

          // Replace text content in each cell based on column order
          // Column order: №, Код, Наименование, Кол-во, Ед. изм., Цена за ед., Сумма
          const textRegex = /(<w:t[^>]*>)[^<]*(<\/w:t>)/g

          cellContent = cellContent.replace(textRegex, (textMatch, openTag, closeTag) => {
            let value = ""
            switch (cellIndex) {
              case 0:
                value = String(index + 1)
                break // №
              case 1:
                value = row.code || ""
                break // Код
              case 2:
                value = row.name || ""
                break // Наименование
              case 3:
                value = row.quantity || ""
                break // Кол-во
              case 4:
                value = row.unit || ""
                break // Ед. изм.
              case 5:
                value = row.price || ""
                break // Цена за ед.
              case 6:
                value = row.total || ""
                break // Сумма
            }
            return openTag + value + closeTag
          })

          cellIndex++
          return cellContent
        })

        return newRow
      })
      .join("\n")

    console.log("[v0] Generated", tableData.length, "new rows")

    // Replace the template row with the new rows
    const updatedXml = documentXml.replace(tableRowRegex, newRows)

    // Update the document.xml in the zip
    zip.file("word/document.xml", updatedXml)

    // Generate the new docx file
    const newDocxArrayBuffer = zip.generate({
      type: "arraybuffer",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    })

    console.log("[v0] Table rows inserted successfully")
    return newDocxArrayBuffer
  } catch (error) {
    console.error("[v0] Error inserting table rows:", error)
    // Return original document if insertion fails
    return docxArrayBuffer
  }
}
