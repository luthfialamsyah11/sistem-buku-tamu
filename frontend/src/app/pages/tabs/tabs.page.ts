import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/auth.service';
import { DashboardPage } from '../dashboard/dashboard.page';
import { VisitorsPage } from '../visitors/visitors.page';
import { MeetingsPage } from '../meetings/meetings.page';
import { AccountPage } from '../account/account.page';

@Component({
  selector: 'app-tabs',
  imports: [IonicModule, DashboardPage, VisitorsPage, MeetingsPage, AccountPage],
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {
  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dashboardPage') dashboardPage?: DashboardPage;
  @ViewChild('visitorsPage') visitorsPage?: VisitorsPage;
  @ViewChild('meetingsPage') meetingsPage?: MeetingsPage;
  @ViewChild('accountPage') accountPage?: AccountPage;

  private router = inject(Router);
  private location = inject(Location);
  readonly auth = inject(AuthService);

  readonly tabs = ['beranda', 'tamu', 'rapat', 'akun'];
  readonly activeTab = signal(0);
  private isProgrammaticScroll = false;
  private isResizing = false;
  private resizeDebounceTimer: any = null;
  private scrollTimeout: any = null;
  private syncInterval: any = null;

  private isPointerDown = false;
  private startX = 0;
  private scrollLeftStart = 0;
  private resizeObserver?: ResizeObserver;

  private readonly onFocusSync = () => {
    if (!document.hidden && this.auth.isLoggedIn) {
      this.triggerTabRefresh(this.activeTab(), true);
    }
  };

  private readonly onResizeSync = () => {
    const el = this.viewportRef?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    if (typeof window !== 'undefined' && this.auth.isDesktop) {
      el.scrollLeft = 0;
      return;
    }
    this.isProgrammaticScroll = true;
    this.isResizing = true;
    el.scrollLeft = this.activeTab() * el.clientWidth;

    clearTimeout(this.resizeDebounceTimer);
    this.resizeDebounceTimer = setTimeout(() => {
      if (el && el.clientWidth > 0) {
        el.scrollLeft = this.activeTab() * el.clientWidth;
      }
      this.isProgrammaticScroll = false;
      this.isResizing = false;
    }, 150);
  };

  private readonly onTabSelectEvent = (e: Event) => {
    const customEvent = e as CustomEvent<string>;
    if (customEvent.detail) {
      this.syncFromUrl(customEvent.detail);
    }
  };

  ngOnInit() {
    this.syncFromUrl(this.location.path() || this.router.url);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.syncFromUrl(e.urlAfterRedirects);
      });

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', this.onFocusSync);
      window.addEventListener('resize', this.onResizeSync, { passive: true });
      window.addEventListener('app-tab-select', this.onTabSelectEvent);
      document.addEventListener('visibilitychange', this.onFocusSync);

      if (typeof ResizeObserver !== 'undefined' && this.viewportRef?.nativeElement) {
        this.resizeObserver = new ResizeObserver(() => this.onResizeSync());
        this.resizeObserver.observe(this.viewportRef.nativeElement);
      }

      this.syncInterval = setInterval(() => {
        if (!document.hidden && this.auth.isLoggedIn) {
          this.triggerTabRefresh(this.activeTab(), true);
        }
      }, 20000);
    }
  }

  ngOnDestroy() {
    clearTimeout(this.scrollTimeout);
    clearTimeout(this.resizeDebounceTimer);
    clearInterval(this.syncInterval);
    this.resizeObserver?.disconnect();
    if (typeof window !== 'undefined') {
      window.removeEventListener('focus', this.onFocusSync);
      window.removeEventListener('resize', this.onResizeSync);
      window.removeEventListener('app-tab-select', this.onTabSelectEvent);
      document.removeEventListener('visibilitychange', this.onFocusSync);
    }
  }

  selectTab(index: number, smooth = true) {
    if (index < 0 || index >= this.tabs.length) return;
    this.activeTab.set(index);

    const isDesktop = typeof window !== 'undefined' && this.auth.isDesktop;

    const el = this.viewportRef?.nativeElement;
    if (el && !isDesktop) {
      this.isProgrammaticScroll = true;
      const targetLeft = index * el.clientWidth;
      if (smooth) {
        el.scrollTo({ left: targetLeft, behavior: 'smooth' });
      } else {
        el.scrollLeft = targetLeft;
      }
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isProgrammaticScroll = false;
      }, smooth ? 300 : 20);
    } else if (el && isDesktop) {
      el.scrollLeft = 0;
    }

    this.location.replaceState(`/tabs/${this.tabs[index]}`);
    this.triggerTabRefresh(index, true);
  }

  onScroll() {
    if (typeof window !== 'undefined' && this.auth.isDesktop) return;
    if (this.isProgrammaticScroll || this.isResizing || this.isPointerDown) return;

    const el = this.viewportRef?.nativeElement;
    if (!el || el.clientWidth === 0) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== this.activeTab() && index >= 0 && index < this.tabs.length) {
      this.activeTab.set(index);
      this.location.replaceState(`/tabs/${this.tabs[index]}`);
      this.triggerTabRefresh(index, true);
    }
  }

  onPointerDown(e: PointerEvent) {
    if (typeof window !== 'undefined' && this.auth.isDesktop) return;
    if (e.pointerType !== 'mouse') return;
    const el = this.viewportRef.nativeElement;
    this.isPointerDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeftStart = el.scrollLeft;
  }

  onPointerMove(e: PointerEvent) {
    if (!this.isPointerDown) return;
    const el = this.viewportRef.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 1.3;
    el.scrollLeft = this.scrollLeftStart - walk;
  }

  onPointerUp() {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    const el = this.viewportRef.nativeElement;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    this.selectTab(index, true);
  }

  private syncFromUrl(url: string) {
    const matched = this.tabs.findIndex((t) => url.includes(`/tabs/${t}`));
    if (matched < 0) return;
    this.selectTab(matched, false);
  }

  private triggerTabRefresh(index: number, silent = false) {
    if (index === 0) this.dashboardPage?.load();
    if (index === 1) this.visitorsPage?.load(silent);
    if (index === 2) this.meetingsPage?.load(silent);
    if (index === 3) this.accountPage?.load();
  }
}
