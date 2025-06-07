import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { format } from 'date-fns';

import { FoodService } from '../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { FoodEntryDto } from '../../core/models/food.models';
import { User } from '../../core/models/auth.models';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    private foodService = inject(FoodService);
    private userService = inject(UserService);

    currentUser: User | null = null;
    isLoading = true;
    todaysFoodEntries: FoodEntryDto[] = [];
    todaysCalories = 0;
    todaysProtein = 0;
    currentWeight: number | undefined = undefined;

    navs = [
        { path: '/food/search', icon: 'search', title: 'Add Food', desc: 'Search and log your meals' },
        { path: '/weight', icon: 'ruler', title: 'Log Weight', desc: 'Track your weight progress' },
        { path: '/timeline', icon: 'chart-line', title: 'View Timeline', desc: 'See your nutrition timeline' },
        { path: '/profile', icon: 'cog', title: 'Settings', desc: 'Update your profile' }
    ];

    ngOnInit() {
        this.userService.getProfile().subscribe({
            next: (user) => {
                this.currentUser = user;
                this.currentWeight = user.currentWeight;
            },
            error: (error) => {
                console.error('Error loading user profile:', error);
            }
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
            }
        });
    }

    private calculateTodaysNutrition() {
        this.todaysCalories = this.todaysFoodEntries.reduce((sum, entry) => sum + entry.calories, 0);
        this.todaysProtein = this.todaysFoodEntries.reduce((sum, entry) => sum + entry.protein, 0);
    }

    onImageError(event: any) {
        event.target.style.display = 'none';
    }
}
