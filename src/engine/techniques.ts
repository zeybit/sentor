// Harita türleri ve araçlar: transit, progresyon, solar arc, Güneş/Ay dönüşü, kompozit, Davison, antiscia,
// orta noktalar, Arap noktaları, paralel/kontra-paralel, sabit yıldızlar, gezegen saatleri, ay takvimi,
// aylık transitler, bulucu ve kartografi.
import * as A from 'astronomy-engine';
import {
  BodyId, Chart, ChartOptions, PLANETS, ASTEROIDS, angleDiff, norm, bodyLon, chartAt, assembleChart, skyRaw, lahiri,
  ascFrom, mcFrom, raFromLon, findAspects, AspectType, ASPECTS, houseOf, decOf,
} from './astro';

const DAY = 86400000;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const sind = (x: number) => Math.sin(x * D2R), cosd = (x: number) => Math.cos(x * D2R), tand = (x: number) => Math.tan(x * D2R);
type Opts = Required<ChartOptions>;
const signedDiff = (a: number, b: number) => { let d = norm(a - b); if (d > 180) d -= 360; return d; };

export type ChartKind = 'natal' | 'transit' | 'progressed' | 'solarArc' | 'solarReturn' | 'lunarReturn' | 'antiscia' | 'now';

// ---------------- Transit ----------------
export function transitChart(natal: Chart, when: Date, o: Opts, lat = natal.input.lat, lon = natal.input.lon): Chart {
  return chartAt(when, lat, lon, o);
}

/** Natal ile ikinci harita arasındaki açılar (a: ikinci haritanın gövdesi, b: natal gövde) */
export interface CrossAspect { a: BodyId | 'asc' | 'mc'; b: BodyId | 'asc' | 'mc'; type: AspectType; orb: number; applying?: boolean }
const CROSS_IDS: BodyId[] = [...PLANETS, 'chiron', 'node'];
export function crossAspects(outer: Chart, inner: Chart, orbMax = 3, ids: BodyId[] = CROSS_IDS, includeAngles = true): CrossAspect[] {
  const pts = (c: Chart) => {
    const r: { id: BodyId | 'asc' | 'mc'; lon: number; speed: number }[] = ids.filter(i => c.positions[i]).map(i => ({ id: i, lon: c.positions[i].lon, speed: c.positions[i].speed }));
    if (includeAngles && c.asc !== null) r.push({ id: 'asc', lon: c.asc, speed: 0 }, { id: 'mc', lon: c.mc!, speed: 0 });
    return r;
  };
  const out: CrossAspect[] = [];
  for (const x of pts(outer)) for (const y of pts(inner)) {
    const d = angleDiff(x.lon, y.lon);
    for (const asp of ASPECTS) {
      if (asp.type === 'quincunx') continue;
      const orb = Math.abs(d - asp.angle);
      if (orb <= orbMax) {
        const d2 = angleDiff(x.lon + x.speed * 0.1, y.lon + y.speed * 0.1);
        out.push({ a: x.id, b: y.id, type: asp.type, orb, applying: x.speed || y.speed ? Math.abs(d2 - asp.angle) < orb : undefined });
        break;
      }
    }
  }
  return out.sort((p, q) => p.orb - q.orb);
}

// ---------------- İkincil progresyon (gün = yıl) ----------------
/** Açılar: MC güneş yayı kadar ilerletilir (sağ açıklıkta), ASC doğum enleminden türetilir */
export function progressedChart(natal: Chart, when: Date, o: Opts): Chart {
  const years = (when.getTime() - natal.utc.getTime()) / (365.2422 * DAY);
  const pUtc = new Date(natal.utc.getTime() + years * DAY);
  const { raw, eps, t } = skyRaw(pUtc);
  const ay = o.zodiac === 'sidereal' ? lahiri(t) : 0;
  let angles: { ramc: number } | null = null;
  if (natal.ramc !== null) {
    const arc = signedDiff(raw.sun.lon, bodyLon('sun', natal.utc));
    const natSunRA = raFromLon(bodyLon('sun', natal.utc), natal.eps), progSunRA = raFromLon(raw.sun.lon, eps);
    void arc;
    angles = { ramc: norm(natal.ramc + signedDiff(progSunRA, natSunRA)) };
  }
  return assembleChart({ ...natal.input }, pUtc, raw, angles, o, eps, ay);
}

