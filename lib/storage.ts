export interface Template {
  id: string
  name: string
  fileName: string
  variables: string[]
  content: ArrayBuffer
  createdAt: string
  documentType?: string
}

const STORAGE_KEY = "document_templates"

export function clearAllTemplates(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log("[v0] Cleared all templates from storage")
}

export async function saveTemplate(template: Template): Promise<void> {
  const templates = await getTemplates()

  // Convert ArrayBuffer to base64 for storage
  const base64Content = arrayBufferToBase64(template.content)
  const storageTemplate = {
    ...template,
    content: base64Content,
  }

  templates.push(storageTemplate)

  const storageTemplates = templates.map((t) => ({
    ...t,
    content: typeof t.content === "string" ? t.content : arrayBufferToBase64(t.content),
  }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
  console.log("[v0] Template saved successfully")
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("templates-updated"))
  }
}

export async function getTemplates(): Promise<Template[]> {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const templates = JSON.parse(stored)
    const validTemplates: Template[] = []

    for (const t of templates) {
      try {
        const template = {
          ...t,
          content: base64ToArrayBuffer(t.content),
        }
        validTemplates.push(template)
      } catch (error) {
        console.error(`[v0] Skipping corrupted template: ${t.name || t.id}`, error)
        // Skip this corrupted template and continue with others
      }
    }

    if (validTemplates.length < templates.length) {
      console.log(`[v0] Removed ${templates.length - validTemplates.length} corrupted template(s)`)
      const storageTemplates = validTemplates.map((t) => ({
        ...t,
        content: arrayBufferToBase64(t.content),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
    }

    return validTemplates
  } catch (error) {
    console.error("[v0] Error reading templates, clearing storage:", error)
    clearAllTemplates()
    return []
  }
}

export async function getTemplate(id: string): Promise<Template | null> {
  const templates = await getTemplates()
  return templates.find((t) => t.id === id) || null
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates()
  const filtered = templates.filter((t) => t.id !== id)

  const storageTemplates = filtered.map((t) => ({
    ...t,
    content: arrayBufferToBase64(t.content),
  }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("templates-updated"))
  }
}

export async function getTemplatesByType(documentType: string): Promise<Template[]> {
  const templates = await getTemplates()
  return templates.filter((t) => t.documentType === documentType)
}

export async function hasTemplateForType(documentType: string): Promise<boolean> {
  const templates = await getTemplatesByType(documentType)
  return templates.length > 0
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000 // Process in chunks to avoid call stack size exceeded
  let binary = ""

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length))
    binary += String.fromCharCode.apply(null, Array.from(chunk))
  }

  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  if (!base64 || typeof base64 !== "string" || base64.trim() === "") {
    throw new Error("Invalid base64 string: empty or not a string")
  }

  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  } catch (error) {
    console.error("[v0] Error decoding base64:", error)
    throw new Error("Failed to decode template data. The template may be corrupted.")
  }
}
