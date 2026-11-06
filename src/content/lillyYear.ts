// Lilly, Christian Astrology III, Bölüm CLXVI–CLXVIII (profeksiyonlar) ve Güneş dönüşü (Revolution) uygulamaları.
// Lilly: profeksiyon yılı Güneş'in doğumdaki derecesine döndüğü anda başlar; yıl 13 eşit "profeksiyon ayına" bölünür.
// Lilly, profeksiyonun tek başına zayıf olduğunu, Güneş dönüşü ve transitlerle teyit edildiğinde güç kazandığını söyler.
import type { Chart } from '../engine/astro';
import { bodyLon, computeChart, angleDiff, houseOf } from '../engine/astro';
import { L, SIGNS, BODIES, HOUSES } from './base';
import { ord } from './life';
import { Classical, CLASSICAL, domicileRuler, lillyScore } from './lillyDignity';

const l = (tr: string, en: string): L => ({ tr, en });
const DAY = 86400000;

/** Güneş'in doğum boylamına döndüğü an (verilen yıl içinde) */
export function solarReturnMoment(ch: Chart, year: number): Date {
  const target = ch.positions.sun.lon;
  const approx = Date.UTC(year, ch.utc.getUTCMonth(), ch.utc.getUTCDate(), ch.utc.getUTCHours());
  let lo = approx - 3 * DAY, hi = approx + 3 * DAY;
  const f = (t: number) => { let d = bodyLon('sun', new Date(t)) - target; if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
  for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (f(mid) < 0) lo = mid; else hi = mid; }
  return new Date((lo + hi) / 2);
}

export interface YearReport { age: number; start: Date; end: Date; profSign: number; profHouse: number; lord: Classical; monthSign: number; monthLord: Classical; monthStart: Date; ret: Chart; lines: { label: L; text: L }[] }

const ANG = [1, 4, 7, 10];

