import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../../components/header/header';
import { Panel1Current } from '../../components/panel1-current/panel1-current';
import { Panel2Editor } from '../../components/panel2-editor/panel2-editor';
import { Panel3Preview } from '../../components/panel3-preview/panel3-preview';
import { Toast } from '../../components/toast/toast';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';
import { GenerateModal } from '../../components/generate-modal/generate-modal';

@Component({
  selector: 'app-document-editor',
  imports: [CommonModule, Header, Panel1Current, Panel2Editor, Panel3Preview, Toast, GenerateModal],
  templateUrl: './document-editor.html',
  styleUrl: './document-editor.css'
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
  showGenerateModal = signal(false);
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
        this.toast.success('Saved');
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
    this.toast.info('Generate feature coming soon');
  }
  
  closeGenerateModal() {
    this.showGenerateModal.set(false);
  }
  
  refreshPreview() {
    this.toast.info('Refreshing preview...');
  }
}