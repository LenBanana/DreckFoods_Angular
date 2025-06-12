import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { HeaderComponent } from './shared/components/header/header.component';
import { MobileHeaderComponent } from './shared/components/mobile-header/mobile-header.component';
import { MobileNavComponent } from './shared/components/mobile-nav/mobile-nav.component';
import { AlertContainerComponent } from './shared/components/alert-container/alert-container.component';
import { AppLifecycleService, AppState } from './core/services/app-lifecycle.service';
import { SwUpdateService } from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, MobileHeaderComponent, MobileNavComponent, AlertContainerComponent],  template: `
    <div class="app">
      <app-header *ngIf="showHeader"></app-header>
      <app-mobile-header *ngIf="showHeader"></app-mobile-header>
      <main class="main-content" [class.with-header]="showHeader">
        <router-outlet></router-outlet>
      </main>
      <app-mobile-nav *ngIf="showHeader"></app-mobile-nav>
      <app-alert-container></app-alert-container>
    </div>
  `,  styles: [`
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
        }        // Add bottom padding for mobile navigation
        @media (max-width: 991.98px) {
          .main-content {
            padding-bottom: calc(80px + env(safe-area-inset-bottom));
          }

          .main-content.with-header {
            min-height: calc(100vh - 80px - env(safe-area-inset-bottom));
            padding-top: 0;
            padding-bottom: calc(80px + env(safe-area-inset-bottom));
          }
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
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private lifecycleService = inject(AppLifecycleService);
  private swUpdateService = inject(SwUpdateService);
  private destroy$ = new Subject<void>();

  showHeader = false;
  isAppActive = true;
  ngOnInit() {
    // Initialize lifecycle service
    this.lifecycleService.markAsActive();

    // Initialize service worker updates
    this.swUpdateService.checkForUpdates();

    // Monitor app state changes
    this.lifecycleService.appState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isAppActive = state === AppState.ACTIVE;
        
        // Handle app state changes
        if (state === AppState.ACTIVE) {
          console.log('App became active');
          // Check for updates when app becomes active
          this.swUpdateService.checkForUpdates();
        } else if (state === AppState.HIDDEN) {
          console.log('App hidden - saving state');
        }
      });

    // Monitor route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.showHeader = !event.url.startsWith('/auth');
        this.lifecycleService.markAsActive();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
