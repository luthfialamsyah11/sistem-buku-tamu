import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, MenuController } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { MEETING_STATUS, Meeting, MeetingStatus, Room } from '../../core/models';
import { UiService } from '../../core/ui.service';
import { SHARED_PIPES, todayStr } from '../../shared/pipes';

@Component({
  selector: 'app-meetings',
  imports: [FormsModule, IonicModule, ...SHARED_PIPES],
  templateUrl: './meetings.page.html',
  styles: `
    .filter-bar {
      display: flex;
      gap: 10px;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px 8px;
      align-items: center;
      box-sizing: border-box;

      @media (min-width: 768px) {
        padding: 0 32px 10px;
      }

      @media (min-width: 1024px) {
        padding: 0 40px 10px;
      }
    }

    .date-input {
      flex: 1;
      height: 38px;
      border-radius: 10px;
      border: 1px solid var(--app-border);
      background: var(--app-bg);
      padding: 0 12px;
      font-size: 13px;
      font-weight: 500;
      font-family: inherit;
      color: var(--ion-text-color);

      @media (min-width: 768px) {
        max-width: 280px;
        height: 40px;
        font-size: 14px;
      }
    }

    .room-schedule-count {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #15803d;
      background: #dcf3e0;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      margin-top: 4px;
    }
  `,
})
export class MeetingsPage {
  private api = inject(ApiService);
  private ui = inject(UiService);
  private menuCtrl = inject(MenuController);
  readonly auth = inject(AuthService);

  private isMeetingsLoading = false;
  private isRoomsLoading = false;
  private lastMeetingsLoadTime = 0;
  private lastRoomsLoadTime = 0;

  openMenu() {
    if (this.auth.isDesktop || (typeof window !== 'undefined' && window.innerWidth >= 768)) {
      this.auth.toggleDesktopSidebar();
    } else {
      this.menuCtrl.toggle('admin-menu');
    }
  }

  readonly statusMap = MEETING_STATUS;
  readonly activeSegment = signal<'meetings' | 'rooms'>('meetings');

  readonly rooms = signal<Room[]>([]);
  readonly roomModalOpen = signal(false);
  readonly editingRoomId = signal<number | null>(null);
  roomSearchInput = '';
  roomStatusFilterInput = '';
  readonly roomSearch = signal('');
  readonly roomStatusFilter = signal('');
  roomForm = this.emptyRoomForm();

  readonly rawMeetings = signal<Meeting[]>([]);
  readonly modalOpen = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly search = signal('');
  readonly dateFilter = signal('');
  readonly statusFilter = signal('');
  form = this.emptyForm();

  readonly meetings = computed(() => {
    const q = this.search().toLowerCase().trim();
    const d = this.dateFilter();
    const st = this.statusFilter();
    return this.rawMeetings().filter((m) => {
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        (m.description?.toLowerCase().includes(q) ?? false) ||
        (m.room?.room_name?.toLowerCase().includes(q) ?? false) ||
        (m.organizer?.name?.toLowerCase().includes(q) ?? false);
      const matchD = !d || m.meeting_date === d;
      const matchSt = !st || m.status === st;
      return matchQ && matchD && matchSt;
    });
  });

  readonly filteredRooms = computed(() => {
    const q = this.roomSearch().toLowerCase().trim();
    const st = this.roomStatusFilter();
    return this.rooms().filter((r) => {
      const matchQ =
        !q ||
        r.room_name.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        (r.facilities?.toLowerCase().includes(q) ?? false);
      const matchSt = !st || r.status === st;
      return matchQ && matchSt;
    });
  });

  emptyForm() {
    return {
      title: '',
      room_id: 1,
      meeting_date: todayStr(),
      start_time: '09:00',
      end_time: '10:30',
      description: '',
    };
  }

  emptyRoomForm() {
    return {
      room_name: '',
      location: '',
      facilities: '',
      status: 'available' as 'available' | 'maintenance',
    };
  }

  clearDate() {
    this.dateFilter.set('');
  }

  async load(silent = false) {
    if (!this.auth.isLoggedIn) return;
    if (silent && (this.modalOpen() || this.roomModalOpen())) return;
    if (this.isMeetingsLoading) return;
    this.isMeetingsLoading = true;
    try {
      const res = await this.api.get<Meeting[]>('/meetings');
      this.rawMeetings.set(res.data);
      if (this.rooms().length === 0) {
        this.loadRooms(true);
      }
    } catch (err) {
      if (!silent && this.auth.isLoggedIn) this.ui.error(err);
    } finally {
      this.isMeetingsLoading = false;
    }
  }

