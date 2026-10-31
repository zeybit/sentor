import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { computeChart, BodyId } from '../engine/astro';
import { VENUS } from '../content/placements';
import { MARS_DESIRE, PARTNER, DATING, VENUS_HOUSE_MEET, PLANET_IN_7, signOfCusp, houseRulerText } from '../content/life';
import { synastry, SYN_LABEL } from '../content/forecast';
import { concord } from '../content/lillyNatal';
import { SIGNS } from '../content/base';
import BirthForm, { BirthFormValue } from '../ui/BirthForm';
import { Bar, Btn, Expand, H1, P, Row, Section, Sub, st } from '../ui/kit';
import { C, serif } from '../theme';

export default function LoveScreen() {
  const { chart, s, lang, hs } = useStore();
  const [partner, setPartner] = useState<BirthFormValue | null>(null);
  const [editing, setEditing] = useState(false);
  const syn = useMemo(() => {
    if (!chart || !partner) return null;
    try { const pc = computeChart(partner.birth, hs); return { ...synastry(chart, pc), lilly: concord(chart, pc) }; } catch { return null; }
  }, [chart, partner, hs]);
  if (!chart) return null;
  const P_ = chart.positions;
  const desc = signOfCusp(chart, 7), fifth = signOfCusp(chart, 5);
  const in7 = (Object.keys(PLANET_IN_7) as BodyId[]).filter(p => P_[p]?.house === 7);

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
        {!partner || editing ? (
          <BirthForm initial={partner} nameLabel={s.partnerName} submitLabel={s.calcCompat} onSubmit={v => { setPartner(v); setEditing(false); }} />
        ) : syn ? (
          <View>
            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Text style={{ fontFamily: serif, fontSize: 52, color: C.rose }}>%{syn.total}</Text>
              <Sub>{s.overall}{partner.name ? ` · ${partner.name}` : ''}</Sub>
            </View>
            {syn.parts.map(p => <Bar key={p.key} label={SYN_LABEL[p.key][lang]} pct={p.score} />)}
            <Text style={[st.h2, { marginTop: 10 }]}>{s.keyAspects}</Text>
            <Expand more={s.showMore} less={s.showLess} initial={6} items={syn.aspects.map((a, i) => (
              <View key={i} style={st.row}><P>{a.text[lang]}</P><Sub>orb {a.orb.toFixed(1)}°</Sub></View>
            ))} />
            {syn.lilly ? (
              <View style={{ marginTop: 10 }}>
                <Text style={st.h2}>{syn.lilly.title[lang]}</Text>
                {syn.lilly.items.map((it, i) => <View key={i} style={st.row}><P>{it.text[lang]}</P></View>)}
              </View>
            ) : null}
            <Btn kind="ghost" title={s.editPartner} onPress={() => setEditing(true)} />
          </View>
        ) : null}
      </Section>
    </View>
  );
}
