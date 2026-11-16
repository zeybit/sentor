// Paylaşım kartlarının SVG'leri (1080×1920). Hepsi aynı çerçeveyi kullanır.
import type { Chart, BodyId } from '../engine/astro';
import { BODIES, SIGNS, SIGN_GLYPHS, SIGN_KEYWORDS, ASPECT_INFO, Lang } from './base';
import { ARCANA } from './arcana';
import { TAROT_IMG } from './tarotImages';
import { skyEvents } from '../engine/timeline';

const W = 1080, H = 1920;
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const SERIF = 'Georgia,serif', SANS = 'Helvetica,Arial,sans-serif';
const EL = ['#F28A5B', '#9BC26B', '#6CC0F0', '#A99BF5'];
export function wrap(t: string, n: number): string[] {
  const out: string[] = []; let cur = '';
  for (const w of t.split(' ')) { if ((cur + ' ' + w).trim().length > n) { if (cur) out.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
const T = (x: number, y: number, size: number, fill: string, text: string, o: { anchor?: string; font?: string; weight?: string; italic?: boolean; spacing?: number } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${o.anchor ?? 'middle'}" font-family="${o.font ?? SANS}"${o.weight ? ` font-weight="${o.weight}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}>${esc(text)}</text>`;

export function frame(kicker: string, title: string, body: string, sub?: string) {
  const stars = Array.from({ length: 70 }).map((_, i) => `<circle cx="${(i * 197) % W}" cy="${((i * 331) % 1800) + 40}" r="${i % 4 === 0 ? 2.6 : 1.4}" fill="#fff" fill-opacity="${i % 3 ? 0.35 : 0.6}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06080A"/><stop offset="0.6" stop-color="#0C1517"/><stop offset="1" stop-color="#14262A"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>${stars}
${T(540, 220, 40, '#93A9BB', kicker, { spacing: 6 })}
${T(540, 330, title.length > 22 ? 70 : 88, '#E3ECF3', title, { font: SERIF })}
${sub ? T(540, 410, 46, '#F2B84B', sub, { font: SERIF, italic: true }) : ''}
${body}
${T(540, 1840, 34, '#93A9BB', 'Gökyüzü Haritam', { font: SERIF })}
</svg>`;
}

// ---------------- Büyük üçlü ----------------
export function bigThreeSvg(ch: Chart, name: string, lang: Lang) {
  const items: { label: string; sign: number }[] = [
    { label: tx('GÜNEŞ · özün', 'SUN · core', lang), sign: ch.positions.sun.sign },
    { label: tx('AY · duyguların', 'MOON · feelings', lang), sign: ch.positions.moon.sign },
    ...(ch.asc !== null ? [{ label: tx('YÜKSELEN · ilk izlenim', 'RISING · first impression', lang), sign: Math.floor(ch.asc / 30) }] : []),
  ];
  const body = items.map((it, i) => {
    const y = 620 + i * 400, col = EL[it.sign % 4];
    const kw = SIGN_KEYWORDS[it.sign][lang].split(', ').slice(0, 3).join(' · ');
    return `<circle cx="250" cy="${y}" r="120" fill="${col}" fill-opacity="0.18" stroke="${col}" stroke-width="4"/>
${T(250, y + 52, 150, col, SIGN_GLYPHS[it.sign].replace('︎', ''), { font: 'Segoe UI Symbol,DejaVu Sans,sans-serif' })}
${T(420, y - 50, 32, '#93A9BB', it.label, { anchor: 'start', spacing: 3 })}
${T(420, y + 20, 76, '#E3ECF3', SIGNS[it.sign][lang], { anchor: 'start', font: SERIF })}
${T(420, y + 80, 34, col, kw, { anchor: 'start' })}`;
  }).join('');
  return frame(tx('BÜYÜK ÜÇLÜM', 'MY BIG THREE', lang), name || tx('Haritam', 'My chart', lang), body);
}

// ---------------- Kader matrisi açılımı ----------------
const imgIndex = (n: number) => (n === 8 ? 11 : n === 11 ? 8 : n % 22);
export function matrixSvg(m: { A: number; B: number; C: number; D: number; E: number }, name: string, lang: Lang) {
  const cw = 230, chh = Math.round(cw * 1.755);
  const card = (n: number, cx: number, cy: number, cap: string) => `<image x="${cx - cw / 2}" y="${cy - chh / 2}" width="${cw}" height="${chh}" preserveAspectRatio="xMidYMid slice" href="${TAROT_IMG[imgIndex(n)]}" xlink:href="${TAROT_IMG[imgIndex(n)]}"/>
<rect x="${cx - cw / 2}" y="${cy - chh / 2}" width="${cw}" height="${chh}" rx="12" fill="none" stroke="#F2B84B" stroke-width="3"/>
${T(cx, cy + chh / 2 + 42, 32, '#E3ECF3', `${n} ${ARCANA[n].name[lang]}`, { font: SERIF })}
${T(cx, cy + chh / 2 + 80, 26, '#93A9BB', cap)}`;
  const body = [
    card(m.B, 540, 680, tx('Ruhsal yanım', 'My spirit', lang)),
    card(m.A, 250, 1080, tx('Kişiliğim', 'Personality', lang)),
    card(m.E, 540, 1080, tx('Özüm', 'My core', lang)),
    card(m.C, 830, 1080, tx('Yeteneğim', 'My talent', lang)),
    card(m.D, 540, 1480, tx('Görevim', 'My task', lang)),
  ].join('');
  return frame(tx('KADER MATRİSİ AÇILIMIM', 'MY DESTINY MATRIX SPREAD', lang), name || tx('Matrisim', 'My matrix', lang), body);
}

// ---------------- Stil kartı ----------------
export function styleSvg(name: string, aesthetic: string, palette: { hex: string; name: string }[], tip: string, signs: string, lang: Lang) {
  const sw = palette.slice(0, 6).map((p, i) => {
    const col = i % 3, row = Math.floor(i / 3), x = 130 + col * 290, y = 620 + row * 360;
    return `<rect x="${x}" y="${y}" width="240" height="240" rx="28" fill="${p.hex}" stroke="#ffffff" stroke-opacity="0.25" stroke-width="3"/>
${T(x + 120, y + 290, 30, '#E3ECF3', p.name)}`;
  }).join('');
  const lines = wrap(tip, 44).slice(0, 4).map((t, i) => T(540, 1430 + i * 50, 36, '#E3ECF3', t)).join('');
  return frame(tx('STİL KARTIM', 'MY STYLE CARD', lang), aesthetic, `${T(540, 500, 34, '#93A9BB', signs)}${sw}${lines}`, name);
}

// ---------------- Aylık enerji ----------------
export function monthSvg(ch: Chart, name: string, lang: Lang) {
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), 1).getTime(), b = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  const ev = skyEvents(ch).filter(e => e.kind === 'transit' && e.start.getTime() < b && e.end.getTime() > a).sort((x, y) => y.w - x.w).slice(0, 4);
  const month = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(now);
  const PT: Record<string, { tr: string; en: string }> = { asc: { tr: 'Yükselen', en: 'Ascendant' }, mc: { tr: 'Kariyer noktası', en: 'Career point' }, dsc: { tr: 'Partner noktası', en: 'Partner point' }, ic: { tr: 'Yuva noktası', en: 'Home point' } };
  const THEME: Record<string, { tr: string; en: string }> = {
    jupiter: { tr: 'büyüme ve şans', en: 'growth and luck' }, saturn: { tr: 'sabır ve sorumluluk', en: 'patience and duty' }, uranus: { tr: 'sürpriz ve özgürleşme', en: 'surprise and freedom' },
    neptune: { tr: 'hayal ve sezgi', en: 'dreams and intuition' }, pluto: { tr: 'derin dönüşüm', en: 'deep change' }, node: { tr: 'kader gibi karşılaşmalar', en: 'fated meetings' },
  };
  const body = ev.length ? ev.map((e, i) => {
    const y = 620 + i * 280;
    const tName = e.t === 'node' ? tx('Kuzey Düğüm', 'North Node', lang) : BODIES[e.t as BodyId].name[lang];
    const nName = PT[e.n as string]?.[lang] ?? BODIES[e.n as BodyId].name[lang];
    return `<rect x="110" y="${y - 90}" width="860" height="220" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="#F2B84B" stroke-opacity="0.5" stroke-width="2"/>
${T(160, y - 20, 30, '#93A9BB', ASPECT_INFO[e.type!].name[lang].toLocaleUpperCase(lang), { anchor: 'start', spacing: 3 })}
${T(160, y + 40, 52, '#E3ECF3', `${tName} → ${nName}`, { anchor: 'start', font: SERIF })}
${T(160, y + 95, 34, '#F2B84B', THEME[e.t as string]?.[lang] ?? '', { anchor: 'start' })}`;
  }).join('') : T(540, 900, 42, '#E3ECF3', tx('Bu ay sakin ve dengeli bir akış.', 'A calm, steady month.', lang), { font: SERIF });
  return frame(tx('AYLIK ENERJİM', 'MY MONTHLY ENERGY', lang), month, body, name);
}

// ---------------- Grup uyumu ----------------
export function groupSvg(names: string[], score: (i: number, j: number) => number, lang: Lang) {
  const n = names.length, size = Math.min(150, 760 / n), x0 = 540 - (n * size) / 2 + 60, y0 = 620;
  const col = (v: number) => (v >= 75 ? '#4CAF50' : v >= 60 ? '#9BC26B' : v >= 45 ? '#F2B84B' : '#F28A5B');
  let cells = '';
  for (let i = 0; i < n; i++) {
    cells += T(x0 - 20, y0 + i * size + size / 2 + 10, 30, '#E3ECF3', names[i].slice(0, 10), { anchor: 'end' });
    cells += `<text x="${x0 + i * size + size / 2}" y="${y0 - 20}" font-size="28" fill="#E3ECF3" text-anchor="start" font-family="${SANS}" transform="rotate(-45 ${x0 + i * size + size / 2} ${y0 - 20})">${esc(names[i].slice(0, 10))}</text>`;
    for (let j = 0; j < n; j++) {
      const x = x0 + j * size, y = y0 + i * size;
      if (i === j) { cells += `<rect x="${x + 4}" y="${y + 4}" width="${size - 8}" height="${size - 8}" rx="14" fill="#ffffff" fill-opacity="0.05"/>`; continue; }
      const v = score(i, j);
      cells += `<rect x="${x + 4}" y="${y + 4}" width="${size - 8}" height="${size - 8}" rx="14" fill="${col(v)}" fill-opacity="0.85"/>${T(x + size / 2, y + size / 2 + 12, Math.min(40, size / 3), '#0B1A2B', `%${v}`, { weight: '700' })}`;
    }
  }
  return frame(tx('GRUP UYUMUMUZ', 'OUR GROUP HARMONY', lang), tx(`${n} kişi`, `${n} people`, lang), cells);
}

// ---------------- Yıllık hikâye ----------------
export function yearSvg(name: string, age: number, word: string, head: string, months: number[], lang: Lang, startMonth = 0) {
  const mx = Math.max(1, ...months);
  const MN = lang === 'tr' ? ['O', 'Ş', 'M', 'N', 'M', 'H', 'T', 'A', 'E', 'E', 'K', 'A'] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const bars = months.map((v, i) => { const h = 20 + (v / mx) * 300, x = 150 + i * 66; return `<rect x="${x}" y="${1500 - h}" width="44" height="${h}" rx="10" fill="#F2B84B" fill-opacity="${0.35 + (v / mx) * 0.65}"/>${T(x + 22, 1550, 28, '#93A9BB', MN[(startMonth + i) % 12])}`; }).join('');
  const lines = wrap(head, 26).slice(0, 2).map((t, i) => T(540, 900 + i * 76, 62, '#E3ECF3', t, { font: SERIF })).join('');
  return frame(tx('YENİ YAŞIM', 'MY NEW YEAR', lang), name, `${T(540, 640, 220, '#F2B84B', String(age), { font: SERIF })}${T(540, 760, 50, '#93A9BB', tx(`yılın kelimesi: ${word}`, `word of the year: ${word}`, lang), { italic: true, font: SERIF })}${lines}${bars}${T(540, 1620, 30, '#93A9BB', tx('Ay ay yoğunluk', 'Intensity month by month', lang))}`);
}

// ---------------- Ünlü ikizin ----------------
export function twinSvg(name: string, twins: { name: string; score: number; reason: string }[], lang: Lang) {
  const rows = twins.slice(0, 3).map((t, i) => {
    const y = 640 + i * 360;
    return `<rect x="110" y="${y - 130}" width="860" height="300" rx="32" fill="#ffffff" fill-opacity="0.06" stroke="#F2B84B" stroke-opacity="${i === 0 ? 0.9 : 0.4}" stroke-width="3"/>
${T(170, y - 40, 40, '#F2B84B', `#${i + 1} · %${t.score}`, { anchor: 'start', weight: '700' })}
${T(170, y + 40, 66, '#E3ECF3', t.name, { anchor: 'start', font: SERIF })}
${wrap(t.reason, 44).slice(0, 2).map((r, k) => T(170, y + 100 + k * 42, 32, '#93A9BB', r, { anchor: 'start' })).join('')}`;
  }).join('');
  return frame(tx('ÜNLÜ İKİZLERİM', 'MY CELEBRITY TWINS', lang), name, rows);
}

// ---------------- Test sonucu ----------------
export function testSvg(kicker: string, name: string, result: string, text: string, bars: { label: string; v: number; col: string }[], lang: Lang) {
  const t = wrap(result, 22).slice(0, 2).map((r, i) => T(540, 640 + i * 90, 78, '#F2B84B', r, { font: SERIF })).join('');
  const body = wrap(text, 40).slice(0, 5).map((r, i) => T(540, 900 + i * 52, 38, '#E3ECF3', r)).join('');
  const b = bars.slice(0, 5).map((x, i) => { const y = 1260 + i * 90; return `${T(150, y + 10, 34, '#E3ECF3', x.label, { anchor: 'start' })}<rect x="470" y="${y - 22}" width="460" height="36" rx="18" fill="#ffffff" fill-opacity="0.1"/><rect x="470" y="${y - 22}" width="${Math.max(18, 4.6 * x.v)}" height="36" rx="18" fill="${x.col}"/>${T(950, y + 10, 30, '#93A9BB', `%${x.v}`, { anchor: 'end' })}`; }).join('');
  return frame(kicker, name, `${t}${body}${b}`);
}

// ---------------- Şehirlerim ----------------
export function citySvg(name: string, picks: { theme: string; city: string; country: string; good: boolean }[], lang: Lang) {
  const rows = picks.slice(0, 6).map((p, i) => {
    const y = 600 + i * 200;
    return `<rect x="110" y="${y - 80}" width="860" height="170" rx="28" fill="#ffffff" fill-opacity="0.06" stroke="${p.good ? '#F2B84B' : '#F28A5B'}" stroke-opacity="0.6" stroke-width="2"/>
${T(160, y - 20, 30, p.good ? '#93A9BB' : '#F28A5B', p.theme.toLocaleUpperCase(lang), { anchor: 'start', spacing: 2 })}
${T(160, y + 50, 60, '#E3ECF3', p.city, { anchor: 'start', font: SERIF })}
${T(930, y + 50, 30, '#93A9BB', p.country, { anchor: 'end' })}`;
  }).join('');
  return frame(tx('BENİM ŞEHİRLERİM', 'MY CITIES', lang), name, rows);
}