export function yearReport(ch: Chart, now = new Date(), lat = ch.input.lat, lon = ch.input.lon): YearReport | null {
  if (ch.asc === null) return null;
  let y = now.getUTCFullYear();
  let start = solarReturnMoment(ch, y);
  if (start > now) { y -= 1; start = solarReturnMoment(ch, y); }
  const end = solarReturnMoment(ch, y + 1);
  const age = y - ch.input.year;
  const ascSign = Math.floor(ch.asc / 30);
  const profSign = (ascSign + age) % 12, profHouse = (age % 12) + 1;
  const lord = domicileRuler(profSign);
  const monthIdx = Math.min(12, Math.floor((now.getTime() - start.getTime()) / ((end.getTime() - start.getTime()) / 13)));
  const monthSign = (profSign + monthIdx) % 12, monthLord = domicileRuler(monthSign);
  const monthStart = new Date(start.getTime() + monthIdx * ((end.getTime() - start.getTime()) / 13));

  const u = start;
  const ret = computeChart({ year: u.getUTCFullYear(), month: u.getUTCMonth() + 1, day: u.getUTCDate(), hour: u.getUTCHours(), minute: u.getUTCMinutes(), timeKnown: true, lat, lon, tz: 'UTC' }, 'regiomontanus');
  const R = ret.positions;
  const lines: { label: L; text: L }[] = [];
  const s = lillyScore(ch, lord);
  lines.push({ label: l('Yılın profeksiyonu', 'Annual profection'), text: {
    tr: `${age}. yaşın: yükselen ${age} burç ilerleyerek ${SIGNS[profSign].tr} burcuna geldi; doğum haritanın ${profHouse}. evi (${HOUSES[profHouse - 1].area.tr}) bu yıl etkin. Yılın efendisi ${BODIES[lord].name.tr} (doğumda ${SIGNS[ch.positions[lord].sign].tr}, ${ch.positions[lord].house}. ev, güç puanı ${s.total > 0 ? '+' : ''}${s.total}).`,
    en: `Age ${age}: the Ascendant has advanced ${age} signs to ${SIGNS[profSign].en}; your natal ${ord(profHouse)} house (${HOUSES[profHouse - 1].area.en}) is activated. Lord of the year: ${BODIES[lord].name.en} (natally in ${SIGNS[ch.positions[lord].sign].en}, ${ord(ch.positions[lord].house)} house, strength score ${s.total > 0 ? '+' : ''}${s.total}).`,
  } });
  lines.push({ label: l('Bu profeksiyon ayı', 'This profectional month'), text: {
    tr: `Yıl 13 eşit döneme ayrılır. Şu an ${monthIdx + 1}. aydasın: ${SIGNS[monthSign].tr} ve efendisi ${BODIES[monthLord].name.tr}; doğum haritanda ${houseOf(monthSign * 30 + 15, ch.cusps)}. ev temaları öne çıkıyor.`,
    en: `The year is divided into 13 equal periods. You are in month ${monthIdx + 1}: ${SIGNS[monthSign].en}, ruled by ${BODIES[monthLord].name.en}; themes of your natal ${ord(houseOf(monthSign * 30 + 15, ch.cusps))} house come forward.`,
  } });

  // Güneş dönüşü
  const rAsc = Math.floor(ret.asc! / 30);
  const natalHouseOfRetAsc = houseOf(ret.asc!, ch.cusps);
  lines.push({ label: l('Güneş dönüşü yükseleni', 'Solar return Ascendant'), text: {
    tr: `Güneş dönüşü haritanda yükselen ${SIGNS[rAsc].tr}; bu derece doğum haritanın ${natalHouseOfRetAsc}. evine düşüyor. Bu yılın ana sahnesi: ${HOUSES[natalHouseOfRetAsc - 1].area.tr}.`,
    en: `Your solar return Ascendant is ${SIGNS[rAsc].en}; it falls in your natal ${ord(natalHouseOfRetAsc)} house. The year’s main stage: ${HOUSES[natalHouseOfRetAsc - 1].area.en}.`,
  } });
  const confirm = rAsc === profSign || ret.positions[lord].house && ANG.includes(ret.positions[lord].house);
  lines.push({ label: l('Profeksiyon ile dönüşün uyumu', 'Agreement of profection and return'), text: confirm
    ? { tr: `Yılın efendisi ${BODIES[lord].name.tr} Güneş dönüşünde de öne çıkıyor${rAsc === profSign ? ' (dönüş yükseleni profeksiyon burcuyla aynı)' : ' (köşe evde)'}: profeksiyonun vaat ettikleri bu yıl teyit edilmiş ve güçlü.`, en: `The lord of the year ${BODIES[lord].name.en} is also prominent in the return${rAsc === profSign ? ' (return Ascendant equals the profected sign)' : ' (angular)'}: the profection’s promise is confirmed and strong this year.` }
    : { tr: 'Güneş dönüşü profeksiyonu doğrudan teyit etmiyor: bu durumda yılın etkileri daha yumuşak ve dağınık yaşanır.', en: 'The return doesn’t directly confirm the profection: the year’s effects are milder and more diffuse.' } });
  const angular = CLASSICAL.filter(p => ANG.includes(R[p].house));
  const ben = angular.filter(p => p === 'jupiter' || p === 'venus'), mal = angular.filter(p => p === 'saturn' || p === 'mars');
  if (ben.length) lines.push({ label: l('Dönüşte köşe evlerde iyi gezegenler', 'Benefics angular in the return'), text: { tr: `${ben.map(p => `${BODIES[p].name.tr} ${R[p].house}. evde`).join(', ')}: yıl boyunca destek, fırsat ve koruma; özellikle ${ben.map(p => HOUSES[R[p].house - 1].short.tr.toLocaleLowerCase('tr')).join(' ve ')} alanında.`, en: `${ben.map(p => `${BODIES[p].name.en} in the ${ord(R[p].house)}`).join(', ')}: support, opportunity and protection through the year, especially in ${ben.map(p => HOUSES[R[p].house - 1].short.en.toLowerCase()).join(' and ')}.` } });
  if (mal.length) lines.push({ label: l('Dönüşte köşe evlerde zorlayıcı gezegenler', 'Malefics angular in the return'), text: { tr: `${mal.map(p => `${BODIES[p].name.tr} ${R[p].house}. evde`).join(', ')}: ${mal.map(p => HOUSES[R[p].house - 1].short.tr.toLocaleLowerCase('tr')).join(' ve ')} alanında sabır, plan ve dikkat isteyen bir yıl.`, en: `${mal.map(p => `${BODIES[p].name.en} in the ${ord(R[p].house)}`).join(', ')}: a year asking for patience, planning and care in ${mal.map(p => HOUSES[R[p].house - 1].short.en.toLowerCase()).join(' and ')}.` } });
  lines.push({ label: l('Güneş’in evi', 'House of the Sun'), text: { tr: `Dönüşte Güneş ${R.sun.house}. evde: yılın odağı ${HOUSES[R.sun.house - 1].area.tr}.`, en: `In the return the Sun is in the ${ord(R.sun.house)}: the year’s focus is ${HOUSES[R.sun.house - 1].area.en}.` } });
  lines.push({ label: l('Ay’ın evi', 'House of the Moon'), text: { tr: `Dönüşte Ay ${R.moon.house}. evde: duygusal enerjin en çok ${HOUSES[R.moon.house - 1].short.tr.toLocaleLowerCase('tr')} konularına akar.`, en: `In the return the Moon is in the ${ord(R.moon.house)}: emotional energy flows mostly to ${HOUSES[R.moon.house - 1].short.en.toLowerCase()}.` } });
  // Doğum yükseleninin dönüşte yükselmesi
  if (angleDiff(ret.asc!, ch.asc) < 10) lines.push({ label: l('Doğum yükseleni geri döndü', 'Natal Ascendant rises again'), text: l('Dönüş yükseleni doğum yükselenine çok yakın: güçlü bir “kendine dönüş” ve yeni başlangıç yılı.', 'The return Ascendant is very close to your natal one: a strong year of returning to yourself and new beginnings.') });
  return { age, start, end, profSign, profHouse, lord, monthSign, monthLord, monthStart, ret, lines };
}
