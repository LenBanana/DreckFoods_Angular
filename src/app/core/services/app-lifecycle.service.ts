import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, fromEvent, merge} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter} from 'rxjs/operators';

import {AuthService} from './auth.service';
import {TokenService} from './token.service';
import {NetworkService} from './network.service';

export enum AppState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  HIDDEN = 'hidden',
  SUSPENDED = 'suspended',
}

@Injectable({
  providedIn: 'root',
})
export class AppLifecycleService {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);
  private networkService = inject(NetworkService);

  private appStateSubject = new BehaviorSubject<AppState>(AppState.ACTIVE);
  public appState$ = this.appStateSubject.asObservable();

  private lastActiveTime = Date.now();
  private stateStorageKey = 'dreckfoods_app_state';
  private lastRouteKey = 'dreckfoods_last_route';

  constructor() {
    this.initializeLifecycleListeners();
    this.restoreAppState();
  }

  public getCurrentState(): AppState {
    return this.appStateSubject.value;
  }

  public getTimeSinceLastActive(): number {
    return Date.now() - this.lastActiveTime;
  }

  public markAsActive(): void {
    this.lastActiveTime = Date.now();
    this.appStateSubject.next(AppState.ACTIVE);
  }

  private initializeLifecycleListeners(): void {
    if (typeof document !== 'undefined') {
      fromEvent(document, 'visibilitychange').subscribe(() => {
        if (document.hidden) {
          this.handleAppHidden();
        } else {
          this.handleAppVisible();
        }
      });
    }

    if (typeof window !== 'undefined') {
      merge(
        fromEvent(window, 'focus'),
        fromEvent(window, 'blur'),
        fromEvent(window, 'beforeunload'),
        fromEvent(window, 'pagehide'),
        fromEvent(window, 'pageshow'),
      )
        .pipe(debounceTime(100), distinctUntilChanged())
        .subscribe((event) => {
          this.handleWindowEvent(event);
        });

      fromEvent(window, 'storage').subscribe((event: any) => {
        if (event.key === this.stateStorageKey) {
          this.handleStorageChange(event);
        }
      });
    }
  }

  private handleWindowEvent(event: Event): void {
    switch (event.type) {
      case 'focus':
        this.handleAppVisible();
        break;
      case 'blur':
        this.handleAppHidden();
        break;
      case 'beforeunload':
      case 'pagehide':
        this.saveAppState();
        break;
      case 'pageshow':
        this.handleAppVisible();
        break;
    }
  }

  private handleAppVisible(): void {
    this.lastActiveTime = Date.now();
    this.appStateSubject.next(AppState.ACTIVE);

    this.validateAndRefreshAuth();

    this.restoreRoute();
  }

  private handleAppHidden(): void {
    this.appStateSubject.next(AppState.HIDDEN);
    this.saveAppState();
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.newValue) {
      try {
        const state = JSON.parse(event.newValue);
        if (state.timestamp && Date.now() - state.timestamp < 5000) {
          this.appStateSubject.next(state.appState);
        }
      } catch (error) {
        console.warn('Failed to parse storage state:', error);
      }
    }
  }

  private validateAndRefreshAuth(): void {
    const timeSinceActive = Date.now() - this.lastActiveTime;

    if (timeSinceActive > 30000) {
      const token = this.tokenService.getToken();

      if (token && !this.tokenService.isTokenValid()) {
        this.authService.logout();
        return;
      }

      if (
        token &&
        this.tokenService.isTokenValid() &&
        this.networkService.isOnline()
      ) {
        this.refreshUserSession();
      }
    }
  }

  private refreshUserSession(): void {
    this.authService.currentUser$
      .pipe(filter((user) => user !== null))
      .subscribe({
        error: (error) => {
          console.error('Failed to refresh user session:', error);
          if (error.status === 401 || error.status === 403) {
            this.authService.logout();
          }
        },
      });
  }

  private saveAppState(): void {
    try {
      const currentRoute = this.router.url;
      const state = {
        appState: this.appStateSubject.value,
        timestamp: Date.now(),
        lastActiveTime: this.lastActiveTime,
        route: currentRoute,
      };

      localStorage.setItem(this.stateStorageKey, JSON.stringify(state));
      localStorage.setItem(this.lastRouteKey, currentRoute);
    } catch (error) {
      console.warn('Failed to save app state:', error);
    }
  }

  private restoreAppState(): void {
    try {
      const savedState = localStorage.getItem(this.stateStorageKey);
      if (savedState) {
        const state = JSON.parse(savedState);
        const timeSinceLastActive = Date.now() - (state.lastActiveTime || 0);

        if (timeSinceLastActive > 300000) {
          this.clearStoredState();
          return;
        }

        this.lastActiveTime = state.lastActiveTime || Date.now();

        if (state.appState !== AppState.HIDDEN) {
          this.appStateSubject.next(state.appState || AppState.ACTIVE);
        }
      }
    } catch (error) {
      console.warn('Failed to restore app state:', error);
      this.clearStoredState();
    }
  }

  private restoreRoute(): void {
    try {
      const savedRoute = localStorage.getItem(this.lastRouteKey);
      if (savedRoute && savedRoute !== this.router.url) {
        if (!savedRoute.includes('/auth/') && savedRoute !== '/') {
          setTimeout(() => {
            this.router.navigateByUrl(savedRoute);
          }, 100);
        }
      }
    } catch (error) {
      console.warn('Failed to restore route:', error);
    }
  }

  private clearStoredState(): void {
    try {
      localStorage.removeItem(this.stateStorageKey);
      localStorage.removeItem(this.lastRouteKey);
    } catch (error) {
      console.warn('Failed to clear stored state:', error);
    }
  }
}
