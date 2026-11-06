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
import { LILLY_NOTE } from './LillyBlocks';
import { natalStory } from '../content/story';
import { Expand, P, Section, Sub, st } from './kit';
import { C, ELEMENT_COLOR, F, serif } from '../theme';
import type { Strings } from '../i18n';
import type { T2 } from '../i18n2';
import type { ChartKind } from '../engine/techniques';

type Lang = 'tr' | 'en';
/** Orb yerine sade güç ifadesi */
export const strength = (orb: number, lang: Lang) => orb < 1 ? (lang === 'tr' ? 'Çok güçlü etki' : 'Very strong influence') : orb < 3 ? (lang === 'tr' ? 'Güçlü etki' : 'Strong influence') : orb < 5 ? (lang === 'tr' ? 'Belirgin etki' : 'Noticeable influence') : (lang === 'tr' ? 'Hafif etki' : 'Mild influence');
type K = BodyId | 'asc' | 'mc';
const ASTS = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];

function Item({ title, body, meta }: { title: string; body: string; meta?: string }) {
  return (
    <View style={st.row}>
      <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{title}</Text>
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

// ---------------- Doğum haritası: kitap gibi akıcı anlatım ----------------
export function NatalReading({ chart, s, t, lang }: { chart: Chart; s: Strings; t: T2; lang: Lang; asteroids: boolean }) {
  const chapters = useMemo(() => natalStory(chart, lang), [chart, lang]);
  return (
    <View>
      <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 19, lineHeight: 28, color: C.sub, marginBottom: 28, maxWidth: 640 }}>
        {lang === 'tr'
          ? 'Bu bölüm haritanı baştan sona, bir kitap okur gibi anlatır. Teknik ayrıntıları (dereceler, açılar, ev başlangıçları) merak edersen yukarıdaki Tablolar sekmesine bakabilirsin.'
          : 'This section tells your chart from start to finish, like reading a book. If you are curious about the technical details (degrees, aspects, house cusps), see the Tables tab above.'}
      </Text>
      {chapters.map((c, i) => (
        <View key={c.id} style={{ marginBottom: 40 }}>
          <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 4 }}>{lang === 'tr' ? `Bölüm ${i + 1}` : `Chapter ${i + 1}`}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 36, color: C.ink, marginBottom: 10 }}>{c.title[lang]}</Text>
          <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: C.sub, marginBottom: 14, maxWidth: 640 }}>{c.intro[lang]}</Text>
          {c.paras.map((p, j) => (
            <Text key={j} style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginBottom: 16, maxWidth: 660 }}>{p[lang]}</Text>
          ))}
        </View>
      ))}
      <Sub style={{ marginBottom: 20 }}>{LILLY_NOTE[lang]}</Sub>
      {void s}{void t}
    </View>
  );
}

// ---------------- Transit / progresyon / solar arc ----------------
function CrossList({ list, prefix, lang, s }: { list: CrossAspect[]; prefix: { tr: string; en: string }; lang: Lang; s: Strings }) {
  if (!list.length) return null;
  return (
    <Expand more={s.showMore} less={s.showLess} initial={10} items={list.map((x, i) => {
      const r = transitText(x.a, x.b, x.type, prefix);
      const ap = x.applying === undefined ? '' : x.applying ? (lang === 'tr' ? ', etkisi artıyor' : ', building up') : (lang === 'tr' ? ', etkisi azalıyor' : ', fading');
      return <Item key={i} title={r.title[lang]} meta={`${strength(x.orb, lang)}${ap}`} body={r.body[lang]} />;
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
      <Section title={t.saTitle}>
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
          <Expand more={s.showMore} less={s.showLess} initial={6} items={asp.map((a, i) => <Item key={i} title={aspectTitle(a.a, a.b, a.type)[lang]} meta={strength(a.orb, lang)} body={(natalAspectText(a.a, a.b, a.type) ?? ASPECT_INFO[a.type].desc)[lang]} />)} />
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
          return <Item key={i} title={`${BODIES[h.a].name[lang]} ⇄ ${BODIES[h.b].name[lang]} (${h.contra ? t.contra + ' ' : ''}${t.antContact})`} meta={strength(h.orb, lang)} body={txt[lang]} />;
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
          <Expand more={s.showMore} less={s.showLess} initial={8} items={other.aspects.filter(a => PLANETS.includes(a.a) && PLANETS.includes(a.b)).map((a, i) => <Item key={i} title={aspectTitle(a.a, a.b, a.type)[lang]} meta={strength(a.orb, lang)} body={ASPECT_INFO[a.type].desc[lang]} />)} />
        </Section>
        <Section title={t.transitTitle}><CrossList list={crossAspects(other, natal, 2, PLANETS).filter(x => x.a !== 'asc' && x.a !== 'mc')} prefix={{ tr: 'Transit', en: 'Transit' }} lang={lang} s={s} /></Section>
      </View>
    );
  }
  return null;
}

export { ptName };
