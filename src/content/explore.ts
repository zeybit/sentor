// Keşfet: ünlü ikizin, testler (baskın gezegen, aşk dili, element, tarot kartın) ve şehir önerileri.
import type { BodyId, Chart } from '../engine/astro';
import { PLANETS, SIGN_RULERS, angleDiff } from '../engine/astro';
import { destinyMatrix } from '../engine/matrix';
import { cartography, AngleLine } from '../engine/techniques';
import { CELEB_SIGNS } from './celebSigns';
import { CELEBS, Celeb } from './celebs';
import { SIGNS, BODIES, L } from './base';
import { ARCANA } from './arcana';

const l = (tr: string, en: string): L => ({ tr, en });

// ===================== Ünlü ikizin =====================
interface CelebData { c: Celeb; sun: number; moon: number; mercury: number; venus: number; mars: number; mx: number[]; world: boolean }
let CACHE: CelebData[] | null = null;
function celebData(): CelebData[] {
  if (CACHE) return CACHE;
  const all = [...CELEBS.tr.map(c => [c, false] as const), ...CELEBS.world.map(c => [c, true] as const)];
  CACHE = all.map(([c, world], i) => {
    const g = (k: number) => parseInt(CELEB_SIGNS[i * 5 + k], 12);
    const m = destinyMatrix(c[3], c[2], c[1]);
    return { c, sun: g(0), moon: g(1), mercury: g(2), venus: g(3), mars: g(4), mx: [m.A, m.B, m.C, m.D, m.E], world };
  });
  return CACHE;
}
export interface Twin { name: string; field: Celeb[4]; year: number; score: number; reasons: L[]; world: boolean }
export function celebTwins(ch: Chart, birth: { day: number; month: number; year: number }): Twin[] {
  const P = ch.positions;
  const m = destinyMatrix(birth.day, birth.month, birth.year);
  const mine = [m.A, m.B, m.C, m.D, m.E];
  const MX = [l('kişilik', 'personality'), l('ruhsal yan', 'spirit'), l('yetenek', 'talent'), l('görev', 'task'), l('öz', 'core')];
  return celebData().map(d => {
    let s = 0; const reasons: L[] = [];
    if (d.sun === P.sun.sign) { s += 40; reasons.push(l(`İkiniz de ${SIGNS[d.sun].tr} Güneşi`, `Both ${SIGNS[d.sun].en} Suns`)); }
    else if (d.sun % 4 === P.sun.sign % 4) s += 10;
    if (d.moon === P.moon.sign) { s += 28; reasons.push(l(`Aynı Ay burcu: ${SIGNS[d.moon].tr}`, `Same Moon sign: ${SIGNS[d.moon].en}`)); }
    else if (d.moon % 4 === P.moon.sign % 4) s += 7;
    if (d.venus === P.venus.sign) { s += 12; reasons.push(l(`Aynı Venüs: ${SIGNS[d.venus].tr}`, `Same Venus: ${SIGNS[d.venus].en}`)); }
    if (d.mars === P.mars.sign) { s += 8; reasons.push(l(`Aynı Mars: ${SIGNS[d.mars].tr}`, `Same Mars: ${SIGNS[d.mars].en}`)); }
    if (d.mercury === P.mercury.sign) { s += 6; reasons.push(l(`Aynı Merkür: ${SIGNS[d.mercury].tr}`, `Same Mercury: ${SIGNS[d.mercury].en}`)); }
    d.mx.forEach((n, i) => { if (n === mine[i]) { s += i === 4 ? 12 : 7; reasons.push(l(`Matriste aynı ${MX[i].tr} kartı: ${ARCANA[n].name.tr}`, `Same matrix ${MX[i].en} card: ${ARCANA[n].name.en}`)); } });
    return { name: d.c[0], field: d.c[4], year: d.c[1], score: Math.min(99, s), reasons, world: d.world };
  }).sort((a, b) => b.score - a.score);
}

