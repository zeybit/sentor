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
import { spouseProfile, marriageWindows, spouseArchetype, spouseJob } from '../content/spouse';
import { WindowCard } from './FutureScreen';
import { useNav } from '../nav';
import { F } from '../theme';
import { ActivityIndicator, Pressable } from 'react-native';
import { useEffect } from 'react';
import type { Window } from '../engine/timeline';
import { SynastryReport, SynastryTables, RelChartReport, synAspects } from '../ui/RelationshipViews';
import { T2S } from '../i18n2';
import BirthForm from '../ui/BirthForm';
import Wheel from '../ui/Wheel';
import Tables from '../ui/Tables';
import { Bar, Btn, Chips, P, Row, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, serif } from '../theme';

type Rel = 'synastry' | 'composite' | 'davison';

export default function LoveScreen() {
  const { chart, s, lang, opts, people, profile, addPerson, chartOf, showAsteroids } = useStore();
  const t = T2S[lang];
  const { inner } = useLayout();
  const width = inner(760) + 32;
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
      <SpouseBlock />

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
            {rel === 'synastry' ? <Wheel chart={chart} outer={pc} cross={data.wheelCross} size={Math.min(width - 32, 460)} asteroids={showAsteroids} /> : <Wheel chart={relChart!} size={Math.min(width - 32, 460)} asteroids={showAsteroids} />}
            {rel === 'synastry' ? <Text style={[st.sub, { marginTop: 6 }]}><Text style={{ color: C.second }}>● {partner.name}</Text>   {profile.name}</Text> : null}
          </View>
          <Segmented items={[{ key: 'readings', label: t.views.readings }, { key: 'tables', label: t.views.tables }]} value={view} onChange={v => setView(v as any)} />

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
                <Sub style={{ marginTop: 6 }}>{lang === 'tr' ? '0–30 zayıf, 30–50 orta, 50–80 iyi, 80–100 mükemmel' : '0–30 weak, 30–50 average, 50–80 good, 80–100 perfect'}</Sub>
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

/** Gelecekteki eş tahmini ve evlilik zamanı */
function SpouseBlock() {
  const { chart, lang, s, profile, setProfile } = useStore();
  const nav = useNav();
  const gender = profile?.gender ?? null;
  const [wins, setWins] = useState<Window[] | null>(null);
  useEffect(() => {
    setWins(null);
    if (!chart) return;
    const id = setTimeout(() => setWins(marriageWindows(chart)), 30);
    return () => clearTimeout(id);
  }, [chart]);
  if (!chart) return null;
  const base = spouseProfile(chart, lang) ?? [];
  const job = spouseJob(chart);
  const prof = chart.cusps.length || gender ? [
    ...(gender ? [spouseArchetype(chart, gender)] : []),
    ...base.filter(x => x.id !== 'life'),
    ...(job ? [job] : []),
    ...base.filter(x => x.id === 'life'),
  ] : null;
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const P_ = chart.positions;
  return (
    <Section title={L('Gelecekteki eşin', 'Your future partner')}>
      <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: C.sub, marginBottom: 16, maxWidth: 640 }}>
        {L('Haritanda evlilik ve uzun süreli ilişkileri anlatan yedinci ev, onun gezegeni ve aşk gezegeni Venüs birlikte okunduğunda, hayatına girecek ciddi partnerin hakkında bir portre çıkar. Her bölümün altında bunun haritanın neresinden geldiğini görebilirsin.',
          'Reading your seventh house (marriage and long-term bonds), its planet and Venus, the planet of love, together gives a portrait of the serious partner who will enter your life. Under each part you can see where in your chart it comes from.')}
      </Text>
      <View style={[st.panel, { marginBottom: 20, paddingVertical: 14 }]}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: C.ink, marginBottom: 4 }}>{L('Haritanda eşi temsil eden gezegen cinsiyete göre değişir', 'The planet that represents a spouse depends on gender')}</Text>
        <Sub style={{ marginBottom: 8 }}>{L('Klasik astrolojide kadın haritasında Güneş, erkek haritasında Ay eşi anlatır. Seçimin bu kişi için kaydedilir.', 'In classical astrology the Sun describes the spouse in a woman’s chart and the Moon in a man’s. Your choice is saved for this person.')}</Sub>
        <Chips items={[{ key: 'f', label: L('Kadın', 'Woman') }, { key: 'm', label: L('Erkek', 'Man') }, { key: 'x', label: L('Belirtmek istemiyorum', 'Prefer not to say') }]}
          value={gender ?? 'x'} onChange={v => profile && setProfile({ ...profile, gender: v === 'x' ? undefined : (v as 'f' | 'm') })} />
      </View>
      {prof ? prof.map(x => (
        <View key={x.id} style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink }}>{x.title[lang]}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 4, maxWidth: 660 }}>{x.text[lang]}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 20, color: C.sub, marginTop: 4 }}>{L('Neden: ', 'Why: ')}{x.why[lang]}</Text>
        </View>
      )) : <P>{s.needsTime}</P>}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink }}>{L('Nasıl seversin, nasıl çekersin?', 'How you love and attract')}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 4, maxWidth: 660 }}>
          {L(`Venüs’ün ${SIGNS[P_.venus.sign].tr} burcunda. ${VENUS[P_.venus.sign].tr} Mars’ın da ${SIGNS[P_.mars.sign].tr} burcunda. ${MARS_DESIRE[P_.mars.sign].tr}`,
            `Your Venus is in ${SIGNS[P_.venus.sign].en}: ${VENUS[P_.venus.sign].en} Your Mars is in ${SIGNS[P_.mars.sign].en}: ${MARS_DESIRE[P_.mars.sign].en}`)}
        </Text>
      </View>
      <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginBottom: 8 }}>{L('Ne zaman?', 'When?')}</Text>
      {wins === null ? <ActivityIndicator color={C.rose} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
        : wins.length ? (
          <>
            <Sub style={{ marginBottom: 12, maxWidth: 640 }}>{L('Önümüzdeki yıllarda ciddi bir ilişki ya da evlilik için en güçlü görünen dönemler:', 'The strongest-looking periods ahead for a serious relationship or marriage:')}</Sub>
            {wins.map((w, i) => <WindowCard key={i} w={w} lang={lang} showTip={false} />)}
          </>
        ) : <P>{L('Önümüzdeki yıllarda belirgin bir dönem çıkmadı.', 'No marked period found for the coming years.')}</P>}
      <Pressable onPress={() => nav('future')} accessibilityRole="link" style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
        <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{L('Bütün hayat takvimini aç', 'Open your full life calendar')}</Text>
      </Pressable>
    </Section>
  );
}
