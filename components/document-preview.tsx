"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DocumentPreviewProps {
  text: string
  templateName: string
  onClose: () => void
}

export function DocumentPreview({ text, templateName, onClose }: DocumentPreviewProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Предпросмотр: {templateName}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <div className="bg-white text-black p-8 rounded-lg shadow-inner min-h-[500px]">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{text}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
