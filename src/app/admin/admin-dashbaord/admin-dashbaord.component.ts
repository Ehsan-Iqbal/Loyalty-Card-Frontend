import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

type SubscriptionTier = 'Pro' | 'Starter' | 'Enterprise' | 'Free';
type Status = 'Active' | 'Trial' | 'Suspended';

interface Business {
  name: string;
  email: string;
  subscription: SubscriptionTier;
  status: Status;
}

@Component({
  selector: 'app-admin-dashbaord',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashbaord.component.html',
  styleUrls: ['./admin-dashbaord.component.scss'],
})
export class AdminDashbaordComponent implements OnInit {
  constructor(private authService: AuthService) {}

  totalSales: number = 0;
  totalSalesChange: number = 0;

  activeSubscriptions: number = 0;
  activeSubscriptionsChange: number = 0;

  monthlyRevenue: number = 0;
  monthlyRevenueChange: number = 0;

  items: Business[] = [];

  page = 1;
  pageSize = 5;

  ngOnInit(): void {
    this.loadDashboardOverview();
  }

  // loadDashboardOverview() {
  //   this.authService.get('owner-management/dashboard/overview').subscribe({
  //     next: (res: any) => {
  //       const data = res?.data;

  //       this.totalSales = data?.totalSales?.amount || 0;
  //       this.totalSalesChange = data?.totalSales?.change || 0;

  //       this.activeSubscriptions = data?.activeSubscriptions?.count || 0;
  //       this.activeSubscriptionsChange = data?.activeSubscriptions?.change || 0;

  //       this.monthlyRevenue = data?.monthlyRevenue?.amount || 0;
  //       this.monthlyRevenueChange = data?.monthlyRevenue?.change || 0;

  //       this.items = (data?.merchants || []).map((m: any) => ({
  //         name: m.ownerName,
  //         email: m.ownerEmail,
  //         subscription: m.subscription,
  //         status: m.status,
  //       }));
  //     },
  //     error: (err) => {},
  //   });
  // }

  loadDashboardOverview() {
  this.authService.get('owner-management/dashboard/overview').subscribe({
    next: (res: any) => {
      const data = res?.data;

      this.totalSales = data?.totalSales?.amount || 0;
      this.totalSalesChange = data?.totalSales?.change || 0;

      this.activeSubscriptions = data?.activeSubscriptions?.count || 0;
      this.activeSubscriptionsChange = data?.activeSubscriptions?.change || 0;

      this.monthlyRevenue = data?.monthlyRevenue?.amount || 0;
      this.monthlyRevenueChange = data?.monthlyRevenue?.change || 0;

      this.items = (data?.merchants || []).map((m: any) => ({
        name: m.full_name || `${m.first_name} ${m.last_name}`,
        email: m.email,
        subscription: m.plan_id?.name || 'Free',
        status: m.auth_enabled ? 'Active' : 'Suspended'
      }));
    },
    error: (err) => {},
  });
}

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.items.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedItems(): Business[] {
    const start = (this.page - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  setPage(n: number) {
    if (n >= 1 && n <= this.totalPages) this.page = n;
  }

  prev() {
    this.setPage(this.page - 1);
  }

  next() {
    this.setPage(this.page + 1);
  }

  trackByEmail = (_: number, row: Business) => row.email;
}
