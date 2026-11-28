import React, { useMemo, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useStore } from '../store';
import type { BodyId } from '../engine/astro';
import { PLANETS } from '../engine/astro';
import { crossAspects, compositeChart, davisonChart, harmonyBand } from '../engine/techniques';
import { VENUS } from '../content/placements';
import { MARS_DESIRE, PARTNER, DATING, VENUS_HOUSE_MEET, PLANET_IN_7, signOfCusp, houseRulerText } from '../content/life';
import { synastry, SYN_LABEL } from '../content/forecast';
import { concord } from '../content/lillyNatal';
import { SIGNS } from '../content/base';
import { HARMONY } from '../content/techniqueTexts';
import { deepSpouse } from '../content/spouseDeep';
import { spouseProfile, marriageWindows, spouseArchetype, spouseJob, fateSections } from '../content/spouse';
import { personCtx } from '../engine/person';
import { lifeTimeline } from '../engine/timeline';
import { derivedSpouse, junoRules, VENUS_ADMIRED, attractionText } from '../content/loveExtras';
import { WindowCard } from './FutureScreen';
import { useNav, takePendingKind, scrollTop } from '../nav';
import GroupCompat from '../ui/GroupCompat';
import { BestDays } from '../ui/ExtrasUI';
import { TodayHub } from '../ui/Cosmic';
import RelStory from '../ui/RelStory';
import { LoveBack, LoveHub, LoveItem, LovePart, LoveRail } from '../ui/LoveNav';
import { inviteLink, shareLink } from '../invite';
import { F } from '../theme';
import { ActivityIndicator, Pressable } from 'react-native';
import { useEffect } from 'react';
import type { Window } from '../engine/timeline';
import type { Chart } from '../engine/astro';
import type { Profile } from '../store';
import { EVENTS } from '../content/lifeEvents';
import { SynastryReport, SynastryTables, RelChartReport, synAspects } from '../ui/RelationshipViews';
import { RadarChart, RadarOverride } from '../ui/RelViz';
import { areas, score } from '../content/synastryAreas';
import { T2S } from '../i18n2';
import BirthForm from '../ui/BirthForm';
import Wheel from '../ui/Wheel';
import Tables from '../ui/Tables';
import { Bar, Btn, Chips, H1, P, Row, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, serif } from '../theme';

type Rel = 'synastry' | 'composite' | 'davison';