// ---------------- Solar arc ----------------
export function solarArcChart(natal: Chart, when: Date, o: Opts): Chart {
  const years = (when.getTime() - natal.utc.getTime()) / (365.2422 * DAY);
  const pUtc = new Date(natal.utc.getTime() + years * DAY);
  const arc = signedDiff(bodyLon('sun', pUtc), bodyLon('sun', natal.utc));
  const raw: Record<string, { lon: number; lat: number; speed: number }> = {};
  for (const [id, p] of Object.entries(natal.positions)) {
    if (id === 'fortune') continue;
    raw[id] = { lon: norm(p.lon + natal.ayanamsa + arc), lat: p.lat, speed: 0 };
  }
  let angles: { ramc: number; asc: number; mc: number } | null = null;
  if (natal.ramc !== null && natal.mc !== null) {
    const mc = norm(natal.mc + natal.ayanamsa + arc);
    const ramc = raFromLon(mc, natal.eps);
    angles = { ramc, mc, asc: ascFrom(ramc, natal.eps, natal.input.lat) };
  }
  const c = assembleChart({ ...natal.input }, pUtc, raw, angles, o, natal.eps, natal.ayanamsa);
  return c;
}
export function solarArcDegrees(natal: Chart, when: Date): number {
  const years = (when.getTime() - natal.utc.getTime()) / (365.2422 * DAY);
  return signedDiff(bodyLon('sun', new Date(natal.utc.getTime() + years * DAY)), bodyLon('sun', natal.utc));
}

// ---------------- Dönüşler ----------------
function returnMoment(id: 'sun' | 'moon', targetLon: number, after: Date): Date {
  const period = id === 'sun' ? 365.2422 : 27.3217;
  const step = id === 'sun' ? 1 : 0.1;
  const f = (t: number) => signedDiff(bodyLon(id, new Date(t)), targetLon);
  let t0 = after.getTime(), v0 = f(t0);
  for (let t = t0 + step * DAY; t <= after.getTime() + (period + 2) * DAY; t += step * DAY) {
    const v = f(t);
    if (v0 < 0 && v >= 0 && v - v0 < 90) {
      let lo = t - step * DAY, hi = t;
      for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (f(m) < 0) lo = m; else hi = m; }
      return new Date((lo + hi) / 2);
    }
    v0 = v;
  }
  return after;
}
/** Seçilen tarihten önceki son doğum gününe ait Güneş dönüşü */
export function solarReturnChart(natal: Chart, when: Date, o: Opts, lat = natal.input.lat, lon = natal.input.lon): Chart {
  const target = bodyLon('sun', natal.utc);
  let start = returnMoment('sun', target, new Date(when.getTime() - 366 * DAY));
  const next = returnMoment('sun', target, new Date(start.getTime() + 300 * DAY));
  if (next <= when) start = next;
  return chartAt(start, lat, lon, o);
}
/** Seçilen tarihten sonraki ilk Ay dönüşü */
export function lunarReturnChart(natal: Chart, when: Date, o: Opts, lat = natal.input.lat, lon = natal.input.lon): Chart {
  return chartAt(returnMoment('moon', bodyLon('moon', natal.utc), when), lat, lon, o);
}

// ---------------- Antiscia ----------------
export function antisciaChart(natal: Chart, o: Opts, contra = false): Chart {
  const raw: Record<string, { lon: number; lat: number; speed: number }> = {};
  for (const [id, p] of Object.entries(natal.positions)) {
    if (id === 'fortune') continue;
    const tl = p.lon + natal.ayanamsa;
    raw[id] = { lon: norm(180 - tl + (contra ? 180 : 0)), lat: p.lat, speed: -p.speed };
  }
  const c = assembleChart({ ...natal.input }, natal.utc, raw, null, o, natal.eps, natal.ayanamsa);
  c.cusps = natal.cusps; c.asc = natal.asc; c.mc = natal.mc;
  for (const p of Object.values(c.positions)) p.house = houseOf(p.lon, c.cusps);
  return c;
}
export const antiscion = (lon: number) => norm(180 - lon);

