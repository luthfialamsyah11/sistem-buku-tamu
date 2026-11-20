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

  nip = '';
  password = '';
  loading = signal(false);
  showPassword = signal(false);

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
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

  onNipInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const clean = (target.value || '').replace(/\D/g, '').slice(0, 6);
    target.value = clean;
    this.nip = clean;
  }

  onNipPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    const target = event.target as HTMLInputElement;
    target.value = pasted;
    this.nip = pasted;
  }

  sanitizeNip() {
    this.nip = this.nip.replace(/\D/g, '').slice(0, 6);
  }

  async submit() {
    this.sanitizeNip();
    if (!this.nip || !this.password) {
      this.ui.toast('NIP dan password wajib diisi', 'warning');
      return;
    }

    if (this.nip.length > 6) {
      this.ui.toast('NIP maksimal 6 angka', 'warning');
      return;
    }

    this.loading.set(true);
    try {
      const user = await this.auth.login(this.nip.trim(), this.password);
      this.ui.toast(`Selamat datang, ${user.name}`, 'success');
      this.router.navigateByUrl('/tabs/beranda', { replaceUrl: true });
    } catch (err) {
      this.ui.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
