// Ünlülerin Güneş, Ay, Merkür, Venüs, Mars burçlarını önceden hesaplar (öğlen UTC).
import { writeFileSync } from 'fs';
import { computeChart } from '../src/engine/astro';
import { CELEBS } from '../src/content/celebs';
const all = [...CELEBS.tr, ...CELEBS.world];
const D = '0123456789ab';
const out = all.map(c => {
  const ch = computeChart({ year: c[1], month: c[2], day: c[3], hour: 12, minute: 0, timeKnown: false, lat: 0, lon: 0, tz: 'UTC' } as any, { houseSystem: 'placidus', zodiac: 'tropical' } as any);
  return (['sun', 'moon', 'mercury', 'venus', 'mars'] as const).map(p => D[ch.positions[p].sign]).join('');
}).join('');
writeFileSync('src/content/celebSigns.ts', `// scripts/celebSigns.ts tarafından üretildi: CELEBS.tr + CELEBS.world sırasıyla her ünlü için 5 karakter (Güneş, Ay, Merkür, Venüs, Mars burç sırası, 0-b).\nexport const CELEB_SIGNS = '${out}';\n`);
console.log(all.length, out.length);