// ---------------- Kompozit ve Davison ----------------
const mid = (a: number, b: number) => { const d = signedDiff(b, a); return norm(a + d / 2); };
export function compositeChart(a: Chart, b: Chart, o: Opts): Chart {
  const raw: Record<string, { lon: number; lat: number; speed: number }> = {};
  for (const id of Object.keys(a.positions) as BodyId[]) {
    if (id === 'fortune' || !b.positions[id]) continue;
    raw[id] = { lon: mid(a.positions[id].lon + a.ayanamsa, b.positions[id].lon + b.ayanamsa), lat: 0, speed: (a.positions[id].speed + b.positions[id].speed) / 2 };
  }
  if (raw.node) raw.southNode = { lon: norm(raw.node.lon + 180), lat: 0, speed: raw.node.speed };
  let angles: { ramc: number } | null = null;
  if (a.ramc !== null && b.ramc !== null) angles = { ramc: mid(a.ramc, b.ramc) };
  const input = { ...a.input, lat: (a.input.lat + b.input.lat) / 2 };
  const mUtc = new Date((a.utc.getTime() + b.utc.getTime()) / 2);
  return assembleChart(input, mUtc, raw, angles, o, (a.eps + b.eps) / 2, a.ayanamsa);
}
export function davisonChart(a: Chart, b: Chart, o: Opts): Chart {
  const mUtc = new Date((a.utc.getTime() + b.utc.getTime()) / 2);
  const lat = (a.input.lat + b.input.lat) / 2;
  const lon = mid(norm(a.input.lon), norm(b.input.lon));
  return chartAt(mUtc, lat, lon > 180 ? lon - 360 : lon, o);
}

// ---------------- Orta noktalar ----------------
export interface Midpoint { a: BodyId | 'asc' | 'mc'; b: BodyId | 'asc' | 'mc'; lon: number; hits: (BodyId | 'asc' | 'mc')[] }
export function midpoints(c: Chart, orb = 1.5): Midpoint[] {
  const ids: (BodyId | 'asc' | 'mc')[] = [...PLANETS, 'node'];
  if (c.asc !== null) ids.push('asc', 'mc');
  const L = (i: BodyId | 'asc' | 'mc') => i === 'asc' ? c.asc! : i === 'mc' ? c.mc! : c.positions[i].lon;
  const out: Midpoint[] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const m = mid(L(ids[i]), L(ids[j]));
    const hits = ids.filter(k => k !== ids[i] && k !== ids[j] && (angleDiff(L(k), m) <= orb || angleDiff(L(k), norm(m + 180)) <= orb));
    out.push({ a: ids[i], b: ids[j], lon: m, hits });
  }
  return out;
}

