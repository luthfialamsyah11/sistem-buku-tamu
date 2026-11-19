import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular/lazy';
import { AuthService } from './core/auth.service';
import { UiService } from './core/ui.service';
import { SHARED_PIPES } from './shared/pipes';

@Component({
  selector: 'app-root',
  imports: [IonicModule, ...SHARED_PIPES],
  template: `
    <ion-app>
      <ion-menu
        side="start"
        menuId="admin-menu"
        contentId="main-content"
        [disabled]="!auth.user()"
        type="overlay"
        class="mobile-admin-menu"
      >
        <div class="ds-inner mobile-drawer-inner">
          <div class="ds-brand-header">
            <div class="ds-brand-info" (click)="navigateMobile('/tabs/beranda')">
              <div class="ds-logo-box">
                <img src="assets/logo.png" alt="Logo Tirta Tarum" class="ds-logo-img" />
              </div>
              <div class="ds-brand-titles">
                <h1 class="ds-app-name">Tirta Tarum</h1>
                <span class="ds-app-sub">BUKU TAMU & RAPAT</span>
              </div>
            </div>
            <button
              type="button"
              class="ds-hide-btn"
              (click)="closeMenu()"
              title="Tutup Menu"
            >
              <ion-icon name="close-outline"></ion-icon>
            </button>
          </div>

          <nav class="ds-nav-scroll">
            <button
              type="button"
              class="ds-nav-item"
              [class.active]="isActive('/tabs/beranda')"
              (click)="navigateMobile('/tabs/beranda')"
            >
              <ion-icon name="grid-outline"></ion-icon>
              <span>Beranda</span>
            </button>

            <button
              type="button"
              class="ds-nav-item"
              [class.active]="isActive('/tabs/tamu')"
              (click)="navigateMobile('/tabs/tamu')"
            >
              <ion-icon name="people-outline"></ion-icon>
              <span>Buku Tamu</span>
            </button>

            <button
              type="button"
              class="ds-nav-item"
              [class.active]="isActive('/tabs/rapat')"
              (click)="navigateMobile('/tabs/rapat')"
            >
              <ion-icon name="calendar-outline"></ion-icon>
              <span>Rapat & Ruangan</span>
            </button>

            <button
              type="button"
              class="ds-nav-item"
              [class.active]="isActive('/tabs/akun')"
              (click)="navigateMobile('/tabs/akun')"
            >
              <ion-icon name="person-circle-outline"></ion-icon>
              <span>Akun Saya</span>
            </button>

            <div class="ds-section-divider"></div>
            <div class="ds-section-label">
              {{ auth.isAdmin() ? 'PANEL KHUSUS ADMIN' : 'MENU & PENGATURAN' }}
            </div>

            @if (auth.canManageRooms()) {
              <button
                type="button"
                class="ds-nav-item"
                [class.active]="isActive('/ruangan')"
                (click)="navigateMobile('/ruangan')"
              >
                <ion-icon name="cube-outline"></ion-icon>
                <span>Kelola Ruang Rapat</span>
              </button>
            }

            @if (auth.canManageUsers()) {
              <button
                type="button"
                class="ds-nav-item"
                [class.active]="isActive('/pengguna')"
                (click)="navigateMobile('/pengguna')"
              >
                <ion-icon name="people-circle-outline"></ion-icon>
                <span>Kelola Pengguna</span>
              </button>
            }

            <button
              type="button"
              class="ds-nav-item"
              [class.active]="isActive('/profil')"
              (click)="navigateMobile('/profil')"
            >
              <ion-icon name="settings-outline"></ion-icon>
              <span>Edit Profil & Password</span>
            </button>
          </nav>

          <div class="ds-footer">
            <div class="ds-user-row" (click)="navigateMobile('/tabs/akun')">
              <div class="ds-user-avatar">{{ auth.user()?.name | initials }}</div>
              <div class="ds-user-meta">
                <h4 class="ds-user-name">{{ auth.user()?.name }}</h4>
                <span class="ds-user-role">{{ roleLabel() }}</span>
              </div>
            </div>

            <button type="button" class="ds-logout-btn" (click)="logout()">
              <ion-icon name="log-out-outline"></ion-icon>
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </ion-menu>

      <div class="app-layout-wrapper">
        @if (auth.user() && !isLoginPage()) {
          <aside class="desktop-sidebar" [class.collapsed]="auth.desktopSidebarHidden()">
            <div class="ds-inner">
              <div class="ds-brand-header">
                <div class="ds-brand-info" (click)="navigateDesktop('/tabs/beranda')">
                  <div class="ds-logo-box">
                    <img src="assets/logo.png" alt="Logo Tirta Tarum" class="ds-logo-img" />
                  </div>
                  <div class="ds-brand-titles">
                    <h1 class="ds-app-name">Tirta Tarum</h1>
                    <span class="ds-app-sub">BUKU TAMU & RAPAT</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="ds-hide-btn"
                  (click)="auth.toggleDesktopSidebar()"
                  title="Sembunyikan Sidebar"
                >
                  <ion-icon name="chevron-back-outline"></ion-icon>
                </button>
              </div>

              <nav class="ds-nav-scroll">
                <button
                  type="button"
                  class="ds-nav-item"
                  [class.active]="isActive('/tabs/beranda')"
                  (click)="navigateDesktop('/tabs/beranda')"
                >
                  <ion-icon name="grid-outline"></ion-icon>
                  <span>Beranda</span>
                </button>

                <button
                  type="button"
                  class="ds-nav-item"
                  [class.active]="isActive('/tabs/tamu')"
                  (click)="navigateDesktop('/tabs/tamu')"
                >
                  <ion-icon name="people-outline"></ion-icon>
                  <span>Buku Tamu</span>
                </button>

                <button
                  type="button"
                  class="ds-nav-item"
                  [class.active]="isActive('/tabs/rapat')"
                  (click)="navigateDesktop('/tabs/rapat')"
                >
                  <ion-icon name="calendar-outline"></ion-icon>
                  <span>Rapat & Ruangan</span>
                </button>

                <button
                  type="button"
                  class="ds-nav-item"
                  [class.active]="isActive('/tabs/akun')"
                  (click)="navigateDesktop('/tabs/akun')"
                >
                  <ion-icon name="person-circle-outline"></ion-icon>
                  <span>Akun Saya</span>
                </button>

                <div class="ds-section-divider"></div>
                <div class="ds-section-label">
                  {{ auth.isAdmin() ? 'PANEL KHUSUS ADMIN' : 'MENU & PENGATURAN' }}
                </div>

                @if (auth.canManageRooms()) {
                  <button
                    type="button"
                    class="ds-nav-item"
                    [class.active]="isActive('/ruangan')"
                    (click)="navigateDesktop('/ruangan')"
                  >
                    <ion-icon name="cube-outline"></ion-icon>
                    <span>Kelola Ruang Rapat</span>
                  </button>
                }

                @if (auth.canManageUsers()) {
                  <button
                    type="button"
                    class="ds-nav-item"
                    [class.active]="isActive('/pengguna')"
                    (click)="navigateDesktop('/pengguna')"
                  >
                    <ion-icon name="people-circle-outline"></ion-icon>
                    <span>Kelola Pengguna</span>
                  </button>
                }

                <button
                  type="button"
                  class="ds-nav-item"
                  [class.active]="isActive('/profil')"
                  (click)="navigateDesktop('/profil')"
                >
                  <ion-icon name="settings-outline"></ion-icon>
                  <span>Edit Profil & Password</span>
                </button>
              </nav>

              <div class="ds-footer">
                <div class="ds-user-row" (click)="navigateDesktop('/tabs/akun')">
                  <div class="ds-user-avatar">{{ auth.user()?.name | initials }}</div>
                  <div class="ds-user-meta">
                    <h4 class="ds-user-name">{{ auth.user()?.name }}</h4>
                    <span class="ds-user-role">{{ roleLabel() }}</span>
                  </div>
                </div>

                <button type="button" class="ds-logout-btn" (click)="logout()">
                  <ion-icon name="log-out-outline"></ion-icon>
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            </div>
          </aside>
        }

        <div class="app-main-stage">
          <ion-router-outlet id="main-content"></ion-router-outlet>
        </div>
      </div>
    </ion-app>
  `,
  styles: `
    ion-menu.mobile-admin-menu {
      --width: 275px;
      --max-width: 85vw;

      .mobile-drawer-inner {
        width: 100%;
        height: 100%;
        background: #fbfdf6;
      }
    }

    .desktop-sidebar {
      display: none;
    }

    .app-layout-wrapper {
      display: flex;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .app-main-stage {
      flex: 1;
      min-width: 0;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }

    .ds-inner {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      background: #fbfdf6;
      box-sizing: border-box;
    }

    .ds-brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 18px 16px 16px;
      background: linear-gradient(135deg, #e6f5e0 0%, #fdf6c6 100%);
      border-bottom: 2px solid #facc15;
    }

    .ds-brand-info {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      cursor: pointer;
    }

    .ds-logo-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid rgba(21, 128, 61, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 3px;
      box-shadow: 0 3px 10px rgba(20, 83, 45, 0.14);

      .ds-logo-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .ds-brand-titles {
      min-width: 0;
    }

    .ds-app-name {
      margin: 0;
      font-size: 15px;
      font-weight: 800;
      color: #14532d;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    .ds-app-sub {
      display: block;
      margin-top: 2px;
      font-size: 10px;
      font-weight: 700;
      color: #4d7c0f;
      letter-spacing: 0.9px;
    }

    .ds-hide-btn {
      width: 32px;
      height: 32px;
      border-radius: 9px;
      border: 1px solid #cfe5c6;
      background: #ffffff;
      color: #15803d;
      display: grid;
      place-items: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.18s ease;

      ion-icon {
        font-size: 17px;
      }

      &:hover {
        background: #fef9c3;
        border-color: #facc15;
        color: #14532d;
      }
    }

    .ds-nav-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .ds-section-divider {
      height: 1px;
      background: #e3eed9;
      margin: 10px 4px 8px;
    }

    .ds-section-label {
      padding: 2px 10px 4px;
      font-size: 10px;
      font-weight: 800;
      color: #8a9a8d;
      letter-spacing: 0.9px;
    }

    .ds-nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 12px;
      border: 1px solid transparent;
      border-radius: 11px;
      background: transparent;
      color: #3b4a40;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      text-align: left;
      cursor: pointer;
      transition: all 0.18s ease;

      ion-icon {
        font-size: 19px;
        color: #6b7c6f;
        flex-shrink: 0;
        transition: color 0.18s ease;
      }

      span {
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &:hover {
        background: #f1f8ea;
        color: #14231a;

        ion-icon {
          color: #15803d;
        }
      }

      &.active {
        background: linear-gradient(90deg, rgba(21, 128, 61, 0.14) 0%, rgba(250, 204, 21, 0.16) 100%);
        border-color: rgba(21, 128, 61, 0.2);
        border-left: 3.5px solid #eab308;
        color: #14532d;
        font-weight: 700;

        ion-icon {
          color: #15803d;
        }
      }
    }

    .ds-footer {
      padding: 12px 14px 14px;
      border-top: 1px solid #e3eed9;
      background: #f6fbf0;
    }

    .ds-user-row {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 4px 4px 10px;
      cursor: pointer;
    }

    .ds-user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #15803d 0%, #4d9a2a 100%);
      color: #ffffff;
      display: grid;
      place-items: center;
      font-size: 13px;
      font-weight: 800;
      flex-shrink: 0;
      box-shadow: 0 0 0 2px #facc15, 0 4px 10px rgba(21, 128, 61, 0.25);
    }

    .ds-user-meta {
      min-width: 0;
      flex: 1;
    }

    .ds-user-name {
      margin: 0;
      font-size: 13px;
      font-weight: 700;
      color: #14231a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ds-user-role {
      display: block;
      margin-top: 1px;
      font-size: 11px;
      font-weight: 500;
      color: #5b6b5f;
    }

    .ds-logout-btn {
      display: flex;
      align-items: center;
      gap: 9px;
      width: 100%;
      padding: 8px 10px;
      border: none;
      border-radius: 9px;
      background: transparent;
      color: #64748b;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;

      ion-icon {
        font-size: 17px;
      }

      &:hover {
        background: #fef2f2;
        color: #dc2626;
      }
    }

    @media (min-width: 768px) {
      ion-menu.mobile-admin-menu {
        display: none !important;
      }

      .desktop-sidebar {
        display: block;
        width: 250px;
        min-width: 250px;
        height: 100%;
        background: #ffffff;
        border-right: 1px solid var(--app-border, #e2e8f0);
        box-shadow: 4px 0 24px rgba(15, 23, 42, 0.03);
        z-index: 100;
        overflow: hidden;
        transition: width 0.16s cubic-bezier(0.4, 0, 0.2, 1),
                    min-width 0.16s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.16s ease;

        &.collapsed {
          width: 0;
          min-width: 0;
          border-right-color: transparent;
          box-shadow: none;
        }

        .ds-inner {
          width: 250px;
        }
      }
    }

    :host-context(html.is-desktop-device) {
      ion-menu.mobile-admin-menu {
        display: none !important;
      }

      .desktop-sidebar {
        display: block;
        width: 250px;
        min-width: 250px;
        height: 100%;
        background: #ffffff;
        border-right: 1px solid var(--app-border, #e2e8f0);
        box-shadow: 4px 0 24px rgba(15, 23, 42, 0.03);
        z-index: 100;
        overflow: hidden;
        transition: width 0.16s cubic-bezier(0.4, 0, 0.2, 1),
                    min-width 0.16s cubic-bezier(0.4, 0, 0.2, 1),
                    border-color 0.16s ease;

        &.collapsed {
          width: 0;
          min-width: 0;
          border-right-color: transparent;
          box-shadow: none;
        }

        .ds-inner {
          width: 250px;
        }
      }
    }
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private ui = inject(UiService);
  private router = inject(Router);
  private location = inject(Location);
  private menuCtrl = inject(MenuController);

  isLoginPage(): boolean {
    const url = this.location.path() || this.router.url;
    return url.includes('/login');
  }

  isActive(path: string): boolean {
    const url = this.location.path() || this.router.url;
    return url.includes(path);
  }

  roleLabel(): string {
    if (this.auth.isAdmin()) return 'Administrator';
    if (this.auth.isResepsionis()) return 'Resepsionis';
    if (this.auth.isSekretaris()) return 'Sekretaris';
    return 'Pengguna';
  }

  async closeMenu() {
    await this.menuCtrl.close('admin-menu');
  }

  async navigateMobile(path: string) {
    await this.menuCtrl.close('admin-menu');
    this.router.navigateByUrl(path);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-tab-select', { detail: path }));
    }
  }

  navigateDesktop(path: string) {
    this.router.navigateByUrl(path);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-tab-select', { detail: path }));
    }
  }

  async logout() {
    const ok = await this.ui.confirm('Keluar Akun', 'Yakin ingin keluar dari aplikasi?', 'Keluar');
    if (!ok) return;
    await this.menuCtrl.close('admin-menu');
    await this.auth.logout();
  }
}
