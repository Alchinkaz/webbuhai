"use client"

import { useState, useEffect } from "react"
import { getTemplates, type Template } from "@/lib/storage"

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  const refreshTemplates = async () => {
    setLoading(true)
    try {
      const data = await getTemplates()
      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTemplates()

    // Sync across components/tabs when templates change
    const handler = () => {
      refreshTemplates()
    }
    if (typeof window !== "undefined") {
      window.addEventListener("templates-updated", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("templates-updated", handler)
      }
    }
  }, [])

  return { templates, loading, refreshTemplates }
}
