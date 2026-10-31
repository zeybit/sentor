// Astroloji hesaplama motoru
// Gezegen konumları: astronomy-engine (VSOP87/ELP tabanlı, ~1 yay dakikası altında hassasiyet)
// Görünür (apparent) geosentrik, gerçek ekliptik (nütasyon dahil) boylamlar — Swiss Ephemeris varsayılanlarıyla aynı çerçeve.
// Asteroitler (Chiron, Ceres, Pallas, Juno, Vesta): Swiss Ephemeris'ten üretilmiş 1900–2100 tabloları.
// Ev sistemleri (11): Placidus, Koch, Porphyry, Regiomontanus, Campanus, Eşit, Tam Burç, Alcabitius, Topocentric, Morinus, Meridian.
import * as A from 'astronomy-engine';
import { LocalDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import { AST_B64, AST_JD0, AST_STEP } from './asteroidData';

export type BodyId =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto' | 'node' | 'southNode' | 'lilith' | 'fortune'
  | 'chiron' | 'ceres' | 'pallas' | 'juno' | 'vesta';

export const PLANETS: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const ASTEROIDS: BodyId[] = ['chiron', 'ceres', 'pallas', 'juno', 'vesta'];
export const ALL_BODIES: BodyId[] = [...PLANETS, 'chiron', 'ceres', 'pallas', 'juno', 'vesta', 'node', 'southNode', 'lilith', 'fortune'];
const NON_PLANET: BodyId[] = ['node', 'southNode', 'lilith', 'fortune'];

export type HouseSystem = 'placidus' | 'koch' | 'porphyry' | 'regiomontanus' | 'campanus' | 'equal' | 'wholeSign' | 'alcabitius' | 'topocentric' | 'morinus' | 'meridian';
export const HOUSE_SYSTEMS: HouseSystem[] = ['placidus', 'koch', 'porphyry', 'regiomontanus', 'campanus', 'equal', 'wholeSign', 'alcabitius', 'topocentric', 'morinus', 'meridian'];
export type Zodiac = 'tropical' | 'sidereal';
export interface ChartOptions { houseSystem?: HouseSystem; zodiac?: Zodiac }

export interface BirthInput {
  year: number; month: number; day: number;
  hour: number; minute: number;
  timeKnown: boolean;
  lat: number; lon: number;
  tz: string; // IANA, örn. "Europe/Istanbul"
}

export interface Position {
  id: BodyId;
  lon: number;      // 0–360 ekliptik boylam (seçili zodyakta)
  lat: number;      // ekliptik enlem
  dec: number;      // deklinasyon
  sign: number;     // 0=Koç … 11=Balık
  deg: number;      // burç içi derece
  speed: number;    // derece/gün
  retro: boolean;
  house: number;    // 1–12 (saat bilinmiyorsa 0)
}

export interface Aspect { a: BodyId; b: BodyId; type: AspectType; orb: number; exact: number; applying?: boolean }
export type AspectType = 'conjunction' | 'sextile' | 'square' | 'trine' | 'quincunx' | 'opposition';

export const ASPECTS: { type: AspectType; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 8 },
  { type: 'sextile', angle: 60, orb: 5 },
  { type: 'square', angle: 90, orb: 7 },
  { type: 'trine', angle: 120, orb: 7 },
  { type: 'quincunx', angle: 150, orb: 3 },
  { type: 'opposition', angle: 180, orb: 8 },
];

export interface Chart {
  input: BirthInput;
  utc: Date;
  jdUT: number;
  positions: Record<BodyId, Position>;
  cusps: number[];   // 12 ev başlangıcı (boş dizi: saat bilinmiyor)
  asc: number | null;
  mc: number | null;
  vertex: number | null;
  ramc: number | null;
  eps: number;
  ayanamsa: number;  // sidereal ise kullanılan ayanamsa (tropikalde 0)
  zodiac: Zodiac;
  houseSystem: HouseSystem;
  houseSystemUsed: HouseSystem; // kutup bölgelerinde Placidus/Koch → Porphyry
  aspects: Aspect[];
  isDayChart: boolean | null;
}

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
export const norm = (x: number) => ((x % 360) + 360) % 360;
const sind = (x: number) => Math.sin(x * D2R);
const cosd = (x: number) => Math.cos(x * D2R);
const tand = (x: number) => Math.tan(x * D2R);
const atan2d = (y: number, x: number) => Math.atan2(y, x) * R2D;
const asind = (x: number) => Math.asin(Math.max(-1, Math.min(1, x))) * R2D;

