import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import Swal from 'sweetalert2';

type LoyaltyCard = {
  _id: string;
  businessName: string;
  points: string;
  value: number;
  membership_type: string;
  bgImage: string;
  logoImage: string;
  design: {
    colors: {
      background_color: string;
      text_color: string;
      label_color: string;
    } | null;
  } | null;
  rewardText: string; 
};

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
})
export class CardsComponent implements OnInit {
  cards: LoyaltyCard[] = [];
  page = signal(1);
  pageSize = signal(5);

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadCards();
  }

  private loadCards(): void {
    this.authService.get('loyaltyCard/my-cards').subscribe({
      next: (res: any) => {
        const data = res?.data || [];

        this.cards = data.map((card: any) => ({
          _id: card?._id,
          businessName: card?.name || card?.business_name,
          points: card?.reward_config?.type || 'N/A',
          value: card?.reward_config?.value ?? 0,
          membership_type: `${(
            card?.membership_type || 'N/A'
          ).toUpperCase()} Card`,
          bgImage: this.getFullImageUrl(card?.design?.hero_image?.file_path),
          logoImage: this.getFullImageUrl(card?.design?.logo?.file_path),
          design: card?.design,
          rewardText: card?.reward_config?.description
        }));
      },
      error: () => {
        this.cards = [];
      },
    });
  }

  getFullImageUrl(url: string): string {
    return `${this.authService.getapi()}/${url}`;
  }

  pagedCards = computed(() => {
    const start = (this.page() - 1) * this.pageSize();
    return this.cards.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.cards.length / this.pageSize()));

  pageNumbers = computed(() => {
    const totalPagesCount = this.totalPages();
    return Array.from({ length: totalPagesCount }, (_, i) => i + 1);
  });

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
    }
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
    }
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.page.set(page);
    }
  }

  goToBusinessSteps(): void {
    localStorage.removeItem('hideTabsForOnboarding');
    this.router.navigate(['/merchant/business']);
  }

  delete(i: number): void {
    const cardId = this.cards[i]?._id;
    if (!cardId) return;

    this.authService.del(`loyaltyCard/${cardId}`).subscribe({
      next: (res: any) => {
        this.cards.splice(i, 1);

        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (err) => {
        Swal.fire({
          position: 'top',
          icon: 'error',
          text: err?.error?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  edit(i: number): void {
    const cardId = this.cards[i]?._id;
    if (!cardId) return;

    localStorage.setItem('editMode', 'true');
    localStorage.setItem('editCardId', cardId);
    localStorage.setItem('editCard', JSON.stringify(this.cards[i]));
    this.router.navigate(['/merchant/business']);
  }

  share(i: number): void {}
}
