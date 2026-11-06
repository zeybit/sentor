import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Chart } from '../engine/astro';
import { transitsBetween, lunations, moonSignIngresses, planetaryHours } from '../engine/techniques';
import { BODIES, SIGNS, ASPECT_INFO } from '../content/base';
import { transitText, HOUR_USE, ptName } from '../content/techniqueTexts';
import { Expand, P, Section, Sub, st } from './kit';
import { C, F, serif } from '../theme';
import type { T2 } from '../i18n2';
import { fmtLocal, fmtTime, tzOffsetMinutes } from '../util';
import { houseOf, norm } from '../engine/astro';
import { lunationHouseText } from '../content/loveExtras';
import { voidOfCourse } from '../engine/techniques';

/** Boşlukta Ay: yeni işlere başlamak için uygun olmayan saatler */
export function VoidMoon({ lang, tz }: { lang: Lang; tz: string }) {
  const now = new Date();
  const v = useMemo(() => voidOfCourse(new Date(now.getTime() - 2 * 864e5)), [now.toDateString()]);
  const next = useMemo(() => (v && v.end < now ? voidOfCourse(now) : v), [v]);
  if (!next) return null;
  const active = now >= next.start && now < next.end;
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  return (
    <Section title={L('Boşlukta Ay', 'Void-of-course Moon')}>
      <P style={{ fontFamily: F.sansMed }}>{active
        ? L(`Ay şu an boşlukta. ${fmtLocal(next.end, tz)} saatinde ${SIGNS[next.sign].tr} burcuna geçene kadar sürecek.`, `The Moon is void right now, until it enters ${SIGNS[next.sign].en} at ${fmtLocal(next.end, tz)}.`)
        : L(`Sıradaki boşluk: ${fmtLocal(next.start, tz)} – ${fmtLocal(next.end, tz)}`, `Next void period: ${fmtLocal(next.start, tz)} – ${fmtLocal(next.end, tz)}`)}</P>
      <Sub style={{ marginTop: 4, maxWidth: 640 }}>{L('Ay burç değiştirmeden önce başka hiçbir gezegenle açı yapmadığında “boşlukta” sayılır. Bu saatlerde başlayan işlerin genellikle beklenen sonucu vermediği kabul edilir; önemli kararları, imzaları ve yeni başlangıçları ertelemek, bunun yerine dinlenmek ve toparlanmak iyi gelir.', 'The Moon is “void” when it makes no aspects before changing sign. Things started then are said to rarely turn out as expected; it’s better to postpone big decisions, signatures and new starts and use the time to rest.')}</Sub>
    </Section>
  );
}

type Lang = 'tr' | 'en';

function MonthNav({ month, setMonth, lang }: { month: Date; setMonth: (d: Date) => void; lang: Lang }) {
  const label = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(month);
  const go = (k: number) => setMonth(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + k, 1)));
  const B = ({ t, f }: { t: string; f: () => void }) => (
    <Pressable onPress={f} accessibilityRole="button" style={({ pressed }) => [{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: C.line }, pressed && { opacity: 0.6 }]}><Text style={{ color: C.ink, fontSize: 16 }}>{t}</Text></Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <B t="‹" f={() => go(-1)} />
      <Text style={{ fontFamily: serif, fontSize: 18, color: C.ink, textTransform: 'capitalize' }}>{label}</Text>
      <B t="›" f={() => go(1)} />
    </View>
  );
}

export function MonthlyTransits({ natal, t, lang, tz }: { natal: Chart; t: T2; lang: Lang; tz: string }) {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const data = useMemo(() => {
    const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
    return transitsBetween(natal, month, end);
  }, [natal, month]);
  return (
    <Section title={t.monthly}>
      <MonthNav month={month} setMonth={setMonth} lang={lang} />
      {data.stations.length ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={st.rowLabel}>{t.stations}</Text>
          {data.stations.map((x, i) => <Text key={i} style={[st.p, { paddingVertical: 2 }]}><Text style={{ color: C.rose }}>{fmtLocal(x.date, tz, false)}</Text>  {BODIES[x.body].glyph} {BODIES[x.body].name[lang]} {x.kind === 'retro' ? t.retroStart : t.directStart}</Text>)}
        </View>
      ) : null}
      {data.ingresses.length ? (
        <View style={{ marginBottom: 8 }}>
          <Text style={st.rowLabel}>{t.ingresses}</Text>
          {data.ingresses.map((x, i) => <Text key={i} style={[st.p, { paddingVertical: 2 }]}><Text style={{ color: C.rose }}>{fmtLocal(x.date, tz, false)}</Text>  {BODIES[x.body].glyph} {BODIES[x.body].name[lang]} {lang === 'tr' ? `${SIGNS[x.sign].tr} ${t.enters}` : `${t.enters} ${SIGNS[x.sign].en}`}</Text>)}
        </View>
      ) : null}
      <Expand more={lang === 'tr' ? 'Tümünü göster' : 'Show all'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={10} items={data.events.map((e, i) => {
        const r = transitText(e.transit, e.natal, e.type);
        return (
          <View key={i} style={st.row}>
            <Text style={[st.p, { fontWeight: '600' }]}><Text style={{ color: C.rose }}>{fmtLocal(e.date, tz, false)}</Text>  {BODIES[e.transit].glyph} {ASPECT_INFO[e.type].glyph} {ptName(e.natal)[lang]}{e.retro ? ' ℞' : ''}</Text>
            <Sub>{r.title[lang]}</Sub>
            <P style={{ marginTop: 2 }}>{r.body[lang]}</P>
          </View>
        );
      })} />
      {!data.events.length ? <P>{t.none}</P> : null}
    </Section>
  );
}

