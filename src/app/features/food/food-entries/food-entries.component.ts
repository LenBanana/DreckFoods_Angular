import { Component, ElementRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  isToday,
  isYesterday,
} from 'date-fns';
import { catchError, of } from 'rxjs';

import { FoodService } from '../../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EditFoodEntryRequest, FoodEntryDto } from '../../../core/models/food.models';

@Component({
  selector: 'app-food-entries',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    FormsModule
  ],
  templateUrl: './food-entries.component.html',
  styleUrls: ['./food-entries.component.scss'],
})
export class FoodEntriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private foodService = inject(FoodService);
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

    const selectedDate = this.showingAll
      ? undefined
      : this.filterForm.get('selectedDate')?.value;

    this.foodService
      .getFoodEntries(selectedDate)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Failed to load food entries. Please try again.';
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe((entries) => {
        if (this.showingAll) {
          this.allEntries = entries;
          this.displayEntries = entries;
        } else {
          this.selectedDateEntries = entries;
          this.displayEntries = entries;
          this.calculateDailyTotals();
        }
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
    }

    this.foodService
      .editFoodEntry(entry.id, updateRequest)
      .pipe(
        catchError((error) => {
          alert('Failed to update entry. Please try again.');
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
    this.dailyTotals = {
      calories: this.selectedDateEntries.reduce(
        (sum, entry) => sum + entry.calories,
        0
      ),
      protein: this.selectedDateEntries.reduce(
        (sum, entry) => sum + entry.protein,
        0
      ),
      carbs: this.selectedDateEntries.reduce(
        (sum, entry) => sum + entry.carbohydrates,
        0
      ),
      fat: this.selectedDateEntries.reduce((sum, entry) => sum + entry.fat, 0),
      fiber: this.selectedDateEntries.reduce(
        (sum, entry) => sum + entry.fiber,
        0
      ),
    };
  }

  deleteEntry(entry: FoodEntryDto) {
    if (confirm(`Are you sure you want to delete "${entry.foodName}"?`)) {
      this.deletingEntryId = entry.id;

      this.foodService
        .deleteFoodEntry(entry.id)
        .pipe(
          catchError((error) => {
            alert('Failed to delete entry. Please try again.');
            this.deletingEntryId = null;
            return of(null);
          })
        )
        .subscribe((response) => {
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
}
