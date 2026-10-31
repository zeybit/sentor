import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// "Siyanotip": eski gök fotoğraf plakalarının Prusya mavisi mürekkebi, serin kâğıt ve tek sıcak vurgu (kadife çiçeği).
const LIGHT = {
  bg: '#E8EEF2',        // serin kâğıt
  card: '#F6F9FB',      // kabarık yüzey
  ink: '#0F2A46',       // Prusya mürekkebi
  sub: '#4F6578',
  line: '#C8D5DF',
  rose: '#1E4F8A',      // vurgu (Prusya mavisi) — eski adı korunur
  roseSoft: '#D6E3EF',  // vurgu zemini
  gold: '#A86A12',      // kadife çiçeği (Güneş, "şimdi")
  goldSoft: '#F5E6C8',
  onAccent: '#FFFFFF',
  danger: '#B3261E',
  fire: '#C2410C', earth: '#4D7C0F', air: '#0369A1', water: '#5B4BB7',
  second: '#B4472F',    // ikinci harita (pas kırmızısı)
};
const DARK: typeof LIGHT = {
  bg: '#0B1A2B',
  card: '#10243A',
  ink: '#E3ECF3',
  sub: '#93A9BB',
  line: '#22405C',
  rose: '#8DBCEB',
  roseSoft: '#17334F',
  gold: '#F2B84B',
  goldSoft: '#3A2E14',
  onAccent: '#0B1A2B',
  danger: '#FF8A80',
  fire: '#F28A5B', earth: '#9BC26B', air: '#6CC0F0', water: '#A99BF5',
  second: '#F08F6F',
};

/** Etkin renkler. Tema değiştiğinde yerinde güncellenir ve uygulama yeniden çizilir. */
export const C = { ...LIGHT };
export const ELEMENT_COLOR = [C.fire, C.earth, C.air, C.water];
export let themeMode: ThemeMode = 'light';
const listeners: (() => void)[] = [];
export const onThemeChange = (f: () => void) => { listeners.push(f); };

export function applyTheme(mode: ThemeMode) {
  themeMode = mode;
  Object.assign(C, mode === 'dark' ? DARK : LIGHT);
  ELEMENT_COLOR.splice(0, 4, C.fire, C.earth, C.air, C.water);
  listeners.forEach(f => f());
}

// Yazı: EB Garamond (1600'lerin kitap harfi — Lilly'nin çağı) + Hanken Grotesk (arayüz ve metin)
const web = Platform.OS === 'web';
export const F = {
  serif: web ? '"EB Garamond", Georgia, serif' : 'EBGaramond_500Medium',
  serifBold: web ? '"EB Garamond", Georgia, serif' : 'EBGaramond_700Bold',
  serifItalic: web ? '"EB Garamond", Georgia, serif' : 'EBGaramond_400Regular_Italic',
  sans: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_400Regular',
  sansMed: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_500Medium',
  sansBold: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_700Bold',
};
export const serif = F.serif;
