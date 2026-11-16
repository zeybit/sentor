// Az bilinen kişisel hesapların ekran bileşenleri
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { Chart } from '../engine/astro';
import { birthSecrets, personalLunarPhase, bestDays, skyAge, DayKind, GoodDay } from '../engine/extras';
import { More, Section, Sub, st } from './kit';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);

/** Harita → Doğum: doğum anının az bilinen işaretleri */
export function BirthSecrets({ chart, lang }: { chart: Chart; lang: Lang }) {
  const items = useMemo(() => birthSecrets(chart), [chart]);
  if (!items.length) return null;
  const card = (it: (typeof items)[number]) => (
    <View key={it.id} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold }}>{it.title[lang]}</Text>
      <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 2 }}>{it.text[lang]}</Text>
    </View>
  );
  return (
    <View style={[st.panel, { marginBottom: 36 }]} {...({ dataSet: { lift: '1' } } as any)}>
      <Text style={[st.rowLabel, { marginBottom: 6 }]}>{tx('Nadir ayrıntılar', 'Rare details', lang)}</Text>
      <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 30, color: C.ink, marginBottom: 4 }}>{tx('Doğum anının az bilinen işaretleri', 'Little-known signs of your birth moment', lang)}</Text>
      <Sub style={{ marginBottom: 10 }}>{tx('Klasik astrolojinin, bugün uygulamaların neredeyse hiç göstermediği teknikleri: doğumundan önceki yeni ay ya da dolunay, tutulmalar, doğduğun gezegen saati, sabah ve akşam yıldızları, durağan gezegenler.', 'Classical techniques that apps almost never show today: the new or full moon and eclipses before your birth, your planetary hour of birth, morning and evening stars, stationary planets.', lang)}</Sub>
      {items.slice(0, 2).map(card)}
      {items.length > 2 ? <More count={items.length - 2}>{items.slice(2).map(card)}</More> : null}
    </View>
  );
}

/** Bugün: gökteki Ay ile doğum Güneşin arasındaki açıdan çıkan kişisel aylık döngü */
export function PersonalMoon({ chart, lang }: { chart: Chart; lang: Lang }) {
  const p = useMemo(() => personalLunarPhase(chart), [chart, new Date().toDateString()]);
  const days = (x: number) => Math.max(0, Math.round(x));
  return (
    <Section title={tx('Kişisel Ay döngün', 'Your personal lunar cycle', lang)} sub={tx('Takvimdeki Ay evreleri herkes için aynıdır. Kişisel döngün ise gökteki Ay’ın senin doğum Güneşine göre konumundan çıkar: her ay, doğum gününün küçük bir tekrarı gibi senin yeni ayın ve dolunayın olur.', 'Calendar moon phases are the same for everyone. Your personal cycle comes from where the Moon is relative to your birth Sun: each month you get your own new moon and full moon, like a small rerun of your birthday.', lang)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <MoonDisc angle={p.angle} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink }}>{p.phase.name[lang]}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 2 }}>{p.phase.text[lang]}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, marginTop: 4 }}>
            {tx(`Kişisel dolunayına ${days(p.daysToFull)} gün, kişisel yeni ayına ${days(p.daysToNew)} gün var.`, `${days(p.daysToFull)} days to your personal full moon, ${days(p.daysToNew)} to your personal new moon.`, lang)}
          </Text>
        </View>
      </View>
    </Section>
  );
}
function MoonDisc({ angle }: { angle: number }) {
  // Basit bir faz çizimi: aydınlık oranı ve yön
  const lit = (1 - Math.cos((angle * Math.PI) / 180)) / 2, waxing = angle < 180;
  const R = 26;
  const k = (1 - 2 * lit) * R;
  return (
    <Svg width={R * 2} height={R * 2} viewBox={`0 0 ${R * 2} ${R * 2}`}>
      <Circle cx={R} cy={R} r={R - 1} fill={C.card} stroke={C.line} />
      {/* Aydınlık taraf: dış yarım daire + ortadaki elips yayı (terminatör) */}
      <Path d={`M ${R} 1 A ${R - 1} ${R - 1} 0 0 ${waxing ? 1 : 0} ${R} ${R * 2 - 1} A ${Math.max(0.01, Math.abs(k))} ${R - 1} 0 0 ${(k > 0) === waxing ? 0 : 1} ${R} 1 Z`} fill={C.gold} opacity={0.85} />
    </Svg>
  );
}

