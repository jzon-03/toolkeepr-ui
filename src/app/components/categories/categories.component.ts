import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  toolCount: number;
  isActive: boolean;
  createdDate: Date;
  lastModified: Date;
  parentCategory?: string;
  subcategories?: Category[];
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  totalTools: number;
  mostUsedCategory: string;
  recentlyAdded: number;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-out', style({ transform: 'translateY(-20px)', opacity: 0 }))
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
export class CategoriesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Sample category data
  categories: Category[] = [
    {
      id: '1',
      name: 'Power Tools',
      description: 'Electric and battery-powered tools for construction and maintenance',
      color: '#E53E3E',
      icon: 'power',
      toolCount: 25,
      isActive: true,
      createdDate: new Date(2025, 8, 1),
      lastModified: new Date(2025, 10, 15)
    },
    {
      id: '2',
      name: 'Hand Tools',
      description: 'Manual tools for precision work and basic tasks',
      color: '#3182CE',
      icon: 'build',
      toolCount: 45,
      isActive: true,
      createdDate: new Date(2025, 8, 2),
      lastModified: new Date(2025, 10, 10)
    },
    {
      id: '3',
      name: 'Measuring Tools',
      description: 'Precision instruments for measurement and alignment',
      color: '#38A169',
      icon: 'straighten',
      toolCount: 12,
      isActive: true,
      createdDate: new Date(2025, 8, 5),
      lastModified: new Date(2025, 10, 8)
    },
    {
      id: '4',
      name: 'Safety Equipment',
      description: 'Personal protective equipment and safety gear',
      color: '#D69E2E',
      icon: 'security',
      toolCount: 18,
      isActive: true,
      createdDate: new Date(2025, 8, 10),
      lastModified: new Date(2025, 10, 12)
    },
    {
      id: '5',
      name: 'Cutting Tools',
      description: 'Saws, blades, and cutting implements',
      color: '#805AD5',
      icon: 'content_cut',
      toolCount: 8,
      isActive: true,
      createdDate: new Date(2025, 9, 1),
      lastModified: new Date(2025, 10, 5)
    },
    {
      id: '6',
      name: 'Fastening Tools',
      description: 'Screws, bolts, and fastening equipment',
      color: '#DD6B20',
      icon: 'construction',
      toolCount: 15,
      isActive: true,
      createdDate: new Date(2025, 9, 10),
      lastModified: new Date(2025, 10, 1)
    },
    {
      id: '7',
      name: 'Cleaning Tools',
      description: 'Maintenance and cleaning equipment',
      color: '#0BC5EA',
      icon: 'cleaning_services',
      toolCount: 7,
      isActive: false,
      createdDate: new Date(2025, 7, 15),
      lastModified: new Date(2025, 8, 20)
    }
  ];

  // Pre-defined colors and icons for new categories
  availableColors = [
    '#E53E3E', '#3182CE', '#38A169', '#D69E2E', '#805AD5', 
    '#DD6B20', '#0BC5EA', '#F56565', '#4299E1', '#48BB78'
  ];

  availableIcons = [
    'build', 'power', 'construction', 'security', 'content_cut',
    'straighten', 'cleaning_services', 'hardware', 'engineering',
    'precision_manufacturing', 'handyman', 'electrical_services'
  ];

  // Data sources and table configuration
  dataSource = new MatTableDataSource(this.categories);
  displayedColumns = ['icon', 'name', 'description', 'toolCount', 'status', 'lastModified', 'actions'];

  // Forms and UI state
  categoryForm: FormGroup;
  editingCategory: Category | null = null;
  showAddModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  categoryToDelete: Category | null = null;
  isLoading = false;
  viewMode: 'grid' | 'list' = 'grid';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(200)]],
      color: ['#3182CE', Validators.required],
      icon: ['build', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Computed properties for dashboard
  get stats(): CategoryStats {
    const activeCategories = this.categories.filter(c => c.isActive);
    const totalTools = this.categories.reduce((sum, c) => sum + c.toolCount, 0);
    const mostUsed = this.categories.reduce((prev, current) => 
      (prev.toolCount > current.toolCount) ? prev : current
    );
    const recentlyAdded = this.categories.filter(c => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return c.createdDate >= weekAgo;
    }).length;

    return {
      totalCategories: this.categories.length,
      activeCategories: activeCategories.length,
      totalTools,
      mostUsedCategory: mostUsed.name,
      recentlyAdded
    };
  }

  // Filter and search functionality
  applySearchFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilter(): void {
    let filteredData = this.categories;
    
    if (this.filterStatus !== 'all') {
      filteredData = this.categories.filter(category => 
        this.filterStatus === 'active' ? category.isActive : !category.isActive
      );
    }
    
    this.dataSource.data = filteredData;
  }

  setFilterStatus(status: 'all' | 'active' | 'inactive'): void {
    this.filterStatus = status;
    this.applyFilter();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  // Category management
  openAddModal(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      name: '',
      description: '',
      color: this.availableColors[Math.floor(Math.random() * this.availableColors.length)],
      icon: this.availableIcons[0],
      isActive: true
    });
    this.showAddModal = true;
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive
    });
    this.showEditModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.showEditModal = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      const formValue = this.categoryForm.value;

      setTimeout(() => {
        if (this.editingCategory) {
          // Update existing category
          const index = this.categories.findIndex(c => c.id === this.editingCategory!.id);
          if (index > -1) {
            this.categories[index] = {
              ...this.editingCategory,
              ...formValue,
              lastModified: new Date()
            };
          }
          this.snackBar.open('Category updated successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        } else {
          // Add new category
          const newCategory: Category = {
            id: Date.now().toString(),
            ...formValue,
            toolCount: 0,
            createdDate: new Date(),
            lastModified: new Date()
          };
          this.categories.push(newCategory);
          this.snackBar.open('Category created successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        }

        this.applyFilter();
        this.isLoading = false;
        this.closeModal();
      }, 800);
    }
  }

  confirmDelete(category: Category): void {
    this.categoryToDelete = category;
    this.showDeleteConfirm = true;
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      const index = this.categories.findIndex(c => c.id === this.categoryToDelete!.id);
      if (index > -1) {
        this.categories.splice(index, 1);
        this.applyFilter();
        this.snackBar.open('Category deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    }
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.categoryToDelete = null;
  }

  toggleCategoryStatus(category: Category): void {
    category.isActive = !category.isActive;
    category.lastModified = new Date();
    this.applyFilter();
    
    const status = category.isActive ? 'activated' : 'deactivated';
    this.snackBar.open(`Category ${status} successfully!`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  // Utility methods
  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'primary' : 'warn';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  // Duplicate category check
  categoryNameExists(name: string): boolean {
    const trimmedName = name.trim().toLowerCase();
    return this.categories.some(category => {
      const isEdit = this.editingCategory && category.id === this.editingCategory.id;
      return !isEdit && category.name.toLowerCase() === trimmedName;
    });
  }

  // Export functionality
  exportCategories(): void {
    const dataStr = JSON.stringify(this.categories, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    this.snackBar.open('Categories exported successfully!', 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
