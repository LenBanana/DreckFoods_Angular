export enum AlertType {
  SUCCESS = 'success',
  ERROR = 'error', 
  WARNING = 'warning',
  INFO = 'info',
  CONFIRM = 'confirm',
  INPUT = 'input'
}

export enum AlertSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large'
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
  inputConfig?: InputConfig; // Configuration for input alerts
  size?: AlertSize; // Size configuration for the alert
}

export interface AlertAction {
  label: string;
  action: () => void;
  primary?: boolean;
  buttonType?: 'primary' | 'danger' | 'secondary';
}

export interface InputConfig {
  placeholder?: string;
  initialValue?: string;
  maxLength?: number;
  required?: boolean;
  inputType?: 'text' | 'email' | 'password' | 'number';
  validation?: (value: string) => string | null; // Returns error message or null if valid
}

export interface AlertConfig {
  type: AlertType;
  title?: string;
  message: string;
  autoDismiss?: boolean;
  duration?: number;
  actions?: AlertAction[];
  centered?: boolean; // Flag to center the alert on screen
  inputConfig?: InputConfig; // Configuration for input alerts
  size?: AlertSize; // Size configuration for the alert
}

export interface ConfirmationConfig {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmButtonType?: 'primary' | 'danger';
}

export interface InputPromptConfig {
  title?: string;
  message: string;
  placeholder?: string;
  initialValue?: string;
  maxLength?: number;
  required?: boolean;
  inputType?: 'text' | 'email' | 'password' | 'number';
  validation?: (value: string) => string | null;
  confirmLabel?: string;
  cancelLabel?: string;
}
