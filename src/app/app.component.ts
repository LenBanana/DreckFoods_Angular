import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { HeaderComponent } from './shared/components/header/header.component';
import { AlertContainerComponent } from './shared/components/alert-container/alert-container.component';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, AlertContainerComponent],
  template: `
    <div class="app">
      <app-header *ngIf="showHeader"></app-header>
      <main class="main-content" [class.with-header]="showHeader">
        <router-outlet></router-outlet>
      </main>
      <app-alert-container></app-alert-container>
    </div>
  `,
  styles: [`
      :host {
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .main-content {
          min-height: 100vh;
          transition: all 0.3s ease;
        }

        .main-content.with-header {
          min-height: calc(100vh - 70px);
          padding-top: 70px;
        }

        .main-content:not(.with-header) {
          padding: 0;
        }
      }

      // Dark theme support
      [data-theme='dark'] {
        :host {
          .app {
            background: linear-gradient(135deg, #1e1e2f 0%, #2c2c3f 100%);
          }
        }
      }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService); // Initialize theme service
  private router = inject(Router);

  showHeader = false;

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.showHeader = !event.url.startsWith('/auth');
      });
  }
}
