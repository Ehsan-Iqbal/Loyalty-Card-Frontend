import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  showPassword = false;
  showConfirm = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.signUpForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: [''],
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
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authtoken');
    if (token) this.router.navigate(['/admin']);
  }

  private passwordsMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const conf = group.get('confirmPassword')?.value;
    return pass && conf && pass !== conf ? { passwordMismatch: true } : null;
  }

  get firstName() {
    return this.signUpForm.get('firstName')!;
  }
  get lastName() {
    return this.signUpForm.get('lastName')!;
  }
  get email() {
    return this.signUpForm.get('email')!;
  }
  get password() {
    return this.signUpForm.get('password')!;
  }
  get confirmPassword() {
    return this.signUpForm.get('confirmPassword')!;
  }
  get passwordMismatch(): boolean {
    return !!this.signUpForm.errors?.['passwordMismatch'];
  }

  toggle(which: 'password' | 'confirm'): void {
    if (which === 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      first_name: this.firstName.value,
      last_name: this.lastName.value,
      email: this.email.value,
      password: this.password.value,
    };

    this.authService.post('auth/register', payload).subscribe({
      next: (res) => {
        const gotoDashboard = (token?: string, data?: any) => {
          if (token) localStorage.setItem('authtoken', token);
          if (data) localStorage.setItem('userdata', JSON.stringify(data));
            localStorage.setItem('hideTabsForOnboarding', 'true');
          this.authService.setLoginStatus(true);
          this.router.navigate(['/merchant/business']);
        };

        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });

        if (res?.token) {
          this.loading = false;
          gotoDashboard(res.token, res.data);
          return;
        }

        this.authService
          .post('auth/login', {
            email: payload.email,
            password: payload.password,
          })
          .subscribe({
            next: (loginRes) => {
              this.loading = false;
              if (loginRes?.token) {
                gotoDashboard(loginRes.token, loginRes.data);
              } else {
                gotoDashboard();
              }
            },
            error: (loginErr) => {
              this.loading = false;
              Swal.fire({
                position: 'top',
                icon: 'error',
                text: loginErr?.error?.message,
                toast: true,
                showConfirmButton: false,
                timer: 3000,
              });
              this.router.navigate(['/admin']);
            },
          });
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err?.error?.message;
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