// ===================== Testler =====================
export type TestId = 'planet' | 'love' | 'element' | 'card';
/** Baskın gezegen: köşelere yakınlık, yöneticilikler, açı sayısı ve burç gücü */
export function dominantPlanet(ch: Chart): { id: BodyId; scores: { id: BodyId; v: number }[] } {
  const sc: Record<string, number> = {};
  for (const p of PLANETS) sc[p] = 0;
  const angles = ch.asc !== null ? [ch.asc, ch.mc!, (ch.asc + 180) % 360, (ch.mc! + 180) % 360] : [];
  for (const p of PLANETS) {
    const pos = ch.positions[p];
    if (angles.some(a => angleDiff(a, pos.lon) < 8)) sc[p] += 5;
    if ([1, 10, 7, 4].includes(pos.house)) sc[p] += 2;
    sc[p] += ch.aspects.filter(a => (a.a === p || a.b === p) && a.orb < 5).length * 0.7;
    if (SIGN_RULERS[pos.sign] === p) sc[p] += 3;
  }
  if (ch.asc !== null) sc[SIGN_RULERS[Math.floor(ch.asc / 30)]] += 5;
  sc[SIGN_RULERS[ch.positions.sun.sign]] += 3;
  sc[SIGN_RULERS[ch.positions.moon.sign]] += 2;
  sc.sun += 2; sc.moon += 2;
  const scores = (Object.entries(sc) as [BodyId, number][]).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  return { id: scores[0].id, scores };
}
export const PLANET_TYPE: Partial<Record<BodyId, { title: L; text: L }>> = {
  sun: { title: l('Güneş insanı: doğuştan lider', 'Sun person: a born leader'), text: l('Odağı çekersin; insanlar sana yönelir. Kendini ifade etmek, görülmek ve bir şeylerin merkezinde olmak seni canlı tutar. Tuzağın: onay beklemek.', 'You draw focus; people turn to you. Expressing yourself and being at the centre keeps you alive. Your trap: waiting for approval.') },
  moon: { title: l('Ay insanı: kalbin sezgisi', 'Moon person: the intuitive heart'), text: l('İnsanların ruh halini anında hissedersin. Besleyici, koruyucu ve hafızası güçlü birisin. Tuzağın: başkasının duygusunu kendi duygun sanmak.', 'You sense moods instantly. Nurturing, protective, with a strong memory. Your trap: mistaking others’ feelings for your own.') },
  mercury: { title: l('Merkür insanı: zihnin hızı', 'Mercury person: speed of mind'), text: l('Konuşur, yazar, bağlantı kurarsın; merakın hiç bitmez. Bilgi senin para birimindir. Tuzağın: düşünmekten hissetmeye vakit bulamamak.', 'You talk, write and connect; your curiosity never ends. Information is your currency. Your trap: thinking so much you forget to feel.') },
  venus: { title: l('Venüs insanı: güzelliğin ve uyumun ustası', 'Venus person: master of beauty and harmony'), text: l('Estetik gözün, çekiciliğin ve insanları bir araya getirme yeteneğin öne çıkar. Tuzağın: kavga çıkmasın diye kendinden vazgeçmek.', 'Your eye for beauty, charm and talent for bringing people together stand out. Your trap: giving yourself up to avoid conflict.') },
  mars: { title: l('Mars insanı: harekete geçen', 'Mars person: the one who acts'), text: l('Cesursun, rekabeti seversin, bir hedef görünce durmazsın. Tuzağın: sabırsızlık ve gereksiz kavgalar.', 'Brave and competitive; once you see a goal you don’t stop. Your trap: impatience and needless fights.') },
  jupiter: { title: l('Jüpiter insanı: şanslı iyimser', 'Jupiter person: the lucky optimist'), text: l('Büyük düşünür, umut verirsin; kapılar sana açılır. Öğretmek, gezmek ve anlam aramak seni besler. Tuzağın: abartı ve söz verip yetişememek.', 'You think big and give hope; doors open for you. Teaching, travel and meaning feed you. Your trap: excess and over-promising.') },
  saturn: { title: l('Satürn insanı: sağlam inşaatçı', 'Saturn person: the solid builder'), text: l('Disiplinli, sorumlu ve sabırlısın; zamanla zirveye çıkarsın. Tuzağın: kendine fazla yüklenmek ve keyfi ertelemek.', 'Disciplined, responsible and patient; you climb to the top with time. Your trap: overloading yourself and postponing joy.') },
  uranus: { title: l('Uranüs insanı: sıra dışı yenilikçi', 'Uranus person: the unusual innovator'), text: l('Farklısın ve bunu saklamazsın; kuralları yeniden yazarsın. Tuzağın: bağlanmaktan kaçmak.', 'You are different and don’t hide it; you rewrite the rules. Your trap: running from commitment.') },
  neptune: { title: l('Neptün insanı: hayalperest sanatçı', 'Neptune person: the dreamy artist'), text: l('Hayal gücün, empatin ve sezgin çok güçlü; sanata ve ruhaniyete yatkınsın. Tuzağın: gerçekten kaçmak.', 'Imagination, empathy and intuition are strong; drawn to art and spirit. Your trap: escaping reality.') },
  pluto: { title: l('Plüton insanı: derin dönüştürücü', 'Pluto person: the deep transformer'), text: l('Yoğunsun; yüzeysel olanla yetinmez, her şeyin özüne inersin. Krizlerden güçlenerek çıkarsın. Tuzağın: kontrol ihtiyacı.', 'Intense; you won’t settle for the surface and go to the core. You come out of crises stronger. Your trap: the need for control.') },
};

/** Aşk dili: Venüs, Ay ve Mars'ın burçlarından beş sevgi dili */
export type LoveLang = 'words' | 'touch' | 'time' | 'acts' | 'gifts';
export const LOVE_LANG: Record<LoveLang, { title: L; text: L }> = {
  words: { title: l('Sözler', 'Words of affirmation'), text: l('Sevildiğini duymak istersin: mesajlar, iltifatlar, uzun sohbetler. Sessiz bir partner seni “sevilmiyorum” hissine iter.', 'You want to hear you’re loved: messages, compliments, long talks. A silent partner makes you feel unloved.') },
  touch: { title: l('Dokunmak', 'Physical touch'), text: l('Sevgi senin için tende hissedilir: sarılmak, el ele tutuşmak, yakın oturmak. Mesafe sende soğukluk gibi algılanır.', 'Love is felt on the skin: hugs, holding hands, sitting close. Distance reads as coldness.') },
  time: { title: l('Birlikte zaman', 'Quality time'), text: l('Telefonsuz, bölünmeden birlikte geçirilen zaman senin için en değerli hediye. Dikkati dağınık bir partner seni yaralar.', 'Undivided time together, phones away, is the best gift. A distracted partner hurts you.') },
  acts: { title: l('Hizmet ve emek', 'Acts of service'), text: l('Sevgiyi yapılan işlerde görürsün: işini kolaylaştırmak, sözünü tutmak, yük paylaşmak. Boş vaatler seni soğutur.', 'You see love in deeds: easing your load, keeping promises, sharing burdens. Empty promises cool you off.') },
  gifts: { title: l('Hediye ve sürprizler', 'Gifts and surprises'), text: l('Düşünülmüş küçük bir hediye “seni hatırladım” demektir. Özel günlerin unutulması sana çok dokunur.', 'A thoughtful little gift says “I thought of you”. Forgotten special days really sting.') },
};
const SIGN_LL: LoveLang[] = ['acts', 'touch', 'words', 'time', 'gifts', 'acts', 'words', 'touch', 'time', 'acts', 'words', 'time'];
const SIGN_LL2: LoveLang[] = ['touch', 'gifts', 'time', 'touch', 'words', 'time', 'gifts', 'time', 'words', 'gifts', 'time', 'touch'];
export function loveLanguage(ch: Chart): { lead: LoveLang; pct: Record<LoveLang, number> } {
  const sc: Record<LoveLang, number> = { words: 0, touch: 0, time: 0, acts: 0, gifts: 0 };
  const add = (sign: number, w: number) => { sc[SIGN_LL[sign]] += w; sc[SIGN_LL2[sign]] += w * 0.5; };
  add(ch.positions.venus.sign, 4); add(ch.positions.moon.sign, 3); add(ch.positions.mars.sign, 1.5);
  if (ch.positions.mercury.sign === ch.positions.venus.sign) sc.words += 1;
  if (ch.positions.venus.house === 5 || ch.positions.venus.house === 7) sc.time += 1;
  const tot = Object.values(sc).reduce((a, b) => a + b, 0);
  const pct = Object.fromEntries(Object.entries(sc).map(([k, v]) => [k, Math.round((v / tot) * 100)])) as Record<LoveLang, number>;
  const lead = (Object.keys(sc) as LoveLang[]).sort((a, b) => sc[b] - sc[a])[0];
  return { lead, pct };
}

/** Element karakteri */
export const ELEMENT_TYPE: { title: L; text: L }[] = [
  { title: l('Ateş', 'Fire'), text: l('Coşku, cesaret ve hız. Bir odaya girince enerjiyi yükseltirsin; harekete geçirici sensin. Dinlenmeyi unutma.', 'Enthusiasm, courage and speed. You lift the energy in a room; you get things moving. Don’t forget to rest.') },
  { title: l('Toprak', 'Earth'), text: l('Güven, sabır ve pratiklik. İnsanlar sana yaslanır; sözünün eri birisin. Arada kurallardan çıkıp eğlenmeye izin ver.', 'Reliability, patience and practicality. People lean on you; you keep your word. Allow yourself to break routine and play.') },
  { title: l('Hava', 'Air'), text: l('Fikir, iletişim ve merak. Konuşmayı başlatan, insanları birbirine bağlayan sensin. Duygularını da kelimelere dök.', 'Ideas, communication and curiosity. You start the conversation and connect people. Put your feelings into words too.') },
  { title: l('Su', 'Water'), text: l('Duygu, sezgi ve şefkat. İnsanları anlar, iyileştirirsin. Kendi sınırlarını korumak senin süper gücün olmalı.', 'Emotion, intuition and compassion. You understand and heal people. Guarding your boundaries should be your superpower.') },
];
export function elementProfile(ch: Chart): { pct: number[]; lead: number } {
  const c = [0, 0, 0, 0];
  const W: Partial<Record<BodyId, number>> = { sun: 3, moon: 3, mercury: 1.5, venus: 1.5, mars: 1.5, jupiter: 1, saturn: 1 };
  for (const [id, w] of Object.entries(W) as [BodyId, number][]) c[ch.positions[id].sign % 4] += w;
  if (ch.asc !== null) c[Math.floor(ch.asc / 30) % 4] += 2.5;
  const tot = c.reduce((a, b) => a + b, 0);
  const pct = c.map(v => Math.round((v / tot) * 100));
  return { pct, lead: pct.indexOf(Math.max(...pct)) };
}

