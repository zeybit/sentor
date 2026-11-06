import React from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { HairLook, MakeupLook, Piece } from '../content/looks';

/** Stilize portre: saç, göz farı, eyeliner, kaş, allık, ruj ve ışıltı öneriye göre çizilir. */
export function FaceArt({ m, h, size = 200, skin = '#E9C3A3', bg = '#F6F9FB' }: { m: MakeupLook; h: HairLook; size?: number; skin?: string; bg?: string }) {
  const hairBack = () => {
    const len = h.up !== 'none' ? 0 : [0, 0, 128, 150, 178][h.length];
    if (!len) return null;
    if (h.texture === 'curly') return <Path d={`M46 70 C26 120 34 ${len} 52 ${len + 6} C70 ${len + 14} 78 ${len - 6} 100 ${len + 4} C122 ${len - 6} 130 ${len + 14} 148 ${len + 6} C170 ${len} 174 120 154 70 Z`} fill={h.color} />;
    if (h.texture === 'wavy') return <Path d={`M46 70 C36 110 50 ${len - 30} 42 ${len} Q60 ${len + 10} 72 ${len - 4} L128 ${len - 4} Q140 ${len + 10} 158 ${len} C150 ${len - 30} 164 110 154 70 Z`} fill={h.color} />;
    return <Path d={`M48 70 L44 ${len} L156 ${len} L152 70 Z`} fill={h.color} />;
  };
  const eye = (cx: number, flip: 1 | -1) => (
    <G>
      <Ellipse cx={cx} cy={98} rx={13} ry={m.liner === 'smoky' ? 9 : 7} fill={m.shadow} opacity={m.liner === 'smoky' ? 0.85 : 0.6} />
      <Ellipse cx={cx} cy={101} rx={9} ry={4.2} fill="#FFFFFF" />
      <Circle cx={cx} cy={101} r={3} fill="#3A2A20" />
      {m.liner !== 'none' ? <Path d={`M${cx - 10} 99 Q${cx} 94 ${cx + 10} 99`} stroke="#1A1A1A" strokeWidth={m.liner === 'thin' ? 1.2 : 2} fill="none" /> : null}
      {m.liner === 'winged' || m.liner === 'graphic' ? <Path d={`M${cx + 10 * flip} 99 L${cx + (m.liner === 'graphic' ? 20 : 16) * flip} ${m.liner === 'graphic' ? 91 : 94}`} stroke="#1A1A1A" strokeWidth={2} /> : null}
      {m.liner === 'graphic' ? <Path d={`M${cx - 11} 92 Q${cx} 86 ${cx + 13 * flip} 90`} stroke={m.shadow} strokeWidth={1.6} fill="none" /> : null}
      <Path d={`M${cx - 12} ${m.brow === 'bold' ? 85 : 86} Q${cx} ${m.brow === 'bold' ? 79 : 81} ${cx + 12} 85`} stroke={h.color === '#C9A66B' || h.color === '#B8860B' ? '#7A5A3A' : '#3A2A20'} strokeWidth={m.brow === 'bold' ? 3.4 : m.brow === 'natural' ? 2.4 : 1.6} strokeLinecap="round" fill="none" />
    </G>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityLabel={`${m.name.tr}, ${h.name.tr}`}>
      <Defs>
        <RadialGradient id="blush" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor={m.blush} stopOpacity={0.75} /><Stop offset="1" stopColor={m.blush} stopOpacity={0} /></RadialGradient>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.85} /><Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={200} height={200} rx={18} fill={bg} />
      {hairBack()}
      <Path d="M86 140 L86 168 Q100 176 114 168 L114 140 Z" fill={skin} />
      <Path d="M58 188 Q100 160 142 188 L142 200 L58 200 Z" fill={skin} opacity={0.9} />
      <Ellipse cx={100} cy={102} rx={44} ry={54} fill={skin} />
      {/* ön saç */}
      {h.up !== 'none' ? <Path d="M56 94 C50 22 150 22 144 94 C134 68 66 68 56 94 Z" fill={h.color} /> : h.length === 1
        ? <Path d="M52 100 C44 18 156 18 148 100 C142 72 120 66 100 76 C84 66 62 72 52 100 Z" fill={h.color} />
        : h.bangs ? <Path d="M52 98 C44 18 156 18 148 98 C138 80 116 84 100 80 C84 84 62 80 52 98 Z" fill={h.color} />
          : <Path d="M52 104 C44 18 156 18 148 104 C138 66 112 60 100 66 C88 60 62 66 52 104 Z" fill={h.color} />}
      {h.up === 'bun' ? <Circle cx={100} cy={36} r={16} fill={h.color} /> : null}
      {h.up === 'ponytail' ? <Path d="M140 70 Q172 96 156 150 Q150 110 136 84 Z" fill={h.color} /> : null}
      {eye(82, -1)}{eye(118, 1)}
      <Ellipse cx={74} cy={120} rx={14} ry={9} fill="url(#blush)" />
      <Ellipse cx={126} cy={120} rx={14} ry={9} fill="url(#blush)" />
      {m.glow ? <><Ellipse cx={100} cy={112} rx={3} ry={9} fill="url(#glow)" /><Ellipse cx={70} cy={108} rx={8} ry={4} fill="url(#glow)" /><Ellipse cx={130} cy={108} rx={8} ry={4} fill="url(#glow)" /></> : null}
      {m.freckles ? [[88, 116], [94, 119], [106, 119], [112, 116], [91, 112], [109, 112]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={0.9} fill="#8A5A3A" opacity={0.7} />) : null}
      <Path d="M100 106 Q97 118 100 122 Q103 124 105 121" stroke="#B88A6A" strokeWidth={1.2} fill="none" />
      <Path d="M88 134 Q100 128 112 134 Q100 146 88 134 Z" fill={m.lip} />
      <Path d="M88 134 Q100 137 112 134" stroke="#5A2A2A" strokeWidth={0.8} fill="none" opacity={0.6} />
      {m.gloss ? <Ellipse cx={102} cy={139} rx={4} ry={1.4} fill="#FFFFFF" opacity={0.7} /> : null}
    </Svg>
  );
}

