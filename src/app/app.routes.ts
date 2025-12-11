import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { TwoFaPageComponent } from './pages/two-fa-page/two-fa-page.component';
import { authGuard } from './auth/auth.guard';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { VerifyOtpComponent } from './pages/otp-verify/otp-verify.component';
import { PublicPageComponent } from './pages/public-page/public-page.component';
import { PreviewCardComponent } from './pages/preview-card/preview-card.component';
import { StripePaymentComponent } from './pages/stripe-payment/stripe-payment.component';
import { DeclinePaymentComponent } from './pages/decline-payment/decline-payment.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' },
  },
  {
    path: 'signup',
    component: SignUpComponent,
    data: { title: 'Sign Up' },
  },
  {
    path: 'resetpassword',
    component: ResetPasswordComponent,
    data: { title: 'Reset Password' },
  },
  {
    path: 'changepassword',
    component: ChangePasswordComponent,
    data: { title: 'Change Password' },
  },
  {
    path: 'otpverify',
    component: VerifyOtpComponent,
    data: { title: 'OTP Verification' },
  },
  {
    path: 'landingpage',
    component: LandingPageComponent,
    data: { title: 'Landing Page' },
  },
  {
    path: 'twoFa',
    component: TwoFaPageComponent,
    data: { title: 'Two-Factor Auth' },
  },
  {
    path: 'public/:id',
    component: PublicPageComponent,
    data: { title: 'public-page' },
  },
  {
    path: 'preview',
    component: PreviewCardComponent,
    data: { title: 'preview-card' },
  },
  {
    path: 'stripe',
    component: StripePaymentComponent,
    data: { title: 'stripe-payment' },
  },
  {
    path: 'decline',
    component: DeclinePaymentComponent,
    data: { title: 'decline-payment' },
  },
  {
    path: 'owner',
    canActivate: [authGuard],
    component: AppLayoutComponent,
    loadChildren: () =>
      import('./admin/admin.routing').then((m) => m.admin_routes),
  },
  {
    path: 'merchant',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    loadChildren: () =>
      import('./roles/merchant/merchant.routing').then(
        (m) => m.merchant_routes
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
