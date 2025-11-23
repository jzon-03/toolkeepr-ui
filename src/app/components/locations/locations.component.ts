import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Location {
  id: string;
  name: string;
  description: string;
  type: 'room' | 'building' | 'floor' | 'zone' | 'warehouse' | 'vehicle';
  address?: string;
  capacity: number;
  currentToolCount: number;
  isActive: boolean;
  coordinates?: { lat: number; lng: number };
  parentLocation?: string;
  responsiblePerson?: string;
  contactInfo?: string;
  accessLevel: 'public' | 'restricted' | 'private';
  createdDate: Date;
  lastModified: Date;
  qrCode?: string;
  features: string[];
}

export interface LocationStats {
  totalLocations: number;
  activeLocations: number;
  totalCapacity: number;
  occupancyRate: number;
  mostUsedLocation: string;
  availableSpots: number;
}

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('400ms ease-in', style({ transform: 'translateX(0%)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('250ms ease-out', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class LocationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Sample location data
  locations: Location[] = [
    {
      id: 'LOC001',
      name: 'Tool Room A',
      description: 'Main tool storage room with climate control',
      type: 'room',
      address: 'Building 1, Ground Floor',
      capacity: 100,
      currentToolCount: 85,
      isActive: true,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      responsiblePerson: 'John Smith',
      contactInfo: 'ext. 1234',
      accessLevel: 'restricted',
      createdDate: new Date(2025, 8, 1),
      lastModified: new Date(2025, 10, 15),
      qrCode: 'QR_TOOLA_001',
      features: ['Climate Control', 'Security Camera', '24/7 Access']
    },
    {
      id: 'LOC002',
      name: 'Workshop B',
      description: 'Large workshop area for heavy equipment',
      type: 'room',
      address: 'Building 2, First Floor',
      capacity: 50,
      currentToolCount: 32,
      isActive: true,
      coordinates: { lat: 40.7130, lng: -74.0062 },
      responsiblePerson: 'Sarah Johnson',
      contactInfo: 'ext. 2456',
      accessLevel: 'public',
      createdDate: new Date(2025, 8, 5),
      lastModified: new Date(2025, 10, 12),
      qrCode: 'QR_WRKB_002',
      features: ['Heavy Duty Racks', 'Power Outlets', 'Ventilation']
    },
    {
      id: 'LOC003',
      name: 'Mobile Unit 1',
      description: 'Service vehicle with portable tool storage',
      type: 'vehicle',
      capacity: 25,
      currentToolCount: 20,
      isActive: true,
      responsiblePerson: 'Mike Wilson',
      contactInfo: '555-0123',
      accessLevel: 'restricted',
      createdDate: new Date(2025, 8, 10),
      lastModified: new Date(2025, 10, 8),
      qrCode: 'QR_MOB1_003',
      features: ['GPS Tracking', 'Secure Lock', 'Weather Resistant']
    },
    {
      id: 'LOC004',
      name: 'Warehouse C',
      description: 'Large storage facility for bulk equipment',
      type: 'warehouse',
      address: 'Industrial District, Sector 3',
      capacity: 200,
      currentToolCount: 145,
      isActive: true,
      coordinates: { lat: 40.7135, lng: -74.0055 },
      responsiblePerson: 'Lisa Brown',
      contactInfo: 'ext. 3789',
      accessLevel: 'restricted',
      createdDate: new Date(2025, 7, 20),
      lastModified: new Date(2025, 10, 10),
      qrCode: 'QR_WRHC_004',
      features: ['Fork Lift Access', 'Loading Dock', 'High Ceiling']
    },
    {
      id: 'LOC005',
      name: 'Safety Station',
      description: 'Emergency equipment and safety gear storage',
      type: 'zone',
      address: 'Main Building, Emergency Exit A',
      capacity: 30,
      currentToolCount: 25,
      isActive: true,
      responsiblePerson: 'David Lee',
      contactInfo: 'ext. 9999',
      accessLevel: 'public',
      createdDate: new Date(2025, 9, 1),
      lastModified: new Date(2025, 10, 5),
      qrCode: 'QR_SAFE_005',
      features: ['Emergency Access', 'First Aid Kit', 'Fire Extinguisher']
    },
    {
      id: 'LOC006',
      name: 'Archive Storage',
      description: 'Long-term storage for rarely used equipment',
      type: 'room',
      address: 'Basement Level B2',
      capacity: 75,
      currentToolCount: 12,
      isActive: false,
      responsiblePerson: 'Admin',
      contactInfo: 'ext. 0001',
      accessLevel: 'private',
      createdDate: new Date(2025, 6, 15),
      lastModified: new Date(2025, 8, 30),
      qrCode: 'QR_ARCH_006',
      features: ['Long Term Storage', 'Dry Environment', 'Inventory Tags']
    }
  ];

  // Location types with icons and colors
  locationTypes = [
    { value: 'room', label: 'Room', icon: 'meeting_room', color: '#3182CE' },
    { value: 'building', label: 'Building', icon: 'business', color: '#38A169' },
    { value: 'floor', label: 'Floor', icon: 'layers', color: '#D69E2E' },
    { value: 'zone', label: 'Zone', icon: 'place', color: '#805AD5' },
    { value: 'warehouse', label: 'Warehouse', icon: 'warehouse', color: '#DD6B20' },
    { value: 'vehicle', label: 'Vehicle', icon: 'local_shipping', color: '#E53E3E' }
  ];

  accessLevels = [
    { value: 'public', label: 'Public Access', icon: 'public', color: 'primary' },
    { value: 'restricted', label: 'Restricted', icon: 'lock', color: 'accent' },
    { value: 'private', label: 'Private', icon: 'security', color: 'warn' }
  ];

  availableFeatures = [
    'Climate Control', 'Security Camera', '24/7 Access', 'Heavy Duty Racks',
    'Power Outlets', 'Ventilation', 'GPS Tracking', 'Secure Lock',
    'Weather Resistant', 'Fork Lift Access', 'Loading Dock', 'High Ceiling',
    'Emergency Access', 'First Aid Kit', 'Fire Extinguisher', 'Long Term Storage',
    'Dry Environment', 'Inventory Tags', 'Wi-Fi Access', 'RFID Scanner'
  ];

  // Data sources and table configuration
  dataSource = new MatTableDataSource(this.locations);
  displayedColumns = ['id', 'name', 'type', 'capacity', 'occupancy', 'access', 'responsible', 'status', 'actions'];

  // Forms and UI state
  locationForm: FormGroup;
  editingLocation: Location | null = null;
  showAddModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  showDetailsModal = false;
  locationToDelete: Location | null = null;
  selectedLocation: Location | null = null;
  isLoading = false;
  viewMode: 'grid' | 'list' | 'map' = 'grid';
  filterType: 'all' | 'room' | 'building' | 'warehouse' | 'vehicle' | 'zone' | 'floor' = 'all';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.locationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(300)]],
      type: ['room', Validators.required],
      address: [''],
      capacity: [0, [Validators.required, Validators.min(1), Validators.max(1000)]],
      responsiblePerson: ['', Validators.required],
      contactInfo: [''],
      accessLevel: ['public', Validators.required],
      isActive: [true],
      features: [[]]
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Computed properties for dashboard
  get stats(): LocationStats {
    const activeLocations = this.locations.filter(l => l.isActive);
    const totalCapacity = this.locations.reduce((sum, l) => sum + l.capacity, 0);
    const totalOccupied = this.locations.reduce((sum, l) => sum + l.currentToolCount, 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
    const mostUsed = this.locations.reduce((prev, current) => 
      (prev.currentToolCount > current.currentToolCount) ? prev : current
    );
    const availableSpots = totalCapacity - totalOccupied;

    return {
      totalLocations: this.locations.length,
      activeLocations: activeLocations.length,
      totalCapacity,
      occupancyRate: Math.round(occupancyRate),
      mostUsedLocation: mostUsed.name,
      availableSpots
    };
  }

  // Filter and search functionality
  applySearchFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilters(): void {
    let filteredData = this.locations;
    
    if (this.filterType !== 'all') {
      filteredData = filteredData.filter(location => location.type === this.filterType);
    }
    
    if (this.filterStatus !== 'all') {
      filteredData = filteredData.filter(location => 
        this.filterStatus === 'active' ? location.isActive : !location.isActive
      );
    }
    
    this.dataSource.data = filteredData;
  }

  setFilterType(type: any): void {
    this.filterType = type;
    this.applyFilters();
  }

  setFilterStatus(status: 'all' | 'active' | 'inactive'): void {
    this.filterStatus = status;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'list' | 'map'): void {
    this.viewMode = mode;
  }

  // Location management
  openAddModal(): void {
    this.editingLocation = null;
    this.locationForm.reset({
      name: '',
      description: '',
      type: 'room',
      address: '',
      capacity: 10,
      responsiblePerson: '',
      contactInfo: '',
      accessLevel: 'public',
      isActive: true,
      features: []
    });
    this.showAddModal = true;
  }

  openEditModal(location: Location): void {
    this.editingLocation = location;
    this.locationForm.patchValue({
      name: location.name,
      description: location.description,
      type: location.type,
      address: location.address || '',
      capacity: location.capacity,
      responsiblePerson: location.responsiblePerson || '',
      contactInfo: location.contactInfo || '',
      accessLevel: location.accessLevel,
      isActive: location.isActive,
      features: location.features || []
    });
    this.showEditModal = true;
  }

  openDetailsModal(location: Location): void {
    this.selectedLocation = location;
    this.showDetailsModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.showDetailsModal = false;
    this.editingLocation = null;
    this.selectedLocation = null;
    this.locationForm.reset();
  }

  saveLocation(): void {
    if (this.locationForm.valid) {
      this.isLoading = true;
      const formValue = this.locationForm.value;

      setTimeout(() => {
        if (this.editingLocation) {
          // Update existing location
          const index = this.locations.findIndex(l => l.id === this.editingLocation!.id);
          if (index > -1) {
            this.locations[index] = {
              ...this.editingLocation,
              ...formValue,
              lastModified: new Date(),
              currentToolCount: this.editingLocation.currentToolCount
            };
          }
          this.snackBar.open('Location updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          // Add new location
          const newLocation: Location = {
            id: 'LOC' + String(this.locations.length + 1).padStart(3, '0'),
            ...formValue,
            currentToolCount: 0,
            coordinates: formValue.type === 'vehicle' ? undefined : { lat: 40.7128, lng: -74.0060 },
            qrCode: 'QR_' + formValue.name.replace(/\s/g, '').toUpperCase() + '_' + String(this.locations.length + 1).padStart(3, '0'),
            createdDate: new Date(),
            lastModified: new Date()
          };
          this.locations.push(newLocation);
          this.snackBar.open('Location created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }

        this.applyFilters();
        this.isLoading = false;
        this.closeModal();
      }, 800);
    }
  }

  confirmDelete(location: Location): void {
    this.locationToDelete = location;
    this.showDeleteConfirm = true;
  }

  deleteLocation(): void {
    if (this.locationToDelete) {
      const index = this.locations.findIndex(l => l.id === this.locationToDelete!.id);
      if (index > -1) {
        this.locations.splice(index, 1);
        this.applyFilters();
        this.snackBar.open('Location deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    }
    this.showDeleteConfirm = false;
    this.locationToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.locationToDelete = null;
  }

  toggleLocationStatus(location: Location): void {
    location.isActive = !location.isActive;
    location.lastModified = new Date();
    this.applyFilters();
    
    const status = location.isActive ? 'activated' : 'deactivated';
    this.snackBar.open(`Location ${status} successfully!`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Utility methods
  getTypeInfo(type: string): any {
    return this.locationTypes.find(t => t.value === type) || this.locationTypes[0];
  }

  getAccessInfo(access: string): any {
    return this.accessLevels.find(a => a.value === access) || this.accessLevels[0];
  }

  getOccupancyPercentage(location: Location): number {
    return location.capacity > 0 ? (location.currentToolCount / location.capacity) * 100 : 0;
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  generateQRCode(location: Location): void {
    // Simulate QR code generation
    this.snackBar.open(`QR Code generated: ${location.qrCode}`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Export functionality
  exportLocations(): void {
    const dataStr = JSON.stringify(this.locations, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `locations-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.snackBar.open('Locations exported successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Feature management
  toggleFeature(feature: string): void {
    const features = this.locationForm.get('features')?.value || [];
    const index = features.indexOf(feature);
    
    if (index > -1) {
      features.splice(index, 1);
    } else {
      features.push(feature);
    }
    
    this.locationForm.patchValue({ features });
  }

  isFeatureSelected(feature: string): boolean {
    const features = this.locationForm.get('features')?.value || [];
    return features.includes(feature);
  }
}
