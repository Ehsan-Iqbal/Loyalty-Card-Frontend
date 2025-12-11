import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth/auth.service'; 

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './preview-card.component.html',
  styleUrls: ['./preview-card.component.scss'],
})
export class PreviewCardComponent implements OnInit {
  data: {
    logo?: string;
    hero?: string;
    businessName?: string;
    rewardText?: string;
    qr: string;
    textColor?: string; 
    bgColor?: string;   
    labelColor?: string;
  } | null = null;

  loading = false;  
  cardId: string | null = null;  

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private authService: AuthService  
  ) {}

  ngOnInit(): void {
    const encoded = this.route.snapshot.queryParamMap.get('data');
    if (encoded) {
      try {
        this.data = JSON.parse(decodeURIComponent(encoded));
        this.cdRef.detectChanges();  
      } catch (e) {
      }
    }

    this.cardId = this.route.snapshot.queryParamMap.get('card_id');
  }

  addToGoogleWallet(): void {
    if (!this.cardId) {
      return;
    }

    this.loading = true; 
    this.authService.addToGoogleWallet(this.cardId).subscribe({
      next: (response: any) => {
        this.loading = false;
        Swal.fire({
          text: response?.message,
          icon: 'success',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (error) => {
        this.loading = false; 
        Swal.fire({
          text: error?.message,
          icon: 'error',
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    });
  }
}
