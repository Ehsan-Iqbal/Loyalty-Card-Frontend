import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp-verify.component.html',
  styleUrls: ['./otp-verify.component.scss'],
})
export class VerifyOtpComponent {
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  otpForm!: FormGroup;
  boxes = Array(6).fill(0);
  submitting = false;

  constructor(private fb: FormBuilder) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onInput(i: number, ev: any) {
    const value = ev.target.value.replace(/\D/g, '');
    ev.target.value = value;
    this.updateFormControl();
    if (value && this.otpInputs.get(i + 1)) {
      this.focusIndex(i + 1);
    }
  }

  onKeydown(i: number, ev: KeyboardEvent) {
    const target = ev.target as HTMLInputElement | null;
    if (!target) return;

    if (ev.key === 'Backspace' && !target.value && this.otpInputs.get(i - 1)) {
      this.focusIndex(i - 1);
    }
  }

  onPaste(ev: ClipboardEvent): void {
    ev.preventDefault();
    const raw = ev.clipboardData?.getData('text') ?? '';
    const digits = raw
      .replace(/\D/g, '')
      .slice(0, this.otpInputs.length)
      .split('');
    queueMicrotask(() => {
      this.otpInputs.forEach((ref, i) => {
        ref.nativeElement.value = digits[i] ?? '';
      });
      this.updateFormControl();
      const last = Math.min(digits.length, this.otpInputs.length) - 1;
      this.focusIndex(last >= 0 ? last : 0);
    });
  }

  updateFormControl() {
    const otp = this.otpInputs
      .map((input) => input.nativeElement.value)
      .join('');
    this.otpForm.patchValue({ otp });
  }

  focusIndex(i: number) {
    const ref = this.otpInputs.get(i);
    if (ref) ref.nativeElement.focus();
  }

  verifyOtp() {
    const otpValue = this.otpForm.value.otp;

    this.submitting = true;

    if (otpValue.length !== 6) {
      this.submitting = false;
      return;
    }

    setTimeout(() => {
      this.submitting = false;

      const res: { message: string } = {
        message: 'OTP Verified Successfully!',
      };

      Swal.fire({
        position: 'top',
        icon: 'success',
        text: res.message,
        toast: true,
        showConfirmButton: false,
        timer: 3000,
      });
    }, 3000);
  }
}
