import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from './models';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private router = inject(Router);

  readonly user = signal<User | null>(this.readUser());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');
  readonly isResepsionis = computed(() => this.user()?.role === 'resepsionis');
  readonly isSekretaris = computed(() => this.user()?.role === 'sekretaris');
  readonly canManageVisitors = computed(() => this.isAdmin() || this.isResepsionis());
  readonly canManageMeetings = computed(() => this.isAdmin() || this.isSekretaris());
  readonly canManageRooms = computed(() => this.isAdmin() || this.isSekretaris());
  readonly canManageUsers = computed(() => this.isAdmin());

  readonly desktopSidebarHidden = signal<boolean>(false);
  private lastRefreshTime = 0;

  static readonly DESKTOP_QUERY = '(min-width: 1024px)';

  get isDesktop(): boolean {
    return typeof window !== 'undefined' && window.matchMedia(AuthService.DESKTOP_QUERY).matches;
  }

  toggleDesktopSidebar() {
    this.desktopSidebarHidden.update((v) => !v);
  }

  constructor() {
    if (this.isLoggedIn) {
      this.refreshUser();
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        if (this.isLoggedIn) this.refreshUser();
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isLoggedIn) this.refreshUser();
      });
    }
  }

  get token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn() {
    return !!this.token;
  }

  async refreshUser(force = false) {
    if (!this.isLoggedIn) return null;
    const now = Date.now();
    if (!force && now - this.lastRefreshTime < 2500) {
      return this.user();
    }
    this.lastRefreshTime = now;
    try {
      const res = await this.api.get<User>('/me');
      if (res?.data) {
        this.setUser(res.data);
        return res.data;
      }
    } catch { }
    return this.user();
  }

  async login(nip: string, password: string) {
    const res = await this.api.post<{ token: string; user: User }>('/login', { nip, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    this.setUser(res.data.user);
    return res.data.user;
  }

  async logout() {
    try {
      await this.api.post('/logout');
    } catch { }
    this.clearSession();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private readUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
