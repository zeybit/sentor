// Yaşayan gökyüzü: nebula, titreyen yıldızlar, kayan yıldız ve yavaşça dönen burç çarkı.
// Web'de saf CSS animasyonu (GPU'da, JS'siz); yerelde sabit SVG yıldızlar. "Hareketi azalt" tercihine uyar.
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { C, themeMode } from '../theme';

const web = Platform.OS === 'web';
const GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + '\uFE0E');

// Sabit rastgelelik: her açılışta aynı gökyüzü
function rng(seed: number) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
function shadows(n: number, seed: number, col: string, spread = 2000) {
  const r = rng(seed); const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(`${Math.round(r() * spread)}px ${Math.round(r() * spread)}px ${col}`);
  return out.join(',');
}

const CSS = (dark: boolean) => `
@keyframes czTw{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes czTw2{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
@keyframes czDrift{from{transform:translateY(0)}to{transform:translateY(-2000px)}}
@keyframes czNeb{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(-4%,3%,0) scale(1.12)}}
@keyframes czSpin{to{transform:rotate(360deg)}}
@keyframes czSpinR{to{transform:rotate(-360deg)}}
@keyframes czShoot{0%{transform:translate3d(0,0,0) rotate(-24deg);opacity:0}1%{opacity:1}7%{transform:translate3d(-62vw,28vw,0) rotate(-24deg);opacity:0}100%{opacity:0;transform:translate3d(-62vw,28vw,0) rotate(-24deg)}}
@keyframes czUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes czFade{from{opacity:0}to{opacity:1}}
@keyframes czPulse{0%,100%{box-shadow:0 0 0 0 ${C.glow}}50%{box-shadow:0 0 22px 2px ${C.glow}}}
@keyframes czFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes czShine{from{background-position:200% 0}to{background-position:-200% 0}}
.cz-root{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;background:${dark ? 'linear-gradient(180deg,#0A0820 0%,#0E0A2C 55%,#120B30 100%)' : 'linear-gradient(180deg,#F4F0FC 0%,#EFE9FA 60%,#F6EEF6 100%)'}}
.cz-neb{position:absolute;inset:-15%;animation:czNeb 46s ease-in-out infinite alternate;background:${dark
    ? 'radial-gradient(42% 36% at 18% 12%,rgba(124,84,255,.30),transparent 70%),radial-gradient(34% 30% at 86% 26%,rgba(255,110,190,.16),transparent 70%),radial-gradient(46% 40% at 55% 105%,rgba(50,140,255,.20),transparent 70%),radial-gradient(28% 24% at 70% 70%,rgba(246,200,110,.07),transparent 70%)'
    : 'radial-gradient(42% 36% at 18% 12%,rgba(140,110,255,.20),transparent 70%),radial-gradient(34% 30% at 86% 26%,rgba(255,150,200,.16),transparent 70%),radial-gradient(46% 40% at 55% 105%,rgba(120,180,255,.16),transparent 70%)'}}
.cz-layer{position:absolute;left:0;top:0;width:1px;height:1px;border-radius:50%;background:transparent}
.cz-l1{animation:czDrift 420s linear infinite}
.cz-l2{animation:czDrift 260s linear infinite}
.cz-l3{animation:czDrift 170s linear infinite,czTw 6s ease-in-out infinite}
.cz-star{position:absolute;border-radius:50%;background:${dark ? '#fff' : '#8C74E0'};animation:czTw2 var(--d,5s) ease-in-out infinite;animation-delay:var(--dl,0s)}
.cz-star::before,.cz-star::after{content:"";position:absolute;left:50%;top:50%;background:${dark ? 'rgba(255,255,255,.55)' : 'rgba(140,116,224,.45)'};transform:translate(-50%,-50%)}
.cz-star::before{width:1px;height:600%}.cz-star::after{height:1px;width:600%}
.cz-shoot{position:absolute;top:8%;right:-10%;width:160px;height:2px;border-radius:2px;background:linear-gradient(90deg,${dark ? 'rgba(255,255,255,.95)' : 'rgba(120,90,220,.8)'},transparent);animation:czShoot 14s ease-out infinite;filter:drop-shadow(0 0 6px ${dark ? '#fff' : '#9b84f0'})}
.cz-shoot.b{top:30%;right:-20%;animation-duration:23s;animation-delay:9s;width:110px}
.cz-wheel{position:absolute;width:980px;height:980px;right:-330px;top:-300px;opacity:${dark ? '.10' : '.10'};animation:czSpin 360s linear infinite;color:${dark ? '#CDBEFF' : '#5A3EC8'}}
.cz-wheel2{position:absolute;width:640px;height:640px;left:-260px;bottom:-280px;opacity:${dark ? '.07' : '.07'};animation:czSpinR 300s linear infinite;color:${dark ? '#F6C86E' : '#A4640C'}}
.cz-enter{animation:czUp .55s cubic-bezier(.2,.7,.2,1) both}
.cz-enter>div>div:nth-child(1){animation:czUp .6s .04s both}
.cz-enter>div>div:nth-child(2){animation:czUp .6s .09s both}
.cz-enter>div>div:nth-child(3){animation:czUp .6s .14s both}
.cz-enter>div>div:nth-child(4){animation:czUp .6s .19s both}
.cz-enter>div>div:nth-child(5){animation:czUp .6s .24s both}
.cz-enter>div>div:nth-child(6){animation:czUp .6s .29s both}
.cz-enter>div>div:nth-child(n+7){animation:czUp .6s .33s both}
@keyframes czWheelIn{from{opacity:0;transform:rotate(-40deg) scale(.86)}to{opacity:1;transform:none}}
[data-reveal="wheel"]{animation:czWheelIn 1.2s cubic-bezier(.2,.7,.2,1) both}
[data-enter]{animation:czUp .5s cubic-bezier(.2,.7,.2,1) both}
[data-spin="slow"]{animation:czSpin 40s linear infinite}
[data-spin="med"]{animation:czSpin 14s linear infinite}
[data-float]{animation:czFloat 5s ease-in-out infinite}
[data-pulse]{animation:czPulse 3.2s ease-in-out infinite}
[data-lift]{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
[data-lift]:hover{transform:translateY(-2px);box-shadow:0 10px 30px -12px ${C.glow};border-color:${dark ? 'rgba(185,166,255,.38)' : 'rgba(90,62,200,.28)'}}
[data-glow="on"]{filter:drop-shadow(0 0 6px ${C.glow})}
[data-shine]{background-image:linear-gradient(100deg,${C.gold} 20%,${dark ? '#FFF1C9' : '#E2A84A'} 40%,${C.gold} 60%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:czShine 7s linear infinite}
[data-btn="primary"]{background-image:linear-gradient(120deg,${dark ? '#8F72FF' : '#6A4BE0'},${dark ? '#C9A6FF' : '#8E5BD8'} 55%,${dark ? '#F6C86E' : '#C98A2A'});box-shadow:0 8px 28px -10px ${C.glow};transition:transform .2s ease,box-shadow .2s ease}
[data-btn="primary"]:hover{transform:translateY(-1px);box-shadow:0 12px 34px -10px ${C.glow}}
[data-btn="primary"] div{color:${dark ? '#0A0820' : '#fff'}!important}
html,body{background:${C.bg}}
::selection{background:${C.roseSoft}}
*{scrollbar-width:thin;scrollbar-color:${dark ? 'rgba(185,166,255,.25) transparent' : 'rgba(90,62,200,.25) transparent'}}
@media (prefers-reduced-motion: reduce){.cz-root *,.cz-enter,.cz-enter *,[data-spin],[data-float],[data-pulse],[data-shine]{animation:none!important}}
`;

