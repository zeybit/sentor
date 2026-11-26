// lucide-react-native'in tamamı ~1.7 MB; yalnızca kullanılan simgeler (ISC lisanslı çizimler, lucide.dev)
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type LucideProps = { size?: number; color?: string; strokeWidth?: number; style?: any; className?: string };
export type LucideIcon = (p: LucideProps) => React.ReactElement;

const make = (paths: string[]): LucideIcon => function LucideGlyph({ size = 24, color, strokeWidth = 2, style }: LucideProps) {
  const c = color ?? (StyleSheet.flatten(style) as any)?.color ?? 'currentColor';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths.map(d => <Path key={d} d={d} />)}
    </Svg>
  );
};

export const Check = make(['M20 6 9 17l-5-5']);
export const ChevronDown = make(['m6 9 6 6 6-6']);
export const ChevronRight = make(['m9 18 6-6-6-6']);
export const ChevronUp = make(['m18 15-6-6-6 6']);
export const X = make(['M18 6 6 18', 'm6 6 12 12']);
export const ChevronDownIcon = ChevronDown;
export const ChevronUpIcon = ChevronUp;
