import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

// "Rasathane" (Sentor): Okçunun gözlemevi. Obsidyen gece, pirinç usturlap, bakır pası (verdigris) ve kor kırmızısı ok ucu.
// Açık tema: eski gök atlaslarının parşömeni ve demir mürekkebi.
const LIGHT = {
  bg: '#ECE3CE',        // parşömen
  card: '#F7F0E0',      // opak yüzey (açılır menüler)
  glass: 'rgba(247,240,224,0.88)',
  ink: '#1C1813',       // demir mürekkebi
  sub: '#5E5646',
  line: 'rgba(110,82,34,0.28)',
  rose: '#1E6B5F',      // vurgu: bakır pası — eski adı korunur
  roseSoft: 'rgba(30,107,95,0.10)',
  gold: '#8A6216',      // pirinç
  goldSoft: 'rgba(138,98,22,0.12)',
  onAccent: '#F7F0E0',
  danger: '#B3261E',
  fire: '#B5442A', earth: '#5A781D', air: '#2D6B94', water: '#4D58AD',
  second: '#B5442A',
  glow: 'rgba(138,98,22,0.28)',
};
const DARK: typeof LIGHT = {
  bg: '#06080A',
  card: '#10171A',
  glass: 'rgba(12,18,21,0.82)',
  ink: '#EFE8D8',
  sub: '#9CA59D',
  line: 'rgba(217,180,102,0.20)',
  rose: '#78C2B0',
  roseSoft: 'rgba(120,194,176,0.12)',
  gold: '#DBB668',
  goldSoft: 'rgba(219,182,104,0.12)',
  onAccent: '#06080A',
  danger: '#FF8A80',
  fire: '#E8775A', earth: '#A9C270', air: '#88BFE2', water: '#9DA6F2',
  second: '#E8775A',
  glow: 'rgba(219,182,104,0.40)',
};

/** Etkin renkler. Tema değiştiğinde yerinde güncellenir ve uygulama yeniden çizilir. */
export const C = { ...DARK };
export const ELEMENT_COLOR = [C.fire, C.earth, C.air, C.water];
export let themeMode: ThemeMode = 'dark';
export const isDark = () => themeMode === 'dark';
/** Kişinin element ağırlıkları (ateş, toprak, hava, su); ebru ve vurgu rengi buradan */
export let pigmentWeights: number[] = [1, 1, 1, 1];
const listeners: (() => void)[] = [];
export const onThemeChange = (f: () => void) => { listeners.push(f); };
const hexA = (h: string, a: number) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

function accent() { /* Rasathane: vurgu sabit (bakır pası); element ağırlıkları yalnızca bilgi için tutulur */ }
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

// Yazı: Fraunces (gök atlası başlıkları) + Hanken Grotesk (metin) + IBM Plex Mono (alet okumaları: derece, etiket)
const web = Platform.OS === 'web';
export const F = {
  serif: web ? '"Fraunces", Georgia, serif' : 'Fraunces_400Regular',
  serifBold: web ? '"Fraunces", Georgia, serif' : 'Fraunces_600SemiBold',
  serifItalic: web ? '"Fraunces", Georgia, serif' : 'Fraunces_400Regular_Italic',
  mono: web ? '"IBM Plex Mono", ui-monospace, Menlo, monospace' : 'IBMPlexMono_500Medium',
  sans: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_400Regular',
  sansMed: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_500Medium',
  sansBold: web ? '"Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif' : 'HankenGrotesk_700Bold',
};
export const serif = F.serif;
