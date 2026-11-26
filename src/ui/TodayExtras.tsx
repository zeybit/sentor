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
import { houseOf, norm, positionsAt } from '../engine/astro';
import { lunationHouseText } from '../content/loveExtras';
import { MOON_SIGN_DAY } from '../content/forecast';
import { HOUSES } from '../content/base';
const PHASE_DO = {
  new: { tr: 'Yeni bir başlangıç için niyet etme zamanı.', en: 'Time to set an intention for a fresh start.' },
  firstQuarter: { tr: 'Harekete geç: ilk engeller çıkar, vazgeçme.', en: 'Take action: first obstacles appear, keep going.' },
  full: { tr: 'Sonuçlar ve duygular görünür olur; bir konu netleşir.', en: 'Results and feelings come to light; something becomes clear.' },
  lastQuarter: { tr: 'Toparlan ve bırak: işe yaramayanı geride bırakma zamanı.', en: 'Tidy up and let go of what no longer works.' },
} as const;
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
      <Sub style={{ marginBottom: 6 }}>{lang === 'tr' ? 'Ay her ay aynı dört evreden geçer: yeni ayda niyet et, ilk dördünde harekete geç, dolunayda sonucu gör, son dördünde bırak.' : 'Every month the Moon passes the same four phases: set intentions at the new moon, act at the first quarter, see results at the full moon, let go at the last quarter.'}</Sub>
      {data.lun.map((x, i) => (
        <View key={i} style={[st.row, { flexDirection: 'row', gap: 10, alignItems: 'center' }]}>
          <Text style={{ fontSize: 22, color: C.ink, width: 26 }}>{icon[x.kind]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[st.p, { fontWeight: '600' }]}>{t.phaseNames[x.kind]} · {SIGNS[Math.floor(x.lon / 30)][lang]}</Text>
            <Sub>{fmtLocal(x.date, tz)}</Sub>
            <P style={{ marginTop: 2 }}>{natal && natal.cusps.length && (x.kind === 'new' || x.kind === 'full') ? lunationHouseText(x.kind, houseOf(norm(x.lon - natal.ayanamsa), natal.cusps))[lang] : PHASE_DO[x.kind][lang]}</P>
          </View>
        </View>
      ))}
      <Text style={{ fontFamily: serif, fontSize: 22, color: C.ink, marginTop: 26 }}>{lang === 'tr' ? 'Günlerin duygusal havası' : 'The mood of the days'}</Text>
      <Sub style={{ marginTop: 2, marginBottom: 6 }}>{lang === 'tr' ? 'Ay her 2–3 günde bir burç değiştirir ve o günlerin havasını belirler: neye hevesli, neye hassas olacağını.' : 'The Moon changes sign every 2–3 days and sets the mood: what you will feel keen on and sensitive about.'}</Sub>
      {(() => {
        const nowT = Date.now();
        const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1));
        const spans = data.ing.map((x, i) => ({ sign: x.sign, from: x.date, to: data.ing[i + 1]?.date ?? end }));
        const shown = spans.filter(sp => sp.to.getTime() > nowT);
        const list = shown.length ? shown : spans;
        const d = (dt: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: tz }).format(dt);
        return <Expand more={lang === 'tr' ? 'Sonraki günleri göster' : 'Show later days'} less={lang === 'tr' ? 'Daha az' : 'Less'} initial={3} items={list.map((sp, i) => {
          const cur = sp.from.getTime() <= nowT && sp.to.getTime() > nowT;
          const ref = cur ? new Date(nowT) : new Date((sp.from.getTime() + sp.to.getTime()) / 2);
          const h = natal && natal.cusps.length ? houseOf(norm(positionsAt(ref, ['moon']).moon.lon - natal.ayanamsa), natal.cusps) : 0;
          return (
            <View key={i} style={[st.row, cur ? { borderLeftWidth: 3, borderLeftColor: C.gold, paddingLeft: 10 } : null]}>
              <Text style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: 1.2, color: cur ? C.gold : C.sub }}>{cur ? (lang === 'tr' ? 'ŞU AN · ' : 'NOW · ') : ''}{d(sp.from)} – {d(sp.to)}</Text>
              <Text style={[st.p, { fontWeight: '600', marginTop: 2 }]}>{SIGNS[sp.sign][lang]} {lang === 'tr' ? 'günleri' : 'days'}</Text>
              <P style={{ marginTop: 2 }}>{MOON_SIGN_DAY[sp.sign][lang].replace(/^[^:]+:\s*/, '')}</P>
              {h ? <Sub style={{ marginTop: 2 }}>{lang === 'tr' ? `Senin için: ${HOUSES[h - 1].short.tr.toLocaleLowerCase('tr')} konuları hassaslaşır.` : `For you: ${HOUSES[h - 1].short.en.toLowerCase()} matters feel more sensitive.`}</Sub> : null}
            </View>
          );
        })} />;
      })()}
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
