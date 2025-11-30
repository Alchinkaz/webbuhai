import mammoth from "mammoth"
import html2pdf from "html2pdf.js"
import FileSaver from "file-saver"

/**
 * Converts a DOCX blob to PDF using mammoth.js and html2pdf.js
 */
export async function convertDocxToPdf(docxBlob: Blob, fileName: string): Promise<void> {
  try {
    console.log("[v0] Starting DOCX to PDF conversion")

    // Convert blob to ArrayBuffer
    const arrayBuffer = await docxBlob.arrayBuffer()

    // Convert DOCX to HTML using mammoth.js
    console.log("[v0] Converting DOCX to HTML with mammoth.js")
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const htmlContent = result.value

    console.log("[v0] HTML conversion complete")

    // Create a temporary container for the HTML
    const container = document.createElement("div")
    container.innerHTML = htmlContent
    container.style.position = "absolute"
    container.style.left = "-9999px"
    container.style.width = "210mm" // A4 width
    container.style.padding = "20mm"
    container.style.fontFamily = "Arial, sans-serif"
    container.style.fontSize = "12pt"
    container.style.lineHeight = "1.5"
    container.style.color = "#000"
    container.style.backgroundColor = "#fff"

    // Apply styling to tables
    const tables = container.querySelectorAll("table")
    tables.forEach((table) => {
      ;(table as HTMLElement).style.width = "100%"
      ;(table as HTMLElement).style.borderCollapse = "collapse"
      ;(table as HTMLElement).style.marginBottom = "20px"

      const cells = table.querySelectorAll("td, th")
      cells.forEach((cell) => {
        ;(cell as HTMLElement).style.border = "1px solid #000"
        ;(cell as HTMLElement).style.padding = "8px"
      })
    })

    document.body.appendChild(container)

    // Convert HTML to PDF using html2pdf.js
    console.log("[v0] Converting HTML to PDF with html2pdf.js")

    const opt = {
      margin: 10,
      filename: `${fileName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }

    await html2pdf().set(opt).from(container).save()

    // Clean up
    document.body.removeChild(container)

    console.log("[v0] PDF conversion and download complete")
  } catch (error) {
    console.error("[v0] Error converting DOCX to PDF:", error)
    throw new Error(`Failed to convert document to PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Downloads the DOCX file with manual conversion instructions
 */
export async function downloadDocxWithInstructions(docxBlob: Blob, fileName: string): Promise<void> {
  try {
    // Save the DOCX file
    FileSaver.saveAs(docxBlob, `${fileName}.docx`)

    // Show instructions
    setTimeout(() => {
      alert(
        "Документ Word успешно скачан!\n\n" +
          "Для конвертации в PDF:\n" +
          "1. Откройте скачанный файл в Microsoft Word или Google Docs\n" +
          "2. Выберите 'Файл' → 'Сохранить как' → 'PDF'\n" +
          "3. Сохраните файл\n\n" +
          "Все форматирование будет сохранено.",
      )
    }, 500)

    console.log("[v0] DOCX downloaded with manual conversion instructions")
  } catch (error) {
    console.error("[v0] Error downloading DOCX:", error)
    throw new Error("Failed to download DOCX file")
  }
}
