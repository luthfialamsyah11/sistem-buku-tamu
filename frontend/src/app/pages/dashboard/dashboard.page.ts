import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonicModule, MenuController } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MEETING_STATUS, VISITOR_STATUS } from '../../core/models';
import { SHARED_PIPES, greeting } from '../../shared/pipes';

@Component({
  selector: 'app-dashboard',
  imports: [IonicModule, RouterLink, ...SHARED_PIPES],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  private api = inject(ApiService);
  private menuCtrl = inject(MenuController);
  readonly auth = inject(AuthService);

  readonly sapaan = greeting();
  readonly visitorStatus = VISITOR_STATUS;
  readonly meetingStatus = MEETING_STATUS;
  readonly data = signal<any>(null);
  private isLoading = false;
  private lastLoadTime = 0;

  openMenu() {
    if (this.auth.isDesktop) {
      this.auth.toggleDesktopSidebar();
    } else {
      this.menuCtrl.toggle('admin-menu');
    }
  }

  ngOnInit() {
    this.load();
  }

  async load(force = false) {
    if (!this.auth.isLoggedIn) return;
    const now = Date.now();
    if (!force && (this.isLoading || (this.data() && now - this.lastLoadTime < 3000))) {
      return;
    }
    this.isLoading = true;
    try {
      const res = await this.api.get<any>('/dashboard');
      this.data.set(res.data);
      this.lastLoadTime = Date.now();
    } catch { } finally {
      this.isLoading = false;
    }
  }

  async refresh(ev: CustomEvent) {
    await this.load(true);
    (ev.target as HTMLIonRefresherElement).complete();
  }
}
