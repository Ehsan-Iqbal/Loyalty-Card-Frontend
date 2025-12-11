import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
          ),
        ],
      ],
    });
  }

  get email() {
    return this.resetForm.get('email')!;
  }

  ngOnInit(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !this.loading) {
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const email = (this.email.value as string).trim().toLowerCase();
    this.authService.post('auth/forget', { email }).subscribe({
      next: (res) => {
        this.loading = false;
        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });

        const resetToken =
          (res as any)?.reset_token || (res as any)?.token || null;
        if (resetToken) {
          sessionStorage.setItem('reset_token', resetToken);
          this.router.navigate(['/set-new-password'], {
            queryParams: { email },
          });
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message;
        Swal.fire({
          position: 'top',
          icon: 'error',
          text: msg,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }
}
