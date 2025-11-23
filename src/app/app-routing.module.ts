import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './components/root/root.component';
import { ToolsComponent } from './components/tools/tools.component';
import { StandardToolsComponent } from './components/standard-tools/standard-tools.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ManagedToolsComponent } from './components/managed-tools/managed-tools.component';
import { CheckOutComponent } from './components/check-out/check-out.component';
import { CheckInComponent } from './components/check-in/check-in.component';
import { CategoriesComponent } from './components/categories/categories.component';

const routes: Routes = [
  {
    path: '',
    component: RootComponent,
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'tools',
        component: ToolsComponent
      },
      {
        path: 'standard-tools',
        component: StandardToolsComponent
      },
      {
        path: 'manage-tools',
        component: ManagedToolsComponent
      },
      {
        path: 'check-out',
        component: CheckOutComponent
      },
      {
        path: 'check-in',
        component: CheckInComponent
      },
      {
        path: 'categories',
        component: CategoriesComponent
      }
      // Other routes commented out until components are created
      // {
      //   path: 'standard-tools',
      //   component: StandardToolsComponent
      // },
      // {
      //   path: 'manage-tools',
      //   component: ManageToolsComponent
      // },
      // {
      //   path: 'check-in',
      //   component: CheckInComponent
      // },
      // {
      //   path: 'check-out',
      //   component: CheckOutComponent
      // },
      // {
      //   path: 'categories',
      //   component: CategoriesComponent
      // },
      // {
      //   path: 'locations',
      //   component: LocationsComponent
      // },
      // {
      //   path: 'reports',
      //   component: ReportsComponent
      // },
      // {
      //   path: 'settings',
      //   component: SettingsComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
