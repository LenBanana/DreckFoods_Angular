import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  format,
  parseISO,
  isToday,
  isYesterday,
} from 'date-fns';
import { catchError, of } from 'rxjs';

import { FoodService } from '../../../core/services/food.service';
import { AlertService } from '../../../core/services/alert.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NutritionProgressBarsComponent } from '../../../shared/components/nutrition-progress-bars/nutrition-progress-bars.component';
import { NutritionCardComponent, NutritionCardData } from '../../../shared/components/nutrition-card/nutrition-card.component';
import { NutritionConfigService } from '../../../shared/services/nutrition-config.service';
import { EditFoodEntryRequest, FoodEntryDto, NutritionData, NutritionTotals } from '../../../core/models/food.models';

@Component({
  selector: 'app-food-entries',
  standalone: true, imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    NutritionProgressBarsComponent,
    NutritionCardComponent,
    FormsModule
  ],
  templateUrl: './food-entries.component.html',
  styleUrls: ['./food-entries.component.scss'],
})
export class FoodEntriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private foodService = inject(FoodService);
  private alertService = inject(AlertService);
  private nutritionConfigService = inject(NutritionConfigService);
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;

  filterForm: FormGroup;
  allEntries: FoodEntryDto[] = [];
  selectedDateEntries: FoodEntryDto[] = [];
  displayEntries: FoodEntryDto[] = [];
  isLoading = true;
  errorMessage = '';
  deletingEntryId: number | null = null;
  showingAll = false;
  isToday = false;
  isYesterday = false;

  dailyTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    caffeine: 0,
    salt: 0,
  };

  constructor() {
    this.filterForm = this.fb.group({
      selectedDate: [format(new Date(), 'yyyy-MM-dd')],
    });
  }

  ngOnInit() {
    this.loadEntries();
    this.updateDateFlags();
  }
  loadEntries() {
    this.isLoading = true;
    this.errorMessage = '';

    // Get the date parameter for API call
    let dateParam: string | undefined;
    if (!this.showingAll) {
      const selectedDate = this.filterForm.get('selectedDate')?.value;
      if (selectedDate) {
        dateParam = selectedDate;
      }
    }

    this.foodService
      .getFoodEntries(dateParam)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load food entries. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((entries) => {
        // Initialize showNutrition property for all entries
        entries.forEach(entry => {
          if (entry.showNutrition === undefined) {
            entry.showNutrition = false;
          }
        });

        if (this.showingAll) {
          this.allEntries = entries;
          this.displayEntries = entries;
          this.selectedDateEntries = []; // No specific date selected
        } else {
          this.allEntries = entries;
          this.selectedDateEntries = entries; // These are already filtered by date from API
          this.displayEntries = entries;
        }

        this.calculateDailyTotals();
        this.isLoading = false;
      });
  }

  startEditing(entry: FoodEntryDto) {
    entry.editing = true;
    // Focus the input after it's rendered
    setTimeout(() => {
      const input = this.editInputs.last?.nativeElement;
      if (input) {
        input.focus();
        input.select(); // Optional: select all text
      }
    }, 0);
  }

  finishEditing(entry: FoodEntryDto) {
    entry.editing = false;
    this.updateEntry(entry);
  }
  updateEntry(entry: FoodEntryDto) {
    let updateRequest: EditFoodEntryRequest = {
      fddbFoodId: entry.id,
      gramsConsumed: entry.gramsConsumed,
    };

    this.foodService
      .editFoodEntry(entry.id, updateRequest)
      .pipe(
        catchError((error) => {
          this.alertService.error('Failed to update entry. Please try again.');
          return of(null);
        })
      )
      .subscribe((response) => {
        if (!response) return;
        this.loadEntries();
      });
  }

  onDateChange() {
    this.showingAll = false;
    this.updateDateFlags();
    this.loadEntries();
  }

  selectToday() {
    this.filterForm.patchValue({
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
    });
    this.showingAll = false;
    this.updateDateFlags();
    this.loadEntries();
  }

  selectYesterday() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this.filterForm.patchValue({
      selectedDate: format(yesterday, 'yyyy-MM-dd'),
    });
    this.showingAll = false;
    this.updateDateFlags();
    this.loadEntries();
  }

  showAll() {
    this.showingAll = true;
    this.updateDateFlags();
    this.loadEntries();
  }

  private updateDateFlags() {
    const selectedDate = this.filterForm.get('selectedDate')?.value;
    if (selectedDate && !this.showingAll) {
      const selected = parseISO(selectedDate);
      this.isToday = isToday(selected);
      this.isYesterday = isYesterday(selected);
    } else {
      this.isToday = false;
      this.isYesterday = false;
    }
  }
  private calculateDailyTotals() {
    // Use selectedDateEntries for specific date totals, or displayEntries for "All Time"
    const entriesToSum = this.showingAll ? this.displayEntries : this.selectedDateEntries;

    this.dailyTotals = {
      calories: entriesToSum.reduce(
        (sum, entry) => sum + entry.calories,
        0
      ),
      protein: entriesToSum.reduce(
        (sum, entry) => sum + entry.protein,
        0
      ),
      carbs: entriesToSum.reduce(
        (sum, entry) => sum + entry.carbohydrates,
        0
      ),
      fat: entriesToSum.reduce((sum, entry) => sum + entry.fat, 0),
      fiber: entriesToSum.reduce(
        (sum, entry) => sum + entry.fiber,
        0
      ),
      sugar: entriesToSum.reduce(
        (sum, entry) => sum + (entry.sugar),
        0
      ),
      caffeine: entriesToSum.reduce(
        (sum, entry) => sum + (entry.caffeine),
        0
      ),
      salt: entriesToSum.reduce(
        (sum, entry) => sum + (entry.salt),
        0
      ),
    };
  }
  async deleteEntry(entry: FoodEntryDto) {
    const confirmed = await this.alertService.confirmDelete(entry.foodName);

    if (confirmed) {
      this.deletingEntryId = entry.id;

      this.foodService
        .deleteFoodEntry(entry.id)
        .pipe(
          catchError((error) => {
            this.alertService.error('Failed to delete entry. Please try again.');
            this.deletingEntryId = null;
            return of(null);
          })
        ).subscribe((response) => {
          // Remove from local arrays
          this.allEntries = this.allEntries.filter((e) => e.id !== entry.id);
          this.selectedDateEntries = this.selectedDateEntries.filter(
            (e) => e.id !== entry.id
          );
          this.displayEntries = this.displayEntries.filter(
            (e) => e.id !== entry.id
          );
          this.calculateDailyTotals();
          this.deletingEntryId = null;
        });
    }
  }

  getSelectedDateLabel(): string {
    const selectedDate = this.filterForm.get('selectedDate')?.value;
    if (!selectedDate) return '';

    const date = parseISO(selectedDate);
    if (isToday(date)) return "Today's";
    if (isYesterday(date)) return "Yesterday's";
    return format(date, 'MMM d, yyyy');
  }

  getEntriesTitle(): string {
    if (this.showingAll) return 'All Food Entries';
    return this.getSelectedDateLabel() + ' Entries';
  }

  getEmptyStateTitle(): string {
    if (this.showingAll) return 'No food entries found';
    return `No entries for ${this.getSelectedDateLabel().toLowerCase()}`;
  }

  getEmptyStateMessage(): string {
    if (this.showingAll)
      return 'Start tracking your nutrition by adding your first food entry.';
    return "You haven't logged any food for this date yet.";
  }

  formatTime(dateString: string): string {
    return format(parseISO(dateString), 'h:mm a');
  }

  formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d');
  }

  trackByEntryId(index: number, entry: FoodEntryDto): number {
    return entry.id;
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  // Helper methods for nutrition progress bars
  get dailyTotalsAsNutritionData(): NutritionData {
    return {
      calories: this.dailyTotals.calories,
      protein: this.dailyTotals.protein,
      carbohydrates: this.dailyTotals.carbs,
      fat: this.dailyTotals.fat,
      fiber: this.dailyTotals.fiber,
      sugar: this.dailyTotals.sugar,
      caffeine: this.dailyTotals.caffeine,
      salt: this.dailyTotals.salt
    };
  }

  get dailyTotalsAsNutritionTotals(): NutritionTotals {
    return {
      calories: this.dailyTotals.calories,
      protein: this.dailyTotals.protein,
      carbohydrates: this.dailyTotals.carbs,
      fat: this.dailyTotals.fat,
      fiber: this.dailyTotals.fiber,
      caffeine: this.dailyTotals.caffeine,
      sugar: this.dailyTotals.sugar,
      salt: this.dailyTotals.salt
    };
  }

  getEntryAsNutritionData(entry: FoodEntryDto): NutritionData {
    return {
      calories: entry.calories,
      protein: entry.protein,
      carbohydrates: entry.carbohydrates,
      fat: entry.fat,
      fiber: entry.fiber,
      sugar: entry.sugar,
      caffeine: entry.caffeine,
      salt: entry.salt
    };
  }

  toggleNutritionDetails(entry: FoodEntryDto) {
    entry.showNutrition = !entry.showNutrition;
  }

  toggleAllNutritionDetails() {
    const anyExpanded = this.displayEntries.some(entry => entry.showNutrition);
    // If any are expanded, collapse all. If none are expanded, expand all.
    this.displayEntries.forEach(entry => {
      entry.showNutrition = !anyExpanded;
    });
  }

  areAnyNutritionDetailsExpanded(): boolean {
    return this.displayEntries.some(entry => entry.showNutrition);
  }  getNutrientCount(entry: FoodEntryDto): number {
    let count = 0;
    if (entry.calories > 0) count++;
    if (entry.protein > 0) count++;
    if (entry.carbohydrates > 0) count++;
    if (entry.fat > 0) count++;
    if (entry.fiber > 0) count++;
    if (entry.sugar > 0) count++;
    return count;
  }

  getDailySummaryCards(): NutritionCardData[] {
    return [
      this.nutritionConfigService.createNutritionCard('calories', this.dailyTotals.calories),
      this.nutritionConfigService.createNutritionCard('protein', this.dailyTotals.protein),
      this.nutritionConfigService.createNutritionCard('carbs', this.dailyTotals.carbs),
      this.nutritionConfigService.createNutritionCard('fat', this.dailyTotals.fat),
      this.nutritionConfigService.createNutritionCard('fiber', this.dailyTotals.fiber),
      this.nutritionConfigService.createNutritionCard('caffeine', this.dailyTotals.caffeine)
    ];
  }
}
