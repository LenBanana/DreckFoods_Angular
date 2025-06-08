import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);  navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { 
      label: 'Food', 
      children: [
        { path: '/food/entries', label: 'Food Entries' },
        { path: '/food/meals', label: 'Meals' },
        { path: '/food/search', label: 'Food Search' }
      ]
    },
    { path: '/weight', label: 'Weight' },
    { path: '/timeline', label: 'Timeline' },
  ];

  currentUser: User | null = null;
  currentTheme: Theme = 'light';
  isUserMenuOpen = false;

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to theme changes
    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    // Close user menu when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.isUserMenuOpen = false;
      }
    });
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (
      (first + last).toUpperCase() ||
      this.currentUser.email.charAt(0).toUpperCase()
    );
  }

  logout() {
    this.authService.logout();
    this.closeUserMenu();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }
}
