// Telefonda Bugün: kaydırmasız tam ekran sahne.
// Ortada kendini çizen burç takımyıldızı, altında burç adı ve kaydırılabilir burç şeridi;
// alttaki tutamaçtan yukarı çekilen panelde Günün / Burcun / Gezegenler / Daha fazla.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import type { Chart } from '../engine/astro';
import { SIGNS, SIGN_GLYPHS } from '../content/base';
import type { TransitHit } from '../content/forecast';
import { CONSTELLATIONS } from './constellations';
import { DayCard, Energy, Kicker, PlanetGuide, SIGN_DATES, SignReadingPanel } from './Cosmic';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
type Tab = 'day' | 'sign' | 'planets' | 'more';
const web = Platform.OS === 'web';
const h = React.createElement;
const tx = (lang: Lang, tr: string, en: string) => (lang === 'tr' ? tr : en);

const CSS = `
@keyframes tmDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes tmPop{from{opacity:0;transform:scale(.1)}to{opacity:1;transform:scale(1)}}
@keyframes tmTw{0%,100%{opacity:1}50%{opacity:.55}}
.tm-con line{stroke-dasharray:1;stroke-dashoffset:1;animation:tmDraw 1.5s cubic-bezier(.6,.1,.2,1) .35s forwards}
.tm-con .st{transform-box:fill-box;transform-origin:center;opacity:0;animation:tmPop .6s cubic-bezier(.2,1.4,.4,1) forwards}
.tm-con .st .tw{animation:tmTw var(--t,4s) ease-in-out infinite}
.tm-con{filter:drop-shadow(0 0 6px rgba(160,170,255,.55))}
@media (max-width:700px){.rs-con{display:none}}`;

/** 4 köşeli parıltı yıldızı */
const sparkle = (x: number, y: number, s: number) => {
  const k = s * 0.22;
  return `M${x},${y - s} L${x + k},${y - k} L${x + s},${y} L${x + k},${y + k} L${x},${y + s} L${x - k},${y + k} L${x - s},${y} L${x - k},${y - k} Z`;
};

function HeroConstellation({ sign, size }: { sign: number; size: number }) {
  const con = CONSTELLATIONS[sign];
  if (web) {
    return h('svg', { key: sign, className: 'tm-con', width: size, height: size, viewBox: '-12 -12 124 124', role: 'img', 'aria-label': con.name.tr },
      h('style', null, CSS),
      ...con.edges.map(([a, b], i) => h('line', { key: 'l' + i, x1: con.stars[a][0], y1: con.stars[a][1], x2: con.stars[b][0], y2: con.stars[b][1], pathLength: 1, stroke: 'rgba(225,228,255,.6)', strokeWidth: 0.45, style: { animationDelay: `${0.35 + i * 0.12}s` } })),
      ...con.stars.map(([x, y, m], i) => h('g', { key: 's' + i, className: 'st', style: { animationDelay: `${i * 0.08}s` } },
        h('g', { className: 'tw', style: { ['--t' as any]: `${3 + ((i * 7) % 5)}s` } },
          h('circle', { cx: x, cy: y, r: (4 - m) * 1.9, fill: 'rgba(170,178,255,.16)' }),
          h('path', { d: sparkle(x, y, (4 - m) * 1.55), fill: '#FFFFFF' }),
          h('circle', { cx: x, cy: y, r: (4 - m) * 0.45, fill: '#FFFFFF' })))));
  }
  return (
    <Svg width={size} height={size} viewBox="-12 -12 124 124">
      {con.edges.map(([a, b], i) => <Line key={i} x1={con.stars[a][0]} y1={con.stars[a][1]} x2={con.stars[b][0]} y2={con.stars[b][1]} stroke="rgba(225,228,255,0.6)" strokeWidth={0.45} />)}
      {con.stars.map(([x, y, m], i) => <React.Fragment key={i}>
        <Circle cx={x} cy={y} r={(4 - m) * 1.9} fill="rgba(170,178,255,0.16)" />
        <Path d={sparkle(x, y, (4 - m) * 1.55)} fill="#FFFFFF" />
      </React.Fragment>)}
    </Svg>
  );
}

