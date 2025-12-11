import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../auth/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  roleKey: string | undefined;
  showTabs = true;

  ngOnInit(): void {
    const raw = localStorage.getItem('userdata');
    if (raw) {
      const parsed = JSON.parse(raw);
      this.roleKey = parsed?.role?.key || parsed?.role;
    }

    this.auth.userData$.subscribe((u) => {
      this.roleKey = u?.role?.key || u?.role;
    });

    this.updateTabsVisibility();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.updateTabsVisibility());
  }

  private updateTabsVisibility() {
    const url = this.router.url;
    const onboardingFlag =
      localStorage.getItem('hideTabsForOnboarding') === 'true';

    if (this.roleKey === 'owner') {
      this.showTabs = true;
      return;
    }
    const onboardingPages = [
      '/merchant/business',
      '/merchant/final',
      '/merchant/final-touches',
    ];

    const isOnboardingPage = onboardingPages.some((p) =>
      url.startsWith(p)
    );
    if (onboardingFlag && isOnboardingPage) {
      this.showTabs = false;
    } else {
      this.showTabs = true;
    }
  }
}
