"use client"

import { create } from "zustand"

type NavigationState = {
  currentPage: string
  selectedWarehouse: { id: string; name: string } | null
  selectedDepartment: { id: string; name: string } | null
  documentType: string | null
  setCurrentPage: (page: string) => void
  setSelectedWarehouse: (warehouse: { id: string; name: string } | null) => void
  setSelectedDepartment: (department: { id: string; name: string } | null) => void
  setDocumentType: (docType: string | null) => void
  navigateTo: (page: "create", templateId: string, documentId?: string) => void
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: "Home",
  selectedWarehouse: null,
  selectedDepartment: null,
  documentType: null,
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedWarehouse: (warehouse) => set({ selectedWarehouse: warehouse }),
  setSelectedDepartment: (department) => set({ selectedDepartment: department }),
  setDocumentType: (docType) => set({ documentType: docType }),
  navigateTo: (page, templateId, documentId) => {
    if (page === "create") {
      const url = documentId ? `/create/${templateId}?doc=${documentId}` : `/create/${templateId}`

      if (typeof window !== "undefined") {
        window.location.href = url
      }
    }
  },
}))
