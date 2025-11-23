import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrl: './root.component.css'
})
export class RootComponent implements OnInit, OnDestroy {
  @ViewChild('drawer', { static: true }) drawer!: MatDrawer;
  
  private destroy$ = new Subject<void>();
  
  // Mobile detection
  isMobile = false;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    // Listen for mobile breakpoint changes
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        
        if (this.isMobile) {
          // Mobile: use over mode and close drawer
          this.drawerMode = 'over';
          this.drawerOpened = false;
        } else {
          // Desktop: use side mode and open drawer
          this.drawerMode = 'side';
          this.drawerOpened = true;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }
}
