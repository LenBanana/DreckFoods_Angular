import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { NgxScannerQrcodeComponent, ScannerQRCodeConfig, ScannerQRCodeResult, LOAD_WASM, ScannerQRCodeDevice } from 'ngx-scanner-qrcode';

import { FoodService } from '../../../core/services/food.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { FoodSearchDto, FoodSearchResponse } from '../../../core/models/food.models';
import { AddFoodModalComponent } from '../add-food-modal/add-food-modal.component';
import { FoodSortBy, SortDirection } from '../../../core/models/enums/sorting.models';

LOAD_WASM('assets/wasm/ngx-scanner-qrcode.wasm').subscribe();

@Component({
    selector: 'app-food-search',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        LoadingSpinnerComponent,
        AddFoodModalComponent,
        FormsModule,
        NgxScannerQrcodeComponent
    ],
    templateUrl: './food-search.component.html',
    styleUrls: ['./food-search.component.scss'],
})
export class FoodSearchComponent implements OnInit, OnDestroy {
    @ViewChild('scanner') scanner!: NgxScannerQrcodeComponent;

    private fb = inject(FormBuilder);
    private foodService = inject(FoodService);

    FoodSortBy = FoodSortBy;
    SortDirection = SortDirection;

    searchForm: FormGroup;
    searchResults: FoodSearchResponse | null = null;
    pastEatenFoods: FoodSearchResponse | null = null;
    isSearching = false;
    isLoadingPastFoods = false;
    errorMessage = '';
    selectedFood: FoodSearchDto | null = null;
    currentQuery = '';
    categories: string[] = [];
    pageSize = 6;
    possiblePageSizes = [3, 6, 9, 15, 21, 30];
    sortBy: FoodSortBy = FoodSortBy.Name;
    sortDirection: SortDirection = SortDirection.Ascending;
    isSearchMode = false;

    // Barcode scanner properties
    isBarcodeScannerOpen = false;
    isScanningBarcode = false;
    availableDevices: ScannerQRCodeDevice[] = [];
    currentDeviceId: string | undefined = undefined;
    hasDevices = false;
    hasPermission = false;
    scannerEnabled = false;
    scannerStarting = false;

