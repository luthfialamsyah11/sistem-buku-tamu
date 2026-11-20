import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Role, User } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { SHARED_PIPES } from '../../shared/pipes';

@Component({
  selector: 'app-users',
  imports: [FormsModule, IonicModule, ...SHARED_PIPES],
  templateUrl: './users.page.html',
})
export class UsersPage implements OnInit, OnDestroy, ViewWillEnter {
  private api = inject(ApiService);
  private ui = inject(UiService);
  readonly auth = inject(AuthService);

  readonly users = signal<User[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  search = '';
  form = this.emptyForm();
  private syncInterval: any = null;

  ngOnInit() {
    this.load();
    if (typeof window !== 'undefined') {
      this.syncInterval = setInterval(() => {
        if (!document.hidden && this.auth.isLoggedIn && !this.modalOpen()) {
          this.load(true);
        }
      }, 4000);
    }
  }

  ngOnDestroy() {
    clearInterval(this.syncInterval);
  }

  ionViewWillEnter() {
    this.load(true);
  }

  emptyForm() {
    return {
      nip: '',
      name: '',
      password: '',
      phone: '',
      department: '',
      role: 'resepsionis' as Role,
    };
  }

  onlyNumbers(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter'];
    if (allowed.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  sanitizeFormNip(event?: any) {
    const raw = event?.target?.value ?? this.form.nip ?? '';
    const clean = String(raw).replace(/\D/g, '').slice(0, 6);
    this.form.nip = clean;
    if (event?.target) {
      event.target.value = clean;
    }
  }

  async load(silent = false) {
    if (!this.auth.isLoggedIn) return;
    try {
      const res = await this.api.get<User[]>('/users', { search: this.search });
      this.users.set(res.data);
    } catch (err) {
      if (!silent && this.auth.isLoggedIn) this.ui.error(err);
    }
  }

  openForm(item?: User) {
    if (item) {
      this.editingId.set(item.id);
      this.form = {
        nip: item.nip,
        name: item.name,
        password: '',
        phone: item.phone ?? '',
        department: item.department ?? '',
        role: item.role,
      };
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
    }
    this.modalOpen.set(true);
  }

  async save() {
    this.sanitizeFormNip();
    if (!this.form.nip.trim() || this.form.nip.length > 6) {
      this.ui.toast('NIP wajib diisi (maks. 6 angka)', 'warning');
      return;
    }
    if (!this.form.name.trim()) {
      this.ui.toast('Nama pengguna wajib diisi', 'warning');
      return;
    }
    if (!this.editingId() && !this.form.password) {
      this.ui.toast('Password wajib diisi', 'warning');
      return;
    }

    try {
      const id = this.editingId();
      const res = id
        ? await this.api.put<User>(`/users/${id}`, this.form)
        : await this.api.post<User>('/users', this.form);
      if (id && id === this.auth.user()?.id && res.data) {
        this.auth.setUser(res.data);
      }
      this.ui.toast(res.message || 'Tersimpan', 'success');
      this.modalOpen.set(false);
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async remove(item: User) {
    const ok = await this.ui.confirm('Hapus User', `Hapus akun "${item.name}"?`);
    if (!ok) return;

    try {
      const res = await this.api.delete(`/users/${item.id}`);
      this.ui.toast(res.message || 'User dihapus', 'dark');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }
}
