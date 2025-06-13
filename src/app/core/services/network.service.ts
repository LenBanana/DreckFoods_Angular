import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';

export interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    online: navigator.onLine,
  });

  public networkStatus$ = this.networkStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    const online$ = fromEvent(window, 'online').pipe(map(() => true));
    const offline$ = fromEvent(window, 'offline').pipe(map(() => false));

    merge(online$, offline$)
      .pipe(startWith(navigator.onLine), distinctUntilChanged())
      .subscribe((online) => {
        this.updateNetworkStatus({ online });
      });

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      if (connection) {
        this.updateNetworkStatus({
          online: navigator.onLine,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });

        fromEvent(connection, 'change').subscribe(() => {
          this.updateNetworkStatus({
            online: navigator.onLine,
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          });
        });
      }
    }
  }

  private updateNetworkStatus(status: NetworkStatus): void {
    this.networkStatusSubject.next(status);
  }

  public getCurrentStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }

  public isOnline(): boolean {
    return this.networkStatusSubject.value.online;
  }

  public isSlowConnection(): boolean {
    const status = this.networkStatusSubject.value;
    return (
      status.effectiveType === 'slow-2g' ||
      status.effectiveType === '2g' ||
      (status.rtt !== undefined && status.rtt > 1000)
    );
  }
}
