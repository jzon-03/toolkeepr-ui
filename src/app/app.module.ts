import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MaterialModule } from './shared/material.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RootComponent } from './components/root/root.component';
import { ToolsComponent } from './components/tools/tools.component';
import { StandardToolsComponent } from './components/standard-tools/standard-tools.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagedToolsComponent } from './components/managed-tools/managed-tools.component';
import { CheckOutComponent } from './components/check-out/check-out.component';
import { CheckInComponent } from './components/check-in/check-in.component';
import { CategoriesComponent } from './components/categories/categories.component';

@NgModule({
  declarations: [
    AppComponent,
    RootComponent,
    ToolsComponent,
    StandardToolsComponent,
    DashboardComponent,
    ManagedToolsComponent,
    CheckOutComponent,
    CheckInComponent,
    CategoriesComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MaterialModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
