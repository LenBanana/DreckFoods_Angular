import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AlertComponent } from '../alert/alert.component';
import { AlertService } from '../../../core/services/alert.service';
import { Alert } from '../../../core/models/alert.models';

@Component({
  selector: 'app-alert-container',
  standalone: true,
  imports: [CommonModule, AlertComponent],
  template: `
    <div class="alert-container-wrapper" *ngIf="topRightAlerts.length > 0">
      <app-alert
        *ngFor="let alert of topRightAlerts; trackBy: trackByAlertId"
        [alert]="alert"
        (dismiss)="onDismiss($event)"
      ></app-alert>
    </div>
    <div class="alert-container-centered" *ngIf="centeredAlerts.length > 0">
      <app-alert
        *ngFor="let alert of centeredAlerts; trackBy: trackByAlertId"
        [alert]="alert"
        (dismiss)="onDismiss($event)"
      ></app-alert>
    </div>
  `,
  styles: [
    `
      .alert-container-wrapper {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        max-width: 420px;
        width: 100%;
        pointer-events: none;
      }

      .alert-container-wrapper > * {
        pointer-events: auto;
      }

      .alert-container-centered {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        max-width: 500px;
        width: 90%;
        pointer-events: none;
      }

      .alert-container-centered > * {
        pointer-events: auto;
      }

      @media (max-width: 768px) {
        .alert-container-wrapper {
          top: 0.5rem;
          right: 0.5rem;
          left: 0.5rem;
          max-width: none;
        }

        .alert-container-centered {
          width: 95%;
          max-width: none;
        }
      }
    `,
  ],
})
export class AlertContainerComponent implements OnDestroy {
  private alertService = inject(AlertService);
  private destroy$ = new Subject<void>();

  alerts: Alert[] = [];

  get topRightAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.centered);
  }

  get centeredAlerts(): Alert[] {
    return this.alerts.filter((alert) => alert.centered);
  }

  constructor() {
    this.alertService.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((alerts) => {
        this.alerts = alerts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDismiss(alertId: string): void {
    this.alertService.removeAlert(alertId);
  }

  trackByAlertId(index: number, alert: Alert): string {
    return alert.id;
  }
}
