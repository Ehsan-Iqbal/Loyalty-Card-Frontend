import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/auth.service';

type Category = { id: string; title: string; desc: string; icon: string };

type MembershipOption = {
  id: string;
  key: string;
  icon: string;
  title: string;
  desc: string;
  unit?: string;
};

type RewardType = 'discount' | 'amount' | 'free_item';

type Reward = {
  id: string;
  name: string;
  type: RewardType;
  value: number;
  unit: string;
  pointsRequired: number;
  description: string;
};

type RewardApiType = 'discount' | 'points';

type QuickField = { key: string; label: string; placeholder?: string };

type QuestionType = 'short' | 'long' | 'number' | 'date';
type BasicFieldKey = 'name' | 'email' | 'phone' | 'birthday';

type ExtraQuestion = {
  id: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  value?: string;
};

type BasicFieldItem = {
  key: BasicFieldKey;
  label: string;
  checked: boolean;
};

type LocationEntry = {
  id: string;
  address: string;
  radius: number;
  message: string;
};

@Component({
  selector: 'app-business-pages',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './business-pages.component.html',
  styleUrls: ['./business-pages.component.scss'],
})
export class BusinessPagesComponent implements OnInit {
  stepsTotal = 6;
  step = 1;
  stepList = Array.from({ length: this.stepsTotal }, (_, i) => i + 1);

  businessName = '';
  tagline = '';
  activeFields: string[] = [];
  loading: boolean = false;

  customFields: Array<{
    key: string;
    label: string;
    value: string;
    tappable: boolean;
  }> = [];
  activeFieldKeys: string[] = [];

  categories: Category[] = [];
  selectedCategoryId: string | null = null;

  enableLocationAlerts = false;
  locations: LocationEntry[] = [];

  membershipOptions: MembershipOption[] = [];
  selectedMembershipId: string | null = null;
  selectedMembershipKey: string | null = null;

  selectedRewardType: RewardApiType = 'discount';
  rewardName: string = '';
  rewardValue: number | null = null;
  pointsRequired: number | null = null;
  rewardDescription: string = '';

  selectedIndex = 0;

  enableDataCollection = false;
  extraQuestions: ExtraQuestion[] = [];
  messageToCustomers = '';

  availableFields: QuickField[] = [
    { key: 'website', label: 'Website', placeholder: 'https://example.com' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 555 123 4567' },
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '+1 555 123 4567' },
    {
      key: 'facebook',
      label: 'Facebook',
      placeholder: 'facebook.com/yourpage',
    },
    { key: 'twitter', label: 'Twitter', placeholder: '@yourhandle' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/you' },
  ];

  rewards: Reward[] = [
    {
      id: 'first_purchase_bonus',
      name: 'First Purchase Bonus',
      type: 'discount',
      value: 0,
      unit: '% OFF Next Purchase',
      pointsRequired: 100,
      description: '',
    },
    {
      id: 'vip_member_reward',
      name: 'VIP Member Reward',
      type: 'amount',
      value: 5,
      unit: '$ OFF Any Item',
      pointsRequired: 150,
      description:
        'Exclusive VIP reward. Save on your next purchase after you reach enough points.',
    },
  ];

  basicFields: BasicFieldItem[] = [
    { key: 'name', label: 'Name', checked: false },
    { key: 'email', label: 'Email', checked: false },
    { key: 'phone', label: 'Phone', checked: false },
    { key: 'birthday', label: 'Birthday (MM-DD)', checked: false },
  ];

  questionTypeOptions: { value: QuestionType; label: string }[] = [
    { value: 'short', label: 'Short Answer' },
    { value: 'long', label: 'Long Answer' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
  ];

  private authService = inject(AuthService);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const storedUser = localStorage.getItem('userdata');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if ('role' in user) {
          delete user.role;
          localStorage.setItem('userdata', JSON.stringify(user));
        }
      } catch (error) {}
    }

    const selectedMembershipType = localStorage.getItem(
      'selectedMembershipType'
    );
    if (selectedMembershipType) {
      this.selectedMembershipKey = selectedMembershipType;
    }

    const isEdit = localStorage.getItem('editMode') === 'true';
    const editCardId = localStorage.getItem('editCardId');

