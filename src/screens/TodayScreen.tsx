import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { computeDaily, MOON_SIGN_DAY, MOON_HOUSE_DAY } from '../content/forecast';
import { BODIES, MOON_PHASE_TIP, SIGNS, SIGN_GLYPHS } from '../content/base';
import { H1, Meter, P, Section, Sub, Expand, st, useLayout } from '../ui/kit';
import SkyBand from '../ui/SkyBand';
import NextPeriod from '../ui/NextPeriod';
import { strength } from '../ui/Readings';
import { YearCard } from '../ui/LillyBlocks';
import { MonthlyTransits, LunarCalendar, PlanetaryHours, VoidMoon } from '../ui/TodayExtras';
import { T2S } from '../i18n2';
import { C, serif } from '../theme';

export default function TodayScreen() {
  const { chart, s, lang, profile, location } = useStore();
  const t2 = T2S[lang];
  const { inner } = useLayout();
  const now = new Date();
  const daily = useMemo(() => chart && computeDaily(chart, now), [chart, now.toDateString()]);
  if (!chart || !daily) return null;
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View>
      <Sub>{fmt.format(now)}</Sub>
      <H1>{profile?.name ? `${profile.name}, ${s.todayFor.toLocaleLowerCase(lang)}` : s.todayFor}</H1>

      <View style={{ marginTop: 8, marginBottom: 32 }}>
        <SkyBand natal={chart} width={inner(760)} lang={lang} />
      </View>
      <NextPeriod />

      <Section>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16 }}>
          <Meter label={s.scores.love} value={daily.scores.love} />
          <Meter label={s.scores.career} value={daily.scores.career} />
          <Meter label={s.scores.energy} value={daily.scores.energy} />
          <Meter label={s.scores.mood} value={daily.scores.mood} />
        </View>
      </Section>

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

      <Section title={s.activeTransits}>
        {daily.hits.length === 0 ? <P>{s.noTransits}</P> : (
          <Expand more={s.showMore} less={s.showLess} initial={5} items={daily.hits.map((h, i) => (
            <View key={i} style={st.row}><P>{h.text[lang]}</P><Sub>{strength(h.orb, lang)}</Sub></View>
          ))} />
        )}
      </Section>

      <VoidMoon lang={lang} tz={location?.tz ?? chart.input.tz} />
      {location ? <PlanetaryHours t={t2} lang={lang} lat={location.lat} lon={location.lon} tz={location.tz} /> : null}

      <MonthlyTransits natal={chart} t={t2} lang={lang} tz={location?.tz ?? chart.input.tz} />

      <YearCard chart={chart} lang={lang} />

      <LunarCalendar t={t2} lang={lang} tz={location?.tz ?? chart.input.tz} natal={chart} />

      <Section title={s.retrogrades}>
        <P>{daily.retrogrades.length ? daily.retrogrades.map(r => `${BODIES[r].glyph} ${BODIES[r].name[lang]}`).join('   ') : s.none}</P>
      </Section>

    </View>
  );
}
