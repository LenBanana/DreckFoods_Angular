import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  ConfirmEmailRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'food_tracker_token';
  private userKey = 'food_tracker_user';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => {
          this.setAuthData(response.token, response.user);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request);
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${environment.apiUrl}/auth/confirm-email`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${environment.apiUrl}/auth/change-password`, request);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${environment.apiUrl}/auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${environment.apiUrl}/auth/reset-password`, request);
  }

  deleteAccount(): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${environment.apiUrl}/auth/delete-account`)
      .pipe(
        tap(() => {
          this.logout();
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  pushUserToSubject(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}
