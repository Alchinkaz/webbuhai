export interface DocumentType {
  id: string
  name: string
  description: string
  icon?: string
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: "invoice",
    name: "Счет на оплату",
    description: "Создание счета на оплату для клиента",
  },
  // Add more document types here in the future
]

export function getDocumentType(id: string): DocumentType | undefined {
  return DOCUMENT_TYPES.find((type) => type.id === id)
}

export function getAllDocumentTypes(): DocumentType[] {
  return DOCUMENT_TYPES
}
