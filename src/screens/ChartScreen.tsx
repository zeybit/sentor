import React, { useCallback, useMemo, useState } from 'react';
import { Stelliums, ElementBalance } from '../ui/NatalBalance';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useStore } from '../store';
import { chartAt } from '../engine/astro';
import {
  ChartKind, crossAspects, transitChart, progressedChart, solarArcChart, solarReturnChart, lunarReturnChart, antisciaChart,
} from '../engine/techniques';
import { draconicChart } from '../engine/primary';
import { DraconicReading, PrimaryList } from '../ui/PrimaryUI';
import { T2S } from '../i18n2';
import Wheel from '../ui/Wheel';
import DateBar from '../ui/DateBar';
import Tables from '../ui/Tables';
import { NatalReading, KindReading, CharacterBook } from '../ui/Readings';
import { Cartography, Finder } from '../ui/Tools';
import Rectify from '../ui/Rectify';
import FutureScreen, { ActiveWindows } from './FutureScreen';
import { takePendingKind, useNav } from '../nav';
import { ChartPills, CoreEnergies, HubItem, TodayHub } from '../ui/Cosmic';
import { natalStory } from '../content/story';
import { BirthSecrets } from '../ui/ExtrasUI';
import { BODIES } from '../content/base';
import { scrollTop } from '../nav';
import { Chips, H1, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, F, serif } from '../theme';
import { KIND_INFO } from '../content/kindInfo';
import { fmtLocal, tzOffsetMinutes } from '../util';
import { ShareToggle, safeName } from '../ui/ShareImage';
import { bigThreeSvg } from '../content/shareCards';

type Kind = ChartKind | 'timeline' | 'primary' | 'cartography' | 'finder' | 'rectify';
const DATED: Kind[] = ['transit', 'progressed', 'solarArc', 'solarReturn', 'lunarReturn', 'now'];
const BIWHEEL: Kind[] = ['transit', 'progressed', 'solarArc'];

