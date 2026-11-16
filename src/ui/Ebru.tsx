// Kişiye özel, yaşayan ebru. Gerçek ebru matematiği (Jaffer'in damla ve biz dönüşümleri) ile WebGL'de çizilir:
// her yeni damla öncekileri halka halka dışa iter, biz çizgisi boyayı tarar. Damlalar kişinin doğum haritasından
// gelir: gezegenin boylamı ve evi damlanın yerini, burcunun elementi boyasını belirler. İki kişinin ebrusu aynı olmaz.
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C, PIGMENTS_DARK, PIGMENTS_LIGHT, themeMode, pigmentWeights } from '../theme';
import type { Chart, BodyId } from '../engine/astro';

const web = Platform.OS === 'web';
const MAX = 48;
const ORDER: BodyId[] = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter', 'mars', 'venus', 'mercury', 'moon', 'sun'];
const SIZE: Partial<Record<BodyId, number>> = { sun: 0.15, moon: 0.13, mercury: 0.085, venus: 0.1, mars: 0.09, jupiter: 0.115, saturn: 0.105, uranus: 0.075, neptune: 0.075, pluto: 0.065 };

type Op = { k: 0 | 1; x: number; y: number; r: number; c: number; t: number };

/** Haritadan damlalar: dıştaki gezegenler önce, Güneş en son (en üstte) */
/** Harita yokken (giriş ekranı) örnek bir taşlı ebru */
function demoDrops(aspect: number): Op[] {
  const ops: Op[] = []; let seed = 11; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 9; i++) {
    const x = (r() - 0.5) * Math.max(1, aspect) * 0.95, y = (r() - 0.5) * 0.9, R = 0.07 + r() * 0.08, e = i % 4;
    [[1, e * 2], [0.55, 8], [0.3, ((e + 2) % 4) * 2 + 1]].forEach(([k, c], j) => ops.push({ k: 0, x, y, r: R * k, c, t: 0.3 + i * 0.25 + j * 0.15 }));
  }
  [-0.2, 0.15].forEach((y, j) => ops.push({ k: 1, x: 0, y, r: 0.06, c: j, t: 3.2 + j * 0.5 }));
  return ops;
}
export function chartDrops(ch: Chart | null, aspect: number): Op[] {
  if (!ch) return demoDrops(aspect);
  const ops: Op[] = [];
  let t = 0.3;
  ORDER.forEach((id, i) => {
    const p = ch.positions[id];
    const a = (p.lon * Math.PI) / 180;
    const h = p.house || (Math.floor(p.lon / 30) + 1);
    const d = 0.08 + (h / 12) * 0.34;
    const el = p.sign % 4, el2 = (el + 1 + (i % 3)) % 4;
    const x = Math.cos(a) * d * Math.max(1, aspect) * 0.9, y = Math.sin(a) * d * 0.9, R = SIZE[id] ?? 0.08;
    // taşlı ebru: her gezegen iç içe halkalar bırakır (boya, kitre, ikinci boya)
    const rings = id === 'sun' || id === 'moon' ? [[1, el * 2], [0.62, 8], [0.42, el2 * 2 + 1], [0.2, el * 2 + 1]] : [[1, el * 2 + (i % 2)], [0.55, 8], [0.32, el2 * 2]];
    rings.forEach(([k, c], j) => ops.push({ k: 0, x, y, r: R * (k as number), c: c as number, t: t + j * 0.16 }));
    t += 0.28;
  });
  // bizle tarama: halkalar tüy ve lale kıvrımlarına dönüşür
  [-0.28, -0.05, 0.18, 0.38].forEach((y, j) => ops.push({ k: 1, x: 0, y, r: 0.045 + (j % 2) * 0.02, c: j % 2, t: t + 0.4 + j * 0.5 }));
  return ops;
}

