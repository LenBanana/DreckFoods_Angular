import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert, AlertConfig, AlertType, ConfirmationConfig } from '../models/alert.models';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private alertIdCounter = 0;

  alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  /**
   * Add a new alert
   */
  addAlert(config: AlertConfig): string {
    const id = `alert-${++this.alertIdCounter}`;
    const alert: Alert = {
      id,
      type: config.type,
      title: config.title,
      message: config.message,
      autoDismiss: config.autoDismiss ?? true,
      duration: config.duration ?? this.getDefaultDuration(config.type),
      actions: config.actions,
      centered: config.centered ?? false
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, alert]);

    // Auto dismiss if enabled
    if (alert.autoDismiss && alert.duration) {
      setTimeout(() => {
        this.removeAlert(id);
      }, alert.duration);
    }

    return id;
  }

  /**
   * Remove an alert by ID
   */
  removeAlert(id: string): void {
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.filter(alert => alert.id !== id);
    this.alertsSubject.next(updatedAlerts);
  }

  /**
   * Clear all alerts
   */
  clearAll(): void {
    this.alertsSubject.next([]);
  }

  /**
   * Convenience methods for different alert types
   */
  success(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.SUCCESS,
      title,
      message,
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.ERROR,
      title,
      message,
      autoDismiss: false, // Errors typically shouldn't auto-dismiss
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.WARNING,
      title,
      message,
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.INFO,
      title,
      message,
      ...options
    });
  }

  /**
   * Centered alert methods for important notifications
   */
  successCentered(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.SUCCESS,
      title,
      message,
      centered: true,
      ...options
    });
  }

  errorCentered(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.ERROR,
      title,
      message,
      autoDismiss: false,
      centered: true,
      ...options
    });
  }

  warningCentered(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.WARNING,
      title,
      message,
      centered: true,
      ...options
    });
  }

  infoCentered(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.INFO,
      title,
      message,
      centered: true,
      ...options
    });
  }

  /**
   * Show a confirmation dialog (centered by default)
   * Returns a Promise that resolves to true if confirmed, false if cancelled
   */
  confirm(config: ConfirmationConfig): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const confirmLabel = config.confirmLabel || 'Confirm';
      const cancelLabel = config.cancelLabel || 'Cancel';
      const confirmButtonType = config.confirmButtonType || 'primary';

      this.addAlert({
        type: AlertType.CONFIRM,
        title: config.title,
        message: config.message,
        autoDismiss: false,
        centered: true, // Confirmations should be centered by default
        actions: [
          {
            label: cancelLabel,
            action: () => resolve(false),
            primary: false
          },
          {
            label: confirmLabel,
            action: () => resolve(true),
            primary: true,
            buttonType: confirmButtonType
          }
        ]
      });
    });
  }

  /**
   * Quick confirmation for delete operations
   */
  confirmDelete(itemName: string, customMessage?: string): Promise<boolean> {
    return this.confirm({
      title: 'Confirm Delete',
      message: customMessage || `Are you sure you want to delete "${itemName}"?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      confirmButtonType: 'danger'
    });
  }

  /**
   * Quick confirmation for general actions
   */
  confirmAction(message: string, title?: string): Promise<boolean> {
    return this.confirm({
      title: title || 'Confirm Action',
      message,
      confirmLabel: 'Yes',
      cancelLabel: 'No'
    });
  }

  private getDefaultDuration(type: AlertType): number {
    switch (type) {
      case AlertType.SUCCESS:
        return 5000; // 5 seconds
      case AlertType.INFO:
        return 7000; // 7 seconds
      case AlertType.WARNING:
        return 10000; // 10 seconds
      case AlertType.ERROR:
      case AlertType.CONFIRM:
        return 0; // No auto-dismiss for errors and confirmations
      default:
        return 5000;
    }
  }
}
