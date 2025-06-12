import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, interval } from 'rxjs';
import { AlertService } from './alert.service';

@Injectable({
    providedIn: 'root'
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
        // Check for updates periodically when app is active
        this.startUpdateChecks();

        // Listen for version ready events
        this.swUpdate.versionUpdates
            .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
            .subscribe(() => {
                console.log('New version available');
                if (!this.promptedForUpdate) {
                    this.promptedForUpdate = true;
                    this.promptForUpdate();
                }
            });

        // Listen for unrecoverable state
        this.swUpdate.unrecoverable.subscribe(() => {
            this.handleUnrecoverableState();
        });

        // Clear cache on app start to ensure fresh data
        this.clearStaleCache();
    }

    private startUpdateChecks(): void {
        // Check for updates every 5 minutes when app is active
        this.updateCheckInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.checkForUpdates();
            }
        }, 300000); // 5 minutes
    }
    private clearStaleCache(): void {
        // Clear service worker cache for dynamic data on app start to ensure fresh data
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                const staleCache = cacheNames.filter(cacheName =>
                    cacheName.includes('api-dynamic-data') ||
                    cacheName.includes('ngsw:db') ||
                    cacheName.includes('dynamic')
                );

                return Promise.all(
                    staleCache.map(cacheName => {
                        console.log('Clearing stale cache on startup:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('Stale cache cleared on app startup');
            }).catch(err => {
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
                        primary: true
                    },
                    {
                        label: 'Later',
                        action: () => { },
                        primary: false
                    }
                ]
            }
        );
    }

    private activateUpdate(): void {
        this.swUpdate.activateUpdate().then(() => {
            console.log('Service worker updated successfully');
            // Reload the page to use the new version
            window.location.reload();
        }).catch(err => {
            console.error('Error activating service worker update:', err);
            this.alertService.error(
                'Failed to update the app. Please refresh the page manually.',
                'Update Failed'
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
                        primary: true
                    },
                    {
                        label: 'Simple Reload',
                        action: () => window.location.reload(),
                        primary: false
                    }
                ]
            }
        );
    }
    public checkForUpdates(): void {
        if (this.swUpdate.isEnabled) {
            this.swUpdate.checkForUpdate().then(updateFound => {
                if (updateFound) {
                    console.log('Service worker update found');
                } else {
                    console.log('No service worker updates available');
                }
            }).catch(err => {
                console.error('Manual update check failed:', err);
            });
        }
    }

    public clearApiCache(): void {
        // Method to clear API cache when needed
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                const apiCaches = cacheNames.filter(name =>
                    name.includes('api-dynamic-data') ||
                    name.includes('ngsw:db')
                );

                return Promise.all(
                    apiCaches.map(cacheName => {
                        console.log('Clearing API cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('API cache cleared successfully');
            }).catch(err => {
                console.error('Failed to clear API cache:', err);
            });
        }
    }

    public forceRefresh(): void {
        // Force a complete refresh, clearing all caches
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
