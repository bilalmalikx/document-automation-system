import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-upload-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload-modal.html',
  styleUrl: './upload-modal.css'
})
export class UploadModal {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  close = output<void>();
  uploaded = output<void>();
  
  templateName = signal('');
  templateType = signal<'docx' | 'html'>('docx');
  selectedFile: File | null = null;
  uploading = signal(false);
  
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const ext = this.selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'docx') this.templateType.set('docx');
      else if (ext === 'html') this.templateType.set('html');
    }
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.selectedFile = files[0];
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  
  upload() {
    if (!this.templateName()) {
      this.toast.warn('Please enter template name');
      return;
    }
    if (!this.selectedFile) {
      this.toast.warn('Please select a file');
      return;
    }
    
    this.uploading.set(true);
    const formData = new FormData();
    formData.append('name', this.templateName());
    formData.append('file', this.selectedFile);
    
    this.api.uploadTemplate(formData, this.templateType()).subscribe({
      next: () => {
        this.toast.success('Template uploaded successfully');
        this.uploaded.emit();
        this.close.emit();
        this.uploading.set(false);
      },
      error: () => {
        this.toast.error('Upload failed');
        this.uploading.set(false);
      }
    });
  }
}