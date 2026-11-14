// Kişiye özel karakter okuması: her yerleşim için burç + ev satırları birleşir,
// sonra yönetici gezegen, açılar ve tekrar eden temalar "doz" cümleleriyle eklenir.
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS } from '../engine/astro';
import { BODIES, HOUSES, SIGNS, L, Lang } from './base';
import { BodyDef, Row, SUN, MOON, MERCURY, VENUS, MARS, JUPITER, l } from './characterData1';
import { SATURN, URANUS, NEPTUNE, PLUTO, ASC, MC, LILITH, CHIRON, NODE, JUNO } from './characterData2';

type K = BodyId | 'asc' | 'mc';
const DEF: Partial<Record<K, BodyDef>> = {
  sun: SUN, moon: MOON, mercury: MERCURY, venus: VENUS, mars: MARS, jupiter: JUPITER, saturn: SATURN,
  uranus: URANUS, neptune: NEPTUNE, pluto: PLUTO, asc: ASC, mc: MC, lilith: LILITH, chiron: CHIRON, node: NODE, juno: JUNO,
};
export const CHAR_ORDER: K[] = ['sun', 'moon', 'asc', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'mc', 'node', 'juno', 'lilith', 'chiron', 'uranus', 'neptune', 'pluto'];
const NAME = (k: K): L => (k === 'asc' ? l('Yükselen', 'Ascendant') : k === 'mc' ? l('MC (tepe noktası)', 'MC (Midheaven)') : BODIES[k].name);
const cell = (r: Row, i: 0 | 1 | 2, lang: Lang) => r[lang === 'tr' ? i : i + 3];
const lc = (s: string, lang: Lang) => (s ? s.charAt(0).toLocaleLowerCase(lang) + s.slice(1) : s);

type Mod = { hard: L; soft: L };
const MODS: Partial<Record<BodyId, Mod>> = {
  saturn: { hard: l('Satürn’ün sert açısı bu eğilime korku ve gecikme katıyor; yukarıdaki “karşılanmazsa” tarafı sende daha belirgin olabilir, ama en sağlam ustalık da zamanla buradan çıkar.', 'A hard aspect from Saturn adds fear and delay; the “not met” side may show more in you, yet your sturdiest mastery grows from here over time.'),
    soft: l('Satürn’ün uyumlu açısı bu enerjiye olgunluk, sabır ve dayanıklılık veriyor.', 'A supportive Saturn aspect gives this energy maturity, patience and staying power.') },
  jupiter: { hard: l('Jüpiter’in sert açısı bu temayı büyütüyor; hem güzel yanı hem de abartısı sende daha çok görülür.', 'A hard Jupiter aspect enlarges this theme; both its gift and its excess show more in you.'),
    soft: l('Jüpiter’in uyumlu açısı bu alana şans, cömertlik ve iyimserlik katıyor.', 'A supportive Jupiter aspect adds luck, generosity and optimism here.') },
  uranus: { hard: l('Uranüs’ün sert açısı ani çıkışlar, kopuşlar ve “özgür kalayım” ihtiyacı ekliyor.', 'A hard Uranus aspect adds sudden breaks, departures and a need to stay free.'),
    soft: l('Uranüs’ün uyumlu açısı bu enerjiyi özgün ve yenilikçi kılıyor.', 'A supportive Uranus aspect makes this energy original and inventive.') },
  neptune: { hard: l('Neptün’ün sert açısı belirsizlik ve idealize etme eğilimi ekliyor; gördüğünle gerçek arasında fark olabilir.', 'A hard Neptune aspect adds vagueness and idealising; what you see and what is real may differ.'),
    soft: l('Neptün’ün uyumlu açısı bu enerjiye ilham, sezgi ve şefkat katıyor.', 'A supportive Neptune aspect adds inspiration, intuition and compassion.') },
  pluto: { hard: l('Plüton’un sert açısı yoğunluk, kontrol ihtiyacı ve ya hep ya hiç tavrı ekliyor.', 'A hard Pluto aspect adds intensity, a need for control and an all-or-nothing stance.'),
    soft: l('Plüton’un uyumlu açısı bu alanda derinlik ve dönüştürme gücü veriyor.', 'A supportive Pluto aspect brings depth and transforming power here.') },
  mars: { hard: l('Mars’ın sert açısı acele, öfke ve sabırsızlık ekliyor.', 'A hard Mars aspect adds haste, anger and impatience.'),
    soft: l('Mars’ın uyumlu açısı cesaret ve harekete geçme gücü veriyor.', 'A supportive Mars aspect gives courage and drive.') },
  venus: { hard: l('Venüs’ün sert açısı sevgi ve onay ihtiyacını hassaslaştırıyor.', 'A hard Venus aspect makes the need for love and approval more sensitive.'),
    soft: l('Venüs’ün uyumlu açısı bu enerjiye çekicilik ve yumuşaklık katıyor.', 'A supportive Venus aspect adds charm and softness.') },
  moon: { hard: l('Ay’ın sert açısı duygusal dalgalanmayı artırıyor; ruh halin bu temayı güçlü etkiliyor.', 'A hard Moon aspect stirs emotional ups and downs; your mood strongly colours this theme.'),
    soft: l('Ay’ın uyumlu açısı bu enerjiyi duygularınla barışık kılıyor.', 'A supportive Moon aspect keeps this energy at peace with your feelings.') },
};
const PERSONAL: K[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'lilith', 'chiron', 'juno'];
const STELLIUM: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

export interface CharItem { key: K; title: string; need: string; lines: { label: string; text: string }[]; dose: string[]; note?: string }

