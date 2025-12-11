import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import Swal from 'sweetalert2';

import { AuthService } from '../../../auth/auth.service';

type Face = 'front' | 'back';

@Component({
  selector: 'app-final-touches',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeModule],
  templateUrl: './final-touches.component.html',
  styleUrls: ['./final-touches.component.scss'],
})
export class FinalTouchesComponent implements OnInit {
  payloadPreview: { key: string; value: string }[] = [];

  selectedPreset: string = 'preset-default';
  appleFace: Face = 'front';

  logoDataUrl: string | null = null;
  heroDataUrl: string | null = null;

  logoFile: File | null = null;
  heroFile: File | null = null;

  businessName = '';
  rewardText = '';
  points = 0;

  otpauthUrl: string = '';
  showQr = false;

  // Loading states for Save and Publish buttons
  loadingSave: boolean = false;
  loadingPublish: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadCardData();
  }

  private getBaseUrl(): string {
    const api = this.authService.getapi();
    const idx = api.indexOf('/api/');
    if (idx !== -1) {
      return api.substring(0, idx);
    }
    return api;
  }

  private buildFileUrl(path: string | null | undefined): string | null {
    if (!path) return null;

    if (path.startsWith('http')) {
      return path;
    }

    return `${this.getBaseUrl()}${path}`;
  }

  loadCardData() {
    const id = localStorage.getItem('loyaltyCardId');
    if (!id) return;

    this.authService.patch(`loyaltyCard/${id}/customer-data`, {}).subscribe({
      next: (res: any) => {
        const d = res.data || {};

        this.businessName = d?.name || 'Business Name';

        const reward = d?.reward_config;
        if (reward) {
          if (reward.type === 'discount') {
            this.rewardText = `${reward.value}% Discount`;
          } else if (reward.type === 'points') {
            this.rewardText = `${reward.value} Points`;
          } else {
            this.rewardText = `${reward.value}% Discount`;
          }

          this.points = reward.value ?? 0;
        }

        const design = d?.design;
        if (design?.logo?.url) {
          this.logoDataUrl = this.buildFileUrl(design.logo.url);
        }
        if (design?.hero_image?.url) {
          this.heroDataUrl = this.buildFileUrl(design.hero_image.url);
        }
      },
    });
  }

  saveDesign() {
    this.loadingSave = true; // Start loading for save

    const id = localStorage.getItem('loyaltyCardId');
    const token = localStorage.getItem('authtoken');

    if (!id || !token) {
      this.loadingSave = false; // Stop loading if missing id/token
      return;
    }

    const root = document.querySelector('.container') as HTMLElement;
    const styles = getComputedStyle(root);

    const bg = styles.getPropertyValue('--theme-bg').trim();
    const text = styles.getPropertyValue('--theme-text').trim();
    const label = styles.getPropertyValue('--theme-label').trim();

    const form = new FormData();

    form.append('design[colors][background_color]', bg);
    form.append('design[colors][text_color]', text);
    form.append('design[colors][label_color]', label);
    form.append('design[colors][theme_preset]', this.selectedPreset);

    if (this.logoFile) {
      form.append('logo', this.logoFile, 'logo.png');
    }

    if (this.heroFile) {
      form.append('hero_image', this.heroFile, 'hero_image.png');
    }

    this.authService
      .patchFormData(`loyaltyCard/${id}/design`, form, token)
      .subscribe({
        next: (res: any) => {
          this.loadingSave = false;
          Swal.fire({
            text: res?.message,
            icon: 'success',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
          });
        },
        error: (err) => {
          this.loadingSave = false;
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

  // publishCard() {
  //   this.loadingPublish = true;

  //   const id = localStorage.getItem('loyaltyCardId');
  //   if (!id) {
  //     this.loadingPublish = false;
  //     return;
  //   }

  //   this.authService.post(`loyaltyCard/${id}/publish`, {}).subscribe({
  //     next: (res: any) => {
  //       this.loadingPublish = false;
  //       Swal.fire({
  //         text: res?.message,
  //         icon: 'success',
  //         toast: true,
  //         position: 'top',
  //         showConfirmButton: false,
  //         timer: 3000,
  //       });

  //       const data = res?.data;
  //       const qrUrl = data?.qr_code?.url;

  //       const design = data?.design;

  //       if (design?.logo?.url) {
  //         this.logoDataUrl = this.buildFileUrl(design.logo.url);
  //       }

  //       if (design?.hero_image?.url) {
  //         this.heroDataUrl = this.buildFileUrl(design.hero_image.url);
  //       }

  //       const bgColor = design?.colors?.background_color;
  //       const textColor = design?.colors?.text_color;
  //       const labelColor = design?.colors?.label_color;

  //       const previewData = {
  //         logo: this.logoDataUrl,
  //         hero: this.heroDataUrl,
  //         businessName: this.businessName,
  //         rewardText: this.rewardText,
  //         qr: qrUrl,
  //         textColor: textColor,
  //         bgColor: bgColor,
  //         labelColor: labelColor,
  //       };

  //       const encoded = encodeURIComponent(JSON.stringify(previewData));

  //       const url = this.router.serializeUrl(
  //         this.router.createUrlTree(['/preview'], {
  //           queryParams: { data: encoded },
  //         })
  //       );

  //       window.open(url, '_blank');
  //     },
  //     error: (err) => {
  //       this.loadingPublish = false;
  //       Swal.fire({
  //         text: err?.error?.message,
  //         icon: 'error',
  //         toast: true,
  //         position: 'top',
  //         showConfirmButton: false,
  //         timer: 3000,
  //       });
  //     },
  //   });
  // }

  // publishCard() {
  //   this.loadingPublish = true;

  //   const id = localStorage.getItem('loyaltyCardId');
  //   if (!id) {
  //     this.loadingPublish = false;
  //     return;
  //   }

  //   this.authService.post(`loyaltyCard/${id}/publish`, {}).subscribe({
  //     next: (res: any) => {
  //       this.loadingPublish = false;
  //       Swal.fire({
  //         text: res?.message,
  //         icon: 'success',
  //         toast: true,
  //         position: 'top',
  //         showConfirmButton: false,
  //         timer: 3000,
  //       });

  //       const data = res?.data;
  //       const qrUrl = data?.qr_code?.url;

  //       const design = data?.design;

  //       if (design?.logo?.url) {
  //         this.logoDataUrl = this.buildFileUrl(design.logo.url);
  //       }

  //       if (design?.hero_image?.url) {
  //         this.heroDataUrl = this.buildFileUrl(design.hero_image.url);
  //       }

  //       const bgColor = design?.colors?.background_color;
  //       const textColor = design?.colors?.text_color;
  //       const labelColor = design?.colors?.label_color;

  //       const previewData = {
  //         logo: this.logoDataUrl,
  //         hero: this.heroDataUrl,
  //         businessName: this.businessName,
  //         rewardText: this.rewardText,
  //         qr: qrUrl,
  //         textColor: textColor,
  //         bgColor: bgColor,
  //         labelColor: labelColor,
  //       };
  //       const encoded = encodeURIComponent(JSON.stringify(previewData));

  //       const url = this.router.serializeUrl(
  //         this.router.createUrlTree(['/preview'], {
  //           queryParams: {
  //             data: encoded,
  //             card_id: id,
  //           },
  //         })
  //       );

  //       window.open(url, '_blank');
  //     },
  //     error: (err) => {
  //       this.loadingPublish = false;
  //       Swal.fire({
  //         text: err?.error?.message,
  //         icon: 'error',
  //         toast: true,
  //         position: 'top',
  //         showConfirmButton: false,
  //         timer: 3000,
  //       });
  //     },
  //   });
  // }

  publishCard() {
    this.loadingPublish = true;

    const id = localStorage.getItem('loyaltyCardId');
    if (!id) {
      this.loadingPublish = false;
      return;
    }

    this.authService.post(`loyaltyCard/${id}/publish`, {}).subscribe({
      next: (res: any) => {
        this.loadingPublish = false;
        Swal.fire({
          text: res?.message,
          icon: 'success',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });

        const data = res?.data;
        const qrUrl = data?.qr_code?.url;

        const design = data?.design;

        if (design?.logo?.url) {
          this.logoDataUrl = this.buildFileUrl(design.logo.url);
        }

        if (design?.hero_image?.url) {
          this.heroDataUrl = this.buildFileUrl(design.hero_image.url);
        }

        const bgColor = design?.colors?.background_color;
        const textColor = design?.colors?.text_color;
        const labelColor = design?.colors?.label_color;

        const previewData = {
          logo: this.logoDataUrl,
          hero: this.heroDataUrl,
          businessName: this.businessName,
          rewardText: this.rewardText,
          qr: qrUrl,
          textColor: textColor,
          bgColor: bgColor,
          labelColor: labelColor,
        };
        const encoded = encodeURIComponent(JSON.stringify(previewData));

        const url = this.router.serializeUrl(
          this.router.createUrlTree(['/preview'], {
            queryParams: {
              data: encoded,
              card_id: id,
            },
          })
        );

        window.open(url, '_blank');
      },
      error: (err) => {
        this.loadingPublish = false;
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

  onFileChange(event: Event, type: 'logo' | 'hero') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      if (type === 'logo') {
        this.logoDataUrl = dataUrl;
        this.logoFile = file;
      }

      if (type === 'hero') {
        this.heroDataUrl = dataUrl;
        this.heroFile = file;
      }
    };

    reader.readAsDataURL(file);
  }

  setFace(face: Face) {
    this.appleFace = face;
  }

  setPreset(name: string) {
    this.selectedPreset = name;
  }
}
