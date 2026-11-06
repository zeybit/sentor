import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { TRENDS, TrendCat, stelliumDetail } from '../content/trends';
import { SIGN_RULERS, fmtDeg } from '../engine/astro';
import { BODIES, SIGNS, HOUSES } from '../content/base';
import { Chips, H1, P, Section, Sub, st } from '../ui/kit';
import { C, serif } from '../theme';

export default function TrendsScreen({ embedded }: { embedded?: boolean }) {
  const { chart, s, lang } = useStore();
  const [cat, setCat] = useState<'all' | TrendCat>('all');
  const matched = useMemo(() => (chart ? TRENDS.filter(t => t.match(chart)) : []), [chart]);
  if (!chart) return null;
  const list = matched.filter(t => cat === 'all' || t.cat === cat);
  const cats = (['all', 'love', 'beauty', 'career', 'money', 'personality', 'spiritual'] as const)
    .filter(c => c === 'all' || matched.some(t => t.cat === c))
    .map(c => ({ key: c, label: s.cats[c] }));

  const extra = (id: string) => {
    if (id === 'stellium') return stelliumDetail(chart).map(x => x[lang]).join('\n');
    if (id === 'vertex' && chart.vertex !== null) return `${s.yourVertex}: ${SIGNS[Math.floor(chart.vertex / 30)][lang]} ${fmtDeg(chart.vertex)}`;
    if (id === 'pof' && chart.positions.fortune) {
      const f = chart.positions.fortune;
      return `${SIGNS[f.sign][lang]} ${fmtDeg(f.lon)}, ${HOUSES[f.house - 1].name[lang]}`;
    }
    if (id === 'chartRulerAsp' && chart.asc !== null) {
      const r = SIGN_RULERS[Math.floor(chart.asc / 30)];
      const p = chart.positions[r];
      return `${BODIES[r].name[lang]} → ${SIGNS[p.sign][lang]}, ${HOUSES[p.house - 1].name[lang]} (${HOUSES[p.house - 1].short[lang]})`;
    }
    return '';
  };

  return (
    <View>
      {embedded ? null : <H1>{s.trendsTitle}</H1>}
      <Sub style={{ marginBottom: 14 }}>{s.trendsSub}</Sub>
      <Chips items={cats} value={cat} onChange={setCat} />
      {list.length === 0 ? <P>{s.noTrends}</P> : list.map(tr => (
        <Section key={tr.id}>
          <Text style={{ fontFamily: serif, fontSize: 19, color: C.rose, marginBottom: 6 }}>{tr.tag[lang]}</Text>
          {extra(tr.id) ? <Text style={[st.p, { fontWeight: '700', marginBottom: 6 }]}>{extra(tr.id)}</Text> : null}
          <Text style={st.rowLabel}>{s.claim}</Text>
          <P style={{ marginBottom: 10 }}>{tr.claim[lang]}</P>
          <Text style={st.rowLabel}>{s.reality}</Text>
          <P>{tr.reality[lang]}</P>
        </Section>
      ))}
    </View>
  );
}
