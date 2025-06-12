import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
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

    caches.keys().then(cacheNames => {
      const promises = cacheNames
        .filter(cacheName => this.shouldClearCache(cacheName, endpoints))
        .map(cacheName => this.clearSpecificCache(cacheName, endpoints));

      return Promise.all(promises);
    }).then(() => {
      console.log('Cache invalidated successfully');
    }).catch(err => {
      console.error('Failed to invalidate cache:', err);
    });
  }
  /**
   * Clear cache after food entry updates
   */
  public invalidateFoodEntriesCache(): void {
    console.log('Invalidating food entries cache...');
    this.invalidateApiCache([
      '/api/food/entries',
      '/api/timeline',
      '/api/user/profile', // Profile might contain updated stats
      '/api/dashboard' // Dashboard shows summary data
    ]);
    
    // Also clear any service worker dynamic data cache
    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after meal updates
   */
  public invalidateMealsCache(): void {
    console.log('Invalidating meals cache...');
    this.invalidateApiCache([
      '/api/meals',
      '/api/food/entries',
      '/api/timeline'
    ]);
    
    // Also clear any service worker dynamic data cache
    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after weight updates
   */
  public invalidateWeightCache(): void {
    console.log('Invalidating weight cache...');
    this.invalidateApiCache([
      '/api/weight',
      '/api/user/profile'
    ]);
    
    // Also clear any service worker dynamic data cache
    this.clearAllDynamicCache();
  }

  /**
   * Clear cache after profile updates
   */
  public invalidateProfileCache(): void {
    console.log('Invalidating profile cache...');
    this.invalidateApiCache([
      '/api/user/profile'
    ]);
    
    // Also clear any service worker dynamic data cache
    this.clearAllDynamicCache();
  }

  /**
   * Force clear all dynamic data cache
   */
  public clearAllDynamicCache(): void {
    if (!('caches' in window)) {
      return;
    }

    caches.keys().then(cacheNames => {
      const dynamicCaches = cacheNames.filter(name => 
        name.includes('api-dynamic-data') || 
        name.includes('ngsw:db')
      );

      return Promise.all(
        dynamicCaches.map(cacheName => {
          console.log('Clearing dynamic cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All dynamic cache cleared');
    }).catch(err => {
      console.error('Failed to clear dynamic cache:', err);
    });
  }

  private shouldClearCache(cacheName: string, endpoints?: string[]): boolean {
    // Always clear dynamic data caches
    if (cacheName.includes('api-dynamic-data') || cacheName.includes('ngsw:db')) {
      return true;
    }

    // If specific endpoints are provided, check if cache contains them
    if (endpoints && endpoints.length > 0) {
      return endpoints.some(endpoint => cacheName.includes(endpoint.replace(/\//g, ':')));
    }

    return false;
  }

  private async clearSpecificCache(cacheName: string, endpoints?: string[]): Promise<void> {
    try {
      const cache = await caches.open(cacheName);
      
      if (endpoints && endpoints.length > 0) {
        // Clear specific URLs from cache
        const keys = await cache.keys();
        const urlsToDelete = keys.filter(request => 
          endpoints.some(endpoint => request.url.includes(endpoint))
        );

        await Promise.all(
          urlsToDelete.map(request => {
            console.log('Clearing cached URL:', request.url);
            return cache.delete(request);
          })
        );
      } else {
        // Clear entire cache
        console.log('Clearing entire cache:', cacheName);
        await caches.delete(cacheName);
      }
    } catch (error) {
      console.error('Failed to clear specific cache:', cacheName, error);
    }
  }
}
