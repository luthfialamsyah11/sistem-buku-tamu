import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular/lazy';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { User } from '../../core/models';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, IonicModule],
  templateUrl: './profile.page.html',
})
export class ProfilePage implements OnInit, ViewWillEnter {
  private api = inject(ApiService);
  private ui = inject(UiService);
  readonly auth = inject(AuthService);

  profile = { nip: '', name: '', phone: '', department: '' };
  pwd = { current_password: '', new_password: '' };

  ngOnInit() {
    this.syncForm();
    this.auth.refreshUser().then(() => this.syncForm());
  }

  ionViewWillEnter() {
    this.syncForm();
    this.auth.refreshUser().then(() => this.syncForm());
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

  sanitizeProfileNip(event?: any) {
    const raw = event?.target?.value ?? this.profile.nip ?? '';
    const clean = String(raw).replace(/\D/g, '').slice(0, 6);
    this.profile.nip = clean;
    if (event?.target) {
      event.target.value = clean;
    }
  }

  private syncForm() {
    const u = this.auth.user();
    if (u) {
      this.profile = {
        nip: u.nip ?? '',
        name: u.name,
        phone: u.phone ?? '',
        department: u.department ?? '',
      };
    }
  }

  async saveProfile() {
    try {
      const res = await this.api.put<User>('/profile', this.profile);
      this.auth.setUser(res.data);
      this.ui.toast(res.message || 'Profil diperbarui', 'success');
    } catch (err) {
      this.ui.error(err);
    }
  }

  async changePassword() {
    try {
      const res = await this.api.put('/profile/password', this.pwd);
      this.pwd = { current_password: '', new_password: '' };
      this.ui.toast(res.message || 'Password diganti', 'success');
    } catch (err) {
      this.ui.error(err);
    }
  }
}
