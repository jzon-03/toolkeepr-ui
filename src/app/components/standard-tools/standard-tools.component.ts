import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

export interface Tool {
  id: number;
  toolNumber: string;
  description: string;
  type: string;
  diameter: string;
  length: string;
  status: string;
  location: string;
  isStandard: boolean;
}

@Component({
  selector: 'app-standard-tools',
  templateUrl: './standard-tools.component.html',
  styleUrl: './standard-tools.component.css'
})
export class StandardToolsComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  
  selectedToolType: string = 'all';
  allTools: Tool[] = [];
  dataSource = new MatTableDataSource<Tool>();
  displayedColumns: string[] = ['toolNumber', 'description', 'type', 'diameter', 'length', 'status', 'location', 'actions'];

  ngOnInit(): void {
    this.loadSampleTools();
    this.filterStandardTools();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadSampleTools(): void {
    // Same tools data as in ToolsComponent
    this.allTools = [
      // Drills
      { id: 1, toolNumber: 'D001', description: '1/4" HSS Drill Bit', type: 'Drill', diameter: '0.250"', length: '4.00"', status: 'Available', location: 'A1-01', isStandard: true },
      { id: 2, toolNumber: 'D002', description: '3/8" Carbide Drill', type: 'Drill', diameter: '0.375"', length: '5.00"', status: 'In Use', location: 'A1-02', isStandard: true },
      { id: 3, toolNumber: 'D003', description: '1/2" Twist Drill', type: 'Drill', diameter: '0.500"', length: '6.00"', status: 'Available', location: 'A1-03', isStandard: false },
      { id: 4, toolNumber: 'D004', description: '#7 HSS Drill Bit', type: 'Drill', diameter: '0.201"', length: '3.50"', status: 'Maintenance', location: 'A1-04', isStandard: false },
      
      // Endmills
      { id: 5, toolNumber: 'EM001', description: '1/4" 4-Flute Endmill', type: 'Endmill', diameter: '0.250"', length: '3.00"', status: 'Available', location: 'B2-01', isStandard: true },
      { id: 6, toolNumber: 'EM002', description: '3/8" Ball End Mill', type: 'Endmill', diameter: '0.375"', length: '4.00"', status: 'In Use', location: 'B2-02', isStandard: false },
      { id: 7, toolNumber: 'EM003', description: '1/2" Roughing Endmill', type: 'Endmill', diameter: '0.500"', length: '5.00"', status: 'Available', location: 'B2-03', isStandard: true },
      { id: 8, toolNumber: 'EM004', description: '3/4" Square Endmill', type: 'Endmill', diameter: '0.750"', length: '6.00"', status: 'Available', location: 'B2-04', isStandard: false },
      
      // Taps
      { id: 9, toolNumber: 'T001', description: '1/4-20 UNC Tap', type: 'Tap', diameter: '1/4-20', length: '3.50"', status: 'Available', location: 'C3-01', isStandard: true },
      { id: 10, toolNumber: 'T002', description: '3/8-16 UNC Tap', type: 'Tap', diameter: '3/8-16', length: '4.00"', status: 'In Use', location: 'C3-02', isStandard: true },
      { id: 11, toolNumber: 'T003', description: 'M6x1.0 Metric Tap', type: 'Tap', diameter: 'M6x1.0', length: '3.00"', status: 'Available', location: 'C3-03', isStandard: false },
      { id: 12, toolNumber: 'T004', description: '1/2-13 UNC Tap', type: 'Tap', diameter: '1/2-13', length: '4.50"', status: 'Maintenance', location: 'C3-04', isStandard: false },
      
      // Spot Drills
      { id: 13, toolNumber: 'SD001', description: '90° Spot Drill 1/4"', type: 'Spot Drill', diameter: '0.250"', length: '2.50"', status: 'Available', location: 'D4-01', isStandard: true },
      { id: 14, toolNumber: 'SD002', description: '82° Spot Drill 3/8"', type: 'Spot Drill', diameter: '0.375"', length: '3.00"', status: 'Available', location: 'D4-02', isStandard: false },
      { id: 15, toolNumber: 'SD003', description: '90° Spot Drill 1/2"', type: 'Spot Drill', diameter: '0.500"', length: '3.50"', status: 'In Use', location: 'D4-03', isStandard: true },
      { id: 16, toolNumber: 'SD004', description: '120° Spot Drill 5/8"', type: 'Spot Drill', diameter: '0.625"', length: '4.00"', status: 'Available', location: 'D4-04', isStandard: false }
    ];
  }

  onToolTypeChange(): void {
    this.filterStandardTools();
  }

  filterStandardTools(): void {
    // First filter for standard tools only
    let standardTools = this.allTools.filter(tool => tool.isStandard);
    
    // Then filter by type if selected
    let filteredData: Tool[];
    if (this.selectedToolType === 'all') {
      filteredData = standardTools;
    } else {
      filteredData = standardTools.filter(tool => 
        tool.type.toLowerCase().replace(' ', '') === this.selectedToolType
      );
    }
    this.dataSource.data = filteredData;
  }

  getChipColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'drill': return 'primary';
      case 'endmill': return 'accent';
      case 'tap': return 'warn';
      case 'spot drill': return 'primary';
      default: return 'primary';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'available': return 'primary';
      case 'in use': return 'accent';
      case 'maintenance': return 'warn';
      default: return 'primary';
    }
  }
}
