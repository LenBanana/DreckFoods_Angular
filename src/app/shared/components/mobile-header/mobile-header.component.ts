import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {ThemeService} from '../../../core/services/theme.service';
import {User} from '../../../core/models/auth.models';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss'],
})
export class MobileHeaderComponent {
  currentUser: User | null = null;
  currentTheme = 'light';
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
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

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
