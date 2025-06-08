import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface UpdateUserProfileRequest {
  firstName: string;
  lastName: string;
  currentWeight?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`).pipe(
      catchError((err) => {
        console.error('Error fetching profile:', err);
        if (err.status === 404) {
          this.authService.logout();
        }
        return throwError(err);
      })
    );
  }

  updateProfile(request: UpdateUserProfileRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/profile`, request).pipe(
      catchError((err) => {
        console.error('Error updating profile:', err);
        if (err.status === 404) {
          this.authService.logout();
        }
        return throwError(err);
      })
    );
  }
}
