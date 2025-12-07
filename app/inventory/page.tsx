"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InventoryPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default section
    router.replace("/inventory/warehouse")
  }, [router])

  return null
}
