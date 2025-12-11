import { Routes } from '@angular/router';
import { AppLayoutComponent } from '../../layouts/app-layout/app-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CardsComponent } from './cards/cards.component';
import { CustomerComponent } from './customer/customer.component';
import { MerchantSettingsComponent } from './merchant-settings/merchant-settings.component';
import { BusinessPagesComponent } from './business-pages/business-pages.component';
import { FinalTouchesComponent } from './final-touches/final-touches.component';
import { SubscriptionComponent } from '../owner/subscription/subscription.component';
import { SubscriptionMerchantComponent } from './subscription-merchant/subscription-merchant.component';

export const merchant_routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
        data: { title: 'dashbaord' },
      },
      {
        path: 'cards',
        component: CardsComponent,
        data: { title: 'cards' },
      },
      {
        path: 'customer',
        component: CustomerComponent,
        data: { title: 'customer' },
      },
      {
        path: 'settings',
        component: MerchantSettingsComponent,
        data: { title: 'settings' },
      },
      {
        path: 'subscription-merchant',
        component: SubscriptionMerchantComponent,
        data: { title: 'subscription' },
      },
      {
        path: 'business',
        component: BusinessPagesComponent,
        data: { title: 'BusinessPages' },
      },
      {
        path: 'final',
        component: FinalTouchesComponent,
        data: { title: 'final-touches' },
      },
    ],
  },
];
