// Doğum saati düzeltme: kullanıcının hayat olaylarına göre aday saatleri puanlar.
// Doğum saatine en çok bağlı olan şey köşelerdir (Yükselen, MC, Alçalan, IC). Her aday saat için
// olay tarihlerindeki yavaş gezegen transitleri, solar arc direksiyonları, ilerletilmiş Ay ve
// tutulmaların ilgili köşelere ne kadar yakın düştüğü toplanır; en yüksek puanlı saatler önerilir.
import * as A from 'astronomy-engine';
import type { BirthInput, BodyId, Chart, ChartOptions } from './astro';
import { angleDiff, bodyLon, computeChart, norm, PLANETS } from './astro';

export type EventType = 'love' | 'breakup' | 'career' | 'move' | 'child' | 'loss' | 'health';
export interface LifeEvent { date: string; type: EventType } // date: GG.AA.YYYY
type Ang = 'asc' | 'mc' | 'dsc' | 'ic';
const TARGET: Record<EventType, Partial<Record<Ang, number>>> = {
  love: { dsc: 1, asc: 0.6 }, breakup: { dsc: 1, asc: 0.6 }, career: { mc: 1, asc: 0.5 }, move: { ic: 1, asc: 0.5 },
  child: { ic: 0.8, asc: 0.8 }, loss: { ic: 0.8, asc: 0.8 }, health: { asc: 1, dsc: 0.4 },
};
const TW: Partial<Record<BodyId, number>> = { pluto: 1, uranus: 1, saturn: 1, neptune: 0.8, jupiter: 0.7, node: 0.6 };
const YEAR = 365.2422 * 864e5, DAY = 864e5;
const hardOrb = (a: number, b: number) => Math.min(...[0, 90, 180].map(x => Math.abs(angleDiff(a, b) - x)));
const conjOppOrb = (a: number, b: number) => Math.min(Math.abs(angleDiff(a, b)), Math.abs(angleDiff(a, b) - 180));

export const parseDate = (s: string): Date | null => {
  const m = s.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!m) return null;
  const d = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], 12));
  return d.getUTCMonth() === +m[2] - 1 ? d : null;
};

export interface Candidate { hour: number; minute: number; score: number; asc: number; mc: number; hits: { event: number; text: string }[] }

interface EvData { t: Date; type: EventType; transits: [BodyId, number][]; arc: number; pMoon: number; ecl: number[] }
function eventData(base: Chart, ev: LifeEvent): EvData | null {
  const t = parseDate(ev.date);
  if (!t || t <= base.utc) return null;
  const ay = base.ayanamsa;
  const transits = (['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'] as BodyId[]).map(b => [b, norm(bodyLon(b, t) - ay)] as [BodyId, number]);
  const age = (t.getTime() - base.utc.getTime()) / YEAR;
  const pd = new Date(base.utc.getTime() + age * DAY);
  const pSun = norm(bodyLon('sun', pd) - ay), pMoon = norm(bodyLon('moon', pd) - ay);
  const arc = norm(pSun - base.positions.sun.lon);
  const ecl: number[] = [];
  try {
    let s = A.SearchGlobalSolarEclipse(new Date(t.getTime() - 70 * DAY));
    while (s.peak.date.getTime() < t.getTime() + 20 * DAY) { ecl.push(norm(bodyLon('sun', s.peak.date) - ay)); s = A.NextGlobalSolarEclipse(s.peak); }
    let l = A.SearchLunarEclipse(new Date(t.getTime() - 70 * DAY));
    while (l.peak.date.getTime() < t.getTime() + 20 * DAY) { if (l.kind !== 'penumbral') ecl.push(norm(bodyLon('moon', l.peak.date) - ay)); l = A.NextLunarEclipse(l.peak); }
  } catch { /* tutulma katmanı atlanır */ }
  return { t, type: ev.type, transits, arc, pMoon, ecl };
}

const ANG_TR: Record<Ang, string> = { asc: 'Yükselen', mc: 'kariyer (MC)', dsc: 'partner (Alçalan)', ic: 'yuva (IC)' };
const ANG_EN: Record<Ang, string> = { asc: 'Ascendant', mc: 'MC', dsc: 'Descendant', ic: 'IC' };
const PN_TR: Partial<Record<BodyId, string>> = { sun: 'Güneş', moon: 'Ay', mercury: 'Merkür', venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter', saturn: 'Satürn', uranus: 'Uranüs', neptune: 'Neptün', pluto: 'Plüton', node: 'Ay Düğümü' };
const PN_EN: Partial<Record<BodyId, string>> = { sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars', jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto', node: 'Node' };

function scoreAt(asc: number, mc: number, base: Chart, evs: EvData[], lang: 'tr' | 'en') {
  const angles: Record<Ang, number> = { asc, mc, dsc: norm(asc + 180), ic: norm(mc + 180) };
  const AN = lang === 'tr' ? ANG_TR : ANG_EN, PN = lang === 'tr' ? PN_TR : PN_EN;
  let total = 0; const hits: { event: number; text: string }[] = [];
  evs.forEach((e, ei) => {
    for (const [ak, w] of Object.entries(TARGET[e.type]) as [Ang, number][]) {
      const A_ = angles[ak];
      for (const [b, lon] of e.transits) {
        const orb = b === 'node' ? Math.abs(angleDiff(lon, A_)) : hardOrb(lon, A_);
        if (orb <= 2) { const v = w * (1 - orb / 2) * (TW[b] ?? 0.5); total += v; if (v > 0.3) hits.push({ event: ei, text: lang === 'tr' ? `${PN[b]} geçişi ${AN[ak]} noktasında` : `transit ${PN[b]} on the ${AN[ak]}` }); }
      }
      for (const p of PLANETS) {
        const pl = base.positions[p].lon;
        const o1 = hardOrb(norm(pl + e.arc), A_), o2 = hardOrb(norm(A_ + e.arc), pl);
        if (o1 <= 1) { const v = w * (1 - o1) * 1.2; total += v; if (v > 0.4) hits.push({ event: ei, text: lang === 'tr' ? `ilerletilmiş ${PN[p]}, ${AN[ak]} noktasına ulaşıyor` : `solar arc ${PN[p]} reaches the ${AN[ak]}` }); }
        if (o2 <= 1) { const v = w * (1 - o2) * 1.2; total += v; if (v > 0.4) hits.push({ event: ei, text: lang === 'tr' ? `ilerletilmiş ${AN[ak]} noktası, ${PN[p]} üzerine geliyor` : `solar arc ${AN[ak]} reaches ${PN[p]}` }); }
      }
      const pm = conjOppOrb(e.pMoon, A_);
      if (pm <= 1.5) { total += w * (1 - pm / 1.5) * 0.8; hits.push({ event: ei, text: lang === 'tr' ? `ilerletilmiş Ay ${AN[ak]} noktasında` : `progressed Moon on the ${AN[ak]}` }); }
      for (const el of e.ecl) if (conjOppOrb(el, A_) <= 3) { total += w * 0.7; hits.push({ event: ei, text: lang === 'tr' ? `tutulma ${AN[ak]} eksenine düşüyor` : `an eclipse on the ${AN[ak]} axis` }); }
    }
  });
  return { total, hits };
}

/** Adımlar arasında ekrana nefes aldırmak için parça parça hesaplar */
export async function rectify(birth: BirthInput, events: LifeEvent[], opts: ChartOptions, lang: 'tr' | 'en', onProgress?: (p: number) => void): Promise<{ list: Candidate[]; used: number }> {
  const base = computeChart({ ...birth, hour: birth.timeKnown ? birth.hour : 12, minute: birth.timeKnown ? birth.minute : 0, timeKnown: true }, opts);
  const evs = events.map(e => eventData(base, e)).filter(Boolean) as EvData[];
  const center = birth.timeKnown ? birth.hour * 60 + birth.minute : 12 * 60;
  const span = birth.timeKnown ? 120 : 720, step = birth.timeKnown ? 2 : 4;
  const mins: number[] = [];
  for (let m = center - span; m < center + span; m += step) if (m >= 0 && m < 1440) mins.push(m);
  const out: Candidate[] = [];
  for (let i = 0; i < mins.length; i++) {
    const m = mins[i];
    const c = computeChart({ ...birth, hour: Math.floor(m / 60), minute: m % 60, timeKnown: true }, opts);
    if (c.asc === null || c.mc === null) continue;
    const { total, hits } = scoreAt(c.asc, c.mc, base, evs, lang);
    out.push({ hour: Math.floor(m / 60), minute: m % 60, score: total, asc: c.asc, mc: c.mc, hits });
    if (i % 30 === 29) { onProgress?.(i / mins.length); await new Promise(r => setTimeout(r, 0)); }
  }
  // Birbirine 12 dakikadan yakın olmayan en iyi üç aday
  const sorted = [...out].sort((a, b) => b.score - a.score);
  const pick: Candidate[] = [];
  for (const c of sorted) { if (pick.every(p => Math.abs(p.hour * 60 + p.minute - (c.hour * 60 + c.minute)) >= 12)) pick.push(c); if (pick.length === 3) break; }
  return { list: pick, used: evs.length };
}
