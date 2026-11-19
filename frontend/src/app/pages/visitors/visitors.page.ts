import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { VISITOR_STATUS, Visitor, VisitorStatus } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { SHARED_PIPES, todayStr } from '../../shared/pipes';

@Component({
  selector: 'app-visitors',
  imports: [FormsModule, IonicModule, ...SHARED_PIPES],
  templateUrl: './visitors.page.html',
})
export class VisitorsPage {
  private api = inject(ApiService);
  private ui = inject(UiService);
  private menuCtrl = inject(MenuController);
  readonly auth = inject(AuthService);

  readonly statusMap = VISITOR_STATUS;
  readonly rawVisitors = signal<Visitor[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  private isFetching = false;

  readonly search = signal('');
  readonly statusFilter = signal('');
  form = this.emptyForm();

  readonly visitors = computed(() => {
    const q = this.search().toLowerCase().trim();
    const st = this.statusFilter();
    return this.rawVisitors().filter((v) => {
      const matchQ =
        !q ||
        v.visitor_name.toLowerCase().includes(q) ||
        (v.company?.toLowerCase().includes(q) ?? false) ||
        (v.visitor_phone?.toLowerCase().includes(q) ?? false) ||
        v.purpose.toLowerCase().includes(q) ||
        (v.host_name?.toLowerCase().includes(q) ?? false) ||
        (v.host?.name?.toLowerCase().includes(q) ?? false);
      const matchSt = !st || v.status === st;
      return matchQ && matchSt;
    });
  });

  openMenu() {
    if (this.auth.isDesktop || (typeof window !== 'undefined' && window.innerWidth >= 768)) {
      this.auth.toggleDesktopSidebar();
    } else {
      this.menuCtrl.toggle('admin-menu');
    }
  }

  emptyForm() {
    return {
      visitor_name: '',
      visitor_phone: '',
      company: '',
      host_name: '',
      visit_date: todayStr(),
      purpose: '',
      notes: '',
    };
  }

  async load(silent = false) {
    if (!this.auth.isLoggedIn) return;
    if (silent && this.modalOpen()) return;
    if (this.isFetching) return;
    this.isFetching = true;
    try {
      const res = await this.api.get<Visitor[]>('/visitors');
      this.rawVisitors.set(res.data);
    } catch (err) {
      if (!silent && this.auth.isLoggedIn) this.ui.error(err);
    } finally {
      this.isFetching = false;
    }
  }

  async refresh(ev: CustomEvent) {
    await this.load(false);
    (ev.target as HTMLIonRefresherElement).complete();
  }

  openForm(item?: Visitor) {
    if (item) {
      this.editingId.set(item.id);
      this.form = {
        visitor_name: item.visitor_name,
        visitor_phone: item.visitor_phone,
        company: item.company ?? '',
        host_name: item.host_name || item.host?.name || '',
        visit_date: item.visit_date,
        purpose: item.purpose,
        notes: item.notes ?? '',
      };
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
    }
    this.modalOpen.set(true);
  }

  async save() {
    try {
      const id = this.editingId();
      const res = id
        ? await this.api.put<Visitor>(`/visitors/${id}`, this.form)
        : await this.api.post<Visitor>('/visitors', this.form);
      this.ui.toast(res.message || 'Tersimpan', 'success');
      this.modalOpen.set(false);
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async setStatus(item: Visitor, status: VisitorStatus) {
    try {
      const res = await this.api.patch<Visitor>(`/visitors/${item.id}/status`, { status });
      this.ui.toast(res.message || 'Status diperbarui', 'success');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async remove(item: Visitor) {
    const ok = await this.ui.confirm('Hapus Data Tamu', `Hapus kunjungan atas nama "${item.visitor_name}"?`);
    if (!ok) return;

    try {
      const res = await this.api.delete(`/visitors/${item.id}`);
      this.ui.toast(res.message || 'Data dihapus', 'dark');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }
}
