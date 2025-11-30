import PizZip from "pizzip"

export async function parseWordTemplate(arrayBuffer: ArrayBuffer) {
  try {
    console.log("[v0] Starting to parse Word template")

    const zip = new PizZip(arrayBuffer)

    const documentXml = zip.file("word/document.xml")?.asText()

    if (!documentXml) {
      throw new Error("Invalid Word document: document.xml not found")
    }

    console.log("[v0] Successfully extracted document.xml")

    const variables = new Set<string>()
    // Also excludes loop tags like {#items} and {/items}
    const regex = /\{([^#/}][^}]*)\}/g
    let match

    while ((match = regex.exec(documentXml)) !== null) {
      const variableName = match[1].trim()
      if (variableName) {
        variables.add(variableName)
      }
    }

    console.log("[v0] Found variables:", Array.from(variables))

    return {
      variables: Array.from(variables),
      content: arrayBuffer,
    }
  } catch (error) {
    console.error("[v0] Error parsing Word template:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to parse Word template: ${error.message}`)
    }
    throw new Error("Failed to parse Word template")
  }
}