export default function LoveScreen() {
  const { chart, s, lang, opts, people, profile, addPerson, chartOf, showAsteroids } = useStore();
  const t = T2S[lang];
  const { inner, wide } = useLayout();
  const width = inner(1180) + 32 - (wide ? 282 : 0);
  const others = people.filter(p => p.id !== profile?.id);
  const [pend] = useState(() => takePendingKind());
  const [pid, setPid] = useState<string | null>(pend?.startsWith('compat:') ? pend.slice(7) : others[0]?.id ?? null);
  const [adding, setAdding] = useState(others.length === 0);
  const [rel, setRel] = useState<Rel>('synastry');
  const [view, setView] = useState<'readings' | 'tables'>('readings');
  const [part, setPart] = useState<LovePart | null>(pend?.startsWith('compat') || pend === 'group' ? 'compat' : pend === 'story' ? 'story' : pend === 'spouse' ? 'spouse' : null);
  // Telefonda bölüm seçilmemişse kartlar görünür; webde ilk bölüm açık gelir
  const cur: LovePart | null = part ?? (wide ? 'spouse' : null);
  const [cmode, setCmode] = useState<'pair' | 'group'>(pend === 'group' ? 'group' : 'pair');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  // Kişi ya da sekme değişince eski "paylaşıldı" mesajı kalmasın; başarı mesajı birkaç saniye sonra kaybolur
  useEffect(() => { setInviteMsg(''); }, [pid, part]);
  useEffect(() => {
    if (!inviteMsg || inviteMsg.includes('://')) return;
    const id = setTimeout(() => setInviteMsg(''), 4000);
    return () => clearTimeout(id);
  }, [inviteMsg]);
  const partner = others.find(p => p.id === pid) ?? null;
  const pc = useMemo(() => (partner ? chartOf(partner) : null), [partner, opts]);
  const data = useMemo(() => {
    if (!chart || !pc) return null;
    const sy = synastry(chart, pc);
    const cross = synAspects(crossAspects(pc, chart, 6, [...PLANETS, 'node', 'chiron', 'juno', 'ceres', 'pallas', 'vesta', 'lilith', 'fortune'] as BodyId[]));
    const part = (k: string) => sy.parts.find(p => p.key === k)?.score;
    const ov: RadarOverride = { attraction: part('attraction'), emotion: part('emotional'), comm: part('communication'), longevity: part('longterm') };
    return {
      sy, lilly: concord(chart, pc), cross, ar: areas(score(cross)), ov,
      wheelCross: crossAspects(pc, chart, 6, [...PLANETS, 'node'] as BodyId[]),
      comp: compositeChart(chart, pc, opts), dav: davisonChart(chart, pc, opts),
    };
  }, [chart, pc, opts]);
  if (!chart || !profile) return null;
  const P_ = chart.positions;
  const desc = signOfCusp(chart, 7), fifth = signOfCusp(chart, 5);
  const in7 = (Object.keys(PLANET_IN_7) as BodyId[]).filter(p => P_[p]?.house === 7);
  const me = lang === 'tr' ? 'Senin' : 'Your';
  const them = partner ? (lang === 'tr' ? `${partner.name || 'onun'}` : `${partner.name || 'their'}’s`) : '';

  const relChart = rel === 'composite' ? data?.comp : rel === 'davison' ? data?.dav : null;

  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const items: LoveItem[] = [
    { key: 'spouse', title: L('Gelecekteki eşin', 'Your future partner'), desc: L('Nasıl biri, nereden çıkar, ne zaman?', 'Who, where you meet, when?'), teaser: desc != null ? L(`Alçalanın ${SIGNS[desc].tr}${in7.length ? ' · 7. evde ' + in7.length + ' gezegen' : ''}`, `Descendant in ${SIGNS[desc].en}`) : undefined },
    { key: 'compat', title: L('Uyum analizi', 'Compatibility'), desc: L('Bir kişiyle ya da bir grupla uyumun', 'With one person or a whole group'), teaser: partner && data ? L(`${partner.name || 'O'} ile %${data.sy.total} uyum`, `${data.sy.total}% with ${partner.name || 'them'}`) : others.length ? L('Bir kişi seç', 'Pick someone') : L('Henüz kimse eklenmedi', 'No one added yet') },
    { key: 'story', title: L('İlişki hikâyesi', 'Relationship story'), desc: L('Tanışma, ilk buluşma, ayrılık ve barışma anlarının haritaları', 'Charts of meeting, first date, breakup and reunion'), teaser: L('Dürüst okuma: acı gerçekler dahil', 'Honest reading, hard truths included') },
  ];
  const title = <><H1>{L('Aşk ve uyum', 'Love and compatibility')}</H1><Sub style={{ marginBottom: 16, maxWidth: 620 }}>{L('Haritana göre hayatına girecek partner, evlilik zamanı ve seçtiğin biriyle uyumun.', 'The partner your chart describes, marriage timing, and your compatibility with someone you choose.')}</Sub></>;

  const body = cur === null ? null : (
    <>
      {cur === 'story' ? <RelStory /> : cur === 'spouse' ? <SpouseBlock /> : <>
      <Segmented items={[{ key: 'pair', label: L('İki kişi', 'Two people') }, { key: 'group', label: L('Grup', 'Group') }]} value={cmode} onChange={v => setCmode(v as 'pair' | 'group')} />
      {cmode === 'group' ? <GroupCompat onOpenPair={id => { setPid(id); setCmode('pair'); scrollTop(); }} /> : <>

      <Section title={s.compat} sub={s.compatSub}>
        {others.length ? (
          <>
            <Text style={st.label}>{t.choose}</Text>
            <Chips items={others.map(p => ({ key: p.id, label: p.name || p.place }))} value={pid ?? ''} onChange={v => { setPid(v); setAdding(false); }} />
          </>
        ) : null}
        {adding ? (
          <BirthForm nameLabel={s.partnerName} submitLabel={s.calcCompat} onSubmit={v => { const np = addPerson(v); setPid(np.id); setAdding(false); }} />
        ) : <Btn kind="ghost" title={t.addPerson} onPress={() => setAdding(true)} />}
        <View style={{ marginTop: 10 }}>
          <Btn kind="outline" small title={(inviteOpen ? '▴ ' : '▾ ') + (lang === 'tr' ? 'Doğum bilgisini bilmiyor musun? Davet gönder' : 'Don’t know their birth details? Send an invite')} onPress={() => setInviteOpen(o => !o)} />
        </View>
        {inviteOpen ? (
        <View style={[st.panel, { marginTop: 10, backgroundColor: C.goldSoft, borderColor: C.goldSoft }]}>
          <P>{lang === 'tr' ? 'Bağlantıyı açan kişi kendi doğum bilgisini girer ve ikinizin uyumunu görür. O da sana kendi bağlantısını gönderince sonucu sen de görürsün.' : 'Whoever opens the link enters their birth details and sees your compatibility. When they send you their own link back, you see it too.'}</P>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8, alignItems: 'center' }}>
            <Btn title={lang === 'tr' ? 'Uyum davetini paylaş' : 'Share compatibility invite'} onPress={async () => {
              const r = await shareLink(inviteLink(profile), lang === 'tr' ? `${profile.name || 'Ben'} seninle yıldız uyumumuza bakmak istiyor:` : `${profile.name || 'I'} want to check our star compatibility:`);
              setInviteMsg(r === 'copied' ? (lang === 'tr' ? 'Bağlantı kopyalandı; istediğin yere yapıştırabilirsin.' : 'Link copied; paste it anywhere.') : r === 'shared' ? (lang === 'tr' ? 'Paylaşıldı.' : 'Shared.') : (lang === 'tr' ? `Kopyalanamadı. Bağlantı: ${inviteLink(profile)}` : `Could not copy. Link: ${inviteLink(profile)}`));
            }} />
            {inviteMsg ? <Sub style={{ flex: 1 }}>{inviteMsg}</Sub> : null}
          </View>
          <Sub style={{ marginTop: 6 }}>{lang === 'tr' ? 'Bağlantı doğum tarihini, saatini ve yerini içerir; yalnızca güvendiğin kişilerle paylaş. Bilgiler hiçbir sunucuya gönderilmez, sadece bağlantının içindedir.' : 'The link contains your birth date, time and place; share it only with people you trust. Nothing is sent to a server; it lives only in the link.'}</Sub>
        </View>
        ) : null}
      </Section>

      {data && partner ? (
        <>
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            {rel === 'synastry' ? <Wheel chart={chart} outer={pc} cross={data.wheelCross} size={Math.min(width - 32, 460)} asteroids={showAsteroids} /> : <Wheel chart={relChart!} size={Math.min(width - 32, 460)} asteroids={showAsteroids} />}
            {rel === 'synastry' ? <Text style={[st.sub, { marginTop: 6 }]}><Text style={{ color: C.second }}>● {partner.name}</Text>   {profile.name}</Text> : null}
          </View>
          <Segmented items={[{ key: 'readings', label: t.views.readings }, { key: 'tables', label: t.views.tables }]} value={view} onChange={v => setView(v as any)} />

          {view === 'tables' ? (
            rel === 'synastry'
              ? <SynastryTables me={chart} them={pc!} cross={data.cross} myName={profile.name} theirName={partner.name} lang={lang} />
              : <Tables chart={relChart!} t={t} lang={lang} natal={false} asteroids={showAsteroids} showLots />
          ) : rel === 'synastry' ? (
            <>
              <Section title={t.harmony}>
                <View style={{ alignItems: 'center', marginVertical: 6 }}>
                  <Text style={{ fontFamily: serif, fontSize: 52, color: C.rose }}>%{data.sy.total}</Text>
                  <Sub>{HARMONY[harmonyBand(data.sy.total)][lang]}</Sub>
                </View>
                <RadarChart ar={data.ar} ov={data.ov} lang={lang} size={Math.min(width - 210, 360)} />
                <Sub style={{ marginTop: 6, textAlign: 'center' }}>{lang === 'tr' ? 'Her köşe bir alandaki uyumu gösterir: 0–30 zayıf, 30–50 orta, 50–80 iyi, 80–100 mükemmel.' : 'Each corner shows harmony in one area: 0–30 weak, 30–50 average, 50–80 good, 80–100 perfect.'}</Sub>
              </Section>
              <SharedWindows me={chart} them={pc!} meP={profile} themP={partner} lang={lang} />
              <SynastryReport me={chart} them={pc!} cross={data.cross} myName={profile.name} theirName={partner.name} lang={lang} asteroids={showAsteroids} ov={data.ov} total={data.sy.total} />
              <Section title={data.lilly ? data.lilly.title[lang] : ''}>
                {data.lilly?.items.map((it, i) => <View key={i} style={st.row}><P>{it.text[lang]}</P></View>)}
              </Section>
            </>
          ) : relChart ? (
            <RelChartReport chart={relChart} kind={rel === 'composite' ? 'composite' : 'davison'} lang={lang} asteroids={showAsteroids} desc={rel === 'composite' ? t.compositeDesc : t.davisonDesc} />
          ) : null}
        </>
      ) : null}
      </>}
      </>}
    </>
  );

  if (wide) return (
    <View>
      {title}
      <View style={{ flexDirection: 'row', gap: 32, alignItems: 'flex-start', marginTop: 4 }}>
        <LoveRail items={items} value={cur!} onChange={k => { setPart(k); scrollTop(); }} />
        <View style={{ flex: 1, minWidth: 0 }}>{body}</View>
      </View>
    </View>
  );
  if (cur === null) return <View>{title}<LoveHub items={items} onOpen={k => { setPart(k); scrollTop(); }} /></View>;
  return (
    <View>
      <LoveBack back={L('Aşk ve uyum', 'Love and compatibility')} onBack={() => { setPart(null); scrollTop(); }} />
      {body}
    </View>
  );
}