/** Yerel doğum saatini (tarihsel saat dilimi ve yaz saati kurallarıyla) UTC'ye çevirir. */
export function localToUtc(i: BirthInput): Date {
  const h = i.timeKnown ? i.hour : 12;
  const m = i.timeKnown ? i.minute : 0;
  const ldt = LocalDateTime.of(i.year, i.month, i.day, h, m);
  const ms = ldt.atZone(ZoneId.of(i.tz)).toInstant().toEpochMilli();
  return new Date(ms);
}

const BODY_MAP: Partial<Record<BodyId, A.Body>> = {
  sun: A.Body.Sun, moon: A.Body.Moon, mercury: A.Body.Mercury, venus: A.Body.Venus,
  mars: A.Body.Mars, jupiter: A.Body.Jupiter, saturn: A.Body.Saturn,
  uranus: A.Body.Uranus, neptune: A.Body.Neptune, pluto: A.Body.Pluto,
};

function planetEcl(id: BodyId, t: A.AstroTime): { lon: number; lat: number } {
  const v = A.GeoVector(BODY_MAP[id]!, t, true); // ışık zamanı + aberasyon düzeltmeli
  const e = A.Ecliptic(v);
  return { lon: norm(e.elon), lat: e.elat };
}

function trueNodeLon(t: A.AstroTime): number {
  // Oskülatör (gerçek) Ay düğümü: Ay'ın konum ve hız vektörlerinden yörünge düzlemi
  const s = A.GeoMoonState(t);
  const rot = A.Rotation_EQJ_ECT(t);
  const r = A.RotateVector(rot, new A.Vector(s.x, s.y, s.z, t));
  const v = A.RotateVector(rot, new A.Vector(s.vx, s.vy, s.vz, t));
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  return norm(atan2d(hx, -hy));
}

function meanLilithLon(t: A.AstroTime): number {
  // Ortalama Kara Ay (Ay apojesi) — Meeus, Astronomical Algorithms bölüm 47
  const T = t.tt / 36525;
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T * T - (T ** 3) / 80053 + (T ** 4) / 18999000;
  return norm(perigee + 180);
}

// ---------- Asteroitler (tablodan, ikinci derece interpolasyon) ----------
const astTables: Record<string, Uint16Array> = {};
function decodeB64(b64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(128);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  const len = b64.length, pad = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  const out = new Uint8Array((len * 3) / 4 - pad);
  let o = 0;
  for (let i = 0; i < len; i += 4) {
    const n = (lookup[b64.charCodeAt(i)] << 18) | (lookup[b64.charCodeAt(i + 1)] << 12) | (lookup[b64.charCodeAt(i + 2)] << 6) | lookup[b64.charCodeAt(i + 3)];
    if (o < out.length) out[o++] = (n >> 16) & 255;
    if (o < out.length) out[o++] = (n >> 8) & 255;
    if (o < out.length) out[o++] = n & 255;
  }
  return out;
}
/** Asteroit boylamı (1900–2100 arası; dışında null). Hata < 15″ */
export function asteroidLon(id: BodyId, jdUT: number): number | null {
  if (!AST_B64[id]) return null;
  if (!astTables[id]) {
    const bytes = decodeB64(AST_B64[id]);
    const tb = new Uint16Array(bytes.length / 2);
    for (let i = 0; i < tb.length; i++) tb[i] = bytes[2 * i] | (bytes[2 * i + 1] << 8);
    astTables[id] = tb;
  }
  const tb = astTables[id];
  const x = (jdUT - AST_JD0) / AST_STEP;
  const i = Math.floor(x);
  if (i < 0 || i + 2 >= tb.length) return null;
  const f = x - i;
  const v = (k: number) => (tb[k] / 65536) * 360;
  const un = (a: number, b: number) => { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  const y0 = v(i), d1 = un(y0, v(i + 1)), d2 = d1 + un(v(i + 1), v(i + 2));
  const a = (d2 - 2 * d1) / 2, b = d1 - a;
  return norm(y0 + a * f * f + b * f);
}
export const junoLon = (jd: number) => asteroidLon('juno', jd);

export function toJdUT(d: Date) { return d.getTime() / 86400000 + 2440587.5; }

function eclAt(id: BodyId, t: A.AstroTime): { lon: number; lat: number } | null {
  if (id === 'node') return { lon: trueNodeLon(t), lat: 0 };
  if (id === 'lilith') return { lon: meanLilithLon(t), lat: 0 };
  if (ASTEROIDS.includes(id)) { const l = asteroidLon(id, toJdUT(t.date)); return l === null ? null : { lon: l, lat: 0 }; }
  if (BODY_MAP[id]) return planetEcl(id, t);
  return null;
}
function lonAt(id: BodyId, t: A.AstroTime): number { return eclAt(id, t)?.lon ?? NaN; }

/** Bir gövdenin belirli bir tarihteki tropikal boylamı */
export function bodyLon(id: BodyId, date: Date): number { return lonAt(id, A.MakeTime(date)); }

function speedOf(id: BodyId, t: A.AstroTime): number {
  const dt = id === 'moon' ? 0.05 : 0.5;
  const a = lonAt(id, t.AddDays(-dt));
  const b = lonAt(id, t.AddDays(dt));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d / (2 * dt);
}

// ---------- Ayanamsa (Lahiri) ----------
/** Lahiri ayanamsa (nütasyon dahil). Swiss Ephemeris SE_SIDM_LAHIRI ile 1900–2100 arası < 0.1″ */
export function lahiri(t: A.AstroTime): number {
  const T = t.ut / 36525;
  return 23.85709235173871 + 1.3968879593133319 * T + 0.00030709098974591987 * T * T + A.e_tilt(t).dpsi / 3600;
}

// ---------- Evler ----------
export function ascFrom(ramc: number, eps: number, lat: number): number {
  return norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))));
}
export function mcFrom(ramc: number, eps: number): number {
  return norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
}
export function lonFromRA(ra: number, eps: number): number {
  return norm(atan2d(sind(ra), cosd(ra) * cosd(eps)));
}
/** Ekliptik boylamdan sağ açıklık (enlem 0) */
export function raFromLon(lon: number, eps: number): number {
  return norm(atan2d(sind(lon) * cosd(eps), cosd(lon)));
}
export function decOf(lon: number, lat: number, eps: number): number {
  return asind(sind(lat) * cosd(eps) + cosd(lat) * sind(eps) * sind(lon));
}

