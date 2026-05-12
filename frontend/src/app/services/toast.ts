import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warn';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  getToasts() {
    return this.toasts.asReadonly();
  }

  show(message: string, type: ToastMessage['type'] = 'info') {
    const id = this.counter++;
    const toast: ToastMessage = { id, message, type };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}