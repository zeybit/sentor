import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { computeDaily, skyCalendar, MOON_SIGN_DAY, MOON_HOUSE_DAY } from '../content/forecast';
import { BODIES, MOON_PHASE_TIP, SIGNS, SIGN_GLYPHS } from '../content/base';
import { H1, Meter, P, Section, Sub, Expand, st } from '../ui/kit';
import { C, serif } from '../theme';

export default function TodayScreen() {
  const { chart, s, lang, profile } = useStore();
  const now = new Date();
  const daily = useMemo(() => chart && computeDaily(chart, now), [chart, now.toDateString()]);
  const cal = useMemo(() => skyCalendar(now, 45), [now.toDateString()]);
  if (!chart || !daily) return null;
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtShort = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' });

  return (
    <View>
      <Sub>{fmt.format(now)}</Sub>
      <H1>{profile?.name ? `${profile.name}, ${s.todayFor.toLocaleLowerCase(lang)}` : s.todayFor}</H1>

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
            <Text style={{ fontFamily: serif, fontSize: 18, color: C.ink }}>{daily.phase.name[lang]} · {SIGNS[daily.moonSign][lang]}</Text>
            <Sub>%{Math.round(daily.phase.illum * 100)} · {MOON_PHASE_TIP[daily.phase.idx][lang]}</Sub>
          </View>
        </View>
        <P>{MOON_SIGN_DAY[daily.moonSign][lang]}</P>
        {daily.moonHouse ? <P style={{ marginTop: 6 }}>{MOON_HOUSE_DAY(daily.moonHouse)[lang]}</P> : null}
      </Section>

      <Section title={s.activeTransits}>
        {daily.hits.length === 0 ? <P>{s.noTransits}</P> : (
          <Expand more={s.showMore} less={s.showLess} initial={5} items={daily.hits.map((h, i) => (
            <View key={i} style={st.row}><P>{h.text[lang]}</P><Sub>orb {h.orb.toFixed(1)}°</Sub></View>
          ))} />
        )}
      </Section>

      <Section title={s.retrogrades}>
        <P>{daily.retrogrades.length ? daily.retrogrades.map(r => `${BODIES[r].glyph} ${BODIES[r].name[lang]}`).join('   ') : s.none}</P>
      </Section>

      <Section title={s.calendar}>
        {cal.map((e, i) => (
          <View key={i} style={[st.row, { flexDirection: 'row', gap: 12 }]}>
            <Text style={[st.p, { width: 64, color: e.kind === 'lunation' ? C.rose : C.sub, fontWeight: '700' }]}>{fmtShort.format(e.date)}</Text>
            <Text style={[st.p, { flex: 1 }]}>{e.text[lang]}</Text>
          </View>
        ))}
      </Section>
    </View>
  );
}
