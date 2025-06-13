import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {catchError, of} from 'rxjs';

import {AuthService} from '../../../core/services/auth.service';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService
        .login(this.loginForm.value)
        .pipe(
          catchError((error) => {
            this.errorMessage =
              error.error?.message || 'Login failed. Please try again.';
            this.isLoading = false;
            return of(null);
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.router.navigate(['/dashboard']);
          }
          this.isLoading = false;
        });
    }
  }
}
