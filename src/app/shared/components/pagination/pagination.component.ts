import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbPaginationModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NgbPaginationModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})

export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() showInfo = true;
  @Input() maxVisible = 3;
  @Input() size: 'sm' | 'md' | 'lg' = 'md'; // NgBootstrap pagination size

  @Output() pageChange = new EventEmitter<number>();

  get showPagination(): boolean {
    return this.totalPages > 1;
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCount);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
