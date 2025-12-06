import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = "https://upxqxlmfbpxtewcpxfut.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVweHF4bG1mYnB4dGV3Y3B4ZnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDEyNDEsImV4cCI6MjA4MDU3NzI0MX0.MOFeMOruc4lbNbHB7Z-nQKbnYn5WLoOgfW_O1Rbh0s0"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

export type SupabaseClient = ReturnType<typeof createBrowserClient>
