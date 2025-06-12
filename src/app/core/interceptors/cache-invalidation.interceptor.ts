import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CacheInvalidationService } from '../services/cache-invalidation.service';

export const cacheInvalidationInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheInvalidationService = inject(CacheInvalidationService);

  // Only handle mutation operations (POST, PUT, PATCH, DELETE)
  const isMutationRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  
  if (!isMutationRequest) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        // Only invalidate cache on successful responses
        if (event instanceof HttpResponse && event.status >= 200 && event.status < 300) {
          // Immediate cache invalidation for live data
          setTimeout(() => {
            invalidateCacheForEndpoint(req.url, cacheInvalidationService);
          }, 100); // Small delay to ensure response is processed
        }
      },
      error: (error) => {
        // Don't invalidate cache on errors
        console.log('Request failed, not invalidating cache:', error.status);
      }
    })
  );
};

function invalidateCacheForEndpoint(url: string, cacheService: CacheInvalidationService): void {
  console.log('Invalidating cache for URL:', url);

  // Food entries related endpoints
  if (url.includes('/api/food/entries')) {
    cacheService.invalidateFoodEntriesCache();
    return;
  }

  // Meals related endpoints
  if (url.includes('/api/meals')) {
    cacheService.invalidateMealsCache();
    return;
  }

  // Weight related endpoints
  if (url.includes('/api/weight')) {
    cacheService.invalidateWeightCache();
    return;
  }

  // User profile related endpoints
  if (url.includes('/api/user/profile')) {
    cacheService.invalidateProfileCache();
    return;
  }

  // Timeline related endpoints
  if (url.includes('/api/timeline')) {
    cacheService.invalidateApiCache(['/api/timeline']);
    return;
  }

  // Default: clear all dynamic cache for unspecified API endpoints
  if (url.includes('/api/')) {
    cacheService.clearAllDynamicCache();
  }
}
