import { HttpInterceptorFn } from '@angular/common/http';

export const noCacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Add no-cache headers for dynamic API endpoints
  if (shouldDisableCache(req.url)) {
    const noCacheReq = req.clone({
      setHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Adding no-cache headers for:', req.url);
    return next(noCacheReq);
  }

  return next(req);
};

function shouldDisableCache(url: string): boolean {
  // Disable cache for dynamic data endpoints
  const dynamicEndpoints = [
    '/api/food/entries',
    '/api/meals',
    '/api/weight',
    '/api/timeline',
    '/api/user/profile'
  ];

  // Also disable cache for mutation operations
  return dynamicEndpoints.some(endpoint => url.includes(endpoint));
}
