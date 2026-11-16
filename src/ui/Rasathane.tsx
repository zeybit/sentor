// Sentor'un rasathanesi: arkada yavaşça dönen pirinç bir usturlap (kişinin doğum gezegenleri burç halkasında işaretli),
// kişinin Güneş burcunun takımyıldızı (kendini çizer, yıldızları titrer) ve ara sıra gökyüzünü kesen kentaurun oku.
// Web'de saf CSS animasyonu; yerelde sabit SVG. "Hareketi azalt" tercihine uyar.
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Rect } from 'react-native-svg';
import type { Chart } from '../engine/astro';
import { C, themeMode } from '../theme';
import { CONSTELLATIONS } from './constellations';

const web = Platform.OS === 'web';
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + '︎');
const PGLYPH: Record<string, string> = { sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂', jupiter: '♃', saturn: '♄' };
const h = React.createElement;

function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function shadows(n: number, seed: number, col: string, spread = 2200) {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(`${Math.round(r() * spread)}px ${Math.round(r() * spread)}px ${col}`);
  return out.join(',');
}

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .35 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const CSS = (dark: boolean) => {
  const brass = dark ? '#DBB668' : '#8A6216';
  const ink = dark ? 'rgba(219,182,104,' : 'rgba(110,82,34,';
  return `
@keyframes rsSpin{to{transform:rotate(360deg)}}
@keyframes rsSpinR{to{transform:rotate(-360deg)}}
@keyframes rsDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes rsStar{0%,100%{opacity:1}50%{opacity:.45}}
@keyframes rsPop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
@keyframes rsTw{0%,100%{opacity:.35}50%{opacity:.9}}
@keyframes rsFlyX{0%{transform:translateX(-18vw)}18%,100%{transform:translateX(118vw)}}
@keyframes rsFlyY{0%{transform:translateY(0) rotate(-16deg)}9%{transform:translateY(-16vh) rotate(0deg)}18%,100%{transform:translateY(6vh) rotate(14deg)}}
@keyframes rsFlyO{0%{opacity:0}1%,16%{opacity:1}18%,100%{opacity:0}}
@keyframes rsUp{from{opacity:0;transform:translateY(10px);filter:blur(3px)}to{opacity:1;transform:none;filter:none}}
@keyframes rsWheelIn{from{opacity:0;transform:rotate(-60deg) scale(.9)}to{opacity:1;transform:none}}
@keyframes rsPulse{0%,100%{box-shadow:0 0 0 0 ${C.glow}}50%{box-shadow:0 0 26px 0 ${C.glow}}}
@keyframes rsFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes rsShine{from{background-position:200% 0}to{background-position:-200% 0}}
.rs-root{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;background:${dark
    ? 'radial-gradient(120% 90% at 70% 0%,#0D1A1C 0%,#080C0E 45%,#05070A 100%)'
    : 'radial-gradient(120% 90% at 70% 0%,#F3EBD8 0%,#ECE3CE 55%,#E2D6BC 100%)'}}
.rs-grain{position:absolute;inset:0;background-image:${GRAIN};opacity:${dark ? '.07' : '.22'};mix-blend-mode:${dark ? 'screen' : 'multiply'}}
.rs-vig{position:absolute;inset:0;background:radial-gradient(130% 100% at 50% 40%,transparent 55%,${dark ? 'rgba(0,0,0,.55)' : 'rgba(90,60,20,.18)'} 100%)}
.rs-dots{position:absolute;left:0;top:0;width:1px;height:1px;border-radius:50%}
.rs-d1{animation:rsTw 7s ease-in-out infinite}.rs-d2{animation:rsTw 11s ease-in-out infinite reverse}
.rs-astro{position:absolute;width:1100px;height:1100px;left:-430px;bottom:-470px;color:${brass};opacity:${dark ? '.26' : '.32'}}
.rs-limb{position:absolute;inset:0}
.rs-rete{position:absolute;inset:0;animation:rsSpin 480s linear infinite}
.rs-rule{position:absolute;inset:0;animation:rsSpinR 260s linear infinite}
.rs-con{position:absolute;right:3vw;top:5vh;width:min(36vw,440px);height:min(40vw,500px);color:${brass};opacity:${dark ? '.55' : '.6'}}
@media (max-width:700px){.rs-con{opacity:.28;width:70vw;height:80vw;right:-4vw;top:12vh}.rs-con text{display:none}}
.rs-con line{stroke-dasharray:1;stroke-dashoffset:1;animation:rsDraw 1.6s cubic-bezier(.6,.1,.2,1) forwards}
.rs-con .st{transform-box:fill-box;transform-origin:center;opacity:0;animation:rsPop .6s ease-out forwards,rsStar var(--t,5s) ease-in-out infinite}
.rs-con text{font-family:"IBM Plex Mono",monospace;letter-spacing:.18em;opacity:0;animation:rsUp 1s 1.6s ease forwards}
.rs-arrowWrap{position:absolute;inset:0;opacity:0;animation:rsFlyO 19s linear 3s infinite}
.rs-arrowX{position:absolute;left:0;top:40vh;animation:rsFlyX 19s linear 3s infinite}
.rs-arrowY{animation:rsFlyY 19s ease-in-out 3s infinite}
.rs-arrow{width:170px;height:22px;filter:drop-shadow(0 0 6px ${dark ? 'rgba(232,140,90,.85)' : 'rgba(138,98,22,.5)'})}
.rs-enter{animation:rsUp .6s cubic-bezier(.2,.7,.2,1) both}
.rs-enter>div>div:nth-child(1){animation:rsUp .6s .05s both}
.rs-enter>div>div:nth-child(2){animation:rsUp .6s .1s both}
.rs-enter>div>div:nth-child(3){animation:rsUp .6s .15s both}
.rs-enter>div>div:nth-child(4){animation:rsUp .6s .2s both}
.rs-enter>div>div:nth-child(5){animation:rsUp .6s .25s both}
.rs-enter>div>div:nth-child(n+6){animation:rsUp .6s .3s both}
[data-enter]{animation:rsUp .5s cubic-bezier(.2,.7,.2,1) both}
[data-reveal="wheel"]{animation:rsWheelIn 1.3s cubic-bezier(.2,.7,.2,1) both}
[data-spin="slow"]{animation:rsSpin 60s linear infinite}
[data-float]{animation:rsFloat 6s ease-in-out infinite}
[data-pulse]{animation:rsPulse 3.4s ease-in-out infinite}
[data-lift]{position:relative;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
[data-lift]:hover{transform:translateY(-2px);box-shadow:0 14px 34px -18px ${C.glow};border-color:${ink}.45)}
[data-lift]::before,[data-lift]::after{content:"";position:absolute;width:12px;height:12px;pointer-events:none;border-color:${brass};opacity:.8}
[data-lift]::before{left:-1px;top:-1px;border-left:1.5px solid;border-top:1.5px solid}
[data-lift]::after{right:-1px;bottom:-1px;border-right:1.5px solid;border-bottom:1.5px solid}
[data-glow="on"]{filter:drop-shadow(0 0 5px ${C.glow})}
[data-shine]{background-image:linear-gradient(100deg,${brass} 20%,${dark ? '#FFF0C8' : '#C99A3E'} 40%,${brass} 60%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:rsShine 8s linear infinite}
[data-btn="primary"]{background-image:linear-gradient(180deg,${dark ? '#EBCB85' : '#A8781F'},${dark ? '#B98F45' : '#7A5612'});box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 10px 26px -14px ${C.glow};transition:transform .2s ease,box-shadow .2s ease}
[data-btn="primary"]:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.35),0 14px 30px -12px ${C.glow}}
[data-btn="primary"] div{color:${dark ? '#140F06' : '#FBF5E6'}!important;letter-spacing:.06em}
html,body{background:${C.bg}}
::selection{background:${C.goldSoft}}
*{scrollbar-width:thin;scrollbar-color:${ink}.35) transparent}
@media (prefers-reduced-motion: reduce){.rs-root *,.rs-enter,.rs-enter *,[data-spin],[data-float],[data-pulse],[data-shine],[data-enter],[data-reveal]{animation:none!important}.rs-con line{stroke-dashoffset:0}.rs-con .st,.rs-con text{opacity:1}.rs-arrowWrap{display:none}}
`;
};

/** Usturlap: sabit "limb" (derece taksimatı), dönen "rete" (burç halkası + doğum gezegenleri), ters dönen alidade cetveli */
function Astrolabe({ chart }: { chart: Chart | null }) {
  const R = 520;
  const deg = (d: number) => (d * Math.PI) / 180;
  const at = (d: number, r: number) => [Math.cos(deg(d)) * r, Math.sin(deg(d)) * r];
  const limb = h('svg', { className: 'rs-limb', viewBox: '-550 -550 1100 1100' },
    h('g', { fill: 'none', stroke: 'currentColor' },
      h('circle', { r: R, strokeWidth: 1.4 }), h('circle', { r: R - 34, strokeWidth: 0.8 }), h('circle', { r: R - 6, strokeWidth: 0.5 }),
      ...Array.from({ length: 360 }, (_, i) => { const L = i % 30 === 0 ? 26 : i % 10 === 0 ? 18 : i % 5 === 0 ? 12 : 6; const [x1, y1] = at(i, R - 34); const [x2, y2] = at(i, R - 34 + L); return h('line', { key: i, x1, y1, x2, y2, strokeWidth: i % 10 === 0 ? 1 : 0.5 }); }),
      // almukantarlar: ufka paralel dışmerkezli daireler
      ...[0, 1, 2, 3, 4, 5, 6].map(i => h('circle', { key: 'a' + i, cx: 0, cy: -40 - i * 22, r: 120 + i * 48, strokeWidth: 0.5, strokeDasharray: i % 2 ? '3 6' : undefined })),
      h('line', { x1: -R + 34, y1: 0, x2: R - 34, y2: 0, strokeWidth: 0.6 }), h('line', { x1: 0, y1: -R + 34, x2: 0, y2: R - 34, strokeWidth: 0.6 })),
    ...Array.from({ length: 12 }, (_, i) => { const [x, y] = at(i * 30 - 90, R + 16); return h('text', { key: 'n' + i, x, y: y + 5, fontSize: 14, textAnchor: 'middle', fill: 'currentColor', style: { fontFamily: '"IBM Plex Mono",monospace' } }, String(i * 30)); }));
  const rR = 330;
  const planets = chart ? (Object.keys(PGLYPH) as (keyof typeof PGLYPH)[]).map(id => ({ id, lon: (chart.positions as any)[id]?.lon as number })).filter(p => typeof p.lon === 'number') : [];
  const rete = h('svg', { className: 'rs-rete', viewBox: '-550 -550 1100 1100' },
    h('g', { fill: 'none', stroke: 'currentColor' },
      h('circle', { r: rR, strokeWidth: 1.2 }), h('circle', { r: rR - 46, strokeWidth: 0.8 }), h('circle', { cx: 0, cy: 90, r: 250, strokeWidth: 0.7, strokeDasharray: '1 5' }),
      ...Array.from({ length: 12 }, (_, i) => { const [x1, y1] = at(-i * 30, rR - 46); const [x2, y2] = at(-i * 30, rR); return h('line', { key: i, x1, y1, x2, y2, strokeWidth: 0.8 }); }),
      // rete filigranı: yıldız işaretçileri
      ...Array.from({ length: 9 }, (_, i) => { const a = i * 40 + 12; const [x1, y1] = at(a, 60); const [x2, y2] = at(a, rR - 60); const [cx, cy] = at(a + 18, (rR - 60) * 0.6); return h('path', { key: 'f' + i, d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, strokeWidth: 0.7 }); })),
    ...GLYPHS.map((g, i) => { const [x, y] = at(-(i * 30 + 15), rR - 23); return h('text', { key: g, x, y: y + 7, fontSize: 20, textAnchor: 'middle', fill: 'currentColor', style: { fontFamily: 'serif' } }, g); }),
    ...planets.map(p => { const [x, y] = at(-p.lon, rR + 22); const [x2, y2] = at(-p.lon, rR + 4); const [gx, gy] = at(-p.lon, rR + 46);
      return h('g', { key: p.id }, h('line', { x1: x, y1: y, x2, y2, stroke: 'currentColor', strokeWidth: 1.2 }), h('circle', { cx: x, cy: y, r: 3.5, fill: 'currentColor' }),
        h('text', { x: gx, y: gy + 7, fontSize: 20, textAnchor: 'middle', fill: 'currentColor', style: { fontFamily: 'serif' } }, PGLYPH[p.id] + '︎')); }));
  const rule = h('svg', { className: 'rs-rule', viewBox: '-550 -550 1100 1100' },
    h('g', { fill: 'none', stroke: 'currentColor', strokeWidth: 0.9 },
      h('path', { d: `M${-R + 40} -5 L-30 -5 L0 -14 L30 -5 L${R - 40} -5 L${R - 40} 5 L30 5 L0 14 L-30 5 L${-R + 40} 5 Z` }),
      h('circle', { r: 16 }), h('circle', { r: 5, fill: 'currentColor' })));
  return h('div', { className: 'rs-astro' }, limb, rete, rule);
}

function ConstellationArt({ idx, lang }: { idx: number; lang: 'tr' | 'en' }) {
  const k = CONSTELLATIONS[idx];
  const r = rng(idx + 3);
  return h('svg', { className: 'rs-con', viewBox: '-6 -8 112 132' },
    h('g', { stroke: 'currentColor', strokeWidth: 0.35, strokeLinecap: 'round', opacity: 0.75 },
      ...k.edges.map(([a, b], i) => h('line', { key: i, x1: k.stars[a][0], y1: k.stars[a][1], x2: k.stars[b][0], y2: k.stars[b][1], pathLength: 1, style: { animationDelay: `${0.25 + i * 0.12}s` } }))),
    ...k.stars.map(([x, y, m], i) => h('g', { key: 's' + i },
      h('circle', { className: 'st', cx: x, cy: y, r: (4 - m) * 0.9, fill: 'currentColor', opacity: 0.16, style: { animationDelay: `${i * 0.1}s, ${1 + r() * 3}s`, ['--t' as any]: `${4 + r() * 4}s` } }),
      h('circle', { className: 'st', cx: x, cy: y, r: (4 - m) * 0.34, fill: themeMode === 'dark' ? '#FFF6E0' : 'currentColor', style: { animationDelay: `${i * 0.1}s, ${1 + r() * 3}s`, ['--t' as any]: `${4 + r() * 4}s` } }))),
    h('text', { x: 50, y: 112, fontSize: 3.6, textAnchor: 'middle', fill: 'currentColor' }, `${k.name.lat} · ${lang === 'tr' ? k.name.tr.toLocaleUpperCase('tr') : k.name.en.toUpperCase()}`),
    h('text', { x: 50, y: 118, fontSize: 2.6, textAnchor: 'middle', fill: 'currentColor', opacity: 0.7 }, lang === 'tr' ? 'GÜNEŞ BURCUNUN TAKIMYILDIZI' : 'YOUR SUN SIGN’S CONSTELLATION'));
}

/** Kentaurun oku: pirinç gövde, kor ucu, tüyleri */
function Arrow({ dark }: { dark: boolean }) {
  const shaft = dark ? '#E8D3A0' : '#6E5222', tip = dark ? '#F08A5D' : '#A8442C';
  const svg = h('svg', { className: 'rs-arrow', viewBox: '0 0 170 22' },
    h('defs', null, h('linearGradient', { id: 'rsTrail', x1: 0, x2: 1 }, h('stop', { offset: 0, stopColor: shaft, stopOpacity: 0 }), h('stop', { offset: 1, stopColor: shaft, stopOpacity: 0.9 }))),
    h('rect', { x: 0, y: 10.3, width: 60, height: 1.4, fill: 'url(#rsTrail)' }),
    h('line', { x1: 56, y1: 11, x2: 150, y2: 11, stroke: shaft, strokeWidth: 1.8 }),
    h('path', { d: 'M150 5 L168 11 L150 17 L154 11 Z', fill: tip }),
    h('path', { d: 'M56 11 L66 3 L74 3 L64 11 L74 19 L66 19 Z', fill: tip, opacity: 0.85 }));
  return h('div', { className: 'rs-arrowWrap' }, h('div', { className: 'rs-arrowX' }, h('div', { className: 'rs-arrowY' }, svg)));
}

function WebSky({ chart, lang }: { chart: Chart | null; lang: 'tr' | 'en' }) {
  const dark = themeMode === 'dark';
  const sun = chart ? chart.positions.sun.sign : 8; // haritası yokken Sentor'un kendi takımyıldızı: Yay
  const dots = useMemo(() => ({
    a: shadows(dark ? 260 : 120, 5, dark ? 'rgba(239,232,216,.55)' : 'rgba(110,82,34,.28)'),
    b: shadows(dark ? 90 : 40, 17, dark ? 'rgba(255,240,205,.9)' : 'rgba(110,82,34,.45)'),
  }), [dark]);
  return h(React.Fragment, null,
    h('style', { dangerouslySetInnerHTML: { __html: CSS(dark) } }),
    h('div', { className: 'rs-root', 'aria-hidden': true },
      h('div', { className: 'rs-dots rs-d1', style: { boxShadow: dots.a } }),
      h('div', { className: 'rs-dots rs-d2', style: { boxShadow: dots.b, width: 1.6, height: 1.6 } }),
      h(Astrolabe, { chart }),
      h(ConstellationArt, { key: sun, idx: sun, lang }),
      h(Arrow, { dark }),
      h('div', { className: 'rs-vig' }),
      h('div', { className: 'rs-grain' })));
}

function NativeSky() {
  const stars = useMemo(() => { const r = rng(5); return Array.from({ length: 70 }, () => ({ x: r() * 100, y: r() * 100, s: 0.4 + r() * 1.1, o: 0.3 + r() * 0.6 })); }, []);
  const dark = themeMode === 'dark';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Rect width="100%" height="100%" fill={C.bg} />
        <Circle cx="0%" cy="100%" r="62%" stroke={C.gold} strokeOpacity={0.18} fill="none" />
        <Circle cx="0%" cy="100%" r="48%" stroke={C.gold} strokeOpacity={0.12} fill="none" />
        <Line x1="0%" y1="100%" x2="70%" y2="30%" stroke={C.gold} strokeOpacity={0.12} />
        {stars.map((s, i) => <Circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill={dark ? '#FFF6E0' : '#6E5222'} opacity={s.o * (dark ? 1 : 0.4)} />)}
      </Svg>
    </View>
  );
}

export default function Rasathane({ chart, lang = 'tr' }: { chart: Chart | null; lang?: 'tr' | 'en' }) {
  return web ? <WebSky chart={chart} lang={lang} /> : <NativeSky />;
}

/** Ekran değişince içerik bulanıktan netleşerek, sırayla gelir (web). */
export function Enter({ children, k }: { children: React.ReactNode; k: string }) {
  if (!web) return <>{children}</>;
  return h('div', { key: k, className: 'rs-enter' }, children);
}
