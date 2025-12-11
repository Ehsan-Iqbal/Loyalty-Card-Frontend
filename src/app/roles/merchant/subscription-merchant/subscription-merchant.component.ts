import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import Swal from 'sweetalert2';

type SubscriptionPlan = {
  _id: string;
  name: string;
  price: number;
  billing_period: string;
  limits: {
    max_customers: number;
    max_loyalty_cards: number;
  };
  status: boolean;
};

@Component({
  selector: 'app-subscription-merchant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-merchant.component.html',
  styleUrls: ['./subscription-merchant.component.scss'],
})
export class SubscriptionMerchantComponent implements OnInit {
  plans: SubscriptionPlan[] = [];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  private loadPlans(): void {
    this.authService.get('plans').subscribe({
      next: (res: any) => {
        this.plans = res?.plans || [];
      },
      error: (err) => console.error('Plans Fetch Error:', err),
    });
  }

  subscribe(planId: string): void {
    this.authService.post('plans/checkout/create', { plan_id: planId }).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          text: res?.message,
          timer: 3000,
          toast: true,
          position: 'top',
          showConfirmButton: false,
        }).then(() => {
          const url = res?.data.url;
          if (url) {
            window.open(url, '_blank'); 
          }
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          text: err?.error?.message,
          timer: 3000,
          toast: true,
          position: 'top',
          showConfirmButton: false,
        });
      },
    });
  }
}
