import * as A from 'astronomy-engine';
import type { BodyId, Chart, AspectType } from '../engine/astro';
import { PLANETS, positionsAt, angleDiff, ASPECTS, norm, moonPhase } from '../engine/astro';
import { L, SIGNS, BODIES, ASPECT_INFO, HOUSES, MOON_PHASES } from './base';
import { houseOf } from '../engine/astro';
import { ord } from './life';

const l = (tr: string, en: string): L => ({ tr, en });

export const TRANSIT_THEME: Record<string, L> = {
  lilith: l('bastırılan istekler ve isyan', 'suppressed wishes and rebellion'),
  sun: l('odak ve canlılık', 'focus and vitality'),
  moon: l('ruh hali ve duygular', 'mood and emotions'),
  mercury: l('iletişim, mesajlar ve kararlar', 'communication, messages and decisions'),
  venus: l('aşk, keyif, para ve güzellik', 'love, pleasure, money and beauty'),
  mars: l('enerji, cesaret ve gerilim', 'energy, courage and tension'),
  jupiter: l('şans, büyüme ve fırsatlar', 'luck, growth and opportunity'),
  saturn: l('sorumluluk, sınırlar ve kalıcı yapılar', 'responsibility, limits and lasting structure'),
  uranus: l('sürprizler ve ani değişimler', 'surprises and sudden change'),
  neptune: l('ilham, hayal ve belirsizlik', 'inspiration, dreams and fog'),
  pluto: l('derin dönüşüm ve güç', 'deep transformation and power'),
};

const NATURE_PHRASE: Record<string, L> = {
  harmonious: l('akıcı ve destekleyici', 'flowing and supportive'),
  challenging: l('gerilimli ama harekete geçirici', 'tense but motivating'),
  fusion: l('yoğun ve ön planda', 'intense and spotlighted'),
  adjust: l('ince ayar istiyor', 'asking for adjustment'),
};

export const MOON_SIGN_DAY: L[] = [
  l('Ay Koç’ta: Sabırsızlık artabilir; hızlı başlangıçlar ve spor için ideal.', 'Moon in Aries: impatience rises; great for quick starts and exercise.'),
  l('Ay Boğa’da: Konfor, güzel yemek ve kendine bakım günü.', 'Moon in Taurus: a day for comfort, good food and self-care.'),
  l('Ay İkizler’de: Sohbetler, mesajlar ve kısa planlar hareketli.', 'Moon in Gemini: chats, messages and quick plans buzz.'),
  l('Ay Yengeç’te: Duygular yüzeyde; evde ve sevdiklerinle vakit geçir.', 'Moon in Cancer: feelings on the surface; stay close to home and loved ones.'),
  l('Ay Aslan’da: Görünür olmak ve eğlenmek isteyeceksin; yaratıcılık yüksek.', 'Moon in Leo: you’ll want to be seen and have fun; creativity is high.'),
  l('Ay Başak’ta: Düzenleme, temizlik ve detay işleri için verimli.', 'Moon in Virgo: productive for organising, cleaning and detail work.'),
  l('Ay Terazi’de: İlişkiler ve estetik ön planda; uzlaşma kolay.', 'Moon in Libra: relationships and beauty in focus; compromise is easy.'),
  l('Ay Akrep’te: Duygular derin; sezgilerine güven, sırlar gün yüzüne çıkabilir.', 'Moon in Scorpio: deep emotions; trust your gut, secrets may surface.'),
  l('Ay Yay’da: İyimserlik ve macera isteği; öğrenmek ve gezmek iyi gelir.', 'Moon in Sagittarius: optimism and wanderlust; learning and travel feel good.'),
  l('Ay Oğlak’ta: Hedeflere odaklan; ciddi işler için güçlü bir gün.', 'Moon in Capricorn: focus on goals; strong day for serious work.'),
  l('Ay Kova’da: Arkadaşlar, topluluk ve yeni fikirler; özgürlük ihtiyacı.', 'Moon in Aquarius: friends, community and new ideas; need for freedom.'),
  l('Ay Balık’ta: Hayal gücü ve empati yüksek; dinlenmeye ve sanata zaman ayır.', 'Moon in Pisces: imagination and empathy high; make time for rest and art.'),
];

