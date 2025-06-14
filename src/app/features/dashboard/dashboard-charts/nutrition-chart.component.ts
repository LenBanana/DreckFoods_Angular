import {Component, inject, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {format} from 'date-fns';
import {ChartConfiguration, ChartType} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';

import {DailyTimelineDto} from '../../../core/models/timeline.models';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-nutrition-chart',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, BaseChartDirective],  template: `
    <div class="chart-container">
      <div *ngIf="isLoading" class="text-center py-5">
        <app-loading-spinner size="large"></app-loading-spinner>
        <p class="mt-3">Loading nutrition data...</p>
      </div>

      <div *ngIf="!isLoading">
        <div class="chart-header mb-3">
          <h3 class="m-0">{{ chartTitle }}</h3>
          <button
            class="btn btn-sm btn-outline-secondary toggle-controls-btn"
            (click)="toggleControls()">
            <i class="fas" [ngClass]="isControlsCollapsed ? 'fa-bars' : 'fa-times'"></i>
          </button>
        </div>

        <div [hidden]="isControlsCollapsed" class="chart-controls">
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
          <canvas baseChart style="height: 33vh"
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
      border-radius: 0.25rem;
      border: 1px solid var(--bs-border-color);
      background: var(--bs-body-bg);
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chart-controls {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 15px;
      overflow: hidden;
      transition: height 0.35s ease;
    }    /* Ensures collapse works properly */
    .chart-controls[hidden] {
      display: none !important;
    }

    .btn-group {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
    }

    .btn-group .btn {
      padding: 8px 12px;
      font-size: 0.9rem;
      touch-action: manipulation;
      min-height: 44px;
      flex: 0 0 auto;
    }

    .btn-group .btn.active {
      background-color: var(--bs-primary);
      color: white;
    }

    @media (max-width: 576px) {
      .chart-container {
        padding: 10px;
      }

      .btn-group .btn {
        padding: 6px 10px;
        min-width: 70px;
      }
    }
  `]
})
export class NutritionChartComponent implements OnChanges {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @Input() timelineData: DailyTimelineDto[] = [];
  @Input() selectedTimeRange: string = 'last_7_days';

  isLoading = false;
  isControlsCollapsed = true;

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


  chartTitle: string = 'Nutrition Overview - 7 Days';


  availableMetrics = [
    {
      value: 'calories',
      label: 'Calories',
      color: 'rgba(255, 99, 132, 1)',
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)'
    },
    {
      value: 'protein',
      label: 'Protein',
      color: 'rgba(54, 162, 235, 1)',
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)'
    },
    {
      value: 'fat',
      label: 'Fat',
      color: 'rgba(255, 206, 86, 1)',
      borderColor: 'rgba(255, 206, 86, 1)',
      backgroundColor: 'rgba(255, 206, 86, 0.2)'
    },
    {
      value: 'carbohydrates',
      label: 'Carbs',
      color: 'rgba(75, 192, 192, 1)',
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    },
    {
      value: 'fiber',
      label: 'Fiber',
      color: 'rgba(153, 102, 255, 1)',
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)'
    },
    {
      value: 'sugar',
      label: 'Sugar',
      color: 'rgba(255, 159, 64, 1)',
      borderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.2)'
    },
    {
      value: 'caffeine',
      label: 'Caffeine',
      color: 'rgba(201, 203, 207, 1)',
      borderColor: 'rgba(201, 203, 207, 1)',
      backgroundColor: 'rgba(201, 203, 207, 0.2)'
    }
  ];
  activeMetrics: string[] = ['protein', 'fat', 'carbohydrates', 'fiber', 'sugar', 'caffeine'];

  timeRanges = [
    {value: 'last_7_days', label: '7 Days'},
    {value: 'last_30_days', label: '30 Days'},
    {value: 'last_90_days', label: '90 Days'}
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timelineData'] || changes['selectedTimeRange']) {
      this.initializeChartData();
    }
  }

  toggleMetric(metric: string): void {
    const index = this.activeMetrics.indexOf(metric);
    if (index === -1) {
      this.activeMetrics.push(metric);
    } else if (this.activeMetrics.length > 1) {
      this.activeMetrics.splice(index, 1);
    }

    this.updateChartData();
  }

  toggleControls(): void {
    this.isControlsCollapsed = !this.isControlsCollapsed;
  }

  private initializeChartData(): void {
    this.lineChartData.labels = this.timelineData.map(day =>
      format(new Date(day.date), 'MMM dd')
    );

    const rangeLabel = this.timeRanges.find(range => range.value === this.selectedTimeRange)?.label;
    this.chartTitle = `Nutrition Overview - ${rangeLabel}`;
    this.updateChartData();
  }

  private updateChartData(): void {
    this.lineChartData.datasets = [];

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

    if (this.chart) {
      this.chart.update();
    }
  }
}
