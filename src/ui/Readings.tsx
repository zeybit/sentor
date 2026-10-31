import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { AspectType, BodyId, Chart } from '../engine/astro';
import { ALL_BODIES, PLANETS, angleDiff, fmtDeg, ASPECTS, norm, moonPhase } from '../engine/astro';
import { crossAspects, CrossAspect, antiscion, solarArcDegrees } from '../engine/techniques';
import { BODIES, SIGNS, SIGN_GLYPHS, HOUSES, ASPECT_INFO, dignityOf, SIGN_KEYWORDS } from '../content/base';
import { placementText, ASC } from '../content/placements';
import { planetInHouse, houseRulerText } from '../content/life';
import { PLANET_HOUSE } from '../content/houseTexts';
import { natalAspectText, aspectTitle } from '../content/aspectPairs';
import { transitText, transitHouseText, PROG_MOON_SIGN, progMoonHouse, progSunText, PROG_PHASE, returnTexts, ptName } from '../content/techniqueTexts';
import { lillyScore, mannersFor, CLASSICAL, Classical } from '../content/lillyDignity';
import * as N from '../content/lillyNatal';
import { LordAndTemperament, SectionView, LILLY_NOTE } from './LillyBlocks';
import { Expand, P, Section, Sub, st } from './kit';
import { C, ELEMENT_COLOR, serif } from '../theme';
import type { Strings } from '../i18n';
import type { T2 } from '../i18n2';
import type { ChartKind } from '../engine/techniques';

type Lang = 'tr' | 'en';
type K = BodyId | 'asc' | 'mc';
const ASTS = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];

function Item({ title, body, meta }: { title: string; body: string; meta?: string }) {
  return (
    <View style={st.row}>
      <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink }}>{title}</Text>
      {meta ? <Text style={st.sub}>{meta}</Text> : null}
      <P style={{ marginTop: 4 }}>{body}</P>
    </View>
  );
}

