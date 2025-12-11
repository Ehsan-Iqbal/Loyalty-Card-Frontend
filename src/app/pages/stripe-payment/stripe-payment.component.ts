import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';

type PaymentDetails = {
  account_name: string;
  plan: string;
  payment_method: string;
  total_amount_paid: string;
  date: string;
};

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss'],
  providers: [DatePipe],
})
export class StripePaymentComponent implements OnInit {
  paymentDetails: PaymentDetails = {} as PaymentDetails;
  isLoading = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const sessionId = params['session_id'];
      if (sessionId) {
        this.getPaymentDetails(sessionId);
      }
    });
  }

  private getPaymentDetails(sessionId: string): void {
    this.isLoading = true;

    this.authService
      .get(`plans/checkout/success?session_id=${sessionId}`)
      .subscribe({
        next: (res: any) => {
          if (res?.success) {
            const paymentData = res?.data;
            this.paymentDetails = {
              account_name: paymentData.account_name,
              plan: paymentData.plan,
              payment_method: paymentData.payment_method,
              total_amount_paid: paymentData.total_amount_paid,
              date:
                this.datePipe.transform(
                  paymentData.date,
                  'yyyy-MM-dd HH:mm:ss'
                ) || 'N/A',
            };
            Swal.fire({
              icon: 'success',
              text: res?.message,
              timer: 3000,
              toast: true,
              position: 'top',
              showConfirmButton: false,
            });
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
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