function Wheel({ cls }: { cls: string }) {
  const R = 470, r2 = 380, r3 = 300;
  return React.createElement('svg', { className: cls, viewBox: '-490 -490 980 980', 'aria-hidden': true },
    React.createElement('g', { fill: 'none', stroke: 'currentColor', strokeWidth: 1.2 },
      React.createElement('circle', { r: R }), React.createElement('circle', { r: r2 }), React.createElement('circle', { r: r3, strokeDasharray: '2 8' }),
      ...Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; return React.createElement('line', { key: 'l' + i, x1: Math.cos(a) * r2, y1: Math.sin(a) * r2, x2: Math.cos(a) * R, y2: Math.sin(a) * R }); }),
      ...Array.from({ length: 72 }, (_, i) => { const a = (i * 5 * Math.PI) / 180; return React.createElement('line', { key: 't' + i, x1: Math.cos(a) * (R - 10), y1: Math.sin(a) * (R - 10), x2: Math.cos(a) * R, y2: Math.sin(a) * R }); })),
    ...GLYPHS.map((g, i) => { const a = ((i * 30 + 15) * Math.PI) / 180; return React.createElement('text', { key: g, x: Math.cos(a) * 425, y: Math.sin(a) * 425 + 14, fontSize: 40, textAnchor: 'middle', fill: 'currentColor', style: { fontFamily: 'serif' } }, g); }));
}

