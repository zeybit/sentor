import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { buildPortfolio } from '../content/portfolio';
import { SIGNS, HOUSES } from '../content/base';
import { ord } from '../content/life';
import { H1, P, Row, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { TodayHub } from '../ui/Cosmic';
import { scrollTop } from '../nav';
import TrendsScreen from './TrendsScreen';
import { takePendingKind } from '../nav';
import StyleScreen from './StyleScreen';
import { STYLE_M } from '../content/looksMale';
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

function Report({ only }: { only?: 's1' | 's2' | 's3' | 's4' | 'advice' }) {
  const { chart, s, lang, profile } = useStore();
  const pf = useMemo(() => chart && buildPortfolio(chart), [chart]);
  if (!chart || !pf) return null;
  const t = s.pf;
  const { aura, beauty, spouse, core } = pf;
  const male = profile?.gender === 'm';
  const venusS = chart.positions.venus.sign, ascS = chart.asc !== null ? Math.floor(chart.asc / 30) : null;
  const wardrobe = male ? [STYLE_M[ascS ?? venusS].clothes, ...(ascS !== null && ascS !== venusS ? [STYLE_M[venusS].clothes] : []), STYLE_M[venusS].accessories] : aura.wardrobe;

  return (
    <View>

      {(!only || only === 's1') ? <>
      <Section title={only ? undefined : t.s1}>
        <Row label={t.aesthetic}>{aura.aesthetic[lang]}</Row>
        <Row label={t.body}>{aura.body[lang]}</Row>
        {aura.lilly.length ? <Row label={t.lillyBody}>{aura.lilly.map(x => x[lang]).join('\n\n')}</Row> : null}
        <Row label={t.wardrobe}>{wardrobe.map(w => w[lang]).join('\n\n')}</Row>
        {aura.firstHouse.length ? <Row label={t.firstHouse}>{aura.firstHouse.map(f => f[lang]).join('\n\n')}</Row> : null}
        <View style={st.row}>
          <Text style={st.rowLabel}>{t.palette}</Text>
          <Swatches lang={lang} items={aura.palette} />
          {aura.classicColours ? <Sub style={{ marginTop: 8 }}>{aura.classicColours[lang]}</Sub> : null}
        </View>
      </Section>
      </> : null}

      {(!only || only === 's2') ? <>
      <Section title={only ? undefined : male ? (lang === 'tr' ? '2. Bakım, saç ve görünüm' : '2. Grooming, hair and look') : t.s2}>
        {male ? <Row label={lang === 'tr' ? 'Bakım' : 'Grooming'}>{STYLE_M[venusS].grooming[lang]}</Row> : <>
        <Row label={t.makeup}>{`${beauty.trend[lang]}. ${beauty.makeup[lang]}`}</Row>
        <Row label={t.finish}>{beauty.finish[lang]}</Row></>}
        {beauty.feature ? <Row label={t.feature}>{beauty.feature[lang]}</Row> : null}
        {male ? <Row label={t.hairCut}>{STYLE_M[ascS ?? venusS].hair[lang]}</Row> : <>
        <View style={st.row}><Text style={st.rowLabel}>{t.lip}</Text><Swatches lang={lang} items={beauty.lip} /></View>
        <View style={st.row}><Text style={st.rowLabel}>{t.blush}</Text><Swatches lang={lang} items={beauty.blush} /></View>
        {beauty.hairCut ? <Row label={t.hairCut}>{beauty.hairCut[lang]}</Row> : null}
        <Row label={t.hairColor}>{beauty.hairColor[lang]}</Row></>}
        {beauty.venusMods.length ? <Row label={t.venusMods}>{beauty.venusMods.map(v => v[lang]).join('\n\n')}</Row> : null}
      </Section>
      </> : null}

      {(!only || only === 's3') ? <>
      <Section title={only ? undefined : t.s3}>
        {spouse.desc === null ? <P>{s.needsTime}</P> : (
          <>
            <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink, marginBottom: 4 }}>
              {lang === 'tr' ? `Alçalan (7. ev) ${SIGNS[spouse.desc].tr}` : `Descendant (7th) in ${SIGNS[spouse.desc].en}`}
            </Text>
            <Row label={t.look}>{spouse.look![lang]}</Row>
            {spouse.lilly.length ? <Row label={t.lillySpouse}>{spouse.lilly.map(x => x[lang]).join('\n\n')}</Row> : null}
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
      </> : null}

      {(!only || only === 's4') ? <>
      <Section title={only ? undefined : t.s4}>
        {core.chartRuler ? <Row label={t.chartRuler}>{core.chartRuler[lang]}</Row> : null}
        {core.career ? <Row label={t.careerT}>{`${core.career[lang]}${core.in10.length ? '\n\n' + core.in10.map(x => x[lang]).join('\n\n') : ''}`}</Row> : null}
        {core.careerFields ? <Row label={t.fields}>{core.careerFields[lang]}</Row> : null}
        {core.lillyCareer.length ? <Row label={t.lillyCareer}>{core.lillyCareer.map(x => x[lang]).join('\n\n')}</Row> : null}
        {core.work6 ? <Row label={s.workStyle}>{core.work6[lang]}</Row> : null}
        <Row label={s.luck}>{core.luck[lang]}</Row>
        <Row label={s.saturnLesson}>{core.lesson[lang]}</Row>
        {core.money2 ? <Row label={t.money2}>{core.money2[lang]}</Row> : null}
        {core.money8 ? <Row label={t.money8}>{core.money8[lang]}</Row> : null}
        <Row label={t.mind}>{`${core.mind[lang]}${core.ninth ? ' ' + core.ninth[lang] : ''}`}</Row>
        <Row label={t.node}>
          {`${lang === 'tr' ? `Kuzey Düğüm ${SIGNS[core.node.sign].tr}${core.node.house ? `, ${core.node.house}. ev` : ''}` : `North Node in ${SIGNS[core.node.sign].en}${core.node.house ? `, ${ord(core.node.house)} house` : ''}`}\n${t.grow}: ${core.node.grow[lang]}\n${t.release}: ${core.node.release[lang]}`}
        </Row>
        {(!chart.cusps.length) ? <Sub>{s.needsTime}</Sub> : null}
      </Section>
      </> : null}

      {(!only || only === 'advice') ? <>
      <Section title={only ? undefined : t.advice}>
        {core.advice.map((a, i) => (
          <View key={i} style={[st.row, { flexDirection: 'row', gap: 12 }]}>
            <Text style={{ fontFamily: serif, fontSize: 22, color: C.rose, width: 22 }}>{i + 1}</Text>
            <P style={{ flex: 1 }}>{a[lang]}</P>
          </View>
        ))}
      </Section>
      </> : null}
    </View>
  );
}

type Part = 'report' | 'style' | 'trends';
export default function PortfolioScreen() {
  const { s, lang, profile } = useStore();
  const pend = takePendingKind();
  const [topic, setTopic] = useState<string | null>(() => pend === 'style' || pend === 'trends' ? pend : null);
  const { wide } = useLayout();
  const strip = (x: string) => x.replace(/^\d+\.\s*/, '');
  const t = s.pf;
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  return (
    <View>
      <H1>{t.title}</H1>
      <Sub style={{ marginBottom: 18, maxWidth: 620 }}>{profile?.name ? `${profile.name}. ` : ''}{t.method}</Sub>
      <TodayHub lang={lang} heading="" cols={wide ? 3 : 2} open={topic} onOpen={k => { setTopic(k); scrollTop(); }} back={L('Portföye dön', 'Back to portfolio')} items={[
        { key: 's1', glyph: '◇', title: strip(t.s1), teaser: L('Estetiğin, duruşun, gardırobun, renklerin', 'Your aesthetic, posture, wardrobe, colours'), body: <Report only="s1" /> },
        { key: 's2', glyph: '✿', title: profile?.gender === 'm' ? L('Bakım, saç ve görünüm', 'Grooming, hair and look') : strip(t.s2), teaser: profile?.gender === 'm' ? L('Bakım ve saç kesimi', 'Grooming and haircut') : L('Makyaj, ten, saç, ruj tonları', 'Makeup, skin, hair, lip shades'), body: <Report only="s2" /> },
        { key: 's3', glyph: '♀', title: strip(t.s3), teaser: L('Eşin nasıl biri, nerede tanışırsınız', 'Who your partner is, where you meet'), body: <Report only="s3" /> },
        { key: 's4', glyph: '◎', title: strip(t.s4), teaser: L('Kariyer, para, zihin, karmik yol', 'Career, money, mind, karmic path'), body: <Report only="s4" /> },
        { key: 'advice', glyph: '✦', title: strip(t.advice), teaser: L('Hemen uygulayabileceğin adımlar', 'Steps you can take right away'), body: <Report only="advice" /> },
        { key: 'style', glyph: '✂', title: L('Stil ve görünüm', 'Style and looks'), teaser: L('Sana yakışan tarz, kumaş, aksesuar', 'Styles, fabrics and accessories that suit you'), body: <StyleScreen /> },
        { key: 'trends', glyph: '↗', title: L('Trendler', 'Trends'), teaser: L('Sosyal medyadaki burç trendleri', 'Zodiac trends on social media'), body: <TrendsScreen embedded /> },
      ]} />
    </View>
  );
}
