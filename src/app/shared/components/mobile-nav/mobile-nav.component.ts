import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {User} from '../../../core/models/auth.models';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss'],
})
export class MobileNavComponent {
  currentUser: User | null = null;
  navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
    },
    {
      path: '/food',
      label: 'Food',
      icon: 'fas fa-utensils',
      children: [
        {path: '/food/entries', label: 'Food Entries', icon: 'fas fa-list'},
        {path: '/food/meals', label: 'Meals', icon: 'fas fa-hamburger'},
        {path: '/food/search', label: 'Food Search', icon: 'fas fa-search'},
      ],
    },
    {
      path: '/weight',
      label: 'Weight',
      icon: 'fas fa-weight-scale',
    },
    {
      path: '/timeline',
      label: 'Timeline',
      icon: 'fas fa-chart-line',
    },
  ];
  showFoodSubmenu = false;
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleFoodSubmenu() {
    this.showFoodSubmenu = !this.showFoodSubmenu;
  }

  navigateToFood() {
    if (this.showFoodSubmenu) {
      this.showFoodSubmenu = false;
      return;
    }

    this.showFoodSubmenu = true;
  }

  navigateToFoodChild(path: string) {
    this.showFoodSubmenu = false;
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    if (path === '/food') {
      return this.router.url.startsWith('/food');
    }
    return this.router.url === path;
  }
}
