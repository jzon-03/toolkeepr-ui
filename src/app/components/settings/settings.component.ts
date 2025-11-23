import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Interfaces
interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reportAlerts: boolean;
  systemUpdates: boolean;
  weeklyDigest: boolean;
  taskReminders: boolean;
  maintenanceAlerts: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAlerts: boolean;
  ipWhitelist: string[];
  allowedDevices: string[];
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  animationsEnabled: boolean;
  highContrast: boolean;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupLocation: 'local' | 'cloud' | 'both';
  retentionPeriod: number;
  encryptBackups: boolean;
}

interface ExportData {
  tools: boolean;
  reports: boolean;
  settings: boolean;
  userProfile: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-in', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('200ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0, transform: 'scale(0.8)' }))
      ])
    ]),
    trigger('expandCollapse', [
      state('collapsed', style({ height: '0', overflow: 'hidden', opacity: 0 })),
      state('expanded', style({ height: '*', overflow: 'visible', opacity: 1 })),
      transition('collapsed <=> expanded', animate('300ms ease-in-out'))
    ])
  ]
})
export class SettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Form groups
  profileForm!: FormGroup;
  notificationForm!: FormGroup;
  securityForm!: FormGroup;
  appearanceForm!: FormGroup;
  backupForm!: FormGroup;

  // UI state
  activeTab = 'profile';
  isLoading = false;
  isSaving = false;
  showAdvanced = false;
  expandedSections: { [key: string]: boolean } = {
    notifications: true,
    security: false,
    appearance: true,
    backup: false,
    advanced: false
  };

  // Data
  userProfile: UserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    timezone: 'UTC-5',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h'
  };

  notificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    reportAlerts: true,
    systemUpdates: false,
    weeklyDigest: true,
    taskReminders: true,
    maintenanceAlerts: false
  };

  securitySettings: SecuritySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAlerts: true,
    ipWhitelist: [],
    allowedDevices: []
  };

  appearanceSettings: AppearanceSettings = {
    theme: 'light',
    primaryColor: '#1976d2',
    accentColor: '#ff4081',
    fontSize: 'medium',
    compactMode: false,
    animationsEnabled: true,
    highContrast: false
  };

  backupSettings: BackupSettings = {
    autoBackup: true,
    backupFrequency: 'weekly',
    backupLocation: 'cloud',
    retentionPeriod: 30,
    encryptBackups: true
  };

  // Options
  timezones = [
    { value: 'UTC-12', label: '(UTC-12:00) International Date Line West' },
    { value: 'UTC-11', label: '(UTC-11:00) Coordinated Universal Time-11' },
    { value: 'UTC-10', label: '(UTC-10:00) Hawaii' },
    { value: 'UTC-9', label: '(UTC-09:00) Alaska' },
    { value: 'UTC-8', label: '(UTC-08:00) Pacific Time (US & Canada)' },
    { value: 'UTC-7', label: '(UTC-07:00) Mountain Time (US & Canada)' },
    { value: 'UTC-6', label: '(UTC-06:00) Central Time (US & Canada)' },
    { value: 'UTC-5', label: '(UTC-05:00) Eastern Time (US & Canada)' },
    { value: 'UTC', label: '(UTC+00:00) Coordinated Universal Time' },
    { value: 'UTC+1', label: '(UTC+01:00) Central European Time' },
    { value: 'UTC+2', label: '(UTC+02:00) Eastern European Time' }
  ];

  languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'zh', label: '中文' },
    { value: 'ja', label: '日本語' }
  ];

  dateFormats = [
    { value: 'MM/dd/yyyy', label: '12/31/2023' },
    { value: 'dd/MM/yyyy', label: '31/12/2023' },
    { value: 'yyyy-MM-dd', label: '2023-12-31' },
    { value: 'dd MMM yyyy', label: '31 Dec 2023' },
    { value: 'MMM dd, yyyy', label: 'Dec 31, 2023' }
  ];

  timeFormats = [
    { value: '12h', label: '12:00 PM' },
    { value: '24h', label: '12:00' }
  ];

  themes = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    { value: 'auto', label: 'Auto', icon: 'brightness_auto' }
  ];

  primaryColors = [
    { value: '#1976d2', label: 'Blue', color: '#1976d2' },
    { value: '#388e3c', label: 'Green', color: '#388e3c' },
    { value: '#f57c00', label: 'Orange', color: '#f57c00' },
    { value: '#7b1fa2', label: 'Purple', color: '#7b1fa2' },
    { value: '#d32f2f', label: 'Red', color: '#d32f2f' },
    { value: '#455a64', label: 'Blue Grey', color: '#455a64' }
  ];

  fontSizes = [
    { value: 'small', label: 'Small', size: '12px' },
    { value: 'medium', label: 'Medium', size: '14px' },
    { value: 'large', label: 'Large', size: '16px' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: [this.userProfile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userProfile.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.userProfile.email, [Validators.required, Validators.email]],
      timezone: [this.userProfile.timezone, Validators.required],
      language: [this.userProfile.language, Validators.required],
      dateFormat: [this.userProfile.dateFormat, Validators.required],
      timeFormat: [this.userProfile.timeFormat, Validators.required]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [this.notificationSettings.emailNotifications],
      pushNotifications: [this.notificationSettings.pushNotifications],
      reportAlerts: [this.notificationSettings.reportAlerts],
      systemUpdates: [this.notificationSettings.systemUpdates],
      weeklyDigest: [this.notificationSettings.weeklyDigest],
      taskReminders: [this.notificationSettings.taskReminders],
      maintenanceAlerts: [this.notificationSettings.maintenanceAlerts]
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [this.securitySettings.twoFactorAuth],
      sessionTimeout: [this.securitySettings.sessionTimeout, [Validators.min(5), Validators.max(480)]],
      passwordExpiry: [this.securitySettings.passwordExpiry, [Validators.min(30), Validators.max(365)]],
      loginAlerts: [this.securitySettings.loginAlerts]
    });

    this.appearanceForm = this.fb.group({
      theme: [this.appearanceSettings.theme],
      primaryColor: [this.appearanceSettings.primaryColor],
      accentColor: [this.appearanceSettings.accentColor],
      fontSize: [this.appearanceSettings.fontSize],
      compactMode: [this.appearanceSettings.compactMode],
      animationsEnabled: [this.appearanceSettings.animationsEnabled],
      highContrast: [this.appearanceSettings.highContrast]
    });

    this.backupForm = this.fb.group({
      autoBackup: [this.backupSettings.autoBackup],
      backupFrequency: [this.backupSettings.backupFrequency],
      backupLocation: [this.backupSettings.backupLocation],
      retentionPeriod: [this.backupSettings.retentionPeriod, [Validators.min(1), Validators.max(365)]],
      encryptBackups: [this.backupSettings.encryptBackups]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  toggleSection(section: string): void {
    this.expandedSections[section] = !this.expandedSections[section];
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isSaving = true;
      const formData = this.profileForm.value;
      
      setTimeout(() => {
        this.userProfile = { ...this.userProfile, ...formData };
        this.isSaving = false;
        this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      }, 1000);
    }
  }

  saveNotifications(): void {
    this.isSaving = true;
    const formData = this.notificationForm.value;
    
    setTimeout(() => {
      this.notificationSettings = { ...this.notificationSettings, ...formData };
      this.isSaving = false;
      this.snackBar.open('Notification settings updated!', 'Close', { duration: 3000 });
    }, 800);
  }

  saveSecurity(): void {
    if (this.securityForm.valid) {
      this.isSaving = true;
      const formData = this.securityForm.value;
      
      setTimeout(() => {
        this.securitySettings = { ...this.securitySettings, ...formData };
        this.isSaving = false;
        this.snackBar.open('Security settings updated!', 'Close', { duration: 3000 });
      }, 1000);
    }
  }

  saveAppearance(): void {
    this.isSaving = true;
    const formData = this.appearanceForm.value;
    
    setTimeout(() => {
      this.appearanceSettings = { ...this.appearanceSettings, ...formData };
      this.applyTheme();
      this.isSaving = false;
      this.snackBar.open('Appearance settings updated!', 'Close', { duration: 3000 });
    }, 500);
  }

  saveBackup(): void {
    if (this.backupForm.valid) {
      this.isSaving = true;
      const formData = this.backupForm.value;
      
      setTimeout(() => {
        this.backupSettings = { ...this.backupSettings, ...formData };
        this.isSaving = false;
        this.snackBar.open('Backup settings updated!', 'Close', { duration: 3000 });
      }, 800);
    }
  }

  saveAllSettings(): void {
    if (this.profileForm.valid && this.securityForm.valid && this.backupForm.valid) {
      this.isSaving = true;
      
      setTimeout(() => {
        this.saveProfile();
        this.saveNotifications();
        this.saveSecurity();
        this.saveAppearance();
        this.saveBackup();
        this.snackBar.open('All settings saved successfully!', 'Close', { duration: 3000 });
      }, 1500);
    }
  }

  resetSettings(): void {
    // Simple confirmation
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      this.resetToDefaults();
    }
  }

  resetToDefaults(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      // Reset to default values
      this.userProfile.timezone = 'UTC';
      this.userProfile.language = 'en';
      this.userProfile.dateFormat = 'MM/dd/yyyy';
      this.userProfile.timeFormat = '12h';
      
      this.appearanceSettings = {
        theme: 'light',
        primaryColor: '#1976d2',
        accentColor: '#ff4081',
        fontSize: 'medium',
        compactMode: false,
        animationsEnabled: true,
        highContrast: false
      };
      
      this.initializeForms();
      this.isLoading = false;
      this.snackBar.open('Settings reset to defaults!', 'Close', { duration: 3000 });
    }, 1000);
  }

  applyTheme(): void {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    
    if (this.appearanceSettings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      body.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      body.classList.add(`${this.appearanceSettings.theme}-theme`);
    }

    // Apply custom colors
    document.documentElement.style.setProperty('--primary-color', this.appearanceSettings.primaryColor);
    document.documentElement.style.setProperty('--accent-color', this.appearanceSettings.accentColor);
  }

  uploadAvatar(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userProfile.avatar = e.target?.result as string;
        this.snackBar.open('Avatar uploaded successfully!', 'Close', { duration: 3000 });
      };
      reader.readAsDataURL(file);
    }
  }

  changePassword(): void {
    // Simple alert for now
    alert('Password change dialog would open here in a real application.');
  }

  enable2FA(): void {
    // Simple alert for now  
    alert('2FA setup dialog would open here in a real application.');
  }

  exportData(): void {
    // Simple alert for now
    alert('Export data dialog would open here in a real application.');
    // For demo, just create a backup
    this.createBackup();
  }

  performDataExport(exportOptions: ExportData): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const data = {
        timestamp: new Date().toISOString(),
        ...(exportOptions.tools && { tools: [] }),
        ...(exportOptions.reports && { reports: [] }),
        ...(exportOptions.settings && { settings: this.getAllSettings() }),
        ...(exportOptions.userProfile && { userProfile: this.userProfile })
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolkeepr-export-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.isLoading = false;
      this.snackBar.open('Data exported successfully!', 'Close', { duration: 3000 });
    }, 2000);
  }

  importData(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          this.processImportedData(data);
        } catch (error) {
          this.snackBar.open('Invalid file format!', 'Close', { duration: 3000 });
        }
      };
      reader.readAsText(file);
    }
  }

  processImportedData(data: any): void {
    this.isLoading = true;
    
    setTimeout(() => {
      if (data.userProfile) {
        this.userProfile = { ...this.userProfile, ...data.userProfile };
      }
      if (data.settings) {
        this.notificationSettings = { ...this.notificationSettings, ...data.settings.notifications };
        this.securitySettings = { ...this.securitySettings, ...data.settings.security };
        this.appearanceSettings = { ...this.appearanceSettings, ...data.settings.appearance };
        this.backupSettings = { ...this.backupSettings, ...data.settings.backup };
      }
      
      this.initializeForms();
      this.applyTheme();
      this.isLoading = false;
      this.snackBar.open('Settings imported successfully!', 'Close', { duration: 3000 });
    }, 1500);
  }

  createBackup(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const backupData = {
        timestamp: new Date().toISOString(),
        userProfile: this.userProfile,
        settings: this.getAllSettings()
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolkeepr-backup-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.isLoading = false;
      this.snackBar.open('Backup created successfully!', 'Close', { duration: 3000 });
    }, 1000);
  }

  getAllSettings() {
    return {
      notifications: this.notificationSettings,
      security: this.securitySettings,
      appearance: this.appearanceSettings,
      backup: this.backupSettings
    };
  }

  testNotification(): void {
    this.snackBar.open('This is a test notification!', 'Close', { duration: 5000 });
  }

  clearCache(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      // Clear browser cache, localStorage, etc.
      localStorage.clear();
      sessionStorage.clear();
      
      this.isLoading = false;
      this.snackBar.open('Cache cleared successfully!', 'Close', { duration: 3000 });
    }, 1500);
  }

  downloadLogs(): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const logs = [
        `${new Date().toISOString()} - Application started`,
        `${new Date().toISOString()} - User logged in`,
        `${new Date().toISOString()} - Settings accessed`
      ];
      
      const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolkeepr-logs-${Date.now()}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      this.isLoading = false;
      this.snackBar.open('Logs downloaded successfully!', 'Close', { duration: 3000 });
    }, 1000);
  }
}