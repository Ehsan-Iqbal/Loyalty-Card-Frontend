import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from './../../auth/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;
  loginForm!: FormGroup;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    const token = localStorage.getItem('authtoken');
    const userRaw = localStorage.getItem('userdata');
    const role = userRaw ? JSON.parse(userRaw)?.role : '';

    if (token) {
      const roleKey = role?.key || role;

      if (roleKey === 'owner') this.router.navigate(['owner']);
      if (roleKey === 'merchant') this.router.navigate(['merchant']);
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.authService.post('auth/login', { email, password }).subscribe({
      next: (res) => {
        this.loading = false;

        if (!res?.token) {
          return this.showError(res?.message);
        }

        localStorage.setItem('authtoken', res.token);
        this.authService.setSession(res.token, res.data);
        this.authService.setLoginStatus(true);
        this.authService.setRole(res.data?.role);

        const authEnabled = res?.data?.auth_enabled;
        const roleKey = res?.data?.role?.key || res?.data?.role;
        const cardCount = Number(res?.data?.card_count ?? 0);

        if (authEnabled) {
          this.router.navigate(['/otpverify']);
          return;
        }

        if (roleKey === 'merchant') {
          if (cardCount === 0) {
            localStorage.setItem('hideTabsForOnboarding', 'true');
            this.router.navigate(['/merchant/business']);
          } else {
            this.router.navigate(['merchant']);
          }
        } else {
          this.router.navigate(['owner']);
        }
      },

      error: (err) => {
        this.loading = false;
        this.showError(err?.error?.message);
      },
    });
  }

  showError(message: string) {
    Swal.fire({
      position: 'top',
      icon: 'error',
      text: message,
      toast: true,
      showConfirmButton: false,
      timer: 3000,
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.touched && control.invalid);
  }
}
