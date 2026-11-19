import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular/lazy';
import { AuthService } from '../../core/auth.service';
import { UiService } from '../../core/ui.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ui = inject(UiService);

  email = '';
  password = '';
  loading = signal(false);
  showPassword = signal(false);

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
  }

  async submit() {
    if (!this.email || !this.password) {
      this.ui.toast('Email dan password wajib diisi', 'warning');
      return;
    }

    this.loading.set(true);
    try {
      const user = await this.auth.login(this.email.trim(), this.password);
      this.ui.toast(`Selamat datang, ${user.name}`, 'success');
      this.router.navigateByUrl('/tabs/beranda', { replaceUrl: true });
    } catch (err) {
      this.ui.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