  async refresh(ev: CustomEvent) {
    if (this.activeSegment() === 'meetings') {
      await this.load(false);
    } else {
      await this.loadRooms(false);
    }
    (ev.target as HTMLIonRefresherElement).complete();
  }

  openForm(item?: Meeting) {
    if (item) {
      this.editingId.set(item.id);
      this.form = {
        title: item.title,
        room_id: item.room_id,
        meeting_date: item.meeting_date,
        start_time: item.start_time.substring(0, 5),
        end_time: item.end_time.substring(0, 5),
        description: item.description ?? '',
      };
    } else {
      this.editingId.set(null);
      this.form = this.emptyForm();
      const firstAvailable = this.rooms().find((r) => r.status === 'available') ?? this.rooms()[0];
      if (firstAvailable) {
        this.form.room_id = firstAvailable.id;
      }
    }
    this.modalOpen.set(true);
  }

  async save() {
    if (!this.form.title.trim()) {
      return this.ui.toast('Judul rapat wajib diisi', 'warning');
    }
    if (!this.form.room_id) {
      return this.ui.toast('Pilih ruang rapat terlebih dahulu', 'warning');
    }

    try {
      const id = this.editingId();
      const payload = { ...this.form, participant_count: 1 };
      const res = id
        ? await this.api.put<Meeting>(`/meetings/${id}`, payload)
        : await this.api.post<Meeting>('/meetings', payload);

      this.ui.toast(res.message || 'Jadwal berhasil disimpan', 'success');
      this.modalOpen.set(false);
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async setStatus(m: Meeting, status: MeetingStatus) {
    try {
      const res = await this.api.patch<Meeting>(`/meetings/${m.id}/status`, { status });
      this.ui.toast(res.message || 'Status diperbarui', 'success');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async remove(m: Meeting) {
    const ok = await this.ui.confirm('Hapus Rapat', `Hapus jadwal "${m.title}"?`);
    if (!ok) return;

    try {
      const res = await this.api.delete(`/meetings/${m.id}`);
      this.ui.toast(res.message || 'Jadwal dihapus', 'dark');
      this.load();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async loadRooms(silent = false) {
    if (!this.auth.isLoggedIn) return;
    if (this.isRoomsLoading) return;
    this.isRoomsLoading = true;
    try {
      const res = await this.api.get<Room[]>('/rooms');
      this.rooms.set(res.data);
    } catch {} finally {
      this.isRoomsLoading = false;
    }
  }

  openRoomForm(item?: Room) {
    if (item) {
      this.editingRoomId.set(item.id);
      this.roomForm = {
        room_name: item.room_name,
        location: item.location,
        facilities: item.facilities ?? '',
        status: item.status,
      };
    } else {
      this.editingRoomId.set(null);
      this.roomForm = this.emptyRoomForm();
    }
    this.roomModalOpen.set(true);
  }

  async saveRoom() {
    if (!this.roomForm.room_name.trim()) {
      return this.ui.toast('Nama ruangan wajib diisi', 'warning');
    }
    if (!this.roomForm.location.trim()) {
      return this.ui.toast('Lokasi ruangan wajib diisi', 'warning');
    }

    try {
      const id = this.editingRoomId();
      const res = id
        ? await this.api.put<Room>(`/rooms/${id}`, this.roomForm)
        : await this.api.post<Room>('/rooms', this.roomForm);

      this.ui.toast(res.message || 'Ruangan berhasil disimpan', 'success');
      this.roomModalOpen.set(false);
      await this.loadRooms();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async toggleRoomStatus(r: Room) {
    const newStatus = r.status === 'available' ? 'maintenance' : 'available';
    try {
      const res = await this.api.put<Room>(`/rooms/${r.id}`, {
        room_name: r.room_name,
        location: r.location,
        facilities: r.facilities,
        status: newStatus,
      });
      this.ui.toast(
        newStatus === 'available' ? `"${r.room_name}" sekarang Tersedia` : `"${r.room_name}" ditandai Perbaikan`,
        'success'
      );
      this.loadRooms();
    } catch (err) {
      this.ui.error(err);
    }
  }

  async removeRoom(r: Room) {
    const ok = await this.ui.confirm('Hapus Ruangan', `Hapus "${r.room_name}"?`);
    if (!ok) return;

    try {
      const res = await this.api.delete(`/rooms/${r.id}`);
      this.ui.toast(res.message || 'Ruangan berhasil dihapus', 'dark');
      await this.loadRooms();
    } catch (err) {
      this.ui.error(err);
    }
  }

  getTodayMeetingCount(roomId: number): number {
    const today = todayStr();
    return this.meetings().filter((m) => m.room_id === roomId && m.meeting_date === today).length;
  }
}
