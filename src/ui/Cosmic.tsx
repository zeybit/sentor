// "Gece moru" tasarım bileşenleri: buzlu cam kartlar, hafta şeridi, enerji ızgarası, gezegen rehberi,
// yüzde halkaları, burç kaydırıcısı (takımyıldız + bugün/yarın/hafta), harita hapları ve çekirdek enerji kartları.
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, RadialGradient, Stop } from 'react-native-svg';
import type { BodyId, Chart } from '../engine/astro';
import { positionsAt, SIGN_RULERS } from '../engine/astro';
import { BODIES, ELEMENTS, HOUSES, SIGNS, SIGN_ELEMENT, SIGN_GLYPHS } from '../content/base';
import { ASC, placementText } from '../content/placements';
import { lifeAspect } from '../content/lifeTexts';
import type { TransitHit } from '../content/forecast';
import { CONSTELLATIONS } from './constellations';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const web = Platform.OS === 'web';
const tx = (lang: Lang, tr: string, en: string) => (lang === 'tr' ? tr : en);
const signOf = (lon: number) => Math.floor((((lon % 360) + 360) % 360) / 30);

/** Buzlu cam kart */
export function Glass({ children, style, pad = 18 }: { children: React.ReactNode; style?: any; pad?: number }) {
  return (
    <View style={[{ backgroundColor: 'rgba(30,33,78,0.52)', borderRadius: 24, padding: pad, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
      web ? ({ backdropFilter: 'blur(22px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 60px -34px rgba(0,0,0,0.7)' } as any) : null, style]}>
      {children}
    </View>
  );
}
export function Kicker({ children, color, style }: { children: React.ReactNode; color?: string; style?: any }) {
  return <Text style={[{ fontFamily: F.mono, fontSize: 11, letterSpacing: 1.4, color: color ?? C.sub, textTransform: 'uppercase' }, style]}>{children}</Text>;
}
function Pill({ children, onPress, active }: { children: React.ReactNode; onPress?: () => void; active?: boolean }) {
  const body = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: active ? C.gold : 'rgba(255,255,255,0.16)', backgroundColor: active ? C.goldSoft : 'rgba(255,255,255,0.03)', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13 }}>
      {typeof children === 'string' ? <Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink, letterSpacing: 0.6 }}>{children}</Text> : children}
    </View>
  );
  return onPress ? <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [pressed && { opacity: 0.7 }]}>{body}</Pressable> : body;
}

// ---------------- Bugün: başlık, hafta şeridi, enerji ızgarası ----------------
const DAYS_TR = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'], DAYS_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const SIGN_DATES: { tr: string; en: string }[] = [
  ['21 Mar – 19 Nis', 'Mar 21 – Apr 19'], ['20 Nis – 20 May', 'Apr 20 – May 20'], ['21 May – 20 Haz', 'May 21 – Jun 20'], ['21 Haz – 22 Tem', 'Jun 21 – Jul 22'],
  ['23 Tem – 22 Ağu', 'Jul 23 – Aug 22'], ['23 Ağu – 22 Eyl', 'Aug 23 – Sep 22'], ['23 Eyl – 22 Eki', 'Sep 23 – Oct 22'], ['23 Eki – 21 Kas', 'Oct 23 – Nov 21'],
  ['22 Kas – 21 Ara', 'Nov 22 – Dec 21'], ['22 Ara – 19 Oca', 'Dec 22 – Jan 19'], ['20 Oca – 18 Şub', 'Jan 20 – Feb 18'], ['19 Şub – 20 Mar', 'Feb 19 – Mar 20'],
].map(([tr, en]) => ({ tr, en }));