const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS = `precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec3 uPal[9];uniform vec4 uOp[${MAX}];uniform vec3 uOpX[${MAX}];uniform int uN;uniform float uVivid;
float h1(float n){return fract(sin(n)*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);float a=h1(dot(i,vec2(1.,57.))),b=h1(dot(i+vec2(1,0),vec2(1.,57.))),c=h1(dot(i+vec2(0,1),vec2(1.,57.))),d=h1(dot(i+vec2(1,1),vec2(1.,57.)));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}
vec3 pal(float i){vec3 c=uPal[8];for(int k=0;k<9;k++){if(abs(float(k)-i)<.5)c=uPal[k];}return c;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);p.y=-p.y;
  float t=uTime;
  p+=.010*vec2(sin(p.y*5.+t*.23),cos(p.x*4.+t*.19));
  vec3 col=vec3(-1.);float rim=0.;
  for(int i=${MAX - 1};i>=0;i--){
    if(i>=uN) continue;
    vec4 o=uOp[i];vec3 x=uOpX[i];float age=t-x.y; if(age<0.) continue;
    if(x.x<.5){
      float r=o.z*(1.-exp(-age*2.6));
      vec2 d=p-o.xy;float L=length(d);
      if(L<r){col=pal(o.w);rim=smoothstep(r-.010,r,L);break;}
      p=o.xy+d*sqrt(max(0.,1.-r*r/(L*L)));
    }else{
      float pr=smoothstep(0.,1.4,age);
      p.x-=o.z*pr*exp(-abs(p.y-o.y)/.07)*sign(o.w-.5+.0001);
    }
  }
  if(col.x<0.){
    vec2 q=p*1.8;q+=.28*vec2(fbm(q*1.4+t*.01),fbm(q*1.4+3.7-t*.01));
    float v=q.y*9.+.9*abs(fract(q.x*3.)-.5)*2.+.25*sin(q.x*23.);
    float b=floor(v);float f=fract(v);
    float pick=h1(b*7.13);
    col=pick<.55?uPal[8]:pal(floor(h1(b*3.1)*8.));
    col=mix(col,uPal[8],.18);
    rim=smoothstep(.9,1.,f)*.6;
  }
  col=mix(col,mix(uPal[8],vec3(1.),.55),rim*.55);
  float g=fbm(gl_FragCoord.xy*.35)*.06-.03;
  col+=g;
  col=mix(uPal[8],col,uVivid);
  gl_FragColor=vec4(col,1.);
}`;

const hex = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

