import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Alert, AlertType, AlertSize } from '../../../core/models/alert.models';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="alert-container"
      [ngClass]="getAlertClasses()"
      role="alert"
      [attr.aria-live]="alert.type === 'error' ? 'assertive' : 'polite'"
    >
      <div class="alert-icon">
        <ng-container [ngSwitch]="alert.type">
          <svg
            *ngSwitchCase="'success'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            *ngSwitchCase="'error'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            *ngSwitchCase="'warning'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            *ngSwitchCase="'info'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            *ngSwitchCase="'confirm'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <svg
            *ngSwitchCase="'input'"
            class="icon"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </ng-container>
      </div>
      <div class="alert-content">
        <div class="alert-title" *ngIf="alert.title">{{ alert.title }}</div>
        <div class="alert-message">{{ alert.message }}</div>

        <!-- Input field for input alerts -->
        <div
          class="alert-input-container"
          *ngIf="alert.type === 'input' && alert.inputConfig"
        >
          <input
            #inputElement
            class="alert-input"
            [type]="alert.inputConfig.inputType || 'text'"
            [placeholder]="alert.inputConfig.placeholder || ''"
            [attr.maxlength]="alert.inputConfig.maxLength"
            [(ngModel)]="inputValue"
            (input)="onInputChange()"
            (keydown.enter)="onEnterKey()"
            [class.error]="inputError"
          />
          <div class="alert-input-error" *ngIf="inputError">
            {{ inputError }}
          </div>
        </div>

        <div
          class="alert-actions"
          *ngIf="alert.actions && alert.actions.length > 0"
        >
          <button
            *ngFor="let action of alert.actions"
            type="button"
            class="alert-action-btn"
            [ngClass]="getActionButtonClasses(action)"
            (click)="onActionClick(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        class="alert-close-btn"
        (click)="onClose()"
        aria-label="Close alert"
      >
        <svg
          class="close-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  `,
  styleUrls: ['./alert.component.scss'],
})
export class AlertComponent implements OnInit {
  @Input() alert!: Alert;
  @Output() dismiss = new EventEmitter<string>();

  private alertService = inject(AlertService);
  inputValue: string = '';
  inputError: string = '';

  ngOnInit() {
    if (this.alert.type === AlertType.INPUT && this.alert.inputConfig) {
      this.inputValue = this.alert.inputConfig.initialValue || '';
    }
  }
  getAlertClasses(): string {
    const classes = [`alert`, `alert-${this.alert.type}`];

    if (this.alert.centered) {
      classes.push('alert-centered');
    }

    const size = this.alert.size || AlertSize.MEDIUM;
    classes.push(`alert-${size}`);

    return classes.join(' ');
  }

  getActionButtonClasses(action: any): string {
    const classes = ['alert-action-btn'];

    if (action.primary) {
      classes.push('primary');
    }

    if (action.buttonType) {
      classes.push(action.buttonType);
    }

    return classes.join(' ');
  }

  onClose(): void {
    this.dismiss.emit(this.alert.id);
  }
  onActionClick(action: any): void {
    action.action();

    if (!action.keepOpen) {
      this.onClose();
    }
  }

  onInputChange(): void {
    this.inputError = '';
    if (this.alert.inputConfig?.validation) {
      const error = this.alert.inputConfig.validation(this.inputValue);
      if (error) {
        this.inputError = error;
      }
    }
    this.alertService.onInputChange(this.alert.id, this.inputValue);
  }

  onEnterKey(): void {
    if (this.alert.actions && this.alert.actions.length > 0) {
      const primaryAction = this.alert.actions.find((action) => action.primary);
      if (primaryAction) {
        this.onActionClick(primaryAction);
      }
    }
  }
}
