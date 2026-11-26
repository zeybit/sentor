// Keşfet: yıllık hikâye, ünlü ikizin, testler ve şehirlerin
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore } from '../store';
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS } from '../engine/astro';
import { solarReturnChart } from '../engine/techniques';
import { lifeTimeline, skyEvents } from '../engine/timeline';
import { personCtx } from '../engine/person';
import { destinyMatrix } from '../engine/matrix';
import { BODIES, HOUSES, SIGNS, L } from '../content/base';
import { ARCANA, ADVICE } from '../content/arcana';
import { HOUSE_YEAR, VENUS_YEAR, JUP_YEAR, SAT_YEAR } from '../content/yearStory';
import { celebTwins, dominantPlanet, PLANET_TYPE, loveLanguage, LOVE_LANG, LoveLang, elementProfile, ELEMENT_TYPE, cityPicks } from '../content/explore';
import { CELEBS, FIELD } from '../content/celebs';
import { yearSvg, twinSvg, testSvg, citySvg } from '../content/shareCards';
import { bigCities } from '../ui/Tools';
import { TarotCard } from '../ui/TarotCard';
import { ShareToggle, safeName } from '../ui/ShareImage';
import { Chips, H1, P, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, F, serif, ELEMENT_COLOR } from '../theme';
import { scrollTop, takePendingKind } from '../nav';
import { TodayHub } from '../ui/Cosmic';
import { SkyAge } from '../ui/ExtrasUI';
import Mirror from '../ui/Mirror';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
type Part = 'mirror' | 'year' | 'twin' | 'tests' | 'cities' | 'sky';
const YEAR = 365.2422 * 864e5, DAY = 864e5;

export default function ExploreScreen() {
  const { lang, chart } = useStore();
  const [part, setPart] = useState<Part | null>(() => { const k = takePendingKind(); return (['mirror', 'year', 'twin', 'tests', 'cities', 'sky'] as Part[]).includes(k as Part) ? (k as Part) : null; });
  const { wide } = useLayout();
  return (
    <View>
      <H1>{tx('Keşfet', 'Discover', lang)}</H1>
      <Sub style={{ marginBottom: 16, maxWidth: 620 }}>{tx('Haritanla oynamanın eğlenceli yolları: seni anlatan cümleler, yeni yaşının hikâyesi, ünlü ikizlerin, kısa testler, sana iyi gelen şehirler ve gökyüzü yaşın.', 'Fun ways to play with your chart: lines that describe you, the story of your new year, celebrity twins, quick tests, the cities that suit you and your sky age.', lang)}</Sub>
      <TodayHub lang={lang} heading="" cols={wide ? 3 : 2} open={part} onOpen={k => { setPart(k as Part | null); scrollTop(); }} back={tx('Keşfet’e dön', 'Back to Discover', lang)} items={[
        { key: 'mirror', glyph: '◐', title: tx('Kendini bul', 'Find yourself', lang), teaser: tx('Seni anlatan cümleler: sağa sola kaydır', 'Lines that describe you: swipe', lang), body: chart ? <Mirror chart={chart} lang={lang} /> : null },
        { key: 'year', glyph: '✦', title: tx('Yeni yaşın', 'Your new year', lang), teaser: tx('Yeni yaşının hikâyesi ve en hareketli ayların', 'The story of your new year', lang), body: <YearStory /> },
        { key: 'twin', glyph: '☆', title: tx('Ünlü ikizin', 'Celebrity twin', lang), teaser: tx('Haritası seninkine en çok benzeyen ünlüler', 'Celebrities with the closest chart', lang), body: <Twins /> },
        { key: 'tests', glyph: '?', title: tx('Testler', 'Tests', lang), teaser: tx('Haritanla kısa kişilik testleri', 'Quick personality tests', lang), body: <Tests /> },
        { key: 'cities', glyph: '⌖', title: tx('Şehirlerin', 'Your cities', lang), teaser: tx('Sana iyi gelen şehirler ve neden', 'The cities that suit you and why', lang), body: <Cities /> },
        { key: 'sky', glyph: '◷', title: tx('Gökyüzü yaşın', 'Your sky age', lang), teaser: tx('Gökyüzüne göre kaç yaşındasın?', 'How old are you by the sky?', lang), body: chart ? <SkyAge chart={chart} lang={lang} /> : null },
      ]} />
    </View>
  );
}

// ===================== Yeni yaşın hikâyesi =====================
export function birthdayInfo(b: { year: number; month: number; day: number }) {
  const now = new Date();
  const thisYear = new Date(now.getFullYear(), b.month - 1, b.day);
  const since = (now.getTime() - thisYear.getTime()) / DAY;
  const target = since >= 0 && since < 60 ? thisYear : since >= 60 ? new Date(now.getFullYear() + 1, b.month - 1, b.day) : thisYear;
  const daysTo = Math.ceil((target.getTime() - now.getTime()) / DAY);
  return { target, age: target.getFullYear() - b.year, daysTo };
}

function YearStory() {
  const { chart, profile, opts, lang, location } = useStore();
  const { inner } = useLayout();
  const [page, setPage] = useState(0);
  const data = useMemo(() => {
    if (!chart || !profile) return null;
    const bi = birthdayInfo(profile.birth);
    const loc = location ?? { lat: profile.birth.lat, lon: profile.birth.lon };
    const sr = solarReturnChart(chart, new Date(bi.target.getTime() + 3 * DAY), opts, loc.lat, loc.lon);
    const start = sr.utc.getTime(), end = start + YEAR;
    const prof = (bi.age % 12) + 1;
    const lord: BodyId = chart.asc !== null ? SIGN_RULERS[(Math.floor(chart.asc / 30) + bi.age) % 12] : SIGN_RULERS[(chart.positions.sun.sign + bi.age) % 12];
    const wins = lifeTimeline(chart, { fromAge: 16, toAge: 75, ...personCtx(profile) }).filter(w => w.end.getTime() > start && w.start.getTime() < end);
    const months = Array(12).fill(0) as number[];
    const ev = skyEvents(chart).filter(e => e.kind === 'transit' && e.end.getTime() > start && e.start.getTime() < end);
    for (const e of ev) for (let i = 0; i < 12; i++) { const a = start + (i * YEAR) / 12, b = a + YEAR / 12; if (e.start.getTime() < b && e.end.getTime() > a) months[i] += e.w; }
    const top = months.map((v, i) => ({ v, i })).sort((x, y) => y.v - x.v).slice(0, 3).map(x => x.i);
    const h = (id: BodyId) => sr.positions[id].house || 1;
    return { bi, sr, prof, lord, wins, months, top, start, sunH: h('sun'), venH: h('venus'), jupH: h('jupiter'), satH: h('saturn') };
  }, [chart, profile, opts, location]);
  const buildCard = useCallback(() => data && profile ? yearSvg(profile.name, data.bi.age, HOUSE_YEAR[data.sunH - 1].word[lang], HOUSE_YEAR[data.sunH - 1].head[lang], data.months, lang, new Date(data.start + YEAR / 24).getMonth()) : '', [data, profile, lang]);
  if (!data || !profile || !chart) return null;
  const monthName = (i: number) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(new Date(data.start + (i + 0.5) * (YEAR / 12)));
  const love = data.wins.filter(w => w.topic === 'love'), career = data.wins.filter(w => w.topic === 'career');
  const fmtM = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long' }).format(d);
  const noTime = !chart.input.timeKnown;
  const pages: { kicker: string; big?: string; title: string; text: string; extra?: React.ReactNode }[] = [
    { kicker: data.bi.daysTo > 0 ? tx(`${data.bi.daysTo} gün sonra`, `In ${data.bi.daysTo} days`, lang) : tx('Yeni yaşın kutlu olsun', 'Happy birthday', lang), big: String(data.bi.age),
      title: tx(`${profile.name || 'Sen'}, ${data.bi.age}. yaşına hoş geldin`, `${profile.name || 'You'}, welcome to ${data.bi.age}`, lang),
      text: tx(`Güneş, ${new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(data.sr.utc)} günü doğduğun andaki yerine dönüyor. O an kurulan harita, önümüzdeki bir yılın hikâyesini anlatır. Sayfaları kaydırarak oku.`, `On ${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(data.sr.utc)} the Sun returns to where it was at your birth. The chart of that moment tells the story of the year ahead. Swipe through.`, lang) },
    { kicker: tx('Yılın kelimesi', 'Word of the year', lang), big: HOUSE_YEAR[data.sunH - 1].word[lang], title: HOUSE_YEAR[data.sunH - 1].head[lang], text: HOUSE_YEAR[data.sunH - 1].text[lang] },
    { kicker: tx('Yılın teması', 'Theme of the year', lang), big: `${data.prof}. ${tx('ev', 'house', lang)}`, title: HOUSES[data.prof - 1].short[lang],
      text: tx(`Astrolojide her yaş bir eve denk gelir; ${data.bi.age} yaşı ${data.prof}. evin yılı: ${HOUSES[data.prof - 1].area.tr}. Yılın yöneticisi ${BODIES[data.lord].name.tr}; bu gezegenin gökyüzündeki hareketleri yıl boyunca seni en çok etkileyecek.`, `In astrology each age matches a house; age ${data.bi.age} is the year of house ${data.prof}: ${HOUSES[data.prof - 1].area.en}. The ruler of the year is ${BODIES[data.lord].name.en}; its movements will affect you most this year.`, lang) },
    { kicker: tx('Aşk', 'Love', lang), big: '♥', title: tx('Kalbin bu yıl nerede', 'Where your heart is this year', lang),
      text: `${VENUS_YEAR[data.venH - 1][lang]} ${love.length ? tx(`En romantik dönemin: ${fmtM(love[0].start)}${love[0].end.getTime() - love[0].start.getTime() > 40 * DAY ? ` – ${fmtM(love[0].end)}` : ''}.`, `Your most romantic period: ${fmtM(love[0].start)}${love[0].end.getTime() - love[0].start.getTime() > 40 * DAY ? ` – ${fmtM(love[0].end)}` : ''}.`, lang) : ''}` },
    { kicker: tx('Şans', 'Luck', lang), big: '★', title: tx('Şansın nereden gelecek', 'Where your luck comes from', lang),
      text: `${JUP_YEAR[data.jupH - 1][lang]} ${career.length ? tx(`Kariyer için en güçlü dönem: ${fmtM(career[0].start)}.`, `Strongest career period: ${fmtM(career[0].start)}.`, lang) : ''}` },
    { kicker: tx('Sınav', 'Lesson', lang), big: '♄', title: tx('Yılın dersi', 'The lesson of the year', lang), text: SAT_YEAR[data.satH - 1][lang] },
    { kicker: tx('Ay ay', 'Month by month', lang), title: tx('En hareketli ayların', 'Your busiest months', lang),
      text: tx(`Gökyüzünün haritana en çok dokunduğu aylar: ${data.top.map(monthName).join(', ')}. Bu aylarda önemli kararlar ve gelişmeler bekle.`, `The months the sky touches your chart most: ${data.top.map(monthName).join(', ')}. Expect key decisions and developments then.`, lang),
      extra: <MonthBars months={data.months} top={data.top} start={data.start} lang={lang} /> },
    { kicker: tx('Kapanış', 'Finale', lang), big: '✦', title: tx('Yılını paylaş', 'Share your year', lang), text: tx('Yeni yaşının özeti hikâye boyutunda bir kartta. İndir ve paylaş; arkadaşların da kendi yıllarını merak etsin.', 'Your new year in a story-sized card. Download and share; let your friends wonder about theirs.', lang),
      extra: <ShareToggle label={tx('Yıllık kartını aç', 'Open your year card', lang)} build={buildCard} filename={`yeni-yasim-${safeName(profile.name)}.png`} lang={lang} /> },
  ];
  const pg = pages[page];
  const w = Math.min(inner(760), 520);
  return (
    <View style={{ alignItems: 'center' }}>
      {noTime ? <Sub style={{ marginBottom: 10, textAlign: 'center' }}>{tx('Doğum saatin bilinmediği için ev yorumları yaklaşık.', 'Your birth time is unknown, so house readings are approximate.', lang)}</Sub> : null}
      <View style={{ width: w, minHeight: 560, borderRadius: 6, backgroundColor: '#0C1517', borderWidth: 1, borderColor: 'rgba(219,182,104,0.35)', padding: 22, overflow: 'hidden' }} {...({ dataSet: { pulse: '1' } } as any)}>
        <View style={{ flexDirection: 'row', gap: 4, marginBottom: 22 }}>
          {pages.map((_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= page ? '#F2B84B' : 'rgba(255,255,255,0.2)' }} />)}
        </View>
        <View key={page} {...({ dataSet: { enter: '1' } } as any)}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, letterSpacing: 2, color: '#93A9BB', textTransform: 'uppercase' }}>{pg.kicker}</Text>
        {pg.big ? <Text style={{ fontFamily: serif, fontWeight: '300', fontSize: pg.big.length > 6 ? 44 : 84, lineHeight: pg.big.length > 6 ? 54 : 96, color: '#F2B84B', marginTop: 10 }}>{pg.big}</Text> : null}
        <Text style={{ fontFamily: serif, fontSize: 28, lineHeight: 34, color: '#E3ECF3', marginTop: 8 }}>{pg.title}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 27, color: '#D5E1EA', marginTop: 12 }}>{pg.text}</Text>
        {pg.extra ? <View style={{ marginTop: 16 }}>{pg.extra}</View> : null}
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          <Pressable accessibilityRole="button" disabled={page === 0} onPress={() => setPage(p => p - 1)} style={{ opacity: page === 0 ? 0.3 : 1, padding: 10 }}>
            <Text style={{ color: '#E3ECF3', fontFamily: F.sansBold, fontWeight: '700', fontSize: 15 }}>← {tx('Geri', 'Back', lang)}</Text>
          </Pressable>
          <Text style={{ color: '#93A9BB', alignSelf: 'center', fontSize: 13 }}>{page + 1} / {pages.length}</Text>
          <Pressable accessibilityRole="button" disabled={page === pages.length - 1} onPress={() => setPage(p => p + 1)} style={{ opacity: page === pages.length - 1 ? 0.3 : 1, padding: 10 }}>
            <Text style={{ color: '#F2B84B', fontFamily: F.sansBold, fontWeight: '700', fontSize: 15 }}>{tx('İleri', 'Next', lang)} →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
function MonthBars({ months, top, start, lang }: { months: number[]; top: number[]; start: number; lang: Lang }) {
  const mx = Math.max(1, ...months);
  const ab = (i: number) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'short' }).format(new Date(start + (i + 0.5) * (YEAR / 12)));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 130 }}>
      {months.map((v, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ width: '100%', height: 8 + (v / mx) * 96, borderRadius: 5, backgroundColor: top.includes(i) ? '#F2B84B' : 'rgba(242,184,75,0.35)' }} />
          <Text style={{ fontSize: 10, color: '#93A9BB', marginTop: 4 }}>{ab(i)}</Text>
        </View>
      ))}
    </View>
  );
}

// ===================== Ünlü ikizin =====================
function Twins() {
  const { chart, profile, lang } = useStore();
  const [scope, setScope] = useState<'all' | 'tr' | 'world'>('all');
  const list = useMemo(() => (chart && profile ? celebTwins(chart, profile.birth) : []), [chart, profile]);
  const shown = list.filter(t => scope === 'all' || (scope === 'world' ? t.world : !t.world)).slice(0, 6);
  const build = useCallback(() => twinSvg(profile?.name ?? '', shown.map(t => ({ name: t.name, score: t.score, reason: t.reasons.slice(0, 2).map(r => r[lang]).join(' · ') })), lang), [shown, profile, lang]);
  if (!chart || !profile) return null;
  return (
    <Section title={tx('Haritasına en çok benzeyen ünlüler', 'Celebrities whose charts are most like yours', lang)} sub={tx(`${CELEBS.tr.length + CELEBS.world.length} ünlü arasından (${CELEBS.tr.length} Türkiye, ${CELEBS.world.length} dünya) Güneş, Ay, Venüs, Mars ve Merkür burçlarıyla kader matrisi kartları karşılaştırılır. Ünlülerin doğum saatleri çoğu zaman bilinmediği için yükselen burç hesaba katılmaz.`, `Among ${CELEBS.tr.length + CELEBS.world.length} celebrities, Sun, Moon, Venus, Mars and Mercury signs plus destiny matrix cards are compared. Celebrities’ birth times are usually unknown, so the rising sign is left out.`, lang)}>
      <Chips items={[{ key: 'all', label: tx('Hepsi', 'All', lang) }, { key: 'tr', label: tx('Türkiye', 'Türkiye', lang) }, { key: 'world', label: tx('Dünya', 'World', lang) }]} value={scope} onChange={v => setScope(v as any)} />
      {shown.map((t, i) => (
        <View key={t.name} style={[st.panel, { marginTop: 10, borderLeftWidth: 3, borderLeftColor: i === 0 ? C.gold : C.line }]}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ fontFamily: serif, fontSize: 22, color: C.ink, flex: 1 }}>{i + 1}. {t.name}</Text>
            <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 18, color: C.gold }}>%{t.score}</Text>
          </View>
          <Text style={st.sub}>{FIELD[t.field][lang]} · {t.year}</Text>
          <Text style={[st.p, { marginTop: 4 }]}>{t.reasons.map(r => r[lang]).join(' · ') || tx('Element olarak benzersiniz.', 'You share elements.', lang)}</Text>
        </View>
      ))}
      <ShareToggle label={tx('Ünlü ikiz kartın', 'Your celeb twin card', lang)} build={build} filename={`unlu-ikizim-${safeName(profile.name)}.png`} lang={lang} />
    </Section>
  );
}

// ===================== Testler =====================
const QUIZ: { q: L; opts: L[]; a: number; why: L }[] = [
  { q: { tr: 'Güneş burcun neyi anlatır?', en: 'What does your Sun sign describe?' }, opts: [{ tr: 'Özünü ve hayat amacını', en: 'Your core and life purpose' }, { tr: 'İlk izlenimini', en: 'Your first impression' }, { tr: 'Paranı', en: 'Your money' }], a: 0, why: { tr: 'Güneş özü, iradeyi ve parlamak istediğin alanı gösterir. İlk izlenim yükselendir.', en: 'The Sun shows your core and will. First impression is the Ascendant.' } },
  { q: { tr: 'Yükselen burcu hesaplamak için ne gerekir?', en: 'What do you need to calculate your rising sign?' }, opts: [{ tr: 'Sadece doğum günü', en: 'Just the birthday' }, { tr: 'Doğum saati ve yeri', en: 'Birth time and place' }, { tr: 'Ay burcu', en: 'Moon sign' }], a: 1, why: { tr: 'Yükselen yaklaşık iki saatte bir değişir; saat ve yer şarttır.', en: 'The Ascendant changes about every two hours; time and place are essential.' } },
  { q: { tr: 'Hangi gezegen aşkı ve değerleri temsil eder?', en: 'Which planet represents love and values?' }, opts: [{ tr: 'Mars', en: 'Mars' }, { tr: 'Venüs', en: 'Venus' }, { tr: 'Satürn', en: 'Saturn' }], a: 1, why: { tr: 'Venüs sevme biçimini, zevklerini ve değer verdiklerini anlatır.', en: 'Venus describes how you love, your tastes and values.' } },
  { q: { tr: '7. ev hangi konularla ilgilidir?', en: 'What is the 7th house about?' }, opts: [{ tr: 'Kariyer', en: 'Career' }, { tr: 'Evlilik ve ortaklık', en: 'Marriage and partnership' }, { tr: 'Sağlık', en: 'Health' }], a: 1, why: { tr: '7. ev ciddi ilişkileri, evliliği ve ortaklıkları gösterir. Kariyer 10. evdir.', en: 'The 7th house shows marriage and partnerships. Career is the 10th.' } },
  { q: { tr: 'Satürn dönüşü yaklaşık kaç yaşında yaşanır?', en: 'Around what age is the Saturn return?' }, opts: [{ tr: '18', en: '18' }, { tr: '29', en: '29' }, { tr: '42', en: '42' }], a: 1, why: { tr: 'Satürn güneşin etrafını yaklaşık 29,5 yılda dolaşır; ilk dönüş 29 civarıdır.', en: 'Saturn orbits in about 29.5 years; the first return is around 29.' } },
  { q: { tr: 'Kare açı genelde ne anlatır?', en: 'What does a square usually mean?' }, opts: [{ tr: 'Gerilim ve harekete geçirme', en: 'Tension that pushes you to act' }, { tr: 'Kolay akış', en: 'Easy flow' }, { tr: 'Etkisizlik', en: 'No effect' }], a: 0, why: { tr: 'Kare iki enerjiyi sürtüştürür; bu sürtünme seni harekete geçirir.', en: 'A square creates friction that pushes you to act.' } },
  { q: { tr: 'Hangisi su elementi burcudur?', en: 'Which is a water sign?' }, opts: [{ tr: 'Kova', en: 'Aquarius' }, { tr: 'Akrep', en: 'Scorpio' }, { tr: 'Yay', en: 'Sagittarius' }], a: 1, why: { tr: 'Su burçları Yengeç, Akrep ve Balık. Kova adına rağmen hava burcudur.', en: 'Water signs are Cancer, Scorpio and Pisces. Aquarius is air despite its name.' } },
  { q: { tr: 'Merkür retrosu neyi anlatır?', en: 'What does Mercury retrograde mean?' }, opts: [{ tr: 'Merkür gerçekten geri gider', en: 'Mercury really moves backward' }, { tr: 'Dünyadan bakınca geri gidiyor gibi görünür', en: 'It only appears to move backward from Earth' }, { tr: 'Merkür kaybolur', en: 'Mercury disappears' }], a: 1, why: { tr: 'Retro bir görünüm hareketidir; iletişim ve planları gözden geçirme zamanı sayılır.', en: 'Retrograde is apparent motion; it’s seen as a time to review plans and communication.' } },
];
function Tests() {
  const { chart, profile, lang } = useStore();
  const [test, setTest] = useState<'planet' | 'love' | 'element' | 'card' | 'quiz'>('planet');
  if (!chart || !profile) return null;
  return (
    <View>
      <Chips items={[{ key: 'planet', label: tx('Baskın gezegenin', 'Dominant planet', lang) }, { key: 'love', label: tx('Aşk dilin', 'Love language', lang) }, { key: 'element', label: tx('Elementin', 'Element', lang) }, { key: 'card', label: tx('Tarot kartın', 'Your tarot card', lang) }, { key: 'quiz', label: tx('Bilgini sına', 'Test your knowledge', lang) }]} value={test} onChange={v => setTest(v as any)} />
      <View style={{ height: 12 }} />
      {test === 'planet' ? <PlanetTest chart={chart} name={profile.name} lang={lang} /> : test === 'love' ? <LoveTest chart={chart} name={profile.name} lang={lang} /> : test === 'element' ? <ElementTest chart={chart} name={profile.name} lang={lang} /> : test === 'card' ? <CardTest name={profile.name} b={profile.birth} lang={lang} /> : <Quiz lang={lang} />}
    </View>
  );
}
function ResultBox({ kicker, title, text, children }: { kicker: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <View style={[st.panel, { borderLeftWidth: 3, borderLeftColor: C.gold }]}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold }}>{kicker}</Text>
      <Text style={{ fontFamily: serif, fontSize: 26, lineHeight: 32, color: C.ink, marginTop: 2 }}>{title}</Text>
      <P style={{ marginTop: 6 }}>{text}</P>
      {children}
    </View>
  );
}
const Bars = ({ rows }: { rows: { label: string; v: number; col: string }[] }) => (
  <View style={{ marginTop: 10 }}>
    {rows.map(r => (
      <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Text style={[st.p, { width: 120 }]}>{r.label}</Text>
        <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: C.line }}><View style={{ width: `${Math.min(100, r.v)}%`, height: 10, borderRadius: 5, backgroundColor: r.col }} /></View>
        <Text style={[st.sub, { width: 40, textAlign: 'right' }]}>%{r.v}</Text>
      </View>
    ))}
  </View>
);
function PlanetTest({ chart, name, lang }: { chart: Chart; name: string; lang: Lang }) {
  const d = useMemo(() => dominantPlanet(chart), [chart]);
  const tot = d.scores.reduce((a, b) => a + b.v, 0);
  const rows = d.scores.slice(0, 5).map((s, i) => ({ label: BODIES[s.id].name[lang], v: Math.round((s.v / tot) * 100), col: i === 0 ? C.gold : C.sub }));
  const pt = PLANET_TYPE[d.id]!;
  const build = useCallback(() => testSvg(tx('BASKIN GEZEGENİM', 'MY DOMINANT PLANET', lang), name, pt.title[lang], pt.text[lang], rows.map(r => ({ ...r, col: '#F2B84B' })), lang), [d, lang]);
  return (
    <ResultBox kicker={tx('Haritanı en çok yöneten gezegen', 'The planet that rules your chart most', lang)} title={`${BODIES[d.id].glyph} ${pt.title[lang]}`} text={pt.text[lang]}>
      <Bars rows={rows} />
      <Sub>{tx('Köşelere yakınlık, burç yöneticilikleri ve açı sayısına göre hesaplandı.', 'Based on angularity, sign rulerships and number of aspects.', lang)}</Sub>
      <ShareToggle label={tx('Sonuç kartın', 'Your result card', lang)} build={build} filename={`baskin-gezegen-${safeName(name)}.png`} lang={lang} />
    </ResultBox>
  );
}
function LoveTest({ chart, name, lang }: { chart: Chart; name: string; lang: Lang }) {
  const r = useMemo(() => loveLanguage(chart), [chart]);
  const rows = (Object.keys(LOVE_LANG) as LoveLang[]).sort((a, b) => r.pct[b] - r.pct[a]).map(k => ({ label: LOVE_LANG[k].title[lang], v: r.pct[k], col: k === r.lead ? C.second : C.sub }));
  const build = useCallback(() => testSvg(tx('AŞK DİLİM', 'MY LOVE LANGUAGE', lang), name, LOVE_LANG[r.lead].title[lang], LOVE_LANG[r.lead].text[lang], rows.map(x => ({ ...x, col: '#F08F6F' })), lang), [r, lang]);
  return (
    <ResultBox kicker={tx('Venüs, Ay ve Mars burçlarına göre aşk dilin', 'Your love language from Venus, Moon and Mars', lang)} title={`♥ ${LOVE_LANG[r.lead].title[lang]}`} text={LOVE_LANG[r.lead].text[lang]}>
      <Bars rows={rows} />
      <ShareToggle label={tx('Sonuç kartın', 'Your result card', lang)} build={build} filename={`ask-dilim-${safeName(name)}.png`} lang={lang} />
    </ResultBox>
  );
}
function ElementTest({ chart, name, lang }: { chart: Chart; name: string; lang: Lang }) {
  const e = useMemo(() => elementProfile(chart), [chart]);
  const rows = e.pct.map((v, i) => ({ label: ELEMENT_TYPE[i].title[lang], v, col: ELEMENT_COLOR[i] }));
  const build = useCallback(() => testSvg(tx('ELEMENTİM', 'MY ELEMENT', lang), name, ELEMENT_TYPE[e.lead].title[lang], ELEMENT_TYPE[e.lead].text[lang], rows.map((x, i) => ({ ...x, col: ['#F28A5B', '#9BC26B', '#6CC0F0', '#A99BF5'][i] })), lang), [e, lang]);
  return (
    <ResultBox kicker={tx('Haritandaki element dengesi', 'The element balance in your chart', lang)} title={ELEMENT_TYPE[e.lead].title[lang]} text={ELEMENT_TYPE[e.lead].text[lang]}>
      <Bars rows={rows} />
      <ShareToggle label={tx('Sonuç kartın', 'Your result card', lang)} build={build} filename={`elementim-${safeName(name)}.png`} lang={lang} />
    </ResultBox>
  );
}
function CardTest({ name, b, lang }: { name: string; b: { day: number; month: number; year: number }; lang: Lang }) {
  const n = destinyMatrix(b.day, b.month, b.year).E;
  const cap = (x: string) => x.charAt(0).toLocaleUpperCase(lang) + x.slice(1);
  const build = useCallback(() => testSvg(tx('TAROT KARTIM', 'MY TAROT CARD', lang), name, `${n} ${ARCANA[n].name[lang]}`, `${cap(ARCANA[n].key[lang])}. ${ARCANA[n].plus[lang]}`, [], lang), [n, lang]);
  return (
    <ResultBox kicker={tx('Kader matrisinin merkezindeki kart: özün', 'The card at the centre of your matrix: your core', lang)} title={`${n} ${ARCANA[n].name[lang]}`} text={`${cap(ARCANA[n].key[lang])}. ${ARCANA[n].plus[lang]} ${ADVICE[n][lang]}`}>
      <View style={{ alignItems: 'center', marginTop: 10 }}><TarotCard n={n} w={120} name={ARCANA[n].name[lang]} /></View>
      <ShareToggle label={tx('Sonuç kartın', 'Your result card', lang)} build={build} filename={`tarot-kartim-${safeName(name)}.png`} lang={lang} />
    </ResultBox>
  );
}
function Quiz({ lang }: { lang: Lang }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  if (i >= QUIZ.length) return (
    <ResultBox kicker={tx('Sonuç', 'Result', lang)} title={tx(`${QUIZ.length} sorudan ${score} doğru`, `${score} of ${QUIZ.length} correct`, lang)} text={score >= 7 ? tx('Harika! Astrolojinin temellerini çok iyi biliyorsun.', 'Great! You know the basics really well.', lang) : score >= 4 ? tx('Fena değil. Terimler bölümüne göz atarak eksiklerini tamamlayabilirsin.', 'Not bad. Browse the Glossary to fill the gaps.', lang) : tx('Yolun başındasın. Terimler bölümü sana çok yardımcı olacak.', 'You’re just starting. The Glossary will help a lot.', lang)}>
      <Pressable accessibilityRole="button" onPress={() => { setI(0); setPick(null); setScore(0); }} style={{ marginTop: 10 }}><Text style={{ color: C.rose, fontFamily: F.sansBold, fontWeight: '700' }}>{tx('Tekrar dene', 'Try again', lang)}</Text></Pressable>
    </ResultBox>
  );
  const q = QUIZ[i];
  return (
    <View style={st.panel}>
      <Text style={st.sub}>{tx(`Soru ${i + 1} / ${QUIZ.length}`, `Question ${i + 1} / ${QUIZ.length}`, lang)}</Text>
      <Text style={{ fontFamily: serif, fontSize: 22, color: C.ink, marginTop: 4 }}>{q.q[lang]}</Text>
      {q.opts.map((o, k) => {
        const done = pick !== null, right = k === q.a, mine = k === pick;
        return (
          <Pressable key={k} accessibilityRole="button" disabled={done} onPress={() => { setPick(k); if (k === q.a) setScore(s => s + 1); }}
            style={{ marginTop: 8, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: done && right ? C.earth : done && mine ? C.fire : C.line, backgroundColor: done && right ? 'rgba(77,124,15,0.1)' : 'transparent' }}>
            <Text style={{ fontSize: 16, color: C.ink }}>{o[lang]}</Text>
          </Pressable>
        );
      })}
      {pick !== null ? <>
        <P style={{ marginTop: 10 }}><Text style={{ fontWeight: '700', color: pick === q.a ? C.earth : C.fire }}>{pick === q.a ? tx('Doğru! ', 'Correct! ', lang) : tx('Olmadı. ', 'Not quite. ', lang)}</Text>{q.why[lang]}</P>
        <Pressable accessibilityRole="button" onPress={() => { setI(i + 1); setPick(null); }} style={{ marginTop: 8 }}><Text style={{ color: C.rose, fontFamily: F.sansBold, fontWeight: '700' }}>{i + 1 < QUIZ.length ? tx('Sonraki soru →', 'Next question →', lang) : tx('Sonucu gör →', 'See result →', lang)}</Text></Pressable>
      </> : null}
    </View>
  );
}

