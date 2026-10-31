import React, { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useStore } from '../store';
import type { BodyId } from '../engine/astro';
import { PLANETS } from '../engine/astro';
import { crossAspects, compositeChart, davisonChart, harmonyBand } from '../engine/techniques';
import { VENUS } from '../content/placements';
import { MARS_DESIRE, PARTNER, DATING, VENUS_HOUSE_MEET, PLANET_IN_7, signOfCusp, houseRulerText } from '../content/life';
import { synastry, SYN_LABEL } from '../content/forecast';
import { concord } from '../content/lillyNatal';
import { SIGNS } from '../content/base';
import { HARMONY } from '../content/techniqueTexts';
import { SynastryReport, SynastryTables, RelChartReport, synAspects } from '../ui/RelationshipViews';
import { T2S } from '../i18n2';
import BirthForm from '../ui/BirthForm';
import Wheel from '../ui/Wheel';
import Tables from '../ui/Tables';
import { Bar, Btn, Chips, Expand, H1, P, Row, Section, Sub, st } from '../ui/kit';
import { C, serif } from '../theme';

type Rel = 'synastry' | 'composite' | 'davison';

export default function LoveScreen() {
  const { chart, s, lang, opts, people, profile, addPerson, chartOf, showAsteroids } = useStore();
  const t = T2S[lang];
  const { width } = useWindowDimensions();
  const others = people.filter(p => p.id !== profile?.id);
  const [pid, setPid] = useState<string | null>(others[0]?.id ?? null);
  const [adding, setAdding] = useState(others.length === 0);
  const [rel, setRel] = useState<Rel>('synastry');
  const [view, setView] = useState<'readings' | 'tables'>('readings');
  const partner = others.find(p => p.id === pid) ?? null;
  const pc = useMemo(() => (partner ? chartOf(partner) : null), [partner, opts]);
  const data = useMemo(() => {
    if (!chart || !pc) return null;
    const sy = synastry(chart, pc);
    return {
      sy, lilly: concord(chart, pc),
      cross: synAspects(crossAspects(pc, chart, 6, [...PLANETS, 'node', 'chiron', 'juno', 'ceres', 'pallas', 'vesta', 'lilith', 'fortune'] as BodyId[])),
      wheelCross: crossAspects(pc, chart, 6, [...PLANETS, 'node'] as BodyId[]),
      comp: compositeChart(chart, pc, opts), dav: davisonChart(chart, pc, opts),
    };
  }, [chart, pc, opts]);
  if (!chart || !profile) return null;
  const P_ = chart.positions;
  const desc = signOfCusp(chart, 7), fifth = signOfCusp(chart, 5);
  const in7 = (Object.keys(PLANET_IN_7) as BodyId[]).filter(p => P_[p]?.house === 7);
  const me = lang === 'tr' ? 'Senin' : 'Your';
  const them = partner ? (lang === 'tr' ? `${partner.name || 'onun'}` : `${partner.name || 'their'}’s`) : '';

  const relChart = rel === 'composite' ? data?.comp : rel === 'davison' ? data?.dav : null;

  return (
    <View>
      <H1>{s.tabs.love}</H1>
      <Section>
        <Row label={`${s.loveStyle} · ${SIGNS[P_.venus.sign][lang]}`}>{VENUS[P_.venus.sign][lang]}</Row>
        <Row label={`${s.desire} · ${SIGNS[P_.mars.sign][lang]}`}>{MARS_DESIRE[P_.mars.sign][lang]}</Row>
        {desc !== null ? <Row label={`${s.partner} · ${SIGNS[desc][lang]}`}>{PARTNER[desc][lang]}</Row> : null}
        {fifth !== null ? <Row label={`${s.dating} · ${SIGNS[fifth][lang]}`}>{DATING[fifth][lang]}</Row> : null}
        {P_.venus.house ? <Row label={`${s.meet} · ${P_.venus.house}.`}>{VENUS_HOUSE_MEET[P_.venus.house - 1][lang]}</Row> : null}
        {in7.length ? <Row label={s.seventhPlanets}>{in7.map(p => PLANET_IN_7[p]![lang]).join('\n\n')}</Row> : null}
        {desc !== null ? <Sub style={{ marginTop: 8 }}>{houseRulerText(chart, 7)?.[lang]}</Sub> : <Sub>{s.needsTime}</Sub>}
      </Section>

      <Section title={s.compat} sub={s.compatSub}>
        {others.length ? (
          <>
            <Text style={st.label}>{t.choose}</Text>
            <Chips items={others.map(p => ({ key: p.id, label: p.name || p.place }))} value={pid ?? ''} onChange={v => { setPid(v); setAdding(false); }} />
          </>
        ) : null}
        {adding ? (
          <BirthForm nameLabel={s.partnerName} submitLabel={s.calcCompat} onSubmit={v => { const np = addPerson(v); setPid(np.id); setAdding(false); }} />
        ) : <Btn kind="ghost" title={t.addPerson} onPress={() => setAdding(true)} />}
      </Section>

      {data && partner ? (
        <>
          <Chips items={(['synastry', 'composite', 'davison'] as Rel[]).map(k => ({ key: k, label: t.relKinds[k] }))} value={rel} onChange={v => setRel(v as Rel)} />
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            {rel === 'synastry' ? <Wheel chart={chart} outer={pc} cross={data.wheelCross} size={Math.min(width - 32, 440)} asteroids={showAsteroids} /> : <Wheel chart={relChart!} size={Math.min(width - 32, 440)} asteroids={showAsteroids} />}
            {rel === 'synastry' ? <Text style={[st.sub, { marginTop: 6 }]}><Text style={{ color: C.second }}>● {partner.name}</Text> · {profile.name}</Text> : null}
          </View>
          <Chips items={[{ key: 'readings', label: t.views.readings }, { key: 'tables', label: t.views.tables }]} value={view} onChange={v => setView(v as any)} />

          {view === 'tables' ? (
            rel === 'synastry'
              ? <SynastryTables me={chart} them={pc!} cross={data.cross} myName={profile.name} theirName={partner.name} lang={lang} />
              : <Tables chart={relChart!} t={t} lang={lang} natal={false} asteroids={showAsteroids} showLots />
          ) : rel === 'synastry' ? (
            <>
              <Section title={t.harmony}>
                <View style={{ alignItems: 'center', marginVertical: 6 }}>
                  <Text style={{ fontFamily: serif, fontSize: 52, color: C.rose }}>%{data.sy.total}</Text>
                  <Sub>{HARMONY[harmonyBand(data.sy.total)][lang]}</Sub>
                </View>
                {data.sy.parts.map(p => <Bar key={p.key} label={SYN_LABEL[p.key][lang]} pct={p.score} />)}
                <Sub style={{ marginTop: 6 }}>{lang === 'tr' ? '0–30 zayıf · 30–50 orta · 50–80 iyi · 80–100 mükemmel' : '0–30 weak · 30–50 average · 50–80 good · 80–100 perfect'}</Sub>
              </Section>
              <SynastryReport me={chart} them={pc!} cross={data.cross} myName={profile.name} theirName={partner.name} lang={lang} asteroids={showAsteroids} />
              <Section title={data.lilly ? data.lilly.title[lang] : ''}>
                {data.lilly?.items.map((it, i) => <View key={i} style={st.row}><P>{it.text[lang]}</P></View>)}
              </Section>
            </>
          ) : relChart ? (
            <RelChartReport chart={relChart} kind={rel === 'composite' ? 'composite' : 'davison'} lang={lang} asteroids={showAsteroids} desc={rel === 'composite' ? t.compositeDesc : t.davisonDesc} />
          ) : null}
        </>
      ) : null}
    </View>
  );
}
