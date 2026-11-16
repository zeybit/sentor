// Marka işareti: taşlı ebru damlası. Halkaların renkleri kişinin element dengesinden gelir; yavaşça nefes alır.
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { C, PIGMENTS_DARK, PIGMENTS_LIGHT, pigmentWeights, themeMode } from '../theme';

export default function Sigil({ size = 32 }: { size?: number }) {
  const P = themeMode === 'dark' ? PIGMENTS_DARK : PIGMENTS_LIGHT;
  const order = [0, 1, 2, 3].sort((a, b) => pigmentWeights[b] - pigmentWeights[a]);
  const rings = [
    { r: 47, c: P[order[2]][1] }, { r: 40, c: C.bg }, { r: 36, c: P[order[1]][0] }, { r: 29, c: C.bg },
    { r: 25, c: P[order[0]][1] }, { r: 18, c: C.bg }, { r: 14, c: P[order[0]][0] },
  ];
  return (
    <View style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" {...({ dataSet: { breath: '1' } } as any)}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {rings.map((g, i) => <Circle key={i} cx={50} cy={50} r={g.r} fill={g.c} />)}
        {/* bizle çekilmiş tek bir lale kıvrımı */}
        <Path d="M50 6 C 56 26, 44 34, 50 50 C 56 66, 44 74, 50 94" stroke={C.bg} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.9} />
      </Svg>
    </View>
  );
}
