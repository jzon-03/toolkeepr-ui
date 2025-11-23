import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Tool {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  isStandard: boolean;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  lastMaintenance?: Date;
  notes?: string;
  properties?: { [key: string]: any }; // Dynamic properties based on tool type
}

export interface ToolTypeProperty {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  options?: string[]; // For select type
  unit?: string; // For number type (e.g., 'mm', 'inches')
  defaultValue?: any;
}

export interface ToolType {
  id: string;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  properties: ToolTypeProperty[]; // Dynamic properties for this tool type
}

@Component({
  selector: 'app-managed-tools',
  templateUrl: './managed-tools.component.html',
  styleUrl: './managed-tools.component.css'
})
export class ManagedToolsComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Tool management
  tools: Tool[] = [];
  toolsDataSource = new MatTableDataSource<Tool>();
  toolDisplayedColumns: string[] = ['id', 'name', 'type', 'location', 'status', 'isStandard', 'actions'];
  
  // Tool types management
  toolTypes: ToolType[] = [];
  toolTypesDataSource = new MatTableDataSource<ToolType>();
  toolTypeDisplayedColumns: string[] = ['name', 'category', 'description', 'isActive', 'actions'];
  
  // UI state
  selectedTab = 0;
  statusFilter = '';
  typeFilter = '';
  standardFilter = '';
  searchTerm = '';
  
  // Form states
  isAddingTool = false;
  isEditingTool = false;
  isAddingToolType = false;
  isEditingToolType = false;
  isManagingProperties = false;
  currentTool: Partial<Tool> = {};
  currentToolType: Partial<ToolType> = {};
  currentToolTypeForProperties?: ToolType;
  newProperty: Partial<ToolTypeProperty> = {};
  optionsString = '';

  statuses = [
    { value: 'available', label: 'Available' },
    { value: 'in-use', label: 'In Use' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' }
  ];

  categories = [
    'Cutting Tools',
    'Measuring Tools',
    'Hand Tools',
    'Power Tools',
    'Assembly Tools',
    'Safety Equipment'
  ];

  propertyTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'select', label: 'Dropdown' }
  ];

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSampleData();
    this.setupDataSources();
  }

  setupDataSources(): void {
    this.toolsDataSource.data = this.tools;
    this.toolTypesDataSource.data = this.toolTypes;
    
    // Setup filtering
    this.toolsDataSource.filterPredicate = (tool: Tool, filter: string) => {
      const filters = JSON.parse(filter);
      
      const matchesSearch = !filters.search || 
        tool.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tool.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        tool.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || tool.status === filters.status;
      const matchesType = !filters.type || tool.type === filters.type;
      const matchesStandard = !filters.standard || 
        (filters.standard === 'standard' && tool.isStandard) ||
        (filters.standard === 'non-standard' && !tool.isStandard);
      
      return matchesSearch && matchesStatus && matchesType && matchesStandard;
    };
    
    setTimeout(() => {
      this.toolsDataSource.sort = this.sort;
      this.toolsDataSource.paginator = this.paginator;
    });
  }

  loadSampleData(): void {
    this.toolTypes = [
      { 
        id: 'TT001', 
        name: 'Drill', 
        category: 'Cutting Tools', 
        description: 'Standard drilling tools', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'diameter', label: 'Diameter', type: 'number', required: true, unit: 'mm' },
          { id: 'p2', name: 'coating', label: 'Coating', type: 'select', required: false, options: ['Uncoated', 'TiN', 'TiAlN', 'DLC'] },
          { id: 'p3', name: 'flutes', label: 'Number of Flutes', type: 'number', required: true },
          { id: 'p4', name: 'coolant', label: 'Coolant Compatible', type: 'boolean', required: false, defaultValue: true }
        ]
      },
      { 
        id: 'TT002', 
        name: 'Endmill', 
        category: 'Cutting Tools', 
        description: 'Milling cutters', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'diameter', label: 'Diameter', type: 'number', required: true, unit: 'mm' },
          { id: 'p2', name: 'length', label: 'Cutting Length', type: 'number', required: true, unit: 'mm' },
          { id: 'p3', name: 'flutes', label: 'Number of Flutes', type: 'select', required: true, options: ['2', '3', '4', '6', '8'] },
          { id: 'p4', name: 'material', label: 'Material', type: 'select', required: true, options: ['HSS', 'Carbide', 'Ceramic'] },
          { id: 'p5', name: 'corner_radius', label: 'Corner Radius', type: 'number', required: false, unit: 'mm' }
        ]
      },
      { 
        id: 'TT003', 
        name: 'Tap', 
        category: 'Cutting Tools', 
        description: 'Threading tools', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'thread_size', label: 'Thread Size', type: 'text', required: true },
          { id: 'p2', name: 'pitch', label: 'Pitch', type: 'number', required: true, unit: 'mm' },
          { id: 'p3', name: 'thread_type', label: 'Thread Type', type: 'select', required: true, options: ['Metric', 'UNC', 'UNF', 'NPT'] },
          { id: 'p4', name: 'hand', label: 'Hand', type: 'select', required: true, options: ['Right', 'Left'] }
        ]
      },
      { 
        id: 'TT004', 
        name: 'Spot Drill', 
        category: 'Cutting Tools', 
        description: 'Center drilling tools', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'angle', label: 'Point Angle', type: 'select', required: true, options: ['60°', '90°', '120°', '135°'] },
          { id: 'p2', name: 'diameter', label: 'Diameter', type: 'number', required: true, unit: 'mm' }
        ]
      },
      { 
        id: 'TT005', 
        name: 'Caliper', 
        category: 'Measuring Tools', 
        description: 'Precision measurement', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'range', label: 'Measuring Range', type: 'text', required: true },
          { id: 'p2', name: 'resolution', label: 'Resolution', type: 'number', required: true, unit: 'mm' },
          { id: 'p3', name: 'digital', label: 'Digital Display', type: 'boolean', required: false, defaultValue: false }
        ]
      },
      { 
        id: 'TT006', 
        name: 'Wrench', 
        category: 'Hand Tools', 
        description: 'Fastening tools', 
        isActive: true,
        properties: [
          { id: 'p1', name: 'size', label: 'Size', type: 'text', required: true },
          { id: 'p2', name: 'type', label: 'Type', type: 'select', required: true, options: ['Open End', 'Box End', 'Combination', 'Adjustable'] },
          { id: 'p3', name: 'metric', label: 'Metric', type: 'boolean', required: false, defaultValue: true }
        ]
      }
    ];

    this.tools = [
      {
        id: 'D001',
        name: '1/4" Carbide Drill',
        type: 'Drill',
        description: 'High-speed carbide drill bit',
        location: 'Tool Crib A-1',
        status: 'available',
        isStandard: true,
        serialNumber: 'CD001234',
        manufacturer: 'Kennametal',
        model: 'KC7315',
        purchaseDate: new Date('2024-01-15'),
        lastMaintenance: new Date('2024-10-01'),
        properties: {
          diameter: 6.35,
          coating: 'TiAlN',
          flutes: 2,
          coolant: true
        }
      },
      {
        id: 'D002',
        name: '3/8" Carbide Drill',
        type: 'Drill',
        description: 'Heavy duty carbide drill',
        location: 'Tool Crib A-1',
        status: 'in-use',
        isStandard: true,
        serialNumber: 'CD002345',
        manufacturer: 'Kennametal',
        model: 'KC7316',
        properties: {
          diameter: 9.525,
          coating: 'TiN',
          flutes: 2,
          coolant: true
        }
      },
      {
        id: 'EM001',
        name: '1/4" 4-Flute Endmill',
        type: 'Endmill',
        description: 'Carbide end mill for aluminum',
        location: 'Tool Crib B-2',
        status: 'available',
        isStandard: true,
        manufacturer: 'Harvey Tool',
        model: 'HT-4FL',
        properties: {
          diameter: 6.35,
          length: 19,
          flutes: '4',
          material: 'Carbide',
          corner_radius: 0.1
        }
      },
      {
        id: 'T001',
        name: '1/4-20 UNC Tap',
        type: 'Tap',
        description: 'Standard threading tap',
        location: 'Tool Crib C-3',
        status: 'available',
        isStandard: true,
        properties: {
          thread_size: '1/4-20',
          pitch: 1.27,
          thread_type: 'UNC',
          hand: 'Right'
        }
      },
      {
        id: 'SD001',
        name: '90° Spot Drill 1/4"',
        type: 'Spot Drill',
        description: 'Center drilling tool',
        location: 'Tool Crib A-1',
        status: 'maintenance',
        isStandard: false,
        properties: {
          angle: '90°',
          diameter: 6.35
        }
      }
    ];
  }

  // Tool management methods
  addTool(): void {
    this.currentTool = {
      status: 'available',
      isStandard: false,
      properties: {}
    };
    this.isAddingTool = true;
  }

  editTool(tool: Tool): void {
    this.currentTool = { ...tool };
    this.isEditingTool = true;
  }

  saveTool(): void {
    if (this.isAddingTool) {
      const newId = this.generateToolId();
      const newTool: Tool = {
        ...this.currentTool as Tool,
        id: newId
      };
      this.tools.push(newTool);
      this.snackBar.open('Tool added successfully', 'Close', { duration: 3000 });
    } else if (this.isEditingTool) {
      const index = this.tools.findIndex(t => t.id === this.currentTool.id);
      if (index !== -1) {
        this.tools[index] = this.currentTool as Tool;
        this.snackBar.open('Tool updated successfully', 'Close', { duration: 3000 });
      }
    }
    
    this.toolsDataSource.data = [...this.tools];
    this.cancelToolForm();
  }

  deleteTool(tool: Tool): void {
    const index = this.tools.findIndex(t => t.id === tool.id);
    if (index !== -1) {
      this.tools.splice(index, 1);
      this.toolsDataSource.data = [...this.tools];
      this.snackBar.open('Tool deleted successfully', 'Close', { duration: 3000 });
    }
  }

  toggleStandardTool(tool: Tool): void {
    tool.isStandard = !tool.isStandard;
    this.toolsDataSource.data = [...this.tools];
    this.snackBar.open(
      `Tool ${tool.isStandard ? 'marked as' : 'removed from'} standard`, 
      'Close', 
      { duration: 3000 }
    );
  }

  cancelToolForm(): void {
    this.isAddingTool = false;
    this.isEditingTool = false;
    this.currentTool = {};
  }

  // Tool type management methods
  addToolType(): void {
    this.currentToolType = {
      isActive: true
    };
    this.isAddingToolType = true;
  }

  editToolType(toolType: ToolType): void {
    this.currentToolType = { ...toolType };
    this.isEditingToolType = true;
  }

  saveToolType(): void {
    if (this.isAddingToolType) {
      const newId = this.generateToolTypeId();
      const newToolType: ToolType = {
        ...this.currentToolType as ToolType,
        id: newId,
        properties: [] // Start with no properties
      };
      this.toolTypes.push(newToolType);
      this.snackBar.open('Tool type added successfully', 'Close', { duration: 3000 });
    } else if (this.isEditingToolType) {
      const index = this.toolTypes.findIndex(tt => tt.id === this.currentToolType.id);
      if (index !== -1) {
        this.toolTypes[index] = {
          ...this.toolTypes[index],
          ...this.currentToolType as ToolType
        };
        this.snackBar.open('Tool type updated successfully', 'Close', { duration: 3000 });
      }
    }
    
    this.toolTypesDataSource.data = [...this.toolTypes];
    this.cancelToolTypeForm();
  }

  deleteToolType(toolType: ToolType): void {
    const hasTools = this.tools.some(tool => tool.type === toolType.name);
    if (hasTools) {
      this.snackBar.open('Cannot delete tool type with existing tools', 'Close', { duration: 3000 });
      return;
    }

    const index = this.toolTypes.findIndex(tt => tt.id === toolType.id);
    if (index !== -1) {
      this.toolTypes.splice(index, 1);
      this.toolTypesDataSource.data = [...this.toolTypes];
      this.snackBar.open('Tool type deleted successfully', 'Close', { duration: 3000 });
    }
  }

  toggleToolTypeStatus(toolType: ToolType): void {
    toolType.isActive = !toolType.isActive;
    this.toolTypesDataSource.data = [...this.toolTypes];
    this.snackBar.open(
      `Tool type ${toolType.isActive ? 'activated' : 'deactivated'}`, 
      'Close', 
      { duration: 3000 }
    );
  }

  cancelToolTypeForm(): void {
    this.isAddingToolType = false;
    this.isEditingToolType = false;
    this.currentToolType = {};
  }

  // Tool type property management methods
  manageProperties(toolType: ToolType): void {
    this.currentToolTypeForProperties = toolType;
    this.isManagingProperties = true;
    this.newProperty = { type: 'text', required: false };
  }

  addProperty(): void {
    if (!this.currentToolTypeForProperties || !this.newProperty.name || !this.newProperty.label) {
      return;
    }

    const property: ToolTypeProperty = {
      id: this.generatePropertyId(),
      name: this.newProperty.name,
      label: this.newProperty.label,
      type: this.newProperty.type || 'text',
      required: this.newProperty.required || false,
      options: this.newProperty.options ? [...this.newProperty.options] : undefined,
      unit: this.newProperty.unit,
      defaultValue: this.newProperty.defaultValue
    };

    this.currentToolTypeForProperties.properties.push(property);
    this.toolTypesDataSource.data = [...this.toolTypes];
    
    // Reset form
    this.newProperty = { type: 'text', required: false };
    this.snackBar.open('Property added successfully', 'Close', { duration: 3000 });
  }

  removeProperty(property: ToolTypeProperty): void {
    if (!this.currentToolTypeForProperties) return;
    
    const index = this.currentToolTypeForProperties.properties.findIndex(p => p.id === property.id);
    if (index !== -1) {
      this.currentToolTypeForProperties.properties.splice(index, 1);
      this.toolTypesDataSource.data = [...this.toolTypes];
      this.snackBar.open('Property removed successfully', 'Close', { duration: 3000 });
    }
  }

  closePropertiesManagement(): void {
    this.isManagingProperties = false;
    this.currentToolTypeForProperties = undefined;
    this.newProperty = {};
    this.optionsString = '';
  }

  updatePropertyOptions(value: string): void {
    this.optionsString = value;
    this.newProperty.options = value.split(',').map(o => o.trim()).filter(o => o.length > 0);
  }

  // Filtering methods
  applyFilters(): void {
    const filters = {
      search: this.searchTerm,
      status: this.statusFilter,
      type: this.typeFilter,
      standard: this.standardFilter
    };
    this.toolsDataSource.filter = JSON.stringify(filters);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.standardFilter = '';
    this.toolsDataSource.filter = '';
  }

  // Utility methods
  generateToolId(): string {
    const prefix = this.currentTool.type?.charAt(0).toUpperCase() || 'T';
    const numbers = this.tools
      .filter(t => t.id.startsWith(prefix))
      .map(t => parseInt(t.id.substring(1)))
      .filter(n => !isNaN(n));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return prefix + nextNumber.toString().padStart(3, '0');
  }

  generatePropertyId(): string {
    const timestamp = Date.now().toString().slice(-6);
    return 'p' + timestamp;
  }

  generateToolTypeId(): string {
    const numbers = this.toolTypes
      .map(tt => parseInt(tt.id.substring(2)))
      .filter(n => !isNaN(n));
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return 'TT' + nextNumber.toString().padStart(3, '0');
  }

  getAvailableToolTypes(): ToolType[] {
    return this.toolTypes.filter(tt => tt.isActive);
  }

  getSelectedToolType(): ToolType | undefined {
    return this.toolTypes.find(tt => tt.name === this.currentTool.type);
  }

  onToolTypeChange(): void {
    const selectedType = this.getSelectedToolType();
    if (selectedType && this.currentTool.properties) {
      // Initialize properties with default values
      const newProperties: { [key: string]: any } = {};
      selectedType.properties.forEach(prop => {
        if (prop.defaultValue !== undefined) {
          newProperties[prop.name] = prop.defaultValue;
        }
      });
      this.currentTool.properties = newProperties;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'primary';
      case 'in-use': return 'accent';
      case 'maintenance': return 'warn';
      case 'retired': return '';
      default: return '';
    }
  }
}
