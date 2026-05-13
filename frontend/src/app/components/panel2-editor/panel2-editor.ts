import { Component, input, output, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-panel2-editor',
  imports: [CommonModule, FormsModule],
  templateUrl: './panel2-editor.html',
  styleUrl: './panel2-editor.css'
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
    console.log('Extracting placeholders from:', text); // Debug log
    
    const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    const found = new Set<string>();
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      console.log('Found placeholder:', match[1]); // Debug log
      found.add(match[1].trim());
    }
    
    const placeholders = Array.from(found);
    console.log('All placeholders:', placeholders); // Debug log
    
    this.placeholders.set(placeholders);
    this.placeholdersChange.emit(placeholders);
  }
}