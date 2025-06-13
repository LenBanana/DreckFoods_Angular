import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterLinkActive,} from '@angular/router';

import {AuthService} from '../../../core/services/auth.service';
import {Theme, ThemeService} from '../../../core/services/theme.service';
import {AppRole, User} from '../../../core/models/auth.models';
import {filter} from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  navLinks = [
    {path: '/dashboard', label: 'Dashboard'},
    {
      label: 'Food',
      children: [
        {path: '/food/entries', label: 'Food Entries'},
        {path: '/food/meals', label: 'Meals'},
        {path: '/food/search', label: 'Food Search'},
      ],
    },
    {path: '/weight', label: 'Weight'},
    {path: '/timeline', label: 'Timeline'},
  ];
  AppRole = AppRole;
  currentUser: User | null = null;
  currentTheme: Theme = 'light';
  isUserMenuOpen = false;
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  constructor(private router: Router) {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        this.isUserMenuOpen = false;
      }
    });
  }

  get isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.collapseNavbar();
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

  private collapseNavbar() {
    const navbarCollapse = document.getElementById('mainNav');
    const navbarToggler = document.querySelector(
      '.navbar-toggler',
    ) as HTMLElement;

    if (navbarCollapse?.classList.contains('show')) {
      const bsCollapse = new (window as any).bootstrap.Collapse(
        navbarCollapse,
        {
          toggle: false,
        },
      );
      bsCollapse.hide();

      navbarToggler?.setAttribute('aria-expanded', 'false');
    }
  }
}
