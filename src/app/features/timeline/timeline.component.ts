import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { format, subDays, parseISO, startOfDay, endOfDay } from 'date-fns';
import { catchError, of } from 'rxjs';

import { TimelineService } from '../../core/services/timeline.service';
import { AlertService } from '../../core/services/alert.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { NutritionProgressBarsComponent, NutritionData, NutritionTotals } from '../../shared/components/nutrition-progress-bars/nutrition-progress-bars.component';
import { DailyTimelineDto } from '../../core/models/timeline.models';
import { FoodService } from '../../core/services/food.service';
import { FoodEntryDto, EditFoodEntryRequest } from '../../core/models/food.models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, NutritionProgressBarsComponent, FormsModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
})
export class TimelineComponent implements OnInit {
  private fb = inject(FormBuilder);
  private timelineService = inject(TimelineService);
  private foodService = inject(FoodService);
  private alertService = inject(AlertService);
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;
  private openAccordions = new Set<string>();

  filterForm: FormGroup;
  timelineData: DailyTimelineDto[] = [];
  isLoading = true;
  errorMessage = '';

  averages = {
    calories: 0,
    protein: 0
  };
  totalEntries = 0;
  weightEntries = 0;

  constructor() {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    this.filterForm = this.fb.group({
      startDate: [format(startDate, 'yyyy-MM-dd')],
      endDate: [format(endDate, 'yyyy-MM-dd')]
    });
  }

  ngOnInit() {
    this.loadTimeline();
  }

  storeAccordionState() {
    this.openAccordions.clear();
    // Store open accordions by date (more reliable than index)
    this.timelineData.forEach((day, index) => {
      const accordionElement = document.getElementById(`c${index}`);
      if (accordionElement?.classList.contains('show')) {
        this.openAccordions.add(day.date);
      }
    });
  }

