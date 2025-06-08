import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NutritionProgressConfig {
  label: string;
  value: number;
  total: number;
  unit: string;
  color: 'danger' | 'success' | 'info' | 'warning' | 'secondary' | 'primary';
  show?: boolean;
}

@Component({
  selector: 'app-nutrition-progress-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutrition-progress-bar.component.html',
  styleUrls: ['./nutrition-progress-bar.component.scss']
})
export class NutritionProgressBarComponent {
  @Input() config!: NutritionProgressConfig;
  @Input() height: string = '6px';
  @Input() showValues: boolean = true;
  @Input() showLabels: boolean = true;

  getPercentage(): number {
    if (this.config.total === 0) return 0;
    return Math.min((this.config.value / this.config.total) * 100, 100);
  }

  shouldShow(): boolean {
    return this.config.show !== false && this.config.value > 0;
  }
}