// ---------------- Arap noktaları (Lots) ----------------
export type LotId = 'fortune' | 'spirit' | 'eros' | 'necessity' | 'courage' | 'victory' | 'nemesis' | 'marriage' | 'father' | 'mother' | 'siblings' | 'children' | 'friends' | 'commerce' | 'faith';
/** [gündüz formülü: ASC + x − y]; gece tersine çevrilir (evlilik ve ticaret hariç) */
const LOTS: { id: LotId; x: string; y: string; reverse: boolean }[] = [
  { id: 'fortune', x: 'moon', y: 'sun', reverse: true },
  { id: 'spirit', x: 'sun', y: 'moon', reverse: true },
  { id: 'eros', x: 'venus', y: 'spirit', reverse: true },
  { id: 'necessity', x: 'fortune', y: 'mercury', reverse: true },
  { id: 'courage', x: 'fortune', y: 'mars', reverse: true },
  { id: 'victory', x: 'jupiter', y: 'spirit', reverse: true },
  { id: 'nemesis', x: 'fortune', y: 'saturn', reverse: true },
  { id: 'marriage', x: 'venus', y: 'saturn', reverse: false },
  { id: 'father', x: 'saturn', y: 'sun', reverse: true },
  { id: 'mother', x: 'moon', y: 'venus', reverse: true },
  { id: 'siblings', x: 'jupiter', y: 'saturn', reverse: false },
  { id: 'children', x: 'saturn', y: 'jupiter', reverse: true },
  { id: 'friends', x: 'moon', y: 'mercury', reverse: false },
  { id: 'commerce', x: 'mercury', y: 'sun', reverse: false },
  { id: 'faith', x: 'mercury', y: 'moon', reverse: true },
];
export function lots(c: Chart): { id: LotId; lon: number; house: number }[] {
  if (c.asc === null) return [];
  const day = c.isDayChart ?? true;
  const v: Record<string, number> = {};
  for (const p of PLANETS) v[p] = c.positions[p].lon;
  const out: { id: LotId; lon: number; house: number }[] = [];
  for (const L of LOTS) {
    const [x, y] = !day && L.reverse ? [L.y, L.x] : [L.x, L.y];
    const lon = norm(c.asc + v[x] - v[y]);
    v[L.id] = lon;
    out.push({ id: L.id, lon, house: houseOf(lon, c.cusps) });
  }
  return out;
}

// ---------------- Paralel / kontra-paralel ----------------
export function parallels(c: Chart, orb = 1): { a: BodyId; b: BodyId; type: 'parallel' | 'contraparallel'; orb: number }[] {
  const ids = PLANETS.filter(i => c.positions[i]);
  const out: { a: BodyId; b: BodyId; type: 'parallel' | 'contraparallel'; orb: number }[] = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const da = c.positions[ids[i]].dec, db = c.positions[ids[j]].dec;
    if (Math.abs(da - db) <= orb && Math.sign(da) === Math.sign(db)) out.push({ a: ids[i], b: ids[j], type: 'parallel', orb: Math.abs(da - db) });
    else if (Math.abs(da + db) <= orb && Math.sign(da) !== Math.sign(db)) out.push({ a: ids[i], b: ids[j], type: 'contraparallel', orb: Math.abs(da + db) });
  }
  return out.sort((x, y) => x.orb - y.orb);
}

// ---------------- Sabit yıldızlar ----------------
export const FIXED_STARS: { name: string; lon2000: number; mag: number; nature: string }[] = [
  { name: 'Algol', lon2000: 56.17, mag: 2.1, nature: 'saturn-jupiter' },
  { name: 'Alcyone', lon2000: 60.0, mag: 2.9, nature: 'moon-mars' },
  { name: 'Aldebaran', lon2000: 69.78, mag: 0.9, nature: 'mars' },
  { name: 'Rigel', lon2000: 76.83, mag: 0.1, nature: 'jupiter-saturn' },
  { name: 'Capella', lon2000: 81.85, mag: 0.1, nature: 'mars-mercury' },
  { name: 'Betelgeuse', lon2000: 88.75, mag: 0.5, nature: 'mars-mercury' },
  { name: 'Sirius', lon2000: 104.08, mag: -1.5, nature: 'jupiter-mars' },
  { name: 'Castor', lon2000: 110.23, mag: 1.6, nature: 'mercury' },
  { name: 'Pollux', lon2000: 113.22, mag: 1.2, nature: 'mars' },
  { name: 'Procyon', lon2000: 115.78, mag: 0.4, nature: 'mercury-mars' },
  { name: 'Regulus', lon2000: 149.83, mag: 1.4, nature: 'mars-jupiter' },
  { name: 'Denebola', lon2000: 171.62, mag: 2.1, nature: 'saturn-venus' },
  { name: 'Vindemiatrix', lon2000: 189.93, mag: 2.8, nature: 'saturn-mercury' },
  { name: 'Spica', lon2000: 203.83, mag: 1.0, nature: 'venus-mars' },
  { name: 'Arcturus', lon2000: 204.23, mag: 0.0, nature: 'mars-jupiter' },
  { name: 'Zuben Elgenubi', lon2000: 225.08, mag: 2.8, nature: 'saturn-mars' },
  { name: 'Antares', lon2000: 249.77, mag: 1.0, nature: 'mars-jupiter' },
  { name: 'Vega', lon2000: 285.32, mag: 0.0, nature: 'venus-mercury' },
  { name: 'Altair', lon2000: 301.78, mag: 0.8, nature: 'mars-jupiter' },
  { name: 'Deneb Algedi', lon2000: 323.53, mag: 2.9, nature: 'saturn-jupiter' },
  { name: 'Fomalhaut', lon2000: 333.87, mag: 1.2, nature: 'venus-mercury' },
  { name: 'Scheat', lon2000: 359.37, mag: 2.4, nature: 'mars-mercury' },
];
export function starLon(lon2000: number, jd: number) { return norm(lon2000 + ((jd - 2451545) / 365.25) * (50.29 / 3600)); }
export function starContacts(c: Chart, orb = 1.5): { star: string; nature: string; point: BodyId | 'asc' | 'mc'; orb: number }[] {
  const pts: { id: BodyId | 'asc' | 'mc'; lon: number }[] = PLANETS.map(p => ({ id: p, lon: c.positions[p].lon }));
  if (c.asc !== null) pts.push({ id: 'asc', lon: c.asc }, { id: 'mc', lon: c.mc! });
  const out: { star: string; nature: string; point: BodyId | 'asc' | 'mc'; orb: number }[] = [];
  for (const s of FIXED_STARS) {
    const sl = norm(starLon(s.lon2000, c.jdUT) - c.ayanamsa);
    for (const p of pts) { const o = angleDiff(sl, p.lon); if (o <= orb) out.push({ star: s.name, nature: s.nature, point: p.id, orb: o }); }
  }
  return out.sort((a, b) => a.orb - b.orb);
}

