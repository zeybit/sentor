import React from 'react';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_GLYPHS, BODIES, ASPECT_INFO } from '../content/base';
import { C, ELEMENT_COLOR } from '../theme';
import type { CrossAspect } from '../engine/techniques';

const MAIN: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'lilith'];
const AST: BodyId[] = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];
const PLANET_SET: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];

function spread(items: { id: BodyId; lon: number }[], gap: number) {
  const placed = items.map(x => ({ ...x, d: x.lon })).sort((a, b) => a.lon - b.lon);
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < placed.length; i++) {
      const a = placed[i], b = placed[(i + 1) % placed.length];
      const g = ((b.d - a.d) + 360) % 360;
      if (g < gap && placed.length > 1) { a.d -= (gap - g) / 2; b.d += (gap - g) / 2; }
    }
  }
  return placed;
}

export default function Wheel({ chart, outer, cross, size = 320, asteroids = true }: { chart: Chart; outer?: Chart | null; cross?: CrossAspect[]; size?: number; asteroids?: boolean }) {
  const cx = size / 2, cy = size / 2;
  const R = size / 2 - 2, rSign = R - 26;
  const bi = !!outer;
  const rOuter = rSign - 14;            // dış haritanın gezegenleri
  const rRing = bi ? rSign - 28 : rSign;  // natal gezegen halkasının dış sınırı
  const rPlanet = rRing - 18, rAsp = rRing - 38;
  const base = chart.asc ?? 0;
  const pt = (lon: number, r: number) => {
    const a = ((180 + lon - base) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const show = [...MAIN, ...(asteroids ? AST : [])];
  const inner = spread(show.filter(id => chart.positions[id]).map(id => ({ id, lon: chart.positions[id].lon })), bi ? 8 : 7);
  const outs = outer ? spread(show.filter(id => outer.positions[id]).map(id => ({ id, lon: outer.positions[id].lon })), 7) : [];
  const gsize = size < 330 ? 13 : 15;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityLabel="Harita çarkı">
      <Circle cx={cx} cy={cy} r={R} fill={C.card} stroke={C.ink} strokeWidth={1.2} />
      <Circle cx={cx} cy={cy} r={rSign} fill="none" stroke={C.ink} strokeWidth={1} />
      {bi ? <Circle cx={cx} cy={cy} r={rRing} fill="none" stroke={C.line} strokeWidth={1} /> : null}
      <Circle cx={cx} cy={cy} r={rAsp} fill="none" stroke={C.line} strokeWidth={1} />
      {Array.from({ length: 12 }).map((_, i) => {
        const p1 = pt(i * 30, R), p2 = pt(i * 30, rSign);
        const g = pt(i * 30 + 15, (R + rSign) / 2);
        return (
          <G key={i}>
            <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={C.ink} strokeWidth={0.8} />
            <SvgText x={g.x} y={g.y + 6} fontSize={16} fill={ELEMENT_COLOR[i % 4]} textAnchor="middle">{SIGN_GLYPHS[i]}</SvgText>
          </G>
        );
      })}
      {chart.cusps.map((c, i) => {
        const p1 = pt(c, rSign), p2 = pt(c, i % 3 === 0 ? 0 : rAsp);
        const lab = pt(c + 4, rAsp + 9);
        return (
          <G key={'h' + i}>
            <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={i % 3 === 0 ? C.ink : C.sub} strokeWidth={i % 3 === 0 ? 1.4 : 0.6} />
            <SvgText x={lab.x} y={lab.y + 3} fontSize={8} fill={C.sub} textAnchor="middle">{i + 1}</SvgText>
          </G>
        );
      })}
      {!bi ? chart.aspects.filter(a => PLANET_SET.includes(a.a) && PLANET_SET.includes(a.b) && a.type !== 'conjunction' && a.type !== 'quincunx').map((a, i) => {
        const p1 = pt(chart.positions[a.a].lon, rAsp), p2 = pt(chart.positions[a.b].lon, rAsp);
        const n = ASPECT_INFO[a.type].nature;
        return <Line key={'a' + i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={n === 'harmonious' ? C.air : C.fire} strokeWidth={0.9} opacity={0.75} />;
      }) : (cross ?? []).filter(a => a.type !== 'conjunction').slice(0, 25).map((a, i) => {
        const lo = (c: Chart, k: CrossAspect['a']) => (k === 'asc' ? c.asc! : k === 'mc' ? c.mc! : c.positions[k].lon);
        const p1 = pt(lo(outer!, a.a), rAsp), p2 = pt(lo(chart, a.b), rAsp);
        const n = ASPECT_INFO[a.type].nature;
        return <Line key={'x' + i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={n === 'harmonious' ? C.air : C.fire} strokeWidth={0.9} opacity={0.75} />;
      })}
      {inner.map(p => {
        const g = pt(p.d, rPlanet), tick1 = pt(p.lon, rRing), tick2 = pt(p.lon, rRing - 5);
        return (
          <G key={p.id}>
            <Line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke={C.ink} strokeWidth={1} />
            <SvgText x={g.x} y={g.y + 5} fontSize={AST.includes(p.id) ? gsize - 3 : gsize} fill={AST.includes(p.id) ? C.sub : C.ink} textAnchor="middle">{BODIES[p.id].glyph}</SvgText>
          </G>
        );
      })}
      {outs.map(p => {
        const g = pt(p.d, rOuter), tick1 = pt(p.lon, rSign), tick2 = pt(p.lon, rSign - 4);
        return (
          <G key={'o' + p.id}>
            <Line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke={C.second} strokeWidth={1} />
            <SvgText x={g.x} y={g.y + 5} fontSize={gsize - 1} fill={C.second} textAnchor="middle">{BODIES[p.id].glyph}</SvgText>
          </G>
        );
      })}
      {chart.asc !== null ? <SvgText x={4} y={cy - 4} fontSize={9} fill={C.rose} fontWeight="bold">ASC</SvgText> : null}
    </Svg>
  );
}
