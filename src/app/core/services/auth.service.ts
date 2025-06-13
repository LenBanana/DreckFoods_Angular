import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {Router} from '@angular/router';

import {
  AuthResponse,
  ChangePasswordRequest,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from '../models/auth.models';
import {environment} from '../../../environments/environment';
import {TokenService} from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private tokenService = inject(TokenService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private userKey = 'food_tracker_user';

  constructor() {
    this.initializeAuth();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          this.setAuthData(response.token, response.user);
          this.refreshUserProfile();
        }),
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${environment.apiUrl}/auth/register`,
      request,
    );
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/confirm-email`,
      request,
    );
  }

  changePassword(
    request: ChangePasswordRequest,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/change-password`,
      request,
    );
  }

  forgotPassword(
    request: ForgotPasswordRequest,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/forgot-password`,
      request,
    );
  }

  resetPassword(
    request: ResetPasswordRequest,
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/reset-password`,
      request,
    );
  }

  deleteAccount(): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${environment.apiUrl}/auth/delete-account`)
      .pipe(
        tap(() => {
          this.logout();
        }),
      );
  }

  logout(): void {
    this.tokenService.removeToken();
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  isAuthenticated(): boolean {
    return this.tokenService.isTokenValid();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`).pipe(
      tap((user: User) => {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }),
    );
  }

  pushUserToSubject(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private initializeAuth(): void {
    const storedUser = localStorage.getItem(this.userKey);
    const token = this.tokenService.getToken();

    if (storedUser && token && this.tokenService.isTokenValid()) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);

        if (navigator.onLine !== false) {
          this.refreshUserProfile();
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    } else {
      this.tokenService.removeToken();
      localStorage.removeItem(this.userKey);
      this.currentUserSubject.next(null);
    }
  }

  private refreshUserProfile(): void {
    this.http.get<User>(`${environment.apiUrl}/user/profile`).subscribe({
      next: (user: User) => {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
      },
      error: (err: any) => {
        console.error('Error fetching user profile:', err);

        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      },
    });
  }

  private setAuthData(token: string, user: User): void {
    this.tokenService.setToken(token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