// ===================== Şehirlerin =====================
function Cities() {
  const { chart, profile, lang } = useStore();
  const picks = useMemo(() => (chart && chart.input.timeKnown ? cityPicks(chart, bigCities()) : []), [chart]);
  const build = useCallback(() => citySvg(profile?.name ?? '', picks.map(p => ({ theme: p.theme[lang], city: p.city, country: p.country, good: p.good })), lang), [picks, profile, lang]);
  if (!chart || !profile) return null;
  if (!chart.input.timeKnown) return <P>{tx('Şehir önerileri doğum saatine bağlıdır. Saatini ekle ya da Harita → Saat düzeltme ile bul.', 'City picks depend on your birth time. Add it or find it with Chart → Rectification.', lang)}</P>;
  return (
    <Section title={tx('Senin için öne çıkan şehirler', 'Cities that stand out for you', lang)} sub={tx('Doğduğun anda gezegenlerin dünya üzerinde hangi şehirlerden geçtiğine bakılır. Bir gezegenin çizgisine yakın şehirlerde o gezegenin konusu hayatında daha görünür olur. Haritalı ayrıntı için Harita → Kartografi.', 'Based on which cities your planets crossed at the moment you were born. Near a planet’s line, that planet’s themes become more visible. For the full map see Chart → Cartography.', lang)}>
      {picks.map(p => (
        <View key={p.theme.tr} style={[st.panel, { marginTop: 10, borderLeftWidth: 3, borderLeftColor: p.good ? C.gold : C.fire }]}>
          <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: p.good ? C.gold : C.fire }}>{p.theme[lang]}</Text>
          <Text style={{ fontFamily: serif, fontSize: 24, color: C.ink }}>{p.city}<Text style={{ fontFamily: F.sans, fontSize: 15, color: C.sub }}>  {p.country}</Text></Text>
          <P style={{ marginTop: 2 }}>{p.why[lang]}</P>
          <Sub>{tx(`Çizgiye yaklaşık ${p.km} km`, `About ${p.km} km from the line`, lang)}</Sub>
        </View>
      ))}
      <ShareToggle label={tx('Şehirlerim kartı', 'My cities card', lang)} build={build} filename={`sehirlerim-${safeName(profile.name)}.png`} lang={lang} />
    </Section>
  );
}