export default function ChartScreen() {
  const navTo = useNav();
  const { chart, s, lang, profile, opts, showAsteroids, location } = useStore();
  const t = T2S[lang];
  const { inner, twoCol, wide } = useLayout();
  const [kind, setKind] = useState<Kind>(() => (takePendingKind() as Kind) || 'natal');
  const [view, setView] = useState<'readings' | 'tables'>('readings');
  const [date, setDate] = useState(() => new Date());
  const [topic, setTopic] = useState<string | null>(null);
  const [hubTab, setHubTab] = useState<'parts' | 'kinds'>('parts');
  const chapters = useMemo(() => (chart ? natalStory(chart, lang) : []), [chart, lang]);

  const loc = location ?? (profile ? { label: profile.place, lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null);
  const other = useMemo(() => {
    if (!chart || !loc) return null;
    switch (kind) {
      case 'transit': return transitChart(chart, date, opts, loc.lat, loc.lon);
      case 'progressed': return progressedChart(chart, date, opts);
      case 'solarArc': return solarArcChart(chart, date, opts);
      case 'solarReturn': return solarReturnChart(chart, date, opts, loc.lat, loc.lon);
      case 'lunarReturn': return lunarReturnChart(chart, date, opts, loc.lat, loc.lon);
      case 'antiscia': return antisciaChart(chart, opts);
      case 'draconic': return draconicChart(chart, opts);
      case 'now': return chartAt(date, loc.lat, loc.lon, opts);
      default: return null;
    }
  }, [chart, kind, date, opts, loc?.lat, loc?.lon]);
  const cross = useMemo(() => (other && chart && BIWHEEL.includes(kind) ? crossAspects(other, chart, kind === 'transit' ? 3 : 1) : undefined), [other, chart, kind]);
  const buildBig = useCallback(() => (chart && profile ? bigThreeSvg(chart, profile.name, lang) : ''), [chart, profile, lang]);
  if (!chart || !profile) return null;

  const tz = loc?.tz ?? profile.birth.tz;
  const wheelChart = kind === 'natal' || BIWHEEL.includes(kind) || kind === 'antiscia' ? chart : other!;
  const outer = BIWHEEL.includes(kind) ? other : kind === 'antiscia' ? other : kind === 'draconic' ? chart : null;
  const shown = kind === 'natal' || kind === 'antiscia' ? chart : other;
  const kinds: Kind[] = ['natal', 'transit', 'progressed', 'timeline', 'solarArc', 'solarReturn', 'lunarReturn', 'primary', 'antiscia', 'draconic', 'now', 'cartography', 'finder', 'rectify'];

  const gmt = (() => { const m = tzOffsetMinutes(chart.input.tz, chart.utc); const hh = m / 60; return `GMT${hh >= 0 ? '+' : ''}${Number.isInteger(hh) ? hh : hh.toFixed(1)}`; })();
  const trL = (a: string, b: string) => (lang === 'tr' ? a : b);
  const openKind = (k: Kind) => { setKind(k); setTopic(null); scrollTop(); };

  if (kind === 'natal') {
    const CH_GLYPH: Record<string, string> = { core: BODIES.sun.glyph, character: BODIES.moon.glyph, mind: BODIES.mercury.glyph, love: BODIES.venus.glyph, work: BODIES.saturn.glyph, growth: BODIES.jupiter.glyph, deep: BODIES.pluto.glyph, path: '☊', world: '✈' };
    const firstS = (x: string) => (x.match(/[^.!?]+[.!?]+/) ?? [x])[0].trim();
    const pStyle = { fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginBottom: 16, maxWidth: 660 };
    const parts: HubItem[] = [
      ...chapters.map(c => ({ key: 'ch-' + c.id, glyph: CH_GLYPH[c.id] ?? '✦', title: c.title[lang], teaser: firstS(c.intro[lang]),
        body: <View><Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 17, lineHeight: 26, color: C.sub, marginBottom: 16, maxWidth: 640 }}>{c.intro[lang]}</Text>{c.paras.map((p, j) => <Text key={j} style={pStyle}>{p[lang]}</Text>)}</View> })),
      { key: 'secrets', glyph: '✧', title: trL('Doğum sırların', 'Birth secrets'), teaser: trL('Haritanın az bilinen detayları', 'Little-known details of your chart'), body: <BirthSecrets chart={chart} lang={lang} /> },
      { key: 'character', glyph: '◈', title: trL('Yerleşim yerleşim karakterin', 'Your character, placement by placement'), teaser: trL('Her gezegen tek tek', 'Planet by planet'), body: <CharacterBook chart={chart} lang={lang} /> },
      { key: 'stellium', glyph: '⁂', title: trL('Stelyumların', 'Your stelliums'), teaser: trL('Enerjinin toplandığı yerler', 'Where your energy gathers'), body: <Stelliums chart={chart} lang={lang} /> },
      { key: 'elements', glyph: '△', title: trL('Element dengen', 'Element balance'), teaser: trL('Ateş, toprak, hava, su', 'Fire, earth, air, water'), body: <ElementBalance chart={chart} lang={lang} /> },
      { key: 'tables', glyph: '▦', title: trL('Tablolar', 'Tables'), teaser: trL('Dereceler, evler, açılar', 'Degrees, houses, aspects'), body: <Tables chart={chart} t={t} lang={lang} natal asteroids={showAsteroids} /> },
    ];
    const GLYPH: Partial<Record<Kind, string>> = { transit: '⟳', progressed: '↗', timeline: '◷', solarArc: '⌒', solarReturn: '☉', lunarReturn: '☾', primary: '⇢', antiscia: '⇋', draconic: '☊', now: '◉', cartography: '⌖', finder: '⌕', rectify: '✎' };
    const kindItems: HubItem[] = kinds.filter(k => k !== 'natal').map(k => ({ key: k, glyph: GLYPH[k] ?? '✦', title: t.kinds[k], teaser: KIND_INFO[k] ? firstS(KIND_INFO[k].what[lang]) : '', body: null }));
    const hubs = topic ? <TodayHub items={parts} open={topic} onOpen={k => { setTopic(k); scrollTop(); }} lang={lang} back={trL('Haritana dön', 'Back to your chart')} /> : !twoCol ? <>
      <Segmented items={[{ key: 'parts', label: trL('Bölümler', 'Chapters') }, { key: 'kinds', label: trL('Diğer haritalar', 'Other charts') }]} value={hubTab} onChange={v => setHubTab(v as 'parts' | 'kinds')} />
      {hubTab === 'parts'
        ? <TodayHub items={parts} open={null} onOpen={k => { setTopic(k); scrollTop(); }} lang={lang} heading="" />
        : <TodayHub items={kindItems} open={null} onOpen={k => k && openKind(k as Kind)} lang={lang} heading="" />}
    </> : <>
      <TodayHub items={parts} open={null} onOpen={k => { setTopic(k); scrollTop(); }} lang={lang} cols={wide ? 3 : 2} heading={trL('Haritanın bölümleri', 'Your chart, chapter by chapter')} />
      <View style={{ height: 22 }} />
      <TodayHub items={kindItems} open={null} onOpen={k => k && openKind(k as Kind)} lang={lang} cols={wide ? 3 : 2} heading={trL('Diğer haritalar', 'Other charts')} />
    </>;
    const wheelSize = twoCol ? 440 : Math.min(inner(wide ? 1180 : 760), 520);
    const head = <>
      <H1>{profile.name || s.tabs.chart}</H1>
      <ChartPills chart={chart} place={profile.place} gmt={gmt} onEdit={() => navTo('settings')} />
      <ShareToggle label={lang === 'tr' ? 'Büyük üçlü kartın' : 'Your Big Three card'} build={buildBig} filename={`buyuk-uclu-${safeName(profile.name)}.png`} lang={lang} />
    </>;
    const hero = topic ? null : <>
      <View style={{ alignItems: 'center', marginVertical: 12 }}><Wheel chart={chart} outer={null} size={wheelSize} asteroids={showAsteroids} /></View>
      <CoreEnergies chart={chart} lang={lang} />
    </>;
    return twoCol ? (
      <View>
        {head}
        <View style={{ flexDirection: 'row', gap: 44, alignItems: 'flex-start', marginTop: 8 }}>
          <View style={{ width: 440 }}>{topic ? <><Wheel chart={chart} outer={null} size={440} asteroids={showAsteroids} /><View style={{ height: 12 }} /><CoreEnergies chart={chart} lang={lang} /></> : hero}</View>
          <View style={{ flex: 1, minWidth: 0, maxWidth: 700 }}>{hubs}</View>
        </View>
      </View>
    ) : <View>{head}{hero}<View style={{ height: 16 }} />{hubs}</View>;
  }

  return (
    <View>
      <H1>{profile.name || s.tabs.chart}</H1>
      <ChartPills chart={chart} place={profile.place} gmt={(() => { const m = tzOffsetMinutes(chart.input.tz, chart.utc); const h = m / 60; return `GMT${h >= 0 ? '+' : ''}${Number.isInteger(h) ? h : h.toFixed(1)}`; })()} onEdit={() => navTo('settings')} />
      <Sub style={{ marginTop: 6 }}>{profile.place}, {chart.input.timeKnown ? `${String(chart.input.hour).padStart(2, '0')}:${String(chart.input.minute).padStart(2, '0')}` : '—'}. {s.hsNames[chart.houseSystemUsed]}, {chart.zodiac === 'sidereal' ? t.sidereal : t.tropical}{chart.isDayChart !== null ? `, ${(chart.isDayChart ? s.dayChart : s.nightChart).toLocaleLowerCase(lang)}` : ''}.</Sub>
      {chart.houseSystemUsed !== chart.houseSystem ? <Sub style={{ color: C.rose }}>{s.polarNote}</Sub> : null}
      <ShareToggle label={lang === 'tr' ? 'Büyük üçlü kartın' : 'Your Big Three card'} build={buildBig} filename={`buyuk-uclu-${safeName(profile.name)}.png`} lang={lang} />

      <Pressable onPress={() => openKind('natal')} accessibilityRole="button" hitSlop={10} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: 14, paddingVertical: 6, paddingRight: 12 }, pressed && { opacity: 0.6 }]}>
        <Text style={{ fontSize: 24, color: C.rose, marginRight: 6, marginTop: -2 }}>‹</Text>
        <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: C.rose }}>{lang === 'tr' ? 'Doğum haritan' : 'Your birth chart'}</Text>
      </Pressable>
      <Text accessibilityRole="header" style={{ fontFamily: F.sans, fontSize: 26, color: C.ink, marginTop: 4 }}>{t.kinds[kind]}</Text>

      <KindAbout key={kind} kind={kind} lang={lang} />

      {kind === 'timeline' ? <FutureScreen embedded />
        : kind === 'cartography' ? <Cartography natal={chart} t={t} lang={lang} />
        : kind === 'finder' ? <Finder natal={chart} t={t} lang={lang} tz={tz} />
        : kind === 'rectify' ? <Rectify />
        : kind === 'primary' ? <PrimaryList natal={chart} lang={lang} />
        : (() => {
          const wheelSize = twoCol ? 460 : Math.min(inner(wide ? 1180 : 760), 520);
          const left = (
            <View>
              {DATED.includes(kind) ? <DateBar date={date} onChange={setDate} t={t} lang={lang} tzOffsetMin={tzOffsetMinutes(tz, date)} /> : null}
              {kind === 'transit' || kind === 'progressed' ? <ActiveWindows ch={chart} date={date} tech={kind === 'transit' ? 'transit' : 'progression'} lang={lang} onOpen={() => setKind('timeline')} /> : null}
              {(kind === 'solarReturn' || kind === 'lunarReturn') && other ? <Sub style={{ marginBottom: 6 }}>{t.returnAt}: {fmtLocal(other.utc, tz)}, {loc?.label}</Sub> : null}
              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <Wheel chart={wheelChart} outer={outer} cross={cross} size={wheelSize} asteroids={showAsteroids} />
                {outer ? (kind === 'draconic'
                  ? <Text style={[st.sub, { marginTop: 8 }]}><Text style={{ color: C.second }}>● {t.outerLegend}: {t.kinds.natal}</Text>   {lang === 'tr' ? 'İç halka: drakonik harita' : 'Inner ring: draconic chart'}</Text>
                  : <Text style={[st.sub, { marginTop: 8 }]}><Text style={{ color: C.second }}>● {t.outerLegend}: {t.kinds[kind as ChartKind]}</Text>   {t.innerLegend}</Text>) : null}
              </View>
              {(kind as Kind) === 'natal' ? <><CoreEnergies chart={chart} lang={lang} /><Stelliums chart={chart} lang={lang} /><ElementBalance chart={chart} lang={lang} /></> : null}
            </View>
          );
          const right = (
            <View>
              <Segmented items={[{ key: 'readings', label: t.views.readings }, { key: 'tables', label: t.views.tables }]} value={view} onChange={v => setView(v as any)} />
              {view === 'tables' ? (
<>
                  <Tables chart={shown ?? chart} t={t} lang={lang} natal={(kind as Kind) === 'natal'} asteroids={showAsteroids} />
                  {(kind as Kind) === 'natal' ? (
                    <View style={{ marginTop: 32 }}>
                      <Text accessibilityRole="header" style={{ fontFamily: serif, fontSize: 28, lineHeight: 34, color: C.ink, marginBottom: 6 }}>{lang === 'tr' ? 'Karakterin, yerleşim yerleşim' : 'Your character, placement by placement'}</Text>
                      <CharacterBook chart={chart} lang={lang} />
                    </View>
                  ) : null}
                </>
              ) : (kind as Kind) === 'natal' ? (
                <NatalReading chart={chart} s={s} t={t} lang={lang} asteroids={showAsteroids} />
              ) : kind === 'draconic' && other ? (
                <DraconicReading natal={chart} dr={other} lang={lang} />
              ) : other ? (
                <KindReading kind={kind as ChartKind} natal={chart} other={other} s={s} t={t} lang={lang} />
              ) : null}
            </View>
          );
          return twoCol ? (
            <View style={{ flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
              <View style={{ width: 460, ...((kind as Kind) === 'natal' ? {} : { position: 'sticky' as any, top: 0 }) }}>{left}</View>
              <View style={{ flex: 1, maxWidth: 660 }}>{right}</View>
            </View>
          ) : <>{left}{right}</>;
        })()}
    </View>
  );
}


