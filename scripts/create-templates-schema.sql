-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_document_type ON templates(document_type);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Create storage bucket for templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('templates', 'templates', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for templates bucket
CREATE POLICY "Allow public read access to templates" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'templates');

CREATE POLICY "Allow authenticated upload to templates" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'templates');

CREATE POLICY "Allow users to delete their templates" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'templates');
