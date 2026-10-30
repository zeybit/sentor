import sweph from 'sweph';
import { computeChart, angleDiff, norm } from '../src/engine/astro';
const S = sweph as any;
const C = S.constants;
const FL = C.SEFLG_MOSEPH | C.SEFLG_SPEED;
const ids: [string, number][] = [['sun',C.SE_SUN],['moon',C.SE_MOON],['mercury',C.SE_MERCURY],['venus',C.SE_VENUS],['mars',C.SE_MARS],['jupiter',C.SE_JUPITER],['saturn',C.SE_SATURN],['uranus',C.SE_URANUS],['neptune',C.SE_NEPTUNE],['pluto',C.SE_PLUTO],['node',C.SE_TRUE_NODE],['lilith',C.SE_MEAN_APOG]];
const max: Record<string, number> = {};
let rnd = 12345; const r = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
let retroMismatch = 0, signMismatch = 0, houseMismatch = 0;
for (let k = 0; k < 400; k++) {
  const y = 1930 + Math.floor(r() * 100), mo = 1 + Math.floor(r() * 12), d = 1 + Math.floor(r() * 28);
  const h = Math.floor(r() * 24), mi = Math.floor(r() * 60);
  const lat = -60 + r() * 120, lon = -180 + r() * 360;
  const ch = computeChart({ year: y, month: mo, day: d, hour: h, minute: mi, timeKnown: true, lat, lon, tz: 'UTC' });
  const jd = S.julday(y, mo, d, h + mi / 60, C.SE_GREG_CAL);
  for (const [id, n] of ids) {
    const res = S.calc_ut(jd, n, FL);
    const e = angleDiff(res.data[0], (ch.positions as any)[id].lon) * 3600;
    max[id] = Math.max(max[id] || 0, e);
    if (Math.floor(res.data[0] / 30) !== (ch.positions as any)[id].sign) signMismatch++;
    if (id !== 'node' && id !== 'lilith' && (res.data[3] < 0) !== (ch.positions as any)[id].retro && Math.abs(res.data[3]) > 0.002) retroMismatch++;
  }
  for (const [sys, code] of [['placidus','P'],['wholeSign','W'],['equal','E'],['porphyry','O']] as const) {
    const ch2 = sys === 'placidus' ? ch : computeChart({ year: y, month: mo, day: d, hour: h, minute: mi, timeKnown: true, lat, lon, tz: 'UTC' }, sys);
    const hs = S.houses(jd, lat, lon, code);
    const cus = hs.data.houses;
    for (let i = 0; i < 12; i++) { const e = angleDiff(cus[i], ch2.cusps[i]) * 3600; const key = 'cusp_' + sys; if (ch2.houseSystemUsed === sys) max[key] = Math.max(max[key] || 0, e); }
    if (sys === 'placidus') {
      max.asc = Math.max(max.asc || 0, angleDiff(hs.data.points[0], ch.asc!) * 3600);
      max.mc = Math.max(max.mc || 0, angleDiff(hs.data.points[1], ch.mc!) * 3600);
      max.vertex = Math.max(max.vertex || 0, angleDiff(hs.data.points[3], ch.vertex!) * 3600);
      for (const [id] of ids) { const sh = S.house_pos(hs.data.points[2], lat, S.calc_ut(jd, C.SE_ECL_NUT, C.SEFLG_MOSEPH).data[0], 'P', [(ch.positions as any)[id].lon, 0]); if (sh.error) continue; if (Math.floor(sh.data) !== (ch.positions as any)[id].house) houseMismatch++; }
    }
  }
}
console.log('Maks. hata (yay saniyesi):'); for (const k in max) console.log(k.padEnd(16), max[k].toFixed(1));
console.log({ signMismatch, retroMismatch, houseMismatch });

// ---- Juno: uygulama tablosu ↔ Swiss Ephemeris (asteroit dosyası varsa) ----
import { junoLon } from '../src/engine/astro';
import * as path from 'path';
const ephe = process.env.SE_EPHE_PATH;
if (ephe) {
  S.set_ephe_path(ephe);
  let jmax = 0;
  for (let k = 0; k < 2000; k++) {
    const jd = S.julday(1901, 1, 1, 0, 1) + r() * 72000;
    const ref = S.calc_ut(jd, C.SE_JUNO, C.SEFLG_SWIEPH).data[0];
    jmax = Math.max(jmax, angleDiff(ref, junoLon(jd)!) * 3600);
  }
  console.log('juno (yay saniyesi)', jmax.toFixed(1));
} else console.log('Juno testi için SE_EPHE_PATH=<seas_18.se1 klasörü> ver.', path.sep);