function SignStrip({ sel, onPick, lang }: { sel: number; onPick: (i: number) => void; lang: Lang }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {[-2, -1, 0, 1, 2].map(k => {
        const i = (sel + k + 12) % 12, on = k === 0;
        return (
          <Pressable key={k} onPress={() => onPick(i)} accessibilityRole="button" accessibilityLabel={SIGNS[i][lang]} accessibilityState={{ selected: on }}
            style={{ width: on ? 74 : 58, height: 64, alignItems: 'center', justifyContent: 'center', opacity: on ? 1 : Math.abs(k) === 1 ? 0.5 : 0.22 }}>
            {on ? <Svg width={58} height={58} style={{ position: 'absolute' }}><Circle cx={29} cy={29} r={26} stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeDasharray="2 4" fill="rgba(255,255,255,0.05)" /></Svg> : null}
            <Text style={{ fontSize: on ? 26 : 20, color: C.ink }}>{SIGN_GLYPHS[i]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TodayMobile({ chart, name, lang, energies, rings, hits, details }: {
  chart: Chart; name: string; lang: Lang; energies: Energy[]; rings: { label: string; value: number; color: string }[]; hits: TransitHit[]; details: React.ReactNode;
}) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [sel, setSel] = useState(chart.positions.sun.sign);
  const [tab, setTab] = useState<Tab>('day');
  const [open, setOpen] = useState(false);
  const PEEK = 150, TOP = 150, INFO = 138;
  const sheetH = Math.max(0, box.h - TOP);
  const closedY = Math.max(0, sheetH - PEEK);
  const y = useRef(new Animated.Value(2000)).current;
  const start = useRef(0);
  const closedRef = useRef(closedY); closedRef.current = closedY;

  useEffect(() => { if (box.h) y.setValue(open ? 0 : closedY); }, [box.h]); // eslint-disable-line
  const snap = (o: boolean) => {
    setOpen(o);
    Animated.spring(y, { toValue: o ? 0 : closedRef.current, useNativeDriver: false, bounciness: 3, speed: 14 }).start();
  };
  const sheetPan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx),
    onPanResponderGrant: () => { y.stopAnimation(v => { start.current = v; }); },
    onPanResponderMove: (_, g) => y.setValue(Math.max(0, Math.min(closedRef.current, start.current + g.dy))),
    onPanResponderRelease: (_, g) => { const v = start.current + g.dy; snap(g.vy < -0.3 || (g.vy < 0.3 && v < closedRef.current / 2)); },
  }), []); // eslint-disable-line
  const heroPan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 14 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
    onPanResponderRelease: (_, g) => { if (g.dx < -40) setSel(s => (s + 1) % 12); else if (g.dx > 40) setSel(s => (s + 11) % 12); },
  }), []);
  const p = y.interpolate({ inputRange: [0, Math.max(1, closedY)], outputRange: [1, 0], extrapolate: 'clamp' });
  const infoTop = p.interpolate({ inputRange: [0, 1], outputRange: [Math.max(0, box.h - PEEK - INFO - 6), Math.max(0, TOP - INFO)] });
  const fade = p.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0], extrapolate: 'clamp' });
  const conSize = Math.max(120, Math.min(box.w - 24, box.h - PEEK - INFO - 70));
  const now = new Date();
  const dfmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', weekday: 'long' });
  const TABS: { k: Tab; label: string }[] = [
    { k: 'day', label: tx(lang, 'Günün', 'Your day') }, { k: 'sign', label: tx(lang, 'Burcun', 'Sign') },
    { k: 'planets', label: tx(lang, 'Gezegenler', 'Planets') }, { k: 'more', label: tx(lang, 'Daha fazla', 'More') },
  ];

  return (
    <View style={[{ flex: 1, marginHorizontal: -16, overflow: 'hidden' }, web ? ({ userSelect: 'none' } as any) : null]} onLayout={e => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {box.h ? <>
        {/* sahne */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: PEEK }} {...heroPan.panHandlers}>
          <Animated.View style={{ opacity: fade, paddingHorizontal: 20, paddingTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontFamily: F.sans, fontSize: 22, color: C.ink }}>{name || tx(lang, 'Bugün', 'Today')}</Text>
              <Kicker style={{ marginTop: 3 }}>{dfmt.format(now)}</Kicker>
            </View>
            {sel !== chart.positions.sun.sign ? (
              <Pressable onPress={() => setSel(chart.positions.sun.sign)} accessibilityRole="button" style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 }}>
                <Text style={{ fontFamily: F.mono, fontSize: 11, color: C.ink, letterSpacing: 0.8 }}>{tx(lang, 'BENİM BURCUM', 'MY SIGN')}</Text>
              </Pressable>
            ) : null}
          </Animated.View>
          <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 64, alignItems: 'center', opacity: fade }}>
            <HeroConstellation sign={sel} size={conSize} />
          </Animated.View>
        </View>
        {/* burç adı ve şerit: panel açılınca yukarı çıkar */}
        <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: infoTop, height: INFO, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }} {...heroPan.panHandlers}>
          <Text style={{ fontFamily: F.sansMed, fontSize: 21, color: C.ink }}>{SIGNS[sel][lang]}</Text>
          <Kicker style={{ marginTop: 3, marginBottom: 6 }}>{SIGN_DATES[sel][lang]}</Kicker>
          <SignStrip sel={sel} onPick={i => { setSel(i); if (open) setTab('sign'); }} lang={lang} />
        </Animated.View>
        {/* panel */}
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: sheetH, transform: [{ translateY: y }], backgroundColor: 'rgba(12,13,40,0.94)', borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.08)' },
          web ? ({ backdropFilter: 'blur(24px)', boxShadow: '0 -20px 60px -20px rgba(0,0,0,.7)' } as any) : null]}>
          <View {...sheetPan.panHandlers}>
            <Pressable onPress={() => snap(!open)} accessibilityRole="button" accessibilityLabel={open ? tx(lang, 'Paneli kapat', 'Close panel') : tx(lang, 'Paneli aç', 'Open panel')} accessibilityState={{ expanded: open }}
              style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
              <View style={{ width: 42, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)' }} />
            </Pressable>
            <Pressable onPress={() => !open && snap(true)} style={{ paddingHorizontal: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {rings.map((r, k) => (
                  <View key={k} style={{ alignItems: 'center', flex: 1 }} accessibilityLabel={`${r.label}: %${r.value}`}>
                    <Svg width={46} height={46}>
                      <Circle cx={23} cy={23} r={19} stroke="rgba(255,255,255,0.10)" strokeWidth={3} fill="none" />
                      <Circle cx={23} cy={23} r={19} stroke={r.color} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 19 * r.value) / 100} 999`} transform="rotate(-90 23 23)" />
                    </Svg>
                    <Text style={{ position: 'absolute', top: 15, fontFamily: F.mono, fontSize: 11, color: C.ink }}>{r.value}</Text>
                    <Kicker style={{ fontSize: 9.5, marginTop: 4 }}>{r.label}</Kicker>
                  </View>
                ))}
              </View>
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 18, paddingHorizontal: 20, marginTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
              {TABS.map(t => {
                const on = t.k === tab;
                return (
                  <Pressable key={t.k} onPress={() => { setTab(t.k); if (!open) snap(true); }} accessibilityRole="tab" accessibilityState={{ selected: on }}
                    style={{ paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: on ? C.violet : 'transparent', marginBottom: -1 }}>
                    <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: on ? C.ink : C.sub }}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <ScrollView style={[{ flex: 1 }, web ? ({ userSelect: 'text' } as any) : null]} contentContainerStyle={{ padding: 16, paddingBottom: 90 }} scrollEnabled={open}>
            {tab === 'day' ? <DayCard lang={lang} energies={energies} />
              : tab === 'sign' ? <SignReadingPanel sel={sel} lang={lang} />
              : tab === 'planets' ? <PlanetGuide hits={hits} lang={lang} />
              : <View>{details}</View>}
          </ScrollView>
        </Animated.View>
      </> : null}
    </View>
  );
}