function css(dark: boolean) {
  const paper = C.bg;
  return `
@keyframes ebUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes ebBreath{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes ebRing{from{transform:scale(.2);opacity:.9}to{transform:scale(1.6);opacity:0}}
@keyframes ebTine{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes ebTineOut{0%,70%{opacity:1}100%{opacity:0}}
@keyframes ebWheelIn{from{opacity:0;transform:rotate(-30deg) scale(.9)}to{opacity:1;transform:none}}
@keyframes ebFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.eb-canvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none}
.eb-veil{position:fixed;inset:0;z-index:0;pointer-events:none;background:linear-gradient(180deg,${hexA(paper, dark ? 0.35 : 0.22)} 0,${hexA(paper, dark ? 0.86 : 0.80)} 300px,${hexA(paper, dark ? 0.9 : 0.86)} 100%)}
@media (min-width:960px){.eb-veil.rail{background:linear-gradient(90deg,${hexA(paper, dark ? 0.55 : 0.4)} 0,${hexA(paper, dark ? 0.55 : 0.4)} 248px,${hexA(paper, dark ? 0.88 : 0.84)} 248px,${hexA(paper, dark ? 0.9 : 0.86)} 100%)}}
.eb-enter{animation:ebUp .5s cubic-bezier(.2,.7,.2,1) both}
.eb-enter>div>div:nth-child(1){animation:ebUp .55s .03s both}
.eb-enter>div>div:nth-child(2){animation:ebUp .55s .08s both}
.eb-enter>div>div:nth-child(3){animation:ebUp .55s .13s both}
.eb-enter>div>div:nth-child(4){animation:ebUp .55s .18s both}
.eb-enter>div>div:nth-child(5){animation:ebUp .55s .23s both}
.eb-enter>div>div:nth-child(n+6){animation:ebUp .55s .27s both}
.eb-tine{position:absolute;left:0;right:0;top:-6px;height:14px;pointer-events:none;overflow:visible;animation:ebTineOut 1.6s ease both}
.eb-tine path{stroke-dasharray:1;animation:ebTine 1.1s cubic-bezier(.6,.1,.2,1) both}
.eb-ring{position:fixed;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;border:2px solid ${C.rose};pointer-events:none;z-index:5;animation:ebRing .9s ease-out both}
[data-enter]{animation:ebUp .5s cubic-bezier(.2,.7,.2,1) both}
[data-reveal="wheel"]{animation:ebWheelIn 1.1s cubic-bezier(.2,.7,.2,1) both}
[data-breath]{animation:ebBreath 6s ease-in-out infinite}
[data-float]{animation:ebFloat 5s ease-in-out infinite}
[data-lift]{transition:transform .25s ease,box-shadow .25s ease}
[data-lift]:hover{transform:translateY(-2px);box-shadow:0 14px 30px -18px ${C.glow}}
[data-btn="primary"]{box-shadow:0 6px 18px -10px ${C.glow};transition:transform .2s ease,filter .2s ease}
[data-btn="primary"]:hover{transform:translateY(-1px);filter:brightness(1.08)}
[data-glow="on"]{filter:drop-shadow(0 0 4px ${hexA(C.rose.startsWith('#') ? C.rose : '#2D4A8C', 0.45)})}
html,body{background:${paper}}
::selection{background:${C.roseSoft}}
*{scrollbar-width:thin;scrollbar-color:${dark ? 'rgba(242,233,218,.22) transparent' : 'rgba(42,33,25,.22) transparent'}}
@media (prefers-reduced-motion: reduce){.eb-enter,.eb-enter *,[data-enter],[data-breath],[data-float],[data-reveal],.eb-tine,.eb-ring{animation:none!important}}
`;
}
function hexA(h: string, a: number) {
  if (!h.startsWith('#')) return h;
  const [r, g, b] = hex(h);
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;
}

// Biz çizgisi ve dokunma damlaları için dışarıdan erişim
let pushOp: ((o: Omit<Op, 't'>, delay?: number) => void) | null = null;
export function combStroke() { pushOp?.({ k: 1, x: 0, y: (Math.random() - 0.5) * 0.7, r: 0.05 + Math.random() * 0.04, c: Math.random() < 0.5 ? 0 : 1 }); }

