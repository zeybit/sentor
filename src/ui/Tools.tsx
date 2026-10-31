import React, { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import cityTz from 'city-timezones';
import type { AspectType, BodyId, Chart } from '../engine/astro';
import { PLANETS } from '../engine/astro';
import { cartography, lineLongitudes, finder, AngleLine } from '../engine/techniques';
import { BODIES, SIGNS, ASPECT_INFO } from '../content/base';
import { lineText, ptName } from '../content/techniqueTexts';
import { Btn, Chips, Expand, P, Section, Sub, st, useLayout } from './kit';
import { C, serif } from '../theme';
import type { T2 } from '../i18n2';
import { fmtLocal } from '../util';

type Lang = 'tr' | 'en';
let BIG: { name: string; country: string; lat: number; lon: number; pop: number }[] | null = null;
const bigCities = () => BIG ?? (BIG = (cityTz.cityMapping as any[]).filter(c => c.pop >= 700000).map(c => ({ name: c.city, country: c.country, lat: c.lat, lon: c.lng, pop: c.pop })));

// ---------------- Kartografi ----------------
export function Cartography({ natal, t, lang }: { natal: Chart; t: T2; lang: Lang }) {
  const { inner, wide } = useLayout();
  const [body, setBody] = useState<BodyId>('venus');
  const hits = useMemo(() => cartography(natal, bigCities(), [body]), [natal, body]);
  const L = useMemo(() => lineLongitudes(natal, body), [natal, body]);
  const W = Math.min(inner(wide ? 1180 : 760), 980), H = W / 2;
  const x = (lon: number) => ((lon + 180) / 360) * W, y = (lat: number) => ((90 - lat) / 180) * H;
  const curve = (f: (lat: number) => number | null) => {
    const pts: string[] = []; const segs: string[] = [];
    let prev: number | null = null;
    for (let lat = -75; lat <= 75; lat += 2.5) {
      const lo = f(lat);
      if (lo === null || (prev !== null && Math.abs(lo - prev) > 90)) { if (pts.length > 1) segs.push(pts.join(' ')); pts.length = 0; }
      if (lo !== null) pts.push(`${x(lo).toFixed(1)},${y(lat).toFixed(1)}`);
      prev = lo;
    }
    if (pts.length > 1) segs.push(pts.join(' '));
    return segs;
  };
  const byLine: Record<AngleLine, typeof hits> = { MC: [], IC: [], ASC: [], DSC: [] };
  for (const h of hits) if (byLine[h.line].length < 12) byLine[h.line].push(h);
  return (
    <View>
      <Section title={t.cartoTitle}>
        <Sub style={{ marginBottom: 10 }}>{t.cartoDesc}</Sub>
        <Chips items={[...PLANETS].map(p => ({ key: p, label: `${BODIES[p].glyph} ${BODIES[p].name[lang]}` }))} value={body} onChange={v => setBody(v as BodyId)} />
        <View style={{ alignItems: 'center' }}>
          <Svg width={W} height={H}>
            <Rect x={0} y={0} width={W} height={H} fill={C.bg} stroke={C.line} />
            {[-60, -30, 0, 30, 60].map(la => <Line key={la} x1={0} x2={W} y1={y(la)} y2={y(la)} stroke={C.line} strokeWidth={la === 0 ? 1 : 0.5} />)}
            {[-120, -60, 0, 60, 120].map(lo => <Line key={lo} y1={0} y2={H} x1={x(lo)} x2={x(lo)} stroke={C.line} strokeWidth={0.5} />)}
            {bigCities().map((c, i) => <Circle key={i} cx={x(c.lon)} cy={y(c.lat)} r={c.pop > 5e6 ? 1.6 : 1} fill={C.sub} opacity={0.6} />)}
            <Line x1={x(L.mc)} x2={x(L.mc)} y1={0} y2={H} stroke={C.rose} strokeWidth={1.6} />
            <Line x1={x(L.ic)} x2={x(L.ic)} y1={0} y2={H} stroke={C.air} strokeWidth={1.6} strokeDasharray="4 3" />
            {curve(L.ascAt).map((p, i) => <Polyline key={'a' + i} points={p} fill="none" stroke={C.earth} strokeWidth={1.6} />)}
            {curve(L.dscAt).map((p, i) => <Polyline key={'d' + i} points={p} fill="none" stroke={C.gold} strokeWidth={1.6} strokeDasharray="4 3" />)}
            <SvgText x={4} y={12} fontSize={10} fill={C.rose}>MC</SvgText>
            <SvgText x={28} y={12} fontSize={10} fill={C.air}>IC</SvgText>
            <SvgText x={48} y={12} fontSize={10} fill={C.earth}>ASC</SvgText>
            <SvgText x={78} y={12} fontSize={10} fill={C.gold}>DSC</SvgText>
          </Svg>
        </View>
      </Section>
      {(['MC', 'ASC', 'DSC', 'IC'] as AngleLine[]).map(line => (
        <Section key={line}>
          <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{BODIES[body].glyph} {line}</Text>
          <P style={{ marginVertical: 6 }}>{lineText(body, line)[lang]}</P>
          {byLine[line].length ? byLine[line].map((h, i) => <Text key={i} style={[st.sub, { paddingVertical: 2 }]}>{h.city}, {h.country}, {h.distKm} km</Text>) : <Sub>{t.none}</Sub>}
        </Section>
      ))}
    </View>
  );
}

// ---------------- Bulucu ----------------
export function Finder({ natal, t, lang, tz }: { natal: Chart; t: T2; lang: Lang; tz: string }) {
  const [body, setBody] = useState<BodyId>('jupiter');
  const [mode, setMode] = useState<'aspect' | 'sign'>('aspect');
  const [target, setTarget] = useState<string>('any');
  const [aspect, setAspect] = useState<AspectType | 'any'>('any');
  const [sign, setSign] = useState<string>('any');
  const [years, setYears] = useState('2');
  const [res, setRes] = useState<ReturnType<typeof finder> | null>(null);
  const [busy, setBusy] = useState(false);
  const targets = ['any', ...PLANETS, 'node', ...(natal.asc !== null ? ['asc', 'mc'] : [])];
  const run = () => {
    setBusy(true);
    setTimeout(() => {
      try {
        setRes(finder(natal, { body, mode, target: target === 'any' ? undefined : target as any, aspect, sign: sign === 'any' ? undefined : +sign }, new Date(), +years));
      } finally { setBusy(false); }
    }, 20);
  };
  return (
    <View>
      <Section title={t.finderTitle}>
        <Sub style={{ marginBottom: 10 }}>{t.finderDesc}</Sub>
        <Text style={st.label}>{t.fBody}</Text>
        <Chips items={(['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as BodyId[]).map(p => ({ key: p, label: `${BODIES[p].glyph} ${BODIES[p].name[lang]}` }))} value={body} onChange={v => setBody(v as BodyId)} />
        <Text style={st.label}>{t.fMode}</Text>
        <Chips items={[{ key: 'aspect', label: t.fModeA }, { key: 'sign', label: t.fModeS }]} value={mode} onChange={v => setMode(v as any)} />
        {mode === 'aspect' ? (
          <>
            <Text style={st.label}>{t.fTarget}</Text>
            <Chips items={targets.map(k => ({ key: k, label: k === 'any' ? t.fAny : ptName(k as any)[lang] }))} value={target} onChange={setTarget} />
            <Text style={st.label}>{t.fAspect}</Text>
            <Chips items={[{ key: 'any', label: t.fAny }, ...(['conjunction', 'sextile', 'square', 'trine', 'opposition'] as AspectType[]).map(a => ({ key: a, label: `${ASPECT_INFO[a].glyph} ${ASPECT_INFO[a].name[lang]}` }))]} value={aspect} onChange={v => setAspect(v as any)} />
          </>
        ) : (
          <>
            <Text style={st.label}>{t.fSign}</Text>
            <Chips items={[{ key: 'any', label: t.fAny }, ...SIGNS.map((s, i) => ({ key: String(i), label: s[lang] }))]} value={sign} onChange={setSign} />
          </>
        )}
        <Text style={st.label}>{t.fYears}</Text>
        <Chips items={['1', '2', '5', '10'].map(y => ({ key: y, label: `${y} ${t.years}` }))} value={years} onChange={setYears} />
        <Btn title={busy ? '…' : t.fRun} onPress={run} disabled={busy} />
      </Section>
      {res ? (
        <Section title={`${t.fResults} (${res.length})`}>
          {res.length ? <Expand more={lang === 'tr' ? 'Tümünü göster' : 'Show all'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={15} items={res.map((r, i) => (
            <View key={i} style={[st.row, { flexDirection: 'row', gap: 10 }]}>
              <Text style={[st.p, { width: 104, color: C.rose, fontVariant: ['tabular-nums'] }]}>{fmtLocal(r.date, tz, false)}</Text>
              <Text style={[st.p, { flex: 1 }]}>
                {mode === 'sign' ? `${BODIES[body].name[lang]} → ${SIGNS[r.sign!][lang]}` : `${BODIES[body].name[lang]} ${ASPECT_INFO[r.aspect!].glyph} ${ptName(r.text as any)[lang]}`}{r.retro ? ` (${t.retro})` : ''}
              </Text>
            </View>
          ))} /> : <P>{t.fNone}</P>}
        </Section>
      ) : null}
    </View>
  );
}
