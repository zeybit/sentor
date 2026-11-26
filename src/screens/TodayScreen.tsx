import React, { useCallback, useMemo, useRef } from 'react';
import { ShareToggle, safeName } from '../ui/ShareImage';
import { monthSvg } from '../content/shareCards';
import { Pressable, Text, View } from 'react-native';
import { useNav } from '../nav';
import { birthdayInfo } from './ExploreScreen';
import { useStore } from '../store';
import { computeDaily, MOON_SIGN_DAY, MOON_HOUSE_DAY } from '../content/forecast';
import { BODIES, MOON_PHASE_TIP, SIGNS, SIGN_GLYPHS } from '../content/base';
import { H1, Meter, P, Section, Sub, Expand, st, useLayout } from '../ui/kit';
import SkyBand from '../ui/SkyBand';
import NextPeriod from '../ui/NextPeriod';
import { strength } from '../ui/Readings';
import { lifeAspect } from '../content/lifeTexts';
import { YearCard } from '../ui/LillyBlocks';
import { MonthlyTransits, LunarCalendar, PlanetaryHours, VoidMoon } from '../ui/TodayExtras';
import { PersonalMoon, BestDays } from '../ui/ExtrasUI';
import { T2S } from '../i18n2';
import { C, serif } from '../theme';
import { DayCard, PlanetGuide, Rings, TodayHeader, ZodiacGuide } from '../ui/Cosmic';
import { positionsAt } from '../engine/astro';

