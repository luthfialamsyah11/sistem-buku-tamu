import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertController, ToastController } from '@ionic/angular/lazy';

@Injectable({ providedIn: 'root' })
export class UiService {
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  async toast(message: string, color: 'success' | 'danger' | 'warning' | 'dark' = 'dark') {
    const icons = { success: 'checkmark-circle', danger: 'alert-circle', warning: 'warning', dark: 'information-circle' };
    const toast = await this.toastCtrl.create({
      message,
      color,
      icon: icons[color],
      duration: 2200,
      position: 'top',
      cssClass: 'app-toast',
    });
    await toast.present();
  }

  error(err: unknown) {
    const msg = this.errorMessage(err);
    if (!msg || msg.toLowerCase().includes('unauthenticated')) {
      return;
    }
    this.toast(msg, 'danger');
  }

  async confirm(header: string, message: string, okText = 'Hapus') {
    const alert = await this.alertCtrl.create({
      header,
      message,
      cssClass: 'app-alert',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        { text: okText, role: 'confirm', cssClass: 'alert-danger' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }

  private errorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Tidak dapat terhubung ke server';
      const errors = err.error?.errors as Record<string, string[]> | undefined;
      if (errors) return Object.values(errors)[0]?.[0] ?? 'Data tidak valid';
      const msg = err.error?.message;
      if (!msg || typeof msg !== 'string' || msg.toLowerCase().includes('unauthenticated')) {
        return '';
      }
      return msg;
    }
    return 'Terjadi kesalahan, coba lagi';
  }
}

