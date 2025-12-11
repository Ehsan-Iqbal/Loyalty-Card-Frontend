import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss'],
})
export class SubscriptionComponent implements OnInit {

  plans: any[] = [];

  showEditModal = false;
  isSaving = false;

  editModel: any = {
    _id: '',
    name: '',
    price: '',
    billing_period: 'monthly',
    max_customers: '',
    max_loyalty_cards: '',
  };

  showAddModal = false;

  addModel: any = {
    name: '',
    price: '',
    billing_period: 'monthly',
    max_customers: '',
    max_loyalty_cards: '',
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  /* -------------------------------
      LOAD PLANS
  --------------------------------*/
  loadPlans() {
    this.authService.get('plans').subscribe({
      next: (res: any) => {
        this.plans = res?.plans || [];
      },
      error: (err) => console.error('Plans Fetch Error:', err),
    });
  }

  openAddModal() {
    this.addModel = {
      name: '',
      price: '',
      billing_period: 'monthly',
      max_customers: '',
      max_loyalty_cards: '',
    };

    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

createPlan() {
  this.isSaving = true;

  const body = {
    name: this.addModel.name,
    price: this.addModel.price,
    billing_period: this.addModel.billing_period,
    limits: {
      max_customers: this.addModel.max_customers,
      max_loyalty_cards: this.addModel.max_loyalty_cards,
    }
  };

  this.authService.post('plans', body).subscribe({
    next: (res: any) => {

      this.plans.push(res.data);   

      Swal.fire({
        icon: 'success',
        text: res?.message,
        timer: 3000,
        toast: true,
        position: 'top',
        showConfirmButton: false,
      });

      this.isSaving = false;
      this.closeAddModal();
    },

    error: (err) => {
      this.isSaving = false;

      Swal.fire({
        icon: 'error',
        text: err?.error?.message,
        timer: 3000,
        toast: true,
        position: 'top',
        showConfirmButton: false,
      });
    }
  });
}

  openEditModal(plan: any) {
    this.editModel = {
      _id: plan._id,
      name: plan.name,
      price: plan.price,
      billing_period: plan.billing_period,
      max_customers: plan.limits?.max_customers,
      max_loyalty_cards: plan.limits?.max_loyalty_cards,
    };

    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  savePlan() {
    this.isSaving = true;

    const body = {
      price: this.editModel.price,
      billing_period: this.editModel.billing_period,
      limits: {
        max_customers: this.editModel.max_customers,
        max_loyalty_cards: this.editModel.max_loyalty_cards,
      },
    };

    this.authService.patch(`plans/${this.editModel._id}`, body).subscribe({
      next: (res: any) => {

        this.plans = this.plans.map((p) =>
          p._id === this.editModel._id ? { ...p, ...body } : p
        );

        Swal.fire({
          icon: 'success',
          text: 'Plan updated successfully!',
          timer: 3000,
          toast: true,
          position: 'top',
          showConfirmButton: false,
        });

        this.isSaving = false;
        this.closeEditModal();
      },

      error: (err) => {
        this.isSaving = false;

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

  deletePlan(plan: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete the "${plan.name}" plan?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {

        this.authService.del(`plans/${plan._id}`).subscribe({
          next: (res: any) => {

            this.plans = this.plans.filter((p) => p._id !== plan._id);

            Swal.fire({
              icon: 'success',
              text: res?.message,
              timer: 3000,
              toast: true,
              position: 'top',
              showConfirmButton: false,
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
    });
  }
}
