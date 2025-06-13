import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FoodSearchDto,
  FoodSearchResponse,
} from '../../../core/models/food.models';
import { PaginationComponent } from '../pagination/pagination.component';
import { AuthService } from '../../../core/services/auth.service';
import { AppRole } from '../../../core/models/auth.models';

export type FoodResultsLayout = 'grid' | 'list' | 'compact';

@Component({
  selector: 'app-food-search-results',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './food-search-results.component.html',
  styleUrls: ['./food-search-results.component.scss'],
})
export class FoodSearchResultsComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  @Input() foods: FoodSearchDto[] = [];
  @Input() searchResponse: FoodSearchResponse | null = null;
  @Input() layout: FoodResultsLayout = 'list';
  @Input() showImages = true;
  @Input() showNutrition = true;
  @Input() showBrand = true;
  @Input() showTags = true;
  @Input() showPagination = false;
  @Input() actionButtonText = 'Select';
  @Input() actionButtonIcon = 'fas fa-plus';
  @Input() isLoading = false;
  @Input() emptyMessage = 'No foods found';
  @Input() emptyIcon = 'fas fa-search';

  @Output() foodSelected = new EventEmitter<FoodSearchDto>();
  @Output() imageError = new EventEmitter<Event>();
  @Output() pageChange = new EventEmitter<number>();

  get displayFoods(): FoodSearchDto[] {
    return this.searchResponse?.foods || this.foods;
  }
  get hasPagination(): boolean {
    return (
      this.showPagination &&
      this.searchResponse != null &&
      this.searchResponse.totalPages > 1
    );
  }

  get canEditFoods(): boolean {
    const user = this.authService.getCurrentUser();
    return (
      (user &&
        (user.role === AppRole.Admin || user.role === AppRole.DataEditor)) ||
      false
    );
  }

  onFoodSelect(food: FoodSearchDto) {
    this.foodSelected.emit(food);
  }

  onEditFood(food: FoodSearchDto, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/food/editor', food.id]);
  }

  onImageError(event: Event) {
    this.imageError.emit(event);
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  trackByFoodId(index: number, food: FoodSearchDto): number {
    return food.id;
  }
}
