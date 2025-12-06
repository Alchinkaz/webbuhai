import { getTemplate } from "@/lib/storage"
import { downloadTemplateFromSupabase } from "@/lib/storage-supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const template = await getTemplate(params.id)

    if (!template) {
      return new Response("Template not found", { status: 404 })
    }

    let content: ArrayBuffer

    if (template.url) {
      content = await downloadTemplateFromSupabase(template.url)
    } else if (template.content) {
      content = template.content
    } else {
      return new Response("Template content not available", { status: 404 })
    }

    return new Response(content, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${template.fileName}"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error downloading template:", error)
    return new Response("Error downloading template", { status: 500 })
  }
}
