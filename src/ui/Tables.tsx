import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { BodyId, Chart } from '../engine/astro';
import { ALL_BODIES, PLANETS, fmtDeg } from '../engine/astro';
import { elementQuality, midpoints, lots, parallels, starContacts } from '../engine/techniques';
import { BODIES, SIGNS, SIGN_GLYPHS, ASPECT_INFO, ELEMENTS, dignityOf } from '../content/base';
import { LOT_TEXT, STAR_NATURE, ptName } from '../content/techniqueTexts';
import LillyTable from './LillyTable';
import { Expand, P, Section, Sub, st } from './kit';
import { C, ELEMENT_COLOR } from '../theme';
import type { T2 } from '../i18n2';

type Lang = 'tr' | 'en';

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
      <Text style={[st.p, { width: 90 }]}>{label}</Text>
      <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: C.line }}>
        <View style={{ width: `${pct}%`, height: 10, borderRadius: 5, backgroundColor: color }} />
      </View>
      <Text style={[st.sub, { width: 40, textAlign: 'right' }]}>%{pct}</Text>
    </View>
  );
}

export default function Tables({ chart, t, lang, natal = true, asteroids = true }: { chart: Chart; t: T2; lang: Lang; natal?: boolean; asteroids?: boolean }) {
  const cell = { fontSize: 13, color: C.ink, fontVariant: ['tabular-nums'] as any };
  const ids = ALL_BODIES.filter(i => chart.positions[i] && (asteroids || !['chiron', 'ceres', 'pallas', 'juno', 'vesta'].includes(i)));
  const extra = useMemo(() => natal ? { eq: elementQuality(chart), mids: midpoints(chart), lots: lots(chart), par: parallels(chart), stars: starContacts(chart) } : null, [chart, natal]);
  const gridIds: (BodyId | 'asc' | 'mc')[] = [...PLANETS, 'node', ...(chart.asc !== null ? ['asc', 'mc'] as const : [])];
  const lonOf = (k: BodyId | 'asc' | 'mc') => (k === 'asc' ? chart.asc! : k === 'mc' ? chart.mc! : chart.positions[k].lon);
  const glyph = (k: BodyId | 'asc' | 'mc') => (k === 'asc' ? 'AC' : k === 'mc' ? 'MC' : BODIES[k].glyph);
  const aspFor = (a: BodyId | 'asc' | 'mc', b: BodyId | 'asc' | 'mc') => {
    const x = chart.aspects.find(z => (z.a === a && z.b === b) || (z.a === b && z.b === a));
    if (x) return x;
    if (a === 'asc' || a === 'mc' || b === 'asc' || b === 'mc') {
      const d = Math.abs(((lonOf(a) - lonOf(b)) % 360 + 540) % 360 - 180);
      for (const [type, ang, orb] of [['conjunction', 0, 6], ['sextile', 60, 4], ['square', 90, 5], ['trine', 120, 5], ['opposition', 180, 6]] as const)
        if (Math.abs(d - ang) <= orb) return { type, orb: Math.abs(d - ang) };
    }
    return null;
  };

  return (
    <View>
      <Section title={t.positions}>
        <View style={{ flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Text style={[st.sub, { flex: 2 }]}>{t.col.body}</Text>
          <Text style={[st.sub, { flex: 2 }]}>{t.col.sign}</Text>
          <Text style={[st.sub, { width: 36, textAlign: 'right' }]}>{t.col.house}</Text>
          <Text style={[st.sub, { width: 64, textAlign: 'right' }]}>{t.col.dec}</Text>
        </View>
        {ids.map(id => {
          const p = chart.positions[id];
          const dig = dignityOf(id, p.sign);
          return (
            <View key={id} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: 'center' }}>
              <Text style={[cell, { flex: 2, color: C.ink }]}>{BODIES[id].glyph} {BODIES[id].name[lang]}{p.retro ? ' ℞' : ''}</Text>
              <Text style={[cell, { flex: 2, color: dig ? C.gold : C.ink }]}>{SIGN_GLYPHS[p.sign]} {fmtDeg(p.lon)}</Text>
              <Text style={[cell, { width: 36, textAlign: 'right' }]}>{p.house || '–'}</Text>
              <Text style={[cell, { width: 64, textAlign: 'right' }]}>{p.dec >= 0 ? '+' : ''}{p.dec.toFixed(1)}°</Text>
            </View>
          );
        })}
        {chart.asc !== null ? (
          <Sub style={{ marginTop: 8 }}>ASC {SIGN_GLYPHS[Math.floor(chart.asc / 30)]} {fmtDeg(chart.asc)} · MC {SIGN_GLYPHS[Math.floor(chart.mc! / 30)]} {fmtDeg(chart.mc!)} · Vertex {SIGN_GLYPHS[Math.floor(chart.vertex! / 30)]} {fmtDeg(chart.vertex!)}{chart.zodiac === 'sidereal' ? ` · Ayanamsa ${chart.ayanamsa.toFixed(2)}°` : ''}</Sub>
        ) : null}
      </Section>

      {chart.cusps.length ? (
        <Section title={t.houses}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {chart.cusps.map((c, i) => (
              <View key={i} style={{ width: '50%', paddingVertical: 5 }}>
                <Text style={cell}><Text style={{ color: C.sub }}>{i + 1}. </Text>{SIGN_GLYPHS[Math.floor(c / 30)]} {SIGNS[Math.floor(c / 30)][lang]} {fmtDeg(c)}</Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      <Section title={t.aspectGrid}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {gridIds.map((row, i) => (
              <View key={String(row)} style={{ flexDirection: 'row' }}>
                {gridIds.slice(0, i + 1).map((col, j) => {
                  if (i === j) return <View key={String(col)} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, borderWidth: 0.5, borderColor: C.line }}><Text style={{ fontSize: 12, color: C.ink }}>{glyph(row)}</Text></View>;
                  const a = aspFor(row, col);
                  const n = a ? ASPECT_INFO[a.type].nature : null;
                  return (
                    <View key={String(col)} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: C.line }}>
                      {a ? <Text style={{ fontSize: 13, color: n === 'harmonious' ? C.air : n === 'challenging' ? C.rose : C.gold }}>{ASPECT_INFO[a.type].glyph}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <Expand more={lang === 'tr' ? 'Açı listesini göster' : 'Show aspect list'} less={lang === 'tr' ? 'Gizle' : 'Hide'} initial={0} items={chart.aspects.map((a, i) => (
          <Text key={i} style={[cell, { paddingVertical: 3 }]}>{BODIES[a.a].glyph} {ASPECT_INFO[a.type].glyph} {BODIES[a.b].glyph}  {BODIES[a.a].name[lang]} {ASPECT_INFO[a.type].name[lang]} {BODIES[a.b].name[lang]} · {a.orb.toFixed(2)}°{a.applying === undefined ? '' : a.applying ? ' A' : ' S'}</Text>
        ))} />
      </Section>

      {extra ? (
        <>
          <Section title={t.elements}>
            {extra.eq.el.map((v, i) => <Bar key={i} label={Object.values(ELEMENTS)[i][lang]} pct={v} color={ELEMENT_COLOR[i]} />)}
            <View style={{ height: 8 }} />
            {extra.eq.q.map((v, i) => <Bar key={i} label={t.qualities[i]} pct={v} color={C.gold} />)}
            <Sub style={{ marginTop: 6 }}>{t.dominant}: {Object.values(ELEMENTS)[extra.eq.dominantElement][lang]} · {t.qualities[extra.eq.dominantQuality]} · {SIGN_GLYPHS[extra.eq.dominantSign]} {SIGNS[extra.eq.dominantSign][lang]}</Sub>
            <Sub style={{ marginTop: 4 }}>{lang === 'tr' ? 'Yükselen, Güneş ve Ay 3 puan; MC ve diğer gezegenler 1 puan sayılır.' : 'Ascendant, Sun and Moon count 3 points; MC and other planets 1 point.'}</Sub>
          </Section>

          <Section title={t.dignity}><LillyTable chart={chart} lang={lang} /></Section>

          {extra.lots.length ? (
            <Section title={t.lots}>
              {extra.lots.map(x => (
                <View key={x.id} style={st.row}>
                  <Text style={[st.p, { fontWeight: '600' }]}>{LOT_TEXT[x.id].name[lang]} — {SIGN_GLYPHS[Math.floor(x.lon / 30)]} {SIGNS[Math.floor(x.lon / 30)][lang]} {fmtDeg(x.lon)} · {x.house}.</Text>
                  <Sub>{LOT_TEXT[x.id].desc[lang]}</Sub>
                </View>
              ))}
            </Section>
          ) : null}

          <Section title={t.midpoints}>
            <Expand more={lang === 'tr' ? 'Tümünü göster' : 'Show all'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={8}
              items={[...extra.mids].sort((a, b) => b.hits.length - a.hits.length).map((m, i) => (
                <Text key={i} style={[cell, { paddingVertical: 3 }]}>
                  {glyph(m.a)}/{glyph(m.b)}  {SIGN_GLYPHS[Math.floor(m.lon / 30)]} {fmtDeg(m.lon)}{m.hits.length ? `  ←  ${m.hits.map(h => `${ptName(h)[lang]}`).join(', ')} ${t.onMid}` : ''}
                </Text>
              ))} />
          </Section>

          <Section title={t.parallels}>
            {extra.par.length ? extra.par.map((x, i) => (
              <Text key={i} style={[cell, { paddingVertical: 3 }]}>{BODIES[x.a].glyph} {BODIES[x.b].glyph}  {BODIES[x.a].name[lang]} – {BODIES[x.b].name[lang]}: {x.type === 'parallel' ? t.parallel : t.contraparallel} · {x.orb.toFixed(2)}°</Text>
            )) : <P>{t.none}</P>}
            <Sub style={{ marginTop: 6 }}>{lang === 'tr' ? 'Paralel kavuşum gibi, kontra-paralel karşıt gibi okunur.' : 'Parallels read like conjunctions, contra-parallels like oppositions.'}</Sub>
          </Section>

          <Section title={t.stars}>
            {extra.stars.length ? extra.stars.map((x, i) => (
              <View key={i} style={st.row}>
                <Text style={[st.p, { fontWeight: '600' }]}>{x.star} ☌ {ptName(x.point)[lang]} · {x.orb.toFixed(2)}°</Text>
                <Sub>{STAR_NATURE[x.nature]?.[lang]}</Sub>
              </View>
            )) : <P>{t.none}</P>}
          </Section>
        </>
      ) : null}
    </View>
  );
}
