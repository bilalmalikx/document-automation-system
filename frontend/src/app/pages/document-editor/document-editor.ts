import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../../components/header/header';
import { Panel1Current } from '../../components/panel1-current/panel1-current';
import { Panel2Editor } from '../../components/panel2-editor/panel2-editor';
import { Panel3Preview } from '../../components/panel3-preview/panel3-preview';
import { Toast } from '../../components/toast/toast';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-document-editor',
  imports: [CommonModule, FormsModule, Header, Panel1Current, Panel2Editor, Panel3Preview, Toast],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css'
})
export class DocumentEditor implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  templateId = signal<string>('');
  content = signal<string>('');
  editorContent = signal<string>('');
  placeholders = signal<string[]>([]);
  saving = signal(false);
  generating = signal(false);
  showGenerateModal = signal(false);
  charCount = signal(0);
  lineCount = signal(0);
  formData: Record<string, string> = {};
  
  ngOnInit() {
    this.loadTemplates();
  }
  
  loadTemplates() {
    this.api.getTemplates().subscribe({
      next: (templates) => {
        if (templates.length > 0) {
          this.templateId.set(templates[0].id);
          this.loadTemplateContent(templates[0].id);
        }
      },
      error: () => {
        this.toast.error('Failed to load templates');
      }
    });
  }
  
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
        this.toast.success('Template loaded');
      },
      error: () => {
        this.toast.error('Failed to load template');
      }
    });
  }
  
  onEditorChange(content: string) {
    this.editorContent.set(content);
    this.updateStats(content);
  }
  
  onPlaceholdersChange(phs: string[]) {
    this.placeholders.set(phs);
    this.initFormData(phs);
  }
  
  initFormData(phs: string[]) {
    this.formData = {};
    for (const ph of phs) {
      const lower = ph.toLowerCase();
      if (lower.includes('date')) {
        this.formData[ph] = new Date().toLocaleDateString();
      } else if (lower.includes('name')) {
        this.formData[ph] = 'Sample Name';
      } else if (lower.includes('email')) {
        this.formData[ph] = 'sample@example.com';
      } else if (lower.includes('company')) {
        this.formData[ph] = 'Acme Corporation';
      } else {
        this.formData[ph] = '';
      }
    }
  }
  
  updateStats(content: string) {
    this.charCount.set(content.length);
    this.lineCount.set(content.split('\n').length);
  }
  
  saveChanges() {
    const id = this.templateId();
    const content = this.editorContent();
    
    if (!id) {
      this.toast.warn('No template selected');
      return;
    }
    
    this.saving.set(true);
    
    this.api.updateTemplateContent(id, content).subscribe({
      next: () => {
        this.content.set(content);
        this.toast.success('Saved successfully');
        this.saving.set(false);
      },
      error: () => {
        this.toast.error('Save failed');
        this.saving.set(false);
      }
    });
  }
  
  openGenerateModal() {
    if (!this.templateId()) {
      this.toast.warn('No template selected');
      return;
    }
    this.showGenerateModal.set(true);
  }
  
  closeGenerateModal() {
    this.showGenerateModal.set(false);
  }
  
  generateDocument() {
    const id = this.templateId();
    
    if (!id) {
      this.toast.error('No template selected');
      return;
    }
    
    this.generating.set(true);
    
    this.api.generateDocument({ 
      template_id: id, 
      data: this.formData 
    }).subscribe({
      next: (res) => {
        if (res.docx_url) {
          const downloadUrl = this.api.getDownloadUrl(res.docx_url);
          window.open(downloadUrl, '_blank');
          this.toast.success('Document generated!');
        }
        this.closeGenerateModal();
        this.generating.set(false);
      },
      error: (err) => {
        this.toast.error('Generation failed: ' + (err.error?.detail || err.message));
        this.generating.set(false);
      }
    });
  }
  
  refreshPreview() {
    const content = this.editorContent();
    if (content) {
      this.toast.info('Refreshing preview...');
    }
  }
}