export interface TransitHit { transit: BodyId; natal: BodyId | 'asc' | 'mc'; type: AspectType; orb: number; text: L; nature: string }

export interface Daily {
  date: Date;
  moonSign: number; moonHouse: number;
  phase: { idx: number; illum: number; name: L };
  retrogrades: BodyId[];
  hits: TransitHit[];
  scores: { love: number; career: number; energy: number; mood: number };
}

const NATAL_POINT_NAME = (p: BodyId | 'asc' | 'mc'): L =>
  p === 'asc' ? l('Yükselen', 'your Ascendant') : p === 'mc' ? l('MC (kariyer noktan)', 'your Midheaven') : l(`natal ${BODIES[p].name.tr}`, `natal ${BODIES[p].name.en}`);

const ORB: Record<string, number> = { lilith: 1.5, moon: 2.5, sun: 1.5, mercury: 1.5, venus: 1.5, mars: 1.5, jupiter: 1.2, saturn: 1.2, uranus: 1, neptune: 1, pluto: 1 };

export function computeDaily(ch: Chart, date = new Date()): Daily {
  const now = positionsAt(date, [...PLANETS, 'lilith']);
  const natal: { id: BodyId | 'asc' | 'mc'; lon: number }[] = PLANETS.map(p => ({ id: p, lon: ch.positions[p].lon }));
  if (ch.asc !== null) natal.push({ id: 'asc', lon: ch.asc });
  if (ch.mc !== null) natal.push({ id: 'mc', lon: ch.mc });
  if (ch.positions.lilith) natal.push({ id: 'lilith', lon: ch.positions.lilith.lon });
  const hits: TransitHit[] = [];
  for (const tp of [...PLANETS, 'lilith'] as BodyId[]) {
    for (const n of natal) {
      if (tp === n.id) continue;
      const d = angleDiff(now[tp].lon, n.lon);
      for (const a of ASPECTS) {
        if (a.type === 'quincunx') continue;
        if ((tp === 'lilith' || n.id === 'lilith') && a.type !== 'conjunction' && a.type !== 'opposition') continue;
        const orb = Math.abs(d - a.angle);
        if (orb <= ORB[tp]) {
          const info = ASPECT_INFO[a.type];
          const nn = NATAL_POINT_NAME(n.id);
          hits.push({
            transit: tp, natal: n.id, type: a.type, orb, nature: info.nature,
            text: {
              tr: `Transit ${BODIES[tp].name.tr} → ${nn.tr} (${info.name.tr.toLocaleLowerCase('tr')}): ${TRANSIT_THEME[tp].tr} konuları devrede; enerji ${NATURE_PHRASE[info.nature].tr}.`,
              en: `Transit ${BODIES[tp].name.en} → ${nn.en} (${info.name.en.toLowerCase()}): themes of ${TRANSIT_THEME[tp].en} are active; the energy is ${NATURE_PHRASE[info.nature].en}.`,
            },
          });
        }
      }
    }
  }
  hits.sort((a, b) => weight(b.transit) - weight(a.transit) || a.orb - b.orb);

  const score = (targets: (BodyId | 'asc' | 'mc')[], movers?: BodyId[]) => {
    let s = 0;
    for (const h of hits) {
      if (!targets.includes(h.natal) && !(movers && movers.includes(h.transit))) continue;
      const w = (h.transit === 'moon' ? 0.6 : 1) * (1 - h.orb / 3);
      s += h.nature === 'harmonious' ? w : h.nature === 'challenging' ? -0.8 * w : h.nature === 'fusion' ? (['saturn', 'pluto'].includes(h.transit) ? -0.3 : 0.7) * w : 0;
    }
    return Math.max(1, Math.min(5, Math.round(3 + s * 1.2)));
  };
  const mp = moonPhase(date);
  const moonSign = Math.floor(now.moon.lon / 30);
  return {
    date, moonSign,
    moonHouse: houseOf(now.moon.lon, ch.cusps),
    phase: { idx: mp.idx, illum: mp.illum, name: MOON_PHASES[mp.idx] },
    retrogrades: PLANETS.filter(p => now[p].retro),
    hits,
    scores: {
      love: score(['venus', 'moon', 'mars'], ['venus']),
      career: score(['mc', 'sun', 'saturn', 'jupiter'], ['jupiter', 'saturn']),
      energy: score(['mars', 'sun', 'asc'], ['mars']),
      mood: score(['moon', 'venus', 'asc'], ['moon']),
    },
  };
}

function weight(p: BodyId) { return ({ lilith: 5.5, pluto: 10, neptune: 9, uranus: 8, saturn: 7, jupiter: 6, mars: 5, sun: 4, venus: 3, mercury: 2, moon: 1 } as any)[p] || 0; }

export const MOON_HOUSE_DAY = (h: number): L => h ? l(`Ay bugün senin ${h}. evinde: odak ${HOUSES[h - 1].short.tr.toLocaleLowerCase('tr')} konularında.`, `The Moon is in your ${ord(h)} house: focus on ${HOUSES[h - 1].short.en.toLowerCase()}.`) : l('', '');

// ---------------- Gökyüzü takvimi ----------------
export interface SkyEvent { date: Date; text: L; kind: 'ingress' | 'station' | 'lunation' }

export function skyCalendar(start = new Date(), days = 45): SkyEvent[] {
  const ev: SkyEvent[] = [];
  const ids: BodyId[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  let prev = positionsAt(start, ids);
  for (let i = 1; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const cur = positionsAt(d, ids);
    for (const p of ids) {
      const s0 = Math.floor(prev[p].lon / 30), s1 = Math.floor(cur[p].lon / 30);
      if (s0 !== s1) ev.push({ date: d, kind: 'ingress', text: { tr: `${BODIES[p].name.tr} ${SIGNS[s1].tr} burcuna geçiyor`, en: `${BODIES[p].name.en} enters ${SIGNS[s1].en}` } });
      if (prev[p].retro !== cur[p].retro) ev.push({ date: d, kind: 'station', text: cur[p].retro ? { tr: `${BODIES[p].name.tr} retroya başlıyor (${SIGNS[s1].tr})`, en: `${BODIES[p].name.en} stations retrograde (${SIGNS[s1].en})` } : { tr: `${BODIES[p].name.tr} düz harekete geçiyor (${SIGNS[s1].tr})`, en: `${BODIES[p].name.en} stations direct (${SIGNS[s1].en})` } });
    }
    prev = cur;
  }
  for (const [ang, name] of [[0, l('Yeni Ay', 'New Moon')], [180, l('Dolunay', 'Full Moon')]] as [number, L][]) {
    let t = A.MakeTime(start);
    for (let k = 0; k < 3; k++) {
      const f = A.SearchMoonPhase(ang, t, days);
      if (!f || f.date.getTime() > start.getTime() + days * 86400000) break;
      const ml = positionsAt(f.date, ['moon']).moon.lon;
      ev.push({ date: f.date, kind: 'lunation', text: { tr: `${name.tr} — ${SIGNS[Math.floor(ml / 30)].tr} ${Math.floor(ml % 30)}°`, en: `${name.en} — ${Math.floor(ml % 30)}° ${SIGNS[Math.floor(ml / 30)].en}` } });
      t = f.AddDays(5);
    }
  }
  return ev.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ---------------- Sinastri (uyum) ----------------
export interface Synastry {
  total: number;
  parts: { key: 'attraction' | 'emotional' | 'communication' | 'longterm'; score: number }[];
  aspects: { a: BodyId | 'asc'; b: BodyId | 'asc'; type: AspectType; orb: number; text: L }[];
}

const SYN_IDS: (BodyId | 'asc')[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc'];
const CAT: Record<string, ('attraction' | 'emotional' | 'communication' | 'longterm')[]> = {
  'venus-mars': ['attraction'], 'mars-venus': ['attraction'], 'sun-moon': ['emotional', 'longterm'], 'moon-sun': ['emotional', 'longterm'],
  'moon-moon': ['emotional'], 'moon-venus': ['emotional'], 'venus-moon': ['emotional'], 'venus-venus': ['attraction', 'emotional'],
  'mars-mars': ['attraction'], 'sun-venus': ['attraction'], 'venus-sun': ['attraction'], 'mercury-mercury': ['communication'],
  'sun-mercury': ['communication'], 'mercury-sun': ['communication'], 'mercury-moon': ['communication', 'emotional'], 'moon-mercury': ['communication', 'emotional'],
  'saturn-sun': ['longterm'], 'sun-saturn': ['longterm'], 'saturn-moon': ['longterm'], 'moon-saturn': ['longterm'], 'saturn-venus': ['longterm'], 'venus-saturn': ['longterm'],
  'jupiter-sun': ['longterm'], 'sun-jupiter': ['longterm'], 'jupiter-venus': ['attraction', 'longterm'], 'venus-jupiter': ['attraction', 'longterm'],
  'sun-sun': ['longterm'], 'asc-venus': ['attraction'], 'venus-asc': ['attraction'], 'asc-mars': ['attraction'], 'mars-asc': ['attraction'],
  'asc-sun': ['emotional'], 'sun-asc': ['emotional'], 'asc-moon': ['emotional'], 'moon-asc': ['emotional'], 'mercury-asc': ['communication'], 'asc-mercury': ['communication'],
};

const lonOf = (ch: Chart, id: BodyId | 'asc') => (id === 'asc' ? ch.asc : ch.positions[id].lon);
const nm = (id: BodyId | 'asc'): L => (id === 'asc' ? l('Yükselen', 'Ascendant') : BODIES[id].name);

export function synastry(a: Chart, b: Chart): Synastry {
  const parts = { attraction: 0, emotional: 0, communication: 0, longterm: 0 };
  const count = { attraction: 0, emotional: 0, communication: 0, longterm: 0 };
  const aspects: Synastry['aspects'] = [];
  for (const x of SYN_IDS) for (const y of SYN_IDS) {
    const lx = lonOf(a, x), ly = lonOf(b, y);
    if (lx === null || ly === null) continue;
    const d = angleDiff(lx, ly);
    for (const asp of ASPECTS) {
      if (asp.type === 'quincunx') continue;
      const orbMax = asp.type === 'sextile' ? 4 : 6;
      const orb = Math.abs(d - asp.angle);
      if (orb > orbMax) continue;
      const nature = ASPECT_INFO[asp.type].nature;
      const cats = CAT[`${x}-${y}`];
      const w = 1 - orb / (orbMax + 1);
      if (cats) for (const c of cats) {
        let v = nature === 'harmonious' ? 1 : nature === 'fusion' ? (x === 'saturn' || y === 'saturn' ? 0.4 : 1) : -0.6;
        if (c === 'attraction' && nature === 'challenging') v = 0.5; // gerilimli açılar çekimi artırır
        if (c === 'longterm' && (x === 'saturn' || y === 'saturn') && nature !== 'challenging') v = 1; // Satürn bağlılık
        parts[c] += v * w; count[c] += 1;
      }
      aspects.push({ a: x, b: y, type: asp.type, orb, text: {
        tr: `Senin ${nm(x).tr} ↔ onun ${nm(y).tr} (${ASPECT_INFO[asp.type].name.tr.toLocaleLowerCase('tr')}): ${ASPECT_INFO[asp.type].desc.tr}.`,
        en: `Your ${nm(x).en} ${ASPECT_INFO[asp.type].name.en.toLowerCase()} their ${nm(y).en}: ${ASPECT_INFO[asp.type].desc.en}.`,
      } });
      break;
    }
  }
  const pct = (k: keyof typeof parts) => Math.round(Math.max(15, Math.min(98, 55 + parts[k] * 9)));
  const p = (['attraction', 'emotional', 'communication', 'longterm'] as const).map(k => ({ key: k, score: pct(k) }));
  // Güneş burcu element uyumu küçük bir katkı
  const ea = a.positions.sun.sign % 4, eb = b.positions.sun.sign % 4;
  const elemBonus = ea === eb ? 4 : (ea + eb === 2 || ea + eb === 4 ? 2 : 0) /* ateş-hava (0,2), toprak-su (1,3) */;
  const total = Math.round(p.reduce((s, x) => s + x.score, 0) / 4 + elemBonus);
  aspects.sort((m, n) => m.orb - n.orb);
  return { total: Math.min(99, total), parts: p, aspects };
}

export const SYN_LABEL: Record<string, L> = {
  attraction: l('Çekim & tutku', 'Attraction & passion'),
  emotional: l('Duygusal bağ', 'Emotional bond'),
  communication: l('İletişim', 'Communication'),
  longterm: l('Uzun vadeli potansiyel', 'Long-term potential'),
};

export { norm };
