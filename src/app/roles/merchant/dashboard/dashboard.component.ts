import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);

  total_Customers: number = 0;
  total_cards: number = 0;

  loading = false;

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.loading = true;

    this.authService.get('dashboard').subscribe({
      next: (res: any) => {
        this.loading = false;

        const data = res?.data || res; // agar backend direct data de raha ho

        this.total_Customers = data?.total_customers ?? 0;
        this.total_cards = data?.total_cards ?? 0;
      },
      error: (err) => {
        this.loading = false;
        console.error('Dashboard load error:', err);
        // chaho to yahan Swal bhi laga sakte ho
      },
    });
  }
}