    // Scanner configuration
    config: ScannerQRCodeConfig = {
        constraints: {
            video: {
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
                facingMode: 'environment' // Use back camera by default
            },
        },
        // Scan all common barcode formats
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
            }
        ],
    };

    sortByOptions = [
        { value: FoodSortBy.Name, label: 'Name' },
        { value: FoodSortBy.Calories, label: 'Calories' },
        { value: FoodSortBy.Protein, label: 'Protein' },
        { value: FoodSortBy.Carbs, label: 'Carbohydrates' },
        { value: FoodSortBy.Fat, label: 'Fat' },
        { value: FoodSortBy.Brand, label: 'Brand' }
    ];

    sortDirectionOptions = [
        { value: SortDirection.Ascending, label: 'Ascending' },
        { value: SortDirection.Descending, label: 'Descending' }
    ];

    constructor() {
        this.searchForm = this.fb.group({
            query: ['']
        });
    }

    ngOnInit() {
        // Auto-search as user types
        this.searchForm.get('query')?.valueChanges
            .pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(query => {
                    const trimmedQuery = query?.trim() || '';

                    if (trimmedQuery.length === 0) {
                        this.isSearchMode = false;
                        this.currentQuery = '';
                        this.searchResults = null;
                        this.errorMessage = '';
                        return of(null);
                    } else if (trimmedQuery.length >= 2) {
                        this.isSearchMode = true;
                        this.currentQuery = trimmedQuery;
                        this.isSearching = true;
                        this.errorMessage = '';
                        return this.foodService.searchFoods(trimmedQuery, 1, this.pageSize, this.sortBy, this.sortDirection);
                    }
                    return of(null);
                }),
                catchError(error => {
                    this.errorMessage = 'Search failed. Please try again.';
                    this.isSearching = false;
                    return of(null);
                })
            )
            .subscribe(results => {
                if (this.isSearchMode) {
                    this.searchResults = results;
                }
                this.isSearching = false;
            });

        this.foodService.getFoodCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (error) => {
                console.error('Failed to load categories:', error);
            }
        });

        this.loadPastEatenFoods();

        // Load saved scanner device ID from local storage
        const savedDeviceId = localStorage.getItem('scannerDeviceId');
        if (savedDeviceId) {
            this.currentDeviceId = savedDeviceId;
        } else {
            this.currentDeviceId = undefined;
        }
    }

    ngOnDestroy() {
        this.closeBarcodeScanner();
    }

    loadPastEatenFoods(page: number = 1) {
        this.isLoadingPastFoods = true;

        this.foodService.getPastEatenFoods(page, this.pageSize)
            .pipe(
                catchError(error => {
                    this.errorMessage = 'Failed to load past eaten foods. Please try again.';
                    return of(null);
                })
            )
            .subscribe(results => {
                if (results) {
                    this.pastEatenFoods = results;
                }
                this.isLoadingPastFoods = false;
            });
    }

    onSearch() {
        const query = this.searchForm.get('query')?.value?.trim();
        if (query && query.length >= 2) {
            this.isSearchMode = true;
            this.currentQuery = query;
            this.performSearch();
        }
    }

    clearSearch() {
        this.searchForm.get('query')?.setValue('');
        this.isSearchMode = false;
        this.currentQuery = '';
        this.searchResults = null;
        this.errorMessage = '';
    }

    onSortChange() {
        if (this.isSearchMode && this.currentQuery) {
            this.performSearch();
        } else if (!this.isSearchMode) {
            this.loadPastEatenFoods();
        }
    }

    onPageSizeChange() {
        if (this.isSearchMode && this.currentQuery) {
            this.performSearch();
        } else if (!this.isSearchMode) {
            this.loadPastEatenFoods();
        }
    }

    private performSearch() {
        this.isSearching = true;
        this.errorMessage = '';

        this.foodService.searchFoods(this.currentQuery, 1, this.pageSize, this.sortBy, this.sortDirection)
            .pipe(
                catchError(error => {
                    this.errorMessage = 'Search failed. Please try again.';
                    this.isSearching = false;
                    return of(null);
                })
            )
            .subscribe(results => {
                this.searchResults = results;
                this.isSearching = false;
            });
    }

    loadPage(page: number) {
        if (this.isSearchMode && this.currentQuery) {
            this.isSearching = true;
            this.foodService.searchFoods(this.currentQuery, page, this.pageSize, this.sortBy, this.sortDirection)
                .pipe(
                    catchError(error => {
                        this.errorMessage = 'Failed to load page. Please try again.';
                        this.isSearching = false;
                        return of(null);
                    })
                )
                .subscribe(results => {
                    this.searchResults = results;
                    this.isSearching = false;
                    document.querySelector('.search-results')?.scrollIntoView({ behavior: 'smooth' });
                });
        } else {
            this.loadPastEatenFoods(page);
        }
    }

    // Updated barcode scanner methods using ngx-scanner-qrcode
    async openBarcodeScanner() {
        this.clearError();
        this.isBarcodeScannerOpen = true;

        // Enable scanner after modal is rendered
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

        // Stop the scanner
        if (this.scanner) {
            this.scanner.stop();
        }
    }

    async startScanner() {
        this.scannerStarting = true;
        if (this.scanner) {
            try {
                console.log(this.scanner.isStart);
                // Get available devices
                if (!this.scanner.isStart) {
                    this.scanner?.start(() => {
                        const devices = this.scanner?.devices.value;
                        if (!devices) {
                            return;
                        }
                        this.availableDevices = devices;
                        this.hasDevices = this.availableDevices.length > 0;
                        console.log('Available devices:', this.availableDevices);
                        if (this.hasDevices) {
                            // Try to find back camera first
                            const backCamera = this.availableDevices.find(device =>
                                device.label.toLowerCase().includes('back') ||
                                device.label.toLowerCase().includes('rear') ||
                                device.label.toLowerCase().includes('environment')
                            );

                            if (!this.currentDeviceId) {
                                this.currentDeviceId = backCamera?.deviceId || this.availableDevices[0].deviceId
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
                    this.errorMessage = 'Camera access denied. Please allow camera permissions.';
                } else if (error.name === 'NotFoundError') {
                    this.errorMessage = 'No camera found on this device.';
                } else {
                    this.errorMessage = 'Failed to start camera. Please try again.';
                }
            }
        }
        this.scannerStarting = false;
    }

    onDeviceChange(event: any) {
        if (this.scanner && event.target.value) {
            this.currentDeviceId = event.target.value;
            this.scanner.playDevice(event.target.value);
            // Save to local storage
            localStorage.setItem('scannerDeviceId', event.target.value);
            setTimeout(() => {
                this.startScanner();
            }, 100);
        }
    }

    onScanResult(results: ScannerQRCodeResult[]) {
        console.log(results);
        if (results && results.length > 0) {
            const result = results[0];
            console.log('Scan result:', result.value);

            if (result.value && result.value.trim()) {
                this.closeBarcodeScanner();
                this.searchByBarcode(result.value.trim());
            }
        }
    }

    onScanError(error: any) {
        console.error('Scan error:', error);
        this.errorMessage = 'Error during scanning. Please try again.';
    }

    private searchByBarcode(barcode: string) {
        this.isScanningBarcode = true;
        this.isSearchMode = true;
        this.currentQuery = barcode;
        this.errorMessage = '';

        this.searchForm.get('query')?.setValue(barcode);

        this.foodService.searchFoods(barcode, 1, this.pageSize, this.sortBy, this.sortDirection)
            .pipe(
                catchError(error => {
                    this.errorMessage = 'Search failed. Please try again.';
                    this.isScanningBarcode = false;
                    return of(null);
                })
            )
            .subscribe(results => {
                if (results && results.foods.length > 0) {
                    this.searchResults = results;
                }
                this.isScanningBarcode = false;
            });
    }

    async switchCamera() {
        if (this.availableDevices && this.availableDevices.length > 1) {
            const currentIndex = this.availableDevices.findIndex(device => device.deviceId === this.currentDeviceId);
            const nextIndex = (currentIndex + 1) % this.availableDevices.length;
            this.currentDeviceId = this.availableDevices[nextIndex].deviceId;

            // Restart scanner with new device
            if (this.scanner) {
                try {
                    await this.scanner.stop();
                    await this.scanner.start();
                } catch (error) {
                    console.error('Error switching camera:', error);
                    this.errorMessage = 'Failed to switch camera. Please try again.';
                }
            }
        }
    }

    openAddFoodModal(food: FoodSearchDto) {
        this.selectedFood = food;
    }

    closeAddFoodModal() {
        this.selectedFood = null;
    }

    onFoodAdded() {
        this.closeAddFoodModal();
        if (!this.isSearchMode) {
            this.loadPastEatenFoods();
        }
    }

    onImageError(event: any) {
        event.target.style.display = 'none';
    }

    clearError() {
        this.errorMessage = '';
    }

    getCurrentResults(): FoodSearchResponse | null {
        return this.isSearchMode ? this.searchResults : this.pastEatenFoods;
    }

    isCurrentlyLoading(): boolean {
        return this.isSearchMode ? this.isSearching : this.isLoadingPastFoods;
    }
}