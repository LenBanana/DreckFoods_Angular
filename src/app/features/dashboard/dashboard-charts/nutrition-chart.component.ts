import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { format, subDays } from 'date-fns';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { TimelineService } from '../../../core/services/timeline.service';
import { DailyTimelineDto, TimelineResponse } from '../../../core/models/timeline.models';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-nutrition-chart',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, BaseChartDirective],
  template: `
    <div class="chart-container">
      <div *ngIf="isLoading" class="text-center py-5">
        <app-loading-spinner size="large"></app-loading-spinner>
        <p class="mt-3">Loading nutrition data...</p>
      </div>

      <div *ngIf="!isLoading">
        <h3 class="mb-3">30 Day Nutrition Overview</h3>
        <div class="chart-controls mb-3">
          <div class="btn-group">
            <button
              *ngFor="let metric of availableMetrics"
              [class.active]="activeMetrics.includes(metric.value)"
              class="btn btn-outline-primary"
              (click)="toggleMetric(metric.value)">
              {{ metric.label }}
            </button>
          </div>
        </div>

        <div style="display: block;">
          <canvas baseChart style="height: 500px"
            [data]="lineChartData"
            [options]="lineChartOptions"
            [type]="lineChartType">
          </canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      width: 100%;
      margin: 20px 0;
      padding: 15px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .chart-controls {
      display: flex;
      justify-content: center;
    }

    .btn-group .btn.active {
      background-color: var(--bs-primary);
      color: white;
    }
  `]
})
export class NutritionChartComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  isLoading = true;
  timelineData: DailyTimelineDto[] = [];

  // Chart configuration
  lineChartData: ChartConfiguration['data'] = {
    datasets: [],
    labels: []
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };

  lineChartType: ChartType = 'line';

  // Available metrics and colors for the chart
  availableMetrics = [
    { value: 'calories', label: 'Calories', color: 'rgba(255, 99, 132, 1)', borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)' },
    { value: 'protein', label: 'Protein', color: 'rgba(54, 162, 235, 1)', borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)' },
    { value: 'fat', label: 'Fat', color: 'rgba(255, 206, 86, 1)', borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 0.2)' },
    { value: 'carbohydrates', label: 'Carbs', color: 'rgba(75, 192, 192, 1)', borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)' },
    { value: 'fiber', label: 'Fiber', color: 'rgba(153, 102, 255, 1)', borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)' },
    { value: 'sugar', label: 'Sugar', color: 'rgba(255, 159, 64, 1)', borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 0.2)' },
    { value: 'caffeine', label: 'Caffeine', color: 'rgba(201, 203, 207, 1)', borderColor: 'rgba(201, 203, 207, 1)', backgroundColor: 'rgba(201, 203, 207, 0.2)' }
  ];

  // Initially active metrics
  activeMetrics: string[] = ['calories', 'protein', 'carbohydrates', 'fat'];

  private timelineService = inject(TimelineService);

  ngOnInit(): void {
    this.loadTimelineData();
  }

  toggleMetric(metric: string): void {
    const index = this.activeMetrics.indexOf(metric);
    if (index === -1) {
      // Add the metric if not already active
      this.activeMetrics.push(metric);
    } else if (this.activeMetrics.length > 1) {
      // Remove the metric if already active (always keep at least one active)
      this.activeMetrics.splice(index, 1);
    }

    // Update chart with selected metrics
    this.updateChartData();
  }

  private loadTimelineData(): void {
    // Create dates with explicit UTC timezone for PostgreSQL compatibility
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);

    // Format dates as ISO strings and extract just the date part (YYYY-MM-DD)
    const endDate = today.toISOString();
    const startDate = thirtyDaysAgo.toISOString();
    console.log('Fetching timeline data from:', startDate, 'to', endDate);

    this.timelineService.getTimeline(startDate, endDate).subscribe({
      next: (response: TimelineResponse) => {
        // Sort data by date
        this.timelineData = response.days.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Initialize chart data
        this.initializeChartData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading timeline data:', error);
        this.isLoading = false;
      }
    });
  }

  private initializeChartData(): void {
    // Set the x-axis labels (dates)
    this.lineChartData.labels = this.timelineData.map(day =>
      format(new Date(day.date), 'MMM dd')
    );

    // Initialize the chart with active metrics
    this.updateChartData();
  }

  private updateChartData(): void {
    // Clear existing datasets
    this.lineChartData.datasets = [];

    // Create datasets for each active metric
    this.activeMetrics.forEach(metric => {
      const metricConfig = this.availableMetrics.find(m => m.value === metric);
      if (!metricConfig) return;

      this.lineChartData.datasets.push({
        data: this.timelineData.map(day => day[metric as keyof DailyTimelineDto] as number),
        label: metricConfig.label,
        borderColor: metricConfig.borderColor,
        backgroundColor: metricConfig.backgroundColor,
        pointBackgroundColor: metricConfig.color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: metricConfig.color,
        fill: false,
        tension: 0.4
      });
    });

    // Update the chart
    if (this.chart) {
      this.chart.update();
    }
  }
}
