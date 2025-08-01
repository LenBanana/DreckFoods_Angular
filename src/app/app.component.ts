import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

import {HeaderComponent} from './shared/components/header/header.component';
import {MobileHeaderComponent} from './shared/components/mobile-header/mobile-header.component';
import {MobileNavComponent} from './shared/components/mobile-nav/mobile-nav.component';
import {AlertContainerComponent} from './shared/components/alert-container/alert-container.component';
import {AppLifecycleService, AppState,} from './core/services/app-lifecycle.service';
import {SwUpdateService} from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MobileHeaderComponent,
    MobileNavComponent,
    AlertContainerComponent,
  ],
  template: `
    <div class="app">
      <app-header *ngIf="showHeader"></app-header>
      <app-mobile-header *ngIf="showHeader"></app-mobile-header>
      <main class="main-content" [class.with-header]="showHeader">
        <router-outlet></router-outlet>
      </main>
      <app-mobile-nav *ngIf="showHeader"></app-mobile-nav>
      <app-alert-container></app-alert-container>
    </div>
  `,
  styles: [
    `
      :host {
        .app {
          min-height: 100vh;
          background: transparent;
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
    `,
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  showHeader = false;
  isAppActive = true;
  private router = inject(Router);
  private lifecycleService = inject(AppLifecycleService);
  private swUpdateService = inject(SwUpdateService);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.lifecycleService.markAsActive();
    this.swUpdateService.checkForUpdates();

    this.lifecycleService.appState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.isAppActive = state === AppState.ACTIVE;

        if (state === AppState.ACTIVE) {
          this.swUpdateService.checkForUpdates();
        }
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
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