  restoreAccordionState() {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.timelineData.forEach((day, index) => {
        if (this.openAccordions.has(day.date)) {
          const accordionElement = document.getElementById(`c${index}`);
          const buttonElement = document.querySelector(`[data-bs-target="#c${index}"]`) as HTMLElement;

          if (accordionElement && buttonElement) {
            accordionElement.classList.add('show');
            buttonElement.classList.remove('collapsed');
            buttonElement.setAttribute('aria-expanded', 'true');
          }
        }
      });
    }, 0);
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

  finishEditing(entry: FoodEntryDto, day: DailyTimelineDto) {
    entry.editing = false;
    this.updateEntry(day, entry);
  }

  toggleNutritionDetails(entry: FoodEntryDto) {
    entry.showNutrition = !entry.showNutrition;
  }

  toggleAllNutritionDetails(day: DailyTimelineDto) {
    const anyExpanded = day.foodEntries.some(entry => entry.showNutrition);
    // If any are expanded, collapse all. If none are expanded, expand all.
    day.foodEntries.forEach(entry => {
      entry.showNutrition = !anyExpanded;
    });
  }

  areAnyNutritionDetailsExpanded(day: DailyTimelineDto): boolean {
    return day.foodEntries.some(entry => entry.showNutrition);
  }

  updateEntry(day: DailyTimelineDto, entry: FoodEntryDto) {
    this.storeAccordionState();
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
        // Silent refresh without loading states
        this.loadTimeline(true);
      });
  }

  loadTimeline(silent: boolean = false) {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;

    const utcStartDate = new Date(startDate);
    const utcEndDate = new Date(endDate);

    if (!startDate || !endDate) return;

    // Only show loading states for user-initiated loads
    if (!silent) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.timelineService.getTimeline(utcStartDate.toISOString(), utcEndDate.toISOString())
      .pipe(
        catchError(error => {
          this.errorMessage = 'Failed to load timeline data. Please try again.';
          if (!silent) {
            this.isLoading = false;
          }
          return of({ days: [], totalDays: 0 });
        })
      )      .subscribe(response => {
        this.timelineData = response.days;
        // Initialize showNutrition property for all entries
        this.timelineData.forEach(day => {
          day.foodEntries.forEach(entry => {
            if (entry.showNutrition === undefined) {
              entry.showNutrition = false;
            }
          });
        });
        this.calculateAverages();
        if (!silent) {
          this.isLoading = false;
        } else {
          // Restore accordion state after silent refresh
          this.restoreAccordionState();
        }
      });
  }

  onDateRangeChange() {
    this.loadTimeline();
  }

  setRange(days: number) {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    this.filterForm.patchValue({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    });

    this.loadTimeline();
  }

  private calculateAverages() {
    const daysWithEntries = this.timelineData.filter(day => day.foodEntries.length > 0);
    const totalDays = daysWithEntries.length;

    if (totalDays === 0) {
      this.averages = { calories: 0, protein: 0 };
      this.totalEntries = 0;
      this.weightEntries = 0;
      return;
    }

    const totalCalories = daysWithEntries.reduce((sum, day) => sum + day.totalCalories, 0);
    const totalProtein = daysWithEntries.reduce((sum, day) => sum + day.totalProtein, 0);

    this.averages = {
      calories: totalCalories / totalDays,
      protein: totalProtein / totalDays
    };

    this.totalEntries = this.timelineData.reduce((sum, day) => sum + day.foodEntries.length, 0);
    this.weightEntries = this.timelineData.filter(day => day.weightEntry).length;
  }

  getMacroPercentage(macroCalories: number, totalCalories: number): number {
    if (totalCalories === 0) return 0;
    return Math.min((macroCalories / totalCalories) * 100, 100);
  }

  getUnaccountedPercentage(day: DailyTimelineDto): number {
    if (day.totalCalories === 0) return 0;

    const calculatedCalories =
      (day.totalProtein * 4) +
      (day.totalCarbohydrates * 4) +
      (day.totalFat * 9);

    const unaccountedCalories = day.totalCalories - calculatedCalories;
    const percentage = Math.max((unaccountedCalories / day.totalCalories) * 100, 0);

    return Math.min(percentage, 100);
  }

  // New methods for entry-level progress bars
  getEntryNutrientPercentage(entryValue: number, dayTotal: number): number {
    if (dayTotal === 0) return 0;
    return Math.min((entryValue / dayTotal) * 100, 100);
  }

  getEntryCaloriePercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.calories, day.totalCalories);
  }

  getEntryProteinPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.protein, day.totalProtein);
  }

  getEntryCarbPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.carbohydrates, day.totalCarbohydrates);
  }

  getEntryFatPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.fat, day.totalFat);
  }

  getEntryFiberPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.fiber, day.totalFiber);
  }

  getEntrySugarPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.sugar, day.totalSugar);
  }

  getNutrientCount(entry: FoodEntryDto): number {
    let count = 0;
    if (entry.calories > 0) count++;
    if (entry.protein > 0) count++;
    if (entry.carbohydrates > 0) count++;
    if (entry.fat > 0) count++;
    if (entry.fiber > 0) count++;
    if (entry.sugar > 0) count++;
    return count;
  }

  formatDayHeader(dateString: string): string {
    return format(parseISO(dateString), 'EEEE, MMM d, yyyy');
  }

  trackByDate(index: number, day: DailyTimelineDto): string {
    return day.date;
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  // Helper methods for nutrition progress bars
  getEntryAsNutritionData(entry: FoodEntryDto): NutritionData {
    return {
      calories: entry.calories,
      protein: entry.protein,
      carbohydrates: entry.carbohydrates,
      fat: entry.fat,
      fiber: entry.fiber,
      sugar: entry.sugar
    };
  }

  getDayAsNutritionTotals(day: DailyTimelineDto): NutritionTotals {
    return {
      calories: day.totalCalories,
      protein: day.totalProtein,
      carbohydrates: day.totalCarbohydrates,
      fat: day.totalFat,
      fiber: day.totalFiber,
      sugar: day.totalSugar,
      totalCalories: day.totalCalories,
      totalProtein: day.totalProtein,
      totalCarbohydrates: day.totalCarbohydrates,
      totalFat: day.totalFat,
      totalFiber: day.totalFiber,
      totalSugar: day.totalSugar
    };
  }
}
