import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  WeightEntryDto,
  CreateWeightEntryRequest,
} from '../models/weight.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WeightService {
  private http = inject(HttpClient);

  addWeightEntry(
    request: CreateWeightEntryRequest,
  ): Observable<WeightEntryDto> {
    return this.http.post<WeightEntryDto>(
      `${environment.apiUrl}/weight`,
      request,
    );
  }

  getWeightHistory(
    startDate?: string,
    endDate?: string,
  ): Observable<WeightEntryDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<WeightEntryDto[]>(`${environment.apiUrl}/weight`, {
      params,
    });
  }

  deleteWeightEntry(entryId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/weight/${entryId}`);
  }
}
