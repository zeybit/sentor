import React from 'react';
import { View } from 'react-native';
import { useStore } from '../store';
import type { BodyId } from '../engine/astro';
import { MC_CAREER, WORK_STYLE, MONEY_STYLE, PLANET_IN_10, signOfCusp, planetInHouse, houseRulerText } from '../content/life';
import { SATURN, JUPITER, SUN } from '../content/placements';
import { SIGNS } from '../content/base';
import { H1, P, Row, Section, Sub } from '../ui/kit';

export default function CareerScreen() {
  const { chart, s, lang } = useStore();
  if (!chart) return null;
  const P_ = chart.positions;
  const mc = chart.mc !== null ? Math.floor(chart.mc / 30) : null;
  const sixth = signOfCusp(chart, 6), second = signOfCusp(chart, 2);
  const in10 = (Object.keys(PLANET_IN_10) as BodyId[]).filter(p => P_[p]?.house === 10);

  return (
    <View>
      <H1>{s.tabs.career}</H1>
      {mc !== null ? (
        <Section title={`${s.careerPath} · ${SIGNS[mc][lang]}`}>
          <P>{MC_CAREER[mc].text[lang]}</P>
          <Row label={s.fields}>{MC_CAREER[mc].fields[lang]}</Row>
          {houseRulerText(chart, 10) ? <Sub style={{ marginTop: 6 }}>{houseRulerText(chart, 10)![lang]}</Sub> : null}
        </Section>
      ) : (
        <Section title={s.careerPath}><P>{s.needsTime}</P><P style={{ marginTop: 8 }}>{SUN[P_.sun.sign][lang]}</P></Section>
      )}

      <Section>
        {in10.length ? <Row label={s.tenthPlanets}>{in10.map(p => PLANET_IN_10[p]![lang]).join('\n\n')}</Row> : null}
        {sixth !== null ? <Row label={`${s.workStyle} · ${SIGNS[sixth][lang]}`}>{WORK_STYLE[sixth][lang]}</Row> : null}
        {second !== null ? <Row label={`${s.money} · ${SIGNS[second][lang]}`}>{MONEY_STYLE[second][lang]}</Row> : null}
        <Row label={`${s.luck} · ${SIGNS[P_.jupiter.sign][lang]}`}>
          {JUPITER[P_.jupiter.sign][lang]}{P_.jupiter.house ? ' ' + planetInHouse('jupiter', P_.jupiter.house)[lang] : ''}
        </Row>
        <Row label={`${s.saturnLesson} · ${SIGNS[P_.saturn.sign][lang]}`}>
          {SATURN[P_.saturn.sign][lang]}{P_.saturn.house ? ' ' + planetInHouse('saturn', P_.saturn.house)[lang] : ''}
        </Row>
      </Section>
    </View>
  );
}
