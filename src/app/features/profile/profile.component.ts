import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import {catchError, of} from 'rxjs';

import {UserService} from '../../core/services/user.service';
import {AuthService} from '../../core/services/auth.service';
import {LoadingSpinnerComponent} from '../../shared/components/loading-spinner/loading-spinner.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {DeleteAccountComponent} from './delete-account/delete-account.component';
import {User} from '../../core/models/auth.models';
import {format, parseISO} from 'date-fns';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    ChangePasswordComponent,
    DeleteAccountComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  originalFormValues: any = {};
  showChangePassword = false;
  showDeleteAccount = false;
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      currentWeight: [null, [Validators.min(0), Validators.max(1000)]],
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          currentWeight: user.currentWeight,
        });
        this.originalFormValues = this.profileForm.value;
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid && this.hasChanges()) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.userService
        .updateProfile(this.profileForm.value)
        .pipe(
          catchError((error) => {
            this.errorMessage =
              error.error?.message ||
              'Failed to update profile. Please try again.';
            this.isSubmitting = false;
            return of(null);
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.successMessage = 'Profile updated successfully!';
            this.originalFormValues = this.profileForm.value;

            const updatedUser = {...this.currentUser!, ...response};
            this.authService.pushUserToSubject(updatedUser);

            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          }
          this.isSubmitting = false;
        });
    }
  }

  resetForm() {
    this.profileForm.patchValue(this.originalFormValues);
    this.successMessage = '';
    this.errorMessage = '';
  }

  hasChanges(): boolean {
    const currentValues = this.profileForm.value;
    return (
      JSON.stringify(currentValues) !== JSON.stringify(this.originalFormValues)
    );
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (
      (first + last).toUpperCase() ||
      this.currentUser.email.charAt(0).toUpperCase()
    );
  }

  formatMemberSince(): string {
    if (!this.currentUser) return '';
    return format(parseISO(this.currentUser.createdAt), 'MMMM yyyy');
  }

  toggleChangePassword(): void {
    this.showChangePassword = !this.showChangePassword;
    if (this.showChangePassword) {
      this.showDeleteAccount = false;
    }
  }

  toggleDeleteAccount(): void {
    this.showDeleteAccount = !this.showDeleteAccount;
    if (this.showDeleteAccount) {
      this.showChangePassword = false;
    }
  }
}