// ---------------- Element ve nitelik (ağırlıklı) ----------------
/** ASC, Güneş, Ay 3 puan; MC ve diğer kişisel/sosyal gezegenler 1 puan */
export function elementQuality(c: Chart) {
  const el = [0, 0, 0, 0], q = [0, 0, 0];
  const signScore = new Array(12).fill(0);
  const add = (sign: number, w: number) => { el[sign % 4] += w; q[sign % 3] += w; signScore[sign] += w; };
  if (c.asc !== null) { add(Math.floor(c.asc / 30), 3); add(Math.floor(c.mc! / 30), 1); }
  add(c.positions.sun.sign, 3); add(c.positions.moon.sign, 3);
  for (const p of ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]) add(c.positions[p].sign, 1);
  const tot = el.reduce((a, b) => a + b, 0);
  const order = [c.asc !== null ? Math.floor(c.asc / 30) : -1, c.positions.sun.sign, c.positions.moon.sign];
  const maxS = Math.max(...signScore);
  const dominant = signScore.map((s, i) => ({ s, i })).filter(x => x.s === maxS).sort((a, b) => (order.indexOf(a.i) === -1 ? 9 : order.indexOf(a.i)) - (order.indexOf(b.i) === -1 ? 9 : order.indexOf(b.i)))[0].i;
  return { el: el.map(v => Math.round((v / tot) * 100)), q: q.map(v => Math.round((v / tot) * 100)), dominantElement: el.indexOf(Math.max(...el)), dominantQuality: q.indexOf(Math.max(...q)), dominantSign: dominant };
}

// ---------------- Uyum puanı ----------------
export function harmonyBand(score: number): 'bad' | 'average' | 'good' | 'perfect' {
  return score < 30 ? 'bad' : score < 50 ? 'average' : score < 80 ? 'good' : 'perfect';
}

