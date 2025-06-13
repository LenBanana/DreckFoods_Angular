import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators,} from '@angular/forms';
import {format, parseISO, subMonths} from 'date-fns';
import {catchError, of} from 'rxjs';

import {WeightService} from '../../../core/services/weight.service';
import {AlertService} from '../../../core/services/alert.service';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';
import {WeightEntryDto} from '../../../core/models/weight.models';

@Component({
  selector: 'app-weight-tracker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoadingSpinnerComponent,
    FormsModule,
  ],
  templateUrl: './weight-tracker.component.html',
  styleUrls: ['./weight-tracker.component.scss'],
})
export class WeightTrackerComponent implements OnInit {
  weightForm: FormGroup;
  weightEntries: WeightEntryDto[] = [];
  displayedEntries: WeightEntryDto[] = [];
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  deletingEntryId: number | null = null;
  selectedPeriod = '3';
  private fb = inject(FormBuilder);
  private weightService = inject(WeightService);
  private alertService = inject(AlertService);

  constructor() {
    this.weightForm = this.fb.group({
      weight: [
        '',
        [Validators.required, Validators.min(0), Validators.max(1000)],
      ],
      recordedAt: [
        format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        Validators.required,
      ],
    });
  }

  ngOnInit() {
    this.loadWeightHistory();
  }

  loadWeightHistory() {
    this.isLoading = true;

    let startDate: string | undefined;
    if (this.selectedPeriod !== 'all') {
      const months = parseInt(this.selectedPeriod);
      startDate = format(subMonths(new Date(), months), 'yyyy-MM-dd');
    }

    this.weightService
      .getWeightHistory(startDate)
      .pipe(
        catchError((error) => {
          console.error('Error loading weight history:', error);
          this.isLoading = false;
          return of([]);
        }),
      )
      .subscribe((entries) => {
        this.weightEntries = entries;
        this.displayedEntries = entries.slice(0, 10);
        this.isLoading = false;
      });
  }

  onSubmit() {
    if (this.weightForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      this.weightService
        .addWeightEntry(this.weightForm.value)
        .pipe(
          catchError((error) => {
            this.errorMessage =
              error.error?.message || 'Failed to log weight. Please try again.';
            this.isSubmitting = false;
            return of(null);
          }),
        )
        .subscribe((response) => {
          if (response) {
            this.weightForm.reset({
              weight: '',
              recordedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            });
            this.loadWeightHistory();
          }
          this.isSubmitting = false;
        });
    }
  }

  onPeriodChange() {
    this.loadWeightHistory();
  }

  async deleteEntry(entry: WeightEntryDto) {
    var confirm = await this.alertService.confirm({
      message: `Are you sure you want to delete the weight entry from ${this.formatDate(
        entry.recordedAt,
      )}? This action cannot be undone.`,
      title: 'Delete Weight Entry',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmButtonType: 'danger',
    });

    if (confirm) {
      this.deletingEntryId = entry.id;
      this.weightService
        .deleteWeightEntry(entry.id)
        .pipe(
          catchError((error) => {
            this.alertService.error(
              'Failed to delete entry. Please try again.',
            );
            this.deletingEntryId = null;
            return of(null);
          }),
        )
        .subscribe((response) => {
          this.weightEntries = this.weightEntries.filter(
            (e) => e.id !== entry.id,
          );
          this.displayedEntries = this.displayedEntries.filter(
            (e) => e.id !== entry.id,
          );
          this.deletingEntryId = null;
        });
    }
  }

  getCurrentWeight(): string {
    if (this.weightEntries.length === 0) return '--';
    return `${this.weightEntries[0].weight}kg`;
  }

  getWeightChange(): string {
    if (this.weightEntries.length < 2) return '--';

    const current = this.weightEntries[0].weight;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldEntry = this.weightEntries.find(
      (entry) => parseISO(entry.recordedAt) <= thirtyDaysAgo,
    );

    if (!oldEntry) return '--';

    const change = current - oldEntry.weight;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}kg`;
  }

  getHighestWeight(): string {
    if (this.weightEntries.length === 0) return '--';
    const highest = Math.max(...this.weightEntries.map((e) => e.weight));
    return `${highest}kg`;
  }

  getLowestWeight(): string {
    if (this.weightEntries.length === 0) return '--';
    const lowest = Math.min(...this.weightEntries.map((e) => e.weight));
    return `${lowest}kg`;
  }

  getWeightChangeForEntry(entry: WeightEntryDto): string {
    const index = this.weightEntries.findIndex((e) => e.id === entry.id);
    if (index === this.weightEntries.length - 1) return '--';

    const previousEntry = this.weightEntries[index + 1];
    const change = entry.weight - previousEntry.weight;

    if (Math.abs(change) < 0.1) return '--';

    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}kg`;
  }

  getChangeClass(entry: WeightEntryDto): string {
    const changeText = this.getWeightChangeForEntry(entry);
    if (changeText === '--') return 'neutral';
    if (changeText.startsWith('+')) return 'positive';
    return 'negative';
  }

  formatDate(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy');
  }

  formatTime(dateString: string): string {
    return format(parseISO(dateString), 'h:mm a');
  }

  trackByEntryId(index: number, entry: WeightEntryDto): number {
    return entry.id;
  }
}
