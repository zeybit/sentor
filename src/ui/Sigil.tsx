// Marka işareti: yavaşça dönen burç halkası ve ortada parlayan dört köşeli yıldız.
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop } from 'react-native-svg';
import { C } from '../theme';

export default function Sigil({ size = 32 }: { size?: number }) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    return <Line key={i} x1={50 + Math.cos(a) * 40} y1={50 + Math.sin(a) * 40} x2={50 + Math.cos(a) * 47} y2={50 + Math.sin(a) * 47} stroke={C.rose} strokeWidth={2} strokeLinecap="round" />;
  });
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ position: 'absolute', inset: 0 } as any} {...({ dataSet: { spin: 'slow' } } as any)}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={47} stroke={C.rose} strokeOpacity={0.55} strokeWidth={1.5} fill="none" />
          <Circle cx={50} cy={50} r={40} stroke={C.rose} strokeOpacity={0.35} strokeWidth={1} fill="none" strokeDasharray="2 5" />
          <G>{ticks}</G>
          <Circle cx={50} cy={3} r={4} fill={C.gold} />
        </Svg>
      </View>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ position: 'absolute' } as any}>
        <Defs>
          <RadialGradient id="sg" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor={C.gold} stopOpacity={0.55} /><Stop offset="1" stopColor={C.gold} stopOpacity={0} /></RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={30} fill="url(#sg)" />
        <Path d="M50 22 C53 42 58 47 78 50 C58 53 53 58 50 78 C47 58 42 53 22 50 C42 47 47 42 50 22Z" fill={C.gold} />
      </Svg>
    </View>
  );
}
