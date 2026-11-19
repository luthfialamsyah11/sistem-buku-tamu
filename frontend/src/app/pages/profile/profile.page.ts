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

  profile = { name: '', email: '', phone: '', department: '' };
  pwd = { current_password: '', new_password: '' };

  ngOnInit() {
    this.syncForm();
    this.auth.refreshUser().then(() => this.syncForm());
  }

  ionViewWillEnter() {
    this.syncForm();
    this.auth.refreshUser().then(() => this.syncForm());
  }

  private syncForm() {
    const u = this.auth.user();
    if (u) {
      this.profile = {
        name: u.name,
        email: u.email,
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
