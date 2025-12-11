import { Routes } from '@angular/router';
import { AdminDashbaordComponent } from './admin-dashbaord/admin-dashbaord.component';
import { SubscriptionComponent } from '../roles/owner/subscription/subscription.component';
import { SettingsComponent } from '../roles/owner/settings/settings.component';

export const admin_routes: Routes = [
  // owner
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: AdminDashbaordComponent,
        data: { title: 'Dashboard' },
      },
      {
        path: 'subscription',
        component: SubscriptionComponent,
        data: { title: 'subscription' },
      },
      {
        path: 'setting',
        component: SettingsComponent,
        data: { title: 'settings' },
      },
    ],
  },
];
