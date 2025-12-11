import { Component, HostListener, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  showMenu = false;
  userData: any = {};
  profileImage = 'images/profile-picture.png';

  ngOnInit(): void {
    this.auth.userData$.subscribe((data) => {
      this.userData = data || {};
      this.updateProfileImage();
    });
  }

  private updateProfileImage() {
    const pic = this.userData?.picture;

    if (!pic) {
      this.profileImage = 'images/profile-picture.png';
      return;
    }

    if (pic.startsWith('http') || pic.startsWith('data:')) {
      this.profileImage = pic;
    } else {
      this.profileImage = `${this.auth.getapi()}/${pic}`;
    }
  }

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  @HostListener('document:click')
  closeOnOutside() {
    this.showMenu = false;
  }

  goToSettings() {
    this.showMenu = false;
    const role = this.auth.getRole()?.key;

    if (role === 'owner') {
      this.router.navigate(['owner/setting']);
    } else {
      this.router.navigate(['merchant/settings']);
    }
  }

  logout() {
    this.showMenu = false;
    this.auth.logout();
  }
}
