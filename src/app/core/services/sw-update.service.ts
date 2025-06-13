import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root',
})
export class SwUpdateService {
  private swUpdate = inject(SwUpdate);
  private alertService = inject(AlertService);
  private updateCheckInterval: any;
  private promptedForUpdate = false;

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.initializeSwUpdates();
    }
  }

  private initializeSwUpdates(): void {
    this.startUpdateChecks();

    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
      )
      .subscribe(() => {
        if (!this.promptedForUpdate) {
          this.promptedForUpdate = true;
          this.promptForUpdate();
        }
      });

    this.swUpdate.unrecoverable.subscribe(() => {
      this.handleUnrecoverableState();
    });

    this.clearStaleCache();
  }

  private startUpdateChecks(): void {
    this.updateCheckInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates();
      }
    }, 300000);
  }
  private clearStaleCache(): void {
    if ('caches' in window) {
      caches
        .keys()
        .then((cacheNames) => {
          const staleCache = cacheNames.filter(
            (cacheName) =>
              cacheName.includes('api-dynamic-data') ||
              cacheName.includes('ngsw:db') ||
              cacheName.includes('dynamic'),
          );

          return Promise.all(
            staleCache.map((cacheName) => {
              return caches.delete(cacheName);
            }),
          );
        })
        .catch((err) => {
          console.warn('Failed to clear stale cache:', err);
        });
    }
  }

  private promptForUpdate(): void {
    this.alertService.warning(
      'A new version of the app is available. Please update to get the latest features and improvements.',
      'Update Available',
      {
        autoDismiss: false,
        actions: [
          {
            label: 'Update Now',
            action: () => this.activateUpdate(),
            primary: true,
          },
          {
            label: 'Later',
            action: () => {},
            primary: false,
          },
        ],
      },
    );
  }

  private activateUpdate(): void {
    this.swUpdate
      .activateUpdate()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error('Error activating service worker update:', err);
        this.alertService.error(
          'Failed to update the app. Please refresh the page manually.',
          'Update Failed',
        );
      });
  }
  private handleUnrecoverableState(): void {
    this.alertService.error(
      'The app has encountered an unrecoverable error. Please reload the page.',
      'App Error',
      {
        autoDismiss: false,
        actions: [
          {
            label: 'Clear Cache & Reload',
            action: () => this.forceRefresh(),
            primary: true,
          },
          {
            label: 'Simple Reload',
            action: () => window.location.reload(),
            primary: false,
          },
        ],
      },
    );
  }
  public checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().catch((err) => {
        console.error('Manual update check failed:', err);
      });
    }
  }

  public clearApiCache(): void {
    if ('caches' in window) {
      caches
        .keys()
        .then((cacheNames) => {
          const apiCaches = cacheNames.filter(
            (name) =>
              name.includes('api-dynamic-data') || name.includes('ngsw:db'),
          );

          return Promise.all(
            apiCaches.map((cacheName) => {
              return caches.delete(cacheName);
            }),
          );
        })
        .catch((err) => {
          console.error('Failed to clear API cache:', err);
        });
    }
  }

  public forceRefresh(): void {
    this.clearApiCache();
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }
}
