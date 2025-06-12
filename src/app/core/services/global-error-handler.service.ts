import { Injectable, ErrorHandler, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private router = inject(Router);
  private alertService = inject(AlertService);

  handleError(error: any): void {
    console.error('Global error caught:', error);

    // Check if it's a chunk loading error (common in PWAs)
    if (this.isChunkLoadError(error)) {
      this.handleChunkLoadError();
      return;
    }

    // Check if it's a network error
    if (this.isNetworkError(error)) {
      this.handleNetworkError(error);
      return;
    }

    // Check if it's a route error
    if (this.isRouteError(error)) {
      this.handleRouteError(error);
      return;
    }

    // Generic error handling
    this.handleGenericError(error);
  }

  private isChunkLoadError(error: any): boolean {
    return error?.message?.includes('Loading chunk') ||
           error?.message?.includes('ChunkLoadError') ||
           error?.message?.includes('Loading CSS chunk');
  }

  private isNetworkError(error: any): boolean {
    return error?.status === 0 ||
           error?.message?.includes('Network') ||
           error?.name === 'NetworkError';
  }

  private isRouteError(error: any): boolean {
    return error?.message?.includes('Cannot match any routes') ||
           error?.rejection?.message?.includes('Cannot match any routes');
  }

  private handleChunkLoadError(): void {
    this.alertService.warning(
      'The application has been updated. Please refresh the page to load the latest version.',
      'Update Available',
      {
        autoDismiss: false,
        actions: [
          {
            label: 'Refresh Now',
            action: () => window.location.reload(),
            primary: true
          },
          {
            label: 'Later',
            action: () => {},
            primary: false
          }
        ]
      }
    );
  }

  private handleNetworkError(error: any): void {
    if (!navigator.onLine) {
      this.alertService.warning(
        'You appear to be offline. Please check your internet connection and try again.',
        'No Internet Connection'
      );
    } else {
      this.alertService.error(
        'A network error occurred. Please try again.',
        'Connection Error'
      );
    }
  }

  private handleRouteError(error: any): void {
    console.warn('Route error, redirecting to dashboard:', error);
    this.router.navigate(['/dashboard']).catch(routeError => {
      console.error('Failed to navigate to dashboard:', routeError);
      // Last resort - reload the page
      window.location.href = '/dashboard';
    });
  }

  private handleGenericError(error: any): void {
    // Don't show error alerts for development console warnings
    if (error?.message?.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      return;
    }

    this.alertService.error(
      'An unexpected error occurred. If this problem persists, please refresh the page.',
      'Application Error'
    );
  }
}