/** Basit çizgi kıyafet parçaları (64×64) */
export function PieceArt({ piece, color, size = 64, ink }: { piece: Piece; color: string; size?: number; ink: string }) {
  const s = { fill: color, stroke: ink, strokeWidth: 1.2, strokeLinejoin: 'round' as const };
  const shape = () => {
    switch (piece) {
      case 'blazer': return <><Path d="M18 14 L28 10 L32 22 L36 10 L46 14 L54 26 L50 54 L14 54 L10 26 Z" {...s} /><Path d="M28 10 L32 34 L36 10" fill="none" stroke={ink} strokeWidth={1} /><Circle cx={32} cy={40} r={1.5} fill={ink} /></>;
      case 'jacket': return <><Path d="M18 14 L28 10 L46 14 L54 30 L50 54 L14 54 L10 30 Z" {...s} /><Line x1={30} y1={12} x2={36} y2={54} stroke={ink} strokeWidth={1.4} /><Path d="M28 10 L22 24 L30 22" fill="none" stroke={ink} strokeWidth={1} /></>;
      case 'trench': return <><Path d="M20 8 L30 6 L34 6 L44 8 L52 24 L54 58 L10 58 L12 24 Z" {...s} /><Line x1={12} y1={34} x2={52} y2={34} stroke={ink} strokeWidth={2.2} /><Line x1={32} y1={8} x2={32} y2={58} stroke={ink} strokeWidth={0.8} /></>;
      case 'knit': return <><Path d="M20 12 Q32 18 44 12 L56 22 L52 32 L48 30 L48 54 L16 54 L16 30 L12 32 L8 22 Z" {...s} />{[20, 26, 32, 38, 44].map(x => <Line key={x} x1={x} y1={50} x2={x} y2={54} stroke={ink} strokeWidth={0.8} />)}</>;
      case 'tee': return <Path d="M22 12 Q32 18 42 12 L54 20 L50 28 L44 26 L44 54 L20 54 L20 26 L14 28 L10 20 Z" {...s} />;
      case 'shirt': return <><Path d="M22 10 L32 16 L42 10 L56 22 L50 32 L46 30 L46 56 L18 56 L18 30 L14 32 L8 22 Z" {...s} /><Path d="M22 10 L28 20 L32 16 L36 20 L42 10" fill="none" stroke={ink} strokeWidth={1} /><Line x1={32} y1={16} x2={32} y2={56} stroke={ink} strokeWidth={0.8} />{[26, 34, 42, 50].map(y => <Circle key={y} cx={34} cy={y} r={0.9} fill={ink} />)}</>;
      case 'blouse': return <><Path d="M22 12 Q32 22 42 12 L54 24 L48 32 L46 30 L46 54 L18 54 L18 30 L16 32 L10 24 Z" {...s} /><Path d="M26 14 Q32 26 38 14" fill="none" stroke={ink} strokeWidth={1} /></>;
      case 'dress': return <Path d="M24 8 L40 8 L42 22 L54 58 L10 58 L22 22 Z" {...s} />;
      case 'slip': return <><Path d="M24 14 L40 14 L42 24 L50 58 L14 58 L22 24 Z" {...s} /><Line x1={24} y1={14} x2={24} y2={6} stroke={ink} /><Line x1={40} y1={14} x2={40} y2={6} stroke={ink} /></>;
      case 'trousers': return <Path d="M20 8 L44 8 L52 58 L36 58 L32 26 L28 58 L12 58 Z" {...s} />;
      case 'jeans': return <><Path d="M20 8 L44 8 L48 58 L36 58 L32 24 L28 58 L16 58 Z" {...s} /><Line x1={20} y1={14} x2={44} y2={14} stroke={ink} strokeWidth={0.8} /></>;
      case 'skirt': return <Path d="M22 14 L42 14 L54 50 L10 50 Z" {...s} />;
      case 'sneakers': return <><Path d="M8 40 L26 36 L36 42 L56 44 Q58 52 54 52 L8 52 Z" {...s} /><Line x1={8} y1={48} x2={56} y2={48} stroke={ink} strokeWidth={1} /></>;
      case 'boots': return <Path d="M20 8 L34 8 L34 40 L54 44 Q56 54 52 54 L18 54 Z" {...s} />;
      case 'heels': return <><Path d="M10 46 Q20 30 34 40 L50 44 L52 48 L36 48 Z" {...s} /><Line x1={14} y1={46} x2={14} y2={56} stroke={ink} strokeWidth={2} /></>;
      case 'loafers': return <><Path d="M8 42 Q12 34 28 36 L54 42 Q58 50 52 50 L10 50 Z" {...s} /><Line x1={26} y1={40} x2={40} y2={42} stroke={ink} strokeWidth={1} /></>;
      case 'bag': return <><Path d="M14 26 L50 26 L46 54 L18 54 Z" {...s} /><Path d="M24 26 Q24 12 32 12 Q40 12 40 26" fill="none" stroke={ink} strokeWidth={1.6} /></>;
      case 'chain': return <>{Array.from({ length: 9 }).map((_, i) => { const a = Math.PI * (0.1 + (i / 8) * 0.8); return <Ellipse key={i} cx={32 + 22 * Math.cos(a)} cy={10 + 30 * Math.sin(a)} rx={4} ry={3} fill="none" stroke={color} strokeWidth={2.2} />; })}</>;
      case 'pearls': return <>{Array.from({ length: 13 }).map((_, i) => { const a = Math.PI * (0.05 + (i / 12) * 0.9); return <Circle key={i} cx={32 + 22 * Math.cos(a)} cy={10 + 32 * Math.sin(a)} r={3} fill={color} stroke={ink} strokeWidth={0.5} />; })}</>;
      case 'hoops': return <><Circle cx={20} cy={34} r={11} fill="none" stroke={color} strokeWidth={3} /><Circle cx={44} cy={34} r={11} fill="none" stroke={color} strokeWidth={3} /></>;
      case 'watch': return <><Rect x={26} y={6} width={12} height={52} rx={5} fill={color} stroke={ink} strokeWidth={1} /><Circle cx={32} cy={32} r={10} fill="#FFFFFF" stroke={ink} strokeWidth={1.4} /><Line x1={32} y1={32} x2={32} y2={25} stroke={ink} /><Line x1={32} y1={32} x2={37} y2={32} stroke={ink} /></>;
      case 'scarf': return <Path d="M14 14 Q32 26 50 14 L46 22 Q40 30 42 58 L34 58 L32 30 Q24 28 18 22 Z" {...s} />;
      case 'sunglasses': return <><Rect x={8} y={24} width={20} height={14} rx={6} {...s} /><Rect x={36} y={24} width={20} height={14} rx={6} {...s} /><Line x1={28} y1={28} x2={36} y2={28} stroke={ink} strokeWidth={1.6} /></>;
    }
  };
  return <Svg width={size} height={size} viewBox="0 0 64 64">{shape()}</Svg>;
}
