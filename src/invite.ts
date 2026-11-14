// Uyum daveti: kişinin doğum bilgisi bağlantının # kısmında taşınır (sunucuya gitmez).
import { Platform } from 'react-native';
import type { Profile } from './store';

type P = Omit<Profile, 'id'>;
/** Uygulamanın herkese açık adresi; boşsa sayfanın kendi adresi kullanılır */
export const APP_URL = '';

const b64 = (s: string) => (globalThis as any).btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape((globalThis as any).atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeInvite(p: P): string {
  const b = p.birth;
  return b64(JSON.stringify({ n: p.name, p: p.place, g: p.gender, b: [b.year, b.month, b.day, b.hour, b.minute, b.timeKnown ? 1 : 0, +b.lat.toFixed(4), +b.lon.toFixed(4), b.tz] }));
}
export function decodeInvite(code: string): P | null {
  try {
    const d = JSON.parse(unb64(code));
    const [year, month, day, hour, minute, tk, lat, lon, tz] = d.b;
    if (![year, month, day, hour, minute, lat, lon].every((x: any) => typeof x === 'number') || typeof tz !== 'string') return null;
    return { name: String(d.n ?? '').slice(0, 40), place: String(d.p ?? '').slice(0, 80), gender: d.g === 'f' || d.g === 'm' ? d.g : undefined, birth: { year, month, day, hour, minute, timeKnown: !!tk, lat, lon, tz } };
  } catch { return null; }
}
export function inviteLink(p: P): string {
  const g = globalThis as any;
  const base = APP_URL || (Platform.OS === 'web' && g.location ? g.location.origin + g.location.pathname : '');
  return `${base}#uyum=${encodeInvite(p)}`;
}
/** Açılışta adres çubuğundaki daveti okur ve adresi temizler */
export function readInviteFromUrl(): P | null {
  if (Platform.OS !== 'web') return null;
  const g = globalThis as any;
  const m = String(g.location?.hash ?? '').match(/uyum=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try { g.history?.replaceState(null, '', g.location.pathname + g.location.search); } catch { /* yok say */ }
  return decodeInvite(m[1]);
}
export const sameBirth = (a: P, b: P) => (['year', 'month', 'day', 'hour', 'minute'] as const).every(k => a.birth[k] === b.birth[k]) && Math.abs(a.birth.lat - b.birth.lat) < 0.05;

/** Paylaşım: önce sistemin paylaş menüsü, olmazsa panoya kopyala */
export async function shareLink(url: string, text: string): Promise<'shared' | 'copied' | 'failed'> {
  const n = (globalThis as any).navigator;
  try { if (n?.share) { await n.share({ title: 'Gökyüzü Haritam', text, url }); return 'shared'; } } catch (e: any) { if (e?.name === 'AbortError') return 'failed'; }
  try { await n.clipboard.writeText(`${text} ${url}`); return 'copied'; } catch { return 'failed'; }
}
