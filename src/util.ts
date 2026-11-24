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
function maskWith(next: string, prev: string, sizes: number[], seps: string[], maxFirst: number[] = [], range: ([number, number] | null)[] = []): string {
  if (next.length < prev.length) return next;
  const iso = next.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/); // yapıştırılan 2003-03-14
  if (iso && sizes[0] === 2) next = `${iso[3]}.${iso[2]}.${iso[1]}${iso[4]}`;
  const parts: string[] = [''];
  for (const ch of next) {
    let i = parts.length - 1;
    if (/\d/.test(ch)) {
      if (parts[i].length >= sizes[i]) { if (i + 1 >= sizes.length) break; parts.push(''); i++; }
      const r = range[i];
      if (r && parts[i].length + 1 === sizes[i] && (+(parts[i] + ch) > r[1] || +(parts[i] + ch) < r[0])) continue; // 32. gün, 13. ay, 25. saat yazılmaz
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
export const maskDate = (v: string, prev = '') => maskWith(v, prev, [2, 2, 4], ['.', '.'], [3, 1], [[1, 31], [1, 12]]);
export const maskTime = (v: string, prev = '') => maskWith(v, prev, [2, 2], [':'], [2, 5], [[0, 23], [0, 59]]);
export const maskDateTime = (v: string, prev = '') => maskWith(v, prev, [2, 2, 4, 2, 2], ['.', '.', ' ', ':'], [3, 1, 9, 2, 5], [[1, 31], [1, 12], null, [0, 23], [0, 59]]);

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Tarih takvimde var mı? Sorun yoksa (ya da henüz yazılıyorsa) boş metin, yoksa sade bir açıklama döner. */
export function dateProblem(v: string, lang: 'tr' | 'en' = 'tr', full = false): string {
  const t = v.trim();
  if (!t) return '';
  const m = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (!m) return full ? (lang === 'tr' ? 'Tarihi GG.AA.YYYY biçiminde tamamla (ör. 14.03.2003).' : 'Complete the date as DD.MM.YYYY (e.g. 14.03.2003).') : '';
  const d = +m[1], mo = +m[2], y = +m[3];
  if (mo < 1 || mo > 12) return lang === 'tr' ? 'Ay 01 ile 12 arasında olmalı.' : 'Month must be between 01 and 12.';
  if (y < 1800 || y > 2100) return lang === 'tr' ? 'Yıl 1800 ile 2100 arasında olmalı.' : 'Year must be between 1800 and 2100.';
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d < 1 || d > days) {
    const leap = mo === 2 && d === 29;
    return lang === 'tr'
      ? `${MONTHS_TR[mo - 1]} ${y} ${days} gün çekiyor${leap ? ' (artık yıl değil)' : ''}; ${String(d).padStart(2, '0')}.${String(mo).padStart(2, '0')}.${y} diye bir gün yok.`
      : `${MONTHS_EN[mo - 1]} ${y} has ${days} days${leap ? ' (not a leap year)' : ''}; that day does not exist.`;
  }
  return '';
}
export function timeProblem(v: string, lang: 'tr' | 'en' = 'tr', full = false): string {
  const t = v.trim();
  if (!t) return '';
  const m = t.match(/^(\d{1,2})[:.](\d{2})$/);
  if (!m) return full ? (lang === 'tr' ? 'Saati SS:DD biçiminde tamamla (ör. 09:30).' : 'Complete the time as HH:MM (e.g. 09:30).') : '';
  if (+m[1] > 23 || +m[2] > 59) return lang === 'tr' ? 'Saat 00:00 ile 23:59 arasında olmalı.' : 'Time must be between 00:00 and 23:59.';
  return '';
}
