import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface SummaryCardData {
  title: string;
  value: number;
  unit: string;
  icon: string;
  color: string;
  route?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  average?: {
    value: number;
    period: string;
    label?: string;
  };
}

@Component({
  selector: 'app-dashboard-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="summary-container">
      <div class="row g-3">
        <div *ngFor="let card of summaryCards" class="col-lg-3 col-md-6">
          <div
            class="summary-card"
            [style.border-left-color]="card.color"
            [routerLink]="card.route"
            [class.clickable]="card.route"
          >
            <div class="card-icon" [style.color]="card.color">
              <i class="fas fa-{{ card.icon }}"></i>
            </div>
            <div class="card-content">
              <div class="card-header">
                <h4 class="card-title">{{ card.title }}</h4>
              </div>
              <div class="card-value">
                <span class="value">{{ formatValue(card.value) }}</span>
                <span class="unit">{{ card.unit }}</span>
                <span class="text-muted average-label"
                  *ngIf="card.average">
                  {{ 'avg. ' + formatValue(card.average.value) + card.unit }}
                </span>
              </div>
              <div class="card-trend" *ngIf="card.trend">
                <span class="trend" [ngClass]="'trend-' + card.trend.direction">
                  <i
                    class="fas"
                    [ngClass]="{
                      'fa-arrow-up': card.trend.direction === 'up',
                      'fa-arrow-down': card.trend.direction === 'down',
                      'fa-minus': card.trend.direction === 'neutral'
                    }"
                  ></i>
                  {{ formatTrend(card.trend.value, card.trend.direction) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .summary-title {
        color: var(--bs-body-color);
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .summary-card {
        background: var(--bs-body-bg);
        border: 1px solid var(--bs-border-color);
        border-radius: 12px;
        padding: .75rem;
        padding-left: 1.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: all 0.3s ease;
        border-left: 4px solid var(--bs-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .summary-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }

      .summary-card.clickable {
        cursor: pointer;
        text-decoration: none;
        color: inherit;
      }

      .summary-card.clickable:hover {
        color: inherit;
        text-decoration: none;
      }

      .card-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        opacity: 0.8;
      }

      .card-content {
        flex: 1;
      }

      .card-header {
        margin-bottom: 0.5rem;
      }

      .card-title {
        font-size: 0.9rem;
        color: var(--bs-secondary);
        margin: 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .card-value {
        margin-bottom: 0.75rem;
      }

      .value {
        font-size: 2rem;
        font-weight: 700;
        color: var(--bs-body-color);
        line-height: 1;
      }
      .unit {
        font-size: 0.9rem;
        color: var(--bs-secondary);
        margin-left: 0.25rem;
        font-weight: 500;
      }

      .card-average {
        margin-bottom: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: var(--bs-light);
        border-radius: 8px;
        border: 1px solid var(--bs-border-color-translucent);
      }

      .average-label {
        display: block;
        font-size: 0.7rem;
        color: var(--bs-secondary);
        letter-spacing: 0.5px;
        font-weight: 600;
        margin-bottom: 0.25rem;
      }

      .average-value {
        font-size: 0.9rem;
        color: var(--bs-body-color);
        font-weight: 600;
      }

      .card-trend {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .trend {
        font-size: 0.8rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        width: fit-content;
      }

      .trend-label {
        font-size: 0.7rem;
        color: var(--bs-secondary);
        opacity: 0.8;
        font-weight: 400;
      }

      .trend-up {
        background: rgba(25, 135, 84, 0.1);
        color: var(--bs-success);
      }

      .trend-down {
        background: rgba(220, 53, 69, 0.1);
        color: var(--bs-danger);
      }

      .trend-neutral {
        background: rgba(108, 117, 125, 0.1);
        color: var(--bs-secondary);
      }

      @media (max-width: 768px) {
        .summary-card {
          padding: 1rem;
        }

        .card-icon {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .value {
          font-size: 1.5rem;
        }

        .card-title {
          font-size: 0.8rem;
        }

        .average-label {
          font-size: 0.65rem;
        }
      }
    `,
  ],
})
export class DashboardSummaryComponent {
  @Input() summaryCards: SummaryCardData[] = [];

  formatValue(value: number): string {
    if (value >= 1000) {
      return value.toFixed(0);
    }
    if (value % 1 === 0) {
      return value.toString();
    }
    return value.toFixed(1);
  }

  formatTrend(value: number, direction: 'up' | 'down' | 'neutral'): string {
    if (direction === 'neutral') {
      return 'stable';
    }
    return `${value.toFixed(1)}%`;
  }

  Math = Math;
}
