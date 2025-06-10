import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    FoodEntryDto,
} from '../models/food.models';
import { environment } from '../../../environments/environment';
import { MealResponseDTO, CreateMealDTO, UpdateMealDTO, AddMealPortionDTO } from '../models/meal.models';

@Injectable({
    providedIn: 'root'
})
export class MealService {
    private http = inject(HttpClient);

    getMeals(): Observable<MealResponseDTO[]> {
        return this.http.get<MealResponseDTO[]>(`${environment.apiUrl}/meal`);
    }

    getMealById(mealId: number): Observable<MealResponseDTO> {
        return this.http.get<MealResponseDTO>(`${environment.apiUrl}/meal/${mealId}`);
    }

    createMeal(request: CreateMealDTO): Observable<MealResponseDTO> {
        return this.http.post<MealResponseDTO>(`${environment.apiUrl}/meal`, request);
    }

    updateMeal(mealId: number, request: UpdateMealDTO): Observable<MealResponseDTO> {
        return this.http.put<MealResponseDTO>(`${environment.apiUrl}/meal/${mealId}`, request);
    }

    deleteMeal(mealId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/meal/${mealId}`);
    }

    addMealPortion(request: AddMealPortionDTO): Observable<FoodEntryDto[]> {
        return this.http.post<FoodEntryDto[]>(`${environment.apiUrl}/meal/portion`, request);
    }

    getMealShareId(mealId: number): Observable<string> {
        return this.http.get(`${environment.apiUrl}/meal/${mealId}/share`, { responseType: 'text' });
    }

    addMealByShareId(shareId: string): Observable<MealResponseDTO> {
        return this.http.post<MealResponseDTO>(`${environment.apiUrl}/meal/${shareId}/share`, {});
    }
}