// ===================== Şehir önerileri =====================
export interface CityPick { theme: L; city: string; country: string; why: L; km: number; good: boolean }
const THEMES: { theme: L; good: boolean; lines: [BodyId, AngleLine][]; why: (b: BodyId, ln: AngleLine) => L }[] = [
  { theme: l('Aşk ve ilişkiler', 'Love and relationships'), good: true, lines: [['venus', 'DSC'], ['venus', 'ASC'], ['moon', 'DSC'], ['venus', 'MC'], ['jupiter', 'DSC']], why: b => l(`${BODIES[b].name.tr} çizgin burada: çekiciliğin artar, ilişkiler kolay başlar.`, `Your ${BODIES[b].name.en} line runs here: your charm rises and relationships start easily.`) },
  { theme: l('Kariyer ve tanınma', 'Career and recognition'), good: true, lines: [['sun', 'MC'], ['jupiter', 'MC'], ['saturn', 'MC'], ['mercury', 'MC'], ['venus', 'MC']], why: b => l(`${BODIES[b].name.tr} kariyer noktana oturuyor: burada adın daha kolay duyulur.`, `${BODIES[b].name.en} sits on your career point here: your name gets heard more easily.`) },
  { theme: l('Şans ve fırsat', 'Luck and opportunity'), good: true, lines: [['jupiter', 'ASC'], ['jupiter', 'IC'], ['jupiter', 'MC'], ['sun', 'ASC']], why: () => l('Jüpiter çizgin burada: kapılar açılır, insanlar yardımcı olur.', 'Your Jupiter line is here: doors open and people help.') },
  { theme: l('Huzur ve yuva', 'Peace and home'), good: true, lines: [['moon', 'IC'], ['venus', 'IC'], ['jupiter', 'IC'], ['moon', 'ASC']], why: b => l(`${BODIES[b].name.tr} yuva noktanda: kendini evinde hissedersin.`, `${BODIES[b].name.en} is on your home point: you feel at home here.`) },
  { theme: l('İlham ve yaratıcılık', 'Inspiration and creativity'), good: true, lines: [['neptune', 'ASC'], ['venus', 'ASC'], ['mercury', 'ASC'], ['neptune', 'MC'], ['uranus', 'ASC']], why: b => l(`${BODIES[b].name.tr} çizgin burada: hayal gücün ve üretkenliğin canlanır.`, `Your ${BODIES[b].name.en} line runs here: imagination and creativity come alive.`) },
  { theme: l('Dikkatli olman gereken yer', 'Where to be careful'), good: false, lines: [['saturn', 'ASC'], ['mars', 'ASC'], ['pluto', 'ASC'], ['saturn', 'DSC'], ['mars', 'DSC'], ['pluto', 'MC']], why: b => l(`${BODIES[b].name.tr} çizgin burada: bu şehir seni zorlayabilir, ama büyük dersler de verir.`, `Your ${BODIES[b].name.en} line runs here: this city may challenge you, but also teach big lessons.`) },
];
export function cityPicks(ch: Chart, cities: { name: string; country: string; lat: number; lon: number; pop: number }[]): CityPick[] {
  const bodies = [...new Set(THEMES.flatMap(t => t.lines.map(x => x[0])))];
  const hits = cartography(ch, cities, bodies, 450);
  const used = new Set<string>();
  const out: CityPick[] = [];
  for (const t of THEMES) {
    let best: { h: typeof hits[number]; rank: number } | null = null;
    t.lines.forEach(([b, ln], i) => {
      for (const h of hits) {
        if (h.body !== b || h.line !== ln || used.has(h.city)) continue;
        const pop = cities.find(c => c.name === h.city)?.pop ?? 0;
        const rank = i * 120 + h.distKm - Math.log10(pop + 10) * 25;
        if (!best || rank < best.rank) best = { h, rank };
      }
    });
    if (best) {
      const h = (best as { h: typeof hits[number] }).h;
      used.add(h.city);
      out.push({ theme: t.theme, city: h.city, country: h.country, why: t.why(h.body, h.line), km: h.distKm, good: t.good });
    }
  }
  return out;
}