function WebCosmos({ dark }: { dark: boolean }) {
  const sky = useMemo(() => {
    const dot = dark ? ['rgba(255,255,255,.55)', 'rgba(220,210,255,.75)', '#fff'] : ['rgba(120,96,210,.28)', 'rgba(120,96,210,.38)', 'rgba(120,96,210,.55)'];
    const r = rng(7);
    const bright = Array.from({ length: dark ? 16 : 9 }, () => ({ x: r() * 100, y: r() * 100, s: 1.5 + r() * 1.6, d: 3 + r() * 5, dl: -r() * 6 }));
    return {
      l1: shadows(dark ? 520 : 220, 3, dot[0]), l2: shadows(dark ? 200 : 90, 11, dot[1]), l3: shadows(dark ? 80 : 40, 29, dot[2]), bright,
    };
  }, [dark]);
  const layer = (cls: string, sh: string, size: number) => [
    React.createElement('div', { key: cls + 'a', className: `cz-layer ${cls}`, style: { boxShadow: sh, width: size, height: size } }),
    React.createElement('div', { key: cls + 'b', className: `cz-layer ${cls}`, style: { boxShadow: sh, width: size, height: size, top: 2000 } }),
  ];
  return React.createElement(React.Fragment, null,
    React.createElement('style', { dangerouslySetInnerHTML: { __html: CSS(dark) } }),
    React.createElement('div', { className: 'cz-root', 'aria-hidden': true },
      React.createElement('div', { className: 'cz-neb' }),
      React.createElement(Wheel, { cls: 'cz-wheel' }),
      React.createElement(Wheel, { cls: 'cz-wheel2' }),
      ...layer('cz-l1', sky.l1, 1), ...layer('cz-l2', sky.l2, 1.5), ...layer('cz-l3', sky.l3, 2),
      ...sky.bright.map((b, i) => React.createElement('div', { key: 's' + i, className: 'cz-star', style: { left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, ['--d' as any]: `${b.d}s`, ['--dl' as any]: `${b.dl}s` } })),
      dark ? React.createElement('div', { className: 'cz-shoot' }) : null,
      dark ? React.createElement('div', { className: 'cz-shoot b' }) : null,
    ));
}

function NativeCosmos({ dark }: { dark: boolean }) {
  const stars = useMemo(() => { const r = rng(5); return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 100, s: 0.4 + r() * 1.3, o: 0.3 + r() * 0.7 })); }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="n1" cx="20%" cy="10%" r="60%"><Stop offset="0" stopColor={dark ? '#7C54FF' : '#8C6EFF'} stopOpacity={dark ? 0.3 : 0.18} /><Stop offset="1" stopColor={C.bg} stopOpacity={0} /></RadialGradient>
          <RadialGradient id="n2" cx="90%" cy="100%" r="60%"><Stop offset="0" stopColor="#328CFF" stopOpacity={0.18} /><Stop offset="1" stopColor={C.bg} stopOpacity={0} /></RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={C.bg} />
        <Rect width="100%" height="100%" fill="url(#n1)" />
        <Rect width="100%" height="100%" fill="url(#n2)" />
        {stars.map((s, i) => <Circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill={dark ? '#fff' : '#8C74E0'} opacity={s.o * (dark ? 1 : 0.5)} />)}
      </Svg>
    </View>
  );
}

/** Uygulamanın arkasındaki gökyüzü. Tema değişince yeniden çizilir (Themed anahtarı sayesinde). */
export default function Cosmos() {
  const dark = themeMode === 'dark';
  return web ? <WebCosmos dark={dark} /> : <NativeCosmos dark={dark} />;
}

/** Ekran değişince içeriği yukarı süzülerek getirir (web). */
export function Enter({ children, k }: { children: React.ReactNode; k: string }) {
  if (!web) return <>{children}</>;
  return React.createElement('div', { key: k, className: 'cz-enter' }, children);
}
