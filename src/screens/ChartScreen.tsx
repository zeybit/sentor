import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useStore } from '../store';
import { chartAt } from '../engine/astro';
import {
  ChartKind, crossAspects, transitChart, progressedChart, solarArcChart, solarReturnChart, lunarReturnChart, antisciaChart,
} from '../engine/techniques';
import { T2S } from '../i18n2';
import Wheel from '../ui/Wheel';
import DateBar from '../ui/DateBar';
import Tables from '../ui/Tables';
import { NatalReading, KindReading } from '../ui/Readings';
import { Cartography, Finder } from '../ui/Tools';
import { Chips, H1, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C } from '../theme';
import { fmtLocal, tzOffsetMinutes } from '../util';

type Kind = ChartKind | 'cartography' | 'finder';
const DATED: Kind[] = ['transit', 'progressed', 'solarArc', 'solarReturn', 'lunarReturn', 'now'];
const BIWHEEL: Kind[] = ['transit', 'progressed', 'solarArc'];

export default function ChartScreen() {
  const { chart, s, lang, profile, opts, showAsteroids, location } = useStore();
  const t = T2S[lang];
  const { inner, twoCol, wide } = useLayout();
  const [kind, setKind] = useState<Kind>('natal');
  const [view, setView] = useState<'readings' | 'tables'>('readings');
  const [date, setDate] = useState(() => new Date());

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
      case 'now': return chartAt(date, loc.lat, loc.lon, opts);
      default: return null;
    }
  }, [chart, kind, date, opts, loc?.lat, loc?.lon]);
  const cross = useMemo(() => (other && chart && BIWHEEL.includes(kind) ? crossAspects(other, chart, kind === 'transit' ? 3 : 1) : undefined), [other, chart, kind]);
  if (!chart || !profile) return null;

  const tz = loc?.tz ?? profile.birth.tz;
  const wheelChart = kind === 'natal' || BIWHEEL.includes(kind) || kind === 'antiscia' ? chart : other!;
  const outer = BIWHEEL.includes(kind) ? other : kind === 'antiscia' ? other : null;
  const shown = kind === 'natal' || kind === 'antiscia' ? chart : other;
  const kinds: Kind[] = ['natal', 'transit', 'progressed', 'solarArc', 'solarReturn', 'lunarReturn', 'antiscia', 'now', 'cartography', 'finder'];

  return (
    <View>
      <H1>{profile.name || s.tabs.chart}</H1>
      <Sub>{profile.place}, {chart.input.timeKnown ? `${String(chart.input.hour).padStart(2, '0')}:${String(chart.input.minute).padStart(2, '0')}` : '—'}. {s.hsNames[chart.houseSystemUsed]}, {chart.zodiac === 'sidereal' ? t.sidereal : t.tropical}{chart.isDayChart !== null ? `, ${(chart.isDayChart ? s.dayChart : s.nightChart).toLocaleLowerCase(lang)}` : ''}.</Sub>
      {chart.houseSystemUsed !== chart.houseSystem ? <Sub style={{ color: C.rose }}>{s.polarNote}</Sub> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
        <Chips items={kinds.map(k => ({ key: k, label: t.kinds[k] }))} value={kind} onChange={k => setKind(k as Kind)} />
      </ScrollView>

      {kind === 'cartography' ? <Cartography natal={chart} t={t} lang={lang} />
        : kind === 'finder' ? <Finder natal={chart} t={t} lang={lang} tz={tz} />
        : (() => {
          const wheelSize = twoCol ? 460 : Math.min(inner(wide ? 1180 : 760), 520);
          const left = (
            <View>
              {DATED.includes(kind) ? <DateBar date={date} onChange={setDate} t={t} lang={lang} tzOffsetMin={tzOffsetMinutes(tz, date)} /> : null}
              {(kind === 'solarReturn' || kind === 'lunarReturn') && other ? <Sub style={{ marginBottom: 6 }}>{t.returnAt}: {fmtLocal(other.utc, tz)}, {loc?.label}</Sub> : null}
              <View style={{ alignItems: 'center', marginVertical: 12 }}>
                <Wheel chart={wheelChart} outer={outer} cross={cross} size={wheelSize} asteroids={showAsteroids} />
                {outer ? <Text style={[st.sub, { marginTop: 8 }]}><Text style={{ color: C.second }}>● {t.outerLegend}: {t.kinds[kind as ChartKind]}</Text>   {t.innerLegend}</Text> : null}
              </View>
            </View>
          );
          const right = (
            <View>
              <Segmented items={[{ key: 'readings', label: t.views.readings }, { key: 'tables', label: t.views.tables }]} value={view} onChange={v => setView(v as any)} />
              {view === 'tables' ? (
                <Tables chart={shown ?? chart} t={t} lang={lang} natal={kind === 'natal'} asteroids={showAsteroids} />
              ) : kind === 'natal' ? (
                <NatalReading chart={chart} s={s} t={t} lang={lang} asteroids={showAsteroids} />
              ) : other ? (
                <KindReading kind={kind as ChartKind} natal={chart} other={other} s={s} t={t} lang={lang} />
              ) : null}
            </View>
          );
          return twoCol ? (
            <View style={{ flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
              <View style={{ width: 460, position: 'sticky' as any, top: 0 }}>{left}</View>
              <View style={{ flex: 1, maxWidth: 660 }}>{right}</View>
            </View>
          ) : <>{left}{right}</>;
        })()}
    </View>
  );
}
