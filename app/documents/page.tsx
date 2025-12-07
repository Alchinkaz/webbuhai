"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default section
    router.replace("/documents/incoming")
  }, [router])

  return null
}
