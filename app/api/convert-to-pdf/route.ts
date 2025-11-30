import { type NextRequest, NextResponse } from "next/server"

const GOTENBERG_URL = process.env.GOTENBERG_URL || "https://gotenberg-ngw0c88kwcgc0c888ww0g8gk.45.136.56.16.sslip.io"
const GOTENBERG_USERNAME = process.env.GOTENBERG_USERNAME || "vqScVgjFDOMkyHnd"
const GOTENBERG_PASSWORD = process.env.GOTENBERG_PASSWORD || "qD6CWn23wtTsQa1fKywwjUE4bkckEjEM"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] API: Received PDF conversion request")

    const formDataRequest = await request.formData()
    const docxFile = formDataRequest.get("file") as File

    if (!docxFile) {
      console.error("[v0] API: No DOCX file provided")
      return NextResponse.json({ error: "DOCX file is required" }, { status: 400 })
    }

    console.log("[v0] API: DOCX file received:", {
      name: docxFile.name,
      size: docxFile.size,
      type: docxFile.type,
    })

    if (docxFile.size === 0) {
      console.error("[v0] API: DOCX file is empty")
      return NextResponse.json({ error: "DOCX file is empty" }, { status: 400 })
    }

    // Create FormData for Gotenberg
    const formData = new FormData()
    formData.append("files", docxFile, "document.docx")

    const headers: HeadersInit = {}
    if (GOTENBERG_USERNAME && GOTENBERG_PASSWORD) {
      const credentials = Buffer.from(`${GOTENBERG_USERNAME}:${GOTENBERG_PASSWORD}`).toString("base64")
      headers["Authorization"] = `Basic ${credentials}`
    }

    const baseUrl = GOTENBERG_URL.replace(/\/$/, "") // Remove trailing slash
    const gotenbergEndpoint = `${baseUrl}/forms/libreoffice/convert`

    console.log("[v0] API: Sending request to Gotenberg:", gotenbergEndpoint)
    console.log("[v0] API: Using authentication:", !!headers["Authorization"])

    const gotenbergResponse = await fetch(gotenbergEndpoint, {
      method: "POST",
      body: formData,
      headers,
    })

    console.log("[v0] API: Gotenberg response status:", gotenbergResponse.status)
    console.log("[v0] API: Gotenberg response Content-Type:", gotenbergResponse.headers.get("content-type"))

    const contentType = gotenbergResponse.headers.get("content-type") || ""
    if (contentType.includes("text/html")) {
      const htmlPreview = await gotenbergResponse.text()
      console.error("[v0] API: Gotenberg returned HTML instead of PDF!")
      console.error("[v0] API: HTML preview (first 500 chars):", htmlPreview.substring(0, 500))
      console.error("[v0] API: This usually means the GOTENBERG_URL is incorrect.")
      console.error("[v0] API: Expected: A Gotenberg service URL (e.g., http://gotenberg:3000)")
      console.error("[v0] API: Received URL:", GOTENBERG_URL)

      return NextResponse.json(
        {
          error:
            "Gotenberg service configuration error: The service returned HTML instead of PDF. Please check GOTENBERG_URL environment variable.",
          details: "The URL should point to a Gotenberg service, not a web application.",
          fallback: true,
        },
        { status: 503 },
      )
    }

    if (!gotenbergResponse.ok) {
      const errorText = await gotenbergResponse.text()
      console.error("[v0] API: Gotenberg error response:", errorText)

      return NextResponse.json(
        {
          error: `Gotenberg service error (Status: ${gotenbergResponse.status})`,
          details: errorText,
          fallback: true,
        },
        { status: 503 },
      )
    }

    // Get the PDF blob from Gotenberg
    const pdfBuffer = await gotenbergResponse.arrayBuffer()
    console.log("[v0] API: Received buffer size:", pdfBuffer.byteLength, "bytes")

    if (pdfBuffer.byteLength === 0) {
      console.error("[v0] API: Received empty buffer from Gotenberg")
      return NextResponse.json({ error: "Received empty response from conversion service" }, { status: 500 })
    }

    const pdfBytes = new Uint8Array(pdfBuffer)
    const isPDF = pdfBytes[0] === 0x25 && pdfBytes[1] === 0x50 && pdfBytes[2] === 0x44 && pdfBytes[3] === 0x46 // %PDF

    if (!isPDF) {
      console.error("[v0] API: Response is not a valid PDF (magic bytes check failed)")
      console.error("[v0] API: First 20 bytes:", Array.from(pdfBytes.slice(0, 20)))
      console.error("[v0] API: As text:", String.fromCharCode(...Array.from(pdfBytes.slice(0, 100))))

      return NextResponse.json(
        {
          error: "Invalid PDF received from Gotenberg service",
          details: "The response does not contain valid PDF data",
          fallback: true,
        },
        { status: 500 },
      )
    }

    console.log("[v0] API: PDF validation passed (magic bytes: %PDF)")

    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="document.pdf"',
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] API: Error converting to PDF:", error)
    return NextResponse.json(
      {
        error: `Failed to convert to PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        fallback: true,
      },
      { status: 500 },
    )
  }
}
