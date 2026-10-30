import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { buildPortfolio } from '../content/portfolio';
import { SIGNS, HOUSES } from '../content/base';
import { ord } from '../content/life';
import { H1, P, Row, Section, Sub, st } from '../ui/kit';
import { C, serif } from '../theme';

type Sw = { name: { tr: string; en: string }; hex: string };

function Swatches({ items, lang }: { items: Sw[]; lang: 'tr' | 'en' }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
      {items.map((c, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 6 }}>
          <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.hex, borderWidth: 1, borderColor: C.line }} />
          <Text style={st.p}>{c.name[lang]}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PortfolioScreen() {
  const { chart, s, lang, profile } = useStore();
  const pf = useMemo(() => chart && buildPortfolio(chart), [chart]);
  if (!chart || !pf) return null;
  const t = s.pf;
  const { aura, beauty, spouse, core } = pf;

  return (
    <View>
      <Sub>{profile?.name}</Sub>
      <H1>{t.title}</H1>
      <Sub style={{ marginBottom: 14 }}>{t.method}</Sub>

      <Section title={t.s1}>
        <Row label={t.aesthetic}>{aura.aesthetic[lang]}</Row>
        <Row label={t.body}>{aura.body[lang]}</Row>
        <Row label={t.wardrobe}>{aura.wardrobe.map(w => w[lang]).join('\n\n')}</Row>
        {aura.firstHouse.length ? <Row label={t.firstHouse}>{aura.firstHouse.map(f => f[lang]).join('\n\n')}</Row> : null}
        <View style={st.row}>
          <Text style={st.rowLabel}>{t.palette}</Text>
          <Swatches lang={lang} items={aura.palette} />
        </View>
      </Section>

      <Section title={t.s2}>
        <Row label={t.makeup}>{`${beauty.trend[lang]}. ${beauty.makeup[lang]}`}</Row>
        <Row label={t.finish}>{beauty.finish[lang]}</Row>
        {beauty.feature ? <Row label={t.feature}>{beauty.feature[lang]}</Row> : null}
        <View style={st.row}><Text style={st.rowLabel}>{t.lip}</Text><Swatches lang={lang} items={beauty.lip} /></View>
        <View style={st.row}><Text style={st.rowLabel}>{t.blush}</Text><Swatches lang={lang} items={beauty.blush} /></View>
        {beauty.hairCut ? <Row label={t.hairCut}>{beauty.hairCut[lang]}</Row> : null}
        <Row label={t.hairColor}>{beauty.hairColor[lang]}</Row>
        {beauty.venusMods.length ? <Row label={t.venusMods}>{beauty.venusMods.map(v => v[lang]).join('\n\n')}</Row> : null}
      </Section>

      <Section title={t.s3}>
        {spouse.desc === null ? <P>{s.needsTime}</P> : (
          <>
            <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink, marginBottom: 4 }}>
              {lang === 'tr' ? `Alçalan (7. ev) ${SIGNS[spouse.desc].tr}` : `Descendant (7th) in ${SIGNS[spouse.desc].en}`}
            </Text>
            <Row label={t.look}>{spouse.look![lang]}</Row>
            <Row label={t.personality}>{spouse.personality![lang]}</Row>
            <Row label={t.career}>{spouse.career![lang]}</Row>
            {spouse.meet ? <Row label={t.meet}>{`${spouse.meet[lang]}${spouse.ruler ? `\n${spouse.ruler[lang]}` : ''}`}</Row> : null}
            {spouse.in7.length ? <Row label={t.in7}>{spouse.in7.map(x => x[lang]).join('\n\n')}</Row> : null}
          </>
        )}
        {spouse.juno ? <Row label={t.juno}>{`${spouse.juno[lang]}${spouse.junoHouse ? (lang === 'tr' ? ` Juno ${spouse.junoHouse}. evde: bağlılık temaların ${HOUSES[spouse.junoHouse - 1].area.tr} alanında yaşanır.` : ` Juno in the ${ord(spouse.junoHouse)}: commitment themes play out through ${HOUSES[spouse.junoHouse - 1].area.en}.`) : ''}`}</Row> : null}
        <Row label={t.dynamic}>{spouse.dynamic[lang]}</Row>
        <Sub style={{ marginTop: 8 }}>{t.note}</Sub>
      </Section>

      <Section title={t.s4}>
        {core.chartRuler ? <Row label={t.chartRuler}>{core.chartRuler[lang]}</Row> : null}
        {core.career ? <Row label={t.careerT}>{`${core.career[lang]}${core.in10.length ? '\n\n' + core.in10.map(x => x[lang]).join('\n\n') : ''}`}</Row> : null}
        {core.careerFields ? <Row label={t.fields}>{core.careerFields[lang]}</Row> : null}
        {core.money2 ? <Row label={t.money2}>{core.money2[lang]}</Row> : null}
        {core.money8 ? <Row label={t.money8}>{core.money8[lang]}</Row> : null}
        <Row label={t.mind}>{`${core.mind[lang]}${core.ninth ? ' ' + core.ninth[lang] : ''}`}</Row>
        <Row label={t.node}>
          {`${lang === 'tr' ? `Kuzey Düğüm ${SIGNS[core.node.sign].tr}${core.node.house ? `, ${core.node.house}. ev` : ''}` : `North Node in ${SIGNS[core.node.sign].en}${core.node.house ? `, ${ord(core.node.house)} house` : ''}`}\n${t.grow}: ${core.node.grow[lang]}\n${t.release}: ${core.node.release[lang]}`}
        </Row>
        {(!chart.cusps.length) ? <Sub>{s.needsTime}</Sub> : null}
      </Section>

      <Section title={t.advice}>
        {core.advice.map((a, i) => (
          <View key={i} style={[st.row, { flexDirection: 'row', gap: 12 }]}>
            <Text style={{ fontFamily: serif, fontSize: 22, color: C.rose, width: 22 }}>{i + 1}</Text>
            <P style={{ flex: 1 }}>{a[lang]}</P>
          </View>
        ))}
      </Section>
    </View>
  );
}
