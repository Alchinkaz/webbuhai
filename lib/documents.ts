export type SavedDocument = {
  id: string
  name: string
  templateId: string
  documentType: string // Added document type field
  date: string // Added date field
  counterparty: string // Added counterparty field
  status: string // Added status field
  values: Record<string, string>
  tableRows: Array<{
    id: string
    code: string
    name: string
    quantity: string
    unit: string
    price: string
    total: string
  }>
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "documents"

export async function getDocuments(): Promise<SavedDocument[]> {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const docs = JSON.parse(raw)
    return Array.isArray(docs) ? docs : []
  } catch {
    return []
  }
}

export async function getDocumentById(id: string): Promise<SavedDocument | null> {
  const all = await getDocuments()
  return all.find((d) => d.id === id) || null
}

export async function saveDocument(doc: Omit<SavedDocument, "id" | "createdAt" | "updatedAt">): Promise<SavedDocument> {
  const all = await getDocuments()
  const now = new Date().toISOString()
  const newDoc: SavedDocument = { id: `doc-${Date.now()}`, createdAt: now, updatedAt: now, ...doc }
  all.unshift(newDoc)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  if (typeof window !== "undefined") window.dispatchEvent(new Event("documents-updated"))
  return newDoc
}

export async function updateDocument(id: string, patch: Partial<SavedDocument>): Promise<SavedDocument | null> {
  const all = await getDocuments()
  const idx = all.findIndex((d) => d.id === id)
  if (idx === -1) return null
  const updated: SavedDocument = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  all[idx] = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  if (typeof window !== "undefined") window.dispatchEvent(new Event("documents-updated"))
  return updated
}

export async function deleteDocument(id: string): Promise<boolean> {
  const all = await getDocuments()
  const filtered = all.filter((d) => d.id !== id)
  if (filtered.length === all.length) return false // Document not found
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  if (typeof window !== "undefined") window.dispatchEvent(new Event("documents-updated"))
  return true
}
