import { Component, output, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Template } from '../../models/template.model';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private api = inject(ApiService);
  
  templates = signal<Template[]>([]);
  selectedTemplateId = signal<string>('');
  loading = signal(false);
  status = signal<'ok' | 'err' | 'busy'>('ok');
  statusMessage = signal('Ready');
  
  templateSelected = output<string>();
  
  ngOnInit() {
    this.loadTemplates();
  }
  
  loadTemplates() {
    this.loading.set(true);
    this.status.set('busy');
    this.statusMessage.set('Loading templates...');
    
    this.api.getTemplates().subscribe({
      next: (templates) => {
        this.templates.set(templates);
        this.status.set('ok');
        this.statusMessage.set(`${templates.length} templates ready`);
        this.loading.set(false);
      },
      error: () => {
        this.status.set('err');
        this.statusMessage.set('API unreachable');
        this.loading.set(false);
      }
    });
  }
  
  onTemplateChange() {
    const id = this.selectedTemplateId();
    if (id) {
      this.templateSelected.emit(id);
    }
  }
}