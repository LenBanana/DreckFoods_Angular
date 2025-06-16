import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChildren, QueryList, ElementRef, inject } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { subDays, format, parseISO } from "date-fns";
import { catchError, of } from "rxjs";
import { formatLocalISO } from "../../../core/extensions/date.extensions";
import { FoodEntryDto, EditFoodEntryRequest, NutritionData, NutritionTotals } from "../../../core/models/food.models";
import { DailyTimelineDto } from "../../../core/models/timeline.models";
import { AlertService } from "../../../core/services/alert.service";
import { FoodService } from "../../../core/services/food.service";
import { TimelineService } from "../../../core/services/timeline.service";
import { LoadingSpinnerComponent } from "../../../shared/components/loading-spinner/loading-spinner.component";
import { NutritionProgressBarsComponent } from "../../../shared/components/nutrition-progress-bars/nutrition-progress-bars.component";

@Component({
  selector: 'app-food-entries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    NutritionProgressBarsComponent,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './food-entries.component.html',
  styleUrls: ['./food-entries.component.scss'],
})
export class FoodEntriesComponent implements OnInit {
  @ViewChildren('editInput') editInputs!: QueryList<ElementRef>;
  filterForm: FormGroup;
  timelineData: DailyTimelineDto[] = [];
  isLoading = true;
  isDeleting = false;
  errorMessage = '';
  averagesCollapsed = true;
  averages = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    caffeine: 0,
    salt: 0,
  };
  totalEntries = 0;
  weightEntries = 0;
  private fb = inject(FormBuilder);
  private timelineService = inject(TimelineService);
  private foodService = inject(FoodService);
  private alertService = inject(AlertService);
  private openAccordions = new Set<string>();

  constructor() {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    this.filterForm = this.fb.group({
      startDate: [format(startDate, 'yyyy-MM-dd')],
      endDate: [format(endDate, 'yyyy-MM-dd')],
    });
  }

  ngOnInit() {
    this.loadTimeline();

    setTimeout(() => {
      const averagesElement = document.getElementById('averagesCollapse');
      if (averagesElement && this.averagesCollapsed) {
        averagesElement.classList.remove('show');
      }
    }, 0);
  }

  storeAccordionState() {
    this.openAccordions.clear();
    this.timelineData.forEach((day, index) => {
      const accordionElement = document.getElementById(`c${index}`);
      if (accordionElement?.classList.contains('show')) {
        this.openAccordions.add(day.date);
      }
    });
  }

  restoreAccordionState() {
    setTimeout(() => {
      this.timelineData.forEach((day, index) => {
        if (this.openAccordions.has(day.date)) {
          const accordionElement = document.getElementById(`c${index}`);
          const buttonElement = document.querySelector(
            `[data-bs-target="#c${index}"]`,
          ) as HTMLElement;

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
    setTimeout(() => {
      const input = this.editInputs.last?.nativeElement;
      if (input) {
        input.focus();
        input.select();
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
    const anyExpanded = day.foodEntries.some((entry) => entry.showNutrition);
    day.foodEntries.forEach((entry) => {
      entry.showNutrition = !anyExpanded;
    });
  }

  areAnyNutritionDetailsExpanded(day: DailyTimelineDto): boolean {
    return day.foodEntries.some((entry) => entry.showNutrition);
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
        }),
      )
      .subscribe((response) => {
        if (!response) return;
        this.loadTimeline(true);
      });
  }

  async deleteEntry(entry: FoodEntryDto, day: DailyTimelineDto) {
    if (this.isDeleting) return;
    this.isDeleting = true;
    
    const confirm = await this.alertService.confirmDelete(
      'Delete Entry',
      `Are you sure you want to delete "${entry.foodName}"? This action cannot be undone.`,
    );

    if (!confirm) {
      this.isDeleting = false;
      return;
    }
    this.storeAccordionState();

    this.foodService
      .deleteFoodEntry(entry.id)
      .pipe(
        catchError((_) => {
          this.alertService.error('Failed to delete entry. Please try again.');
          this.isDeleting = false;
          return of(null);
        }),
      )
      .subscribe((_) => {
        this.isDeleting = false;
        this.loadTimeline(true);
      });
  }

  loadTimeline(silent: boolean = false) {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;

    const utcStartDate = new Date(startDate);
    utcStartDate.setHours(0, 0, 0, 0);
    const utcEndDate = new Date(endDate);
    utcEndDate.setHours(23, 59, 59, 999);
    if (!startDate || !endDate) return;

    if (!silent) {
      this.isLoading = true;
    }
    this.errorMessage = '';

    this.timelineService
      .getTimeline(formatLocalISO(utcStartDate), formatLocalISO(utcEndDate))
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load timeline data. Please try again.';
          if (!silent) {
            this.isLoading = false;
          }
          return of({days: [], totalDays: 0});
        }),
      )
      .subscribe((response) => {
        this.timelineData = response.days;
        this.timelineData.forEach((day) => {
          day.foodEntries.forEach((entry) => {
            if (entry.showNutrition === undefined) {
              entry.showNutrition = false;
            }
          });
        });
        this.calculateAverages();
        if (!silent) {
          this.isLoading = false;
        } else {
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
      endDate: format(endDate, 'yyyy-MM-dd'),
    });

    this.loadTimeline();
  }

  getMacroPercentage(macroCalories: number, totalCalories: number): number {
    if (totalCalories === 0) return 0;
    return Math.min((macroCalories / totalCalories) * 100, 100);
  }

  getUnaccountedPercentage(day: DailyTimelineDto): number {
    if (day.calories === 0) return 0;

    const calculatedCalories =
      day.protein * 4 + day.carbohydrates * 4 + day.fat * 9;

    const unaccountedCalories = day.calories - calculatedCalories;
    const percentage = Math.max((unaccountedCalories / day.calories) * 100, 0);
    return Math.min(percentage, 100);
  }

  getEntryNutrientPercentage(entryValue: number, dayTotal: number): number {
    if (dayTotal === 0) return 0;
    return Math.min((entryValue / dayTotal) * 100, 100);
  }

  getEntryCaloriePercentage(
    entry: FoodEntryDto,
    day: DailyTimelineDto,
  ): number {
    return this.getEntryNutrientPercentage(entry.calories, day.calories);
  }

  getEntryProteinPercentage(
    entry: FoodEntryDto,
    day: DailyTimelineDto,
  ): number {
    return this.getEntryNutrientPercentage(entry.protein, day.protein);
  }

  getEntryCarbPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(
      entry.carbohydrates,
      day.carbohydrates,
    );
  }

  getEntryFatPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.fat, day.fat);
  }

  getEntryFiberPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.fiber, day.fiber);
  }

  getEntrySugarPercentage(entry: FoodEntryDto, day: DailyTimelineDto): number {
    return this.getEntryNutrientPercentage(entry.sugar, day.sugar);
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

  getEntryAsNutritionData(entry: FoodEntryDto): NutritionData {
    return {
      calories: entry.calories,
      protein: entry.protein,
      carbohydrates: entry.carbohydrates,
      fat: entry.fat,
      fiber: entry.fiber,
      sugar: entry.sugar,
      caffeine: entry.caffeine,
      salt: entry.salt,
    };
  }

  getDayAsNutritionTotals(day: DailyTimelineDto): NutritionTotals {
    return {
      calories: day.calories,
      protein: day.protein,
      carbohydrates: day.carbohydrates,
      fat: day.fat,
      fiber: day.fiber,
      sugar: day.sugar,
      caffeine: day.caffeine,
      salt: day.salt,
    };
  }

  toggleAverages() {
    this.averagesCollapsed = !this.averagesCollapsed;

    const averagesElement = document.getElementById('averagesCollapse');
    if (averagesElement) {
      const bsCollapse = new (window as any).bootstrap.Collapse(
        averagesElement,
        {
          toggle: false,
        },
      );

      if (this.averagesCollapsed) {
        bsCollapse.hide();
      } else {
        bsCollapse.show();
      }
    }
  }

  private calculateAverages() {
    const daysWithEntries = this.timelineData.filter(
      (day) => day.foodEntries.length > 0,
    );
    const totalDays = daysWithEntries.length;

    if (totalDays === 0) {
      this.averages = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        caffeine: 0,
        salt: 0,
      };
      this.totalEntries = 0;
      this.weightEntries = 0;
      return;
    }

    const totalCalories = daysWithEntries.reduce(
      (sum, day) => sum + day.calories,
      0,
    );
    const totalProtein = daysWithEntries.reduce(
      (sum, day) => sum + day.protein,
      0,
    );
    const totalCarbohydrates = daysWithEntries.reduce(
      (sum, day) => sum + day.carbohydrates,
      0,
    );
    const totalFat = daysWithEntries.reduce((sum, day) => sum + day.fat, 0);
    const totalFiber = daysWithEntries.reduce((sum, day) => sum + day.fiber, 0);
    const totalSugar = daysWithEntries.reduce((sum, day) => sum + day.sugar, 0);
    const totalCaffeine = daysWithEntries.reduce(
      (sum, day) => sum + day.caffeine,
      0,
    );
    const totalSalt = daysWithEntries.reduce((sum, day) => sum + day.salt, 0);

    this.averages = {
      calories: totalCalories / totalDays,
      protein: totalProtein / totalDays,
      carbohydrates: totalCarbohydrates / totalDays,
      fat: totalFat / totalDays,
      fiber: totalFiber / totalDays,
      sugar: totalSugar / totalDays,
      caffeine: totalCaffeine / totalDays,
      salt: totalSalt / totalDays,
    };

    this.totalEntries = this.timelineData.reduce(
      (sum, day) => sum + day.foodEntries.length,
      0,
    );
    this.weightEntries = this.timelineData.filter(
      (day) => day.weightEntry,
    ).length;
  }
}
