import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Template, TemplateContent, TemplateSchema } from '../models/template.model';
import { GenerateRequest, GenerateResponse, PreviewRequest, PreviewResponse, UpdateContentRequest, UpdateContentResponse } from '../models/document.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Templates
  getTemplates(): Observable<Template[]> {
    return this.http.get<Template[]>(`${this.apiUrl}/templates/`);
  }

  getTemplateContent(id: string): Observable<TemplateContent> {
    return this.http.get<TemplateContent>(`${this.apiUrl}/templates/${id}/content`);
  }

  getTemplateSchema(id: string): Observable<TemplateSchema> {
    return this.http.get<TemplateSchema>(`${this.apiUrl}/templates/${id}/schema`);
  }

  updateTemplateContent(id: string, content: string): Observable<UpdateContentResponse> {
    const body: UpdateContentRequest = { content };
    return this.http.put<UpdateContentResponse>(`${this.apiUrl}/templates/${id}/content`, body);
  }

  // Documents
  previewDocument(request: PreviewRequest): Observable<PreviewResponse> {
    return this.http.post<PreviewResponse>(`${this.apiUrl}/documents/preview`, request);
  }

  generateDocument(request: GenerateRequest): Observable<GenerateResponse> {
    return this.http.post<GenerateResponse>(`${this.apiUrl}/documents/generate`, request);
  }

  getDownloadUrl(filename: string): string {
    return `${this.apiUrl}/download/docx/${filename}`;
  }
}