"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FinancePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default tab
    router.replace("/deals/analytics")
  }, [router])

  return null
}

