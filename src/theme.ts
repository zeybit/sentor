import { Platform } from 'react-native';

export const C = {
  bg: '#EEE8F5',        // lavanta sisi
  card: '#FBF9FE',
  ink: '#241B3A',       // mürekkep moru
  sub: '#6B6283',
  line: '#D9D0E6',
  rose: '#C2306A',      // Venüs gülü (vurgu)
  roseSoft: '#F6DCE7',
  gold: '#A9822A',
  fire: '#D2492A', earth: '#5E7D3A', air: '#3C7BB5', water: '#5A55B0',
};

export const ELEMENT_COLOR = [C.fire, C.earth, C.air, C.water];

export const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });
