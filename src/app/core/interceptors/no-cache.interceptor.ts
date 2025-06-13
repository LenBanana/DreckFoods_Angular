import {HttpInterceptorFn} from '@angular/common/http';

export const noCacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (shouldDisableCache(req.url)) {
    const noCacheReq = req.clone({
      setHeaders: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    return next(noCacheReq);
  }

  return next(req);
};

function shouldDisableCache(url: string): boolean {
  const dynamicEndpoints = [
    '/api/food/entries',
    '/api/meals',
    '/api/weight',
    '/api/timeline',
    '/api/user/profile',
  ];

  return dynamicEndpoints.some((endpoint) => url.includes(endpoint));
}
