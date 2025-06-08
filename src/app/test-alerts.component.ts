import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from './core/services/alert.service';

@Component({
  selector: 'app-test-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-alerts-container" style="padding: 20px;">
      <h2>Alert System Test</h2>
      
      <div class="button-group" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <h3>Regular Alerts (Top-Right)</h3>
        <button (click)="showSuccess()" class="btn btn-success">Success Alert</button>
        <button (click)="showError()" class="btn btn-danger">Error Alert</button>
        <button (click)="showWarning()" class="btn btn-warning">Warning Alert</button>
        <button (click)="showInfo()" class="btn btn-info">Info Alert</button>
      </div>

      <div class="button-group" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <h3>Centered Alerts</h3>
        <button (click)="showSuccessCentered()" class="btn btn-success">Centered Success</button>
        <button (click)="showErrorCentered()" class="btn btn-danger">Centered Error</button>
        <button (click)="showWarningCentered()" class="btn btn-warning">Centered Warning</button>
        <button (click)="showInfoCentered()" class="btn btn-info">Centered Info</button>
      </div>

      <div class="button-group" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;">
        <h3>Confirmation Dialogs (Centered by default)</h3>
        <button (click)="showConfirm()" class="btn btn-primary">Confirm Dialog</button>
        <button (click)="showDeleteConfirm()" class="btn btn-danger">Delete Confirm</button>
        <button (click)="showActionConfirm()" class="btn btn-secondary">Action Confirm</button>
      </div>

      <div class="button-group" style="display: flex; gap: 10px; flex-wrap: wrap;">
        <h3>Utilities</h3>
        <button (click)="clearAll()" class="btn btn-outline-secondary">Clear All Alerts</button>
      </div>

      <div class="alert-result" style="margin-top: 20px;">
        <p *ngIf="lastResult !== null"><strong>Last confirmation result:</strong> {{ lastResult }}</p>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .btn-success { background-color: #28a745; color: white; }
    .btn-danger { background-color: #dc3545; color: white; }
    .btn-warning { background-color: #ffc107; color: black; }
    .btn-info { background-color: #17a2b8; color: white; }
    .btn-primary { background-color: #007bff; color: white; }
    .btn-secondary { background-color: #6c757d; color: white; }
    .btn-outline-secondary { 
      background-color: transparent; 
      color: #6c757d; 
      border: 1px solid #6c757d; 
    }
    .btn:hover { opacity: 0.8; }
    h3 { width: 100%; margin: 10px 0 5px 0; }
  `]
})
export class TestAlertsComponent {
  lastResult: boolean | null = null;

  constructor(private alertService: AlertService) {}

  // Regular alerts
  showSuccess() {
    this.alertService.success('Operation completed successfully!', 'Success');
  }

  showError() {
    this.alertService.error('Something went wrong. Please try again.', 'Error');
  }

  showWarning() {
    this.alertService.warning('Please review your input before proceeding.', 'Warning');
  }

  showInfo() {
    this.alertService.info('Here is some useful information for you.', 'Information');
  }

  // Centered alerts
  showSuccessCentered() {
    this.alertService.successCentered('Your changes have been saved!', 'Success');
  }

  showErrorCentered() {
    this.alertService.errorCentered('Critical error occurred. Please contact support.', 'Critical Error');
  }

  showWarningCentered() {
    this.alertService.warningCentered('Important: This action cannot be undone.', 'Important Warning');
  }

  showInfoCentered() {
    this.alertService.infoCentered('Welcome to the new alert system!', 'Welcome');
  }

  // Confirmation dialogs
  async showConfirm() {
    this.lastResult = await this.alertService.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action?',
      confirmLabel: 'Yes, Continue',
      cancelLabel: 'Cancel'
    });
  }

  async showDeleteConfirm() {
    this.lastResult = await this.alertService.confirmDelete('Test Item', 'This will permanently delete the selected item. This action cannot be undone.');
  }

  async showActionConfirm() {
    this.lastResult = await this.alertService.confirmAction('Do you want to save your changes before leaving?', 'Unsaved Changes');
  }

  clearAll() {
    this.alertService.clearAll();
    this.lastResult = null;
  }
}
