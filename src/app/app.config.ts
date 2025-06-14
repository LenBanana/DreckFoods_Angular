import {ApplicationConfig, ErrorHandler, provideZoneChangeDetection,} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';

import {routes} from './app.routes';
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {cacheInvalidationInterceptor} from './core/interceptors/cache-invalidation.interceptor';
import {noCacheInterceptor} from './core/interceptors/no-cache.interceptor';
import {timeoutInterceptor} from './core/interceptors/timeout.interceptor';
import {GlobalErrorHandler} from './core/services/global-error-handler.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        noCacheInterceptor,
        authInterceptor,
        cacheInvalidationInterceptor,
        timeoutInterceptor,
      ]),
    ),
    {provide: ErrorHandler, useClass: GlobalErrorHandler},
  ],
};
