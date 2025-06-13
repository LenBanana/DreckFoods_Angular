import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

import {
  CreateFoodEntryRequest,
  EditFoodEntryRequest,
  FoodEntryDto,
  FoodSearchDto,
  FoodSearchResponse,
} from '../models/food.models';
import {environment} from '../../../environments/environment';
import {FoodSortBy, SortDirection} from '../models/enums/sorting.models';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private http = inject(HttpClient);

  searchFoods(
    query: string,
    page: number = 1,
    pageSize: number = 12,
    sortBy: FoodSortBy = FoodSortBy.Name,
    sortDirection: SortDirection = SortDirection.Ascending,
  ): Observable<FoodSearchResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<FoodSearchResponse>(
      `${environment.apiUrl}/food/search`,
      {params},
    );
  }

  getPastEatenFoods(
    page: number = 1,
    pageSize: number = 12,
  ): Observable<FoodSearchResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<FoodSearchResponse>(
      `${environment.apiUrl}/food/past-eaten`,
      {params},
    );
  }

  getFoodCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/food/categories`);
  }

  getFoodById(foodId: number): Observable<FoodSearchDto> {
    return this.http.get<FoodSearchDto>(`${environment.apiUrl}/food/${foodId}`);
  }

  addFoodEntry(request: CreateFoodEntryRequest): Observable<FoodEntryDto> {
    return this.http.post<FoodEntryDto>(
      `${environment.apiUrl}/food/entries`,
      request,
    );
  }

  editFoodEntry(
    entryId: number,
    request: EditFoodEntryRequest,
  ): Observable<FoodEntryDto> {
    return this.http.put<FoodEntryDto>(
      `${environment.apiUrl}/food/entries/${entryId}`,
      request,
    );
  }

  getFoodEntries(date?: string): Observable<FoodEntryDto[]> {
    const params = date ? new HttpParams().set('date', date) : new HttpParams();
    return this.http.get<FoodEntryDto[]>(`${environment.apiUrl}/food/entries`, {
      params,
    });
  }

  deleteFoodEntry(entryId: number): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/food/entries/${entryId}`,
    );
  }
}
