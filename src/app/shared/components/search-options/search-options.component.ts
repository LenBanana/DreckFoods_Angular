import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodSortBy, SortDirection } from '../../../core/models/enums/sorting.models';
import { FoodResultsLayout } from '../food-search-results/food-search-results.component';

@Component({
  selector: 'app-search-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-options.component.html',
  styleUrls: ['./search-options.component.scss']
})
export class SearchOptionsComponent {
  @Input() sortBy: FoodSortBy = FoodSortBy.Name;
  @Input() sortDirection: SortDirection = SortDirection.Ascending;
  @Input() pageSize = 6;
  @Input() layout: FoodResultsLayout = 'list';
  @Input() showLayoutOptions = false;
  @Input() showResultsInfo = true;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalCount = 0;
  @Input() possiblePageSizes = [6, 12, 18, 24, 30];

  @Output() sortByChange = new EventEmitter<FoodSortBy>();
  @Output() sortDirectionChange = new EventEmitter<SortDirection>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() layoutChange = new EventEmitter<FoodResultsLayout>();

  sortByOptions = [
    { value: FoodSortBy.Name, label: 'Name' },
    { value: FoodSortBy.Calories, label: 'Calories' },
    { value: FoodSortBy.Protein, label: 'Protein' },
    { value: FoodSortBy.Carbs, label: 'Carbohydrates' },
    { value: FoodSortBy.Fat, label: 'Fat' },
    { value: FoodSortBy.Brand, label: 'Brand' }
  ];

  sortDirectionOptions = [
    { value: SortDirection.Ascending, label: 'Ascending' },
    { value: SortDirection.Descending, label: 'Descending' }
  ];  onSortByChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortByChange.emit(Number(target.value) as FoodSortBy);
  }

  onSortDirectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.sortDirectionChange.emit(Number(target.value) as SortDirection);
  }

  onPageSizeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(target.value));
  }  onLayoutChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.layoutChange.emit(target.value as FoodResultsLayout);
  }
}
