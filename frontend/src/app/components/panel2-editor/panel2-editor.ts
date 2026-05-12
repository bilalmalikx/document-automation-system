import { Component, input, output, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-panel2-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './panel2-editor.html',
  styleUrls: ['./panel2-editor.css']
})
export class Panel2Editor {
  @ViewChild('editor') editorRef!: ElementRef<HTMLTextAreaElement>;
  
  content = input<string>('');
  contentChange = output<string>();
  placeholdersChange = output<string[]>();
  
  editorContent = signal('');
  placeholders = signal<string[]>([]);
  private debounceTimer: any = null;
  
  lineNumbers = computed(() => {
    const lines = (this.editorContent() || '').split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });
  
  constructor() {
    effect(() => {
      const newContent = this.content();
      if (newContent !== this.editorContent()) {
        this.editorContent.set(newContent);
        this.extractPlaceholders(newContent);
      }
    });
  }
  
  onContentChange() {
    const value = this.editorContent();
    this.extractPlaceholders(value);
    
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.contentChange.emit(value);
    }, 500);
  }
  
  extractPlaceholders(text: string) {
    const regex = /\{\{\s*([^}]+?)\s*\}\}/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
      found.add(match[1].trim());
    }
    const placeholders = Array.from(found);
    this.placeholders.set(placeholders);
    this.placeholdersChange.emit(placeholders);
  }
}