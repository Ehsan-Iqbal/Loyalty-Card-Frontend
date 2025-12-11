import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/auth.service';

type SubscriptionTier = '' | 'Starter' | 'Pro' | 'Enterprise';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  subscription: SubscriptionTier;
  reward: string;
  phone?: string;
}

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit {

  constructor(private authService: AuthService) {}

  showTable = signal(false);
  rows = signal<CustomerRow[]>([]);
  showViewModal = signal(false);

  selectedCustomer = signal<CustomerRow | null>(null);

  showEditModal = signal(false);
  isSaving = signal(false);

  editModel: {
    id: string | null;
    name: string;
    email: string;
    subscription: SubscriptionTier;
    reward: string;
    phone?: string;
  } = {
    id: null,
    name: '',
    email: '',
    subscription: '',   
    reward: '',
    phone: '',
  };

  page = signal(1);
  pageSize = signal(5);

  
  search = signal('');

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.authService.get('customer/list').subscribe({
      next: (res: any) => {
        const converted: CustomerRow[] = (res?.data || []).map((c: any) => ({
  
          id: c?.id || c?._id || '',
          name: c?.name ?? '',
          email: c?.email ?? '',
          subscription: (c?.membership_type || '') as SubscriptionTier,
          reward: c?.reward_config?.type ?? '',
          phone: c?.phone ?? '',
        }));

        this.rows.set(converted);
        this.showTable.set(true);
      },
      error: (err) =>
        Swal.fire({
          icon: 'error',
          position: 'top',
          text: err?.error?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        }),
    });
  }

  onSearch(event: any) {
    this.search.set(event.target.value.toLowerCase());
    this.page.set(1); 
  }

  filteredRows = computed(() => {
    const keyword = this.search().trim().toLowerCase();

    if (!keyword) return this.rows();

    return this.rows().filter((row) =>
      row.name.toLowerCase().includes(keyword) ||
      row.email.toLowerCase().includes(keyword) ||
      (row.subscription && row.subscription.toLowerCase().includes(keyword)) ||
      (row.reward && row.reward.toLowerCase().includes(keyword))
    );
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredRows().length / this.pageSize())
  );

  pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() || 1 }, (_, i) => i + 1)
  );

  pagedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.filteredRows().slice(start, start + this.pageSize());
  });

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  next() {
    this.setPage(this.page() + 1);
  }

  prev() {
    this.setPage(this.page() - 1);
  }

  trackByEmail = (_: number, row: CustomerRow) => row.email;

  openViewModal(row: CustomerRow) {
    this.selectedCustomer.set(row);
    this.showViewModal.set(true);
  }

  closeViewModal() {
    this.showViewModal.set(false);
  }

  openEditModal(row: CustomerRow) {
    this.editModel = {
      id: row.id,
      name: row.name,
      email: row.email,
      subscription: (row.subscription || '') as SubscriptionTier,
      reward: row.reward,
      phone: row.phone && row.phone !== 'N/A' ? row.phone : '',
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
  }

  saveEdit() {
    if (!this.editModel.id) {
      return;
    }

    if (!this.editModel.subscription) {
      return;
    }

    this.isSaving.set(true);

    const body = {
      name: this.editModel.name,
      email: this.editModel.email,
      membership_type: this.editModel.subscription,
      phone: this.editModel.phone,
      reward: this.editModel.reward,
    };

    const endpoint = `customer/update?id=${this.editModel.id}`;

    this.authService
      .patch(endpoint, body)
      .subscribe({
        next: () => {
          const updated = this.rows().map((r) =>
            r.id === this.editModel.id
              ? {
                  ...r,
                  name: this.editModel.name,
                  email: this.editModel.email,
                  subscription: this.editModel.subscription,
                  phone: this.editModel.phone || 'N/A',
                  reward: this.editModel.reward,
                }
              : r
          );
          this.rows.set(updated);

          this.isSaving.set(false);
          this.showEditModal.set(false);
        },
        error: (err) => {
          this.isSaving.set(false);
          Swal.fire({
            icon: 'error',
            position: 'top',
            text: err?.error?.message,
            toast: true,
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }
 deleteCustomer(row: CustomerRow) {
  const endpoint = `customer/delete?id=${row.id}`;

  this.authService.del(endpoint).subscribe({
    next: (res: any) => {

      const updated = this.rows().filter(r => r.id !== row.id);
      this.rows.set(updated);

      Swal.fire({
        icon: 'success',
        text: res?.message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
    },

    error: (err) => {
      Swal.fire({
        icon: 'error',
        text: err?.error?.message,
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3000
      });
    }
  });
}

}
