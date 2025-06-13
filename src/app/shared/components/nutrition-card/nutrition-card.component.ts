import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';

export interface NutritionCardData {
  value: number;
  label: string;
  icon: string;
  iconColor: string;
  unit?: string;
}

@Component({
  selector: 'app-nutrition-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutrition-card.component.html',
  styleUrls: ['./nutrition-card.component.scss'],
})
export class NutritionCardComponent {
  @Input() data!: NutritionCardData;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showShadow: boolean = true;
  @Input() decimals: string = '1.1-1';

  getIconClass(): string {
    return `icon-${this.size} ${this.data.iconColor}`;
  }

  getCardBodyClass(): string {
    return `card-body-${this.size}`;
  }
}
