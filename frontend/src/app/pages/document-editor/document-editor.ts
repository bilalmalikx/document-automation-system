import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Panel1Current } from '../../components/panel1-current/panel1-current';
import { Panel2Editor } from '../../components/panel2-editor/panel2-editor';
import { Panel3Preview } from '../../components/panel3-preview/panel3-preview';
import { Toast } from '../../components/toast/toast';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-document-editor',
  imports: [CommonModule, Header, Panel1Current, Panel2Editor, Panel3Preview, Toast],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css',
})
export class DocumentEditor {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  templateId = signal<string>('');
  content = signal<string>('');
  editorContent = signal<string>('');
  placeholders = signal<string[]>([]);
  saving = signal(false);
  generating = signal(false);
  charCount = signal(0);
  lineCount = signal(0);
  
  onTemplateSelected(id: string) {
    this.templateId.set(id);
    this.loadTemplateContent(id);
  }
  
  loadTemplateContent(id: string) {
    this.api.getTemplateContent(id).subscribe({
      next: (res) => {
        this.content.set(res.content);
        this.editorContent.set(res.content);
        this.updateStats(res.content);
        this.toast.show('Template loaded successfully', 'success');
      },
      error: () => {
        this.toast.show('Failed to load template', 'error');
      }
    });
  }
  
  onEditorChange(newContent: string) {
    this.editorContent.set(newContent);
    this.updateStats(newContent);
  }
  
  // ✅ FIXED: Accept string array directly
  onPlaceholdersChange(phs: string[]) {
    this.placeholders.set(phs);
  }
  
  updateStats(text: string) {
    this.charCount.set(text.length);
    this.lineCount.set(text.split('\n').length);
  }
  
  saveChanges() {
    const id = this.templateId();
    const content = this.editorContent();
    
    if (!id) {
      this.toast.show('No template selected', 'warn');
      return;
    }
    
    this.saving.set(true);
    
    this.api.updateTemplateContent(id, content).subscribe({
      next: () => {
        this.content.set(content);
        this.toast.show('Template saved successfully', 'success');
        this.saving.set(false);
      },
      error: () => {
        this.toast.show('Save failed', 'error');
        this.saving.set(false);
      }
    });
  }
  
  generateDocument() {
    const id = this.templateId();
    const phs = this.placeholders();
    
    if (!id) {
      this.toast.show('No template selected', 'warn');
      return;
    }
    
    this.generating.set(true);
    
    const data: Record<string, string> = {};
    for (const ph of phs) {
      const lower = ph.toLowerCase();
      if (lower.includes('date')) data[ph] = new Date().toLocaleDateString();
      else if (lower.includes('name')) data[ph] = 'Sample Name';
      else if (lower.includes('email')) data[ph] = 'sample@example.com';
      else if (lower.includes('company')) data[ph] = 'Acme Corp';
      else data[ph] = `[${ph}]`;
    }
    
    this.api.generateDocument({ template_id: id, data }).subscribe({
      next: (res) => {
        if (res.docx_url) {
          window.open('http://localhost:8000' + res.docx_url, '_blank');
          this.toast.show('Document generated successfully', 'success');
        }
        this.generating.set(false);
      },
      error: () => {
        this.toast.show('Generation failed', 'error');
        this.generating.set(false);
      }
    });
  }
}