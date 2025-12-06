-- Create templates table for storing template metadata
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  variables TEXT[] NOT NULL,
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(id)
);

-- Create index for faster queries by document_type
CREATE INDEX IF NOT EXISTS idx_templates_document_type ON templates(document_type);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Create storage bucket for templates if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('templates', 'templates', true, 10485760, ARRAY['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;
