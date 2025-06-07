import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  changePasswordForm: FormGroup;
  isLoading = false;
  message = '';
  isSuccess = false;

  constructor() {
    this.changePasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Pre-fill email if user is logged in
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.changePasswordForm.patchValue({ email: currentUser.email });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.hasError('passwordMismatch')) {
      delete confirmPassword.errors?.['passwordMismatch'];
      if (Object.keys(confirmPassword.errors || {}).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.message = '';
      
      const request: ChangePasswordRequest = {
        email: this.changePasswordForm.value.email,
        oldPassword: this.changePasswordForm.value.oldPassword,
        newPassword: this.changePasswordForm.value.newPassword
      };

      this.authService.changePassword(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = response.message || 'Password changed successfully!';
          this.changePasswordForm.reset();
          
          // Pre-fill email again
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.changePasswordForm.patchValue({ email: currentUser.email });
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.isSuccess = false;
          this.message = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    }
  }

  get email() {
    return this.changePasswordForm.get('email');
  }

  get oldPassword() {
    return this.changePasswordForm.get('oldPassword');
  }

  get newPassword() {
    return this.changePasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword');
  }
}