/** İki kişinin hayat takviminde aşk ve evlilik dönemlerinin çakıştığı aralıklar */
function SharedWindows({ me, them, meP, themP, lang }: { me: Chart; them: Chart; meP: Profile; themP: Profile; lang: 'tr' | 'en' }) {
  const [list, setList] = useState<{ s: Date; e: Date; a: Window; b: Window }[] | null>(null);
  useEffect(() => {
    setList(null);
    const id = setTimeout(() => {
      const now = Date.now(), horizon = now + 15 * 365.25 * 864e5;
      const pick = (c: Chart, p: Profile) => lifeTimeline(c, { fromAge: 16, toAge: 80, ...personCtx(p) }).filter(w => w.topic === 'love' && w.end.getTime() > now && w.start.getTime() < horizon);
      const A = pick(me, meP), B = pick(them, themP);
      const out: { s: Date; e: Date; a: Window; b: Window }[] = [];
      for (const a of A) for (const b of B) {
        const s0 = Math.max(a.start.getTime(), b.start.getTime(), now), e0 = Math.min(a.end.getTime(), b.end.getTime());
        if (e0 - s0 >= 25 * 864e5) out.push({ s: new Date(s0), e: new Date(e0), a, b });
      }
      setList(out.sort((x, y) => x.s.getTime() - y.s.getTime()).slice(0, 4));
    }, 60);
    return () => clearTimeout(id);
  }, [me, them, meP, themP]);
  const fmt = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const head = (w: Window) => w.reasons.map(r => EVENTS[r.id]?.head?.[lang]).find(Boolean) ?? '';
  return (
    <Section title={L('Birlikte önemli dönemleriniz', 'Your shared key periods')} sub={L(`Önümüzdeki 15 yılda ikinizin hayat takviminde aşk ve evlilik dönemlerinin aynı aylara denk geldiği aralıklar. İki haritanın aynı anda tetiklendiği zamanlar, ilişkide adım atmak (birlikte yaşama, nişan, evlilik) için en güçlü zamanlardır.`, `Ranges in the next 15 years when love and marriage periods in both your life calendars fall in the same months. When both charts are triggered at once, it is the strongest time to take a step together (moving in, engagement, marriage).`)}>
      {list === null ? <ActivityIndicator color={C.rose} style={{ alignSelf: 'flex-start' }} />
        : list.length ? list.map((x, i) => {
          const a = fmt(x.s), b = fmt(new Date(x.e.getTime() - 15 * 864e5));
          return (
            <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: C.second, paddingLeft: 12, marginBottom: 14 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 20, lineHeight: 26, color: C.ink }}>{a === b ? a : `${a} – ${b}`}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink, marginTop: 2 }}>
                <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>{meP.name || L('Sen', 'You')}: </Text>{head(x.a)}{'   '}
                <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>{themP.name || L('O', 'Them')}: </Text>{head(x.b)}
              </Text>
              <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, marginTop: 2 }}>{L(`${new Set([...x.a.techs, ...x.b.techs]).size} farklı teknik bu aralığa işaret ediyor`, `${new Set([...x.a.techs, ...x.b.techs]).size} different techniques point to this range`)}</Text>
            </View>
          );
        }) : <P>{L('Önümüzdeki 15 yılda iki takvimin çakıştığı belirgin bir aşk dönemi çıkmadı; bu, adım atmak için kendi uygun zamanınızı seçebileceğiniz anlamına gelir.', 'No clear overlapping love period in the next 15 years; you are free to pick your own moment.')}</P>}
    </Section>
  );
}

