"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HRPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Перенаправляем на раздел по умолчанию
    router.replace("/hr/struktura")
  }, [router])

  return null
}

