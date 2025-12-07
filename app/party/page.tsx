"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PartyPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to default section
    router.replace("/party/counterparties")
  }, [router])

  return null
}
