import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root',
})
export class CacheInvalidationService {
  private swUpdate = inject(SwUpdate);

  constructor() {}

  /**
   * Invalidate cache for specific API endpoints after mutations
   */
  public invalidateApiCache(endpoints?: string[]): void {
    if (!('caches' in window)) {
      return;
    }

    caches
      .keys()
      .then((cacheNames) => {
        const promises = cacheNames
          .filter((cacheName) => this.shouldClearCache(cacheName, endpoints))
          .map((cacheName) => this.clearSpecificCache(cacheName, endpoints));

        return Promise.all(promises);
      })
      .catch((err) => {
        console.error('Failed to invalidate cache:', err);
      });
  }
  /**
   * Clear cache after food entry updates
   */
  public invalidateFoodEntriesCache(): void {
    this.invalidateApiCache([
      '/api/food/entries',
      '/api/timeline',
      '/api/user/profile',
      '/api/dashboard',
    ]);

    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after meal updates
   */
  public invalidateMealsCache(): void {
    this.invalidateApiCache([
      '/api/meals',
      '/api/food/entries',
      '/api/timeline',
    ]);

    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after weight updates
   */
  public invalidateWeightCache(): void {
    this.invalidateApiCache(['/api/weight', '/api/user/profile']);

    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after profile updates
   */
  public invalidateProfileCache(): void {
    this.invalidateApiCache(['/api/user/profile']);

    this.clearAllDynamicCache();
  }

  /**
   * Force clear all dynamic data cache
   */
  public clearAllDynamicCache(): void {
    if (!('caches' in window)) {
      return;
    }

    caches
      .keys()
      .then((cacheNames) => {
        const dynamicCaches = cacheNames.filter(
          (name) =>
            name.includes('api-dynamic-data') || name.includes('ngsw:db'),
        );

        return Promise.all(
          dynamicCaches.map((cacheName) => {
            return caches.delete(cacheName);
          }),
        );
      })
      .catch((err) => {
        console.error('Failed to clear dynamic cache:', err);
      });
  }

  private shouldClearCache(cacheName: string, endpoints?: string[]): boolean {
    if (
      cacheName.includes('api-dynamic-data') ||
      cacheName.includes('ngsw:db')
    ) {
      return true;
    }

    if (endpoints && endpoints.length > 0) {
      return endpoints.some((endpoint) =>
        cacheName.includes(endpoint.replace(/\//g, ':')),
      );
    }

    return false;
  }

  private async clearSpecificCache(
    cacheName: string,
    endpoints?: string[],
  ): Promise<void> {
    try {
      const cache = await caches.open(cacheName);

      if (endpoints && endpoints.length > 0) {
        const keys = await cache.keys();
        const urlsToDelete = keys.filter((request) =>
          endpoints.some((endpoint) => request.url.includes(endpoint)),
        );

        await Promise.all(
          urlsToDelete.map((request) => {
            return cache.delete(request);
          }),
        );
      } else {
        await caches.delete(cacheName);
      }
    } catch (error) {
      console.error('Failed to clear specific cache:', cacheName, error);
    }
  }
}
