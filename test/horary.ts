import sweph from 'sweph';
import { nextAspect, castHorary } from '../src/engine/horary';
const S = sweph as any, C = S.constants;
// Ay–Güneş: bir sonraki kavuşum/karşıt = yeni ay/dolunay ile aynı olmalı
const start = new Date('2026-10-31T00:00:00Z');
const h = nextAspect('moon', 'sun', start, new Date('2026-11-30T00:00:00Z'));
console.log('Ay-Güneş ilk açı', h?.type, h?.date.toISOString());
// sweph ile tam anı doğrula: o anda Ay-Güneş farkı açıya eşit mi
const jd = h!.date.getTime() / 86400000 + 2440587.5;
const m = S.calc_ut(jd, C.SE_MOON, C.SEFLG_MOSEPH).data[0], su = S.calc_ut(jd, C.SE_SUN, C.SEFLG_MOSEPH).data[0];
let d = Math.abs(m - su) % 360; if (d > 180) d = 360 - d; console.log('sweph açı (°)', d.toFixed(4));
const r = castHorary(new Date('2026-10-31T12:00:00Z'), 41.01, 28.97, 7);
console.log({ q: r.querent, s: r.quesited, perf: r.perfection?.type, when: r.perfection?.date.toISOString(), trans: r.translation, verdict: r.verdict, void: r.moonVoid, moon: r.moonNext.map(x => x.b + ':' + x.type), timing: r.timing, early: r.ascEarly, late: r.ascLate, sat: r.saturnAngular });