export function characterReading(ch: Chart, lang: Lang): CharItem[] {
  const tr = lang === 'tr';
  const out: CharItem[] = [];
  for (const k of CHAR_ORDER) {
    const d = DEF[k];
    if (!d) continue;
    let sign: number, house = 0, retro = false;
    if (k === 'asc' || k === 'mc') {
      const lon = k === 'asc' ? ch.asc : ch.mc;
      if (lon === null) continue;
      sign = Math.floor(lon / 30) % 12;
    } else {
      const p = ch.positions[k];
      if (!p) continue;
      sign = p.sign; house = p.house; retro = p.retro;
    }
    const s = d.signs[sign];
    const h = house && d.houses ? d.houses[house - 1] : null;
    const title = `${NAME(k)[lang]} · ${SIGNS[sign][lang]}${house ? ` · ${tr ? `${house}. ev` : `house ${house}`}` : ''}`;
    const lines: CharItem['lines'] = [];
    lines.push({ label: d.sl[0][lang], text: cell(s, 0, lang) });
    if (h) lines.push({ label: `${d.hl[0][lang]} (${HOUSES[house - 1].short[lang].toLocaleLowerCase(lang)})`, text: cell(h, 0, lang) });
    lines.push({ label: d.sl[1][lang], text: cell(s, 1, lang) + (h ? (tr ? `. Bu alanda: ${lc(cell(h, 1, lang), lang)}` : `. In this area: ${lc(cell(h, 1, lang), lang)}`) : '') });
    lines.push({ label: d.sl[2][lang], text: cell(s, 2, lang) + (h && cell(h, 2, lang) !== cell(s, 2, lang) ? (tr ? `; evinin dersi: ${lc(cell(h, 2, lang), lang)}` : `; your house adds: ${lc(cell(h, 2, lang), lang)}`) : '') });

    // ---- Doz ----
    const dose: string[] = [];
    if (PERSONAL.includes(k)) {
      const asp = ch.aspects
        .filter(a => (a.a === k || a.b === k) && a.type !== 'quincunx')
        .map(a => ({ other: (a.a === k ? a.b : a.a) as BodyId, type: a.type, orb: a.orb }))
        .filter(a => MODS[a.other] && a.other !== k && a.orb <= 6)
        .sort((x, y) => x.orb - y.orb);
      const seen = new Set<string>();
      for (const a of asp) {
        if (seen.has(a.other) || dose.length >= 3) continue;
        seen.add(a.other);
        const hardish = a.type === 'square' || a.type === 'opposition' || (a.type === 'conjunction' && !['jupiter', 'venus'].includes(a.other));
        dose.push(MODS[a.other]![hardish ? 'hard' : 'soft'][lang]);
      }
    }
    const ruler = SIGN_RULERS[sign];
    if (ruler !== k && ch.positions[ruler]?.house) {
      const rh = ch.positions[ruler].house;
      dose.push(tr ? `${SIGNS[sign].tr} burcunun yöneticisi ${BODIES[ruler].name.tr}, ${rh}. evde: bu enerjiyi hayatta en çok ${HOUSES[rh - 1].area.tr} alanına taşırsın.`
        : `The ruler of ${SIGNS[sign].en}, ${BODIES[ruler].name.en}, is in house ${rh}: you carry this energy mostly into ${HOUSES[rh - 1].area.en}.`);
    }
    if (house && house - 1 === sign) dose.push(tr ? `Burcun ve evin aynı temayı söylüyor (${SIGNS[sign].tr} ve onun doğal evi); bu eğilim sende iki kat güçlü.` : `Your sign and house tell the same story (${SIGNS[sign].en} and its natural house); this tendency is doubly strong in you.`);
    if (k !== 'asc' && k !== 'mc' && STELLIUM.includes(k as BodyId)) {
      const mates = STELLIUM.filter(o => o !== k && ch.positions[o].sign === sign);
      if (mates.length >= 2) dose.push(tr ? `Haritanda bu burçta başka gezegenler de var (${mates.map(m => BODIES[m].name.tr).join(', ')}); ${SIGNS[sign].tr} teması karakterinin merkezinde.` : `Other planets share this sign (${mates.map(m => BODIES[m].name.en).join(', ')}); ${SIGNS[sign].en} is central to your character.`);
    }
    if (retro && ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'chiron'].includes(k)) dose.push(tr ? 'Doğduğunda geri hareket ediyordu: bu enerjiyi önce içinde yaşar, dışa yansıtmakta biraz gecikirsin; içgörün ise derin olur.' : 'It was retrograde at your birth: you live this energy inwardly first and are slower to show it, but your insight runs deep.');

    out.push({ key: k, title, need: d.need[lang], lines, dose, note: d.note?.[lang] });
  }
  return out;
}

export const CHAR_INTRO: L = l(
  'Her yerleşim aynı zincirle okunur: gezegen neye ihtiyaç duyar, burcun bunu nasıl karşılar, evin bunu hayatının hangi alanında yaşatır, ihtiyaç karşılanmazsa ne yaparsın ve dersin ne. Altındaki “Senin haritanda” notları, açıların ve yönetici gezegenin bu eğilimi nasıl güçlendirdiğini ya da yumuşattığını söyler. Bunlar kesin hüküm değil, eğilimdir; farkındalık arttıkça aynı yerleşim olgun tarafıyla yaşanır.',
  'Each placement is read through the same chain: what the planet needs, how your sign meets it, where your house plays it out, what you do when the need isn’t met, and your lesson. The “In your chart” notes say how aspects and the ruling planet strengthen or soften it. These are tendencies, not verdicts; with awareness the same placement is lived from its mature side.',
);
