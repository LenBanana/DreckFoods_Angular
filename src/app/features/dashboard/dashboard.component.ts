import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { format, subDays } from 'date-fns';

import { FoodService } from '../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { FoodEntryDto } from '../../core/models/food.models';
import { User } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';
import { TimelineService } from '../../core/services/timeline.service';
import { DailyTimelineDto } from '../../core/models/timeline.models';
import { NutritionChartComponent } from './dashboard-charts/nutrition-chart.component';
import { DashboardSummaryComponent, SummaryCardData } from './dashboard-charts/dashboard-summary.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    NutritionChartComponent,
    DashboardSummaryComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = true;
  todaysFoodEntries: FoodEntryDto[] = [];
  todaysCalories = 0;
  todaysProtein = 0;
  todaysFat = 0;
  todaysCarbohydrates = 0;
  todaysSugar = 0;
  todaysFiber = 0;
  todaysCaffeine = 0;
  summaryCards: SummaryCardData[] = [];
  timelineData: DailyTimelineDto[] = [];

  timeRanges = [
    { value: 'last_7_days', label: '7 Days' },
    { value: 'last_30_days', label: '30 Days' },
    { value: 'last_90_days', label: '90 Days' }
  ];
  selectedTimeRange: string = 'last_7_days';

  navs = [
    {
      path: '/food/search',
      icon: 'search',
      title: 'Add Food',
      desc: 'Search and log your meals',
    },
    {
      path: '/weight',
      icon: 'ruler',
      title: 'Log Weight',
      desc: 'Track your weight progress',
    },
    {
      path: '/timeline',
      icon: 'chart-line',
      title: 'View Timeline',
      desc: 'See your nutrition timeline',
    },
    {
      path: '/profile',
      icon: 'cog',
      title: 'Settings',
      desc: 'Update your profile',
    },
  ];
  private foodService = inject(FoodService);
  private authService = inject(AuthService);
  private timelineService = inject(TimelineService);

  ngOnInit() {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (!user) {
          return;
        }
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      },
    });

    this.loadDashboardData();
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  selectTimeRange(range: string): void {
    this.selectedTimeRange = range;
    this.loadAllTimelineData();
  }

  private loadDashboardData() {
    var today = new Date();
    this.foodService.getFoodEntries(today.toISOString()).subscribe({
      next: (entries) => {
        this.todaysFoodEntries = entries;
        this.calculateTodaysNutrition();

        // Load timeline data for both chart and trends
        this.loadAllTimelineData();
      },
      error: (error) => {
        console.error('Error loading food entries:', error);
        this.isLoading = false;
      },
    });
  }

  private loadAllTimelineData(): void {
    const today = new Date();
    const yesterday = subDays(today, 1);
    let chartStartDate: string;

    switch (this.selectedTimeRange) {
      case 'last_7_days':
        chartStartDate = subDays(yesterday, 6).toISOString();
        break;
      case 'last_30_days':
        chartStartDate = subDays(yesterday, 29).toISOString();
        break;
      case 'last_90_days':
        chartStartDate = subDays(yesterday, 89).toISOString();
        break;
      default:
        chartStartDate = subDays(yesterday, 6).toISOString();
    }

    yesterday.setHours(23, 59, 59, 999);
    let chartEndDate: string = yesterday.toISOString();

    this.timelineService.getTimeline(chartStartDate, chartEndDate).subscribe({
      next: (response) => {
        this.timelineData = response.days.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        // Remove all entries that are only 0 values
        this.timelineData = this.timelineData.filter(day => {
          return Object.values(day).some(value => {
            return typeof value === 'number' && value !== 0;
          });
        });
        this.generateSummaryCards();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading timeline data:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateTodaysNutrition() {
    this.todaysCalories = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.calories,
      0,
    );
    this.todaysProtein = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.protein,
      0,
    );
    this.todaysFat = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.fat,
      0,
    );
    this.todaysCarbohydrates = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.carbohydrates,
      0,
    );
    this.todaysSugar = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.sugar,
      0,
    );
    this.todaysFiber = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.fiber,
      0,
    );
    this.todaysCaffeine = this.todaysFoodEntries.reduce(
      (sum, entry) => sum + entry.caffeine,
      0,
    );
  }

  private calculateTrend(currentValue: number, metric: keyof DailyTimelineDto): { value: number; direction: 'up' | 'down' | 'neutral' } {
    if (this.timelineData.length === 0) {
      return { value: 0, direction: 'neutral' };
    }

    const historicalAverage = this.timelineData.reduce((sum, day) => {
      const value = day[metric];
      return sum + (typeof value === 'number' ? value : 0);
    }, 0) / this.timelineData.length;

    if (historicalAverage === 0 && currentValue === 0) {
      return { value: 0, direction: 'neutral' };
    }

    if (historicalAverage === 0) {
      return { value: 100, direction: 'up' };
    }

    const percentChange = ((currentValue - historicalAverage) / historicalAverage) * 100;
    const absPercentChange = Math.abs(percentChange);

    if (absPercentChange < 2) {
      return { value: absPercentChange, direction: 'neutral' };
    }

    return {
      value: absPercentChange,
      direction: percentChange > 0 ? 'up' : 'down'
    };
  }

  private calculateMealsTrend(): { value: number; direction: 'up' | 'down' | 'neutral' } {
    if (this.timelineData.length === 0) {
      return { value: 0, direction: 'neutral' };
    }

    const previousDays = this.timelineData.slice(0, -1);
    if (previousDays.length === 0) {
      return { value: 0, direction: 'neutral' };
    }

    const previousAverage = previousDays.reduce((sum, day) => {
      return sum + day.foodEntries.length;
    }, 0) / previousDays.length;

    const currentMeals = this.todaysFoodEntries.length;

    if (previousAverage === 0 && currentMeals === 0) {
      return { value: 0, direction: 'neutral' };
    }

    if (previousAverage === 0) {
      return { value: 100, direction: 'up' };
    }

    const percentChange = ((currentMeals - previousAverage) / previousAverage) * 100;
    const absPercentChange = Math.abs(percentChange);


    if (absPercentChange < 10) {
      return { value: absPercentChange, direction: 'neutral' };
    }

    return {
      value: absPercentChange,
      direction: percentChange > 0 ? 'up' : 'down'
    };
  }

  private generateSummaryCards() {
    this.summaryCards = [
      {
        title: "Today's Calories",
        value: this.todaysCalories,
        unit: '',
        icon: 'fire',
        color: '#dc3545',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysCalories, 'calories'),
      },
      {
        title: "Today's Protein",
        value: this.todaysProtein,
        unit: 'g',
        icon: 'egg',
        color: '#198754',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysProtein, 'protein'),
      },
      {
        title: "Today's Fat",
        value: this.todaysFat,
        unit: 'g',
        icon: 'tint',
        color: '#ffc107',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysFat, 'fat'),
      },
      {
        title: "Today's Carbs",
        value: this.todaysCarbohydrates,
        unit: 'g',
        icon: 'bread-slice',
        color: '#fd7e14',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysCarbohydrates, 'carbohydrates'),
      },
      {
        title: "Today's Fiber",
        value: this.todaysFiber,
        unit: 'g',
        icon: 'leaf',
        color: '#20c997',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysFiber, 'fiber'),
      },
      {
        title: "Today's Sugar",
        value: this.todaysSugar,
        unit: 'g',
        icon: 'candy-cane',
        color: '#dc3b86',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysSugar, 'sugar'),
      },
      {
        title: "Today's Caffeine",
        value: this.todaysCaffeine,
        unit: 'mg',
        icon: 'coffee',
        color: '#6f4e37',
        route: '/food/search',
        trend: this.calculateTrend(this.todaysCaffeine, 'caffeine'),
      },
      {
        title: "Meals Logged",
        value: this.todaysFoodEntries.length,
        unit: '',
        icon: 'utensils',
        color: '#6610f2',
        route: '/food/entries',
        trend: this.calculateMealsTrend()
      }
    ];
  }
}
