import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { AuthService } from '../../auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-two-fa-page',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule],
  templateUrl: './two-fa-page.component.html',
  styleUrls: ['./two-fa-page.component.scss'],
})
export class TwoFaPageComponent implements OnInit {
  private auth = inject(AuthService);

  twoFAEnabled = false;
  otp = '';
  loading = false;
  verifying = false;
  otpauthUrl = '';
  showSetupInfo = false;

  ngOnInit() {
    this.twoFAEnabled = JSON.parse(localStorage.getItem('otpEnable') || 'false');
  }

  @HostListener('document:keydown.enter')
  handleEnter(): void {
    if (!this.verifying && this.otp.trim()) this.verify();
  }

  onToggleChange(checked: boolean) {
    const action = checked ? 'enable' : 'disable';
    this.loading = true;
    this.twoFAEnabled = checked;
    this.showSetupInfo = checked;
    this.otpauthUrl = '';

    this.auth.patch('auth/toggle-2fa-authentication', { action }).subscribe({
      next: (res: any) => {
        this.loading = false;

        if (checked) {
          this.otpauthUrl = res?.data?.otp_auth_url || '';
          if (this.otpauthUrl) {
            localStorage.setItem('otpEnable', 'true');
          }
        } 
        // else {
        //   localStorage.removeItem('otpEnable');
        // }

        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (e) => {
        this.loading = false;
        this.twoFAEnabled = !checked;
        this.showSetupInfo = false;

        Swal.fire({
          position: 'top',
          icon: 'error',
          text: e?.error?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }

  verify() {
    if (!this.otp.trim()) return;
    this.verifying = true;

    this.auth.post('auth/verify-2fa', { otp_code: this.otp.trim() }).subscribe({
      next: (res: any) => {
        this.verifying = false;
        this.twoFAEnabled = true;
        this.showSetupInfo = false;

        localStorage.setItem('otpEnable', res?.data?.auth_enabled || 'true');

        Swal.fire({
          position: 'top',
          icon: 'success',
          text: res?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (e) => {
        this.verifying = false;
        Swal.fire({
          position: 'top',
          icon: 'error',
          text: e?.error?.message,
          toast: true,
          showConfirmButton: false,
          timer: 3000,
        });
      },
    });
  }
}