/** Gelecekteki eş tahmini ve evlilik zamanı */
function SpouseBlock() {
  const { chart, lang, s, profile, setProfile } = useStore();
  const nav = useNav();
  const gender = profile?.gender ?? null;
  const [wins, setWins] = useState<Window[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  useEffect(() => {
    setWins(null);
    if (!chart) return;
    const id = setTimeout(() => setWins(marriageWindows(chart, new Date(), 3, undefined, personCtx(profile))), 30);
    return () => clearTimeout(id);
  }, [chart, profile]);
  if (!chart) return null;
  const base = spouseProfile(chart, lang) ?? [];
  const job = spouseJob(chart);
  const has = !!(chart.cusps.length || gender);
  const deep = deepSpouse(chart, gender);
  const all = [...(gender ? [spouseArchetype(chart, gender)] : []), ...base, ...(has ? fateSections(chart, gender) : []), ...(job ? [job] : []), ...deep];
  const pick = (ids: string[]) => ids.map(id => all.find(x => x.id === id)).filter(Boolean) as typeof all;
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const P_ = chart.positions;
  const juno = junoRules(chart), derived = derivedSpouse(chart);
  const card = (x: (typeof all)[number]) => (
    <View key={x.id} style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 27, color: C.ink }}>{x.title[lang]}</Text>
      <P style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 4, maxWidth: 660 }}>{x.text[lang]}</P>
      <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 20, color: C.sub, marginTop: 4 }}>{L('Neden: ', 'Why: ')}{x.why[lang]}</Text>
    </View>
  );
  const g1 = pick(['arch', 'who', 'darakaraka', 'look', 'bound']);
  const g2 = pick(['job', 'life']);
  const g3 = pick(['meet', 'direction', 'vertex']);
  const g4 = pick(['colour', 'lot', 'upapada', 'navamsa', 'ptolemy']);
  const noTime = !chart.cusps.length ? <Sub style={{ marginBottom: 12 }}>{s.needsTime}</Sub> : null;
  const items = [
    { key: 'who', glyph: '☉', title: L('Nasıl biri?', 'What are they like?'), teaser: L('Karakteri, görünüşü, gizli tarafı', 'Character, looks, hidden side'), body: <>{noTime}{g1.map(card)}{juno.length ? card({ id: 'juno', title: { tr: 'Juno’nun ipuçları', en: 'Clues from Juno' }, text: { tr: juno.map(x => x.tr).join(' '), en: juno.map(x => x.en).join(' ') }, why: { tr: 'Juno, evlilik ve bağlılığı anlatan asteroittir; yakın durduğu gezegenler ve bulunduğu ev eşin hakkında ek bilgi verir.', en: 'Juno is the asteroid of marriage and commitment; the planets it sits close to and its house add details about your spouse.' } } as any) : null}</> },
    { key: 'life', glyph: '♄', title: L('Hayatı ve mesleği', 'Their life and work'), teaser: L('Mesleği, hayat tarzı, ailesi ve parası', 'Work, lifestyle, family, money'), body: <>{noTime}{g2.map(card)}{derived.length ? (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 27, color: C.ink }}>{L('Eşinin hayatından ayrıntılar', 'Details of your spouse’s life')}</Text>
        <Sub style={{ marginTop: 2, marginBottom: 8, maxWidth: 640 }}>{L('Yedinci ev eşini temsil ettiği için, evleri yedinci evden başlayarak saydığında eşinin hayatının diğer alanlarını da okuyabilirsin. Buna türetilmiş evler denir.', 'Because the seventh house is your spouse, counting houses from it lets you read other parts of their life. This is called derived houses.')}</Sub>
        {derived.map((d, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink }}>{d.title[lang]}</Text>
            <P style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 26, color: C.ink, maxWidth: 660 }}>{d.text[lang]}</P>
          </View>
        ))}
      </View>) : null}</> },
    { key: 'meet', glyph: '⌖', title: L('Nerede, nasıl tanışırsınız?', 'Where and how you meet'), teaser: L('Tanışma yeri, yönü, kader anı', 'Place, direction, fated moment'), body: <>{noTime}{g3.map(card)}</> },
    { key: 'marriage', glyph: '⚭', title: L('Evliliğin nasıl olur?', 'What your marriage is like'), teaser: L('İlişkinin rengi, evlilik noktası, eski teknikler', 'Tone, Lot of Marriage, classical methods'), body: <>{noTime}{g4.map(card)}{!gender ? <Sub style={{ maxWidth: 640 }}>{L('Batlamyus’un kuralı cinsiyete göre Ay’a ya da Güneş’e bakar; Ayarlar’dan cinsiyet eklersen o bölüm de açılır.', 'Ptolemy’s rule uses the Moon or Sun depending on gender; add gender in Settings to see it.')}</Sub> : null}</> },
    { key: 'when', glyph: '◷', title: L('Ne zaman?', 'When?'), teaser: wins === null ? L('Hesaplanıyor…', 'Calculating…') : wins.length ? L(`${wins.length} güçlü dönem bulundu`, `${wins.length} strong periods found`) : L('Belirgin dönem yok', 'No marked period'), body: <>
      {wins === null ? <ActivityIndicator color={C.rose} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
        : wins.length ? (
          <>
            <Sub style={{ marginBottom: 12, maxWidth: 640 }}>{L('Önümüzdeki yıllarda ciddi bir ilişki ya da evlilik için en güçlü görünen dönemler. Bunlar transit, progresyon, solar arc, yaşın teması, tutulmalar ve Güneş dönüşü birlikte taranarak bulunur; Venüs ve 7. evin yanında Juno, Vertex, Evlilik noktası ve klasik eş gezegenin de hesaba katılır. Ne kadar çok teknik aynı döneme işaret ederse dönem o kadar güvenilirdir.', 'The strongest-looking periods ahead for a serious relationship or marriage, found by scanning transits, progressions, solar arcs, annual profections, eclipses and solar returns together; beyond Venus and the 7th house, Juno, the Vertex, the Lot of Marriage and the classical spouse planet are included. The more techniques agree on a period, the more reliable it is.')}</Sub>
            {wins.map((w, i) => <WindowCard key={i} w={w} lang={lang} showTip={false} />)}
          </>
        ) : <P>{L('Önümüzdeki yıllarda belirgin bir dönem çıkmadı.', 'No marked period found for the coming years.')}</P>}
      {(profile?.events ?? []).some(e => e.type === 'love' && e.date) ? (
        <Sub style={{ marginTop: 4, maxWidth: 640 }}>{L('Geçmiş ilişki tarihlerin hesaba katıldı: o tarihlerde etkin olan işaretler senin haritanda daha güçlü sayılıyor.', 'Your past relationship dates are included: signs active on those dates count more in your chart.')}</Sub>
      ) : (
        <View style={[st.panel, { marginTop: 8, marginBottom: 8 }]}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink }}>{L('Tahminleri sana göre ayarla', 'Tune the forecast to you')}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink, marginTop: 4 }}>{L('Geçmişte ciddi bir ilişkinin başladığı, nişanlandığın ya da evlendiğin bir tarih varsa Saat düzeltme bölümüne “Aşk / evlilik” olayı olarak ekle. Uygulama o tarihlerde hangi işaretlerin tuttuğuna bakar ve gelecekteki dönemleri buna göre ağırlıklandırır. Aynı tarihler doğum saatini düzeltmek için de kullanılır.', 'If a serious relationship began, or you got engaged or married, on a past date, add it as a “Love / marriage” event under Rectification. The app checks which signs worked on those dates and weights future periods accordingly. The same dates also help correct your birth time.')}</Text>
          <Pressable onPress={() => nav('chart:rectify')} accessibilityRole="link" style={{ alignSelf: 'flex-start', paddingTop: 6 }}>
            <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{L('Geçmiş tarih ekle', 'Add a past date')}</Text>
          </Pressable>
        </View>
      )}
      <Pressable onPress={() => nav('chart:timeline')} accessibilityRole="link" style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
        <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{L('Bütün hayat takvimini aç', 'Open your full life calendar')}</Text>
      </Pressable>
      <BestDays chart={chart} kind="love" lang={lang} />
    </> },
    { key: 'you', glyph: '♀', title: L('Sen nasıl seversin?', 'How you love'), teaser: L(`Venüs ${SIGNS[P_.venus.sign].tr}, Mars ${SIGNS[P_.mars.sign].tr}`, `Venus in ${SIGNS[P_.venus.sign].en}, Mars in ${SIGNS[P_.mars.sign].en}`), body: (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, maxWidth: 660 }}>
          {L(`Venüs’ün ${SIGNS[P_.venus.sign].tr} burcunda. ${VENUS[P_.venus.sign].tr} Mars’ın da ${SIGNS[P_.mars.sign].tr} burcunda. ${MARS_DESIRE[P_.mars.sign].tr}`,
            `Your Venus is in ${SIGNS[P_.venus.sign].en}: ${VENUS[P_.venus.sign].en} Your Mars is in ${SIGNS[P_.mars.sign].en}: ${MARS_DESIRE[P_.mars.sign].en}`)}
        </Text>
        {P_.venus.house ? <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 8, maxWidth: 660 }}>{L(`Venüs’ün ${P_.venus.house}. evinde, bu yüzden insanlar seni en çok şu yanınla beğenir: `, `Your Venus is in house ${P_.venus.house}, so people admire you most for this: `)}{(lang === 'tr' ? (x: string) => x.charAt(0).toLocaleLowerCase('tr') + x.slice(1) : (x: string) => x.charAt(0).toLowerCase() + x.slice(1))(VENUS_ADMIRED[P_.venus.house - 1][lang])}</Text> : null}
      </View>) },
  ];
  return (
    <Section title={L('Gelecekteki eşin', 'Your future partner')}>
      {open ? null : <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 17, lineHeight: 26, color: C.sub, marginBottom: 4, maxWidth: 640 }}>
        {L('Yedinci ev, onun gezegeni ve Venüs birlikte okunduğunda hayatına girecek ciddi partnerin portresi çıkar; klasik ve Vedik teknikler de bu portreye eklenir. Bir konuya dokun, ayrıntısı açılsın.',
          'Reading your seventh house, its planet and Venus together gives a portrait of your serious partner, with classical and Vedic techniques added. Tap a topic to open it.')}
      </Text>}
      {gender || open ? null : <Sub style={{ marginBottom: 4 }}>{L('Eşini anlatan gezegen cinsiyete göre değişir. Ayarlar’da cinsiyet eklersen bu bölüm daha ayrıntılı olur.', 'The planet describing your partner depends on gender. Add it in Settings for a more detailed reading.')}</Sub>}
      <TodayHub lang={lang} heading="" cols={wide ? 3 : 2} open={open} onOpen={k => { setOpen(k); scrollTop(); }} back={L('Eş konularına dön', 'Back to partner topics')} items={items} />
    </Section>
  );
}
