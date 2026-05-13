import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-generate-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-modal.html',
  styleUrl: './generate-modal.css'
})
export class GenerateModal {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  templateId = input<string>('');
  placeholders = input<string[]>([]);
  close = output<void>();
  
  formData: Record<string, string> = {};
  generating = signal(false);
  
  constructor() {
    effect(() => {
      const phs = this.placeholders();
      this.formData = {};
      for (const ph of phs) {
        const lower = ph.toLowerCase();
        if (lower.includes('date')) this.formData[ph] = new Date().toLocaleDateString();
        else if (lower.includes('name')) this.formData[ph] = 'Sample Name';
        else if (lower.includes('email')) this.formData[ph] = 'sample@example.com';
        else if (lower.includes('company')) this.formData[ph] = 'Acme Corp';
        else this.formData[ph] = '';
      }
    });
  }
  
  generate() {
    const id = this.templateId();
    if (!id) return;
    
    this.generating.set(true);
    
    this.api.generateDocument({ template_id: id, data: this.formData }).subscribe({
      next: (res) => {
        if (res.docx_url) {
          window.open(this.api.getDownloadUrl(res.docx_url), '_blank');
          this.toast.success('Document generated');
        }
        this.generating.set(false);
        this.close.emit();
      },
      error: () => {
        this.toast.error('Generation failed');
        this.generating.set(false);
      }
    });
  }
}