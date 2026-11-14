import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// "Gece göğü": derin çivit gece, lavanta ışığı ve yıldız altını. Açık tema: şafak vakti lavanta kâğıt.
const LIGHT = {
  bg: '#F2EEFA',        // şafak lavantası
  card: '#FBF9FF',      // opak yüzey (açılır menüler)
  glass: 'rgba(255,255,255,0.72)', // buzlu cam paneller
  ink: '#1E1747',       // gece mürekkebi
  sub: '#5E5784',
  line: '#DDD5F0',
  rose: '#5A3EC8',      // vurgu (ametist) — eski adı korunur
  roseSoft: '#E8E1FA',
  gold: '#A4640C',      // yıldız altını
  goldSoft: '#F7E9CC',
  onAccent: '#FFFFFF',
  danger: '#B3261E',
  fire: '#C2410C', earth: '#4D7C0F', air: '#0369A1', water: '#6D4FD8',
  second: '#B4472F',
  glow: 'rgba(90,62,200,0.18)',
};
const DARK: typeof LIGHT = {
  bg: '#0A0820',
  card: '#17133A',
  glass: 'rgba(30,24,72,0.62)',
  ink: '#EEEAFF',
  sub: '#A7A1CF',
  line: 'rgba(170,150,255,0.18)',
  rose: '#B9A6FF',
  roseSoft: 'rgba(150,125,255,0.16)',
  gold: '#F6C86E',
  goldSoft: 'rgba(246,200,110,0.14)',
  onAccent: '#0A0820',
  danger: '#FF8A80',
  fire: '#FF9A6B', earth: '#A6D477', air: '#73C8F5', water: '#B7A6FF',
  second: '#F59A7A',
  glow: 'rgba(185,166,255,0.35)',
};

/** Etkin renkler. Tema değiştiğinde yerinde güncellenir ve uygulama yeniden çizilir. */
export const C = { ...DARK };
export const ELEMENT_COLOR = [C.fire, C.earth, C.air, C.water];
export let themeMode: ThemeMode = 'dark';
export const isDark = () => themeMode === 'dark';
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