function placidusCusp(ramc: number, eps: number, lat: number, frac: number, above: boolean): number | null {
  let ra = above ? ramc + 90 * frac : ramc + 180 - 90 * frac;
  for (let i = 0; i < 100; i++) {
    const lon = lonFromRA(ra, eps);
    const dec = Math.asin(sind(eps) * sind(lon)) * R2D;
    const x = -tand(lat) * tand(dec);
    if (Math.abs(x) > 1) return null;
    const dsa = Math.acos(x) * R2D;
    const nsa = 180 - dsa;
    const next = above ? ramc + frac * dsa : ramc + 180 - frac * nsa;
    if (Math.abs(next - ra) < 1e-9) { ra = next; break; }
    ra = next;
  }
  return lonFromRA(ra, eps);
}

type V3 = [number, number, number];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lin = (a: V3, b: V3, ka: number, kb: number): V3 => [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
/** Ufkun kuzey–güney ekseninden geçen bir ev çemberi ile ekliptiğin doğu yarıdaki kesişimi */
function cuspVec(ramc: number, eps: number, lat: number, defining: (E: V3, Z: V3, Meq: V3) => V3): number {
  const Z: V3 = [cosd(lat) * cosd(ramc), cosd(lat) * sind(ramc), sind(lat)];
  const E: V3 = [-sind(ramc), cosd(ramc), 0];
  const N: V3 = [-sind(lat) * cosd(ramc), -sind(lat) * sind(ramc), cosd(lat)];
  const Meq: V3 = [cosd(ramc), sind(ramc), 0];
  const nH = cross(N, defining(E, Z, Meq));
  const nE: V3 = [0, -sind(eps), cosd(eps)];
  let d = cross(nE, nH);
  if (dot(d, E) < 0) d = [-d[0], -d[1], -d[2]];
  return norm(atan2d(d[1] * cosd(eps) + d[2] * sind(eps), d[0]));
}

function fillOpp(c: number[]) { for (let i = 3; i < 9; i++) c[i] = norm(c[(i + 6) % 12] + 180); return c; }

function houseCusps(sys: HouseSystem, ramc: number, eps: number, lat: number, asc: number, mc: number): { cusps: number[]; used: HouseSystem } {
  const c = new Array(12).fill(0);
  const polar = Math.abs(lat) >= 66;
  switch (sys) {
    case 'placidus': {
      const c11 = placidusCusp(ramc, eps, lat, 1 / 3, true), c12 = placidusCusp(ramc, eps, lat, 2 / 3, true);
      const c2 = placidusCusp(ramc, eps, lat, 2 / 3, false), c3 = placidusCusp(ramc, eps, lat, 1 / 3, false);
      if (c11 === null || c12 === null || c2 === null || c3 === null || polar) return houseCusps('porphyry', ramc, eps, lat, asc, mc);
      c[0] = asc; c[9] = mc; c[10] = c11; c[11] = c12; c[1] = c2; c[2] = c3;
      return { cusps: fillOpp(c), used: sys };
    }
    case 'koch': {
      const x = tand(lat) * tand(asind(sind(eps) * sind(mc)));
      if (Math.abs(x) > 1 || polar) return houseCusps('porphyry', ramc, eps, lat, asc, mc);
      const ad = asind(x);
      c[0] = asc; c[9] = mc;
      c[10] = ascFrom(ramc - 2 * ad / 3 - 60, eps, lat); c[11] = ascFrom(ramc - ad / 3 - 30, eps, lat);
      c[1] = ascFrom(ramc + 30 + ad / 3, eps, lat); c[2] = ascFrom(ramc + 60 + 2 * ad / 3, eps, lat);
      return { cusps: fillOpp(c), used: sys };
    }
    case 'regiomontanus': {
      const reg = (a: number) => cuspVec(ramc, eps, lat, (E, _Z, M) => lin(E, M, cosd(a), sind(a)));
      c[0] = asc; c[9] = mc; c[10] = reg(60); c[11] = reg(30); c[1] = reg(-30); c[2] = reg(-60);
      return { cusps: fillOpp(c), used: sys };
    }
    case 'campanus': {
      const cmp = (a: number) => cuspVec(ramc, eps, lat, (E, Z) => lin(E, Z, cosd(a), sind(a)));
      c[0] = asc; c[9] = mc; c[10] = cmp(60); c[11] = cmp(30); c[1] = cmp(-30); c[2] = cmp(-60);
      return { cusps: fillOpp(c), used: sys };
    }
    case 'topocentric': {
      const tp = (k: number) => Math.atan(tand(lat) * k / 3) * R2D;
      c[0] = asc; c[9] = mc;
      c[10] = ascFrom(ramc - 60, eps, tp(1)); c[11] = ascFrom(ramc - 30, eps, tp(2));
      c[1] = ascFrom(ramc + 30, eps, tp(2)); c[2] = ascFrom(ramc + 60, eps, tp(1));
      return { cusps: fillOpp(c), used: sys };
    }
    case 'alcabitius': {
      const x = -tand(lat) * tand(asind(sind(eps) * sind(asc)));
      if (Math.abs(x) > 1) return houseCusps('porphyry', ramc, eps, lat, asc, mc);
      const dsa = Math.acos(x) * R2D, nsa = 180 - dsa;
      c[0] = asc; c[9] = mc;
      c[10] = lonFromRA(ramc + dsa / 3, eps); c[11] = lonFromRA(ramc + 2 * dsa / 3, eps);
      c[1] = lonFromRA(ramc + dsa + nsa / 3, eps); c[2] = lonFromRA(ramc + dsa + 2 * nsa / 3, eps);
      return { cusps: fillOpp(c), used: sys };
    }
    case 'morinus':
      for (let i = 0; i < 12; i++) { const r = ramc + 90 + 30 * i; c[i] = norm(atan2d(sind(r) * cosd(eps), cosd(r))); }
      return { cusps: c, used: sys };
    case 'meridian':
      for (let i = 0; i < 12; i++) c[i] = lonFromRA(ramc + 90 + 30 * i, eps);
      return { cusps: c, used: sys };
    case 'wholeSign': {
      const start = Math.floor(asc / 30) * 30;
      for (let i = 0; i < 12; i++) c[i] = norm(start + 30 * i);
      return { cusps: c, used: sys };
    }
    case 'equal':
      for (let i = 0; i < 12; i++) c[i] = norm(asc + 30 * i);
      return { cusps: c, used: sys };
    default: {
      const ic = norm(mc + 180), arc1 = norm(asc - mc), arc2 = norm(ic - asc);
      c[9] = mc; c[0] = asc;
      c[10] = norm(mc + arc1 / 3); c[11] = norm(mc + 2 * arc1 / 3);
      c[1] = norm(asc + arc2 / 3); c[2] = norm(asc + 2 * arc2 / 3);
      return { cusps: fillOpp(c), used: 'porphyry' };
    }
  }
}

export function houseOf(lon: number, cusps: number[]): number {
  if (!cusps.length) return 0;
  for (let i = 0; i < 12; i++) {
    const a = cusps[i];
    const b = cusps[(i + 1) % 12];
    const span = norm(b - a);
    if (norm(lon - a) < span) return i + 1;
  }
  return 1;
}

export function angleDiff(a: number, b: number) {
  const d = Math.abs(norm(a - b));
  return d > 180 ? 360 - d : d;
}

const POINTS: BodyId[] = ['node', 'southNode', 'lilith', 'fortune', 'chiron', 'ceres', 'pallas', 'juno', 'vesta'];

export function findAspects(pos: Record<string, { lon: number; speed?: number }>, ids: BodyId[], orbScale = 1): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], b = ids[j];
      if (!pos[a] || !pos[b]) continue;
      if ((a === 'node' && b === 'southNode') || (a === 'southNode' && b === 'node')) continue;
      const d = angleDiff(pos[a].lon, pos[b].lon);
      for (const asp of ASPECTS) {
        let orb = asp.orb;
        if (a === 'sun' || a === 'moon' || b === 'sun' || b === 'moon') orb += 2;
        if (POINTS.includes(a) || POINTS.includes(b)) orb = Math.min(orb, POINTS.includes(a) && POINTS.includes(b) ? 2 : 4);
        orb *= orbScale;
        const o = Math.abs(d - asp.angle);
        if (o <= orb) {
          // uygulayan mı ayrılan mı: bir gün sonra orb küçülüyor mu
          let applying: boolean | undefined;
          const sa = pos[a].speed ?? 0, sb = pos[b].speed ?? 0;
          if (sa || sb) {
            const d2 = angleDiff(pos[a].lon + sa * 0.1, pos[b].lon + sb * 0.1);
            applying = Math.abs(d2 - asp.angle) < o;
          }
          out.push({ a, b, type: asp.type, orb: o, exact: asp.angle, applying });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

/** Belirli bir an için gezegen boylamları (transit hesapları için hafif sürüm, tropikal). */
export function positionsAt(date: Date, ids: BodyId[] = [...PLANETS, 'node']): Record<string, { lon: number; speed: number; retro: boolean }> {
  const t = A.MakeTime(date);
  const out: Record<string, { lon: number; speed: number; retro: boolean }> = {};
  for (const id of ids) {
    const lon = lonAt(id, t);
    if (Number.isNaN(lon)) continue;
    const speed = speedOf(id, t);
    out[id] = { lon, speed, retro: speed < 0 };
  }
  return out;
}

const optsOf = (o?: HouseSystem | ChartOptions): Required<ChartOptions> =>
  typeof o === 'string' ? { houseSystem: o, zodiac: 'tropical' } : { houseSystem: o?.houseSystem ?? 'placidus', zodiac: o?.zodiac ?? 'tropical' };

/** Ham boylamlar ve (varsa) RAMC'den tam bir harita nesnesi kurar. Progresyon, solar arc ve kompozit bunu kullanır. */
export function assembleChart(
  input: BirthInput, utc: Date,
  raw: Record<string, { lon: number; lat?: number; speed: number }>,
  angles: { ramc: number; asc?: number; mc?: number } | null,
  o: Required<ChartOptions>, eps: number, ayanamsa: number,
): Chart {
  let cusps: number[] = [];
  let asc: number | null = null, mc: number | null = null, vertex: number | null = null;
  let used = o.houseSystem;
  let isDay: boolean | null = null;
  const lat = input.lat;
  if (angles) {
    const ramc = angles.ramc;
    const tAsc = angles.asc ?? ascFrom(ramc, eps, lat);
    const tMc = angles.mc ?? mcFrom(ramc, eps);
    let vx = ascFrom(norm(ramc + 180), eps, 90 - lat);
    if (angleDiff(vx, tAsc) < 90) vx = norm(vx + 180);
    const h = houseCusps(o.houseSystem, ramc, eps, lat, tAsc, tMc);
    used = h.used;
    // sidereal: tüm noktalar ayanamsa kadar kaydırılır
    asc = norm(tAsc - ayanamsa); mc = norm(tMc - ayanamsa); vertex = norm(vx - ayanamsa);
    cusps = h.cusps.map(c => norm(c - ayanamsa));
    const sunLon = raw.sun.lon;
    isDay = houseOf(sunLon, houseCusps('porphyry', ramc, eps, lat, tAsc, tMc).cusps) >= 7;
    const fortune = isDay ? tAsc + raw.moon.lon - raw.sun.lon : tAsc + raw.sun.lon - raw.moon.lon;
    raw.fortune = { lon: norm(fortune), speed: 0 };
  }
  const positions = {} as Record<BodyId, Position>;
  for (const id of Object.keys(raw) as BodyId[]) {
    const { speed } = raw[id];
    const tl = raw[id].lon, la = raw[id].lat ?? 0;
    const lon = norm(tl - ayanamsa);
    positions[id] = {
      id, lon, lat: la, dec: decOf(tl, la, eps), speed,
      sign: Math.floor(lon / 30), deg: lon % 30,
      retro: speed < 0 && !NON_PLANET.includes(id),
      house: houseOf(lon, cusps),
    };
  }
  const aspectIds = (Object.keys(positions) as BodyId[]).filter(i => i !== 'southNode' && i !== 'fortune');
  return {
    input, utc, jdUT: toJdUT(utc), positions, cusps, asc, mc, vertex, ramc: angles?.ramc ?? null, eps, ayanamsa,
    zodiac: o.zodiac, houseSystem: o.houseSystem, houseSystemUsed: used, aspects: findAspects(positions, aspectIds), isDayChart: isDay,
  };
}

/** Gökyüzünün belirli bir UTC anındaki ham durumu */
export function skyRaw(utc: Date): { raw: Record<string, { lon: number; lat: number; speed: number }>; eps: number; gast: number; t: A.AstroTime } {
  const t = A.MakeTime(utc);
  const raw: Record<string, { lon: number; lat: number; speed: number }> = {};
  for (const id of [...PLANETS, ...ASTEROIDS, 'node', 'lilith'] as BodyId[]) {
    const e = eclAt(id, t);
    if (!e) continue;
    raw[id] = { lon: e.lon, lat: e.lat, speed: speedOf(id, t) };
  }
  raw.southNode = { lon: norm(raw.node.lon + 180), lat: 0, speed: raw.node.speed };
  return { raw, eps: A.e_tilt(t).tobl, gast: A.SiderealTime(t), t };
}

export function computeChart(input: BirthInput, opts?: HouseSystem | ChartOptions): Chart {
  const o = optsOf(opts);
  const utc = localToUtc(input);
  const { raw, eps, gast, t } = skyRaw(utc);
  const ay = o.zodiac === 'sidereal' ? lahiri(t) : 0;
  const angles = input.timeKnown ? { ramc: norm(gast * 15 + input.lon) } : null;
  return assembleChart(input, utc, raw, angles, o, eps, ay);
}

/** Bir UTC anı ve konum için harita (transit, dönüş, şimdi haritaları) */
export function chartAt(utc: Date, lat: number, lon: number, opts?: HouseSystem | ChartOptions): Chart {
  const input: BirthInput = { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate(), hour: utc.getUTCHours(), minute: utc.getUTCMinutes(), timeKnown: true, lat, lon, tz: 'UTC' };
  const o = optsOf(opts);
  const { raw, eps, gast, t } = skyRaw(utc);
  const ay = o.zodiac === 'sidereal' ? lahiri(t) : 0;
  return assembleChart(input, utc, raw, { ramc: norm(gast * 15 + lon) }, o, eps, ay);
}

/** Ay fazı (0–360) ve fazın adı için indeks */
export function moonPhase(date: Date) {
  const angle = A.MoonPhase(date);
  const idx = Math.floor(norm(angle + 22.5) / 45);
  const illum = (1 - cosd(angle)) / 2;
  return { angle, idx, illum };
}

export const SIGN_RULERS: BodyId[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
export const MODERN_RULERS: Partial<Record<number, BodyId>> = { 7: 'pluto', 10: 'uranus', 11: 'neptune' };

export function fmtDeg(lon: number) {
  const d = norm(lon) % 30;
  let deg = Math.floor(d);
  let min = Math.round((d - deg) * 60);
  if (min === 60) { min = 0; deg += 1; }
  return `${deg}°${String(min).padStart(2, '0')}'`;
}
