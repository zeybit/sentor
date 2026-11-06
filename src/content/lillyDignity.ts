// William Lilly, Christian Astrology I (1647): Batlamyus'a göre esas onurlar tablosu (s. 104)
// ve "Gezegenlerin güç ve zayıflıklarını incelemek için hazır tablo" (s. 115).
// Gezegenlerin "iyi yerleşimli / kötü yerleşimli" karakter tarifleri Bölüm VIII–XIV'ten modern dille uyarlanmıştır.
import type { BodyId, Chart } from '../engine/astro';
import { angleDiff, norm } from '../engine/astro';
import { L, BODIES } from './base';

const l = (tr: string, en: string): L => ({ tr, en });
export type Classical = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';
export const CLASSICAL: Classical[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];

const DOMICILE: Record<Classical, number[]> = { sun: [4], moon: [3], mercury: [2, 5], venus: [1, 6], mars: [0, 7], jupiter: [8, 11], saturn: [9, 10] };
const EXALT: Record<Classical, number> = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 };
// Üçlük yöneticileri (Lilly/Batlamyus): [gündüz, gece]
const TRIPLICITY: [Classical, Classical][] = [['sun', 'jupiter'], ['venus', 'moon'], ['saturn', 'mercury'], ['mars', 'mars']];
// Batlamyus terimleri (Lilly'nin tablosu): [yönetici, bitiş derecesi]
const T = (...a: [Classical, number][]) => a;
export const TERMS: [Classical, number][][] = [
  T(['jupiter', 6], ['venus', 14], ['mercury', 21], ['mars', 26], ['saturn', 30]),
  T(['venus', 8], ['mercury', 15], ['jupiter', 22], ['saturn', 26], ['mars', 30]),
  T(['mercury', 7], ['jupiter', 14], ['venus', 21], ['saturn', 25], ['mars', 30]),
  T(['mars', 6], ['jupiter', 13], ['mercury', 20], ['venus', 27], ['saturn', 30]),
  T(['saturn', 6], ['mercury', 13], ['venus', 19], ['jupiter', 25], ['mars', 30]),
  T(['mercury', 7], ['venus', 13], ['jupiter', 18], ['saturn', 24], ['mars', 30]),
  T(['saturn', 6], ['venus', 11], ['jupiter', 19], ['mercury', 24], ['mars', 30]),
  T(['mars', 6], ['jupiter', 14], ['venus', 21], ['mercury', 27], ['saturn', 30]),
  T(['jupiter', 8], ['venus', 14], ['mercury', 19], ['saturn', 25], ['mars', 30]),
  T(['venus', 6], ['mercury', 12], ['jupiter', 19], ['mars', 25], ['saturn', 30]),
  T(['saturn', 6], ['mercury', 12], ['venus', 20], ['jupiter', 25], ['mars', 30]),
  T(['venus', 8], ['jupiter', 14], ['mercury', 20], ['mars', 26], ['saturn', 30]),
];
// Yüzler (dekanlar): Keldani sırası, Koç'un ilk 10 derecesi Mars'tan başlar
const CHALDEAN: Classical[] = ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter'];
export const faceRuler = (lon: number): Classical => CHALDEAN[Math.floor(norm(lon) / 10) % 7];
export const termRuler = (lon: number): Classical => {
  const s = Math.floor(norm(lon) / 30), d = norm(lon) % 30;
  return TERMS[s].find(([, end]) => d < end)![0];
};
export const triplicityRuler = (sign: number, day: boolean): Classical => TRIPLICITY[sign % 4][day ? 0 : 1];
export const domicileRuler = (sign: number): Classical => (Object.keys(DOMICILE) as Classical[]).find(p => DOMICILE[p].includes(sign))!;
export const exaltRuler = (sign: number): Classical | null => (Object.keys(EXALT) as Classical[]).find(p => EXALT[p] === sign) ?? null;

