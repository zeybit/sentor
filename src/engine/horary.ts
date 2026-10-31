// Horary (soru haritası) motoru — Lilly (Christian Astrology) ve Döşer (The Art of Horary Astrology) kurallarına göre.
// Ev sistemi: Regiomontanus. Gezegenler: geleneksel yedi gezegen.
import type { BodyId, Chart, AspectType } from './astro';
import { computeChart, bodyLon, angleDiff, norm, SIGN_RULERS } from './astro';

export const SEVEN: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const PTOLEMAIC: { type: AspectType; angle: number }[] = [
  { type: 'conjunction', angle: 0 }, { type: 'sextile', angle: 60 }, { type: 'square', angle: 90 },
  { type: 'trine', angle: 120 }, { type: 'opposition', angle: 180 },
];
const DAY = 86400000;

const EXALT: Partial<Record<BodyId, number>> = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 };
const DOMICILE: Partial<Record<BodyId, number[]>> = { sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7], jupiter: [8, 11], saturn: [9, 10] };

export interface Hit { a: BodyId; b: BodyId; type: AspectType; date: Date }

const wrap = (x: number) => { x = ((x + 180) % 360 + 360) % 360 - 180; return x; };
const TARGETS = PTOLEMAIC.flatMap(a => (a.angle === 0 || a.angle === 180 ? [{ ...a, t: a.angle }] : [{ ...a, t: a.angle }, { ...a, t: -a.angle }]));

/** a ile b arasındaki bir sonraki tam Batlamyus açısı (start'tan sonra, until'e kadar) */
export function nextAspect(a: BodyId, b: BodyId, start: Date, until: Date): Hit | null {
  const fast = a === 'moon' || b === 'moon';
  const step = (fast ? 0.05 : 0.25) * DAY;
  const elong = (t: number) => wrap(bodyLon(b, new Date(t)) - bodyLon(a, new Date(t)));
  let prevE = elong(start.getTime());
  for (let t = start.getTime() + step; t <= until.getTime() + step / 2; t += step) {
    const e = elong(t);
    for (const asp of TARGETS) {
      const p = wrap(prevE - asp.t), q = wrap(e - asp.t);
      if (Math.abs(p) < 10 && Math.abs(q) < 10 && (p === 0 || p * q < 0)) {
        let lo = t - step, hi = t;
        for (let k = 0; k < 30; k++) {
          const mid = (lo + hi) / 2;
          const m = wrap(elong(mid) - asp.t);
          if (m !== 0 && Math.sign(m) === Math.sign(p)) lo = mid; else hi = mid;
        }
        if (hi > until.getTime()) return null;
        return { a, b, type: asp.type, date: new Date(hi) };
      }
    }
    prevE = e;
  }
  return null;
}

/** Gezegenin bulunduğu burçtan çıkış anı (en fazla maxDays gün ileriye bakar) */
export function signExit(id: BodyId, start: Date, maxDays: number): Date {
  const s0 = Math.floor(bodyLon(id, start) / 30);
  const step = (id === 'moon' ? 0.1 : 1) * DAY;
  for (let t = start.getTime() + step; t <= start.getTime() + maxDays * DAY; t += step) {
    if (Math.floor(bodyLon(id, new Date(t)) / 30) !== s0) {
      let lo = t - step, hi = t;
      for (let k = 0; k < 25; k++) { const mid = (lo + hi) / 2; if (Math.floor(bodyLon(id, new Date(mid)) / 30) === s0) lo = mid; else hi = mid; }
      return new Date(hi);
    }
  }
  return new Date(start.getTime() + maxDays * DAY);
}

function speed(id: BodyId, date: Date) {
  let d = bodyLon(id, new Date(date.getTime() + DAY / 2)) - bodyLon(id, new Date(date.getTime() - DAY / 2));
  if (d > 180) d -= 360; if (d < -180) d += 360;
  return d;
}

/** Geleneksel esas güç puanı (ev 5, yücelim 4, zarar −5, düşüş −4) + ilineksel durumlar */
export function strength(ch: Chart, id: BodyId) {
  const p = ch.positions[id];
  let ess = 0;
  if (DOMICILE[id]?.includes(p.sign)) ess += 5;
  if (EXALT[id] === p.sign) ess += 4;
  if (DOMICILE[id]?.some(s => (s + 6) % 12 === p.sign)) ess -= 5;
  if (EXALT[id] !== undefined && (EXALT[id]! + 6) % 12 === p.sign) ess -= 4;
  const angular = [1, 4, 7, 10].includes(p.house);
  const cadent = [3, 6, 9, 12].includes(p.house);
  const sunDist = id === 'sun' ? 99 : angleDiff(p.lon, ch.positions.sun.lon);
  return { ess, angular, cadent, retro: p.retro, combust: sunDist < 8.5, underBeams: sunDist >= 8.5 && sunDist < 17, cazimi: sunDist < 0.29 };
}

function inReception(ch: Chart, a: BodyId, b: BodyId) {
  const sa = ch.positions[a].sign, sb = ch.positions[b].sign;
  const recA = DOMICILE[b]?.includes(sa) || EXALT[b] === sa; // a, b'nin evinde/yüceliminde → b a'yı kabul eder
  const recB = DOMICILE[a]?.includes(sb) || EXALT[a] === sb;
  return { mutual: !!(recA && recB), aReceivedByB: !!recA, bReceivedByA: !!recB };
}

export type Verdict = 'yes' | 'yesEffort' | 'yesRegret' | 'viaThird' | 'blocked' | 'notNow';

export interface HoraryResult {
  chart: Chart;
  house: number;
  querent: BodyId;
  quesited: BodyId;
  sameRuler: boolean;
  perfection: Hit | null;
  translation: { by: BodyId; date: Date; type: AspectType } | null;
  prohibition: Hit | null;
  refranation: BodyId | null;
  reception: ReturnType<typeof inReception>;
  moonNext: Hit[];
  moonVoid: boolean;
  moonViaCombusta: boolean;
  moonLate: boolean;
  ascEarly: boolean;
  ascLate: boolean;
  saturnAngular: number | null;
  qStrength: ReturnType<typeof strength>;
  sStrength: ReturnType<typeof strength>;
  verdict: Verdict;
  timing: { days: number; unit: 'days' | 'weeks' | 'months' | 'years'; amount: number } | null;
}

export function castHorary(date: Date, lat: number, lon: number, house: number): HoraryResult {
  const u = date;
  const chart = computeChart({
    year: u.getUTCFullYear(), month: u.getUTCMonth() + 1, day: u.getUTCDate(),
    hour: u.getUTCHours(), minute: u.getUTCMinutes(), timeKnown: true, lat, lon, tz: 'UTC',
  }, 'regiomontanus');
  const P = chart.positions;
  const ascSign = Math.floor(chart.asc! / 30);
  let querent = SIGN_RULERS[ascSign];
  const quesited = SIGN_RULERS[Math.floor(chart.cusps[house - 1] / 30)];
  const sameRuler = querent === quesited;
  // Aynı gezegen her iki tarafı yönetiyorsa Lilly'ye göre Ay soranın eş göstergesi olarak kullanılır
  if (sameRuler) querent = quesited === 'moon' ? 'sun' : 'moon';

  // Pencere: hızlı göstergenin burç çıkışı (en fazla 1 yıl)
  const faster = Math.abs(speed(querent, date)) >= Math.abs(speed(quesited, date)) ? querent : quesited;
  const exit = signExit(faster, date, 365);
  const perfection = nextAspect(querent, quesited, date, exit);

  // Geri dönme (refranation): uygulayan gezegen açı tamamlanmadan istasyon yapıyor mu?
  let refranation: BodyId | null = null;
  if (perfection) {
    // Yalnızca doğrudan hareketten geri harekete dönüş (istasyon) refranation sayılır
    for (const id of [querent, quesited]) {
      if (id === 'sun' || id === 'moon') continue;
      let prev = speed(id, date);
      for (let t = date.getTime() + DAY; t <= perfection.date.getTime(); t += DAY) {
        const v = speed(id, new Date(t));
        if (prev > 0 && v < 0) { refranation = id; break; }
        prev = v;
      }
    }
  }

  // Engelleme (prohibition): Mars veya Satürn, göstergelerden birine daha önce kavuşum/kare/karşıt yapıyor mu?
  let prohibition: Hit | null = null;
  if (perfection) {
    for (const mal of ['mars', 'saturn'] as BodyId[]) {
      if (mal === querent || mal === quesited) continue;
      for (const sig of [querent, quesited]) {
        const h = nextAspect(mal, sig, date, perfection.date);
        if (h && ['conjunction', 'square', 'opposition'].includes(h.type) && (!prohibition || h.date < prohibition.date)) prohibition = h;
      }
    }
  }

  // Ay'ın burcunu terk etmeden önceki açıları
  const moonExit = signExit('moon', date, 3);
  const moonNext: Hit[] = [];
  for (const p of SEVEN) {
    if (p === 'moon') continue;
    const h = nextAspect('moon', p, date, moonExit);
    if (h) moonNext.push(h);
  }
  moonNext.sort((x, y) => x.date.getTime() - y.date.getTime());
  const moonVoid = moonNext.length === 0;

  // Işık aktarımı: Ay (veya hızlı bir gezegen) birinden yeni ayrılıp diğerine uyguluyor mu?
  let translation: HoraryResult['translation'] = null;
  if (!perfection) {
    for (const by of ['moon', 'mercury', 'venus'] as BodyId[]) {
      if (by === querent || by === quesited) continue;
      const byExit = signExit(by, date, by === 'moon' ? 3 : 60);
      const past = new Date(date.getTime() - (by === 'moon' ? 1 : 6) * DAY);
      for (const [from, to] of [[querent, quesited], [quesited, querent]] as [BodyId, BodyId][]) {
        const sep = nextAspect(by, from, past, date);
        const app = nextAspect(by, to, date, byExit);
        if (sep && app) { translation = { by, date: app.date, type: app.type }; break; }
      }
      if (translation) break;
    }
  }

  const reception = inReception(chart, querent, quesited);
  const moonDeg = P.moon.lon;
  const ascDeg = chart.asc! % 30;
  const sat = P.saturn.house;

  let verdict: Verdict = 'notNow';
  if (perfection && !prohibition && !refranation) {
    verdict = perfection.type === 'square' ? 'yesEffort' : perfection.type === 'opposition' ? 'yesRegret' : 'yes';
    if ((perfection.type === 'square' || perfection.type === 'opposition') && reception.mutual) verdict = 'yesEffort';
  } else if (perfection && (prohibition || refranation)) verdict = 'blocked';
  else if (translation) verdict = 'viaThird';
  else if (reception.mutual) verdict = 'viaThird';

  // Zamanlama: gerçek gökyüzü tarihi + geleneksel sembolik ölçü
  let timing: HoraryResult['timing'] = null;
  const when = perfection?.date ?? translation?.date;
  if (when) {
    const days = (when.getTime() - date.getTime()) / DAY;
    const app = faster;
    const ps = P[app];
    const mod = ps.sign % 3; // 0 öncü, 1 sabit, 2 değişken
    const modScore = mod === 0 ? 0 : mod === 2 ? 1 : 2;
    const angScore = [1, 4, 7, 10].includes(ps.house) ? 0 : [2, 5, 8, 11].includes(ps.house) ? 1 : 2;
    const sc = modScore + angScore;
    const unit = sc <= 1 ? 'days' : sc === 2 ? 'weeks' : sc === 3 ? 'months' : 'years';
    const degs = Math.abs(speed(app, date)) * days;
    timing = { days, unit, amount: Math.max(1, Math.round(degs)) };
  }

  return {
    chart, house, querent, quesited, sameRuler, perfection, translation, prohibition, refranation, reception,
    moonNext, moonVoid,
    moonViaCombusta: moonDeg >= 195 && moonDeg <= 225,
    moonLate: moonDeg % 30 >= 27,
    ascEarly: ascDeg < 3, ascLate: ascDeg > 27,
    saturnAngular: [1, 4, 7, 10].includes(sat) ? sat : null,
    qStrength: strength(chart, querent), sStrength: strength(chart, quesited),
    verdict, timing,
  };
}

export { norm };
