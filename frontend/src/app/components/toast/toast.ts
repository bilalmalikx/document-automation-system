import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-toast',
  imports: [CommonModule,FormsModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
toastService = inject(ToastService);
}
