export interface Template {
  id: string
  name: string
  fileName: string
  variables: string[]
  content?: ArrayBuffer // For backward compatibility with localStorage
  url?: string // For Blob storage
  size?: number
  createdAt: string
  documentType?: string
  contentHash?: string
}

const STORAGE_KEY = "document_templates"

export function clearAllTemplates(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log("[v0] Cleared all templates from storage")
}

export async function saveTemplate(template: Template & { content: ArrayBuffer }): Promise<void> {
  try {
    const { saveTemplateToSupabase } = await import("./storage-supabase")
    const supabaseTemplate = await saveTemplateToSupabase(
      {
        id: template.id,
        name: template.name,
        fileName: template.fileName,
        variables: template.variables,
        createdAt: template.createdAt,
        documentType: template.documentType,
      },
      template.content,
    )

    // Also cache in localStorage for quick access
    const templates = await getTemplates()
    const newTemplates = templates.filter((t) => t.id !== template.id)
    newTemplates.push({
      ...supabaseTemplate,
      content: undefined,
    })

    const storageTemplates = newTemplates.map((t) => ({
      ...t,
      content: undefined,
    }))

    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
    console.log("[v0] Template saved to Supabase")

    // Storage events are automatically dispatched by browser for other tabs
    // Custom event for same-tab sync
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("templates-updated"))
    }
  } catch (error) {
    console.error("[v0] Error saving template to Supabase:", error)
    throw error
  }
}

export async function getTemplates(): Promise<Template[]> {
  try {
    const { listTemplatesFromSupabase } = await import("./storage-supabase")
    const supabaseTemplates = await listTemplatesFromSupabase()

    if (supabaseTemplates.length > 0) {
      // Update localStorage cache
      const storageTemplates = supabaseTemplates.map((t) => ({
        ...t,
        content: undefined,
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
      return supabaseTemplates
    }
  } catch (error) {
    console.log("[v0] Could not fetch from Supabase, checking localStorage:", error)
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const templates = JSON.parse(stored)
    const validTemplates: Template[] = []

    for (const t of templates) {
      try {
        const template = {
          ...t,
          content: t.content ? base64ToArrayBuffer(t.content) : undefined,
        }
        validTemplates.push(template)
      } catch (error) {
        console.error(`[v0] Skipping corrupted template: ${t.name || t.id}`, error)
      }
    }

    if (validTemplates.length < templates.length) {
      console.log(`[v0] Removed ${templates.length - validTemplates.length} corrupted template(s)`)
      const storageTemplates = validTemplates.map((t) => ({
        ...t,
        content: t.content ? arrayBufferToBase64(t.content) : undefined,
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
  try {
    const { getTemplateFromSupabase, downloadTemplateFromSupabase } = await import("./storage-supabase")
    const template = await getTemplateFromSupabase(id)

    if (template?.url) {
      try {
        const content = await downloadTemplateFromSupabase(template.url)
        return { ...template, content }
      } catch (error) {
        console.error("[v0] Error downloading template content:", error)
      }
    }

    return template
  } catch (error) {
    console.error("[v0] Error getting template from Supabase:", error)
  }

  // Fallback to localStorage
  const templates = await getTemplates()
  const template = templates.find((t) => t.id === id)
  return template || null
}

export async function deleteTemplate(id: string): Promise<void> {
  try {
    const { deleteTemplateFromSupabase } = await import("./storage-supabase")
    await deleteTemplateFromSupabase(id)
  } catch (error) {
    console.error("[v0] Error deleting from Supabase:", error)
  }

  // Also remove from localStorage cache
  const templates = await getTemplates()
  const filtered = templates.filter((t) => t.id !== id)

  const storageTemplates = filtered.map((t) => ({
    ...t,
    content: t.content ? arrayBufferToBase64(t.content) : undefined,
  }))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageTemplates))
  // Storage events are automatically dispatched by browser for other tabs
  // Custom event for same-tab sync
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
  const chunkSize = 0x8000
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