// ---------------- Gezegen saatleri ----------------
const CHALDEAN: BodyId[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
const DAY_RULER: BodyId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']; // Pazar..Cumartesi
export interface PlanetaryHour { ruler: BodyId; start: Date; end: Date; day: boolean }
export function planetaryHours(date: Date, lat: number, lon: number, tzOffsetMin: number): { sunrise: Date; sunset: Date; hours: PlanetaryHour[]; dayRuler: BodyId } | null {
  const obs = new A.Observer(lat, lon, 0);
  // yerel günün başlangıcı
  const localMidnight = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - tzOffsetMin * 60000);
  const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, localMidnight, 1);
  if (!rise) return null;
  const set = A.SearchRiseSet(A.Body.Sun, obs, -1, rise.date, 1);
  const nextRise = set ? A.SearchRiseSet(A.Body.Sun, obs, +1, set.date, 1) : null;
  if (!set || !nextRise) return null;
  const weekday = new Date(rise.date.getTime() + tzOffsetMin * 60000).getUTCDay();
  const dayRuler = DAY_RULER[weekday];
  let idx = CHALDEAN.indexOf(dayRuler);
  const hours: PlanetaryHour[] = [];
  const dLen = (set.date.getTime() - rise.date.getTime()) / 12, nLen = (nextRise.date.getTime() - set.date.getTime()) / 12;
  for (let i = 0; i < 24; i++) {
    const day = i < 12;
    const start = day ? rise.date.getTime() + i * dLen : set.date.getTime() + (i - 12) * nLen;
    hours.push({ ruler: CHALDEAN[idx % 7], start: new Date(start), end: new Date(start + (day ? dLen : nLen)), day });
    idx++;
  }
  return { sunrise: rise.date, sunset: set.date, hours, dayRuler };
}

// ---------------- Ay takvimi ----------------
export interface Lunation { date: Date; kind: 'new' | 'firstQuarter' | 'full' | 'lastQuarter'; lon: number }
export function lunations(from: Date, to: Date): Lunation[] {
  const out: Lunation[] = [];
  let t = A.MakeTime(from);
  for (let k = 0; k < 40; k++) {
    const q = A.SearchMoonQuarter(t);
    if (!q || q.time.date > to) break;
    out.push({ date: q.time.date, kind: (['new', 'firstQuarter', 'full', 'lastQuarter'] as const)[q.quarter], lon: bodyLon('moon', q.time.date) });
    t = q.time.AddDays(1);
  }
  return out;
}
/** Ay'ın boşta olduğu aralıklar: son majör açıdan burç değişimine kadar */
export function moonSignIngresses(from: Date, to: Date): { date: Date; sign: number }[] {
  const out: { date: Date; sign: number }[] = [];
  let prev = Math.floor(bodyLon('moon', from) / 30);
  for (let t = from.getTime() + 0.1 * DAY; t <= to.getTime(); t += 0.1 * DAY) {
    const s = Math.floor(bodyLon('moon', new Date(t)) / 30);
    if (s !== prev) {
      let lo = t - 0.1 * DAY, hi = t;
      for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (Math.floor(bodyLon('moon', new Date(m)) / 30) === prev) lo = m; else hi = m; }
      out.push({ date: new Date(hi), sign: s });
      prev = s;
    }
  }
  return out;
}

// ---------------- Aylık transitler ----------------
export interface TransitEvent { date: Date; transit: BodyId; natal: BodyId | 'asc' | 'mc'; type: AspectType; retro: boolean }
export interface StationEvent { date: Date; body: BodyId; kind: 'retro' | 'direct' }
export interface IngressEvent { date: Date; body: BodyId; sign: number }
const T_BODIES: BodyId[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const MAJOR = ASPECTS.filter(a => a.type !== 'quincunx');

function exactCrossing(id: BodyId, target: number, t0: number, t1: number): Date {
  let lo = t0, hi = t1;
  const f = (t: number) => signedDiff(bodyLon(id, new Date(t)), target);
  const s0 = Math.sign(f(lo));
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === s0) lo = m; else hi = m; }
  return new Date((lo + hi) / 2);
}

