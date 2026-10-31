import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

const LIGHT = {
  bg: '#EEE8F5',        // lavanta sisi
  card: '#FBF9FE',
  ink: '#241B3A',       // mürekkep moru
  sub: '#6B6283',
  line: '#D9D0E6',
  rose: '#C2306A',      // Venüs gülü (vurgu)
  roseSoft: '#F6DCE7',
  gold: '#A9822A',
  fire: '#D2492A', earth: '#5E7D3A', air: '#3C7BB5', water: '#5A55B0',
  second: '#C2306A',    // çift çarkta ikinci harita
};
const DARK: typeof LIGHT = {
  bg: '#15111F',
  card: '#1F1A2D',
  ink: '#ECE6F7',
  sub: '#A69CBD',
  line: '#352E47',
  rose: '#F06A9C',
  roseSoft: '#3A2030',
  gold: '#D9B45A',
  fire: '#F07856', earth: '#93B86A', air: '#71A9DE', water: '#9C97EC',
  second: '#F06A9C',
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

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });
