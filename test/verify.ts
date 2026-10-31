// Motoru Swiss Ephemeris'e karşı doğrular: npm run verify  (asteroitler için SE_EPHE_PATH=<seas_18.se1 klasörü>)
import sweph from 'sweph';
import { computeChart, angleDiff, asteroidLon, chartAt, HOUSE_SYSTEMS, HouseSystem, bodyLon } from '../src/engine/astro';
import { solarReturnChart, lunations, planetaryHours, progressedChart } from '../src/engine/techniques';
const S = sweph as any;
const C = S.constants;
const ephe = process.env.SE_EPHE_PATH;
if (ephe) S.set_ephe_path(ephe);
const FL = (ephe ? C.SEFLG_SWIEPH : C.SEFLG_MOSEPH) | C.SEFLG_SPEED;
const ids: [string, number][] = [['sun', C.SE_SUN], ['moon', C.SE_MOON], ['mercury', C.SE_MERCURY], ['venus', C.SE_VENUS], ['mars', C.SE_MARS], ['jupiter', C.SE_JUPITER], ['saturn', C.SE_SATURN], ['uranus', C.SE_URANUS], ['neptune', C.SE_NEPTUNE], ['pluto', C.SE_PLUTO], ['node', C.SE_TRUE_NODE], ['lilith', C.SE_MEAN_APOG]];
const HS: Record<HouseSystem, string> = { placidus: 'P', koch: 'K', porphyry: 'O', regiomontanus: 'R', campanus: 'C', equal: 'E', wholeSign: 'W', alcabitius: 'B', topocentric: 'T', morinus: 'M', meridian: 'X' };
const max: Record<string, number> = {};
const upd = (k: string, v: number) => { if (!Number.isNaN(v)) max[k] = Math.max(max[k] || 0, v); };
let rnd = 12345; const r = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
let signMismatch = 0, retroMismatch = 0;
for (let k = 0; k < 300; k++) {
  const y = 1930 + Math.floor(r() * 100), mo = 1 + Math.floor(r() * 12), d = 1 + Math.floor(r() * 28);
  const h = Math.floor(r() * 24), mi = Math.floor(r() * 60);
  const lat = -60 + r() * 120, lon = -180 + r() * 360;
  const inp = { year: y, month: mo, day: d, hour: h, minute: mi, timeKnown: true, lat, lon, tz: 'UTC' };
  const ch = computeChart(inp);
  const jd = S.julday(y, mo, d, h + mi / 60, C.SE_GREG_CAL);
  for (const [id, n] of ids) {
    const res = S.calc_ut(jd, n, FL);
    const p = (ch.positions as any)[id];
    upd(id, angleDiff(res.data[0], p.lon) * 3600);
    if (Math.floor(res.data[0] / 30) !== p.sign) signMismatch++;
    if (id !== 'node' && id !== 'lilith' && (res.data[3] < 0) !== p.retro && Math.abs(res.data[3]) > 0.002) retroMismatch++;
    if (id !== 'node' && id !== 'lilith') {
      const eq = S.calc_ut(jd, n, FL | C.SEFLG_EQUATORIAL).data[1];
      upd('declination', Math.abs(eq - p.dec) * 3600);
    }
  }
  for (const sys of HOUSE_SYSTEMS) {
    const c2 = computeChart(inp, sys);
    if (c2.houseSystemUsed !== sys) continue;
    const ref = S.houses_ex2(jd, 0, lat, lon, HS[sys]).data;
    for (let i = 0; i < 12; i++) upd('cusp_' + sys, angleDiff(ref.houses[i], c2.cusps[i]) * 3600);
    if (sys === 'placidus') {
      upd('asc', angleDiff(ref.points[0], c2.asc!) * 3600);
      upd('mc', angleDiff(ref.points[1], c2.mc!) * 3600);
      upd('vertex', angleDiff(ref.points[3], c2.vertex!) * 3600);
    }
  }
  // Sidereal (Lahiri)
  const sid = computeChart(inp, { houseSystem: 'placidus', zodiac: 'sidereal' });
  S.set_sid_mode(C.SE_SIDM_LAHIRI, 0, 0);
  for (const [id, n] of ids.slice(0, 10)) upd('sidereal', angleDiff(S.calc_ut(jd, n, FL | C.SEFLG_SIDEREAL).data[0], (sid.positions as any)[id].lon) * 3600);
  upd('sidereal_asc', angleDiff(S.houses_ex2(jd, C.SEFLG_SIDEREAL, lat, lon, 'P').data.points[0], sid.asc!) * 3600);
  // Asteroitler
  if (ephe) for (const [id, n] of [['chiron', C.SE_CHIRON], ['ceres', C.SE_CERES], ['pallas', C.SE_PALLAS], ['juno', C.SE_JUNO], ['vesta', C.SE_VESTA]] as [string, number][]) {
    const v = asteroidLon(id as any, jd);
    if (v !== null) upd(id, angleDiff(S.calc_ut(jd, n, C.SEFLG_SWIEPH).data[0], v) * 3600);
  }
}
// İkincil progresyon: gezegenler doğumdan "yaş" gün sonraki gökyüzü olmalı
{
  const natal = computeChart({ year: 1990, month: 6, day: 15, hour: 8, minute: 20, timeKnown: true, lat: 41, lon: 29, tz: 'UTC' });
  const when = new Date(Date.UTC(2026, 9, 31));
  const pc = progressedChart(natal, when, { houseSystem: 'placidus', zodiac: 'tropical' });
  const age = (when.getTime() - natal.utc.getTime()) / (365.2422 * 86400000);
  const jd = S.julday(1990, 6, 15, 8 + 20 / 60, 1) + age;
  upd('progressed', angleDiff(S.calc_ut(jd, C.SE_MOON, FL).data[0], pc.positions.moon.lon) * 3600);
  // Güneş dönüşü: dönüş anında Güneş tam natal boylamda olmalı
  const sr = solarReturnChart(natal, when, { houseSystem: 'placidus', zodiac: 'tropical' });
  upd('solarReturn', angleDiff(bodyLon('sun', sr.utc), bodyLon('sun', natal.utc)) * 3600);
  // Yeni ay anı: Güneş–Ay kavuşumu
  for (const L of lunations(new Date('2026-01-01'), new Date('2026-12-31'))) {
    const jdL = L.date.getTime() / 86400000 + 2440587.5;
    const dd = angleDiff(S.calc_ut(jdL, C.SE_MOON, FL).data[0], S.calc_ut(jdL, C.SE_SUN, FL).data[0]);
    const aim = { new: 0, firstQuarter: 90, full: 180, lastQuarter: 90 }[L.kind];
    upd('lunation_arcsec', Math.abs(dd - aim) * 3600);
  }
  // Gün doğumu: İstanbul 2026-06-21, sweph rise_trans ile
  const ph = planetaryHours(new Date(Date.UTC(2026, 5, 21, 12)), 41.01, 28.97, 180)!;
  const rt = S.rise_trans(S.julday(2026, 6, 20, 21, 1), C.SE_SUN, '', FL, C.SE_CALC_RISE, [28.97, 41.01, 0], 1013.25, 15);
  const sweRise = (rt.data - 2440587.5) * 86400000;
  upd('sunrise_seconds', Math.abs(ph.sunrise.getTime() - sweRise) / 1000);
  void chartAt;
}
console.log('Maks. hata (yay saniyesi; sunrise saniye):'); for (const k in max) console.log(k.padEnd(20), max[k].toFixed(2));
console.log({ signMismatch, retroMismatch });
