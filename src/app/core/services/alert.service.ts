import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Alert, AlertConfig, AlertType, AlertSize, ConfirmationConfig, InputPromptConfig } from '../models/alert.models';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  private alertIdCounter = 0;

  alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  /**
   * Add a new alert
   */  addAlert(config: AlertConfig): string {
    const id = `alert-${++this.alertIdCounter}`;
    const alert: Alert = {
      id,
      type: config.type,
      title: config.title,
      message: config.message,
      autoDismiss: config.autoDismiss ?? true,
      duration: config.duration ?? this.getDefaultDuration(config.type),
      actions: config.actions,
      centered: config.centered ?? false,
      inputConfig: config.inputConfig,
      size: config.size ?? AlertSize.MEDIUM
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
    // Clean up input callback when alert is removed
    this.inputCallbacks.delete(id);
    
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
   * Large alert methods for displaying long content
   */
  successLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.SUCCESS,
      title,
      message,
      size: AlertSize.LARGE,
      ...options
    });
  }

  errorLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.ERROR,
      title,
      message,
      autoDismiss: false,
      size: AlertSize.LARGE,
      ...options
    });
  }

  warningLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.WARNING,
      title,
      message,
      size: AlertSize.LARGE,
      ...options
    });
  }

  infoLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.INFO,
      title,
      message,
      size: AlertSize.LARGE,
      ...options
    });
  }

  /**
   * Extra large alert methods for displaying very long content
   */
  successExtraLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.SUCCESS,
      title,
      message,
      size: AlertSize.EXTRA_LARGE,
      ...options
    });
  }

  errorExtraLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.ERROR,
      title,
      message,
      autoDismiss: false,
      size: AlertSize.EXTRA_LARGE,
      ...options
    });
  }

  warningExtraLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.WARNING,
      title,
      message,
      size: AlertSize.EXTRA_LARGE,
      ...options
    });
  }

  infoExtraLarge(message: string, title?: string, options?: Partial<AlertConfig>): string {
    return this.addAlert({
      type: AlertType.INFO,
      title,
      message,
      size: AlertSize.EXTRA_LARGE,
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
   * Show an input prompt dialog (centered by default)
   * Returns a Promise that resolves to the input value if confirmed, null if cancelled
   */
  prompt(config: InputPromptConfig): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      const confirmLabel = config.confirmLabel || 'OK';
      const cancelLabel = config.cancelLabel || 'Cancel';
      let inputValue = config.initialValue || '';
      let errorMessage = '';

      const validateInput = (value: string): boolean => {
        if (config.required && !value.trim()) {
          errorMessage = 'This field is required';
          return false;
        }
        
        if (config.validation) {
          const validationError = config.validation(value);
          if (validationError) {
            errorMessage = validationError;
            return false;
          }
        }
        
        errorMessage = '';
        return true;
      };

      const updateActions = (alertId: string) => {
        const currentAlerts = this.alertsSubject.value;
        const alertIndex = currentAlerts.findIndex(a => a.id === alertId);
        if (alertIndex >= 0) {
          const alert = { ...currentAlerts[alertIndex] };
          alert.actions = [
            {
              label: cancelLabel,
              action: () => resolve(null),
              primary: false
            },
            {
              label: confirmLabel,
              action: () => {
                if (validateInput(inputValue)) {
                  resolve(inputValue);
                } else {
                  // Update the alert to show error
                  this.updateAlertError(alertId, errorMessage);
                }
              },
              primary: true,
              buttonType: 'primary'
            }
          ];
          
          const updatedAlerts = [...currentAlerts];
          updatedAlerts[alertIndex] = alert;
          this.alertsSubject.next(updatedAlerts);
        }
      };

      const alertId = this.addAlert({
        type: AlertType.INPUT,
        title: config.title,
        message: config.message,
        autoDismiss: false,
        centered: true,
        inputConfig: {
          placeholder: config.placeholder,
          initialValue: config.initialValue,
          maxLength: config.maxLength,
          required: config.required,
          inputType: config.inputType || 'text',
          validation: config.validation
        },
        actions: []
      });

      // Set up input value tracking
      this.setupInputTracking(alertId, (value) => {
        inputValue = value;
        updateActions(alertId);
      });

      updateActions(alertId);
    });
  }

  /**
   * Quick text input prompt
   */
  promptText(message: string, title?: string, placeholder?: string, initialValue?: string): Promise<string | null> {
    return this.prompt({
      title: title || 'Input Required',
      message,
      placeholder,
      initialValue,
      inputType: 'text'
    });
  }

  /**
   * Quick email input prompt
   */
  promptEmail(message: string, title?: string, placeholder?: string, initialValue?: string): Promise<string | null> {
    return this.prompt({
      title: title || 'Email Required',
      message,
      placeholder: placeholder || 'Enter email address',
      initialValue,
      inputType: 'email',
      validation: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Please enter a valid email address';
      }
    });
  }

  /**
   * Quick number input prompt
   */
  promptNumber(message: string, title?: string, placeholder?: string, min?: number, max?: number): Promise<string | null> {
    return this.prompt({
      title: title || 'Number Required',
      message,
      placeholder,
      inputType: 'number',
      validation: (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return 'Please enter a valid number';
        if (min !== undefined && num < min) return `Number must be at least ${min}`;
        if (max !== undefined && num > max) return `Number must be at most ${max}`;
        return null;
      }
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

  private inputCallbacks = new Map<string, (value: string) => void>();

  private setupInputTracking(alertId: string, callback: (value: string) => void): void {
    this.inputCallbacks.set(alertId, callback);
  }

  private updateAlertError(alertId: string, errorMessage: string): void {
    const currentAlerts = this.alertsSubject.value;
    const alertIndex = currentAlerts.findIndex(a => a.id === alertId);
    if (alertIndex >= 0) {
      const alert = { ...currentAlerts[alertIndex] };
      if (alert.inputConfig) {
        alert.inputConfig = { ...alert.inputConfig };
        // We'll handle error display in the component
      }
      
      const updatedAlerts = [...currentAlerts];
      updatedAlerts[alertIndex] = alert;
      this.alertsSubject.next(updatedAlerts);
    }
  }
  onInputChange(alertId: string, value: string): void {
    const callback = this.inputCallbacks.get(alertId);
    if (callback) {
      callback(value);
    }
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
      case AlertType.INPUT:
        return 0; // No auto-dismiss for errors, confirmations, and inputs
      default:
        return 5000;
    }
  }
}
