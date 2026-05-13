import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel1-current',
  imports: [CommonModule],
  templateUrl: './panel1-current.html',
  styleUrl: './panel1-current.css'
})
export class Panel1Current {
  content = input<string>('');
  
  lineNumbers = computed(() => {
    const lines = (this.content() || '').split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });
}