export function LunarCalendar({ t, lang, tz, natal }: { t: T2; lang: Lang; tz: string; natal?: Chart }) {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const data = useMemo(() => {
    const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
    return { lun: lunations(month, end), ing: moonSignIngresses(month, end) };
  }, [month]);
  const icon = { new: '●', firstQuarter: '◐', full: '○', lastQuarter: '◑' } as const;
  return (
    <Section title={t.lunarCal}>
      <MonthNav month={month} setMonth={setMonth} lang={lang} />
      {data.lun.map((x, i) => (
        <View key={i} style={[st.row, { flexDirection: 'row', gap: 10, alignItems: 'center' }]}>
          <Text style={{ fontSize: 22, color: C.ink, width: 26 }}>{icon[x.kind]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.p, { fontWeight: '600' }]}>{t.phaseNames[x.kind]} — {SIGNS[Math.floor(x.lon / 30)][lang]} {Math.floor(x.lon % 30)}°</Text>
            <Sub>{fmtLocal(x.date, tz)}</Sub>
            {natal && natal.cusps.length && (x.kind === 'new' || x.kind === 'full') ? <P style={{ marginTop: 2 }}>{lunationHouseText(x.kind, houseOf(norm(x.lon - natal.ayanamsa), natal.cusps))[lang]}</P> : null}
          </View>
        </View>
      ))}
      <Text style={[st.rowLabel, { marginTop: 10 }]}>{t.moonIngress}</Text>
      <Expand more={lang === 'tr' ? 'Tümünü göster' : 'Show all'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={6} items={data.ing.map((x, i) => (
        <Text key={i} style={[st.p, { paddingVertical: 2 }]}><Text style={{ color: C.rose }}>{fmtLocal(x.date, tz)}</Text>  ☽ → {SIGNS[x.sign][lang]}</Text>
      ))} />
    </Section>
  );
}

export function PlanetaryHours({ t, lang, lat, lon, tz }: { t: T2; lang: Lang; lat: number; lon: number; tz: string }) {
  const now = new Date();
  const off = tzOffsetMinutes(tz, now);
  const data = useMemo(() => planetaryHours(new Date(now.getTime() + off * 60000), lat, lon, off), [lat, lon, off, now.toDateString()]);
  if (!data) return null;
  const cur = data.hours.find(h => now >= h.start && now < h.end);
  return (
    <Section title={t.hoursTitle}>
      <Sub>{t.sunrise} {fmtTime(data.sunrise, tz)}, {t.sunset} {fmtTime(data.sunset, tz)}, {t.dayRuler}: {BODIES[data.dayRuler].glyph} {BODIES[data.dayRuler].name[lang]}</Sub>
      {cur ? <P style={{ marginTop: 8 }}><Text style={{ fontWeight: '700', color: C.rose }}>{t.nowHour}: {BODIES[cur.ruler].glyph} {BODIES[cur.ruler].name[lang]}</Text> — {HOUR_USE[cur.ruler]?.[lang]}</P> : null}
      <Expand more={lang === 'tr' ? 'Tüm saatleri göster' : 'Show all hours'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={0} items={data.hours.map((h, i) => (
        <View key={i} style={[st.row, { flexDirection: 'row', gap: 10, paddingVertical: 6, backgroundColor: h === cur ? C.roseSoft : 'transparent' }]}>
          <Text style={[st.p, { width: 104, fontVariant: ['tabular-nums'] }]}>{fmtTime(h.start, tz)}–{fmtTime(h.end, tz)}</Text>
          <Text style={[st.p, { width: 92 }]}>{BODIES[h.ruler].glyph} {BODIES[h.ruler].name[lang]}</Text>
          <Text style={[st.sub, { flex: 1 }]}>{h.day ? t.dayH : t.nightH}</Text>
        </View>
      ))} />
    </Section>
  );
}
