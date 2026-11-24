import { Instant, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';

/** IANA saat diliminin verilen andaki UTC farkı (dakika) */
export function tzOffsetMinutes(tz: string, at: Date = new Date()): number {
  try { return ZoneId.of(tz).rules().offset(Instant.ofEpochMilli(at.getTime())).totalSeconds() / 60; } catch { return 0; }
}
const pad = (n: number) => String(n).padStart(2, '0');
export function fmtLocal(d: Date, tz: string, withTime = true): string {
  const x = new Date(d.getTime() + tzOffsetMinutes(tz, d) * 60000);
  return `${pad(x.getUTCDate())}.${pad(x.getUTCMonth() + 1)}.${x.getUTCFullYear()}${withTime ? ` ${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}` : ''}`;
}
export function fmtTime(d: Date, tz: string): string {
  const x = new Date(d.getTime() + tzOffsetMinutes(tz, d) * 60000);
  return `${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}`;
}

/**
 * Yazarken ayraçları kendisi ekler: 14032003 → 14.03.2003, 930 → 09:30. Kullanıcı ayraç yazarsa tek haneli parçayı sıfırla tamamlar (1.3.2003 → 01.03.2003, 9:30 → 09:30).
 * Silerken karışmaz: metin kısaldıysa olduğu gibi bırakır.
 */
function maskWith(next: string, prev: string, sizes: number[], seps: string[], maxFirst: number[] = []): string {
  if (next.length < prev.length) return next;
  const iso = next.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/); // yapıştırılan 2003-03-14
  if (iso && sizes[0] === 2) next = `${iso[3]}.${iso[2]}.${iso[1]}${iso[4]}`;
  const parts: string[] = [''];
  for (const ch of next) {
    let i = parts.length - 1;
    if (/\d/.test(ch)) {
      if (parts[i].length >= sizes[i]) { if (i + 1 >= sizes.length) break; parts.push(''); i++; }
      parts[i] += ch;
      if (sizes[i] === 2 && parts[i].length === 1 && maxFirst[i] != null && +ch > maxFirst[i]) parts[i] = '0' + ch; // 5 → 05
    } else if (parts[i].length && i + 1 < sizes.length) {
      if (sizes[i] === 2 && parts[i].length === 1) parts[i] = '0' + parts[i];
      if (parts[i].length === sizes[i]) parts.push('');
    }
  }
  let out = parts[0];
  for (let i = 1; i < parts.length; i++) out += seps[i - 1] + parts[i];
  const last = parts.length - 1;
  if (parts[last].length === sizes[last] && last + 1 < sizes.length) out += seps[last];
  return out;
}
export const maskDate = (v: string, prev = '') => maskWith(v, prev, [2, 2, 4], ['.', '.'], [3, 1]);
export const maskTime = (v: string, prev = '') => maskWith(v, prev, [2, 2], [':'], [2, 5]);
export const maskDateTime = (v: string, prev = '') => maskWith(v, prev, [2, 2, 4, 2, 2], ['.', '.', ' ', ':'], [3, 1, 9, 2, 5]);
