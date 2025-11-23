import { Component, OnInit } from '@angular/core';

export interface DashboardStats {
  totalTools: number;
  standardTools: number;
  availableTools: number;
  inUseTools: number;
  maintenanceTools: number;
}

export interface ToolTypeCount {
  type: string;
  count: number;
  available: number;
  inUse: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  tool: string;
  user: string;
  timestamp: Date;
  type: 'checkin' | 'checkout' | 'maintenance' | 'update';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalTools: 0,
    standardTools: 0,
    availableTools: 0,
    inUseTools: 0,
    maintenanceTools: 0
  };

  toolTypeCounts: ToolTypeCount[] = [];
  recentActivities: RecentActivity[] = [];
  displayedColumns: string[] = ['action', 'tool', 'user', 'timestamp'];

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Calculate statistics from sample data
    this.stats = {
      totalTools: 16,
      standardTools: 8,
      availableTools: 11,
      inUseTools: 4,
      maintenanceTools: 1
    };

    // Tool type breakdown
    this.toolTypeCounts = [
      { type: 'Drill', count: 4, available: 2, inUse: 2 },
      { type: 'Endmill', count: 4, available: 3, inUse: 1 },
      { type: 'Tap', count: 4, available: 2, inUse: 1 },
      { type: 'Spot Drill', count: 4, available: 3, inUse: 1 }
    ];

    // Recent activity (mock data)
    this.recentActivities = [
      {
        id: 1,
        action: 'Checked Out',
        tool: 'D002 - 3/8" Carbide Drill',
        user: 'John Smith',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        type: 'checkout'
      },
      {
        id: 2,
        action: 'Checked In',
        tool: 'EM001 - 1/4" 4-Flute Endmill',
        user: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 2 * 3600000), // 2 hours ago
        type: 'checkin'
      },
      {
        id: 3,
        action: 'Maintenance',
        tool: 'T004 - 1/2-13 UNC Tap',
        user: 'Mike Wilson',
        timestamp: new Date(Date.now() - 4 * 3600000), // 4 hours ago
        type: 'maintenance'
      },
      {
        id: 4,
        action: 'Updated',
        tool: 'SD001 - 90° Spot Drill 1/4"',
        user: 'Admin',
        timestamp: new Date(Date.now() - 6 * 3600000), // 6 hours ago
        type: 'update'
      },
      {
        id: 5,
        action: 'Checked Out',
        tool: 'T002 - 3/8-16 UNC Tap',
        user: 'David Brown',
        timestamp: new Date(Date.now() - 8 * 3600000), // 8 hours ago
        type: 'checkout'
      }
    ];
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'checkin': return 'input';
      case 'checkout': return 'output';
      case 'maintenance': return 'build';
      case 'update': return 'edit';
      default: return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'checkin': return 'primary';
      case 'checkout': return 'accent';
      case 'maintenance': return 'warn';
      case 'update': return 'primary';
      default: return 'primary';
    }
  }

  formatTimestamp(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }
}
