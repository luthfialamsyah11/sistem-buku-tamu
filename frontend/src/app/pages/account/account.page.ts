import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule, MenuController, ViewWillEnter } from '@ionic/angular/lazy';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../core/ui.service';
import { SHARED_PIPES } from '../../shared/pipes';

@Component({
  selector: 'app-account',
  imports: [IonicModule, RouterLink, ...SHARED_PIPES],
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit, ViewWillEnter {
  private ui = inject(UiService);
  private menuCtrl = inject(MenuController);
  readonly auth = inject(AuthService);

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.auth.refreshUser();
  }

  openMenu() {
    if (this.auth.isDesktop || (typeof window !== 'undefined' && window.innerWidth >= 768)) {
      this.auth.toggleDesktopSidebar();
    } else {
      this.menuCtrl.toggle('admin-menu');
    }
  }

  async logout() {
    const ok = await this.ui.confirm('Keluar Akun', 'Yakin ingin keluar dari aplikasi?', 'Keluar');
    if (ok) this.auth.logout();
  }
}
