import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Tool {
  id: string;
  name: string;
  category: string;
  location: string;
  status: 'available' | 'checked-out' | 'maintenance';
  condition: string;
  lastCheckedOut?: Date;
  checkedOutBy?: string;
}

export interface CheckOutRecord {
  id: string;
  toolId: string;
  toolName: string;
  employeeName: string;
  employeeId: string;
  checkOutDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  notes?: string;
  status: 'checked-out' | 'returned' | 'overdue';
}

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css'],
  animations: [
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
export class CheckOutComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Available tools for checkout
  availableTools: Tool[] = [
    { id: '1', name: 'Hammer - 16oz Claw', category: 'Hand Tools', location: 'Tool Room A', status: 'available', condition: 'Good' },
    { id: '2', name: 'Drill - Cordless 20V', category: 'Power Tools', location: 'Tool Room B', status: 'available', condition: 'Excellent' },
    { id: '3', name: 'Wrench Set - Metric', category: 'Hand Tools', location: 'Tool Room A', status: 'available', condition: 'Good' },
    { id: '4', name: 'Circular Saw - 7.25"', category: 'Power Tools', location: 'Tool Room C', status: 'available', condition: 'Good' },
    { id: '5', name: 'Level - 24 inch', category: 'Measuring Tools', location: 'Tool Room A', status: 'available', condition: 'Excellent' },
    { id: '6', name: 'Safety Glasses', category: 'Safety Equipment', location: 'Safety Station', status: 'available', condition: 'Good' }
  ];

  // Current checkout records
  checkOutRecords: CheckOutRecord[] = [
    {
      id: '1',
      toolId: '7',
      toolName: 'Impact Driver - 18V',
      employeeName: 'John Smith',
      employeeId: 'EMP001',
      checkOutDate: new Date(2025, 10, 20),
      expectedReturnDate: new Date(2025, 10, 22),
      status: 'checked-out',
      notes: 'Project in Building A'
    },
    {
      id: '2',
      toolId: '8',
      toolName: 'Angle Grinder - 4.5"',
      employeeName: 'Sarah Johnson',
      employeeId: 'EMP002',
      checkOutDate: new Date(2025, 10, 19),
      expectedReturnDate: new Date(2025, 10, 21),
      status: 'overdue',
      notes: 'Maintenance work'
    }
  ];

  // Data sources for tables
  availableToolsDataSource = new MatTableDataSource(this.availableTools.filter(tool => tool.status === 'available'));
  checkOutDataSource = new MatTableDataSource(this.checkOutRecords.filter(record => record.status !== 'returned'));

  // Table columns
  availableToolsColumns = ['name', 'category', 'location', 'condition', 'actions'];
  checkOutColumns = ['toolName', 'employeeName', 'checkOutDate', 'expectedReturnDate', 'status', 'actions'];

  // Forms
  checkOutForm: FormGroup;
  selectedTool: Tool | null = null;

  // UI State
  showCheckOutForm = false;
  isLoading = false;
  today = new Date();

  // Computed properties for template
  get checkedOutCount(): number {
    return this.checkOutRecords.filter(r => r.status === 'checked-out').length;
  }

  get overdueCount(): number {
    return this.checkOutRecords.filter(r => r.status === 'overdue').length;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.checkOutForm = this.fb.group({
      employeeName: ['', [Validators.required, Validators.minLength(2)]],
      employeeId: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}\d{3}$/)]],
      expectedReturnDate: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.availableToolsDataSource.paginator = this.paginator;
    this.availableToolsDataSource.sort = this.sort;
    this.updateOverdueStatus();
  }

  ngAfterViewInit(): void {
    this.availableToolsDataSource.paginator = this.paginator;
    this.availableToolsDataSource.sort = this.sort;
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>): void {
    const filterValue = (event.target as HTMLInputElement).value;
    dataSource.filter = filterValue.trim().toLowerCase();
  }

  selectToolForCheckOut(tool: Tool): void {
    this.selectedTool = tool;
    this.showCheckOutForm = true;
    // Set minimum date to today
    const today = new Date();
    this.checkOutForm.patchValue({
      expectedReturnDate: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Default to tomorrow
    });
  }

  cancelCheckOut(): void {
    this.selectedTool = null;
    this.showCheckOutForm = false;
    this.checkOutForm.reset();
  }

  submitCheckOut(): void {
    if (this.checkOutForm.valid && this.selectedTool) {
      this.isLoading = true;

      const formValue = this.checkOutForm.value;
      const newRecord: CheckOutRecord = {
        id: Date.now().toString(),
        toolId: this.selectedTool.id,
        toolName: this.selectedTool.name,
        employeeName: formValue.employeeName,
        employeeId: formValue.employeeId,
        checkOutDate: new Date(),
        expectedReturnDate: new Date(formValue.expectedReturnDate),
        status: 'checked-out',
        notes: formValue.notes || undefined
      };

      // Simulate API call
      setTimeout(() => {
        // Add to checkout records
        this.checkOutRecords.push(newRecord);
        this.checkOutDataSource.data = this.checkOutRecords.filter(record => record.status !== 'returned');

        // Update tool status
        const tool = this.availableTools.find(t => t.id === this.selectedTool!.id);
        if (tool) {
          tool.status = 'checked-out';
          tool.lastCheckedOut = new Date();
          tool.checkedOutBy = formValue.employeeName;
        }

        // Update available tools list
        this.availableToolsDataSource.data = this.availableTools.filter(t => t.status === 'available');

        this.isLoading = false;
        this.cancelCheckOut();
        
        this.snackBar.open(`${this.selectedTool?.name} checked out successfully!`, 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  returnTool(record: CheckOutRecord): void {
    // Find and update the tool
    const tool = this.availableTools.find(t => t.id === record.toolId);
    if (tool) {
      tool.status = 'available';
      tool.checkedOutBy = undefined;
    }

    // Update the record
    record.status = 'returned';
    record.actualReturnDate = new Date();

    // Refresh data sources
    this.availableToolsDataSource.data = this.availableTools.filter(t => t.status === 'available');
    this.checkOutDataSource.data = this.checkOutRecords.filter(r => r.status !== 'returned');

    this.snackBar.open(`${record.toolName} returned successfully!`, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private updateOverdueStatus(): void {
    const today = new Date();
    this.checkOutRecords.forEach(record => {
      if (record.status === 'checked-out' && record.expectedReturnDate < today) {
        record.status = 'overdue';
      }
    });
    this.checkOutDataSource.data = this.checkOutRecords.filter(record => record.status !== 'returned');
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'checked-out': return 'primary';
      case 'overdue': return 'warn';
      case 'returned': return 'accent';
      default: return '';
    }
  }

  isOverdue(date: Date): boolean {
    return new Date(date) < new Date();
  }
}
