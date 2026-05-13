import { Component, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';
import { Template } from '../../models/template.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  // Signals
  templates = signal<Template[]>([]);
  selectedTemplateId = signal<string>('');
  loading = signal(false);
  
  // Upload modal state
  isUploadModalOpen = signal(false);
  uploadTemplateName = signal('');
  uploadTemplateType = signal<'docx' | 'html'>('docx');
  uploadFile = signal<File | null>(null);
  isUploading = signal(false);
  
  // Outputs
  templateSelected = output<string>();
  templateUploaded = output<void>();
  
  ngOnInit() {
    this.loadTemplates();
  }
  
  loadTemplates() {
    this.loading.set(true);
    this.api.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Failed to load templates');
      }
    });
  }
  
  onTemplateChange() {
    const id = this.selectedTemplateId();
    if (id) {
      this.templateSelected.emit(id);
    }
  }
  
  // Upload Modal Methods
  openUploadModal() {
    this.resetUploadForm();
    this.isUploadModalOpen.set(true);
  }
  
  closeUploadModal() {
    this.isUploadModalOpen.set(false);
    this.resetUploadForm();
  }
  
  resetUploadForm() {
    this.uploadTemplateName.set('');
    this.uploadTemplateType.set('docx');
    this.uploadFile.set(null);
    this.isUploading.set(false);
  }
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.uploadFile.set(file);
      
      // Auto-detect type from file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        this.uploadTemplateType.set('docx');
      } else if (ext === 'html') {
        this.uploadTemplateType.set('html');
      }
    }
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];
      this.uploadFile.set(file);
      
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') {
        this.uploadTemplateType.set('docx');
      } else if (ext === 'html') {
        this.uploadTemplateType.set('html');
      }
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  uploadTemplate() {
    const name = this.uploadTemplateName().trim();
    const file = this.uploadFile();
    
    if (!name) {
      this.toast.warn('Please enter template name');
      return;
    }
    
    if (!file) {
      this.toast.warn('Please select a file');
      return;
    }
    
    this.isUploading.set(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    
    const endpoint = this.uploadTemplateType() === 'docx' 
      ? '/templates/upload' 
      : '/templates/upload-html';
    
    this.api.uploadTemplate(formData, this.uploadTemplateType()).subscribe({
      next: (res) => {
        this.toast.success(`Template "${name}" uploaded successfully!`);
        this.closeUploadModal();
        this.loadTemplates();
        this.templateUploaded.emit();
        
        // Auto-select the newly uploaded template
        if (res.template_id) {
          this.selectedTemplateId.set(res.template_id);
          this.templateSelected.emit(res.template_id);
        }
        this.isUploading.set(false);
      },
      error: (err) => {
        this.toast.error('Upload failed: ' + (err.error?.detail || err.message));
        this.isUploading.set(false);
      }
    });
  }
}