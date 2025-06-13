import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
  catchError,
} from 'rxjs';
import {
  NgxScannerQrcodeComponent,
  ScannerQRCodeConfig,
  ScannerQRCodeResult,
  LOAD_WASM,
  ScannerQRCodeDevice,
} from 'ngx-scanner-qrcode';

import { FoodService } from '../../../core/services/food.service';
import {
  FoodSearchDto,
  FoodSearchResponse,
} from '../../../core/models/food.models';
import {
  FoodSortBy,
  SortDirection,
} from '../../../core/models/enums/sorting.models';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();

@Component({
  selector: 'app-food-search-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxScannerQrcodeComponent,
  ],
  templateUrl: './food-search-input.component.html',
  styleUrls: ['./food-search-input.component.scss'],
})
export class FoodSearchInputComponent implements OnInit, OnDestroy {
  @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;

  @Input() placeholder = 'Search for food or scan barcode...';
  @Input() showBarcodeScanner = true;
  @Input() autoSearch = true;
  @Input() debounceTime = 500;
  @Input() minSearchLength = 2;
  @Input() pageSize = 10;
  @Input() sortBy: FoodSortBy = FoodSortBy.Name;
  @Input() sortDirection: SortDirection = SortDirection.Ascending;
  @Output() searchResults = new EventEmitter<FoodSearchResponse>();
  @Output() searchError = new EventEmitter<string>();
  @Output() isSearching = new EventEmitter<boolean>();
  @Output() searchQuery = new EventEmitter<string>();

  private fb = inject(FormBuilder);
  private foodService = inject(FoodService);

  searchForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentQuery = '';

  isBarcodeScannerOpen = false;
  isScanningBarcode = false;
  availableDevices: ScannerQRCodeDevice[] = [];
  currentDeviceId: string | undefined = undefined;
  hasDevices = false;
  hasPermission = false;
  scannerEnabled = false;
  scannerStarting = false;

  config: ScannerQRCodeConfig = {
    constraints: {
      video: {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        facingMode: 'environment',
      },
    },
    canvasStyles: [
      {
        lineWidth: 1,
        fillStyle: '#00950685',
        strokeStyle: '#00950685',
      },
      {
        font: '17px serif',
        fillStyle: '#ff0000',
        strokeStyle: '#ff0000',
      },
    ],
  };

  constructor() {
    this.searchForm = this.fb.group({
      query: [''],
    });
  }

  ngOnInit() {
    if (this.autoSearch) {
      this.setupAutoSearch();
    }

    const savedDeviceId = localStorage.getItem('scannerDeviceId');
    if (savedDeviceId) {
      this.currentDeviceId = savedDeviceId;
    }
  }

  ngOnDestroy() {
    this.closeBarcodeScanner();
  }

