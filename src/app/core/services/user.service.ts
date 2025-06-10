import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

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

  getProfile(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/user/profile`);
  }

  updateProfile(request: UpdateUserProfileRequest): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/user/profile`, request);
  }
}
