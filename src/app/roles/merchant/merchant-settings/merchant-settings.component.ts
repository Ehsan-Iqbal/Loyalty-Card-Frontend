import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../auth/auth.service';
import { TwoFaPageComponent } from '../../../pages/two-fa-page/two-fa-page.component';

@Component({
  selector: 'app-merchant-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TwoFaPageComponent],
  templateUrl: './merchant-settings.component.html',
  styleUrls: ['./merchant-settings.component.scss'],
})
export class MerchantSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  activeTab: 'profile' | 'password' | '2fa' = 'profile';
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  userData: any = {};
  profileImage = 'images/profile-picture.png';

  ngOnInit(): void {
    this.initForm();
    this.initPasswordForm();
    this.loadProfile();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPwd = control.get('new_password')?.value;
    const confirmPwd = control.get('confirm_password')?.value;
    if (newPwd && confirmPwd && newPwd !== confirmPwd)
      return { passwordMismatch: true };
    return null;
  }

  setActiveTab(tab: 'profile' | 'password' | '2fa') {
    this.activeTab = tab;
  }

  initForm() {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: [''],
      role: [''],
    });
  }

  loadProfile() {
    const user = JSON.parse(localStorage.getItem('userdata') || '{}');
    if (!user) return;
    this.userData = user;
    this.profileForm.patchValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role?.name || '',
    });
    this.profileImage = user.picture
      ? user.picture.startsWith('http')
        ? user.picture
        : `${this.auth.getapi()}/${user.picture}`
      : 'images/profile-picture.png';
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.auth
      .updateProfile('auth/update-profile', this.profileForm.value)
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            position: 'top',
            icon: 'success',
            text: res?.message,
            toast: true,
            showConfirmButton: false,
            timer: 3000,
          });
          this.userData = { ...this.userData, ...this.profileForm.value };
          localStorage.setItem('userdata', JSON.stringify(this.userData));
          this.auth.userData$.next(this.userData);
        },
        error: (err: any) => {
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

  changeProfileImage(event: Event) {
    event.preventDefault();
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const preview = e.target.result as string;
      this.profileImage = preview;

      this.userData = {
        ...this.userData,
        picture: preview,
      };

      this.auth.setUserData(this.userData);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('picture', file);

    this.auth.updateProfile('auth/update-profile', formData).subscribe({
      next: (res: any) => {
        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });

        const pictureFromApi = res?.data?.picture;
        if (pictureFromApi) {
          this.userData = {
            ...this.userData,
            picture: pictureFromApi,
          };

          this.auth.setUserData(this.userData);

          this.profileImage = pictureFromApi.startsWith('http')
            ? pictureFromApi
            : `${this.auth.getapi()}/${pictureFromApi}`;
        }
      },
      error: (err: any) => {
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

  initPasswordForm() {
    this.passwordForm = this.fb.group(
      {
        old_password: ['', Validators.required],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  savePassword() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { old_password, new_password } = this.passwordForm.value;
    this.auth
      .updateProfile('auth/change-password', { old_password, new_password })
      .subscribe({
        next: (res: any) => {
          Swal.fire({
            position: 'top',
            icon: 'success',
            text: res?.message,
            toast: true,
            showConfirmButton: false,
            timer: 3000,
          });
          this.passwordForm.reset();
          this.showCurrent = this.showNew = this.showConfirm = false;
        },
        error: (err: any) => {
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

  toggleCurrent() {
    this.showCurrent = !this.showCurrent;
  }
  toggleNew() {
    this.showNew = !this.showNew;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }
}
