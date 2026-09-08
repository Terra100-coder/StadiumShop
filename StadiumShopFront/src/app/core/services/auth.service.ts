import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../../environment';
import { AuthenticatedUser, LoginCredentials, LoginResponse, UserRole } from '../models/auth.model';

export const AUTH_TOKEN_STORAGE_KEY = 'stadium-shop-auth-token';
export const AUTH_USER_STORAGE_KEY = 'stadium-shop-auth-user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenState = signal<string | null>(this.loadToken());
  private readonly userState = signal<AuthenticatedUser | null>(this.loadUser());

  readonly token = this.tokenState.asReadonly();
  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);
  readonly isAdmin = computed(() => this.userState()?.role === 'ADMIN');

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<void> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.startSession(response.token)),
      map(() => undefined)
    );
  }

  logout(): void {
    this.tokenState.set(null);
    this.userState.set(null);
    this.removeStoredSession();
  }

  getToken(): string | null {
    return this.tokenState();
  }

  private startSession(token: string): void {
    const user = this.getUserFromToken(token);

    if (!user) {
      this.logout();
      return;
    }

    this.tokenState.set(token);
    this.userState.set(user);
    this.storeSession(token, user);
  }

  private loadToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    return token && this.getUserFromToken(token) ? token : null;
  }

  private loadUser(): AuthenticatedUser | null {
    const token = this.tokenState();

    if (!token) {
      return null;
    }

    const tokenUser = this.getUserFromToken(token);
    if (!tokenUser) {
      this.removeStoredSession();
      return null;
    }

    return tokenUser;
  }

  private getUserFromToken(token: string): AuthenticatedUser | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const claims = JSON.parse(this.decodeBase64Url(payload)) as { sub?: unknown; exp?: unknown; role?: unknown };
      if (typeof claims.sub !== 'string' || !claims.sub ||
        (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now())) {
        return null;
      }

      return {
        email: claims.sub,
        role: this.toUserRole(claims.role),
      };
    } catch {
      return null;
    }
  }

  private decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    return decodeURIComponent(Array.from(atob(padded), (character) =>
      `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
  }

  private toUserRole(value: unknown): UserRole | null {
    return value === 'ADMIN' || value === 'CLIENT' ? value : null;
  }

  private storeSession(token: string, user: AuthenticatedUser): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
      localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    }
  }

  private removeStoredSession(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }
}
