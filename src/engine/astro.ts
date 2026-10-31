// Astroloji hesaplama motoru
// Gezegen konumları: astronomy-engine (VSOP87/ELP tabanlı, ~1 yay dakikası altında hassasiyet)
// Görünür (apparent) geosentrik, tropikal, gerçek ekliptik (nütasyon dahil) boylamlar — Swiss Ephemeris varsayılanlarıyla aynı çerçeve.
import * as A from 'astronomy-engine';
import { LocalDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import { JUNO_B64, JUNO_JD0, JUNO_STEP } from './junoData';

export type BodyId =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto' | 'node' | 'southNode' | 'lilith' | 'fortune' | 'juno';

export const PLANETS: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
export const ALL_BODIES: BodyId[] = [...PLANETS, 'juno', 'node', 'southNode', 'lilith', 'fortune'];

export type HouseSystem = 'placidus' | 'wholeSign' | 'equal' | 'porphyry' | 'regiomontanus';

export interface BirthInput {
  year: number; month: number; day: number;
  hour: number; minute: number;
  timeKnown: boolean;
  lat: number; lon: number;
  tz: string; // IANA, örn. "Europe/Istanbul"
}

export interface Position {
  id: BodyId;
  lon: number;      // 0–360 ekliptik boylam
  sign: number;     // 0=Koç … 11=Balık
  deg: number;      // burç içi derece
  speed: number;    // derece/gün
  retro: boolean;
  house: number;    // 1–12 (saat bilinmiyorsa 0)
}

export interface Aspect {
  a: BodyId; b: BodyId;
  type: AspectType;
  orb: number;
  exact: number;
}

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
  houseSystem: HouseSystem;
  houseSystemUsed: HouseSystem; // kutup bölgelerinde Placidus → Porphyry
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

function planetLon(id: BodyId, t: A.AstroTime): number {
  const body = BODY_MAP[id]!;
  const v = A.GeoVector(body, t, true); // ışık zamanı + aberasyon düzeltmeli
  return norm(A.Ecliptic(v).elon);
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

function centuriesTT(t: A.AstroTime) { return t.tt / 36525; }

function meanLilithLon(t: A.AstroTime): number {
  // Ortalama Kara Ay (Ay apojesi) — Meeus, Astronomical Algorithms bölüm 47
  const T = centuriesTT(t);
  const perigee = 83.3532465 + 4069.0137287 * T - 0.01032 * T * T - (T ** 3) / 80053 + (T ** 4) / 18999000;
  return norm(perigee + 180);
}

/** Bir gövdenin belirli bir tarihteki boylamı */
export function bodyLon(id: BodyId, date: Date): number { return lonAt(id, A.MakeTime(date)); }

function lonAt(id: BodyId, t: A.AstroTime): number {
  if (id === 'node') return trueNodeLon(t);
  if (id === 'lilith') return meanLilithLon(t);
  return planetLon(id, t);
}

function speedOf(id: BodyId, t: A.AstroTime): number {
  const dt = id === 'moon' ? 0.05 : 0.5;
  const a = lonAt(id, t.AddDays(-dt));
  const b = lonAt(id, t.AddDays(dt));
  let d = b - a;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d / (2 * dt);
}

// ---------- Evler ----------

function ascFrom(ramc: number, eps: number, lat: number): number {
  return norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))));
}
function mcFrom(ramc: number, eps: number): number {
  return norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
}
function lonFromRA(ra: number, eps: number): number {
  return norm(atan2d(sind(ra), cosd(ra) * cosd(eps)));
}

function placidusCusp(ramc: number, eps: number, lat: number, frac: number, above: boolean): number | null {
  // frac: yay oranı (1/3 veya 2/3). above=true → 11./12. evler, false → 2./3. evler
  let ra = above ? ramc + 90 * frac * 1 : ramc + 180 - 90 * frac;
  for (let i = 0; i < 100; i++) {
    const lon = lonFromRA(ra, eps);
    const dec = Math.asin(sind(eps) * sind(lon)) * R2D;
    const x = -tand(lat) * tand(dec);
    if (Math.abs(x) > 1) return null;
    const dsa = Math.acos(x) * R2D; // gündüz yarı yayı
    const nsa = 180 - dsa;
    const next = above ? ramc + frac * dsa : ramc + 180 - frac * nsa;
    if (Math.abs(next - ra) < 1e-9) { ra = next; break; }
    ra = next;
  }
  return lonFromRA(ra, eps);
}

