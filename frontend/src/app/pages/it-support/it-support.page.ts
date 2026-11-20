import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController, ViewWillEnter } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { IT_SUPPORT_STATUS, ItSupport, ItSupportCategory, ItSupportStatus } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { SHARED_PIPES, todayStr } from '../../shared/pipes';

@Component({
  selector: 'app-it-support',
  imports: [FormsModule, IonicModule, ...SHARED_PIPES],
  templateUrl: './it-support.page.html',
  styleUrls: ['./it-support.page.scss'],
})
export class ItSupportPage implements OnInit, OnDestroy, ViewWillEnter {
  private api = inject(ApiService);
  private ui = inject(UiService);
  private menuCtrl = inject(MenuController);
  readonly auth = inject(AuthService);

  readonly statusMap = IT_SUPPORT_STATUS;
  readonly rawItems = signal<ItSupport[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly previewImage = signal<{ src: string; title: string } | null>(null);

  readonly search = signal('');
  readonly categoryFilter = signal<'all' | ItSupportCategory>('all');
  readonly statusFilter = signal<'all' | ItSupportStatus>('all');

  form = this.emptyForm();
  private isFetching = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  readonly isFilterActive = computed(() => {
    return !!this.search().trim() || this.categoryFilter() !== 'all' || this.statusFilter() !== 'all';
  });

  readonly stats = computed(() => {
    const all = this.rawItems();
    return {
      total: all.length,
      pending: all.filter((i) => i.status === 'pending').length,
      inProgress: all.filter((i) => i.status === 'in_progress').length,
      resolved: all.filter((i) => i.status === 'resolved').length,
      rejected: all.filter((i) => i.status === 'rejected').length,
    };
  });

  readonly items = computed(() => {
    const q = this.search().toLowerCase().trim();
    const cat = this.categoryFilter();
    const st = this.statusFilter();

    return this.rawItems().filter((item) => {
      const matchQ =
        !q ||
        item.reporter_name.toLowerCase().includes(q) ||
        item.reporter_phone.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.damage_type.toLowerCase().includes(q) ||
        item.complaint.toLowerCase().includes(q);
      const matchCat = cat === 'all' || item.category === cat;
      const matchSt = st === 'all' || item.status === st;
      return matchQ && matchCat && matchSt;
    });
  });

  ngOnInit() {
    this.load();
    if (typeof window !== 'undefined') {
      this.syncInterval = setInterval(() => {
        if (!document.hidden && this.auth.isLoggedIn && !this.modalOpen()) {
          this.load(true);
        }
      }, 10000);
    }
  }

  ngOnDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  ionViewWillEnter() {
    this.load(true);
  }

  openMenu() {
    if (this.auth.isDesktop) {
      this.auth.toggleDesktopSidebar();
    } else {
      this.menuCtrl.toggle('admin-menu');
    }
  }

  emptyForm() {
    return {
      reporter_name: '',
      reporter_phone: '',
      department: '',
      complaint: '',
      report_date: todayStr(),
      category: 'hardware' as ItSupportCategory,
      damage_type: '',
      photo_before: '' as string | null,
      photo_after: '' as string | null,
      status: 'pending' as ItSupportStatus,
    };
  }

  setStatusFilter(status: 'all' | ItSupportStatus) {
    if (this.statusFilter() === status && status !== 'all') {
      this.statusFilter.set('all');
    } else {
      this.statusFilter.set(status);
    }
  }

  setCategoryFilter(cat: 'all' | ItSupportCategory) {
    this.categoryFilter.set(cat);
  }

  resetFilters() {
    this.search.set('');
    this.categoryFilter.set('all');
    this.statusFilter.set('all');
  }

  async load(silent = false) {
    if (!this.auth.isLoggedIn) return;
    if (silent && this.modalOpen()) return;
    if (this.isFetching) return;
    this.isFetching = true;
    try {
      const res = await this.api.get<ItSupport[]>('/it-supports');
      this.rawItems.set(res.data || []);
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

  openForm(item?: ItSupport) {
    if (item) {
      this.editingId.set(item.id);
      this.form = {
        reporter_name: item.reporter_name,
        reporter_phone: item.reporter_phone,
        department: item.department,
        complaint: item.complaint,
        report_date: item.report_date,
        category: item.category,
        damage_type: item.damage_type,
        photo_before: item.photo_before ?? null,
        photo_after: item.photo_after ?? null,
        status: item.status,
      };
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
    }
    this.modalOpen.set(true);
  }

  async onPhotoSelected(event: Event, target: 'before' | 'after') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.ui.toast('File harus berupa gambar', 'warning');
      return;
    }

    try {
      const compressed = await this.compressImage(file);
      if (target === 'before') {
        this.form.photo_before = compressed;
      } else {
        this.form.photo_after = compressed;
      }
    } catch {
      this.ui.toast('Gagal membaca gambar', 'danger');
    }
  }

  removePhoto(target: 'before' | 'after') {
    if (target === 'before') {
      this.form.photo_before = null;
    } else {
      this.form.photo_after = null;
    }
  }

  openPreview(src: string | null | undefined, title: string) {
    if (!src) return;
    this.previewImage.set({ src, title });
  }

  async save() {
    if (!this.form.reporter_name.trim()) {
      this.ui.toast('Nama pelapor wajib diisi', 'warning');
      return;
    }
    if (!this.form.reporter_phone.trim()) {
      this.ui.toast('Nomor telepon wajib diisi', 'warning');
      return;
    }
    if (!this.form.department.trim()) {
      this.ui.toast('Departemen wajib diisi', 'warning');
      return;
    }
    if (!this.form.damage_type.trim()) {
      this.ui.toast('Jenis kerusakan wajib diisi', 'warning');
      return;
    }
    if (!this.form.complaint.trim()) {
      this.ui.toast('Detail keluhan wajib diisi', 'warning');
      return;
    }

    try {
      const id = this.editingId();
      const payload = {
        ...this.form,
        reporter_name: this.form.reporter_name.trim(),
        reporter_phone: this.form.reporter_phone.trim(),
        department: this.form.department.trim(),
        damage_type: this.form.damage_type.trim(),
        complaint: this.form.complaint.trim(),
        photo_before: this.form.photo_before || null,
        photo_after: this.form.photo_after || null,
      };

      const res = id
        ? await this.api.put<ItSupport>(`/it-supports/${id}`, payload)
        : await this.api.post<ItSupport>('/it-supports', payload);

      this.ui.toast(res.message || 'Tersimpan', 'success');
      this.modalOpen.set(false);
      await this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async setStatus(item: ItSupport, status: ItSupportStatus) {
    try {
      const res = await this.api.patch<ItSupport>(`/it-supports/${item.id}/status`, { status });
      this.ui.toast(res.message || 'Status diperbarui', 'success');
      await this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async remove(item: ItSupport) {
    const ok = await this.ui.confirm(
      'Hapus Komplain IT',
      `Hapus data komplain "${item.reporter_name}" (${item.damage_type})?`,
    );
    if (!ok) return;

    try {
      const res = await this.api.delete(`/it-supports/${item.id}`);
      this.ui.toast(res.message || 'Data dihapus', 'dark');
      await this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File read error'));
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onerror = () => resolve(dataUrl);
        img.onload = () => {
          const maxDim = 1000;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }
}
