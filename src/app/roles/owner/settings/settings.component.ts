import { Component, inject, OnInit, HostListener } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TwoFaPageComponent } from '../../../pages/two-fa-page/two-fa-page.component';
import { AuthService } from '../../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TwoFaPageComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  profileForm = this.fb.group({
    first_name: [''],
    last_name: [''],
    email: [''],
    role: [''],
  });

  passwordForm = this.fb.group({
    old_password: ['', [Validators.required, Validators.minLength(6)]],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
  });

  showOld = false;
  showNew = false;
  selectedImage: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  loading = false;

  ngOnInit(): void {
    const user = this.auth.getUserData();
    if (user && Object.keys(user).length) {
      this.profileForm.patchValue({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        role: user.role?.name || user.role || '',
      });

      if (user.picture) {
        this.imagePreview = user.picture.startsWith('http')
          ? user.picture
          : `${this.auth.getapi()}/${user.picture}`;
      }
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnterKey(event: Event | KeyboardEvent) {
    if ('key' in event) {
      const kb = event as KeyboardEvent;
      if (kb.key === 'Enter' && this.profileForm.valid && !this.loading) {
        kb.preventDefault();
        this.submitProfile();
      }
    }
  }
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedImage = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;

      const currentUser = this.auth.getUserData() || {};
      const updatedUser = {
        ...currentUser,
        picture: this.imagePreview,
      };

      this.auth.setUserData(updatedUser);
    };
    reader.readAsDataURL(file);
  }

  submitProfile(): void {
    const token = this.auth.getToken();
    if (!token) return;

    const user = this.auth.getUserData() || {};
    const formData = new FormData();

    const fields = ['first_name', 'last_name', 'email'];
    for (const field of fields) {
      const newValue = this.profileForm.get(field)?.value || '';
      if (newValue !== user[field]) {
        formData.append(field, newValue);
      }
    }

    if (this.selectedImage) {
      formData.append('picture', this.selectedImage);
    }

    let hasData = false;
    for (const _ of formData as any) {
      hasData = true;
      break;
    }
    if (!hasData) return;

    this.loading = true;

    this.auth.updateProfile('auth/update-profile', formData, token).subscribe({
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

        const updatedUser = {
          ...user,
          ...this.profileForm.value,
          ...(res?.data || {}),
        };

        this.auth.setUserData(updatedUser);

        if (updatedUser.picture) {
          const pic = updatedUser.picture as string;
          this.imagePreview =
            pic.startsWith('http') || pic.startsWith('data:')
              ? pic
              : `${this.auth.getapi()}/${pic}`;
        }
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          text: err?.error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) return;

    const token = this.auth.getToken();
    if (!token) return;

    const body = this.passwordForm.value;
    this.loading = true;

    this.auth.updateProfile('auth/change-password', body, token).subscribe({
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
        this.passwordForm.reset();
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({
          text: err?.error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  toggleOld = () => (this.showOld = !this.showOld);
  toggleNew = () => (this.showNew = !this.showNew);

  get oldType() {
    return this.showOld ? 'text' : 'password';
  }
  get newType() {
    return this.showNew ? 'text' : 'password';
  }
  get oldIcon() {
    return this.showOld ? 'ri-eye-line' : 'ri-eye-off-line';
  }
  get newIcon() {
    return this.showNew ? 'ri-eye-line' : 'ri-eye-off-line';
  }
}
