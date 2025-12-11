import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  form: FormGroup;
  showPassword = false;
  showConfirm = false;
  loading = false;
  token: string | null = null;
  email: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || null;
      if (this.token) {
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || null;
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.loading) {
      event.preventDefault();
      this.onSubmit();
    }
  }

  private passwordsMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const conf = group.get('confirmPassword')?.value;
    return pass && conf && pass !== conf ? { passwordMismatch: true } : null;
  }

  get password() {
    return this.form.get('password')!;
  }

  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }

  get passwordMismatch(): boolean {
    return !!this.form.errors?.['passwordMismatch'];
  }

  toggle(which: 'password' | 'confirm'): void {
    if (which === 'password') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const payload = {
      new_password: this.password.value,
      token: this.token,
    };

    this.authService.post('auth/reset', payload).subscribe({
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

        localStorage.clear();
        this.router.navigate(['/login']);
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
