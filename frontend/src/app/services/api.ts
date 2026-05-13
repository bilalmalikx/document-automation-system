import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Template, TemplateContent, TemplateSchema } from '.././models/template.model';
import { GenerateRequest, GenerateResponse, PreviewRequest, PreviewResponse } from '../models/document.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.apiUrl}/templates/`);
  }

  getTemplateContent(id: string): Observable<TemplateContent> {
    return this.http.get<TemplateContent>(`${this.apiUrl}/templates/${id}/content`);
  }

  getTemplateSchema(id: string): Observable<TemplateSchema> {
    return this.http.get<TemplateSchema>(`${this.apiUrl}/templates/${id}/schema`);
  }

  updateTemplateContent(id: string, content: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/templates/${id}/content`, { content });
  }

  uploadTemplate(formData: FormData, type: 'docx' | 'html'): Observable<any> {
    const endpoint = type === 'docx' ? '/templates/upload' : '/templates/upload-html';
    return this.http.post<any>(`${this.apiUrl}${endpoint}`, formData);
  }

  previewDocument(request: PreviewRequest): Observable<PreviewResponse> {
    return this.http.post<PreviewResponse>(`${this.apiUrl}/documents/preview`, request);
  }

  generateDocument(request: GenerateRequest): Observable<GenerateResponse> {
    return this.http.post<GenerateResponse>(`${this.apiUrl}/documents/generate`, request);
  }

  getDownloadUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.apiUrl}${path}`;
  }
}