function houseCusps(sys: HouseSystem, ramc: number, eps: number, lat: number, asc: number, mc: number): { cusps: number[]; used: HouseSystem } {
  const c = new Array(12).fill(0);
  if (sys === 'placidus') {
    const c11 = placidusCusp(ramc, eps, lat, 1 / 3, true);
    const c12 = placidusCusp(ramc, eps, lat, 2 / 3, true);
    const c2 = placidusCusp(ramc, eps, lat, 2 / 3, false);
    const c3 = placidusCusp(ramc, eps, lat, 1 / 3, false);
    if (c11 !== null && c12 !== null && c2 !== null && c3 !== null && Math.abs(lat) < 66) {
      c[0] = asc; c[9] = mc; c[10] = c11; c[11] = c12; c[1] = c2; c[2] = c3;
      for (let i = 3; i < 9; i++) c[i] = norm(c[(i + 6) % 12] + 180);
      return { cusps: c, used: 'placidus' };
    }
    return houseCusps('porphyry', ramc, eps, lat, asc, mc);
  }
  if (sys === 'regiomontanus') {
    // Regiomontanus: ilk dikey çemberin eşit bölümleri; kutup yüksekliği tan(φp) = tan(φ)·sin(θ)
    const pole = (th: number) => Math.atan(tand(lat) * sind(th)) * R2D;
    c[0] = asc; c[9] = mc;
    c[10] = ascFrom(norm(ramc - 60), eps, pole(30));
    c[11] = ascFrom(norm(ramc - 30), eps, pole(60));
    c[1] = ascFrom(norm(ramc + 30), eps, pole(60));
    c[2] = ascFrom(norm(ramc + 60), eps, pole(30));
    for (let i = 3; i < 9; i++) c[i] = norm(c[(i + 6) % 12] + 180);
    return { cusps: c, used: sys };
  }
  if (sys === 'wholeSign') {
    const start = Math.floor(asc / 30) * 30;
    for (let i = 0; i < 12; i++) c[i] = norm(start + 30 * i);
    return { cusps: c, used: sys };
  }
  if (sys === 'equal') {
    for (let i = 0; i < 12; i++) c[i] = norm(asc + 30 * i);
    return { cusps: c, used: sys };
  }
  // Porphyry
  const q1 = norm(mc - asc + 360) % 360; // ASC → MC (ters yön) yerine IC→ASC yayı
  const ic = norm(mc + 180);
  const arc1 = norm(asc - mc); // MC'den ASC'ye (10→1)
  c[9] = mc; c[0] = asc;
  c[10] = norm(mc + arc1 / 3); c[11] = norm(mc + 2 * arc1 / 3);
  const arc2 = norm(ic - asc); // 1→4
  c[1] = norm(asc + arc2 / 3); c[2] = norm(asc + 2 * arc2 / 3);
  for (let i = 3; i < 9; i++) c[i] = norm(c[(i + 6) % 12] + 180);
  void q1;
  return { cusps: c, used: 'porphyry' };
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

const POINTS: BodyId[] = ['node', 'southNode', 'lilith', 'fortune', 'juno'];

export function findAspects(pos: Record<string, { lon: number }>, ids: BodyId[], orbScale = 1): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = ids[i], b = ids[j];
      if ((a === 'node' && b === 'southNode') || (a === 'southNode' && b === 'node')) continue;
      const d = angleDiff(pos[a].lon, pos[b].lon);
      for (const asp of ASPECTS) {
        let orb = asp.orb;
        if (a === 'sun' || a === 'moon' || b === 'sun' || b === 'moon') orb += 2;
        if (POINTS.includes(a) || POINTS.includes(b)) orb = Math.min(orb, 4);
        orb *= orbScale;
        const o = Math.abs(d - asp.angle);
        if (o <= orb) { out.push({ a, b, type: asp.type, orb: o, exact: asp.angle }); break; }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export function toJdUT(d: Date) { return d.getTime() / 86400000 + 2440587.5; }

/** Belirli bir an için gezegen boylamları (transit hesapları için hafif sürüm). */
export function positionsAt(date: Date, ids: BodyId[] = [...PLANETS, 'node']): Record<string, { lon: number; speed: number; retro: boolean }> {
  const t = A.MakeTime(date);
  const out: Record<string, { lon: number; speed: number; retro: boolean }> = {};
  for (const id of ids) {
    const lon = lonAt(id, t);
    const speed = speedOf(id, t);
    out[id] = { lon, speed, retro: speed < 0 };
  }
  return out;
}

export function computeChart(input: BirthInput, houseSystem: HouseSystem = 'placidus'): Chart {
  const utc = localToUtc(input);
  const t = A.MakeTime(utc);
  const raw: Record<string, { lon: number; speed: number }> = {};
  for (const id of [...PLANETS, 'node', 'lilith'] as BodyId[]) {
    raw[id] = { lon: lonAt(id, t), speed: speedOf(id, t) };
  }
  raw.southNode = { lon: norm(raw.node.lon + 180), speed: raw.node.speed };
  const jd = toJdUT(utc);
  const j0 = junoLon(jd - 0.5), j1 = junoLon(jd + 0.5);
  if (j0 !== null && j1 !== null) {
    let d = j1 - j0; if (d > 180) d -= 360; if (d < -180) d += 360;
    raw.juno = { lon: junoLon(jd)!, speed: d };
  }

  let cusps: number[] = [];
  let asc: number | null = null, mc: number | null = null, vertex: number | null = null;
  let used: HouseSystem = houseSystem;
  let isDay: boolean | null = null;

  if (input.timeKnown) {
    const tilt = A.e_tilt(t);
    const eps = tilt.tobl;
    const gast = A.SiderealTime(t); // saat
    const ramc = norm(gast * 15 + input.lon);
    asc = ascFrom(ramc, eps, input.lat);
    mc = mcFrom(ramc, eps);
    // Vertex: batı ufkunda ilk dikey ile ekliptiğin kesişimi
    vertex = ascFrom(norm(ramc + 180), eps, 90 - input.lat);
    if (angleDiff(vertex, asc) < 90) vertex = norm(vertex + 180); // Vertex her zaman batı (DSC) tarafındadır
    const h = houseCusps(houseSystem, ramc, eps, input.lat, asc, mc);
    cusps = h.cusps; used = h.used;
    const sunHouse = houseOf(raw.sun.lon, houseCusps('placidus', ramc, eps, input.lat, asc, mc).cusps);
    isDay = sunHouse >= 7;
    const fortune = isDay ? asc + raw.moon.lon - raw.sun.lon : asc + raw.sun.lon - raw.moon.lon;
    raw.fortune = { lon: norm(fortune), speed: 0 };
  }

  const positions = {} as Record<BodyId, Position>;
  for (const id of Object.keys(raw) as BodyId[]) {
    const { lon, speed } = raw[id];
    positions[id] = {
      id, lon, speed,
      sign: Math.floor(lon / 30),
      deg: lon % 30,
      retro: speed < 0 && !['node', 'southNode', 'lilith', 'fortune'].includes(id),
      house: houseOf(lon, cusps),
    };
  }

  const aspectIds = (Object.keys(positions) as BodyId[]).filter(i => i !== 'southNode' && i !== 'fortune');
  const aspects = findAspects(positions, aspectIds);

  return {
    input, utc, jdUT: toJdUT(utc), positions, cusps, asc, mc, vertex,
    houseSystem, houseSystemUsed: used, aspects, isDayChart: isDay,
  };
}

/** Ay fazı (0–360) ve fazın adı için indeks */
export function moonPhase(date: Date) {
  const angle = A.MoonPhase(date);
  const idx = Math.floor(norm(angle + 22.5) / 45); // 0 yeni ay … 4 dolunay
  const illum = (1 - cosd(angle)) / 2;
  return { angle, idx, illum };
}

export const SIGN_RULERS: BodyId[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
// Modern yöneticiler (Akrep→Plüton, Kova→Uranüs, Balık→Neptün) yorumlarda ek olarak anılır
export const MODERN_RULERS: Partial<Record<number, BodyId>> = { 7: 'pluto', 10: 'uranus', 11: 'neptune' };

export function fmtDeg(lon: number) {
  const d = lon % 30;
  let deg = Math.floor(d);
  let min = Math.round((d - deg) * 60);
  if (min === 60) { min = 0; deg += 1; }
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

// ---------- Juno (tablodan, ikinci derece interpolasyon) ----------
let junoTable: Uint16Array | null = null;
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
/** Juno boylamı (1900–2100 arası; dışında null). Swiss Ephemeris'ten üretilmiş tablo, hata < 0.01° */
export function junoLon(jdUT: number): number | null {
  if (!junoTable) {
    const bytes = decodeB64(JUNO_B64);
    junoTable = new Uint16Array(bytes.length / 2);
    for (let i = 0; i < junoTable.length; i++) junoTable[i] = bytes[2 * i] | (bytes[2 * i + 1] << 8);
  }
  const x = (jdUT - JUNO_JD0) / JUNO_STEP;
  const i = Math.floor(x);
  if (i < 0 || i + 2 >= junoTable.length) return null;
  const f = x - i;
  const v = (k: number) => (junoTable![k] / 65536) * 360;
  const un = (a: number, b: number) => { let d = b - a; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  const y0 = v(i), d1 = un(y0, v(i + 1)), d2 = d1 + un(v(i + 1), v(i + 2));
  const a = (d2 - 2 * d1) / 2, b = d1 - a;
  return norm(y0 + a * f * f + b * f);
}
