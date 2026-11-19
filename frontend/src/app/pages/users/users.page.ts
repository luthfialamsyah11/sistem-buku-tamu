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
      name: '',
      email: '',
      password: '',
      phone: '',
      department: '',
      role: 'resepsionis' as Role,
    };
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
        name: item.name,
        email: item.email,
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
