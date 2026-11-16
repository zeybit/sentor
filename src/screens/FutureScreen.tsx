import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';
import type { Chart } from '../engine/astro';
import { lifeTimeline, skyEvents, SkyEvent, Pt, Topic, TOPICS, Window, strengthOf } from '../engine/timeline';
import { Chips, H1, P, Section, Sub, st, useLayout } from '../ui/kit';
import { C, F } from '../theme';
import { EVENTS, LOVE_TIP, Rel } from '../content/lifeEvents';
import { CONCRETE, REL_LINE, PMOON, Cls } from '../content/skyTexts';
import { PROG_MOON_SIGN, progSunText } from '../content/techniqueTexts';
import { lifeAspect } from '../content/lifeTexts';
import { BODIES, SIGNS, ASPECT_INFO, SIGN_ADVERB, SIGN_KEYWORDS } from '../content/base';
import { PASPECT, PROG_NOTE, progBond, progSignText, progStationText, pMoonOpp } from '../content/progTexts';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const YEAR = 365.2422 * 864e5;

export const TOPIC_INFO: Record<Topic, { name: { tr: string; en: string }; color: () => string; tip: { tr: string; en: string } }> = {
  love: { name: { tr: 'Aşk ve evlilik', en: 'Love and marriage' }, color: () => C.second,
    tip: { tr: 'Bu dönemde yeni insanlarla tanışmaya açık ol; var olan bir ilişkin varsa geleceği konuşmak için uygun bir zaman.', en: 'Be open to meeting new people; if you’re in a relationship, it’s a good time to talk about the future.' } },
  career: { name: { tr: 'Kariyer ve iş', en: 'Career and work' }, color: () => C.water,
    tip: { tr: 'Başvuru, terfi görüşmesi ya da yeni bir proje için harekete geçebileceğin bir dönem.', en: 'A time to act on applications, promotion talks or a new project.' } },
  home: { name: { tr: 'Ev ve aile', en: 'Home and family' }, color: () => C.earth,
    tip: { tr: 'Taşınma, ev düzenleme ya da aileyle ilgili kararlar bu dönemde öne çıkabilir.', en: 'Moving, rearranging your home or family decisions may come up now.' } },
  travel: { name: { tr: 'Yolculuk ve eğitim', en: 'Travel and study' }, color: () => C.air,
    tip: { tr: 'Yurt dışı, okul, kurs ya da ufkunu açacak bir deneyim için iyi bir zaman.', en: 'A good time for going abroad, school, a course or an eye-opening experience.' } },
  change: { name: { tr: 'Büyük değişim', en: 'Major change' }, color: () => C.gold,
    tip: { tr: 'Hayatını gözden geçirme dönemi; eskiyi bırakıp yeni bir sayfa açmaya hazırlan.', en: 'A time to review your life; get ready to let go of the old and turn a new page.' } },
};

