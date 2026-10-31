import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { STYLE, buildStyleReport } from '../content/style';
import { SIGNS } from '../content/base';
import { H2, P, Row, Section, Sub } from '../ui/kit';
import { C, serif } from '../theme';

export default function StyleScreen() {
  const { chart, s, lang } = useStore();
  const r = useMemo(() => chart && buildStyleReport(chart), [chart]);
  if (!chart || !r) return null;
  const v = STYLE[r.venus];
  const a = r.asc !== null ? STYLE[r.asc] : null;

  return (
    <View>
      <H2 style={{ fontSize: 30, lineHeight: 36 }}>{v.aesthetic[lang]}{a ? ` × ${a.aesthetic[lang]}` : ''}</H2>
      <Sub style={{ marginBottom: 14 }}>{lang === 'tr'
        ? `Venüs ${SIGNS[r.venus].tr}${r.asc !== null ? `, Yükselen ${SIGNS[r.asc].tr}` : ''}, Ay ${SIGNS[r.moon].tr}`
        : `Venus in ${SIGNS[r.venus].en}${r.asc !== null ? `, ${SIGNS[r.asc].en} Rising` : ''}, Moon in ${SIGNS[r.moon].en}`}</Sub>

      <Section title={s.palette}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {r.palette.map((c, i) => (
            <View key={i} style={{ width: 92 }}>
              <View style={{ height: 64, borderRadius: 14, backgroundColor: c.hex, borderWidth: 1, borderColor: C.line }} />
              <Text style={{ fontSize: 13, color: C.ink, marginTop: 4, fontWeight: '600' }}>{c.name[lang]}</Text>
              <Text style={{ fontSize: 11, color: C.sub }}>{c.from[lang]}</Text>
            </View>
          ))}
        </View>
        <P style={{ marginTop: 12 }}>{r.elementTip[lang]}</P>
      </Section>

      <Section title={s.styleSig} sub={`${s.styleSigSub} (${SIGNS[r.venus][lang]})`}>
        <Row label={s.clothes}>{v.clothes[lang]}</Row>
        <Row label={s.makeup}>{v.makeup[lang]}</Row>
        <Row label={s.accessories}>{v.accessories[lang]}</Row>
        <Row label={s.scent}>{v.scent[lang]}</Row>
        <Row label={s.avoid}>{v.avoid[lang]}</Row>
      </Section>

      {a ? (
        <Section title={s.firstImpression} sub={`${s.firstImpressionSub}, ${SIGNS[r.asc!][lang]}`}>
          <Row label={s.clothes}>{a.clothes[lang]}</Row>
          <Row label={s.hair}>{a.hair[lang]}</Row>
          <Row label={s.makeup}>{a.makeup[lang]}</Row>
        </Section>
      ) : (
        <Section title={s.firstImpression}>
          <P>{s.needsTime}</P>
          <Row label={s.hair}>{v.hair[lang]}</Row>
        </Section>
      )}

      {r.firstHouse.length ? (
        <Section title={s.firstHouse}>
          {r.firstHouse.map((f, i) => <P key={i} style={{ marginBottom: 8 }}>{f[lang]}</P>)}
        </Section>
      ) : null}

      <Section>
        <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.comfort}</Text>
        <P style={{ marginBottom: 10 }}>{STYLE[r.moon].comfort[lang]}</P>
        <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.power}</Text>
        <P style={{ marginBottom: 10 }}>{STYLE[r.mars].power[lang]}</P>
        {r.mc !== null ? <>
          <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.work}</Text>
          <P>{STYLE[r.mc].work[lang]}</P>
        </> : null}
      </Section>
    </View>
  );
}
