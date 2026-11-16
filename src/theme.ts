import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// "Ebru": kitre suyunun krem zemini, is mürekkebi ve geleneksel ebru boyaları.
// Vurgu rengi kişinin haritasındaki baskın elementin boyasından gelir (setPigments).
/** Geleneksel ebru boyaları: [koyu ton, açık ton] — ateş, toprak, hava, su */
export const PIGMENTS_LIGHT: [string, string][] = [['#A8442C', '#DE7F5E'], ['#6C7433', '#C99A3E'], ['#2D4A8C', '#7598CC'], ['#1C6A5E', '#1F3260']];
export const PIGMENTS_DARK: [string, string][] = [['#F08A68', '#C9553A'], ['#B9C46A', '#E2B458'], ['#8FB2EA', '#4A6DB8'], ['#5BC2AE', '#3A5BA8']];
const LIGHT = {
  bg: '#F3EBDD',        // kitre kremi
  card: '#FBF6EC',      // opak kâğıt (açılır menüler)
  glass: 'rgba(251,246,236,0.82)', // kâğıt paneller
  ink: '#2A2119',       // is mürekkebi
  sub: '#6B5E50',
  line: '#E0D3BF',
  rose: '#2D4A8C',      // vurgu (kişiye göre değişir) — eski adı korunur
  roseSoft: 'rgba(45,74,140,0.10)',
  gold: '#A4640C',      // oker: Güneş, "şimdi"
  goldSoft: '#F3E2C0',
  onAccent: '#FFFFFF',
  danger: '#B3261E',
  fire: '#B5452B', earth: '#5F7A1F', air: '#2D5FA0', water: '#1C6A5E',
  second: '#A8442C',
  glow: 'rgba(42,33,25,0.16)',
};
const DARK: typeof LIGHT = {
  bg: '#16120E',
  card: '#221C16',
  glass: 'rgba(30,24,19,0.84)',
  ink: '#F2E9DA',
  sub: '#B5A792',
  line: 'rgba(242,233,218,0.14)',
  rose: '#8FB2EA',
  roseSoft: 'rgba(143,178,234,0.14)',
  gold: '#E8B45A',
  goldSoft: 'rgba(232,180,90,0.14)',
  onAccent: '#16120E',
  danger: '#FF8A80',
  fire: '#F08A68', earth: '#B9C46A', air: '#8FB2EA', water: '#5BC2AE',
  second: '#F08A68',
  glow: 'rgba(0,0,0,0.45)',
};

/** Etkin renkler. Tema değiştiğinde yerinde güncellenir ve uygulama yeniden çizilir. */
export const C = { ...LIGHT };
export const ELEMENT_COLOR = [C.fire, C.earth, C.air, C.water];
export let themeMode: ThemeMode = 'light';
export const isDark = () => themeMode === 'dark';
/** Kişinin element ağırlıkları (ateş, toprak, hava, su); ebru ve vurgu rengi buradan */
export let pigmentWeights: number[] = [1, 1, 1, 1];
const listeners: (() => void)[] = [];
export const onThemeChange = (f: () => void) => { listeners.push(f); };
const hexA = (h: string, a: number) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

function accent() {
  const lead = pigmentWeights.indexOf(Math.max(...pigmentWeights));
  const P = themeMode === 'dark' ? PIGMENTS_DARK : PIGMENTS_LIGHT;
  C.rose = P[lead][0]; C.roseSoft = hexA(P[lead][0], themeMode === 'dark' ? 0.16 : 0.10);
}
export function applyTheme(mode: ThemeMode) {
  themeMode = mode;
  Object.assign(C, mode === 'dark' ? DARK : LIGHT);
  accent();
  ELEMENT_COLOR.splice(0, 4, C.fire, C.earth, C.air, C.water);
  listeners.forEach(f => f());
}
/** Haritadan gelen element ağırlıklarıyla vurgu rengini ayarla */
export function setPigments(w: number[]) {
  if (w.join() === pigmentWeights.join()) return;
  pigmentWeights = w; accent(); listeners.forEach(f => f());
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
