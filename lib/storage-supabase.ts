import { getSupabaseClient } from "./supabase-client"
import type { Template } from "./storage"

export async function saveTemplateToSupabase(
  template: Omit<Template, "content">,
  fileContent: ArrayBuffer,
): Promise<Template> {
  const supabase = getSupabaseClient()

  const fileName = `templates/${template.documentType}/${template.id}.docx`
  const fileBlob = new Blob([fileContent], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  })

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("templates")
    .upload(fileName, fileBlob, { upsert: true })

  if (uploadError) {
    console.error("[v0] Error uploading template file:", uploadError)
    throw new Error("Failed to upload template file")
  }

  const { data } = supabase.storage.from("templates").getPublicUrl(fileName)

  const { error: dbError } = await supabase.from("templates").insert({
    id: template.id,
    name: template.name,
    file_name: template.fileName,
    document_type: template.documentType,
    variables: template.variables,
    storage_path: fileName,
    file_url: data.publicUrl,
    created_at: template.createdAt,
  })

  if (dbError) {
    console.error("[v0] Error saving template metadata:", dbError)
    // Try to clean up the uploaded file
    await supabase.storage.from("templates").remove([fileName])
    throw new Error("Failed to save template metadata")
  }

  return {
    ...template,
    url: data.publicUrl,
  }
}

export async function listTemplatesFromSupabase(): Promise<Template[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("templates").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching templates:", error)
    return []
  }

  return (
    data?.map((t) => ({
      id: t.id,
      name: t.name,
      fileName: t.file_name,
      variables: t.variables || [],
      url: t.file_url,
      createdAt: t.created_at,
      documentType: t.document_type,
    })) || []
  )
}

export async function getTemplateFromSupabase(id: string): Promise<Template | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()

  if (error || !data) {
    console.error("[v0] Error fetching template:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    fileName: data.file_name,
    variables: data.variables || [],
    url: data.file_url,
    createdAt: data.created_at,
    documentType: data.document_type,
  }
}

export async function downloadTemplateFromSupabase(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to download template")
  }
  return response.arrayBuffer()
}

export async function deleteTemplateFromSupabase(id: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { data: template, error: fetchError } = await supabase
    .from("templates")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (fetchError || !template) {
    console.error("[v0] Error fetching template for deletion:", fetchError)
    throw new Error("Template not found")
  }

  const { error: storageError } = await supabase.storage.from("templates").remove([template.storage_path])

  if (storageError) {
    console.error("[v0] Error deleting template file:", storageError)
  }

  const { error: dbError } = await supabase.from("templates").delete().eq("id", id)

  if (dbError) {
    console.error("[v0] Error deleting template metadata:", dbError)
    throw new Error("Failed to delete template")
  }
}
