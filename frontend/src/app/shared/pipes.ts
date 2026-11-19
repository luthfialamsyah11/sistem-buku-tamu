import { Pipe, PipeTransform } from '@angular/core';

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr() {
  return toDateStr(new Date());
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

@Pipe({ name: 'initials' })
export class InitialsPipe implements PipeTransform {
  transform(name?: string | null) {
    if (!name) return '?';
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    if (!clean) return '?';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }
}

@Pipe({ name: 'tanggal' })
export class TanggalPipe implements PipeTransform {
  transform(value?: string | null, style: 'short' | 'long' = 'short') {
    if (!value) return '-';
    const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value.replace(' ', 'T'));
    return date.toLocaleDateString(
      'id-ID',
      style === 'long'
        ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
        : { day: 'numeric', month: 'short', year: 'numeric' },
    );
  }
}

@Pipe({ name: 'jam' })
export class JamPipe implements PipeTransform {
  transform(value?: string | null) {
    if (!value) return '-';
    return value.length > 8 ? value.substring(11, 16) : value.substring(0, 5);
  }
}

export const SHARED_PIPES = [InitialsPipe, TanggalPipe, JamPipe];