/** Kişiye özel en iyi günler (aşk ya da iş) */
export function BestDays({ chart, kind, lang }: { chart: Chart; kind: DayKind; lang: Lang }) {
  const [list, setList] = useState<GoodDay[] | null>(null);
  useEffect(() => { setList(null); const id = setTimeout(() => setList(bestDays(chart, kind, 45)), 80); return () => clearTimeout(id); }, [chart, kind]);
  const fmt = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  const title = kind === 'love' ? tx('Buluşma ve ilişki konuşmaları için en iyi günlerin', 'Your best days for dates and relationship talks', lang) : tx('İş görüşmesi, imza ve başvuru için en iyi günlerin', 'Your best days for interviews, signing and applying', lang);
  const sub = kind === 'love'
    ? tx('Önümüzdeki 45 gün senin haritana göre tarandı: Ay’ın doğum Venüs’ün, Ay’ın ve Mars’ınla uyumu, Ay’ın aşk ve ilişki evlerinden geçişi aranır; Venüs retrosu, boşta Ay ve Ay’ın Mars ya da Satürn’le gerildiği günler elenir. Genel takvimler herkese aynı günü önerir; bunlar yalnızca senin günlerin.', 'The next 45 days scanned for your chart: the Moon in harmony with your birth Venus, Moon and Mars, or passing your romance and partnership houses; Venus retrograde, void Moon and Moon–Mars/Saturn tension days are removed. General calendars suggest the same days to everyone; these are yours alone.', lang)
    : tx('Önümüzdeki 45 gün senin haritana göre tarandı: Ay’ın doğum Güneş’in, Jüpiter’in, Merkür’ün ve kariyer noktanla uyumu aranır; Merkür retrosu, boşta Ay ve Ay’ın Mars ya da Satürn’le gerildiği günler elenir.', 'The next 45 days scanned for your chart: the Moon in harmony with your birth Sun, Jupiter, Mercury and career point; Mercury retrograde, void Moon and Moon–Mars/Saturn tension days are removed.', lang);
  return (
    <Section title={title} sub={sub}>
      {list === null ? <ActivityIndicator color={C.rose} style={{ alignSelf: 'flex-start' }} />
        : list.length ? list.map((d, i) => (
          <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: kind === 'love' ? C.second : C.gold, paddingLeft: 12, marginBottom: 14 }}>
            <Text style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 25, color: C.ink }}>{fmt(d.date)}</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink }}>{d.reasons.slice(0, 3).map(r => r[lang]).join(' · ')}</Text>
          </View>
        )) : <Text style={st.p}>{tx('Önümüzdeki 45 günde belirgin şekilde öne çıkan bir gün yok; sakin ve dengeli bir dönem.', 'No day stands out clearly in the next 45 days; a calm, even stretch.', lang)}</Text>}
    </Section>
  );
}

/** Keşfet: gökyüzü yaşın */
export function SkyAge({ chart, lang }: { chart: Chart; lang: Lang }) {
  const a = useMemo(() => skyAge(chart), [chart, new Date().toDateString()]);
  const nf = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB');
  const fmt = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const stat = (n: string, label: string) => (
    <View style={{ width: 150, marginBottom: 18 }}>
      <Text style={{ fontFamily: F.serif, fontSize: 30, lineHeight: 36, color: C.gold }}>{n}</Text>
      <Text style={{ fontFamily: F.sans, fontSize: 14, lineHeight: 20, color: C.sub }}>{label}</Text>
    </View>
  );
  return (
    <Section title={tx('Gökyüzü yaşın', 'Your sky age', lang)} sub={tx('Yaşını yıllarla değil, gökyüzünün döngüleriyle say. Doğduğun andan bu yana:', 'Count your age not in years but in the sky’s cycles. Since the moment you were born:', lang)}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18 }}>
        {stat(nf.format(a.days), tx('gün yaşadın (Dünya kendi etrafında bu kadar döndü)', 'days lived (Earth turned this many times)', lang))}
        {stat(nf.format(a.fullMoons), tx('dolunay gördün', 'full moons seen', lang))}
        {stat(nf.format(a.lunarReturns), tx('kez Ay doğduğun yere döndü', 'times the Moon returned to its birth place', lang))}
        {stat(`${nf.format(Math.round(a.km / 1e9))} ${tx('milyar km', 'billion km', lang)}`, tx('Güneş’in etrafında yol aldın', 'travelled around the Sun', lang))}
        {stat(nf.format(a.venusCycles), tx('Venüs döngüsü (aşk gezegeninin sabah–akşam yıldızı turu)', 'Venus cycles (the love planet’s morning–evening star loop)', lang))}
        {stat(`${a.jupiter} / ${a.saturn}`, tx('Jüpiter dönüşü / Satürn dönüşü', 'Jupiter returns / Saturn returns', lang))}
      </View>
      <Text style={[st.rowLabel, { marginTop: 6, marginBottom: 6 }]}>{tx('Sıradaki kilometre taşların', 'Your next milestones', lang)}</Text>
      {a.milestones.map((m, i) => (
        <Text key={i} style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 26, color: C.ink }}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>{fmt(m.date)}</Text>{tx(': ', ': ', lang)}{m.what[lang]}
        </Text>
      ))}
      <Sub style={{ marginTop: 8 }}>{tx('Bu tarihler kutlamak, bir niyet koymak ya da sevdiklerine sürpriz yapmak için güzel anlar.', 'These dates are lovely moments to celebrate, set an intention or surprise loved ones.', lang)}</Sub>
    </Section>
  );
}
