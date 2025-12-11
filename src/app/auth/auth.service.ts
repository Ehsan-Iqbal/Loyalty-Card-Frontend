import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Import environment to get the API URL
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';

interface AuthResponse {
  status: any;
  data: any;
  message: any;
  token: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = environment.apiUrl;
  private readonly TOKEN_KEY = 'authtoken';
  private readonly USER_KEY = 'userdata';
  private readonly ROLE_KEY = 'role';

  userData$ = new BehaviorSubject<any>(
    JSON.parse(localStorage.getItem('userdata') || '{}')
  );

  isLoggedIn$ = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.TOKEN_KEY)
  );

  role = '';
  loginStatus = false;

  constructor(private http: HttpClient, private router: Router) {}

  getUserData() {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  setUserData(data: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(data || {}));
    this.userData$.next(data);
  }

  getapi() {
    return this.API_URL;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get token(): string | null {
    return this.getToken();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  addToGoogleWallet(cardId: string): Observable<any> {
    const apiUrl = `${this.getapi()}/loyaltyCard/${cardId}/google-wallet`;
    return this.http.post(
      apiUrl,
      {},
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  get(ep: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.API_URL}/${ep}`);
  }

  del(ep: string, body?: any): Observable<AuthResponse> {
    return this.http.request<AuthResponse>('DELETE', `${this.API_URL}/${ep}`, {
      body,
    });
  }

  post(ep: string, body: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/${ep}`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  patch(ep: string, body: any): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(`${this.API_URL}/${ep}`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  patchFormData(ep: string, data: FormData, token: string) {
    return this.http.patch(`${this.API_URL}/${ep}`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  updateProfile(endpoint: string, data: any, token?: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(`${this.API_URL}/${endpoint}`, data, { headers });
  }

  updateUser(formData: FormData) {
    return this.patch('update', formData);
  }

  setSession(token: string, data: any) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data || {}));

    localStorage.removeItem(this.ROLE_KEY);

    this.setRole(data?.role || '');
    this.setLoginStatus(true);
    this.isLoggedIn$.next(true);
    this.userData$.next(data);
  }

  clearSession() {
    localStorage.clear();
    this.role = '';
    this.setLoginStatus(false);
    this.isLoggedIn$.next(false);
  }

  isAuthenticatedSync(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  setRole(r: any) {
    this.role = r || '';
  }

  getRole() {
    if (this.role) {
      return typeof this.role === 'string' ? { key: this.role } : this.role;
    }

    const rawUser = localStorage.getItem(this.USER_KEY);
    if (!rawUser) return {};

    try {
      const user = JSON.parse(rawUser);
      const r = user?.role;

      this.role = r || '';

      return typeof r === 'string' ? { key: r } : r || {};
    } catch {
      return {};
    }
  }

  validateToken() {
    const validate = new Promise((resolve) => {
      if (this.getToken()) {
        const token = this.getToken();
        lastValueFrom(
          this.http.get(`${this.API_URL}/auth/validate`, {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          })
        ).then(
          (res: any) => {
            if (res.status === 200) {
              if (res?.token == null) {
                this.setLoginStatus(false);
                localStorage.clear();
                resolve(false);
              }
              localStorage.setItem(this.TOKEN_KEY, res.token);
              localStorage.setItem(this.USER_KEY, JSON.stringify(res.data));

              localStorage.removeItem(this.ROLE_KEY);

              this.setLoginStatus(true);
              this.userData$.next(res.data);

              const role = res?.data?.role || '';
              this.setRole(role);
            }
            resolve(true);
          },
          () => {
            this.setLoginStatus(false);
            localStorage.clear();
            this.router.navigate(['']);
            resolve(false);
          }
        );
      } else {
        if (this.isLogin() === true) {
          this.setLoginStatus(false);
          localStorage.clear();
        }
        resolve(false);
      }
    });
    return validate;
  }

  setLoginStatus(status: boolean) {
    this.loginStatus = status;
  }

  isLogin() {
    return this.loginStatus;
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }
}
