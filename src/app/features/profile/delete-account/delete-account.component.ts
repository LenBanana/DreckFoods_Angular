import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.scss'
})
export class DeleteAccountComponent {
  private authService = inject(AuthService);
  @Output() cancelDeletion: EventEmitter<void> = new EventEmitter<void>();

  isLoading = false;
  message = '';
  isSuccess = false;
  showConfirmation = false;

  showDeleteConfirmation(): void {
    this.showConfirmation = true;
    this.message = '';
  }

  cancelDelete(): void {
    this.showConfirmation = false;
    this.message = '';
    this.cancelDeletion.emit();
  }

  confirmDelete(): void {
    this.isLoading = true;
    this.message = '';

    this.authService.deleteAccount().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = response.message || 'Account deleted successfully.';
        this.showConfirmation = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.isSuccess = false;
        this.message = error.error?.message || 'An error occurred while deleting your account. Please try again.';
        this.showConfirmation = false;
      }
    });
  }
}
