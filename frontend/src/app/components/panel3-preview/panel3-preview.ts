import { Component, input, signal, effect, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-panel3-preview',
  imports: [CommonModule],
  templateUrl: './panel3-preview.html',
  styleUrl: './panel3-preview.css'
})
export class Panel3Preview {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  private api = inject(ApiService);
  
  content = input<string>('');
  placeholders = input<string[]>([]);
  
  loading = signal(false);
  previewUrl = signal('No template loaded');
  private previewTimeout: any = null;
  
  constructor() {
    effect(() => {
      const newContent = this.content();
      if (newContent && newContent.trim()) {
        if (this.previewTimeout) clearTimeout(this.previewTimeout);
        this.previewTimeout = setTimeout(() => {
          this.updatePreview(newContent);
        }, 500);
      }
    });
  }
  
  private buildSampleData(): Record<string, string> {
    const data: Record<string, string> = {};
    for (const ph of this.placeholders()) {
      const lower = ph.toLowerCase();
      if (lower.includes('date')) data[ph] = new Date().toLocaleDateString();
      else if (lower.includes('name')) data[ph] = 'Sample Name';
      else if (lower.includes('email')) data[ph] = 'sample@example.com';
      else if (lower.includes('company')) data[ph] = 'Acme Corporation';
      else data[ph] = `[${ph}]`;
    }
    return data;
  }
  
  updatePreview(htmlContent: string) {
    if (!htmlContent || !htmlContent.trim()) return;
    
    this.loading.set(true);
    this.previewUrl.set('Rendering...');
    
    const data = this.buildSampleData();
    
    this.api.previewDocument({ content: htmlContent, data }).subscribe({
      next: (res) => {
        this.renderFrame(res.rendered_html);
        this.loading.set(false);
        this.previewUrl.set('Preview ready');
      },
      error: () => {
        this.renderFrame(`<div style="padding:20px;color:#f87171;">Preview Error</div>`);
        this.loading.set(false);
        this.previewUrl.set('Preview error');
      }
    });
  }
  
  private renderFrame(html: string) {
    const frame = this.previewFrame?.nativeElement;
    if (!frame) return;
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:system-ui;padding:24px;margin:0;}</style></head><body>${html}</body></html>`);
      doc.close();
    }
  }
  
  forceRefresh() {
    const currentContent = this.content();
    if (currentContent) this.updatePreview(currentContent);
  }
}