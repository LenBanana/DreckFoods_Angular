import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TimelineResponse } from '../models/timeline.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TimelineService {
  private http = inject(HttpClient);

  getTimeline(
    startDate: string,
    endDate: string,
  ): Observable<TimelineResponse> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<TimelineResponse>(`${environment.apiUrl}/timeline`, {
      params,
    });
  }
}
