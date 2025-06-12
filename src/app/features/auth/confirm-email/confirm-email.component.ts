import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.scss'],
})
export class ConfirmEmailComponent implements OnInit {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = true;
  confirmationSuccess = false;
  errorMessage = '';

  ngOnInit() {
    console.log('ConfirmEmailComponent initialized');
    this.route.queryParams.subscribe(params => {
      const userId = params['userId'];
      const token = params['token'];

      if (!userId || !token) {
        this.isLoading = false;
        this.errorMessage = 'Invalid confirmation link. Please check your email and try again.';
        return;
      }

      this.confirmEmail(Number(userId), token);
    });
  }

  private confirmEmail(userId: number, token: string) {
    this.authService.confirmEmail({ userId, token })
      .pipe(
        catchError(error => {
          this.errorMessage = error.error?.message || 'Email confirmation failed. The link may be expired or invalid.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        this.isLoading = false;
        if (response) {
          this.confirmationSuccess = true;
        }
      });
  }
}