/** Bir aralıkta transit gezegenlerin natal noktalara tam açıları, istasyonları ve burç geçişleri */
export function transitsBetween(natal: Chart, from: Date, to: Date, bodies: BodyId[] = T_BODIES, withMoon = false) {
  const tb = withMoon ? ['moon' as BodyId, ...bodies] : bodies;
  const targets: { id: BodyId | 'asc' | 'mc'; lon: number }[] = [...PLANETS, 'node' as BodyId].map(p => ({ id: p, lon: natal.positions[p].lon + natal.ayanamsa }));
  if (natal.asc !== null) targets.push({ id: 'asc', lon: natal.asc + natal.ayanamsa }, { id: 'mc', lon: natal.mc! + natal.ayanamsa });
  const events: TransitEvent[] = [], stations: StationEvent[] = [], ingresses: IngressEvent[] = [];
  for (const b of tb) {
    const step = (b === 'moon' ? 0.25 : 1) * DAY;
    let tPrev = from.getTime(), lPrev = bodyLon(b, from);
    let vPrev = signedDiff(bodyLon(b, new Date(tPrev + DAY / 2)), bodyLon(b, new Date(tPrev - DAY / 2)));
    for (let t = tPrev + step; t <= to.getTime() + 1; t += step) {
      const l = bodyLon(b, new Date(t));
      const v = signedDiff(bodyLon(b, new Date(t + DAY / 2)), bodyLon(b, new Date(t - DAY / 2)));
      if (b !== 'sun' && b !== 'moon' && Math.sign(v) !== Math.sign(vPrev)) stations.push({ date: new Date(t), body: b, kind: v < 0 ? 'retro' : 'direct' });
      if (Math.floor(l / 30) !== Math.floor(lPrev / 30)) ingresses.push({ date: exactCrossing(b, Math.floor((signedDiff(l, lPrev) > 0 ? l : lPrev) / 30) * 30, tPrev, t), body: b, sign: Math.floor(l / 30) });
      for (const tg of targets) for (const asp of MAJOR) for (const sgn of asp.angle === 0 || asp.angle === 180 ? [1] : [1, -1]) {
        const aim = norm(tg.lon + sgn * asp.angle);
        const p = signedDiff(lPrev, aim), q = signedDiff(l, aim);
        if (Math.abs(p) < 20 && Math.abs(q) < 20 && (p === 0 || Math.sign(p) !== Math.sign(q))) {
          events.push({ date: exactCrossing(b, aim, tPrev, t), transit: b, natal: tg.id, type: asp.type, retro: v < 0 });
        }
      }
      tPrev = t; lPrev = l; vPrev = v;
    }
  }
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  stations.sort((a, b) => a.date.getTime() - b.date.getTime());
  ingresses.sort((a, b) => a.date.getTime() - b.date.getTime());
  // sidereal: burç geçişleri ayanamsa ile kayar
  if (natal.ayanamsa) for (const ig of ingresses) ig.sign = Math.floor(norm(bodyLon(ig.body, ig.date) - natal.ayanamsa + 0.0001) / 30);
  return { events, stations, ingresses };
}

// ---------------- Bulucu ----------------
export interface FinderQuery { body: BodyId; mode: 'aspect' | 'sign'; target?: BodyId | 'asc' | 'mc'; aspect?: AspectType | 'any'; sign?: number }
export function finder(natal: Chart, q: FinderQuery, from: Date, years: number): { date: Date; text: string; retro: boolean; aspect?: AspectType; sign?: number }[] {
  const to = new Date(from.getTime() + years * 365.25 * DAY);
  if (q.mode === 'sign') {
    const { ingresses } = transitsBetween(natal, from, to, [q.body]);
    return ingresses.filter(i => q.sign === undefined || i.sign === q.sign).map(i => ({ date: i.date, text: '', retro: false, sign: i.sign }));
  }
  const { events } = transitsBetween(natal, from, to, [q.body]);
  return events.filter(e => (!q.target || e.natal === q.target) && (!q.aspect || q.aspect === 'any' || e.type === q.aspect)).map(e => ({ date: e.date, text: String(e.natal), retro: e.retro, aspect: e.type }));
}

