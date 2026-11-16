// Sentor işareti: usturlap halkası (yavaşça döner) ve onu çapraz kesen Yay'ın oku.
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';
import { C, themeMode } from '../theme';

export default function Sigil({ size = 32 }: { size?: number }) {
  const tip = themeMode === 'dark' ? '#E8775A' : '#B5442A';
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180, long = i % 2 === 0;
    return <Line key={i} x1={50 + Math.cos(a) * (long ? 38 : 41)} y1={50 + Math.sin(a) * (long ? 38 : 41)} x2={50 + Math.cos(a) * 45} y2={50 + Math.sin(a) * 45} stroke={C.gold} strokeWidth={long ? 1.6 : 1} />;
  });
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }} {...({ dataSet: { spin: 'slow' } } as any)}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={46} stroke={C.gold} strokeWidth={2} fill="none" />
          <Circle cx={50} cy={50} r={33} stroke={C.gold} strokeOpacity={0.5} strokeWidth={1} fill="none" strokeDasharray="1.5 4" />
          <G>{ticks}</G>
        </Svg>
      </View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute', left: 0, top: 0 } as any}>
        {/* ok: sol alttan sağ üste */}
        <Line x1={22} y1={78} x2={74} y2={26} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        <Path d="M84 16 L62 22 L70 30 L78 38 Z" fill={tip} />
        {/* Yay sembolünün çapraz çizgisi */}
        <Line x1={34} y1={46} x2={54} y2={66} stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        {/* tüyler */}
        <Path d="M22 78 L14 76 L20 70 Z M22 78 L24 86 L30 80 Z" fill={C.gold} />
      </Svg>
    </View>
  );
}

/** Seçili menü öğesini gösteren küçük ok */
export function ArrowMark({ size = 14, color }: { size?: number; color?: string }) {
  const col = color ?? C.gold;
  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 20 12">
      <Line x1={1} y1={6} x2={14} y2={6} stroke={col} strokeWidth={1.6} />
      <Path d="M12 1 L19 6 L12 11 Z" fill={themeMode === 'dark' ? '#E8775A' : '#B5442A'} />
      <Path d="M1 6 L4 2 M1 6 L4 10" stroke={col} strokeWidth={1.2} />
    </Svg>
  );
}