export default function TodayScreen() {
  const { chart, s, lang, profile, location } = useStore();
  const t2 = T2S[lang];
  const { inner, wide } = useLayout();
  const nav = useNav();
  const now = new Date();
  const daily = useMemo(() => chart && computeDaily(chart, now), [chart, now.toDateString()]);
  const buildMonth = useCallback(() => (chart ? monthSvg(chart, profile?.name ?? '', lang) : ''), [chart, profile, lang]);
  const calRef = useRef<any>(null);
  if (!chart || !daily) return null;
  const toCal = () => { const el = calRef.current as any; if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const SKY = positionsAt(now, ['sun', 'mars']);
  const sg = (lon: number) => SIGNS[Math.floor(lon / 30) % 12][lang].toLocaleUpperCase(lang === 'tr' ? 'tr' : 'en');
  const tr = lang === 'tr';
  const sc = daily.scores;
  const energies = [
    { title: tr ? 'Kozmik' : 'Cosmic', caption: tr ? `Günlük enerji ${sc.energy}/5` : `Daily energy ${sc.energy}/5`, color: '#F4F1FF' },
    { title: tr ? 'Duygusal' : 'Emotional', caption: tr ? `İç denge ${sc.mood}/5` : `Inner balance ${sc.mood}/5`, color: '#F0A35E' },
    { title: tr ? 'Güneş tonu' : 'Solar tone', caption: tr ? `Güneş ${sg(SKY.sun.lon)} burcunda` : `Sun in ${sg(SKY.sun.lon)}`, color: '#F5C35A' },
    { title: tr ? 'İlişki' : 'Relationship', caption: tr ? `Bağ kurma ${sc.love}/5` : `Connection ${sc.love}/5`, color: '#E8789A' },
    { title: tr ? 'Ay tonu' : 'Lunar tone', caption: `${daily.phase.name[lang]} · %${Math.round(daily.phase.illum * 100)}`, color: '#8F8BFA' },
    { title: tr ? 'Eylem' : 'Actions', caption: tr ? `Mars ${sg(SKY.mars.lon)} burcunda` : `Mars in ${sg(SKY.mars.lon)}`, color: '#6FD3C1' },
  ];
  const pct = (v: number) => Math.round((v / 5) * 100);
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View>
      <TodayHeader name={profile?.name ?? ''} chart={chart} lang={lang} onCalendar={toCal} />
      {profile ? (() => { const bi = birthdayInfo(profile.birth); const since = -bi.daysTo; if (bi.daysTo > 30 || since > 14) return null;
        return (
          <Pressable accessibilityRole="button" onPress={() => nav('explore:year')} style={{ marginTop: 10, marginBottom: 6, padding: 16, borderRadius: 6, backgroundColor: '#0C1517', borderWidth: 1, borderColor: 'rgba(219,182,104,0.45)' }} {...({ dataSet: { pulse: '1' } } as any)}>
            <Text style={{ color: '#F2B84B', fontFamily: serif, fontSize: 22 }}>{bi.daysTo > 0 ? (lang === 'tr' ? `${bi.daysTo} gün sonra ${bi.age} yaşındasın ✦` : `${bi.age} in ${bi.daysTo} days ✦`) : (lang === 'tr' ? `Yeni yaşın kutlu olsun ✦ ${bi.age}` : `Happy birthday ✦ ${bi.age}`)}</Text>
            <Text style={{ color: '#D5E1EA', fontSize: 15, marginTop: 4 }}>{lang === 'tr' ? 'Yeni yaşının hikâyesi hazır: aşk, şans, sınav ve en hareketli ayların. Okumak için dokun →' : 'The story of your new year is ready: love, luck, lessons and your busiest months. Tap to read →'}</Text>
          </Pressable>
        ); })() : null}
      {(() => {
        const rings = <Rings lang={lang} items={[
          { label: tr ? 'Aşk' : 'Love', value: pct(sc.love), color: '#E8789A' },
          { label: tr ? 'Enerji' : 'Energy', value: pct(sc.energy), color: '#6FD3C1' },
          { label: tr ? 'Ruh hali' : 'Mood', value: pct(sc.mood), color: '#F0B35E' },
          { label: tr ? 'Kariyer' : 'Career', value: pct(sc.career), color: '#8F8BFA' },
        ]} />;
        const day = <DayCard lang={lang} energies={energies} onCalendar={toCal} />;
        const guide = <PlanetGuide hits={daily.hits} lang={lang} />;
        const zod = <ZodiacGuide start={chart.positions.sun.sign} lang={lang} />;
        return wide ? (
          <View style={{ flexDirection: 'row', gap: 28, alignItems: 'flex-start' }}>
            <View style={{ flex: 1.25, minWidth: 0 }}>{day}{guide}{rings}</View>
            <View style={{ flex: 1, minWidth: 0, maxWidth: 460 }}>{zod}</View>
          </View>
        ) : <>{day}{guide}{rings}{zod}</>;
      })()}
      <ShareToggle label={lang === 'tr' ? 'Aylık enerji kartın' : 'Your monthly energy card'} build={buildMonth} filename={`aylik-enerji-${safeName(profile?.name ?? 'ben')}.png`} lang={lang} />

      <View style={{ marginTop: 8, marginBottom: 32 }}>
        <SkyBand natal={chart} width={inner(1180)} lang={lang} />
      </View>
      <NextPeriod />

      <Section title={s.moonToday}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <Text style={{ fontSize: 40, color: C.water }}>{SIGN_GLYPHS[daily.moonSign]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: serif, fontSize: 20, color: C.ink }}>{daily.phase.name[lang]}, {SIGNS[daily.moonSign][lang]}</Text>
            <Sub>{lang === 'tr' ? `Aydınlık %${Math.round(daily.phase.illum * 100)}. ` : `${Math.round(daily.phase.illum * 100)}% lit. `}{MOON_PHASE_TIP[daily.phase.idx][lang]}</Sub>
          </View>
        </View>
        <P>{MOON_SIGN_DAY[daily.moonSign][lang]}</P>
        {daily.moonHouse ? <P style={{ marginTop: 6 }}>{MOON_HOUSE_DAY(daily.moonHouse)[lang]}</P> : null}
      </Section>

      <PersonalMoon chart={chart} lang={lang} />

      <Section title={s.activeTransits}>
        {daily.hits.length === 0 ? <P>{s.noTransits}</P> : (
          <Expand more={s.showMore} less={s.showLess} initial={5} items={daily.hits.map((h, i) => {
            const r = lifeAspect(h.transit, h.natal, h.type, 'transit');
            return <View key={i} style={st.row}><Text style={{ fontFamily: serif, fontSize: 18, color: C.ink }}>{r.title[lang]}</Text><Sub>{strength(h.orb, lang)}</Sub><P style={{ marginTop: 4 }}>{r.body[lang]}</P></View>;
          })} />
        )}
      </Section>

      <VoidMoon lang={lang} tz={location?.tz ?? chart.input.tz} />
      {location ? <PlanetaryHours t={t2} lang={lang} lat={location.lat} lon={location.lon} tz={location.tz} /> : null}

      <MonthlyTransits natal={chart} t={t2} lang={lang} tz={location?.tz ?? chart.input.tz} />

      <BestDays chart={chart} kind="career" lang={lang} />

      <YearCard chart={chart} lang={lang} />

      <View ref={calRef} />
      <LunarCalendar t={t2} lang={lang} tz={location?.tz ?? chart.input.tz} natal={chart} />

      <Section title={s.retrogrades}>
        <P>{daily.retrogrades.length ? daily.retrogrades.map(r => `${BODIES[r].glyph} ${BODIES[r].name[lang]}`).join('   ') : s.none}</P>
      </Section>

    </View>
  );
}
