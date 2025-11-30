export async function convertDocxToPdfViaGotenberg(docxBlob: Blob, fileName: string): Promise<void> {
  try {
    console.log("[v0] Starting PDF conversion via Gotenberg")
    console.log("[v0] DOCX blob size:", docxBlob.size, "bytes")
    console.log("[v0] DOCX blob type:", docxBlob.type)

    if (docxBlob.size === 0) {
      throw new Error("DOCX file is empty")
    }

    const formData = new FormData()
    formData.append("file", docxBlob, "document.docx")

    console.log("[v0] Sending request to /api/convert-to-pdf")

    // Send DOCX to our API route which will forward it to Gotenberg
    const response = await fetch("/api/convert-to-pdf", {
      method: "POST",
      body: formData,
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] API error response:", error)

      if (error.fallback) {
        alert(
          `Ошибка конвертации в PDF:\n\n${error.error}\n\n` +
            `${error.details || ""}\n\n` +
            `Пожалуйста, скачайте документ в формате Word вместо PDF.`,
        )
        return
      }
      throw new Error(error.error || "Failed to convert DOCX to PDF")
    }

    // Get the PDF blob and download it
    const pdfBlob = await response.blob()
    console.log("[v0] PDF blob size:", pdfBlob.size, "bytes")
    console.log("[v0] PDF blob type:", pdfBlob.type)

    if (pdfBlob.size === 0) {
      throw new Error("Received empty PDF from server")
    }

    const arrayBuffer = await pdfBlob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const isPDF = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46

    if (!isPDF) {
      console.error("[v0] Client: Received invalid PDF")
      console.error("[v0] Client: First 20 bytes:", Array.from(bytes.slice(0, 20)))
      throw new Error("Received invalid PDF file from server")
    }

    console.log("[v0] Client: PDF validation passed")

    // Create download link
    const url = window.URL.createObjectURL(pdfBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${fileName}.pdf`
    document.body.appendChild(a)
    a.click()

    console.log("[v0] PDF download initiated successfully")

    // Cleanup
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("[v0] Error converting DOCX to PDF via Gotenberg:", error)
    alert(
      `Не удалось конвертировать документ в PDF:\n\n${error instanceof Error ? error.message : "Неизвестная ошибка"}\n\n` +
        `Пожалуйста, скачайте документ в формате Word.`,
    )
    throw error
  }
}
