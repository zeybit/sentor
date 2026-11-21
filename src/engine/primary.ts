// Primer direksiyonlar ve drakonik harita
//
// Primer direksiyon: doğumdan sonraki birkaç saatte Dünya'nın dönüşüyle gezegenlerin haritanın köşelerine
// (Yükselen, MC, Alçalan, IC) ulaşması. Dönen her derece hayatın yaklaşık bir yılına denk gelir (Naibod anahtarı:
// 0,98564° = 1 yıl). Gezegenin sağ açıklığı (RA) ve eğik yükselimi/batımı (OA/OD) üzerinden, zodyakal (enlem 0) hesaplanır.
// Doğum saati bilinmeyen haritada hesaplanmaz: 4 dakikalık saat hatası yaklaşık 1 yıllık kaymaya yol açar.
//
// Drakonik harita: bütün noktalar Kuzey Ay Düğümü 0° Koç olacak şekilde kaydırılır ("ruhun haritası").
import type { BodyId, Chart } from './astro';
import { PLANETS, assembleChart, houseOf, norm, raFromLon, decOf, angleDiff } from './astro';

export type Angle = 'asc' | 'mc' | 'dsc' | 'ic';
export interface Direction { prom: BodyId; angle: Angle; arc: number; age: number; date: Date }

const NAIBOD = 0.98564736;
const YEAR = 365.2422 * 864e5;
const D = Math.PI / 180;

const CACHE = new WeakMap<Chart, Direction[]>();
/** Doğrudan (direkt) zodyakal primer direksiyonlar: gezegenler köşelere, 0–95 yaş */
export function primaryDirections(ch: Chart): Direction[] {
  const hit = CACHE.get(ch);
  if (hit) return hit;
  const out: Direction[] = [];
  if (ch.ramc === null || ch.asc === null || !ch.input.timeKnown) { CACHE.set(ch, out); return out; }
  const eps = ch.eps, lat = ch.input.lat, ramc = ch.ramc;
  for (const prom of PLANETS) {
    const tl = norm(ch.positions[prom].lon + ch.ayanamsa);
    const ra = raFromLon(tl, eps), dec = decOf(tl, 0, eps);
    const arcs: [Angle, number | null][] = [['mc', norm(ra - ramc)], ['ic', norm(ra - ramc - 180)]];
    const x = Math.tan(lat * D) * Math.tan(dec * D);
    if (Math.abs(x) < 1) {
      const ad = Math.asin(x) / D;
      arcs.push(['asc', norm(ra - ad - (ramc + 90))], ['dsc', norm(ra + ad - (ramc + 270))]);
    }
    for (const [angle, arc] of arcs) {
      if (arc === null || arc < 0.3 || arc > 95 * NAIBOD) continue;
      const age = arc / NAIBOD;
      out.push({ prom, angle, arc, age, date: new Date(ch.utc.getTime() + age * YEAR) });
    }
  }
  out.sort((a, b) => a.age - b.age);
  CACHE.set(ch, out);
  return out;
}

/** Drakonik harita: Kuzey Ay Düğümü 0° Koç olacak şekilde kaydırılmış doğum haritası */
export function draconicChart(natal: Chart, o: any): Chart {
  const node = natal.positions.node.lon;
  const shift = (lon: number) => norm(lon - node);
  const raw: Record<string, { lon: number; lat: number; speed: number }> = {};
  for (const [id, p] of Object.entries(natal.positions)) {
    if (id === 'fortune') continue;
    raw[id] = { lon: norm(shift(p.lon) + natal.ayanamsa), lat: p.lat, speed: p.speed };
  }
  const c = assembleChart({ ...natal.input }, natal.utc, raw, null, o, natal.eps, natal.ayanamsa);
  if (natal.asc !== null && natal.mc !== null && natal.cusps.length === 12) {
    c.cusps = natal.cusps.map(shift); c.asc = shift(natal.asc); c.mc = shift(natal.mc);
    for (const p of Object.values(c.positions)) p.house = houseOf(p.lon, c.cusps);
  }
  return c;
}

export type DPt = BodyId | 'asc' | 'mc' | 'dsc' | 'ic';
/** Drakonik noktaların doğum haritasındaki noktalara kavuşumları (1,5°) */
export function draconicContacts(natal: Chart, dr: Chart): { a: DPt; b: DPt; orb: number }[] {
  const timed = natal.asc !== null && natal.mc !== null;
  const movers: DPt[] = [...PLANETS, ...(timed ? ['asc', 'mc'] as DPt[] : [])];
  const targets: DPt[] = [...PLANETS, ...(timed ? ['asc', 'mc', 'dsc', 'ic'] as DPt[] : [])];
  const lonOf = (c: Chart, k: DPt) => k === 'asc' ? c.asc! : k === 'mc' ? c.mc! : k === 'dsc' ? norm(c.asc! + 180) : k === 'ic' ? norm(c.mc! + 180) : c.positions[k].lon;
  const out: { a: DPt; b: DPt; orb: number }[] = [];
  for (const a of movers) for (const b of targets) {
    if (a === b) continue;
    const orb = angleDiff(lonOf(dr, a), lonOf(natal, b));
    if (orb <= 1.5) out.push({ a, b, orb });
  }
  return out.sort((x, y) => x.orb - y.orb);
}