function KindAbout({ kind, lang }: { kind: string; lang: 'tr' | 'en' }) {
  const info = KIND_INFO[kind];
  const [open, setOpen] = useState(false);
  if (!info) return null;
  const tr = lang === 'tr';
  return (
    <View style={{ marginTop: 14, marginBottom: 6, borderLeftWidth: 3, borderLeftColor: C.gold, backgroundColor: C.card, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(o => !o)} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontFamily: serif, fontSize: 17, color: C.ink }}>{tr ? 'Bu harita ne işe yarar?' : 'What is this chart for?'}</Text>
        <Text style={{ fontSize: 13, color: C.rose, fontWeight: '600' }}>{open ? (tr ? 'Gizle' : 'Hide') : (tr ? 'Göster' : 'Show')}</Text>
      </Pressable>
      {open ? <>
        <Text style={[st.p, { marginTop: 6 }]}>{info.what[lang]}</Text>
        <Text style={[st.p, { marginTop: 8 }]}><Text style={{ fontWeight: '700' }}>{tr ? 'Ne zaman bakmalı: ' : 'When to use it: '}</Text>{info.when[lang]}</Text>
        <Text style={[st.p, { marginTop: 6, color: C.sub, fontStyle: 'italic' }]}>{tr ? 'Cevap verdiği soru: ' : 'Answers: '}“{info.ask[lang]}”</Text>
      </> : null}
    </View>
  );
}
