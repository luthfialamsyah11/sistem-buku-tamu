import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Room } from '../../core/models';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-rooms',
  imports: [FormsModule, IonicModule],
  templateUrl: './rooms.page.html',
})
export class RoomsPage implements OnInit, OnDestroy, ViewWillEnter {
  private api = inject(ApiService);
  private ui = inject(UiService);
  readonly auth = inject(AuthService);

  readonly rooms = signal<Room[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);

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
      room_name: '',
      location: '',
      facilities: '',
      status: 'available' as 'available' | 'maintenance',
    };
  }

  async load(silent = false) {
    if (!this.auth.isLoggedIn) return;
    try {
      const res = await this.api.get<Room[]>('/rooms');
      this.rooms.set(res.data);
    } catch (err) {
      if (!silent && this.auth.isLoggedIn) this.ui.error(err);
    }
  }

  openForm(item?: Room) {
    if (item) {
      this.editingId.set(item.id);
      this.form = {
        room_name: item.room_name,
        location: item.location,
        facilities: item.facilities ?? '',
        status: item.status,
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
        ? await this.api.put<Room>(`/rooms/${id}`, this.form)
        : await this.api.post<Room>('/rooms', this.form);
      this.ui.toast(res.message || 'Tersimpan', 'success');
      this.modalOpen.set(false);
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async remove(item: Room) {
    const ok = await this.ui.confirm('Hapus Ruangan', `Hapus "${item.room_name}"?`);
    if (!ok) return;

    try {
      const res = await this.api.delete(`/rooms/${item.id}`);
      this.ui.toast(res.message || 'Dihapus', 'dark');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }
}
