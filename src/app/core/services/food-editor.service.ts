import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { 
  FddbFoodUpdateDTO, 
  FddbFoodNutritionUpdateDTO, 
  FddbFoodCompleteUpdateDTO, 
  FoodEditorResponse 
} from '../models/food-editor.models';
import { FoodSearchDto } from '../models/food.models';

@Injectable({
  providedIn: 'root'
})
export class FoodEditorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/FddbEditor`;

  getFoodById(id: number): Observable<FoodSearchDto> {
    return this.http.get<FoodSearchDto>(`${this.baseUrl}/${id}`);
  }

  updateFoodInfo(id: number, updateDto: FddbFoodUpdateDTO): Observable<FoodEditorResponse> {
    return this.http.put<FoodEditorResponse>(`${this.baseUrl}/${id}/info`, updateDto);
  }

  updateFoodNutrition(id: number, updateDto: FddbFoodNutritionUpdateDTO): Observable<FoodEditorResponse> {
    return this.http.put<FoodEditorResponse>(`${this.baseUrl}/${id}/nutrition`, updateDto);
  }

  updateFoodComplete(id: number, updateDto: FddbFoodCompleteUpdateDTO): Observable<FoodEditorResponse> {
    return this.http.put<FoodEditorResponse>(`${this.baseUrl}/${id}`, updateDto);
  }
}
