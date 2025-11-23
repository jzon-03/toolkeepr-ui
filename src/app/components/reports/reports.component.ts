import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Report Interfaces
export interface ReportData {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  category: string;
  createdDate: Date;
  lastGenerated?: Date;
  parameters?: ReportParameter[];
  isScheduled: boolean;
  scheduleFrequency?: ScheduleFrequency;
  recipients?: string[];
  format: ReportFormat[];
  tags: string[];
  isActive: boolean;
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'dateRange' | 'dropdown' | 'multiSelect' | 'number' | 'text';
  required: boolean;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  validation?: any;
}

export interface ReportResult {
  reportId: string;
  generatedDate: Date;
  generatedBy: string;
  parameters: { [key: string]: any };
  data: any[];
  summary: ReportSummary;
  chartData?: ChartData;
  executionTime: number;
  recordCount: number;
  filePath?: string;
}

export interface ReportSummary {
  totalRecords: number;
  filters: string[];
  dateRange: { start: Date; end: Date };
  keyMetrics: { label: string; value: number | string; trend?: 'up' | 'down' | 'stable' }[];
}

export interface DashboardMetrics {
  totalReports: number;
  scheduledReports: number;
  reportsGeneratedToday: number;
  averageExecutionTime: number;
  popularReportTypes: { type: string; count: number }[];
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type: 'generated' | 'scheduled' | 'shared' | 'created';
  reportName: string;
  user: string;
  timestamp: Date;
  details: string;
}

export enum ReportType {
  INVENTORY = 'inventory',
  CHECKOUT = 'checkout',
  USAGE = 'usage',
  MAINTENANCE = 'maintenance',
  COMPLIANCE = 'compliance',
  ANALYTICS = 'analytics',
  FINANCIAL = 'financial',
  AUDIT = 'audit'
}

export enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ReportsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dashboardChart', { static: false }) dashboardChartRef!: ElementRef;
  @ViewChild('trendChart', { static: false }) trendChartRef!: ElementRef;

  // Component State
  viewMode: 'dashboard' | 'reports' | 'builder' = 'dashboard';
  selectedReport: ReportData | null = null;
  reportResult: ReportResult | null = null;
  isLoading = false;
  isGenerating = false;

  // Modal States
  showReportModal = false;
  showBuilderModal = false;
  showScheduleModal = false;
  showPreviewModal = false;
  showDeleteConfirm = false;
  reportToDelete: ReportData | null = null;

  // Forms
  reportForm!: FormGroup;
  parameterForm!: FormGroup;
  scheduleForm!: FormGroup;

  // Data Sources
  dataSource = new MatTableDataSource<ReportData>([]);
  displayedColumns = ['name', 'type', 'category', 'lastGenerated', 'schedule', 'status', 'actions'];
  
  // Dashboard Data
  dashboardMetrics: DashboardMetrics = {
    totalReports: 0,
    scheduledReports: 0,
    reportsGeneratedToday: 0,
    averageExecutionTime: 0,
    popularReportTypes: [],
    recentActivity: []
  };

  // Chart References
  dashboardChart: Chart | null = null;
  trendChart: Chart | null = null;

  // Configuration
  reportTypes = [
    { value: ReportType.INVENTORY, label: 'Inventory Reports', icon: 'inventory', color: '#3498db', description: 'Tool inventory, stock levels, locations' },
    { value: ReportType.CHECKOUT, label: 'Checkout Reports', icon: 'exit_to_app', color: '#2ecc71', description: 'Tool checkouts, returns, overdue items' },
    { value: ReportType.USAGE, label: 'Usage Analytics', icon: 'timeline', color: '#9b59b6', description: 'Usage patterns, frequency, trends' },
    { value: ReportType.MAINTENANCE, label: 'Maintenance Reports', icon: 'build', color: '#e67e22', description: 'Maintenance schedules, costs, history' },
    { value: ReportType.COMPLIANCE, label: 'Compliance Reports', icon: 'verified', color: '#1abc9c', description: 'Audit trails, compliance status' },
    { value: ReportType.ANALYTICS, label: 'Advanced Analytics', icon: 'analytics', color: '#f39c12', description: 'Custom analytics and insights' },
    { value: ReportType.FINANCIAL, label: 'Financial Reports', icon: 'attach_money', color: '#27ae60', description: 'Cost analysis, ROI, budgets' },
    { value: ReportType.AUDIT, label: 'Audit Reports', icon: 'fact_check', color: '#e74c3c', description: 'Security audits, access logs' }
  ];

  reportCategories = [
    'Operations', 'Management', 'Finance', 'Compliance', 'Analytics', 'Custom'
  ];

  scheduleFrequencies = [
    { value: ScheduleFrequency.DAILY, label: 'Daily', icon: 'today' },
    { value: ScheduleFrequency.WEEKLY, label: 'Weekly', icon: 'date_range' },
    { value: ScheduleFrequency.MONTHLY, label: 'Monthly', icon: 'calendar_month' },
    { value: ScheduleFrequency.QUARTERLY, label: 'Quarterly', icon: 'event' },
    { value: ScheduleFrequency.YEARLY, label: 'Yearly', icon: 'calendar_today' }
  ];

  reportFormats = [
    { value: ReportFormat.PDF, label: 'PDF', icon: 'picture_as_pdf', color: '#e74c3c' },
    { value: ReportFormat.EXCEL, label: 'Excel', icon: 'table_chart', color: '#27ae60' },
    { value: ReportFormat.CSV, label: 'CSV', icon: 'description', color: '#3498db' },
    { value: ReportFormat.JSON, label: 'JSON', icon: 'code', color: '#9b59b6' }
  ];

  filterType = 'all';
  filterCategory = 'all';
  searchTerm = '';

  constructor(private fb: FormBuilder) {
    this.initializeForms();
    this.initializeData();
  }

  ngOnInit() {
    this.loadDashboardData();
    this.loadReports();
    setTimeout(() => this.initializeCharts(), 100);
  }

  private initializeForms() {
    this.reportForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      category: ['', Validators.required],
      tags: [[]],
      format: [[], Validators.required],
      isActive: [true]
    });

    this.parameterForm = this.fb.group({
      dateRange: [''],
      location: [''],
      category: [''],
      responsible: [''],
      status: ['']
    });

    this.scheduleForm = this.fb.group({
      enabled: [false],
      frequency: [''],
      startDate: [''],
      time: [''],
      recipients: [[]],
      format: ['']
    });
  }

  private initializeData() {
    // Generate mock report data
    const mockReports: ReportData[] = [
      {
        id: 'RPT001',
        name: 'Daily Inventory Summary',
        description: 'Daily summary of tool inventory levels and status across all locations',
        type: ReportType.INVENTORY,
        category: 'Operations',
        createdDate: new Date('2024-01-15'),
        lastGenerated: new Date(),
        isScheduled: true,
        scheduleFrequency: ScheduleFrequency.DAILY,
        recipients: ['manager@company.com'],
        format: [ReportFormat.PDF, ReportFormat.EXCEL],
        tags: ['daily', 'inventory', 'summary'],
        isActive: true
      },
      {
        id: 'RPT002',
        name: 'Weekly Checkout Analysis',
        description: 'Comprehensive analysis of tool checkout patterns and user behavior',
        type: ReportType.CHECKOUT,
        category: 'Analytics',
        createdDate: new Date('2024-01-10'),
        lastGenerated: new Date(Date.now() - 86400000),
        isScheduled: true,
        scheduleFrequency: ScheduleFrequency.WEEKLY,
        recipients: ['analytics@company.com', 'ops@company.com'],
        format: [ReportFormat.PDF],
        tags: ['weekly', 'checkout', 'analysis'],
        isActive: true
      },
      {
        id: 'RPT003',
        name: 'Monthly Maintenance Report',
        description: 'Monthly maintenance schedule and costs analysis for all equipment',
        type: ReportType.MAINTENANCE,
        category: 'Management',
        createdDate: new Date('2024-01-05'),
        lastGenerated: new Date(Date.now() - 2592000000),
        isScheduled: true,
        scheduleFrequency: ScheduleFrequency.MONTHLY,
        recipients: ['maintenance@company.com'],
        format: [ReportFormat.EXCEL, ReportFormat.CSV],
        tags: ['monthly', 'maintenance', 'costs'],
        isActive: true
      },
      {
        id: 'RPT004',
        name: 'Compliance Audit Trail',
        description: 'Security and compliance audit trail for tool access and modifications',
        type: ReportType.COMPLIANCE,
        category: 'Compliance',
        createdDate: new Date('2024-01-01'),
        lastGenerated: new Date(Date.now() - 604800000),
        isScheduled: false,
        format: [ReportFormat.PDF, ReportFormat.JSON],
        tags: ['audit', 'compliance', 'security'],
        isActive: true
      },
      {
        id: 'RPT005',
        name: 'Usage Trends Dashboard',
        description: 'Advanced analytics on tool usage patterns and trend predictions',
        type: ReportType.USAGE,
        category: 'Analytics',
        createdDate: new Date('2024-01-20'),
        lastGenerated: new Date(Date.now() - 172800000),
        isScheduled: false,
        format: [ReportFormat.PDF],
        tags: ['trends', 'usage', 'analytics'],
        isActive: true
      },
      {
        id: 'RPT006',
        name: 'Financial Cost Analysis',
        description: 'Quarterly financial analysis of tool costs, ROI, and budget planning',
        type: ReportType.FINANCIAL,
        category: 'Finance',
        createdDate: new Date('2024-01-12'),
        isScheduled: true,
        scheduleFrequency: ScheduleFrequency.QUARTERLY,
        recipients: ['finance@company.com'],
        format: [ReportFormat.EXCEL],
        tags: ['financial', 'costs', 'ROI'],
        isActive: false
      }
    ];

    this.dataSource.data = mockReports;

    // Generate recent activity
    const mockActivity: RecentActivity[] = [
      {
        id: 'ACT001',
        type: 'generated',
        reportName: 'Daily Inventory Summary',
        user: 'John Doe',
        timestamp: new Date(),
        details: 'Generated successfully with 1,250 records'
      },
      {
        id: 'ACT002',
        type: 'scheduled',
        reportName: 'Weekly Checkout Analysis',
        user: 'Jane Smith',
        timestamp: new Date(Date.now() - 3600000),
        details: 'Scheduled for every Monday at 9:00 AM'
      },
      {
        id: 'ACT003',
        type: 'shared',
        reportName: 'Monthly Maintenance Report',
        user: 'Mike Johnson',
        timestamp: new Date(Date.now() - 7200000),
        details: 'Shared with maintenance team'
      },
      {
        id: 'ACT004',
        type: 'created',
        reportName: 'Usage Trends Dashboard',
        user: 'Sarah Wilson',
        timestamp: new Date(Date.now() - 10800000),
        details: 'New custom report created'
      }
    ];

    // Calculate metrics
    this.dashboardMetrics = {
      totalReports: mockReports.length,
      scheduledReports: mockReports.filter(r => r.isScheduled).length,
      reportsGeneratedToday: 3,
      averageExecutionTime: 2.3,
      popularReportTypes: [
        { type: 'Inventory', count: 15 },
        { type: 'Checkout', count: 12 },
        { type: 'Analytics', count: 8 },
        { type: 'Maintenance', count: 6 }
      ],
      recentActivity: mockActivity
    };
  }

  private loadDashboardData() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  private loadReports() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.applyFilters();
  }

  private initializeCharts() {
    this.createDashboardChart();
    this.createTrendChart();
  }

  private createDashboardChart() {
    if (this.dashboardChartRef?.nativeElement) {
      const ctx = this.dashboardChartRef.nativeElement.getContext('2d');
      
      this.dashboardChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.dashboardMetrics.popularReportTypes.map(t => t.type),
          datasets: [{
            data: this.dashboardMetrics.popularReportTypes.map(t => t.count),
            backgroundColor: ['#3498db', '#2ecc71', '#9b59b6', '#e67e22'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    }
  }

  private createTrendChart() {
    if (this.trendChartRef?.nativeElement) {
      const ctx = this.trendChartRef.nativeElement.getContext('2d');
      
      this.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            label: 'Reports Generated',
            data: [12, 19, 15, 25],
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  // View Management
  setViewMode(mode: 'dashboard' | 'reports' | 'builder') {
    this.viewMode = mode;
    if (mode === 'dashboard') {
      setTimeout(() => this.initializeCharts(), 100);
    }
  }

  // Filtering and Search
  applyFilters() {
    this.dataSource.filterPredicate = (data: ReportData) => {
      const matchesType = this.filterType === 'all' || data.type === this.filterType;
      const matchesCategory = this.filterCategory === 'all' || data.category === this.filterCategory;
      const matchesSearch = !this.searchTerm || 
        data.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        data.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        data.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesType && matchesCategory && matchesSearch;
    };
    this.dataSource.filter = Math.random().toString(); // Trigger filter
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.applyFilters();
  }

  setFilterType(type: string) {
    this.filterType = type;
    this.applyFilters();
  }

  setFilterCategory(category: string) {
    this.filterCategory = category;
    this.applyFilters();
  }

  // Report Management
  openReportBuilder() {
    this.reportForm.reset();
    this.reportForm.patchValue({
      isActive: true,
      format: []
    });
    this.showBuilderModal = true;
  }

  openEditReport(report: ReportData) {
    this.selectedReport = report;
    this.reportForm.patchValue({
      name: report.name,
      description: report.description,
      type: report.type,
      category: report.category,
      tags: report.tags,
      format: report.format,
      isActive: report.isActive
    });
    this.showReportModal = true;
  }

  openScheduleModal(report: ReportData) {
    this.selectedReport = report;
    this.scheduleForm.patchValue({
      enabled: report.isScheduled,
      frequency: report.scheduleFrequency || '',
      recipients: report.recipients || [],
      format: report.format[0] || ''
    });
    this.showScheduleModal = true;
  }

  generateReport(report: ReportData) {
    this.selectedReport = report;
    this.isGenerating = true;
    
    // Simulate report generation
    setTimeout(() => {
      this.reportResult = {
        reportId: report.id,
        generatedDate: new Date(),
        generatedBy: 'Current User',
        parameters: {},
        data: [],
        summary: {
          totalRecords: Math.floor(Math.random() * 1000) + 100,
          filters: ['Active Tools', 'All Locations'],
          dateRange: { start: new Date(Date.now() - 7776000000), end: new Date() },
          keyMetrics: [
            { label: 'Total Items', value: 1250, trend: 'up' },
            { label: 'Available', value: 890, trend: 'stable' },
            { label: 'Checked Out', value: 360, trend: 'down' }
          ]
        },
        executionTime: 2.3,
        recordCount: 1250
      };
      this.isGenerating = false;
      this.showPreviewModal = true;
    }, 2000);
  }

  toggleFormat(formatValue: ReportFormat, checked: boolean) {
    const currentFormats = this.reportForm.get('format')?.value || [];
    let updatedFormats: ReportFormat[];

    if (checked) {
      updatedFormats = [...currentFormats, formatValue];
    } else {
      updatedFormats = currentFormats.filter((f: ReportFormat) => f !== formatValue);
    }

    this.reportForm.patchValue({ format: updatedFormats });
  }

  saveReport() {
    if (this.reportForm.valid) {
      this.isLoading = true;
      const formValue = this.reportForm.value;
      
      setTimeout(() => {
        if (this.selectedReport) {
          // Update existing report
          const index = this.dataSource.data.findIndex(r => r.id === this.selectedReport!.id);
          if (index !== -1) {
            this.dataSource.data[index] = { ...this.selectedReport, ...formValue };
            this.dataSource.data = [...this.dataSource.data];
          }
        } else {
          // Create new report
          const newReport: ReportData = {
            id: `RPT${String(this.dataSource.data.length + 1).padStart(3, '0')}`,
            ...formValue,
            createdDate: new Date(),
            isScheduled: false,
            tags: formValue.tags || []
          };
          this.dataSource.data = [...this.dataSource.data, newReport];
        }
        
        this.isLoading = false;
        this.closeModal();
      }, 1000);
    }
  }

  saveSchedule() {
    if (this.scheduleForm.valid && this.selectedReport) {
      this.isLoading = true;
      const formValue = this.scheduleForm.value;
      
      setTimeout(() => {
        const index = this.dataSource.data.findIndex(r => r.id === this.selectedReport!.id);
        if (index !== -1) {
          this.dataSource.data[index] = {
            ...this.dataSource.data[index],
            isScheduled: formValue.enabled,
            scheduleFrequency: formValue.frequency,
            recipients: formValue.recipients
          };
          this.dataSource.data = [...this.dataSource.data];
        }
        
        this.isLoading = false;
        this.closeModal();
      }, 1000);
    }
  }

  confirmDelete(report: ReportData) {
    this.reportToDelete = report;
    this.showDeleteConfirm = true;
  }

  deleteReport() {
    if (this.reportToDelete) {
      this.dataSource.data = this.dataSource.data.filter(r => r.id !== this.reportToDelete!.id);
      this.dashboardMetrics.totalReports--;
      this.closeModal();
    }
  }

  duplicateReport(report: ReportData) {
    const duplicate: ReportData = {
      ...report,
      id: `RPT${String(this.dataSource.data.length + 1).padStart(3, '0')}`,
      name: `${report.name} (Copy)`,
      createdDate: new Date(),
      lastGenerated: undefined,
      isScheduled: false
    };
    this.dataSource.data = [...this.dataSource.data, duplicate];
  }

  exportReport(report: ReportData, format: ReportFormat) {
    this.isLoading = true;
    setTimeout(() => {
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${report.name}.${format}`;
      link.click();
      this.isLoading = false;
    }, 1000);
  }

  // Utility Methods
  getTypeInfo(type: ReportType) {
    return this.reportTypes.find(t => t.value === type) || this.reportTypes[0];
  }

  getFormatInfo(format: ReportFormat) {
    return this.reportFormats.find(f => f.value === format) || this.reportFormats[0];
  }

  getScheduleInfo(frequency?: ScheduleFrequency) {
    if (!frequency) return { label: 'Not Scheduled', icon: 'schedule' };
    return this.scheduleFrequencies.find(f => f.value === frequency) || { label: 'Unknown', icon: 'schedule' };
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      generated: 'play_arrow',
      scheduled: 'schedule',
      shared: 'share',
      created: 'add'
    };
    return icons[type] || 'info';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      generated: '#2ecc71',
      scheduled: '#3498db',
      shared: '#f39c12',
      created: '#9b59b6'
    };
    return colors[type] || '#7f8c8d';
  }

  closeModal() {
    this.showReportModal = false;
    this.showBuilderModal = false;
    this.showScheduleModal = false;
    this.showPreviewModal = false;
    this.showDeleteConfirm = false;
    this.selectedReport = null;
    this.reportToDelete = null;
    this.reportResult = null;
    this.isLoading = false;
    this.isGenerating = false;
  }
}
