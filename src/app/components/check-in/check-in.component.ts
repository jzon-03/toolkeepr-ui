import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

export interface CheckedOutTool {
  id: string;
  toolId: string;
  toolName: string;
  category: string;
  employeeName: string;
  employeeId: string;
  checkOutDate: Date;
  expectedReturnDate: Date;
  location: string;
  condition: string;
  notes?: string;
  status: 'checked-out' | 'overdue' | 'damaged' | 'maintenance-needed';
  isSelected?: boolean;
}

export interface ReturnRecord {
  id: string;
  toolId: string;
  toolName: string;
  employeeName: string;
  employeeId: string;
  checkOutDate: Date;
  returnDate: Date;
  returnCondition: string;
  damageNotes?: string;
  maintenanceRequired: boolean;
  returnedBy: string;
  inspectedBy?: string;
}

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
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
        animate('300ms ease-out', style({ opacity: 0, transform: 'scale(0.95)' }))
      ])
    ])
  ]
})
export class CheckInComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Sample data for checked out tools
  checkedOutTools: CheckedOutTool[] = [
    {
      id: '1',
      toolId: 'T001',
      toolName: 'Impact Driver - 18V',
      category: 'Power Tools',
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      checkOutDate: new Date(2025, 10, 20),
      expectedReturnDate: new Date(2025, 10, 22),
      location: 'Tool Room B',
      condition: 'Good',
      status: 'checked-out',
      notes: 'Project in Building A'
    },
    {
      id: '2',
      toolId: 'T002',
      toolName: 'Angle Grinder - 4.5"',
      category: 'Power Tools',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP002',
      checkOutDate: new Date(2025, 10, 19),
      expectedReturnDate: new Date(2025, 10, 21),
      location: 'Tool Room C',
      condition: 'Excellent',
      status: 'overdue',
      notes: 'Maintenance work'
    },
    {
      id: '3',
      toolId: 'T003',
      toolName: 'Circular Saw - 7.25"',
      category: 'Power Tools',
      employeeName: 'Mike Wilson',
      employeeId: 'EMP003',
      checkOutDate: new Date(2025, 10, 18),
      expectedReturnDate: new Date(2025, 10, 25),
      location: 'Tool Room A',
      condition: 'Good',
      status: 'checked-out',
      notes: 'Framing project'
    },
    {
      id: '4',
      toolId: 'T004',
      toolName: 'Cordless Drill - 20V',
      category: 'Power Tools',
      employeeName: 'Lisa Brown',
      employeeId: 'EMP004',
      checkOutDate: new Date(2025, 10, 21),
      expectedReturnDate: new Date(2025, 10, 23),
      location: 'Tool Room B',
      condition: 'Good',
      status: 'checked-out',
      notes: 'Assembly work'
    }
  ];

  // Recent returns for tracking
  recentReturns: ReturnRecord[] = [
    {
      id: '1',
      toolId: 'T005',
      toolName: 'Hammer - 16oz Claw',
      employeeName: 'David Lee',
      employeeId: 'EMP005',
      checkOutDate: new Date(2025, 10, 15),
      returnDate: new Date(2025, 10, 22),
      returnCondition: 'Good',
      maintenanceRequired: false,
      returnedBy: 'Reception Desk'
    }
  ];

  // Data sources
  checkedOutDataSource = new MatTableDataSource(this.checkedOutTools);
  recentReturnsDataSource = new MatTableDataSource(this.recentReturns);

  // Table columns
  checkedOutColumns = ['select', 'toolName', 'employee', 'checkOutDate', 'expectedReturnDate', 'status', 'actions'];
  recentReturnsColumns = ['toolName', 'employee', 'returnDate', 'condition', 'maintenanceRequired'];

  // Forms and UI state
  returnForm: FormGroup;
  bulkReturnForm: FormGroup;
  selectedTools: CheckedOutTool[] = [];
  showReturnModal = false;
  showBulkReturnModal = false;
  currentTool: CheckedOutTool | null = null;
  isProcessing = false;
  scannerMode = false;
  scannedToolId = '';

  // View modes
  viewMode: 'grid' | 'list' = 'list';
  filterStatus: 'all' | 'checked-out' | 'overdue' = 'all';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.returnForm = this.fb.group({
      returnCondition: ['good', Validators.required],
      damageNotes: [''],
      maintenanceRequired: [false],
      returnedBy: ['', Validators.required],
      inspectedBy: [''],
      additionalNotes: ['']
    });

    this.bulkReturnForm = this.fb.group({
      returnedBy: ['', Validators.required],
      inspectedBy: [''],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.checkedOutDataSource.paginator = this.paginator;
    this.checkedOutDataSource.sort = this.sort;
    this.updateOverdueStatus();
    this.applyStatusFilter();
  }

  ngAfterViewInit(): void {
    this.checkedOutDataSource.paginator = this.paginator;
    this.checkedOutDataSource.sort = this.sort;
  }

  // Computed properties
  get totalCheckedOut(): number {
    return this.checkedOutTools.length;
  }

  get overdueCount(): number {
    return this.checkedOutTools.filter(tool => tool.status === 'overdue').length;
  }

  get selectedCount(): number {
    return this.selectedTools.length;
  }

  get todayReturns(): number {
    const today = new Date();
    return this.recentReturns.filter(r => 
      r.returnDate.toDateString() === today.toDateString()
    ).length;
  }

  // Filter and search functionality
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.checkedOutDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyStatusFilter(): void {
    let filteredData = this.checkedOutTools;
    
    if (this.filterStatus !== 'all') {
      filteredData = this.checkedOutTools.filter(tool => tool.status === this.filterStatus);
    }
    
    this.checkedOutDataSource.data = filteredData;
  }

  setFilterStatus(status: 'all' | 'checked-out' | 'overdue'): void {
    this.filterStatus = status;
    this.applyStatusFilter();
  }

  // Tool selection
  toggleToolSelection(tool: CheckedOutTool): void {
    const index = this.selectedTools.findIndex(t => t.id === tool.id);
    if (index > -1) {
      this.selectedTools.splice(index, 1);
      tool.isSelected = false;
    } else {
      this.selectedTools.push(tool);
      tool.isSelected = true;
    }
  }

  isToolSelected(tool: CheckedOutTool): boolean {
    return this.selectedTools.some(t => t.id === tool.id);
  }

  selectAllTools(): void {
    const allSelected = this.checkedOutDataSource.data.every(tool => tool.isSelected);
    
    if (allSelected) {
      // Deselect all
      this.selectedTools = [];
      this.checkedOutDataSource.data.forEach(tool => tool.isSelected = false);
    } else {
      // Select all visible tools
      this.selectedTools = [...this.checkedOutDataSource.data];
      this.checkedOutDataSource.data.forEach(tool => tool.isSelected = true);
    }
  }

  // Return functionality
  startSingleReturn(tool: CheckedOutTool): void {
    this.currentTool = tool;
    this.showReturnModal = true;
    this.returnForm.patchValue({
      returnCondition: 'good',
      returnedBy: 'Reception Desk'
    });
  }

  startBulkReturn(): void {
    if (this.selectedTools.length === 0) {
      this.snackBar.open('Please select tools to return', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    this.showBulkReturnModal = true;
    this.bulkReturnForm.patchValue({
      returnedBy: 'Reception Desk'
    });
  }

  processSingleReturn(): void {
    if (this.returnForm.valid && this.currentTool) {
      this.isProcessing = true;
      const formValue = this.returnForm.value;

      setTimeout(() => {
        const returnRecord: ReturnRecord = {
          id: Date.now().toString(),
          toolId: this.currentTool!.toolId,
          toolName: this.currentTool!.toolName,
          employeeName: this.currentTool!.employeeName,
          employeeId: this.currentTool!.employeeId,
          checkOutDate: this.currentTool!.checkOutDate,
          returnDate: new Date(),
          returnCondition: formValue.returnCondition,
          damageNotes: formValue.damageNotes || undefined,
          maintenanceRequired: formValue.maintenanceRequired,
          returnedBy: formValue.returnedBy,
          inspectedBy: formValue.inspectedBy || undefined
        };

        // Add to recent returns
        this.recentReturns.unshift(returnRecord);
        this.recentReturnsDataSource.data = [...this.recentReturns];

        // Remove from checked out tools
        this.removeToolFromCheckout(this.currentTool!.id);
        
        this.isProcessing = false;
        this.closeReturnModal();
        
        this.snackBar.open(`${this.currentTool!.toolName} returned successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  processBulkReturn(): void {
    if (this.bulkReturnForm.valid && this.selectedTools.length > 0) {
      this.isProcessing = true;
      const formValue = this.bulkReturnForm.value;

      setTimeout(() => {
        this.selectedTools.forEach(tool => {
          const returnRecord: ReturnRecord = {
            id: Date.now().toString() + tool.id,
            toolId: tool.toolId,
            toolName: tool.toolName,
            employeeName: tool.employeeName,
            employeeId: tool.employeeId,
            checkOutDate: tool.checkOutDate,
            returnDate: new Date(),
            returnCondition: 'good',
            maintenanceRequired: false,
            returnedBy: formValue.returnedBy,
            inspectedBy: formValue.inspectedBy || undefined
          };

          this.recentReturns.unshift(returnRecord);
          this.removeToolFromCheckout(tool.id);
        });

        this.recentReturnsDataSource.data = [...this.recentReturns];
        const count = this.selectedTools.length;
        this.selectedTools = [];
        
        this.isProcessing = false;
        this.closeBulkReturnModal();
        
        this.snackBar.open(`${count} tools returned successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1500);
    }
  }

  // Scanner functionality
  toggleScanner(): void {
    this.scannerMode = !this.scannerMode;
    if (this.scannerMode) {
      this.scannedToolId = '';
    }
  }

  processScannedTool(): void {
    const tool = this.checkedOutTools.find(t => 
      t.toolId.toLowerCase() === this.scannedToolId.toLowerCase()
    );
    
    if (tool) {
      this.startSingleReturn(tool);
      this.scannerMode = false;
      this.scannedToolId = '';
    } else {
      this.snackBar.open(`Tool ${this.scannedToolId} not found in checked out tools`, 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  // Utility methods
  private removeToolFromCheckout(toolId: string): void {
    const index = this.checkedOutTools.findIndex(tool => tool.id === toolId);
    if (index > -1) {
      this.checkedOutTools.splice(index, 1);
      this.checkedOutDataSource.data = [...this.checkedOutTools];
    }
  }

  private updateOverdueStatus(): void {
    const today = new Date();
    this.checkedOutTools.forEach(tool => {
      if (tool.expectedReturnDate < today && tool.status === 'checked-out') {
        tool.status = 'overdue';
      }
    });
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
    this.currentTool = null;
    this.returnForm.reset();
  }

  closeBulkReturnModal(): void {
    this.showBulkReturnModal = false;
    this.bulkReturnForm.reset();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'checked-out': return 'primary';
      case 'overdue': return 'warn';
      case 'damaged': return 'accent';
      default: return '';
    }
  }

  getDaysOverdue(expectedDate: Date): number {
    const today = new Date();
    const diffTime = today.getTime() - expectedDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(date: Date): boolean {
    return new Date(date) < new Date();
  }
}
