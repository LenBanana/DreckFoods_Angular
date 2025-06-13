import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators';
import { CacheInvalidationService } from '../services/cache-invalidation.service';

export const cacheInvalidationInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheInvalidationService = inject(CacheInvalidationService);

  const isMutationRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    req.method,
  );

  if (!isMutationRequest) {
    return next(req);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (
          event instanceof HttpResponse &&
          event.status >= 200 &&
          event.status < 300
        ) {
          setTimeout(() => {
            invalidateCacheForEndpoint(req.url, cacheInvalidationService);
          }, 100);
        }
      },
    }),
  );
};

function invalidateCacheForEndpoint(
  url: string,
  cacheService: CacheInvalidationService,
): void {
  if (url.includes('/api/food/entries')) {
    cacheService.invalidateFoodEntriesCache();
    return;
  }

  if (url.includes('/api/meals')) {
    cacheService.invalidateMealsCache();
    return;
  }

  if (url.includes('/api/weight')) {
    cacheService.invalidateWeightCache();
    return;
  }

  if (url.includes('/api/user/profile')) {
    cacheService.invalidateProfileCache();
    return;
  }

  if (url.includes('/api/timeline')) {
    cacheService.invalidateApiCache(['/api/timeline']);
    return;
  }

  if (url.includes('/api/')) {
    cacheService.clearAllDynamicCache();
  }
}
