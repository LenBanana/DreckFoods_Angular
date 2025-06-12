import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { format } from 'date-fns';

import { FoodService } from '../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import {
    NutritionCardComponent,
    NutritionCardData,
} from '../../shared/components/nutrition-card/nutrition-card.component';
import { NutritionConfigService } from '../../shared/services/nutrition-config.service';
import { FoodEntryDto } from '../../core/models/food.models';
import { User } from '../../core/models/auth.models';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        LoadingSpinnerComponent,
        NutritionCardComponent,
    ],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    private foodService = inject(FoodService);
    private authService = inject(AuthService);
    private nutritionConfigService = inject(NutritionConfigService);

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

    private loadDashboardData() {
        const today = format(new Date(), 'yyyy-MM-dd');

        this.foodService.getFoodEntries(today).subscribe({
            next: (entries) => {
                this.todaysFoodEntries = entries;
                this.calculateTodaysNutrition();
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading food entries:', error);
                this.isLoading = false;
            },
        });
    }
    private calculateTodaysNutrition() {
        this.todaysCalories = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.calories,
            0
        );
        this.todaysProtein = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.protein,
            0
        );
        this.todaysFat = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.fat,
            0
        );
        this.todaysCarbohydrates = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.carbohydrates,
            0
        );
        this.todaysSugar = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.sugar,
            0
        );
        this.todaysFiber = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.fiber,
            0
        );
        this.todaysCaffeine = this.todaysFoodEntries.reduce(
            (sum, entry) => sum + entry.caffeine,
            0
        );
    }

    getNutritionCards(): NutritionCardData[] {
        return [
            this.nutritionConfigService.createNutritionCard(
                'calories',
                this.todaysCalories
            ),
            this.nutritionConfigService.createNutritionCard(
                'protein',
                this.todaysProtein
            ),
            this.nutritionConfigService.createNutritionCard('fat', this.todaysFat),
            this.nutritionConfigService.createNutritionCard(
                'carbohydrates',
                this.todaysCarbohydrates
            ),
            this.nutritionConfigService.createNutritionCard(
                'fiber',
                this.todaysFiber
            ),
            this.nutritionConfigService.createNutritionCard(
                'caffeine',
                this.todaysCaffeine
            ),
        ];
    }

    onImageError(event: any) {
        event.target.style.display = 'none';
    }
}
