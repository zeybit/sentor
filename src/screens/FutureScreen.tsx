import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';
import type { Chart } from '../engine/astro';
import { lifeTimeline, Topic, TOPICS, Window, strengthOf } from '../engine/timeline';
import { Chips, H1, P, Section, Sub, st, useLayout } from '../ui/kit';
import { C, F } from '../theme';
import { EVENTS, LOVE_TIP, Rel } from '../content/lifeEvents';

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
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: t.color() }}>{t.name[lang]}</Text>
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

/** Yıllara yayılmış görsel zaman çizelgesi */
function TimelineChart({ ch, list, lang, width }: { ch: Chart; list: Window[]; lang: Lang; width: number }) {
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
  // Hesap birkaç yüz milisaniye sürdüğü için önce ekranı çizip sonra hesaplıyoruz
  useEffect(() => {
    setList(null);
    if (!chart) return;
    const id = setTimeout(() => setList(lifeTimeline(chart, { fromAge: 16, toAge: 75 })), 30);
    return () => clearTimeout(id);
  }, [chart]);
  const now = new Date();
  const filtered = useMemo(() => (list ?? []).filter(w => topic === 'all' || w.topic === topic), [list, topic]);
  if (!chart || !profile) return null;
  const future = filtered.filter(w => w.end > now);
  const upcoming = future.filter(w => w.start.getTime() < now.getTime() + 12 * YEAR);
  const past = filtered.filter(w => w.end <= now && w.end.getTime() > now.getTime() - 15 * YEAR).reverse();
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
          <Section title={tx('Sıradaki önemli dönemlerin', 'Your next important periods', lang)} sub={tx('Önümüzdeki 12 yıl', 'The next 12 years', lang)}>
            {upcoming.length ? upcoming.slice(0, 8).map((w, i) => <WindowCard key={i} w={w} lang={lang} />) : <P>{tx('Bu konu için önümüzdeki 12 yılda belirgin bir dönem çıkmadı; bu, sakin ve istikrarlı bir akış anlamına gelir.', 'No marked period for this topic in the next 12 years; that means a calm, steady flow.', lang)}</P>}
          </Section>

          <Section title={tx('Bütün hayatın tek bakışta', 'Your whole life at a glance', lang)} sub={tx('Renkli çubuklar öne çıkan dönemleri gösterir; koyu olanlar daha güçlüdür. Yana kaydırabilirsin.', 'Coloured bars mark the standout periods; darker ones are stronger. Scroll sideways.', lang)}>
            <TimelineChart ch={chart} list={filtered} lang={lang} width={inner(1180)} />
          </Section>

          <Section title={tx('Geçmişini kontrol et', 'Check your past', lang)} sub={tx('Bu dönemlerde gerçekten önemli bir şey yaşadın mı? Geçmişte tutan dönemler, gelecekteki tarihlerin senin haritanda ne kadar işe yaradığını gösterir. Hiçbiri tutmuyorsa doğum saatini kontrol etmeye değer.', 'Did something important really happen in these periods? Past periods that match show how well the future dates work for your chart. If none match, it’s worth checking your birth time.', lang)}>
            {past.length ? past.slice(0, 8).map((w, i) => <WindowCard key={i} w={w} lang={lang} showTip={false} />) : <P>{tx('Son 15 yılda bu konu için belirgin bir dönem yok.', 'No marked period for this topic in the last 15 years.', lang)}</P>}
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
