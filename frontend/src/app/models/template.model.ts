export interface Template {
  id: string;
  name: string;
  description?: string;
  template_type: 'docx' | 'html';
}

export interface TemplateContent {
  template_id: string;
  name: string;
  template_type: string;
  content: string;
}

export interface TemplateSchema {
  template_id: string;
  template_name: string;
  fields: TemplateField[];
}

export interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'email' | 'number' | 'select';
  required: boolean;
  options?: string[];
}