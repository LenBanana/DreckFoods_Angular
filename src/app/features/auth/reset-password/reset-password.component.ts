import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { ResetPasswordRequest } from '../../../core/models/auth.models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;
  isLoading = false;
  message = '';
  isSuccess = false;
  email = '';
  resetCode = '';

  constructor() {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.resetCode = params['code'] || '';
      
      if (!this.email || !this.resetCode) {
        this.message = 'Invalid reset link. Please request a new password reset.';
        this.isSuccess = false;
      }
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('newPassword');
    const confirmPassword = group.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
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
    if (this.resetPasswordForm.valid && this.email && this.resetCode) {
      this.isLoading = true;
      const request: ResetPasswordRequest = {
        email: this.email,
        resetCode: this.resetCode,
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.authService.resetPassword(request).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.message = response.message || 'Password reset successfully! You can now login with your new password.';
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.isSuccess = false;
          this.message = error.error?.message || 'An error occurred. Please try again.';
        }
      });
    }
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }
}