function WebEbru({ chart, dark }: { chart: Chart | null; dark: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const pal = useMemo(() => {
    const P = dark ? PIGMENTS_DARK : PIGMENTS_LIGHT;
    return [...P.flatMap(p => [hex(p[0]), hex(p[1])]), hex(C.bg)];
  }, [dark, chart]);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false }) as WebGLRenderingContext | null;
    if (!gl) return;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s)); return s; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { cv.style.display = 'none'; return; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);
    const uRes = U('uRes'), uTime = U('uTime'), uPal = U('uPal'), uOp = U('uOp'), uOpX = U('uOpX'), uN = U('uN'), uVivid = U('uVivid');
    gl.uniform3fv(uPal, new Float32Array(pal.flat()));
    gl.uniform1f(uVivid, dark ? 0.85 : 0.92);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    const scale = Math.min(1.25, (window.devicePixelRatio || 1) * 0.85);
    let aspect = 1;
    const resize = () => { cv.width = Math.round(window.innerWidth * scale); cv.height = Math.round(window.innerHeight * scale); gl.viewport(0, 0, cv.width, cv.height); aspect = window.innerWidth / window.innerHeight; };
    resize();
    const base = chartDrops(chart, aspect).map(o => (reduce ? { ...o, t: -10 } : o));
    let user: Op[] = [];
    const upload = () => {
      const ops = [...base, ...user].slice(0, MAX);
      const a = new Float32Array(MAX * 4), b = new Float32Array(MAX * 3);
      ops.forEach((o, i) => { a.set([o.x, o.y, o.r, o.c], i * 4); b.set([o.k, o.t, 0], i * 3); });
      gl.uniform4fv(uOp, a); gl.uniform3fv(uOpX, b); gl.uniform1i(uN, ops.length);
    };
    upload();
    pushOp = (o, delay = 0) => { user.push({ ...o, t: now() + delay }); if (base.length + user.length > MAX) user = user.slice(-(MAX - base.length)); upload(); };
    let raf = 0, last = 0, alive = true;
    const frame = (ts: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || ts - last < 33) return;
      last = ts;
      gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uTime, now());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    if (reduce) { gl.uniform2f(uRes, cv.width, cv.height); gl.uniform1f(uTime, 100); gl.drawArrays(gl.TRIANGLES, 0, 3); }
    else raf = requestAnimationFrame(frame);
    const onResize = () => { resize(); if (reduce) { gl.uniform2f(uRes, cv.width, cv.height); gl.drawArrays(gl.TRIANGLES, 0, 3); } };
    const SKIP = 'button,input,textarea,select,a,[role="button"],[role="tab"],[role="link"],[role="radio"],[role="menuitem"],[role="switch"],svg';
    let colorI = 0;
    const onDown = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest?.(SKIP)) return;
      const m = Math.min(window.innerWidth, window.innerHeight);
      const x = (e.clientX - window.innerWidth / 2) / m, y = (e.clientY - window.innerHeight / 2) / m;
      const w = pigmentWeights; const order = [0, 1, 2, 3].sort((p, q) => w[q] - w[p]);
      const el2 = order[colorI++ % 3];
      pushOp?.({ k: 0, x, y, r: 0.06 + Math.random() * 0.05, c: el2 * 2 + (colorI % 2) });
      const ring = document.createElement('div'); ring.className = 'eb-ring'; ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
      document.body.appendChild(ring); setTimeout(() => ring.remove(), 950);
    };
    window.addEventListener('resize', onResize);
    if (!reduce) window.addEventListener('pointerdown', onDown);
    return () => { alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); window.removeEventListener('pointerdown', onDown); pushOp = null; };
  }, [chart, dark, pal]);
  return React.createElement(React.Fragment, null,
    React.createElement('style', { dangerouslySetInnerHTML: { __html: css(dark) } }),
    React.createElement('canvas', { ref, className: 'eb-canvas', 'aria-hidden': true }),
    React.createElement('div', { className: chart ? 'eb-veil rail' : 'eb-veil', 'aria-hidden': true }));
}

function NativeEbru({ chart }: { chart: Chart | null }) {
  const P = themeMode === 'dark' ? PIGMENTS_DARK : PIGMENTS_LIGHT;
  const drops = chartDrops(chart, 0.5);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="-0.5 -0.9 1 1.8" preserveAspectRatio="xMidYMid slice">
        {drops.map((d, i) => [1, 0.66, 0.36].map((k, j) => <Circle key={`${i}-${j}`} cx={d.x} cy={d.y} r={d.r * k} fill={j === 1 ? C.bg : P[Math.floor(d.c / 2)][d.c % 2]} opacity={0.35} />))}
      </Svg>
    </View>
  );
}

/** Uygulamanın arkasındaki ebru. */
export default function Ebru({ chart }: { chart: Chart | null }) {
  const dark = themeMode === 'dark';
  return web ? <WebEbru chart={chart} dark={dark} /> : <NativeEbru chart={chart} />;
}

/** Ekran değişince: biz çizgisi suya dokunur, içerik süzülerek gelir. */
export function Enter({ children, k }: { children: React.ReactNode; k: string }) {
  useEffect(() => { combStroke(); }, [k]);
  if (!web) return <>{children}</>;
  return React.createElement('div', { key: k, className: 'eb-enter', style: { position: 'relative' } },
    React.createElement('svg', { className: 'eb-tine', viewBox: '0 0 100 4', preserveAspectRatio: 'none', 'aria-hidden': true },
      React.createElement('path', { d: 'M0 2 C 12 0.4, 22 3.6, 34 2 S 56 0.4, 68 2 S 90 3.6, 100 2', pathLength: 1, fill: 'none', stroke: C.rose, strokeWidth: 0.35, strokeLinecap: 'round', vectorEffect: 'non-scaling-stroke', style: { strokeWidth: 2 } })),
    children);
}
