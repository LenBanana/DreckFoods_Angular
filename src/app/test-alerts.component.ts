import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AlertService} from './core/services/alert.service';
import {AlertSize} from './core/models/alert.models';

@Component({
  selector: 'app-test-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-alerts-container" style="padding: 20px;">
      <h2>Alert System Test</h2>

      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Regular Alerts (Top-Right)</h3>
        <button (click)="showSuccess()" class="btn btn-success">
          Success Alert
        </button>
        <button (click)="showError()" class="btn btn-danger">
          Error Alert
        </button>
        <button (click)="showWarning()" class="btn btn-warning">
          Warning Alert
        </button>
        <button (click)="showInfo()" class="btn btn-info">Info Alert</button>
      </div>

      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Centered Alerts</h3>
        <button (click)="showSuccessCentered()" class="btn btn-success">
          Centered Success
        </button>
        <button (click)="showErrorCentered()" class="btn btn-danger">
          Centered Error
        </button>
        <button (click)="showWarningCentered()" class="btn btn-warning">
          Centered Warning
        </button>
        <button (click)="showInfoCentered()" class="btn btn-info">
          Centered Info
        </button>
      </div>
      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Confirmation Dialogs (Centered by default)</h3>
        <button (click)="showConfirm()" class="btn btn-primary">
          Confirm Dialog
        </button>
        <button (click)="showDeleteConfirm()" class="btn btn-danger">
          Delete Confirm
        </button>
        <button (click)="showActionConfirm()" class="btn btn-secondary">
          Action Confirm
        </button>
      </div>
      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Input Prompts (Centered by default)</h3>
        <button (click)="showTextInput()" class="btn btn-info">
          Text Input
        </button>
        <button (click)="showEmailInput()" class="btn btn-info">
          Email Input
        </button>
        <button (click)="showNumberInput()" class="btn btn-info">
          Number Input
        </button>
        <button (click)="showRequiredInput()" class="btn btn-warning">
          Required Input
        </button>
        <button (click)="showCustomValidationInput()" class="btn btn-warning">
          Custom Validation
        </button>
      </div>

      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Alert Sizes</h3>
        <button (click)="showSmallAlert()" class="btn btn-info">
          Small Alert
        </button>
        <button (click)="showMediumAlert()" class="btn btn-info">
          Medium Alert (Default)
        </button>
        <button (click)="showLargeAlert()" class="btn btn-info">
          Large Alert
        </button>
        <button (click)="showExtraLargeAlert()" class="btn btn-info">
          Extra Large Alert
        </button>
      </div>

      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px;"
      >
        <h3>Long Content Examples</h3>
        <button (click)="showLongTextLarge()" class="btn btn-warning">
          Long Text (Large)
        </button>
        <button (click)="showLongTextExtraLarge()" class="btn btn-warning">
          Long Text (Extra Large)
        </button>
        <button (click)="showCodeSnippetLarge()" class="btn btn-info">
          Code Snippet (Large)
        </button>
        <button (click)="showErrorLogExtraLarge()" class="btn btn-danger">
          Error Log (Extra Large)
        </button>
      </div>

      <div
        class="button-group"
        style="display: flex; gap: 10px; flex-wrap: wrap;"
      >
        <h3>Utilities</h3>
        <button (click)="clearAll()" class="btn btn-outline-secondary">
          Clear All Alerts
        </button>
      </div>
      <div class="alert-result" style="margin-top: 20px;">
        <p *ngIf="lastResult !== null">
          <strong>Last confirmation result:</strong> {{ lastResult }}
        </p>
        <p *ngIf="lastInputResult !== null">
          <strong>Last input result:</strong> {{ lastInputResult }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .btn-success {
        background-color: #28a745;
        color: white;
      }
      .btn-danger {
        background-color: #dc3545;
        color: white;
      }
      .btn-warning {
        background-color: #ffc107;
        color: black;
      }
      .btn-info {
        background-color: #17a2b8;
        color: white;
      }
      .btn-primary {
        background-color: #007bff;
        color: white;
      }
      .btn-secondary {
        background-color: #6c757d;
        color: white;
      }
      .btn-outline-secondary {
        background-color: transparent;
        color: #6c757d;
        border: 1px solid #6c757d;
      }
      .btn:hover {
        opacity: 0.8;
      }
      h3 {
        width: 100%;
        margin: 10px 0 5px 0;
      }
    `,
  ],
})
export class TestAlertsComponent {
  lastResult: boolean | null = null;
  lastInputResult: string | null = null;

  constructor(private alertService: AlertService) {
  }

  // Regular alerts
  showSuccess() {
    this.alertService.success('Operation completed successfully!', 'Success');
  }

  showError() {
    this.alertService.error('Something went wrong. Please try again.', 'Error');
  }

  showWarning() {
    this.alertService.warning(
      'Please review your input before proceeding.',
      'Warning',
    );
  }

  showInfo() {
    this.alertService.info(
      'Here is some useful information for you.',
      'Information',
    );
  }

  // Centered alerts
  showSuccessCentered() {
    this.alertService.successCentered(
      'Your changes have been saved!',
      'Success',
    );
  }

  showErrorCentered() {
    this.alertService.errorCentered(
      'Critical error occurred. Please contact support.',
      'Critical Error',
    );
  }

  showWarningCentered() {
    this.alertService.warningCentered(
      'Important: This action cannot be undone.',
      'Important Warning',
    );
  }

  showInfoCentered() {
    this.alertService.infoCentered(
      'Welcome to the new alert system!',
      'Welcome',
    );
  }

  // Confirmation dialogs
  async showConfirm() {
    this.lastResult = await this.alertService.confirm({
      title: 'Confirm Action',
      message: 'Are you sure you want to proceed with this action?',
      confirmLabel: 'Yes, Continue',
      cancelLabel: 'Cancel',
    });
  }

  async showDeleteConfirm() {
    this.lastResult = await this.alertService.confirmDelete(
      'Test Item',
      'This will permanently delete the selected item. This action cannot be undone.',
    );
  }

  async showActionConfirm() {
    this.lastResult = await this.alertService.confirmAction(
      'Do you want to save your changes before leaving?',
      'Unsaved Changes',
    );
  }

  // Input prompts
  async showTextInput() {
    this.lastInputResult = await this.alertService.promptText(
      'Please enter your name:',
      'Name Required',
      'Enter your full name',
      'John Doe',
    );
  }

  async showEmailInput() {
    this.lastInputResult = await this.alertService.promptEmail(
      'Please enter your email address:',
      'Email Required',
      'your@email.com',
    );
  }

  async showNumberInput() {
    this.lastInputResult = await this.alertService.promptNumber(
      'Please enter your age:',
      'Age Required',
      'Enter your age',
      18,
      100,
    );
  }

  async showRequiredInput() {
    this.lastInputResult = await this.alertService.prompt({
      title: 'Required Field',
      message: 'This field is required and cannot be empty:',
      placeholder: 'Enter something...',
      required: true,
      confirmLabel: 'Submit',
      cancelLabel: 'Cancel',
    });
  }

  async showCustomValidationInput() {
    this.lastInputResult = await this.alertService.prompt({
      title: 'Username',
      message: 'Enter a username (3-20 characters, letters and numbers only):',
      placeholder: 'username123',
      validation: (value) => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 20)
          return 'Username must be less than 20 characters';
        if (!/^[a-zA-Z0-9]+$/.test(value))
          return 'Username can only contain letters and numbers';
        return null;
      },
      confirmLabel: 'Create Username',
      cancelLabel: 'Cancel',
    });
  }

  // Size demonstration methods
  showSmallAlert() {
    this.alertService.info(
      'This is a small alert for brief notifications.',
      'Small Alert',
      {size: AlertSize.SMALL},
    );
  }

  showMediumAlert() {
    this.alertService.info(
      'This is a medium alert which is the default size for most notifications.',
      'Medium Alert',
      {size: AlertSize.MEDIUM},
    );
  }

  showLargeAlert() {
    this.alertService.info(
      'This is a large alert that provides more space for longer messages and content.',
      'Large Alert',
      {size: AlertSize.LARGE},
    );
  }

  showExtraLargeAlert() {
    this.alertService.info(
      'This is an extra large alert designed for displaying extensive content, detailed information, or when you need maximum visibility for important messages.',
      'Extra Large Alert',
      {size: AlertSize.EXTRA_LARGE},
    );
  }

  // Long content examples
  showLongTextLarge() {
    const longMessage = `This is an example of a large alert displaying a longer piece of text. It demonstrates how the alert system can handle more extensive content while maintaining readability and proper formatting.

The large size provides adequate space for detailed explanations, instructions, or comprehensive information that users need to read and understand before taking action.

Key features of large alerts:
• Better readability for longer content
• More space for detailed information
• Improved user experience for complex messages
• Maintains visual hierarchy and styling`;

    this.alertService.warningLarge(longMessage, 'Long Content Example');
  }

  showLongTextExtraLarge() {
    const veryLongMessage = `This extra large alert showcases the system's capability to handle very extensive content. It's perfect for displaying comprehensive information, detailed error messages, or complete instructions.

When to use extra large alerts:
1. Displaying detailed error logs or stack traces
2. Showing comprehensive help information
3. Presenting lengthy terms and conditions
4. Displaying code snippets or technical documentation
5. Showing complete configuration details

Technical Details:
The extra large alert automatically adjusts its layout to accommodate longer content while maintaining proper spacing, typography, and visual hierarchy. The text will wrap naturally, and line breaks are preserved using the white-space: pre-wrap CSS property.

This ensures that even very long content remains readable and well-formatted, providing users with all the information they need without compromising the user experience.

Additional Features:
• Responsive design that adapts to different screen sizes
• Proper scrolling behavior for extremely long content
• Consistent styling across all content types
• Accessibility features for screen readers
• Keyboard navigation support`;

    this.alertService.infoExtraLarge(
      veryLongMessage,
      'Extra Large Content Example',
    );
  }

  showCodeSnippetLarge() {
    const codeMessage = `Here's an example of displaying a code snippet in a large alert:

function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Usage example
const cartItems = [
  { name: 'Apple', price: 1.50, quantity: 3 },
  { name: 'Banana', price: 0.75, quantity: 6 },
  { name: 'Orange', price: 2.00, quantity: 2 }
];

const total = calculateTotal(cartItems);
console.log('Total: $' + total.toFixed(2));

This demonstrates how code snippets and technical content can be displayed effectively in larger alert sizes.`;

    this.alertService.infoLarge(codeMessage, 'Code Snippet Example');
  }

  showErrorLogExtraLarge() {
    const errorLog = `Application Error Details:

Timestamp: 2025-06-09 14:30:22.145
Error Type: ValidationError
Component: UserRegistrationForm
File: src/components/auth/register.component.ts
Line: 127

Stack Trace:
at UserRegistrationForm.validateForm (register.component.ts:127:15)
at UserRegistrationForm.onSubmit (register.component.ts:89:23)
at HTMLFormElement.<anonymous> (register.component.ts:45:12)
at Object.handleEvent (zone.js:2540:28)
at ZoneDelegate.invokeTask (zone.js:1650:14)

Error Message:
Invalid email format provided. Expected format: user@domain.com
Received: invalid-email-format

User Input Data:
{
  "username": "testuser123",
  "email": "invalid-email-format",
  "password": "••••••••",
  "confirmPassword": "••••••••",
  "firstName": "John",
  "lastName": "Doe",
  "agreeToTerms": true
}

Suggested Actions:
1. Verify email format follows standard conventions
2. Check for typos in the email address
3. Ensure all required fields are completed
4. Try refreshing the page and submitting again
5. Contact support if the issue persists

System Information:
Browser: Chrome 125.0.6422.60
OS: Windows 11
Screen Resolution: 1920x1080
Timestamp: June 9, 2025 2:30:22 PM`;

    this.alertService.errorExtraLarge(errorLog, 'Detailed Error Report');
  }

  clearAll() {
    this.alertService.clearAll();
    this.lastResult = null;
    this.lastInputResult = null;
  }
}
