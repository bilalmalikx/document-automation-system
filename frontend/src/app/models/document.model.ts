export interface GenerateRequest {
  template_id: string;
  data: Record<string, any>;
}

export interface GenerateResponse {
  document_id: string;
  docx_url: string;
}

export interface PreviewRequest {
  content: string;
  data: Record<string, any>;
}

export interface PreviewResponse {
  rendered_html: string;
}

export interface UpdateContentRequest {
  content: string;
}

export interface UpdateContentResponse {
  message: string;
  template_id: string;
  updated_at: string;
}

export interface PreviewResponse {
  rendered_html: string;
}