    if (isEdit && editCardId) {
      this.step = 2;
      localStorage.setItem('loyaltyCardId', editCardId);

      const card = JSON.parse(localStorage.getItem('editCard') || '{}');

      if (card) {
        this.businessName = card.businessName || '';
        this.tagline = card.tagline || '';

        if (card.membership_type) {
          const raw = card.membership_type.toLowerCase().replace(' card', '');
          this.selectedMembershipKey = raw;
        }

        if (card.reward_config) {
          this.rewardName = card.reward_config.name || '';
          this.selectedRewardType = card.reward_config.type;
          this.rewardValue = card.reward_config.value || null;
          this.pointsRequired = card.reward_config.points_required || null;
          this.rewardDescription = card.reward_config.description || '';
        }
      }
    } else {
      this.step = 1;
    }

    this.loadCategories();
    this.loadMembershipList();
  }

  private loadCategories() {
    this.authService.get('businessCategory/list').subscribe({
      next: (res: any) => {
        const incoming = Array.isArray(res?.data) ? res.data : [];
        this.categories = incoming.map((c: any) => ({
          id: c?._id ?? c?.id ?? Math.random().toString(36).slice(2),
          title: c?.title ?? c?.name ?? '',
          desc: c?.desc ?? c?.description ?? '',
          icon: c?.icon ?? '',
        }));
      },
      error: (e) => {
        Swal.fire({
          text: e?.error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });

        const savedCats = localStorage.getItem('savedCategories');
        if (savedCats) {
          try {
            this.categories = JSON.parse(savedCats).map((c: any) => ({
              id: c.id,
              title: c.title,
              desc: c.desc,
              icon: c.icon,
            }));
          } catch {}
        }
      },
    });
  }

  private loadMembershipList() {
    this.authService.get('membership/list').subscribe({
      next: (res2: any) => {
        const data = Array.isArray(res2?.data) ? res2.data : [];
        this.membershipOptions = data.map((m: any) => ({
          id: m._id,
          key: m.key,
          icon: m.icon_class ?? 'ri-gift-line',
          title: m.name ?? '',
          desc: m.description ?? '',
        }));
      },
      error: (e2) => {
        Swal.fire({
          text: e2?.error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  // STEP 1
  selectCategory(id: string) {
    this.selectedCategoryId = id;
  }

  saveCategoryAndNext() {
    if (!this.selectedCategoryId) return;
    this.loading = true;
    const body = { category_id: this.selectedCategoryId };

    this.authService.post('loyaltyCard/create-with-category', body).subscribe({
      next: (res: any) => {
        this.loading = false;
        const createdCardId =
          res?.data?._id ?? res?.data?.id ?? res?._id ?? res?.id ?? null;

        if (createdCardId) {
          localStorage.setItem('loyaltyCardId', createdCardId);
        }

        Swal.fire({
          text: res?.message,
          icon: 'success',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });

        localStorage.removeItem('selectedCategoryId');
        this.next();
      },
      error: (e) => {
        this.loading = false;
        Swal.fire({
          text: e?.error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  saveBusiness() {
    const cardId = localStorage.getItem('loyaltyCardId');
    if (!cardId) return;

    this.loading = true;

    const body = {
      name: this.businessName,
      tagline: this.tagline,
    };

    this.authService
      .patch(`loyaltyCard/${cardId}/business-info`, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
          this.next();
        },
        error: (e) => {
          this.loading = false;
          Swal.fire({
            text: e?.error?.message,
            icon: 'error',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }

  // STEP 3
  addLocation() {
    const id =
      globalThis.crypto && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    this.locations.push({
      id,
      address: '',
      radius: 150,
      message: '',
    });
  }

  removeLocation(index: number) {
    this.locations.splice(index, 1);
  }

  saveLocation(goNext: boolean = false) {
    this.loading = true;
    const cardId = localStorage.getItem('loyaltyCardId');
    if (!cardId) {
      this.loading = false;
      return;
    }

    const body = {
      location_alerts_enabled: this.enableLocationAlerts,
      locations: this.locations.map((loc) => ({
        address: loc.address,
        radius: loc.radius,
        notification_message: loc.message,
      })),
    };

    this.authService
      .patch(`loyaltyCard/${cardId}/location-alerts`, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });

          this.loadMembershipList();
          if (goNext) this.next();
        },

        error: (e) => {
          this.loading = false;
          let errorMsg = 'Something went wrong';

          if (
            e?.error?.errors &&
            Array.isArray(e.error.errors) &&
            e.error.errors.length > 0
          ) {
            errorMsg = e.error.errors[0].message;
          } else if (e?.error?.message) {
            errorMsg = e.error.message;
          }

          Swal.fire({
            text: errorMsg && 'address is required',
            icon: 'error',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }

  // STEP 4
  selectMembership(opt: MembershipOption): void {
    this.selectedMembershipId = opt.id;
    this.selectedMembershipKey = opt.key;
    localStorage.setItem('selectedMembershipType', opt.key);
  }

  // saveMembershipAndNext() {
  //   this.loading = true;

  //   const cardId = localStorage.getItem('loyaltyCardId');
  //   if (!cardId || !this.selectedMembershipId) {
  //     this.loading = false;
  //     return;
  //   }

  //   const body = {
  //     membership_type_id: this.selectedMembershipId,
  //   };

  //   this.authService
  //     .patch(`loyaltyCard/${cardId}/membership-type`, body)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.loading = false;
  //         Swal.fire({
  //           text: res?.message,
  //           icon: 'success',
  //           toast: true,
  //           position: 'top',
  //           showConfirmButton: false,
  //           timer: 3000,
  //         });
  //         this.next();
  //       },
  //       error: (e) => {
  //         this.loading = false;
  //         Swal.fire({
  //           text: e?.error?.message,
  //           icon: 'error',
  //           toast: true,
  //           position: 'top',
  //           showConfirmButton: false,
  //           timer: 3000,
  //         });
  //       },
  //     });
  // }

  saveMembershipAndNext() {
    this.loading = true;

    const cardId = localStorage.getItem('loyaltyCardId');
    if (!cardId || !this.selectedMembershipId) {
      this.loading = false;
      return;
    }

    const body = {
      membership_type_id: this.selectedMembershipId,
    };

    this.authService
      .patch(`loyaltyCard/${cardId}/membership-type`, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
          this.next();
        },
        error: (e) => {
          this.loading = false;
          Swal.fire({
            text: e?.error?.message,
            icon: 'error',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }

  // step-5
  saveRewardDetails() {
    this.loading = true;

    const cardId = localStorage.getItem('loyaltyCardId');
    if (!cardId) {
      this.loading = false;
      return;
    }

    const trimmedName = (this.rewardName || '').trim();
    const trimmedDesc = (this.rewardDescription || '').trim();

    if (!trimmedName) {
      this.loading = false;
      Swal.fire({
        text: 'Reward name is required',
        icon: 'error',
        toast: true,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!this.selectedRewardType) {
      this.loading = false;
      Swal.fire({
        text: 'Reward type is required',
        icon: 'error',
        toast: true,
        position: 'top',
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (this.selectedRewardType === 'discount') {
      if (!this.rewardValue || Number(this.rewardValue) <= 0) {
        this.loading = false;
        Swal.fire({
          text: 'Reward value is required',
          icon: 'error',
          toast: true,
          position: 'top',
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }
    }

    if (this.selectedRewardType === 'points') {
      if (!this.pointsRequired || Number(this.pointsRequired) <= 0) {
        this.loading = false;
        Swal.fire({
          text: 'Points required is required',
          icon: 'error',
          toast: true,
          position: 'top',
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }
    }

    const body = {
      reward_config: {
        name: trimmedName,
        type: this.selectedRewardType,
        value:
          this.selectedRewardType === 'discount'
            ? Number(this.rewardValue)
            : Number(this.pointsRequired),
        description: trimmedDesc || null,
      },
    };

    this.authService
      .patch(`loyaltyCard/${cardId}/reward-details`, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
          this.next();
        },
        error: (e) => {
          this.loading = false;
          Swal.fire({
            text: e?.error?.message,
            icon: 'error',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }

  // STEP 6
  toggleBasicField(index: number, value: boolean): void {
    const field = this.basicFields[index];
    field.checked = value;
  }

  addQuestion() {
    const id =
      globalThis.crypto && 'randomUUID' in globalThis.crypto
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    this.extraQuestions.push({
      id,
      prompt: '',
      type: 'short',
      required: false,
    });
  }

  removeQuestion(index: number) {
    this.extraQuestions.splice(index, 1);
  }

  private mapQuestionTypeToAnswerType(t: QuestionType): string {
    switch (t) {
      case 'short':
        return 'short_answer';
      case 'long':
        return 'long_answer';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'short_answer';
    }
  }

  saveCustomerDataAndNext() {
    this.loading = true;

    const cardId = localStorage.getItem('loyaltyCardId');
    if (!cardId) {
      this.loading = false;
      return;
    }

    const basicInfo: Record<BasicFieldKey, boolean> = {
      name: false,
      email: false,
      phone: false,
      birthday: false,
    };

    this.basicFields.forEach((f) => {
      basicInfo[f.key] = !!f.checked;
    });

    const customQuestions = this.extraQuestions
      .filter((q) => q.prompt && q.prompt.trim().length > 0)
      .map((q) => ({
        question: q.prompt.trim(),
        answer_type: this.mapQuestionTypeToAnswerType(q.type),
        required: q.required,
        validation_value: q.value ?? null,
      }));

    const body = {
      customer_data_collection: {
        enabled: this.enableDataCollection,
        basic_info: basicInfo,
        custom_questions: customQuestions,
        message_to_customers: this.messageToCustomers,
      },
    };

    this.authService
      .patch(`loyaltyCard/${cardId}/customer-data`, body)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
          this.next();
        },
        error: (e) => {
          this.loading = false;
          Swal.fire({
            text: e?.error?.message,
            icon: 'error',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
      });
  }

  get activeReward(): Reward {
    const base = this.rewards[this.selectedIndex];

    return {
      ...base,
      name: this.rewardName || base.name,
      value:
        this.selectedRewardType === 'discount'
          ? this.rewardValue ?? base.value
          : base.value,
      pointsRequired:
        this.selectedRewardType === 'points'
          ? this.pointsRequired ?? base.pointsRequired
          : base.pointsRequired,
      description: this.rewardDescription.trim() || base.description,
    };
  }

  get previewHeadline(): string {
    if (this.selectedRewardType === 'discount') {
      const v = this.rewardValue ?? this.activeReward.value;
      return `${v || 0}% OFF`;
    }

    if (this.selectedRewardType === 'points') {
      const p = this.pointsRequired ?? this.activeReward.pointsRequired;
      return `${p || 0} Points Reward`;
    }

    return 'Reward';
  }

  get mobilePreviewCopy(): string {
    return this.rewardDescription || '';
  }

  get progressPct(): number {
    const r = this.activeReward;
    const current = Math.min(r.pointsRequired * 0.6, r.pointsRequired);
    return Math.round((current / r.pointsRequired) * 100);
  }

  toggleField(field: QuickField) {
    const index = this.activeFieldKeys.indexOf(field.key);

    if (index === -1) {
      this.activeFieldKeys.push(field.key);
      this.customFields.push({
        key: field.key,
        label: field.label,
        value: '',
        tappable: false,
      });
    } else {
      this.activeFieldKeys.splice(index, 1);
      this.customFields = this.customFields.filter((f) => f.key !== field.key);
    }
  }

  isFieldActive(key: string): boolean {
    return this.activeFieldKeys.includes(key);
  }

  removeField(index: number) {
    const removedKey = this.customFields[index].key;
    this.customFields.splice(index, 1);
    this.activeFieldKeys = this.activeFieldKeys.filter((k) => k !== removedKey);
  }

  metersToFeet(m: number): number {
    return Math.round(m * 3.28084);
  }

  metersToYards(m: number): number {
    return Math.round((m * 3.28084) / 3);
  }

  // next() {
  //   if (this.step < this.stepsTotal) {
  //     this.step += 1;
  //   } else {
  //     localStorage.removeItem('hideTabsForOnboarding');
  //     this.router.navigate(['/merchant/final']);
  //   }
  // }
  next() {
    if (this.step < this.stepsTotal) {
      this.step += 1;
    } else {
      localStorage.removeItem('hideTabsForOnboarding');
      this.router.navigate(['/merchant/final']);
    }
  }

  // back() {
  //   if (this.step > 1) this.step -= 1;
  // }
}