// ---------------- Kartografi (astrokartografi) ----------------
export type AngleLine = 'MC' | 'IC' | 'ASC' | 'DSC';
export interface LineHit { body: BodyId; line: AngleLine; city: string; country: string; distKm: number }
/** Doğum anında bir gezegenin belirli bir enlemdeki çizgi boylamı (ASC/DSC) ya da sabit boylamı (MC/IC) */
export function lineLongitudes(natal: Chart, body: BodyId): { mc: number; ic: number; ascAt: (lat: number) => number | null; dscAt: (lat: number) => number | null } {
  const t = A.MakeTime(natal.utc);
  const gast = A.SiderealTime(t) * 15;
  const p = natal.positions[body];
  const tl = p.lon + natal.ayanamsa;
  const ra = norm(Math.atan2(sind(tl) * cosd(natal.eps) - tand(p.lat) * sind(natal.eps), cosd(tl)) * R2D);
  const dec = decOf(tl, p.lat, natal.eps);
  const wrap = (x: number) => { x = norm(x); return x > 180 ? x - 360 : x; };
  const mc = wrap(ra - gast);
  const H = (lat: number) => { const x = -tand(lat) * tand(dec); return Math.abs(x) > 1 ? null : Math.acos(x) * R2D; };
  return { mc, ic: wrap(mc + 180), ascAt: lat => { const h = H(lat); return h === null ? null : wrap(mc - h); }, dscAt: lat => { const h = H(lat); return h === null ? null : wrap(mc + h); } };
}
export function cartography(natal: Chart, cities: { name: string; country: string; lat: number; lon: number; pop: number }[], bodies: BodyId[], maxKm = 700): LineHit[] {
  const out: LineHit[] = [];
  for (const b of bodies) {
    const L = lineLongitudes(natal, b);
    for (const c of cities) {
      const kmPerDeg = 111.32 * Math.cos(c.lat * D2R);
      const cand: [AngleLine, number | null][] = [['MC', L.mc], ['IC', L.ic], ['ASC', L.ascAt(c.lat)], ['DSC', L.dscAt(c.lat)]];
      for (const [line, lonL] of cand) {
        if (lonL === null) continue;
        const dLon = Math.abs(signedDiff(c.lon, lonL));
        const km = dLon * kmPerDeg;
        if (km <= maxKm) out.push({ body: b, line, city: c.name, country: c.country, distKm: Math.round(km) });
      }
    }
  }
  return out.sort((a, b) => a.distKm - b.distKm);
}

export { findAspects, PLANETS, ASTEROIDS, mcFrom };

// ---------------- Boşlukta Ay (void of course) ----------------
/** Ay'ın burç değiştirmeden önceki son majör açısından burca girişine kadar geçen süre */
export function voidOfCourse(from: Date): { start: Date; end: Date; sign: number } | null {
  const ing = moonSignIngresses(new Date(from.getTime() - 3 * DAY), new Date(from.getTime() + 3.5 * DAY));
  const PL: BodyId[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const ASP = [0, 60, 90, 120, 180];
  const lastAspect = (end: Date): Date => {
    const step = 10 * 60000;
    const f = (t: number) => {
      const m = bodyLon('moon', new Date(t));
      return PL.map(p => { const d = angleDiff(m, bodyLon(p, new Date(t))); return ASP.map(a => d - a); });
    };
    let prev = f(end.getTime());
    for (let t = end.getTime() - step; t > end.getTime() - 2.6 * DAY; t -= step) {
      const cur = f(t);
      for (let i = 0; i < PL.length; i++) for (let j = 0; j < ASP.length; j++) {
        if (Math.sign(cur[i][j]) !== Math.sign(prev[i][j]) && Math.abs(cur[i][j]) < 3) {
          let lo = t, hi = t + step;
          const g = (x: number) => angleDiff(bodyLon('moon', new Date(x)), bodyLon(PL[i], new Date(x))) - ASP[j];
          const sLo = Math.sign(g(lo));
          for (let k = 0; k < 14; k++) { const mid = (lo + hi) / 2; if (Math.sign(g(mid)) === sLo) lo = mid; else hi = mid; }
          return new Date(hi);
        }
      }
      prev = cur;
    }
    return new Date(end.getTime() - 2.6 * DAY);
  };
  for (const x of ing) {
    if (x.date < from) continue;
    const start = lastAspect(x.date);
    return { start, end: x.date, sign: x.sign };
  }
  return null;
}
