import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

interface DynamicFieldConfig {
  label: string;
  type: string;
  placeholder?: string;
}

@Component({
  selector: 'app-public-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-page.component.html',
  styleUrls: ['./public-page.component.scss'],
})
export class PublicPageComponent implements OnInit {
  slug = '';
  loading = true;

  data: any = null;

  trueFields: { key: string }[] = [];
  customQuestions: any[] = [];

  messageToCustomers = '';

  formData: any = {};
  customAnswers: string[] = [];

  submitting = false;
  submitSuccessMsg = '';
  submitErrorMsg = '';

  fieldConfig: Record<string, DynamicFieldConfig> = {
    name: { label: 'Full Name', type: 'text', placeholder: 'Enter name' },
    email: { label: 'Email', type: 'email', placeholder: 'Enter email' },
    phone: {
      label: 'Phone',
      type: 'text',
      placeholder: 'Enter phone number',
    },
    birthday: { label: 'Date of Birth', type: 'date' },
  };

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.slug = this.route?.snapshot?.params['id'];

    if (this.slug) {
      this.fetchPass();
    } else {
      this.loading = false;
    }
  }

  fetchPass() {
    this.loading = true;

    this.authService.get(`loyaltyCard/get_pass/${this.slug}`).subscribe({
      next: (res: any) => {
        const d = res?.data || {};
        this.data = d;

        const collection = d.customer_data_collection || {};
        const basicInfo = collection.basic_info || {};

        this.messageToCustomers = collection.message_to_customers || '';

        this.trueFields = Object.entries(basicInfo)
          .filter(([_, value]) => value === true)
          .map(([key]) => ({ key }));

        this.trueFields.forEach((f) => {
          this.formData[f.key] = '';
        });

        this.customQuestions = Array.isArray(collection.custom_questions)
          ? collection.custom_questions
          : [];

        this.customAnswers = new Array(this.customQuestions.length).fill('');

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.submitErrorMsg = 'Unable to load card details';
      },
    });
  }

 onSubmit() {
  if (this.submitting) return; 

  this.submitSuccessMsg = '';
  this.submitErrorMsg = '';

  const payload: any = {
    slug: this.slug,
  };

  this.trueFields.forEach((f) => {
    let value = this.formData[f.key] ?? null;

    if (f.key === 'birthday' && value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-');
        value = `${month}-${day}`;
      }
    }

    payload[f.key] = value;
  });

  if (this.customQuestions.length > 0) {
    payload.custom_questions = this.customQuestions.map((q, index) => ({
      id: q.id ?? null,
      question: q.question_text || q.label || q.question || '',
      answer: this.customAnswers[index] || '',
    }));
  }

  this.submitting = true;  

  this.authService.post('customer/add-by-slug', payload).subscribe({
    next: (res: any) => {
      this.submitting = false; 
      this.submitSuccessMsg = res?.message;

      Swal.fire({
        position: 'top',
        icon: 'success',
        text: this.submitSuccessMsg,
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
    },
    error: (err) => {
      this.submitting = false; 
      const errorMessage = err?.error?.message;
      this.submitErrorMsg = errorMessage;

      Swal.fire({
        position: 'top',
        icon: 'error',
        text: errorMessage,
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
    },
  });
}

}
