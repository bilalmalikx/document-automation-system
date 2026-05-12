import { Component, input, signal, effect, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-panel3-preview',
  imports: [CommonModule],
  templateUrl: './panel3-preview.html',
  styleUrl: './panel3-preview.css',
})
export class Panel3Preview implements OnInit {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;
  
  private api = inject(ApiService);
  private toast = inject(ToastService);
  
  // ✅ Input properties properly defined
  content = input<string>('');
  placeholders = input<string[]>([]);
  
  loading = signal(false);
  previewUrl = signal('No template loaded');
  private previewTimeout: any = null;
  
  ngOnInit() {
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
  
  private buildSampleData(placeholders: string[]): Record<string, string> {
    const data: Record<string, string> = {};
    for (const ph of placeholders) {
      const lower = ph.toLowerCase();
      if (lower.includes('date')) data[ph] = new Date().toLocaleDateString();
      else if (lower.includes('name')) data[ph] = 'Sample Name';
      else if (lower.includes('email')) data[ph] = 'sample@example.com';
      else if (lower.includes('company')) data[ph] = 'Acme Corporation';
      else if (lower.includes('address')) data[ph] = '123 Business Street';
      else if (lower.includes('phone')) data[ph] = '+1 (555) 123-4567';
      else data[ph] = `[Sample ${ph}]`;
    }
    return data;
  }
  
  updatePreview(htmlContent: string) {
    if (!htmlContent || !htmlContent.trim()) {
      return;
    }
    
    this.loading.set(true);
    this.previewUrl.set('Rendering preview...');
    
    const currentPlaceholders = this.placeholders();
    const data = this.buildSampleData(currentPlaceholders);
    
    this.api.previewDocument({ content: htmlContent, data }).subscribe({
      next: (res) => {
        this.renderFrame(res.rendered_html);
        this.loading.set(false);
        this.previewUrl.set('Preview ready ✓');
      },
      error: (err) => {
        console.error('Preview error:', err);
        this.renderFrame(`
          <div style="padding: 20px; color: #dc2626; background: #fef2f2; border-radius: 8px; margin: 20px;">
            <strong>Preview API Error:</strong> ${err.message}
            <hr style="margin: 12px 0;">
            <details>
              <summary>Showing raw HTML</summary>
              <pre style="background: #f1f5f9; padding: 12px; overflow-x: auto; font-size: 12px;">${this.escapeHtml(htmlContent)}</pre>
            </details>
          </div>
        `);
        this.loading.set(false);
        this.previewUrl.set('Preview error');
        this.toast.show('Preview API error: ' + err.message, 'error');
      }
    });
  }
  
  private escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }
  
  private renderFrame(html: string) {
    const frame = this.previewFrame?.nativeElement;
    if (!frame) return;
    
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                padding: 24px 32px; 
                margin: 0; 
                background: #ffffff; 
                color: #1a1a2e;
              }
              img { max-width: 100%; height: auto; }
              table { border-collapse: collapse; width: 100%; margin: 16px 0; }
              th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; vertical-align: top; }
              th { background: #f8fafc; font-weight: 600; }
              h1, h2, h3, h4 { margin: 20px 0 12px; line-height: 1.3; }
              h1 { font-size: 28px; }
              h2 { font-size: 22px; }
              h3 { font-size: 18px; }
              p { margin: 10px 0; }
              ul, ol { margin: 10px 0; padding-left: 24px; }
              code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
              pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; }
              blockquote { border-left: 4px solid #7c5af6; margin: 16px 0; padding-left: 20px; color: #475569; }
              hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      doc.close();
    }
  }
  
  forceRefresh() {
    const currentContent = this.content();
    if (currentContent && currentContent.trim()) {
      this.updatePreview(currentContent);
    }
  }
}