const techOfId = (id: string): 'transit' | 'progression' | 'other' => (/^(p[A-Z]|sa)/.test(id) ? 'progression' : /^(prof|lord|E)/.test(id) ? 'other' : 'transit');
const fmtMonth = (d: Date, lang: Lang) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
export const fmtRange = (w: Window, lang: Lang) => {
  const a = fmtMonth(w.start, lang), b = fmtMonth(new Date(w.end.getTime() - 15 * 864e5), lang);
  return a === b ? a : `${a} – ${b}`;
};
const Dots = ({ n }: { n: number }) => (
  <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${n}/3`}>
    {[1, 2, 3].map(i => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i <= n ? C.gold : C.line }} />)}
  </View>
);

const REL_LABEL: Record<Rel, { tr: string; en: string }> = { single: { tr: 'Bekârsan', en: 'If single' }, partner: { tr: 'İlişkin varsa', en: 'If in a relationship' }, married: { tr: 'Evliysen', en: 'If married' } };

/** Dönemin somut senaryoları: her gökyüzü olayına ve ilişki durumuna göre */
function scenarios(w: Window, rel: Rel | undefined, lang: Lang): { label?: string; text: string }[] {
  const out: { label?: string; text: string }[] = [];
  const seen = new Set<string>();
  let splitShown = false;
  for (const r of w.reasons) {
    const ev = EVENTS[r.id];
    if (!ev || out.length >= 4) continue;
    const pick = rel ? (rel === 'single' ? ev.s : rel === 'partner' ? ev.p : ev.m) : undefined;
    if (pick || ev.all) {
      const txt = (pick ?? ev.all)![lang];
      if (seen.has(txt)) continue;
      seen.add(txt);
      if (!rel && !ev.all && !splitShown) {
        splitShown = true;
        (['single', 'partner', 'married'] as Rel[]).forEach(k => { const v = k === 'single' ? ev.s : k === 'partner' ? ev.p : ev.m; if (v) out.push({ label: REL_LABEL[k][lang], text: v[lang] }); });
      } else out.push({ text: txt });
    } else if (!rel && !splitShown) {
      splitShown = true;
      (['single', 'partner', 'married'] as Rel[]).forEach(k => { const v = k === 'single' ? ev.s : k === 'partner' ? ev.p : ev.m; if (v) out.push({ label: REL_LABEL[k][lang], text: v[lang] }); });
    }
  }
  return out;
}

export function WindowCard({ w, lang, showTip = true }: { w: Window; lang: Lang; showTip?: boolean }) {
  const { profile } = useStore();
  const rel = profile?.rel;
  const t = TOPIC_INFO[w.topic];
  const s = strengthOf(w.score);
  const head = w.reasons.map(r => EVENTS[r.id]?.head).find(Boolean);
  const sc = scenarios(w, rel, lang);
  const relMatters = w.reasons.some(r => { const e = EVENTS[r.id]; return e && (e.s || e.p || e.m); });
  const tip = w.topic === 'love' ? LOVE_TIP[rel ?? 'none'][lang] : t.tip[lang];
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: t.color(), paddingLeft: 14, paddingVertical: 4, marginBottom: 26 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: t.color() }}>{t.name[lang]}{w.gen ? <Text style={{ fontFamily: F.sans, color: C.sub }}>{lang === 'tr' ? '  · kuşak etkisi: yaklaşık aynı yıllarda doğan herkeste aynı tarihlerde' : '  · generational: same dates for everyone born around the same years'}</Text> : null}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{s === 3 ? tx('Çok güçlü', 'Very strong', lang) : s === 2 ? tx('Güçlü', 'Strong', lang) : tx('Belirgin', 'Noticeable', lang)}</Text>
          <Dots n={s} />
        </View>
      </View>
      <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginTop: 2 }}>{fmtRange(w, lang)}</Text>
      {head ? <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 18, lineHeight: 25, color: C.ink, marginTop: 2 }}>{head[lang]}</Text> : null}
      {sc.length ? (
        <View style={{ marginTop: 8 }}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink, marginBottom: 2 }}>{tx('Senin için ne olabilir', 'What it could bring you', lang)}</Text>
          {sc.map((x, i) => (
            <Text key={i} style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 3 }}>
              {'• '}{x.label ? <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>{x.label}: </Text> : null}{x.text}
            </Text>
          ))}
          {!rel && relMatters ? <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 20, color: C.sub, marginTop: 4 }}>{tx('Ayarlar’da ilişki durumunu eklersen yalnızca sana uyan senaryo gösterilir.', 'Add your relationship status in Settings to see only the scenario that fits you.', lang)}</Text> : null}
        </View>
      ) : null}
      <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink, marginTop: 10 }}>{tx('Gökyüzünde ne oluyor', 'What’s happening in the sky', lang)}</Text>
      {(['transit', 'progression', 'other'] as const).map(g => {
        const rs = w.reasons.filter(r => techOfId(r.id) === g).slice(0, 2);
        if (!rs.length) return null;
        const lbl = g === 'transit' ? tx('Transit', 'Transit', lang) : g === 'progression' ? tx('Progresyon', 'Progression', lang) : tx('Yaşın teması ve tutulmalar', 'Age theme and eclipses', lang);
        return (
          <Text key={g} style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 24, color: C.sub, marginTop: 4 }}>
            <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.ink }}>{lbl}: </Text>{rs.map(r => r.text[lang]).join(' ')}
          </Text>
        );
      })}
      {showTip ? <Text style={{ fontFamily: F.sans, fontSize: 14, lineHeight: 22, color: C.sub, marginTop: 8 }}>{tip}</Text> : null}
    </View>
  );
}


const PT_NAME: Record<Pt, { tr: string; en: string }> = {
  sun: BODIES.sun.name, moon: BODIES.moon.name, mercury: BODIES.mercury.name, venus: BODIES.venus.name, mars: BODIES.mars.name, jupiter: BODIES.jupiter.name, saturn: BODIES.saturn.name,
  asc: { tr: 'Yükselen', en: 'Ascendant' }, mc: { tr: 'Kariyer noktası (MC)', en: 'Career point (MC)' }, dsc: { tr: 'Partner noktası', en: 'Partner point' }, ic: { tr: 'Yuva noktası', en: 'Home point' },
};
const CLS: Partial<Record<string, Cls>> = { jupiter: 'up', saturn: 'test', uranus: 'shake', neptune: 'fog', pluto: 'deep', node: 'node' };
const fmtSpan = (a: Date, b: Date, lang: Lang) => { const x = fmtMonth(a, lang), y = fmtMonth(new Date(b.getTime() - 5 * 864e5), lang); return x === y ? x : `${x} – ${y}`; };

const pName = (p: string, lang: Lang) => p === 'pasc' ? tx('İlerletilmiş Yükselen', 'Progressed Ascendant', lang) : p === 'pmc' ? tx('İlerletilmiş MC', 'Progressed MC', lang) : `${tx('İlerletilmiş', 'Progressed', lang)} ${BODIES[p as keyof typeof BODIES].name[lang]}`;

function SkyCard({ e, lang, rel }: { e: SkyEvent; lang: Lang; rel?: Rel }) {
  const col = TOPIC_INFO[e.topic].color();
  let title = '', sub: string | null = null;
  const lines: { label?: string; text: string }[] = [];
  if (e.kind === 'transit' && e.t && e.n && e.type) {
    const tName = e.t === 'node' ? tx('Kuzey Ay Düğümü', 'North Node', lang) : BODIES[e.t].name[lang];
    title = `${tName} → ${PT_NAME[e.n][lang]} · ${ASPECT_INFO[e.type].name[lang].toLocaleLowerCase(lang)}`;
    if (e.n !== 'dsc' && e.n !== 'ic') sub = lifeAspect(e.t, e.n, e.type, 'progressed').title[lang];
    const c = CLS[e.t]!;
    const base = CONCRETE[e.n][c][lang];
    const jHard = e.t === 'jupiter' && (e.type === 'square' || e.type === 'opposition');
    lines.push({ text: jHard ? tx(`Fırsat var ama ölçüyü kaçırma: ${base.charAt(0).toLocaleLowerCase('tr')}${base.slice(1)} Fazla söz vermek, fazla harcamak ya da aşırı iyimserlik bu dönemin tuzağı.`, `There is opportunity, but don’t overdo it: ${base.charAt(0).toLowerCase()}${base.slice(1)} Overpromising, overspending or blind optimism are the trap now.`, lang) : base });
    if (e.n === 'venus' || e.n === 'dsc') {
      if (rel) lines.push({ text: REL_LINE[c][rel][lang] });
      else (['single', 'partner', 'married'] as Rel[]).forEach(k => lines.push({ label: REL_LABEL[k][lang], text: REL_LINE[c][k][lang] }));
    }
  } else if (e.kind === 'eclipse' && e.n) {
    title = `${e.north ? tx('Kuzey düğüm tutulması', 'North-node eclipse', lang) : tx('Güney düğüm tutulması', 'South-node eclipse', lang)} → ${PT_NAME[e.n][lang]}`;
    sub = e.north ? tx('Bir kapı açılır, yeni bir başlangıç', 'A door opens, a new beginning', lang) : tx('Bir şey tamamlanır, bırakma zamanı', 'Something completes, time to let go', lang);
    lines.push({ text: CONCRETE[e.n][e.north ? 'up' : 'test'][lang] });
  } else if (e.kind === 'pmoon' && e.n) {
    const opp = e.type === 'opposition';
    title = `${tx('İlerletilmiş Ay', 'Progressed Moon', lang)} → ${PT_NAME[e.n][lang]} · ${opp ? ASPECT_INFO.opposition.name[lang].toLocaleLowerCase(lang) : tx('kavuşum', 'conjunction', lang)}`;
    lines.push({ text: opp ? pMoonOpp(e.n)[lang] : PMOON[e.n][lang] });
  } else if (e.kind === 'prog' && e.p && e.n && e.type) {
    title = `${pName(e.p, lang)} → ${PT_NAME[e.n][lang]} · ${ASPECT_INFO[e.type].name[lang].toLocaleLowerCase(lang)}`;
    sub = PASPECT[e.type].sub[lang];
    const cls: Cls = e.type === 'trine' ? 'up' : e.type === 'conjunction' ? (e.p === 'mars' ? 'shake' : 'up') : 'test';
    lines.push({ text: `${progBond(e.p, e.n)[lang]} ${PASPECT[e.type].line[lang]}` });
    lines.push({ text: CONCRETE[e.n][cls][lang] });
    lines.push({ text: PROG_NOTE[lang] });
  } else if (e.kind === 'psign' && e.p && e.sign !== undefined) {
    title = `${pName(e.p, lang)} → ${SIGNS[e.sign][lang]}`;
    sub = tx('Birkaç yıl sürecek yeni bir tarz', 'A new style for several years', lang);
    lines.push({ text: progSignText(e.p, SIGN_ADVERB[e.sign], SIGN_KEYWORDS[e.sign])[lang] });
  } else if (e.kind === 'pstation' && e.p) {
    title = `${pName(e.p, lang)} ${e.retro ? tx('geri harekete dönüyor', 'turns retrograde', lang) : tx('ileri harekete dönüyor', 'turns direct', lang)}`;
    sub = tx('Onlarca yılda bir yaşanan bir dönüm noktası', 'A turning point that comes once in decades', lang);
    lines.push({ text: progStationText(e.p, !!e.retro)[lang] });
  } else if (e.kind === 'pmsign' && e.sign !== undefined) {
    title = `${tx('İlerletilmiş Ay', 'Progressed Moon', lang)} → ${SIGNS[e.sign][lang]}`;
    sub = tx('Yaklaşık 2,5 yıllık yeni bir duygusal dönem', 'A new ~2.5-year emotional chapter', lang);
    lines.push({ text: PROG_MOON_SIGN[e.sign][lang] });
  } else if (e.kind === 'pssign' && e.sign !== undefined) {
    title = `${tx('İlerletilmiş Güneş', 'Progressed Sun', lang)} → ${SIGNS[e.sign][lang]}`;
    sub = tx('Yaklaşık 30 yılda bir yaşanan kimlik değişimi', 'An identity shift that comes about every 30 years', lang);
    lines.push({ text: progSunText(e.sign)[lang] });
  }
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: col, marginTop: 7 }} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub }}>{fmtSpan(e.start, e.end, lang)} · {TOPIC_INFO[e.topic].name[lang]}</Text>
        <Text style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 25, color: C.ink }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 23, color: C.sub }}>{sub}</Text> : null}
        {lines.map((x, i) => (
          <Text key={i} style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 3 }}>
            {x.label ? <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>{x.label}: </Text> : null}{x.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

type FeedItem = { k: 'w'; w: Window; d: Date } | { k: 'e'; e: SkyEvent; d: Date };
/** Büyük dönemler ve tek tek gezegen olayları, yıllara göre tek bir tarih akışında */
function Feed({ items, lang, rel, tips, upcoming = false }: { items: FeedItem[]; lang: Lang; rel?: Rel; tips: boolean; upcoming?: boolean }) {
  const [n, setN] = useState(20);
  const shown = items.slice(0, n);
  let year = -1;
  return (
    <View>
      {shown.map((it, i) => {
        const ongoing = upcoming && it.d.getTime() <= Date.now();
        const y = ongoing ? 0 : it.d.getFullYear();
        const hdr = y !== year ? (year = y, <Text style={{ fontFamily: F.serif, fontSize: 26, color: C.gold, marginTop: 10, marginBottom: 10 }}>{ongoing ? tx('Şu an etkili olanlar', 'In effect now', lang) : y}</Text>) : null;
        return (
          <React.Fragment key={it.k === 'w' ? `w${i}${it.w.start.getTime()}${it.w.topic}` : it.e.id}>
            {hdr}
            {it.k === 'w' ? <WindowCard w={it.w} lang={lang} showTip={tips} /> : <SkyCard e={it.e} lang={lang} rel={rel} />}
          </React.Fragment>
        );
      })}
      {items.length > n ? (
        <Pressable accessibilityRole="button" onPress={() => setN(n + 25)} style={{ paddingVertical: 8 }}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{tx(`Daha fazla göster (${items.length - n} kayıt daha)`, `Show more (${items.length - n} more)`, lang)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Yıllara yayılmış görsel zaman çizelgesi */
function TimelineChart({ ch, list, sky, lang, width }: { ch: Chart; list: Window[]; sky: SkyEvent[]; lang: Lang; width: number }) {
  const birthY = ch.utc.getUTCFullYear() + ch.utc.getUTCMonth() / 12;
  const y0 = Math.floor(birthY + 16), y1 = Math.ceil(birthY + 75);
  const pxPerYear = 26, labelW = 92, rowH = 26;
  const W = labelW + (y1 - y0) * pxPerYear + 10, H = TOPICS.length * rowH + 30;
  const x = (d: Date) => labelW + ((d.getUTCFullYear() + d.getUTCMonth() / 12) - y0) * pxPerYear;
  const now = new Date();
  const ref = useRef<any>(null);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator ref={ref}
      onContentSizeChange={() => ref.current?.scrollTo({ x: Math.max(0, x(now) - width / 2), animated: false })}>
      <Svg width={W} height={H}>
        {Array.from({ length: y1 - y0 + 1 }).map((_, i) => {
          const yr = y0 + i, px = labelW + i * pxPerYear;
          return (
            <React.Fragment key={yr}>
              <Line x1={px} y1={0} x2={px} y2={H - 22} stroke={C.line} strokeWidth={yr % 5 === 0 ? 1 : 0.5} />
              {yr % 5 === 0 ? <SvgText x={px} y={H - 8} fontSize={10} fill={C.sub} textAnchor="middle">{yr}</SvgText> : null}
            </React.Fragment>
          );
        })}
        {TOPICS.map((t, r) => (
          <React.Fragment key={t}>
            <SvgText x={0} y={r * rowH + 17} fontSize={11} fill={C.ink}>{TOPIC_INFO[t].name[lang].split(' ')[0]}</SvgText>
            {list.filter(w => w.topic === t).map((w, i) => (
              <Rect key={i} x={x(w.start)} y={r * rowH + 6} width={Math.max(4, x(w.end) - x(w.start))} height={14} rx={3} fill={TOPIC_INFO[t].color()} opacity={0.35 + strengthOf(w.score) * 0.2} />
            ))}
            {sky.filter(e => e.topic === t).map(e => (
              <Rect key={e.id} x={x(e.peak) - 1} y={r * rowH + 20} width={2} height={5} fill={TOPIC_INFO[t].color()} />
            ))}
          </React.Fragment>
        ))}
        <Line x1={x(now)} y1={0} x2={x(now)} y2={H - 22} stroke={C.ink} strokeWidth={2} />
        <SvgText x={x(now) + 4} y={H - 24} fontSize={10} fill={C.ink} fontWeight="700">{tx('bugün', 'today', lang)}</SvgText>
      </Svg>
    </ScrollView>
  );
}

export default function FutureScreen({ embedded }: { embedded?: boolean } = {}) {
  const { chart, lang, profile } = useStore();
  const { inner } = useLayout();
  const [list, setList] = useState<Window[] | null>(null);
  const [topic, setTopic] = useState<'all' | Topic>('all');
  const [sky, setSky] = useState<SkyEvent[]>([]);
  // Hesap birkaç yüz milisaniye sürdüğü için önce ekranı çizip sonra hesaplıyoruz
  useEffect(() => {
    setList(null);
    if (!chart) return;
    const id = setTimeout(() => { setList(lifeTimeline(chart, { fromAge: 16, toAge: 75 })); setSky(skyEvents(chart)); }, 30);
    return () => clearTimeout(id);
  }, [chart]);
  const now = new Date();
  const filtered = useMemo(() => (list ?? []).filter(w => topic === 'all' || w.topic === topic), [list, topic]);
  const skyF = useMemo(() => sky.filter(e => topic === 'all' || e.topic === topic), [sky, topic]);
  if (!chart || !profile) return null;
  const future = filtered.filter(w => w.end > now);
  const upcoming = future.filter(w => w.start.getTime() < now.getTime() + 12 * YEAR);
  const past = filtered.filter(w => w.end <= now && w.end.getTime() > now.getTime() - 15 * YEAR).reverse();
  const feedUp: FeedItem[] = [...upcoming.map(w => ({ k: 'w' as const, w, d: w.start })), ...skyF.filter(e => e.end > now).map(e => ({ k: 'e' as const, e, d: e.start }))].sort((x, y) => x.d.getTime() - y.d.getTime());
  const feedPast: FeedItem[] = [...past.map(w => ({ k: 'w' as const, w, d: w.start })), ...skyF.filter(e => e.end <= now).map(e => ({ k: 'e' as const, e, d: e.start }))].sort((x, y) => y.d.getTime() - x.d.getTime());
  const noTime = !chart.input.timeKnown;

  return (
    <View>
      {embedded ? null : <H1>{tx('Hayat takvimin', 'Your life calendar', lang)}</H1>}
      <View style={{ height: 14 }} />
      {noTime ? <View style={[st.panel, { backgroundColor: C.goldSoft, borderColor: C.goldSoft, marginBottom: 20 }]}><P>{tx('Doğum saatin bilinmediği için evler ve köşeler hesaplanamıyor; takvim yalnızca gezegen geçişlerine dayanıyor ve daha az ayrıntılı. Saatini eklersen çok daha isabetli olur.', 'Your birth time is unknown, so houses and angles can’t be used; the calendar relies only on planet passages and is less detailed. Adding your time makes it far more accurate.', lang)}</P></View> : null}

      <Chips items={[{ key: 'all', label: tx('Tümü', 'All', lang) }, ...TOPICS.map(t => ({ key: t, label: TOPIC_INFO[t].name[lang] }))]} value={topic} onChange={v => setTopic(v as any)} />

      {list === null ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }} accessibilityLiveRegion="polite">
          <ActivityIndicator color={C.rose} />
          <Sub style={{ marginTop: 10 }}>{tx('Önümüzdeki yıllar hesaplanıyor…', 'Calculating the years ahead…', lang)}</Sub>
        </View>
      ) : (
        <>
          <Section title={tx('Sıradaki önemli dönemlerin', 'Your next important periods', lang)} sub={tx('Önümüzdeki 12 yıl, tarih sırasıyla. Renkli çizgili kartlar birkaç tekniğin birleştiği büyük dönemlerdir; noktalı satırlar o aralıkta haritana dokunan tek tek gezegen olaylarıdır (kavuşumlar, açılar, tutulmalar; ilerletilmiş haritada Ay, Güneş, Merkür, Venüs, Mars ve köşelerin açıları, burç değiştirmeleri ve gezegenlerin yön değiştirmesi).', 'The next 12 years in date order. Cards with a coloured bar are major periods where several techniques agree; dotted rows are the single planet events touching your chart in between (conjunctions, aspects, eclipses; in the progressed chart the aspects and sign changes of the Moon, Sun, Mercury, Venus, Mars and the angles, and planets changing direction).', lang)}>
            {feedUp.length ? <Feed key={`u${topic}`} items={feedUp} lang={lang} rel={profile.rel} tips upcoming /> : <P>{tx('Bu konu için önümüzdeki 12 yılda belirgin bir dönem çıkmadı; bu, sakin ve istikrarlı bir akış anlamına gelir.', 'No marked period for this topic in the next 12 years; that means a calm, steady flow.', lang)}</P>}
          </Section>

          <Section title={tx('Bütün hayatın tek bakışta', 'Your whole life at a glance', lang)} sub={tx('Renkli çubuklar öne çıkan dönemleri gösterir; koyu olanlar daha güçlüdür. Yana kaydırabilirsin.', 'Coloured bars mark the standout periods; darker ones are stronger. Scroll sideways.', lang)}>
            <TimelineChart ch={chart} list={filtered} sky={skyF} lang={lang} width={inner(1180)} />
          </Section>

          <Section title={tx('Geçmişini kontrol et', 'Check your past', lang)} sub={tx('Bu dönemlerde gerçekten önemli bir şey yaşadın mı? Geçmişte tutan dönemler, gelecekteki tarihlerin senin haritanda ne kadar işe yaradığını gösterir. Hiçbiri tutmuyorsa doğum saatini kontrol etmeye değer.', 'Did something important really happen in these periods? Past periods that match show how well the future dates work for your chart. If none match, it’s worth checking your birth time.', lang)}>
            {feedPast.length ? <Feed key={`p${topic}`} items={feedPast} lang={lang} rel={profile.rel} tips={false} /> : <P>{tx('Son 15 yılda bu konu için belirgin bir dönem yok.', 'No marked period for this topic in the last 15 years.', lang)}</P>}
          </Section>

          <Sub style={{ marginBottom: 20, maxWidth: 640 }}>{tx('Bu tarihler kesin olayları değil, belirli konuların öne çıktığı dönemleri gösterir. Kararlarını yalnızca bunlara göre verme.', 'These dates show periods when certain themes come forward, not fixed events. Don’t base decisions on them alone.', lang)}</Sub>
        </>
      )}
    </View>
  );
}

/** Transit ya da Progresyon ekranında: seçili tarihte etkin olan dönemlere o tekniğin katkısı */
export type Tech = 'transit' | 'progression';
const techOf = (id: string): Tech | 'other' => (/^(p[A-Z]|sa)/.test(id) ? 'progression' : /^(prof|lord|E)/.test(id) ? 'other' : 'transit');
export function ActiveWindows({ ch, date, tech, lang, onOpen }: { ch: Chart; date: Date; tech: Tech; lang: Lang; onOpen: () => void }) {
  const [list, setList] = useState<Window[] | null>(null);
  useEffect(() => { const id = setTimeout(() => setList(lifeTimeline(ch, { fromAge: 16, toAge: 75 })), 30); return () => clearTimeout(id); }, [ch]);
  if (!list) return null;
  const t = date.getTime();
  const near = list.filter(w => w.start.getTime() - 45 * 864e5 <= t && w.end.getTime() + 45 * 864e5 >= t);
  const label = tech === 'transit' ? tx('transitlerin', 'transits', lang) : tx('progresyonun', 'progressions', lang);
  return (
    <View style={[st.panel, { marginBottom: 24 }]}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 2 }}>{tx('Bu tarihteki önemli dönemler', 'Key periods around this date', lang)}</Text>
      {near.length ? near.map((w, i) => {
        const mine = w.reasons.filter(r => techOf(r.id) === tech);
        const others = w.reasons.filter(r => techOf(r.id) !== tech);
        return (
          <View key={i} style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: F.serif, fontSize: 20, color: C.ink }}><Text style={{ color: TOPIC_INFO[w.topic].color() }}>● </Text>{TOPIC_INFO[w.topic].name[lang]}, {fmtRange(w, lang)}</Text>
            {mine.length ? <P style={{ marginTop: 2 }}>{mine.map(r => r.text[lang]).join(' ')}</P>
              : <Sub style={{ marginTop: 2 }}>{tx(`Bu dönemde ${label} doğrudan bir katkısı yok; dönemi diğer teknikler belirliyor.`, `${label === 'transits' ? 'Transits do' : 'Progressions do'} not contribute directly here; other techniques define this period.`, lang)}</Sub>}
            {others.length ? <Sub style={{ marginTop: 2 }}>{tx('Diğer teknikler de destekliyor: ', 'Other techniques agree: ', lang)}{others.map(r => r.text[lang]).join(' ')}</Sub> : null}
          </View>
        );
      }) : <P style={{ marginTop: 4 }}>{tx('Seçili tarihte öne çıkan bir dönem yok. Tarihi ileri alarak bakabilirsin.', 'No standout period at the selected date. Move the date forward to look.', lang)}</P>}
      <Pressable onPress={onOpen} accessibilityRole="button" style={{ marginTop: 10 }}>
        <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{tx('Bütün önemli dönemleri gör', 'See all key periods', lang)}</Text>
      </Pressable>
    </View>
  );
}