  private setupAutoSearch() {
    this.searchForm
      .get('query')
      ?.valueChanges.pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmedQuery = query?.trim() || '';
          this.searchQuery.emit(trimmedQuery);
          if (trimmedQuery.length === 0) {
            this.currentQuery = '';
            this.searchResults.emit(null as any);
            this.isSearching.emit(false);
            return of(null);
          } else if (trimmedQuery.length >= this.minSearchLength) {
            this.currentQuery = trimmedQuery;
            this.isLoading = true;
            this.isSearching.emit(true);
            return this.foodService.searchFoods(
              trimmedQuery,
              1,
              this.pageSize,
              this.sortBy,
              this.sortDirection,
            );
          }
          return of(null);
        }),
        catchError((error) => {
          this.errorMessage = 'Search failed. Please try again.';
          this.searchError.emit(this.errorMessage);
          this.isLoading = false;
          this.isSearching.emit(false);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.searchResults.emit(results);
        }
        this.isLoading = false;
        this.isSearching.emit(false);
      });
  }

  onSearch() {
    const query = this.searchForm.get('query')?.value?.trim();
    if (query && query.length >= this.minSearchLength) {
      this.performSearch(query);
    }
  }

  private performSearch(query: string) {
    this.currentQuery = query;
    this.isLoading = true;
    this.isSearching.emit(true);
    this.errorMessage = '';

    this.foodService
      .searchFoods(query, 1, this.pageSize, this.sortBy, this.sortDirection)
      .pipe(
        catchError((error) => {
          this.errorMessage = 'Search failed. Please try again.';
          this.searchError.emit(this.errorMessage);
          this.isLoading = false;
          this.isSearching.emit(false);
          return of(null);
        }),
      )
      .subscribe((results) => {
        if (results) {
          this.searchResults.emit(results);
        }
        this.isLoading = false;
        this.isSearching.emit(false);
      });
  }

  clearSearch() {
    this.searchForm.get('query')?.setValue('');
    this.currentQuery = '';
    this.searchResults.emit(null as any);
    this.errorMessage = '';
  }

  async openBarcodeScanner() {
    if (!this.showBarcodeScanner) return;

    this.errorMessage = '';
    this.isBarcodeScannerOpen = true;
    this.scannerEnabled = true;
    this.scannerStarting = true;

    setTimeout(() => {
      this.startScanner();
    }, 100);
  }

  closeBarcodeScanner() {
    this.scannerEnabled = false;
    this.isBarcodeScannerOpen = false;
    this.isScanningBarcode = false;

    if (this.scanner) {
      this.scanner.stop();
    }
  }

  async startScanner() {
    this.scannerStarting = true;
    if (this.scanner) {
      try {
        if (!this.scanner.isStart) {
          this.scanner?.start(() => {
            const devices = this.scanner?.devices.value;
            if (!devices) return;

            this.availableDevices = devices;
            this.hasDevices = this.availableDevices.length > 0;

            if (this.hasDevices) {
              const backCamera = this.availableDevices.find(
                (device) =>
                  device.label.toLowerCase().includes('back') ||
                  device.label.toLowerCase().includes('rear') ||
                  device.label.toLowerCase().includes('environment'),
              );

              if (!this.currentDeviceId) {
                this.currentDeviceId =
                  backCamera?.deviceId || this.availableDevices[0].deviceId;
              }

              setTimeout(() => {
                this.scanner?.playDevice(this.currentDeviceId!);
              }, 100);
              this.hasPermission = true;
            } else {
              this.errorMessage = 'No camera devices found.';
            }
          });
        }
      } catch (error: any) {
        console.error('Scanner start error:', error);
        this.hasPermission = false;

        if (error.name === 'NotAllowedError') {
          this.errorMessage =
            'Camera access denied. Please allow camera permissions.';
        } else if (error.name === 'NotFoundError') {
          this.errorMessage = 'No camera found on this device.';
        } else {
          this.errorMessage = 'Failed to start camera. Please try again.';
        }
      }
    }
    this.scannerStarting = false;
  }

  onScanResult(results: ScannerQRCodeResult[]) {
    if (results && results.length > 0) {
      const result = results[0];
      if (result.value && result.value.trim()) {
        this.closeBarcodeScanner();
        this.searchByBarcode(result.value.trim());
        this.isScanningBarcode = false;
      }
    }
  }

  onScanError(error: any) {
    console.error('Scan error:', error);
    this.errorMessage = 'Error during scanning. Please try again.';
  }

  private searchByBarcode(barcode: string) {
    this.isScanningBarcode = true;
    this.searchForm.get('query')?.setValue(barcode);
    this.performSearch(barcode);
  }

  onDeviceChange(event: any) {
    if (this.scanner && event.target.value) {
      this.currentDeviceId = event.target.value;
      this.scanner.playDevice(event.target.value);
      localStorage.setItem('scannerDeviceId', event.target.value);
      setTimeout(() => {
        this.startScanner();
      }, 100);
    }
  }

  get isCurrentlyLoading(): boolean {
    return this.isLoading;
  }

  get hasQuery(): boolean {
    return this.currentQuery.length > 0;
  }
}
