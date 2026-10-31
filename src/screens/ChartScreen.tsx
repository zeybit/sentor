import React from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useStore } from '../store';
import { ALL_BODIES, fmtDeg } from '../engine/astro';
import { BODIES, SIGNS, SIGN_GLYPHS, HOUSES, ASPECT_INFO, ELEMENTS, dignityOf, SIGN_KEYWORDS } from '../content/base';
import { placementText, ASC } from '../content/placements';
import { planetInHouse, houseRulerText } from '../content/life';
import Wheel from '../ui/Wheel';
import LillyTable from '../ui/LillyTable';
import { Expand, H1, P, Section, Sub, st } from '../ui/kit';
import { C, ELEMENT_COLOR, serif } from '../theme';

export default function ChartScreen() {
  const { chart, s, lang, profile } = useStore();
  const { width } = useWindowDimensions();
  if (!chart) return null;
  const P_ = chart.positions;
  const ascSign = chart.asc !== null ? Math.floor(chart.asc / 30) : null;
  const big3 = [
    { label: s.sun, sign: P_.sun.sign, text: placementText('sun', P_.sun.sign) },
    { label: s.moon, sign: P_.moon.sign, text: placementText('moon', P_.moon.sign) },
    ...(ascSign !== null ? [{ label: s.rising, sign: ascSign, text: ASC[ascSign] }] : []),
  ];
  const elCount = [0, 0, 0, 0];
  (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const).forEach(p => elCount[P_[p].sign % 4]++);
  if (ascSign !== null) elCount[ascSign % 4]++;
  const total = elCount.reduce((a, b) => a + b, 0);
  const ids = ALL_BODIES.filter(i => P_[i]);

  return (
    <View>
      <H1>{profile?.name || s.tabs.chart}</H1>
      <Sub>{profile?.place} · {chart.input.timeKnown ? `${String(chart.input.hour).padStart(2, '0')}:${String(chart.input.minute).padStart(2, '0')}` : '—'} · {s.hsNames[chart.houseSystemUsed]}{chart.isDayChart !== null ? ` · ${chart.isDayChart ? s.dayChart : s.nightChart}` : ''}</Sub>
      {chart.houseSystemUsed !== chart.houseSystem ? <Sub style={{ color: C.rose }}>{s.polarNote}</Sub> : null}

      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        <Wheel chart={chart} size={Math.min(width - 32, 420)} />
      </View>

      <Section title={s.bigThree}>
        {big3.map(b => (
          <View key={b.label} style={st.row}>
            <Text style={{ fontFamily: serif, fontSize: 18, color: C.ink }}>
              <Text style={{ color: ELEMENT_COLOR[b.sign % 4] }}>{SIGN_GLYPHS[b.sign]} </Text>{b.label}: {SIGNS[b.sign][lang]}
            </Text>
            <P style={{ marginTop: 4 }}>{b.text[lang]}</P>
          </View>
        ))}
        {ascSign === null ? <Sub>{s.needsTime}</Sub> : null}
      </Section>

      <Section title={s.elements}>
        {elCount.map((n, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Text style={[st.p, { width: 70 }]}>{Object.values(ELEMENTS)[i][lang]}</Text>
            <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: C.line }}>
              <View style={{ width: `${(n / total) * 100}%`, height: 10, borderRadius: 5, backgroundColor: ELEMENT_COLOR[i] }} />
            </View>
            <Text style={[st.sub, { width: 20 }]}>{n}</Text>
          </View>
        ))}
      </Section>

      <Section title={lang === 'tr' ? 'Lilly güç tablosu' : 'Lilly’s table of fortitudes'}>
        <LillyTable chart={chart} lang={lang} />
      </Section>

      <Section title={s.placements}>
        {ids.map(id => {
          const p = P_[id];
          const dig = dignityOf(id, p.sign);
          return (
            <View key={id} style={st.row}>
              <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink }}>
                {BODIES[id].glyph} {BODIES[id].name[lang]} — {SIGNS[p.sign][lang]} {fmtDeg(p.lon)}{p.retro ? ` ℞` : ''}{p.house ? ` · ${p.house}. ${s.house.toLocaleLowerCase(lang)}` : ''}
              </Text>
              {dig ? <Text style={[st.sub, { color: C.gold }]}>{dig[lang]}</Text> : null}
              <P style={{ marginTop: 4 }}>{placementText(id, p.sign)[lang]}</P>
              {p.house ? <P style={{ marginTop: 4, color: C.sub }}>{planetInHouse(id, p.house)[lang]}</P> : null}
            </View>
          );
        })}
      </Section>

      <Section title={s.houses}>
        {chart.cusps.length === 0 ? <P>{s.needsTime}</P> : (
          <Expand more={s.showMore} less={s.showLess} initial={4} items={chart.cusps.map((c, i) => {
            const sign = Math.floor(c / 30);
            const inside = ids.filter(id => P_[id].house === i + 1);
            const rt = houseRulerText(chart, i + 1);
            return (
              <View key={i} style={st.row}>
                <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink }}>{HOUSES[i].name[lang]}</Text>
                <Sub>{SIGN_GLYPHS[sign]} {SIGNS[sign][lang]} {fmtDeg(c)} · {HOUSES[i].area[lang]}</Sub>
                <P style={{ marginTop: 4 }}>{lang === 'tr' ? `Bu alana ${SIGNS[sign].tr} enerjisi hâkim: ${SIGN_KEYWORDS[sign].tr.toLocaleLowerCase('tr')}.` : `${SIGNS[sign].en} energy colours this area: ${SIGN_KEYWORDS[sign].en.toLowerCase()}.`}</P>
                {inside.length ? <P style={{ marginTop: 4 }}>{inside.map(x => `${BODIES[x].glyph} ${BODIES[x].name[lang]}`).join(', ')}</P> : null}
                {rt ? <Sub style={{ marginTop: 4 }}>{rt[lang]}</Sub> : null}
              </View>
            );
          })} />
        )}
      </Section>

      <Section title={s.aspects}>
        <Expand more={s.showMore} less={s.showLess} initial={8} items={chart.aspects.map((a, i) => {
          const info = ASPECT_INFO[a.type];
          return (
            <View key={i} style={st.row}>
              <Text style={[st.p, { fontWeight: '600' }]}>{BODIES[a.a].glyph} {BODIES[a.a].name[lang]} {info.glyph} {BODIES[a.b].glyph} {BODIES[a.b].name[lang]}</Text>
              <Sub>{info.name[lang]} · orb {a.orb.toFixed(1)}° — {info.desc[lang]}</Sub>
            </View>
          );
        })} />
      </Section>
    </View>
  );
}
