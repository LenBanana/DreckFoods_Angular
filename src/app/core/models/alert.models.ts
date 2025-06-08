export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error', 
  WARNING = 'warning',
  INFO = 'info',
  CONFIRM = 'confirm'
}

export interface Alert {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  autoDismiss?: boolean;
  duration?: number; // in milliseconds
  actions?: AlertAction[];
  centered?: boolean; // Flag to center the alert on screen
}

export interface AlertAction {
  label: string;
  action: () => void;
  primary?: boolean;
  buttonType?: 'primary' | 'danger' | 'secondary';
}

export interface AlertConfig {
  type: AlertType;
  title?: string;
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  actions?: AlertAction[];
  centered?: boolean; // Flag to center the alert on screen
}

export interface ConfirmationConfig {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonType?: 'primary' | 'danger';
}