/** Gezegenlerin yükselen ve MC ile açıları */
export function angleAspects(c: Chart): { a: K; b: K; type: AspectType; orb: number }[] {
  if (c.asc === null) return [];
  const out: { a: K; b: K; type: AspectType; orb: number }[] = [];
  for (const p of [...PLANETS, 'chiron', 'node'] as BodyId[]) {
    if (!c.positions[p]) continue;
    for (const [ang, lon] of [['asc', c.asc], ['mc', c.mc!]] as const) {
      const d = angleDiff(c.positions[p].lon, lon);
      for (const asp of ASPECTS) {
        if (asp.type === 'quincunx') continue;
        const orb = Math.abs(d - asp.angle);
        if (orb <= (asp.type === 'sextile' ? 4 : 6)) { out.push({ a: p, b: ang, type: asp.type, orb }); break; }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

// ---------------- Doğum haritası ----------------
export function NatalReading({ chart, s, t, lang, asteroids }: { chart: Chart; s: Strings; t: T2; lang: Lang; asteroids: boolean }) {
  const P_ = chart.positions;
  const ascSign = chart.asc !== null ? Math.floor(chart.asc / 30) : null;
  const lillyAreas = useMemo(() => [N.manners(chart), N.wit(chart), N.wealth(chart), N.marriage(chart), N.profession(chart), N.travel(chart), N.friends(chart)], [chart]);
  const ids = ALL_BODIES.filter(i => P_[i] && (asteroids || !ASTS.includes(i)));
  const big3 = [
    { label: s.sun, sign: P_.sun.sign, text: placementText('sun', P_.sun.sign) },
    { label: s.moon, sign: P_.moon.sign, text: placementText('moon', P_.moon.sign) },
    ...(ascSign !== null ? [{ label: s.rising, sign: ascSign, text: ASC[ascSign] }] : []),
  ];
  const aspects = [
    ...chart.aspects.filter(a => !['southNode', 'fortune', 'lilith'].includes(a.a) && !['southNode', 'fortune', 'lilith'].includes(a.b) && (asteroids || (!ASTS.includes(a.a) && !ASTS.includes(a.b)))),
    ...angleAspects(chart),
  ].sort((x, y) => (x.orb + (ASTS.includes(x.a) || ASTS.includes(x.b) ? 10 : 0)) - (y.orb + (ASTS.includes(y.a) || ASTS.includes(y.b) ? 10 : 0)));
  return (
    <View>
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

      <LordAndTemperament chart={chart} lang={lang} />

      <Section title={s.placements}>
        {ids.map(id => {
          const p = P_[id];
          const dig = dignityOf(id, p.sign);
          const ht = p.house ? (PLANET_HOUSE[id]?.[p.house - 1] ?? planetInHouse(id, p.house)) : null;
          return (
            <View key={id} style={st.row}>
              <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink }}>
                {BODIES[id].glyph} {BODIES[id].name[lang]} — {SIGNS[p.sign][lang]} {fmtDeg(p.lon)}{p.retro ? ' ℞' : ''}{p.house ? ` · ${p.house}. ${s.house.toLocaleLowerCase(lang)}` : ''}
              </Text>
              {dig ? <Text style={[st.sub, { color: C.gold }]}>{dig[lang]}</Text> : null}
              <P style={{ marginTop: 4 }}>{placementText(id, p.sign)[lang]}</P>
              {ht ? <P style={{ marginTop: 4, color: C.sub }}>{ht[lang]}</P> : null}
              {p.retro && !['node', 'southNode'].includes(id) ? <P style={{ marginTop: 4, color: C.sub }}>{lang === 'tr' ? `${BODIES[id].name.tr} doğumda retro: bu gezegenin konularını içe dönük, yeniden düşünerek ve kendine özgü bir yoldan yaşarsın.` : `${BODIES[id].name.en} retrograde at birth: you live its themes inwardly, revisiting them in your own way.`}</P> : null}
              {(CLASSICAL as string[]).includes(id) ? (() => {
                const sc = lillyScore(chart, id as Classical);
                return <P style={{ marginTop: 6 }}><Text style={{ fontWeight: '700', color: sc.total >= 0 ? C.earth : C.rose }}>Lilly {sc.total > 0 ? '+' : ''}{sc.total}: </Text>{mannersFor(sc).text[lang]}</P>;
              })() : null}
            </View>
          );
        })}
      </Section>

      {lillyAreas.map((sec, i) => <SectionView key={i} sec={sec} lang={lang} />)}

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
        <Expand more={s.showMore} less={s.showLess} initial={10} items={aspects.map((a, i) => {
          const txt = natalAspectText(a.a, a.b, a.type) ?? ASPECT_INFO[a.type].desc;
          return <Item key={i} title={`${aspectTitle(a.a, a.b, a.type)[lang]}`} meta={`${ASPECT_INFO[a.type].glyph} orb ${a.orb.toFixed(1)}°`} body={txt[lang]} />;
        })} />
      </Section>
      <Sub style={{ marginBottom: 20 }}>{LILLY_NOTE[lang]}</Sub>
      {void t}
    </View>
  );
}

// ---------------- Transit / progresyon / solar arc ----------------
function CrossList({ list, prefix, lang, s }: { list: CrossAspect[]; prefix: { tr: string; en: string }; lang: Lang; s: Strings }) {
  if (!list.length) return null;
  return (
    <Expand more={s.showMore} less={s.showLess} initial={10} items={list.map((x, i) => {
      const r = transitText(x.a, x.b, x.type, prefix);
      const ap = x.applying === undefined ? '' : x.applying ? (lang === 'tr' ? ' · yaklaşıyor' : ' · applying') : (lang === 'tr' ? ' · uzaklaşıyor' : ' · separating');
      return <Item key={i} title={r.title[lang]} meta={`${ASPECT_INFO[x.type].glyph} orb ${x.orb.toFixed(2)}°${ap}`} body={r.body[lang]} />;
    })} />
  );
}

export function KindReading({ kind, natal, other, s, t, lang }: { kind: ChartKind; natal: Chart; other: Chart; s: Strings; t: T2; lang: Lang }) {
  const OP = other.positions;
  if (kind === 'transit') {
    const list = crossAspects(other, natal, 3, [...PLANETS, 'chiron', 'node'] as BodyId[]).filter(x => x.a !== 'asc' && x.a !== 'mc');
    const slow: BodyId[] = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'mars'];
    return (
      <View>
        <Section title={t.transitTitle}>{list.length ? <CrossList list={list} prefix={{ tr: 'Transit', en: 'Transit' }} lang={lang} s={s} /> : <P>{t.noItems}</P>}</Section>
        {natal.cusps.length ? (
          <Section title={t.transitHouses}>
            {slow.map(b => { const h = (() => { for (let i = 0; i < 12; i++) { const a = natal.cusps[i], z = natal.cusps[(i + 1) % 12]; if (norm(OP[b].lon - a) < norm(z - a)) return i + 1; } return 1; })(); return <View key={b} style={st.row}><P>{transitHouseText(b, h)[lang]}</P></View>; })}
          </Section>
        ) : null}
      </View>
    );
  }
  if (kind === 'progressed') {
    const list = crossAspects(other, natal, 1, PLANETS).filter(x => x.a !== 'asc' && x.a !== 'mc' && !['uranus', 'neptune', 'pluto'].includes(x.a as string));
    const ph = Math.floor(norm(OP.moon.lon - OP.sun.lon + 22.5) / 45) % 8;
    const pmH = natal.cusps.length ? (() => { for (let i = 0; i < 12; i++) { const a = natal.cusps[i], z = natal.cusps[(i + 1) % 12]; if (norm(OP.moon.lon - a) < norm(z - a)) return i + 1; } return 1; })() : 0;
    return (
      <View>
        <Section title={t.progTitle}>
          <Item title={`${lang === 'tr' ? 'Progres Güneş' : 'Progressed Sun'} — ${SIGNS[OP.sun.sign][lang]} ${fmtDeg(OP.sun.lon)}`} body={progSunText(OP.sun.sign)[lang]} />
          <Item title={`${lang === 'tr' ? 'Progres Ay' : 'Progressed Moon'} — ${SIGNS[OP.moon.sign][lang]} ${fmtDeg(OP.moon.lon)}`} body={PROG_MOON_SIGN[OP.moon.sign][lang] + (pmH ? ' ' + progMoonHouse(pmH)[lang] : '')} />
          <Item title={lang === 'tr' ? 'Progres Ay fazı' : 'Progressed lunar phase'} body={PROG_PHASE[ph][lang]} />
          {other.asc !== null ? <Item title={`${lang === 'tr' ? 'Progres Yükselen' : 'Progressed Ascendant'} — ${SIGNS[Math.floor(other.asc / 30)][lang]} ${fmtDeg(other.asc)}`} body={lang === 'tr' ? `Kendini ifade biçimin yavaş yavaş ${SIGNS[Math.floor(other.asc / 30)].tr} niteliklerine doğru evriliyor. Progres MC: ${SIGNS[Math.floor(other.mc! / 30)].tr} ${fmtDeg(other.mc!)}.` : `Your self-expression gradually evolves toward ${SIGNS[Math.floor(other.asc / 30)].en} qualities. Progressed MC: ${fmtDeg(other.mc!)} ${SIGNS[Math.floor(other.mc! / 30)].en}.`} /> : null}
        </Section>
        <Section title={t.progAspects}>{list.length ? <CrossList list={list} prefix={{ tr: 'Progres', en: 'Progressed' }} lang={lang} s={s} /> : <P>{t.noItems}</P>}</Section>
      </View>
    );
  }
  if (kind === 'solarArc') {
    const list = crossAspects(other, natal, 1, PLANETS);
    const arc = solarArcDegrees(natal, other.utc);
    return (
      <Section title={`${t.saTitle} · ${t.arc} ${arc.toFixed(2)}°`}>
        {list.length ? <CrossList list={list.filter(x => !(x.a === x.b))} prefix={{ tr: 'Solar arc', en: 'Solar arc' }} lang={lang} s={s} /> : <P>{t.noItems}</P>}
      </Section>
    );
  }
  if (kind === 'solarReturn' || kind === 'lunarReturn') {
    const items = returnTexts(other, natal, kind === 'solarReturn' ? 'solar' : 'lunar');
    const asp = other.aspects.filter(a => PLANETS.includes(a.a) && PLANETS.includes(a.b)).slice(0, 12);
    return (
      <View>
        <Section title={kind === 'solarReturn' ? t.srTitle : t.lrTitle}>
          {items.map((x, i) => <Item key={i} title={x.title[lang]} body={x.body[lang]} />)}
        </Section>
        <Section title={s.aspects}>
          <Expand more={s.showMore} less={s.showLess} initial={6} items={asp.map((a, i) => <Item key={i} title={aspectTitle(a.a, a.b, a.type)[lang]} meta={`orb ${a.orb.toFixed(1)}°`} body={(natalAspectText(a.a, a.b, a.type) ?? ASPECT_INFO[a.type].desc)[lang]} />)} />
        </Section>
      </View>
    );
  }
  if (kind === 'antiscia') {
    const hits: { a: BodyId; b: BodyId; contra: boolean; orb: number }[] = [];
    for (const a of PLANETS) for (const b of PLANETS) {
      if (a === b) continue;
      const an = antiscion(natal.positions[a].lon);
      const o1 = angleDiff(an, natal.positions[b].lon), o2 = angleDiff(norm(an + 180), natal.positions[b].lon);
      if (o1 <= 1.5 && a < b) hits.push({ a, b, contra: false, orb: o1 });
      else if (o2 <= 1.5 && a < b) hits.push({ a, b, contra: true, orb: o2 });
    }
    return (
      <Section title={t.antTitle}>
        <Sub style={{ marginBottom: 8 }}>{t.antDesc}</Sub>
        {hits.length ? hits.map((h, i) => {
          const txt = natalAspectText(h.a, h.b, h.contra ? 'square' : 'trine') ?? ASPECT_INFO[h.contra ? 'square' : 'trine'].desc;
          return <Item key={i} title={`${BODIES[h.a].name[lang]} ⇄ ${BODIES[h.b].name[lang]} (${h.contra ? t.contra + ' ' : ''}${t.antContact})`} meta={`orb ${h.orb.toFixed(2)}°`} body={txt[lang]} />;
        }) : <P>{t.noItems}</P>}
      </Section>
    );
  }
  if (kind === 'now') {
    const mp = moonPhase(other.utc);
    return (
      <View>
        <Section title={t.nowTitle}>
          {PLANETS.map(p => <View key={p} style={[st.row, { paddingVertical: 6 }]}><Text style={st.p}>{BODIES[p].glyph} {BODIES[p].name[lang]} — {SIGNS[OP[p].sign][lang]} {fmtDeg(OP[p].lon)}{OP[p].retro ? ' ℞' : ''}</Text></View>)}
          <Sub style={{ marginTop: 6 }}>{lang === 'tr' ? `Ay ışığı %${Math.round(mp.illum * 100)}` : `Moon illumination ${Math.round(mp.illum * 100)}%`}</Sub>
        </Section>
        <Section title={t.nowAspects}>
          <Expand more={s.showMore} less={s.showLess} initial={8} items={other.aspects.filter(a => PLANETS.includes(a.a) && PLANETS.includes(a.b)).map((a, i) => <Item key={i} title={aspectTitle(a.a, a.b, a.type)[lang]} meta={`orb ${a.orb.toFixed(1)}°${a.applying === undefined ? '' : a.applying ? ' · A' : ' · S'}`} body={ASPECT_INFO[a.type].desc[lang]} />)} />
        </Section>
        <Section title={t.transitTitle}><CrossList list={crossAspects(other, natal, 2, PLANETS).filter(x => x.a !== 'asc' && x.a !== 'mc')} prefix={{ tr: 'Transit', en: 'Transit' }} lang={lang} s={s} /></Section>
      </View>
    );
  }
  return null;
}

export { ptName };