// Ortalama günlük hareketler (Lilly): hızlı/yavaş karşılaştırması için
const MEAN_SPEED: Record<Classical, number> = { saturn: 2 / 60, jupiter: 5 / 60, mars: 31 / 60, sun: 59 / 60, venus: 59 / 60, mercury: 59 / 60, moon: 13 + 10 / 60 };

// Sabit yıldızlar (J2000 boylamı) — yıllık presesyon 50.29"
const STARS = { regulus: 149.83, spica: 203.83, algol: 56.17 };
const starLon = (base: number, jd: number) => norm(base + ((jd - 2451545) / 365.25) * (50.29 / 3600));

export interface ScoreLine { label: L; pts: number }
export interface LillyScore { id: Classical; essential: ScoreLine[]; accidental: ScoreLine[]; essTotal: number; accTotal: number; total: number; peregrine: boolean }

const partile = (a: number, b: number) => Math.floor(a % 30) === Math.floor(b % 30) && Math.floor(a / 30) === Math.floor(b / 30);
const partileAsp = (a: number, b: number, ang: number) => {
  const d = angleDiff(a, b);
  return Math.abs(d - ang) < 1 && Math.floor(a % 30) === Math.floor(b % 30);
};

export function lillyScore(ch: Chart, id: Classical): LillyScore {
  const P = ch.positions;
  const p = P[id];
  const day = ch.isDayChart ?? true;
  const ess: ScoreLine[] = [], acc: ScoreLine[] = [];
  const name = BODIES[id].name;

  // --- Esas onurlar ---
  if (DOMICILE[id].includes(p.sign)) ess.push({ label: l('Kendi evinde', 'In its own house'), pts: 5 });
  if (EXALT[id] === p.sign) ess.push({ label: l('Yüceliminde', 'In exaltation'), pts: 4 });
  if (triplicityRuler(p.sign, day) === id) ess.push({ label: l('Kendi üçlüğünde', 'In its own triplicity'), pts: 3 });
  if (termRuler(p.lon) === id) ess.push({ label: l('Kendi teriminde', 'In its own term'), pts: 2 });
  if (faceRuler(p.lon) === id) ess.push({ label: l('Kendi yüzünde (dekan)', 'In its own face'), pts: 1 });
  // Karşılıklı kabul (ev ile): Lilly ev onuru kadar sayar
  const other = domicileRuler(p.sign);
  if (other !== id && DOMICILE[other] && DOMICILE[id].includes(P[other].sign)) ess.push({ label: l(`${BODIES[other].name.tr} ile karşılıklı kabul (ev)`, `Mutual reception by house with ${BODIES[other].name.en}`), pts: 5 });
  const exOther = exaltRuler(p.sign);
  if (exOther && exOther !== id && EXALT[id] === P[exOther].sign) ess.push({ label: l(`${BODIES[exOther].name.tr} ile karşılıklı kabul (yücelim)`, `Mutual reception by exaltation with ${BODIES[exOther].name.en}`), pts: 4 });
  if (DOMICILE[id].some(s => (s + 6) % 12 === p.sign)) ess.push({ label: l('Zararda', 'In detriment'), pts: -5 });
  if ((EXALT[id] + 6) % 12 === p.sign) ess.push({ label: l('Düşüşte', 'In fall'), pts: -4 });
  const peregrine = !ess.some(e => e.pts > 0);
  if (peregrine) ess.push({ label: l('Peregrin (hiçbir onuru yok)', 'Peregrine (no dignity)'), pts: -5 });

  // --- İlineksel güçler ---
  const h = p.house;
  if (h) {
    const hp: Record<number, number> = { 10: 5, 1: 5, 7: 4, 4: 4, 11: 4, 2: 3, 5: 3, 9: 2, 3: 1, 12: -5, 8: -2, 6: -2 };
    if (hp[h]) acc.push({ label: l(`${h}. evde`, `In the ${h}th house`), pts: hp[h] });
  }
  if (id !== 'sun' && id !== 'moon') acc.push(p.retro ? { label: l('Retro', 'Retrograde'), pts: -5 } : { label: l('Düz hareket', 'Direct'), pts: 4 });
  const sp = Math.abs(p.speed);
  acc.push(sp > MEAN_SPEED[id] ? { label: l('Hızlı hareket', 'Swift in motion'), pts: 2 } : { label: l('Yavaş hareket', 'Slow in motion'), pts: -2 });
  if (id === 'saturn' || id === 'jupiter' || id === 'mars') {
    const oriental = norm(P.sun.lon - p.lon) < 180; // Güneş'ten önce doğar
    acc.push(oriental ? { label: l('Doğulu (oriental)', 'Oriental'), pts: 2 } : { label: l('Batılı (occidental)', 'Occidental'), pts: -2 });
  }
  if (id === 'venus' || id === 'mercury') {
    const occidental = norm(p.lon - P.sun.lon) < 180;
    acc.push(occidental ? { label: l('Batılı (occidental)', 'Occidental'), pts: 2 } : { label: l('Doğulu (oriental)', 'Oriental'), pts: -2 });
  }
  if (id === 'moon') {
    const waxing = norm(P.moon.lon - P.sun.lon) < 180;
    acc.push(waxing ? { label: l('Işığı artıyor', 'Increasing in light'), pts: 2 } : { label: l('Işığı azalıyor', 'Decreasing in light'), pts: -2 });
  }
  if (id !== 'sun') {
    const d = angleDiff(p.lon, P.sun.lon);
    if (d < 17 / 60) acc.push({ label: l('Kazimi (Güneş’in kalbinde)', 'Cazimi'), pts: 5 });
    else if (d < 8.5) acc.push({ label: l('Yanık (Güneş’e çok yakın)', 'Combust'), pts: -5 });
    else if (d < 17) acc.push({ label: l('Güneş ışınları altında', 'Under the Sun’s beams'), pts: -4 });
    else acc.push({ label: l('Yanıklık ve ışınlardan uzak', 'Free from combustion and beams'), pts: 5 });
  }
  for (const b of ['jupiter', 'venus'] as Classical[]) {
    if (b === id) continue;
    const bl = P[b].lon;
    if (partile(p.lon, bl)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam kavuşum`, `Partile conjunction with ${BODIES[b].name.en}`), pts: 5 });
    else if (partileAsp(p.lon, bl, 120)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam üçgen`, `Partile trine with ${BODIES[b].name.en}`), pts: 4 });
    else if (partileAsp(p.lon, bl, 60)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam altmışlık`, `Partile sextile with ${BODIES[b].name.en}`), pts: 3 });
  }
  for (const b of ['saturn', 'mars'] as Classical[]) {
    if (b === id) continue;
    const bl = P[b].lon;
    if (partile(p.lon, bl)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam kavuşum`, `Partile conjunction with ${BODIES[b].name.en}`), pts: -5 });
    else if (partileAsp(p.lon, bl, 180)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam karşıt`, `Partile opposition of ${BODIES[b].name.en}`), pts: -4 });
    else if (partileAsp(p.lon, bl, 90)) acc.push({ label: l(`${BODIES[b].name.tr} ile tam kare`, `Partile square of ${BODIES[b].name.en}`), pts: -3 });
  }
  if (P.node && partile(p.lon, P.node.lon)) acc.push({ label: l('Kuzey Ay Düğümü ile tam kavuşum', 'Partile conjunction with the North Node'), pts: 4 });
  if (P.southNode && partile(p.lon, P.southNode.lon)) acc.push({ label: l('Güney Ay Düğümü ile tam kavuşum', 'Partile conjunction with the South Node'), pts: -4 });
  // Kuşatılma: Satürn ile Mars arasında, ikisine de 15°'den yakın ve aralarında
  if (id !== 'saturn' && id !== 'mars') {
    const a = norm(p.lon - P.mars.lon), b = norm(P.saturn.lon - p.lon), c = norm(p.lon - P.saturn.lon), d = norm(P.mars.lon - p.lon);
    if ((a < 15 && b < 15) || (c < 15 && d < 15)) acc.push({ label: l('Satürn ile Mars arasında kuşatılmış', 'Besieged between Saturn and Mars'), pts: -5 });
  }
  const jd = ch.jdUT;
  if (angleDiff(p.lon, starLon(STARS.regulus, jd)) < 2) acc.push({ label: l('Regulus (Aslan’ın Kalbi) ile kavuşum', 'Conjunct Regulus (Cor Leonis)'), pts: 6 });
  if (angleDiff(p.lon, starLon(STARS.spica, jd)) < 2) acc.push({ label: l('Spica ile kavuşum', 'Conjunct Spica'), pts: 5 });
  if (angleDiff(p.lon, starLon(STARS.algol, jd)) < 5) acc.push({ label: l('Algol’a 5°’den yakın', 'Within 5° of Algol'), pts: -5 });

  const essTotal = ess.reduce((s, x) => s + x.pts, 0), accTotal = acc.reduce((s, x) => s + x.pts, 0);
  void name;
  return { id, essential: ess, accidental: acc, essTotal, accTotal, total: essTotal + accTotal, peregrine };
}

/** Lilly: gezegenin iyi / kötü yerleşimdeki karakter tarifi (modern dille) */
export const LILLY_MANNERS: Record<Classical, { well: L; ill: L }> = {
  saturn: {
    well: l('Derin düşünen, ciddi ve ağırbaşlı; az ve öz konuşur, çalışmada sabırlıdır, tartışmada vakur, dünyevi işlerde titiz ve özenlidir.', 'Profound in thought, serious and grave; speaks little, patient in labour, dignified in debate, careful and diligent in worldly matters.'),
    ill: l('Kıskançlık, aşırı tutumluluk, güvensizlik, kuşkuculuk ve inat öne çıkabilir; içine kapanma ve memnuniyetsizlik eğilimi.', 'Envy, miserliness, mistrust, suspicion and stubbornness may surface; a tendency to withdraw and to feel discontent.'),
  },
  jupiter: {
    well: l('Yüce gönüllü, sadık, alçakgönüllü; onurlu hedeflere yönelir, adil davranır, herkese iyilik yapmak ister; ailesine düşkün, yaşlılara saygılı, yardımsever, cömert, bilge ve minnettar.', 'Magnanimous, faithful and modest; aims at honourable goals, deals fairly, wishes everyone well; devoted to family, respectful to elders, charitable, generous, wise and grateful.'),
    ill: l('Varlığını israf etme, kolay kandırılma, inançlarda katılık ve gösteriş; arkadaşlıkta özensizlik.', 'Wasting resources, being easily deceived, rigidity or show in beliefs; carelessness in friendship.'),
  },
  mars: {
    well: l('Mücadelede yenilmez, cesur, kendinden emin ve kararlı; onuru için her riske girer, kimsenin boyunduruğunu kabul etmez, ama kendi işlerinde akıllıca davranır.', 'Invincible in struggle, brave, confident and resolute; risks all for honour, accepts no one’s yoke, yet handles personal affairs prudently.'),
    ill: l('Ölçüsüz öfke, kavga ve tartışma eğilimi, aceleci ve dengesiz kararlar; enerjiyi yıkıcı yönlere harcama riski.', 'Excessive anger, a tendency to quarrel, rash and unstable decisions; a risk of spending energy destructively.'),
  },
  sun: {
    well: l('Çok sadık, sözünü tutan; yönetme isteği güçlü, sağduyulu ve isabetli yargılı; görkemli ve onurlu, cömert, sırrını saklayan; büyük gönüllü ama herkese karşı nazik ve insancıl.', 'Very faithful, keeps promises; a strong wish to lead, prudent with excellent judgment; stately and honourable, generous, discreet; great-hearted yet affable and humane to all.'),
    ill: l('Kibir, herkesi küçümseme, soyunu öne çıkarma; huzursuz ve baskın tavır, savurganlık ve ciddiyetsizlik.', 'Arrogance, disdain for others, boasting of background; a restless, domineering manner, extravagance and lack of gravity.'),
  },
  venus: {
    well: l('Sakin, kavga ve tartışmadan uzak; neşeli, temiz ve şık, sözlerinde ve davranışlarında keyifli; müziği, eğlenceli buluşmaları ve sanatı sever, kolay inanır, dost canlısı ve güven doludur.', 'Calm, avoids quarrels and disputes; cheerful, neat and stylish, pleasant in word and deed; loves music, merry gatherings and the arts, trusting, sociable and good-natured.'),
    ill: l('Aşırı zevk düşkünlüğü, savurganlık, itibarını önemsememe ve tutarsız ilişkiler; hayatın sorumluluklarını erteleme.', 'Overindulgence, extravagance, disregard for reputation and inconstant relationships; postponing life’s responsibilities.'),
  },
  mercury: {
    well: l('İnce ve stratejik bir zekâ; mükemmel bir tartışmacı, belagatli konuşmacı; her türlü bilginin ve gizemin peşinde, öğretmensiz öğrenebilen, yolculuk ve yabancı yerleri seven; ticarette ve yeni yollar icat etmede eşsiz.', 'A subtle, strategic intellect; an excellent debater and eloquent speaker; seeks every kind of knowledge and mystery, learns without a teacher, loves travel and foreign places; unmatched in trade and inventing new ways.'),
    ill: l('Dağınık ve huzursuz bir zihin, dedikodu, abartı ve boş konuşma; bir fikirde ya da yerde sebat edememe, yüzeysel bilgiyle yetinme.', 'A scattered, restless mind, gossip, exaggeration and idle talk; inability to stay with one idea or place, settling for shallow knowledge.'),
  },
  moon: {
    well: l('Ölçülü ve yumuşak huylu, ince ruhlu; bilime ve yeniliklere meraklı, yer değiştirmeyi seven, ânı yaşayan; barışçıl, hayatın kaygılarından uzak kalmak isteyen; birçok işi öğrenip denemeye yatkın.', 'Composed and gentle, tender-hearted; curious about learning and novelties, likes to change residence, lives in the present; peace-loving, wishes to be free of life’s cares; apt to learn and try many trades.'),
    ill: l('Kararsızlık, tembellik ve plansızlık; hiçbir koşuldan memnun olamama, kendini başıboş bırakma eğilimi.', 'Indecision, idleness and lack of planning; never content with any condition, a tendency to drift.'),
  },
};

/** Lilly güç puanına göre karakter vurgusu */
export function mannersFor(s: LillyScore): { tone: 'well' | 'ill' | 'mixed'; text: L } {
  const m = LILLY_MANNERS[s.id];
  if (s.essTotal >= 4 || s.total >= 10) return { tone: 'well', text: m.well };
  if (s.essTotal <= -4 && s.total < 0) return { tone: 'ill', text: { tr: `${m.ill.tr} bu zayıflık bilinçli çabayla dengelenebilir; güçlü yönün: ${m.well.tr.charAt(0).toLocaleLowerCase('tr') + m.well.tr.slice(1)}`, en: `${m.ill.en} conscious effort can balance this weakness; your potential strength: ${m.well.en.charAt(0).toLowerCase() + m.well.en.slice(1)}` } };
  return { tone: 'mixed', text: { tr: `Gezegen orta güçte; iki tarafı da taşır. Güçlü yanı: ${m.well.tr} Dikkat edilecek yanı: ${m.ill.tr}`, en: `Moderate strength; both sides can show. Strength: ${m.well.en} Watch for: ${m.ill.en}` } };
}

/** Doğum haritasının en güçlü gezegeni (toplam güç puanına göre) */
export function strongestPlanet(ch: Chart): LillyScore {
  return CLASSICAL.map(id => lillyScore(ch, id)).sort((a, b) => b.total - a.total)[0];
}