export function TodayHeader({ name, chart, lang, onCalendar }: { name: string; chart: Chart; lang: Lang; onCalendar?: () => void }) {
  const i = chart.input, sun = chart.positions.sun.sign;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 30, lineHeight: 36, color: C.ink, letterSpacing: -0.4 }}>{name || tx(lang, 'Bugün', 'Today')}</Text>
        <Kicker style={{ marginTop: 4 }}>{`${String(i.day).padStart(2, '0')}.${String(i.month).padStart(2, '0')}.${i.year}  ·  ${SIGN_GLYPHS[sun]} ${SIGNS[sun][lang]}`}</Kicker>
      </View>
      {onCalendar ? (
        <Pressable onPress={onCalendar} accessibilityRole="button" accessibilityLabel={tx(lang, 'Gökyüzü takvimi', 'Sky calendar')}
          style={({ pressed }) => [{ width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.7 }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx={12} cy={12} r={8.5} stroke={C.ink} strokeWidth={1.5} fill="none" /><Line x1={12} y1={12} x2={12} y2={7.5} stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" /><Line x1={12} y1={12} x2={15} y2={13.5} stroke={C.ink} strokeWidth={1.5} strokeLinecap="round" /></Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

export interface Energy { title: string; caption: string; color: string }
export function DayCard({ lang, energies, onCalendar }: { lang: Lang; energies: Energy[]; onCalendar?: () => void }) {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const mon = new Date(now); mon.setDate(now.getDate() - dow);
  const days = [...Array(7)].map((_, k) => { const d = new Date(mon); d.setDate(mon.getDate() + k); return d; });
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long' });
  return (
    <Glass style={{ marginBottom: 26 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <Text style={{ fontFamily: F.sans, fontSize: 20, color: C.ink }}>{tx(lang, 'Bugün', 'Today')}, {fmt.format(now)}</Text>
        {onCalendar ? <Pill onPress={onCalendar}><Text style={{ fontFamily: F.mono, fontSize: 11, color: C.ink, letterSpacing: 1 }}>{tx(lang, 'GÖKYÜZÜ TAKVİMİ', 'SKY CALENDAR')}</Text></Pill> : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 6 }}>
        {days.map((d, k) => {
          const on = k === dow;
          return (
            <View key={k} style={{ alignItems: 'center', flex: 1 }} accessibilityLabel={d.toDateString()}>
              <Text style={{ fontFamily: F.mono, fontSize: 10.5, color: on ? C.ink : C.sub, letterSpacing: 0.6 }}>{(lang === 'tr' ? DAYS_TR : DAYS_EN)[k]}</Text>
              <View style={{ marginTop: 8, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? 'rgba(255,255,255,0.16)' : 'transparent', borderWidth: on ? 1 : 0, borderColor: 'rgba(255,255,255,0.25)' }}>
                <Text style={{ fontFamily: F.mono, fontSize: 14, color: on ? C.ink : C.sub }}>{String(d.getDate()).padStart(2, '0')}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 }}>
        {energies.map((e, k) => (
          <View key={k} style={{ width: '50%', flexDirection: 'row', gap: 12, paddingVertical: 11, paddingRight: 8 }}>
            <View style={{ width: 14, height: 14, marginTop: 4, alignItems: 'center', justifyContent: 'center' }}>
              <View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: e.color }, web ? ({ boxShadow: `0 0 10px 3px ${e.color}` } as any) : null]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: F.sans, fontSize: 16.5, color: C.ink }}>{e.title}</Text>
              <Kicker style={{ fontSize: 10, marginTop: 2 }}>{e.caption}</Kicker>
            </View>
          </View>
        ))}
      </View>
    </Glass>
  );
}

// ---------------- Gezegen rehberi ----------------
const SPHERE: Partial<Record<BodyId, [string, string, string]>> = {
  sun: ['#FFF1C2', '#F5B544', '#A55A12'], moon: ['#FAF7EE', '#B8B3A6', '#55524C'], mercury: ['#E7E1D6', '#9B958C', '#47433F'],
  venus: ['#FBF0D6', '#D9BC84', '#7C6036'], mars: ['#FFC2A1', '#D2643C', '#6E2412'], jupiter: ['#F7E5C6', '#C99A66', '#6C4626'],
  saturn: ['#FBEBC0', '#D4AE62', '#6E5222'], uranus: ['#DDFBFB', '#7FCBD2', '#2E6C74'], neptune: ['#CBD7FF', '#5D74D6', '#1F2C78'],
  pluto: ['#E9DED2', '#9C8878', '#4A3C32'], lilith: ['#D9D0F2', '#7A6BB0', '#2E2550'],
};
function Sphere({ id, size }: { id: BodyId; size: number }) {
  const c = SPHERE[id] ?? SPHERE.moon!;
  const r = size / 2;
  return (
    <Svg width={size * (id === 'saturn' ? 1.5 : 1)} height={size} viewBox={id === 'saturn' ? `${-r * 0.5} 0 ${size * 1.5} ${size}` : `0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id={`sp-${id}`} cx="35%" cy="30%" r="75%">
          <Stop offset="0" stopColor={c[0]} /><Stop offset="0.55" stopColor={c[1]} /><Stop offset="1" stopColor={c[2]} />
        </RadialGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r * 0.98} fill={`url(#sp-${id})`} />
      {id === 'jupiter' ? [0.35, 0.5, 0.64].map((y, k) => <Ellipse key={k} cx={r} cy={size * y} rx={r * 0.95} ry={size * 0.03} fill={c[2]} opacity={0.22} />) : null}
      {id === 'saturn' ? <Ellipse cx={r} cy={r} rx={r * 1.45} ry={r * 0.32} stroke={c[0]} strokeWidth={size * 0.035} fill="none" opacity={0.85} /> : null}
    </Svg>
  );
}

export function PlanetGuide({ hits, lang, onMore }: { hits: TransitHit[]; lang: Lang; onMore?: () => void }) {
  const seen = new Set<string>();
  const list = hits.filter(h => (seen.has(h.transit) ? false : (seen.add(h.transit), true))).slice(0, 6);
  if (!list.length) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      <Pressable onPress={onMore} disabled={!onMore} accessibilityRole={onMore ? 'button' : undefined} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 20, color: C.ink }}>{tx(lang, 'Gezegen rehberi', 'Planetary guidance')}</Text>
        {onMore ? <Text style={{ fontSize: 22, color: C.sub }}>›</Text> : null}
      </Pressable>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {list.map((h, k) => {
          const r = lifeAspect(h.transit, h.natal, h.type, 'transit');
          return (
            <Glass key={k} pad={16} style={{ width: 178, height: 210, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: F.sans, fontSize: 18, color: C.ink }}>{BODIES[h.transit].name[lang]}</Text>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: C.ink }}>{BODIES[h.transit].glyph}</Text>
                </View>
              </View>
              <Text numberOfLines={4} style={{ fontFamily: F.mono, fontSize: 11.5, lineHeight: 16, color: C.ink, opacity: 0.85, marginTop: 10, maxWidth: 140 }}>{r.title[lang]}</Text>
              <View style={{ position: 'absolute', right: h.transit === 'saturn' ? -50 : -26, bottom: -30 }} pointerEvents="none">
                <Sphere id={h.transit} size={112} />
              </View>
            </Glass>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ---------------- Yüzde halkaları ----------------
export function Rings({ items, lang }: { items: { label: string; value: number; color: string }[]; lang: Lang }) {
  return (
    <View style={{ marginBottom: 30 }}>
      <Text style={{ fontFamily: F.sans, fontSize: 20, color: C.ink, marginBottom: 14 }}>{tx(lang, 'Enerji odağın', 'Energy focus')}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 14 }}>
        {items.map((it, k) => {
          const S = 76, sw = 4, R = (S - sw) / 2 - 2, L = 2 * Math.PI * R, v = Math.max(0, Math.min(100, it.value));
          return (
            <View key={k} style={{ alignItems: 'center', width: '25%', minWidth: 78 }} accessibilityLabel={`${it.label}: %${v}`}>
              <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
                <Svg width={S} height={S} style={{ position: 'absolute' }}>
                  <Circle cx={S / 2} cy={S / 2} r={R} stroke="rgba(255,255,255,0.10)" strokeWidth={sw} fill="rgba(10,11,34,0.35)" />
                  <Circle cx={S / 2} cy={S / 2} r={R} stroke={it.color} strokeWidth={sw} fill="none" strokeLinecap="round"
                    strokeDasharray={`${(L * v) / 100} ${L}`} transform={`rotate(-90 ${S / 2} ${S / 2})`} />
                </Svg>
                <Text style={{ fontFamily: F.mono, fontSize: 15, color: C.ink }}>{v}%</Text>
              </View>
              <Kicker style={{ marginTop: 8, fontSize: 10.5 }}>{it.label}</Kicker>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------- Burç rehberi ----------------
type When = 'today' | 'tomorrow' | 'week';
function signReading(sel: number, when: When, lang: Lang) {
  const d = new Date(); if (when === 'tomorrow') d.setDate(d.getDate() + 1); if (when === 'week') d.setDate(d.getDate() + 3);
  const P = positionsAt(d, ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']);
  const hs = (b: string) => ((signOf(P[b].lon) - sel + 12) % 12) + 1;
  const area = (h: number) => HOUSES[h - 1].area[lang];
  const short = (h: number) => HOUSES[h - 1].short[lang].toLocaleLowerCase(lang === 'tr' ? 'tr' : 'en');
  const hm = hs('moon'), hv = hs('venus'), hma = hs('mars'), hsu = hs('sun'), hj = hs('jupiter');
  const moodTr = [1, 5, 9].includes(hm) ? 'Duygusal olarak akıştasın; içinden geleni yapmak iyi sonuç verir.' : [4, 7, 10].includes(hm) ? 'Duygularla görevler çekişebilir; acele kararı bir gün ertele.' : 'Sakin, dengeli bir gün; küçük işleri bitirmek için uygun.';
  const moodEn = [1, 5, 9].includes(hm) ? 'You are emotionally in flow; following your gut pays off.' : [4, 7, 10].includes(hm) ? 'Feelings and duties may pull against each other; sleep on rash decisions.' : 'A calm, balanced day, good for finishing small tasks.';
  const text = when === 'week'
    ? tx(lang, `Bu hafta Güneş ${SIGNS[sel].tr} için ${hsu}. evde: ${area(hsu)} öne çıkıyor. Venüs ${hv}. evden ${area(hv)} alanını tatlandırıyor; Mars ${hma}. evde ${area(hma)} konusunda harekete geçiriyor. Jüpiter’in desteği ${area(hj)} tarafında.`,
      `This week the Sun is in ${SIGNS[sel].en}’s house ${hsu}: ${area(hsu)} take the lead. Venus sweetens ${area(hv)} from house ${hv}; Mars in house ${hma} pushes you to act on ${area(hma)}. Jupiter supports ${area(hj)}.`)
    : tx(lang, `Ay ${when === 'today' ? 'bugün' : 'yarın'} ${SIGNS[sel].tr} için ${hm}. evde: odak ${short(hm)}. ${moodTr} Venüs ${hv}. evde, ${area(hv)} konularında tatlı bir rüzgâr var.`,
      `${when === 'today' ? 'Today' : 'Tomorrow'} the Moon is in ${SIGNS[sel].en}’s house ${hm}: focus on ${short(hm)}. ${moodEn} Venus in house ${hv} brings a sweet breeze to ${area(hv)}.`);
  const cats: { key: string; label: string; houses: number[] }[] = [
    { key: 'career', label: tx(lang, 'Kariyer', 'Career'), houses: [10, 6, 1] }, { key: 'love', label: tx(lang, 'Aşk', 'Love'), houses: [5, 7, 1] },
    { key: 'family', label: tx(lang, 'Aile', 'Family'), houses: [4, 3] }, { key: 'money', label: tx(lang, 'Para', 'Money'), houses: [2, 8] },
    { key: 'luck', label: tx(lang, 'Şans', 'Luck'), houses: [9, 11, 1] },
  ];
  const W: Record<string, number> = { jupiter: 22, venus: 18, sun: 10, moon: when === 'week' ? 0 : 9, mercury: 6, mars: -8, saturn: -14 };
  const bars = cats.map(c => {
    let v = 52;
    for (const b of Object.keys(W)) { const h = hs(b); if (c.houses.includes(h)) v += b === 'mars' && c.key === 'career' ? 12 : W[b] * (h === c.houses[0] ? 1 : 0.6); }
    if ([1, 5, 9].includes(hm)) v += 6; if ([4, 7, 10].includes(hm)) v -= 4;
    return { label: c.label, v: Math.max(12, Math.min(96, Math.round(v))) };
  });
  return { text, bars, date: d };
}

export function ZodiacGuide({ start, lang }: { start: number; lang: Lang }) {
  const [sel, setSel] = useState(start);
  const [when, setWhen] = useState<When>('today');
  const r = useMemo(() => signReading(sel, when, lang), [sel, when, lang]);
  const con = CONSTELLATIONS[sel];
  const ruler = SIGN_RULERS[sel], el = SIGN_ELEMENT[sel];
  const step = (k: number) => setSel((sel + k + 12) % 12);
  const dfmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' });
  return (
    <Glass style={{ marginBottom: 30, paddingTop: 22 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontFamily: F.sans, fontSize: 22, color: C.ink }}>{SIGNS[sel][lang]}</Text>
        <Kicker style={{ marginTop: 4 }}>{SIGN_DATES[sel][lang]}</Kicker>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
        {[-2, -1, 0, 1, 2].map(k => {
          const i = (sel + k + 12) % 12, on = k === 0;
          return (
            <Pressable key={k} onPress={() => step(k)} accessibilityRole="button" accessibilityLabel={SIGNS[i][lang]} accessibilityState={{ selected: on }}
              style={{ width: on ? 70 : 52, height: 70, alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : Math.abs(k) === 1 ? 0.55 : 0.28 }}>
              {on ? <Svg width={66} height={66} style={{ position: 'absolute' }}><Circle cx={33} cy={33} r={30} stroke="rgba(255,255,255,0.45)" strokeWidth={1} strokeDasharray="3 4" fill="rgba(255,255,255,0.04)" /></Svg> : null}
              <Text style={{ fontSize: on ? 30 : 22, color: C.ink }}>{SIGN_GLYPHS[i]}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ alignItems: 'center', marginVertical: 8 }} accessibilityLabel={tx(lang, `${con.name.tr} takımyıldızı`, `${con.name.en} constellation`)}>
        <Svg width={220} height={170} viewBox="-6 -6 112 112">
          {con.edges.map(([a, b], k) => <Line key={k} x1={con.stars[a][0]} y1={con.stars[a][1]} x2={con.stars[b][0]} y2={con.stars[b][1]} stroke="rgba(220,224,255,0.55)" strokeWidth={0.5} />)}
          {con.stars.map(([x, y, m], k) => <React.Fragment key={k}>
            <Circle cx={x} cy={y} r={(4 - m) * 1.6} fill="rgba(255,255,255,0.10)" />
            <Circle cx={x} cy={y} r={(4 - m) * 0.62} fill="#FFFFFF" />
          </React.Fragment>)}
        </Svg>
      </View>
      <View style={{ flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', marginBottom: 14 }}>
        {(['today', 'tomorrow', 'week'] as When[]).map(w => {
          const on = w === when;
          return (
            <Pressable key={w} onPress={() => setWhen(w)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={{ paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: on ? C.violet : 'transparent', marginBottom: -1 }}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 15.5, color: on ? C.ink : C.sub }}>{w === 'today' ? tx(lang, 'Bugün', 'Today') : w === 'tomorrow' ? tx(lang, 'Yarın', 'Tomorrow') : tx(lang, 'Bu hafta', 'This week')}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.sub }}><Text style={{ color: C.violet }}>{BODIES[ruler].glyph} </Text>{BODIES[ruler].name[lang]}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.sub }}><Text style={{ color: C.violet }}>◈ </Text>{ELEMENTS[el][lang]}</Text>
      </View>
      <Text style={{ fontFamily: F.sans, fontSize: 15.5, lineHeight: 24, color: C.ink, opacity: 0.88 }}>
        <Text style={{ fontFamily: F.mono, fontSize: 12.5, color: C.ink, opacity: 1 }}>{when === 'week' ? tx(lang, 'BU HAFTA. ', 'THIS WEEK. ') : dfmt.format(r.date).toLocaleUpperCase(lang === 'tr' ? 'tr' : 'en') + '. '}</Text>{r.text}
      </Text>
      <View style={{ marginTop: 18, gap: 12 }}>
        {r.bars.map((b, k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }} accessibilityLabel={`${b.label}: %${b.v}`}>
            <Text style={{ width: 70, textAlign: 'right', fontFamily: F.sans, fontSize: 14.5, color: C.ink }}>{b.label}</Text>
            <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <View style={[{ width: `${b.v}%`, height: 4, borderRadius: 2, backgroundColor: C.violet }, web ? ({ backgroundImage: `linear-gradient(90deg, ${C.violet}, ${C.gold})`, boxShadow: `0 0 10px ${C.glow}` } as any) : null]} />
            </View>
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub, marginTop: 14 }}>{tx(lang, 'Burç yorumu güneş burcuna göre genel bir okumadır; kişisel yorumun yukarıda.', 'Sign readings are general, by Sun sign; your personal reading is above.')}</Text>
    </Glass>
  );
}

// ---------------- Harita: haplar ve çekirdek enerjiler ----------------
export function ChartPills({ chart, place, gmt, onEdit }: { chart: Chart; place: string; gmt: string; onEdit?: () => void }) {
  const i = chart.input;
  const pad = (n: number) => String(n).padStart(2, '0');
  const arrow = <Text style={{ color: C.sub, fontSize: 14 }}>›</Text>;
  const pill = (t: string) => <Pill onPress={onEdit}><Text style={{ fontFamily: F.mono, fontSize: 12, color: C.ink, letterSpacing: 0.5 }}>{t}</Text>{onEdit ? arrow : null}</Pill>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 4 }}>
      {pill(`${pad(i.day)}.${pad(i.month)}.${i.year}`)}
      {pill(i.timeKnown ? `${pad(i.hour)}:${pad(i.minute)}` : '—:—')}
      {pill(`${place.split(',')[0].toLocaleUpperCase('tr')}, ${gmt}`)}
    </View>
  );
}

export function CoreEnergies({ chart, lang }: { chart: Chart; lang: Lang }) {
  const first = (s: string, n = 2) => (s.match(/[^.!?]+[.!?]+/g) ?? [s]).slice(0, n).join(' ').trim();
  const items: { kicker: string; title: string; glyph: string; color: string; sign: number; text: string }[] = [
    { kicker: tx(lang, 'Temel kimlik', 'Core identity'), title: BODIES.sun.name[lang], glyph: '●', color: '#F5C35A', sign: chart.positions.sun.sign, text: first(placementText('sun', chart.positions.sun.sign)[lang]) },
    { kicker: tx(lang, 'Duygu dünyan', 'Emotional world'), title: BODIES.moon.name[lang], glyph: '☾', color: '#9DA6F2', sign: chart.positions.moon.sign, text: first(placementText('moon', chart.positions.moon.sign)[lang]) },
  ];
  if (chart.asc !== null) { const a = signOf(chart.asc); items.push({ kicker: tx(lang, 'Dış görünüşün', 'How you come across'), title: tx(lang, 'Yükselen', 'Rising'), glyph: '↑', color: C.gold, sign: a, text: first(ASC[a][lang]) }); }
  return (
    <View style={{ marginTop: 6, marginBottom: 10 }}>
      <Text style={{ fontFamily: F.sans, fontSize: 22, color: C.ink, marginBottom: 12 }}>{tx(lang, 'Çekirdek enerjiler', 'Core energies')}</Text>
      <View style={{ gap: 10 }}>
        {items.map((it, k) => (
          <Glass key={k} pad={16}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Kicker>{it.kicker}</Kicker>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 }}>
                <Text style={{ fontFamily: F.sans, fontSize: 12.5, color: C.ink }}>{SIGNS[it.sign][lang]}</Text>
                <Text style={{ fontSize: 13, color: C.ink }}>{SIGN_GLYPHS[it.sign]}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <Text style={[{ fontSize: 13, color: it.color }, web ? ({ textShadow: `0 0 10px ${it.color}` } as any) : null]}>{it.glyph}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 21, color: C.ink }}>{it.title}</Text>
            </View>
            <Text style={{ fontFamily: F.mono, fontSize: 12, lineHeight: 18, color: C.ink, opacity: 0.82, marginTop: 6 }}>{it.text}</Text>
          </Glass>
        ))}
      </View>
    </View>
  );
}
