// William Lilly, Christian Astrology, Kitap III (1647) — "An Introduction to Nativities", Bölüm CV–CLI.
// Lilly'nin kural sıraları (hangi gezegen neyi gösterir, hangisi önce gelir) koda dökülmüştür.
// Metinler Lilly'den modern, nötr ve cinsiyetsiz bir dille uyarlanmıştır; ölüm, hastalık ve ömür hükümleri dahil edilmemiştir.
import type { BodyId, Chart } from '../engine/astro';
import { angleDiff, norm } from '../engine/astro';
import { L, SIGNS, BODIES, HOUSES } from './base';
import { ord } from './life';
import { Classical, CLASSICAL, lillyScore, LillyScore, domicileRuler, exaltRuler, LILLY_MANNERS } from './lillyDignity';

const l = (tr: string, en: string): L => ({ tr, en });
const nm = (id: BodyId) => BODIES[id].name;
const BENEFIC: Classical[] = ['jupiter', 'venus'];
const MALEFIC: Classical[] = ['saturn', 'mars'];
const isBenefic = (p: Classical) => BENEFIC.includes(p);
const isMalefic = (p: Classical) => MALEFIC.includes(p);
const ANGULAR = [1, 4, 7, 10], SUCCEDENT = [2, 5, 8, 11], CADENT = [3, 6, 9, 12];
const ORB: Record<Classical, number> = { sun: 15, moon: 12, mercury: 7, venus: 7, mars: 7.5, jupiter: 9, saturn: 9 };
const MOIETY = (a: Classical, b: Classical) => (ORB[a] + ORB[b]) / 2;
const FRUITFUL = [3, 7, 11], BARREN = [2, 4, 5];
const MOVABLE = [0, 3, 6, 9], FIXED = [1, 4, 7, 10];

type Q = 'hot' | 'cold' | 'moist' | 'dry';
export interface Section { title: L; items: { label?: L; text: L }[] }

function aspectBetween(ch: Chart, a: Classical, b: Classical, orb?: number): { type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition'; orb: number } | null {
  const d = angleDiff(ch.positions[a].lon, ch.positions[b].lon);
  const lim = orb ?? MOIETY(a, b);
  for (const [t, ang] of [['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180]] as const) {
    if (Math.abs(d - ang) <= lim) return { type: t, orb: Math.abs(d - ang) };
  }
  return null;
}
const partileAsp = (ch: Chart, a: Classical, b: Classical) => {
  const x = aspectBetween(ch, a, b, 1);
  return x && Math.floor(ch.positions[a].lon % 30) === Math.floor(ch.positions[b].lon % 30) ? x : null;
};
/** Ay'ın burcunu terk etmeden önce uyguladığı ilk gezegen (Ay'ın daha hızlı olduğu varsayımıyla) */
function moonApplications(ch: Chart): Classical[] {
  const m = ch.positions.moon;
  const res: { p: Classical; d: number }[] = [];
  for (const p of CLASSICAL) {
    if (p === 'moon') continue;
    const pl = ch.positions[p].lon;
    for (const ang of [0, 60, 90, 120, 180, -60, -90, -120]) {
      const target = norm(pl + ang);
      const dist = norm(target - m.lon); // Ay'ın ileride bu noktaya varması gereken derece
      if (dist > 0 && dist < 30 - (m.lon % 30)) res.push({ p, d: dist });
    }
  }
  return res.sort((a, b) => a.d - b.d).map(x => x.p).filter((p, i, arr) => arr.indexOf(p) === i);
}

// ================= 1. Doğum haritasının efendisi (Bölüm CV) =================
export function lordOfGeniture(ch: Chart): { lord: LillyScore; runnerUp: LillyScore; text: L } {
  const s = CLASSICAL.map(id => lillyScore(ch, id)).sort((a, b) => b.total - a.total);
  const [a, b] = s;
  const close = a.total - b.total <= 3;
  return {
    lord: a, runnerUp: b,
    text: {
      tr: `Lilly’ye göre doğum haritasının efendisi, hem esas hem ilineksel onurları en fazla olan ve haritada en iyi konumlanan gezegendir; kişinin bütün eylemleri, mizacı ve karakteri az ya da çok bu gezegenin doğasını taşır. Senin haritanda bu gezegen ${nm(a.id).tr} (${a.total > 0 ? '+' : ''}${a.total}).${close ? ` ${nm(b.id).tr} (${b.total > 0 ? '+' : ''}${b.total}) neredeyse aynı güçte; Lilly bu durumda iki gezegenin doğasının karıştığını söyler.` : ''}`,
      en: `Per Lilly, the Lord of the Geniture is the planet with the most essential and accidental dignities, best placed and most elevated; all the native’s actions, temperament and manners partake of its nature. In your chart this is ${nm(a.id).en} (${a.total > 0 ? '+' : ''}${a.total}).${close ? ` ${nm(b.id).en} (${b.total > 0 ? '+' : ''}${b.total}) is nearly as strong; Lilly says their natures then blend.` : ''}`,
    },
  };
}

// ================= 2. Mizaç (Bölüm CVI) =================
const SIGN_Q: [Q, Q][] = [['hot', 'dry'], ['cold', 'dry'], ['hot', 'moist'], ['cold', 'moist']];
function planetQ(ch: Chart, p: Classical): Q[] {
  const P = ch.positions;
  if (p === 'sun') { const s = P.sun.sign; return s <= 2 ? ['hot', 'moist'] : s <= 5 ? ['hot', 'dry'] : s <= 8 ? ['cold', 'dry'] : ['cold', 'moist']; }
  if (p === 'moon') { const e = norm(P.moon.lon - P.sun.lon); return e < 90 ? ['hot', 'moist'] : e < 180 ? ['hot', 'dry'] : e < 270 ? ['cold', 'dry'] : ['cold', 'moist']; }
  const oriental = p === 'venus' || p === 'mercury' ? norm(P[p].lon - P.sun.lon) > 180 : norm(P.sun.lon - P[p].lon) < 180;
  const T: Record<string, [Q[], Q[]]> = { saturn: [['cold', 'moist'], ['dry']], jupiter: [['hot', 'moist'], ['moist']], mars: [['hot', 'dry'], ['dry']], venus: [['hot', 'moist'], ['moist']], mercury: [['hot'], ['dry']] };
  return oriental ? T[p][0] : T[p][1];
}
export const TEMPERAMENTS: Record<'sanguine' | 'choleric' | 'melancholic' | 'phlegmatic', { name: L; desc: L }> = {
  sanguine: { name: l('Sıcakkanlı (Sanguine)', 'Sanguine'), desc: l('Sıcak ve nemli. Lilly’ye göre neşeli, cömert, sadık, cana yakın, barış yapan, açık yürekli ve ölçülü insanlar.', 'Hot and moist. Per Lilly: cheerful, liberal, faithful, affable, peacemakers, open-hearted and modest.') },
  choleric: { name: l('Safralı / ateşli (Choleric)', 'Choleric'), desc: l('Sıcak ve kuru. Lilly’ye göre çabuk parlayan, hırslı, ısrarcı, yönetmeyi seven, cesur ve atak; çoğu zaman zeki ama fikrini kolay değiştiren insanlar. Enerjiyi gereksiz çatışmalara harcamamak önemli.', 'Hot and dry. Per Lilly: quick to anger, ambitious, insistent, commanding, bold and rash; often ingenious but quick to change opinions. Avoid spending energy on needless conflicts.') },
  melancholic: { name: l('Sevdavi / derin (Melancholic)', 'Melancholic'), desc: l('Soğuk ve kuru. Lilly’ye göre kararlarını yavaş veren, planlarını kendine saklayan, sağduyulu, ciddi, tutumlu ve temkinli; kırgınlıkları kolay unutmayan, kendi ölçüsüyle yaşayan insanlar.', 'Cold and dry. Per Lilly: slow to resolve, keeping counsel close, prudent, serious, thrifty and cautious; slow to forget injuries, living by their own standard.') },
  phlegmatic: { name: l('Balgamî / sakin (Phlegmatic)', 'Phlegmatic'), desc: l('Soğuk ve nemli. Lilly’ye göre çatışmadan kaçınan, partnerine çok bağlı, değişken, sır saklamakta zorlanan ve kendi temposunda ilerleyen insanlar. Sakinlik ve uyum en büyük güçleri.', 'Cold and moist. Per Lilly: conflict-averse, devoted to their partner, changeable, finding secrets hard to keep, moving at their own pace. Calm and adaptability are their strengths.') },
};
export function temperament(ch: Chart) {
  const P = ch.positions;
  const tally: Record<Q, number> = { hot: 0, cold: 0, moist: 0, dry: 0 };
  const rows: { who: L; q: Q[] }[] = [];
  const add = (who: L, q: Q[], w = 1) => { for (let i = 0; i < w; i++) q.forEach(x => tally[x]++); rows.push({ who: w > 1 ? { tr: `${who.tr} (×${w})`, en: `${who.en} (×${w})` } : who, q }); };
  const lord = lordOfGeniture(ch).lord.id;
  if (ch.asc !== null) {
    const as = Math.floor(ch.asc / 30);
    add({ tr: `Yükselen ${SIGNS[as].tr}`, en: `${SIGNS[as].en} Ascendant` }, SIGN_Q[as % 4]);
    const al = domicileRuler(as);
    add({ tr: `Yükselen yöneticisi ${nm(al).tr} (${SIGNS[P[al].sign].tr})`, en: `Ascendant ruler ${nm(al).en} (${SIGNS[P[al].sign].en})` }, [...planetQ(ch, al), ...SIGN_Q[P[al].sign % 4]], al === lord ? 3 : 1);
    for (const p of CLASSICAL) {
      if (p === al) continue;
      if (P[p].house === 1) add({ tr: `1. evde ${nm(p).tr}`, en: `${nm(p).en} in the 1st` }, [...planetQ(ch, p), ...SIGN_Q[P[p].sign % 4]], p === 'moon' ? 2 : 1);
    }
  }
  add({ tr: `Ay ${SIGNS[P.moon.sign].tr} (faz)`, en: `Moon in ${SIGNS[P.moon.sign].en} (phase)` }, [...planetQ(ch, 'moon'), ...SIGN_Q[P.moon.sign % 4]]);
  for (const p of CLASSICAL) {
    if (p === 'moon') continue;
    if (aspectBetween(ch, p, 'moon')) add({ tr: `Ay’a açı yapan ${nm(p).tr}`, en: `${nm(p).en} aspecting the Moon` }, planetQ(ch, p));
  }
  add({ tr: `Mevsim (Güneş ${SIGNS[P.sun.sign].tr})`, en: `Season (Sun in ${SIGNS[P.sun.sign].en})` }, planetQ(ch, 'sun'));
  add({ tr: `Harita efendisi ${nm(lord).tr}`, en: `Lord of the Geniture ${nm(lord).en}` }, [...planetQ(ch, lord), ...SIGN_Q[P[lord].sign % 4]]);
  // Lilly: zıt nitelikler birbirini götürür
  const heat = tally.hot - tally.cold, wet = tally.moist - tally.dry;
  const kind = heat >= 0 ? (wet >= 0 ? 'sanguine' : 'choleric') : (wet >= 0 ? 'phlegmatic' : 'melancholic');
  const second = Math.abs(heat) < Math.abs(wet) ? (wet >= 0 ? (heat >= 0 ? 'phlegmatic' : 'sanguine') : (heat >= 0 ? 'melancholic' : 'choleric')) : (heat >= 0 ? (wet >= 0 ? 'choleric' : 'sanguine') : (wet >= 0 ? 'melancholic' : 'phlegmatic'));
  return { tally, rows, kind: kind as keyof typeof TEMPERAMENTS, secondary: second as keyof typeof TEMPERAMENTS, balanced: Math.abs(heat) <= 1 && Math.abs(wet) <= 1 };
}

// ================= 3. Karakter göstergesi (Bölüm CVII–CVIII) =================
const SIGN_MANNERS: L[] = [
  l('zeki ve becerikli', 'witty and ingenious'),
  l('çalışkan ve emekçi', 'laborious and hard-working'),
  l('zeki, öğrenmeyi ve sanatı seven; zaman zaman kurnaz', 'witty, a lover of arts and learning; at times cunning'),
  l('değişken, bir yere sabitlenmeyen', 'changeable, never fixed in one place'),
  l('ağırbaşlı, ölçülü ve sağduyulu; hafif bir kibir payıyla', 'grave, sober and discreet, with a touch of pride'),
  l('öğrenmeyi ve sanatı seven, tutumlu, mücadeleden kaçmayan', 'a lover of learning and arts, thrifty, not shy of contest'),
  l('kurnaz ve değişken, kendi yeteneğine güvenen', 'crafty and changeable, confident in their own gifts'),
  l('cesur ve iyi kavrayışlı; hırslı ve kendinden emin', 'bold and of good understanding; ambitious and self-assured'),
  l('yürekli ve korkusuz', 'valiant and fearless'),
  l('tutkulu, bağlılığı zor; zevklerine düşkün', 'passionate, slow to commit; fond of pleasures'),
  l('çok insancıl, nazik, ölçülü konuşan, kimseyi kıskanmayan ve inancında sadık', 'very humane, affable, speaking soberly, envious of no one, constant in belief'),
  l('kararsız ve kendini gösterişle saklayabilen; samimiyeti korumak önemli', 'wavering, may hide behind appearances; keeping sincerity matters'),
];
const PAIR: Record<string, L> = {
  'saturn+jupiter': l('Satürn ile Jüpiter birleşiyor: Jüpiter Satürn’ün sertliğini yumuşatır; Lilly’ye göre kişi çok sağduyulu, bilge, sakin, iyi danışman ve bilgili olur.', 'Saturn with Jupiter: Jupiter tempers Saturn’s harshness; per Lilly the native is very prudent, wise, calm, of great counsel and learned.'),
  'saturn+mars': l('Satürn ile Mars birleşiyor: Lilly’ye göre Mars’ın ateşiyle başlanan işi Satürn’ün soğukluğu söndürebilir; çok işe başlayıp azını bitirme ve sabırsız çıkışlar eğilimi. Planlı ve kademeli ilerlemek bu gerilimi güce çevirir.', 'Saturn with Mars: per Lilly what Mars’ heat begins, Saturn’s cold may quench; starting much and finishing little, with impatient outbursts. Planned, stepwise progress turns this tension into strength.'),
  'saturn+venus': l('Satürn ile Venüs birleşiyor: Lilly’ye göre zevklere ve gösterişe az düşkün, ciddi, olgun insanlarla vakit geçirmeyi seven, kendi görüşünde kararlı ve ilişkilerde temkinli biri.', 'Saturn with Venus: per Lilly little given to pleasures or display, fond of mature company, firm in opinion and cautious in relationships.'),
  'saturn+mercury': l('Satürn ile Merkür birleşiyor: Lilly’ye göre meraklı bir anlayış, bilgiye açlık, gizemleri çözme yeteneği; tıp, mimarlık, tartışma ve analizde başarı.', 'Saturn with Mercury: per Lilly a curious understanding, hunger for knowledge, the gift of solving mysteries; success in medicine, architecture, debate and analysis.'),
  'jupiter+mars': l('Jüpiter ile Mars birleşiyor: cesaret ile adalet duygusu bir arada; yönetim ve liderlik yeteneği.', 'Jupiter with Mars: courage joined with a sense of justice; a gift for command and leadership.'),
  'jupiter+venus': l('Jüpiter ile Venüs birleşiyor: iki iyi gezegen; nezaket, cömertlik, zarafet ve sevilen bir kişilik.', 'Jupiter with Venus: two benefics; kindness, generosity, grace and a well-loved personality.'),
  'jupiter+mercury': l('Jüpiter ile Merkür birleşiyor: güçlü hitabet, adalet duygusu ve sağlam yargı.', 'Jupiter with Mercury: strong eloquence, a sense of justice and sound judgment.'),
  'mars+venus': l('Mars ile Venüs birleşiyor: tutku, çekicilik ve canlılık; duyguları yoğun yaşama.', 'Mars with Venus: passion, charm and vitality; feeling things intensely.'),
  'mars+mercury': l('Mars ile Merkür birleşiyor: keskin, hızlı ve delici bir zekâ; tartışmada güçlü, sözleri bazen sert.', 'Mars with Mercury: a sharp, quick, piercing mind; strong in debate, words sometimes harsh.'),
  'venus+mercury': l('Venüs ile Merkür birleşiyor: belagat, nükte, sanat ve hoş bir konuşma.', 'Venus with Mercury: eloquence, wit, artistry and pleasant speech.'),
};
const pairKey = (a: Classical, b: Classical) => { const order = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon']; return [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join('+'); };

// Sabit yıldızlar (J2000) — Lilly'nin karakter yorumlarından nötr uyarlama
const STARS: { name: L; lon: number; text: L }[] = [
  { name: l('Algol', 'Algol'), lon: 56.17, text: l('güçlü bir irade ve yoğunluk; öfkeyi yönetmeyi öğrenmek önemli', 'a powerful will and intensity; learning to manage anger matters') },
  { name: l('Ülker (Pleiades)', 'Pleiades'), lon: 60.0, text: l('hırslı, hareketli ve maceracı bir ruh', 'an ambitious, restless, adventurous spirit') },
  { name: l('Aldebaran', 'Aldebaran'), lon: 69.78, text: l('cesur, savaşçı ruhlu ve atılgan', 'courageous, warrior-spirited and enterprising') },
  { name: l('Capella', 'Capella'), lon: 81.85, text: l('meraklı, dikkatli ve her şeyi bilmek isteyen', 'curious, careful and eager to know everything') },
  { name: l('Orion’un Kemeri', 'Orion’s Belt'), lon: 83.47, text: l('keskin anlayış, güçlü hafıza ve çalışkanlık', 'sharp understanding, strong memory and industry') },
  { name: l('Pollux', 'Pollux'), lon: 113.22, text: l('incelik, beceriklilik ve cesaret', 'subtlety, resourcefulness and courage') },
  { name: l('Regulus (Aslan’ın Kalbi)', 'Regulus'), lon: 149.83, text: l('yüce gönüllü, cömert ve medeni; yönetmeye ve liderliğe yatkın', 'magnanimous, generous and civil; inclined to rule and lead') },
  { name: l('Spica', 'Spica'), lon: 203.83, text: l('tatlı mizaçlı, bilim ve sanatta çalışkan; Merkür ile birlikteyse olağanüstü buluş yeteneği', 'sweet-natured, diligent in arts and sciences; with Mercury, remarkable inventiveness') },
  { name: l('Antares (Akrep’in Kalbi)', 'Antares'), lon: 249.77, text: l('atılgan ve kararlı; inatçılığın kendine zarar vermemesine dikkat', 'daring and determined; take care that obstinacy doesn’t backfire') },
  { name: l('Vega', 'Vega'), lon: 285.32, text: l('ağırbaşlı ve ölçülü bir dış görünüş', 'a grave and sober outward manner') },
  { name: l('Altair', 'Altair'), lon: 301.78, text: l('cesur, kendinden emin ve yılmaz', 'bold, confident and unyielding') },
];
const starLon = (base: number, jd: number) => norm(base + ((jd - 2451545) / 365.25) * (50.29 / 3600));

export function manners(ch: Chart): Section {
  const P = ch.positions;
  const items: Section['items'] = [];
  let sig: Classical | null = null; let how: L;
  const inAsc = CLASSICAL.filter(p => P[p].house === 1 && p !== 'sun' && p !== 'moon');
  const joinedMM = CLASSICAL.filter(p => p !== 'moon' && p !== 'mercury' && (aspectBetween(ch, p, 'moon', 6)?.type === 'conjunction' || aspectBetween(ch, p, 'mercury', 6)?.type === 'conjunction'));
  if (inAsc.length) {
    sig = inAsc.map(p => lillyScore(ch, p)).sort((a, b) => b.total - a.total)[0].id;
    how = l(`${nm(sig).tr} 1. evde olduğu için`, `because ${nm(sig).en} occupies the 1st house`);
  } else if (joinedMM.length) {
    sig = joinedMM.map(p => lillyScore(ch, p)).sort((a, b) => b.total - a.total)[0].id;
    how = l(`${nm(sig).tr} Ay’a veya Merkür’e kavuştuğu için`, `because ${nm(sig).en} is joined to the Moon or Mercury`);
  } else if (ch.asc !== null) {
    sig = domicileRuler(Math.floor(ch.asc / 30));
    how = l(`1. evde gezegen olmadığı için yükselenin yöneticisi ${nm(sig).tr}`, `no planet in the 1st, so the Ascendant ruler ${nm(sig).en}`);
  } else {
    const cands = CLASSICAL.filter(p => p !== 'moon' && p !== 'mercury' && (partileAsp(ch, p, 'moon') || partileAsp(ch, p, 'mercury')));
    sig = cands[0] ?? domicileRuler(P.mercury.sign);
    how = l(`Ay ve Merkür’e en güçlü bağlanan gezegen ${nm(sig).tr}`, `the planet most strongly linked to the Moon and Mercury, ${nm(sig).en}`);
  }
  const sc = lillyScore(ch, sig);
  const strong = sc.total >= 5, weak = sc.total < 0;
  let tone: L;
  if (isMalefic(sig)) tone = strong ? l('Güçlü bir “zor” gezegen: Lilly’ye göre iyi ve değerli nitelikler, ama hep biraz sertlik ya da keskinlik karışık.', 'A strong malefic: per Lilly, good and worthy qualities, but always mixed with some sharpness or harshness.') : l('Zayıf bir “zor” gezegen: Lilly bu durumda gezegenin gölge yanlarının öne çıkabileceğini söyler; bunu bilmek, bilinçli olarak dengelemeyi sağlar.', 'A weak malefic: Lilly says the planet’s shadow side may show; knowing this lets you balance it consciously.');
  else if (isBenefic(sig)) tone = strong ? l('Güçlü bir iyi gezegen: Lilly’ye göre övgüye değer, tam ve olgun bir karakter.', 'A strong benefic: per Lilly, laudable, complete and mature manners.') : l('Zayıf bir iyi gezegen: Lilly’ye göre iyi ve sağlıklı nitelikler dışarıdan görünür, ama içte biraz bulanık ya da çok sade kalabilir.', 'A weak benefic: per Lilly, good and wholesome manners show outwardly, though inwardly somewhat clouded or simple.');
  else tone = strong ? l('Güçlü konumda: gezegenin olumlu nitelikleri belirgin.', 'Strongly placed: the planet’s positive qualities stand out.') : l('Orta ya da zayıf konumda: nitelikler daha az belirgin ve değişken.', 'Moderately or weakly placed: qualities are less marked and variable.');
  items.push({ label: l('Karakter göstergen', 'Your significator of manners'), text: { tr: `${nm(sig).tr} — ${how.tr}. ${tone.tr}`, en: `${nm(sig).en} — ${how.en}. ${tone.en}` } });
  const m = LILLY_MANNERS[sig];
  items.push({ label: l('Lilly’nin tarifi', 'Lilly’s description'), text: strong || (!weak && !isMalefic(sig)) ? m.well : weak ? { tr: `${m.ill.tr} (Güçlü yön olarak: ${m.well.tr})`, en: `${m.ill.en} (Its potential: ${m.well.en})` } : { tr: `${m.well.tr} Dikkat: ${m.ill.tr}`, en: `${m.well.en} Watch for: ${m.ill.en}` } });
  items.push({ label: l('Göstergenin burcu', 'Sign of the significator'), text: { tr: `${nm(sig).tr} ${SIGNS[P[sig].sign].tr} burcunda: eski ustalara göre kişi ${SIGN_MANNERS[P[sig].sign].tr}.`, en: `${nm(sig).en} in ${SIGNS[P[sig].sign].en}: per the ancients the native is ${SIGN_MANNERS[P[sig].sign].en}.` } });
  // Dispozitör
  const disp = domicileRuler(P[sig].sign);
  if (disp !== sig) items.push({ label: l('Dispozitör', 'Dispositor'), text: { tr: `${nm(sig).tr} ${SIGNS[P[sig].sign].tr} burcunda olduğu için yöneticisi ${nm(disp).tr} de karaktere katılır: ${LILLY_MANNERS[disp].well.tr.split(';')[0]}.`, en: `As ${nm(sig).en} is in ${SIGNS[P[sig].sign].en}, its dispositor ${nm(disp).en} also shapes character: ${LILLY_MANNERS[disp].well.en.split(';')[0]}.` } });
  // Merkür'ün doğası: kavuştuğu gezegen ya da dispozitörü
  const mConj = CLASSICAL.filter(p => p !== 'mercury' && aspectBetween(ch, p, 'mercury', 6)?.type === 'conjunction').map(p => lillyScore(ch, p)).sort((a, b) => b.total - a.total)[0];
  const mNat = mConj ? mConj.id : domicileRuler(P.mercury.sign);
  if (mNat !== 'mercury') items.push({ label: l('Merkür’ün aldığı renk', 'Mercury’s colouring'), text: { tr: `Lilly’ye göre Merkür ${mConj ? 'kavuştuğu' : 'bulunduğu burcun yöneticisi olan'} gezegenin doğasını alır: ${nm(mNat).tr}. ${mNat === 'saturn' ? 'Daha temkinli, sebatlı ve kararlı bir zihin.' : mNat === 'jupiter' ? 'Daha dürüst, bilgili ve doğru yargılı bir zihin.' : mNat === 'mars' ? 'Daha cesur ve iddialı bir zihin.' : mNat === 'sun' ? 'Hırslı ve gururlu bir zihin.' : mNat === 'venus' ? 'Daha belagatli ve sevimli bir dil.' : 'Daha değişken ve hareketli bir zihin.'}`, en: `Per Lilly, Mercury takes on the nature of the planet ${mConj ? 'it is joined to' : 'that rules its sign'}: ${nm(mNat).en}. ${mNat === 'saturn' ? 'A more wary, constant, persevering mind.' : mNat === 'jupiter' ? 'A more honest, learned mind of upright judgment.' : mNat === 'mars' ? 'A bolder, more assertive mind.' : mNat === 'sun' ? 'An ambitious, proud mind.' : mNat === 'venus' ? 'More eloquent and endearing speech.' : 'A more changeable, restless mind.'}` } });
  // Çiftler
  for (const p of CLASSICAL) {
    if (p === sig) continue;
    const a = aspectBetween(ch, sig, p);
    const k = pairKey(sig, p);
    if (a && PAIR[k]) items.push({ label: l('Gezegen karışımı', 'Planetary mixture'), text: PAIR[k] });
  }
  // Işıklar
  const moonWax = norm(P.moon.lon - P.sun.lon) < 180;
  if (aspectBetween(ch, sig, 'moon')) items.push({ text: moonWax ? l('Ay göstergeye bakıyor ve ışığı artıyor: Lilly’ye göre karakterin erken yaşta ve açıkça ortaya çıkar.', 'The waxing Moon aspects the significator: per Lilly, your character shows early and openly.') : l('Ay göstergeye bakıyor ama ışığı azalıyor: karakter daha içe dönük ve geç fark edilir.', 'The waning Moon aspects the significator: character is more inward and noticed later.') });
  // Sabit yıldızlar
  for (const s of STARS) {
    const sl = starLon(s.lon, ch.jdUT);
    for (const p of [sig, ...(ch.asc !== null ? [] : [])] as Classical[]) if (angleDiff(P[p].lon, sl) < 1.5) items.push({ label: l('Sabit yıldız', 'Fixed star'), text: { tr: `${nm(p).tr}, ${s.name.tr} yıldızıyla kavuşuk: ${s.text.tr}.`, en: `${nm(p).en} conjunct ${s.name.en}: ${s.text.en}.` } });
    if (ch.asc !== null && angleDiff(ch.asc, sl) < 1.5) items.push({ label: l('Sabit yıldız', 'Fixed star'), text: { tr: `Yükselen ${s.name.tr} ile kavuşuk: ${s.text.tr}.`, en: `Ascendant conjunct ${s.name.en}: ${s.text.en}.` } });
  }
  return { title: l('Karakterin', 'Your character'), items };
}

// ================= 4. Zekâ ve anlayış (Bölüm CIX) =================
export function wit(ch: Chart): Section {
  const P = ch.positions; const items: Section['items'] = [];
  const mm = aspectBetween(ch, 'mercury', 'moon');
  const ms = lillyScore(ch, 'mercury'), mo = lillyScore(ch, 'moon');
  if (!mm) items.push({ text: l('Merkür ile Ay arasında açı yok: Lilly’ye göre akıl ile duygular ayrı kanallardan çalışır; zihni geliştirmek için düzenli çalışma ve okuma özellikle verimlidir.', 'No aspect between Mercury and the Moon: per Lilly reason and feeling run in separate channels; steady study and reading are especially fruitful.') });
  else if (['trine', 'sextile', 'conjunction'].includes(mm.type)) items.push({ text: l('Merkür ile Ay uyumlu açıda: Lilly’ye göre akıl ile ruh arasında uyum vardır; buradan güçlü ve parlak bir zekâ doğar.', 'Mercury and the Moon in harmonious aspect: per Lilly reason and soul agree, producing an excellent, strong wit.') });
  else items.push({ text: mm.type === 'square' ? l('Merkür–Ay karesi: yeterli zekâ, ama daha sert ve köşeli bir hayal gücü.', 'Mercury–Moon square: wit enough, but a more rugged fancy.') : l('Merkür–Ay karşıtı: Lilly’ye göre inatçı ve hareketli bir zihin; aceleci kararları dengelemek önemli.', 'Mercury–Moon opposition: per Lilly a stubborn, restless mind; balancing hasty decisions matters.') });
  items.push({ text: ms.total > mo.total ? l('Merkür Ay’dan güçlü: Lilly’ye göre bu kişide akıl, duyguların ve tutkuların üstüne çıkar.', 'Mercury stronger than the Moon: per Lilly, reason masters the passions.') : l('Ay Merkür’den güçlü: Lilly’ye göre duygular ve sezgiler çoğu zaman aklın önüne geçer.', 'The Moon stronger than Mercury: per Lilly, feelings and instincts often prevail over reason.') });
  const m = P.mercury;
  const aboveEarth = m.house >= 7 && m.house <= 12;
  if (m.house) items.push({ text: aboveEarth ? l('Merkür ufkun üstünde: Lilly’ye göre hitabete ve konuşmaya yatkın bir zihin.', 'Mercury above the horizon: per Lilly, inclined to oratory and speech.') : l('Merkür ufkun altında: Lilly’ye göre zihin daha çok sanata ve uygulamalı becerilere yönelir.', 'Mercury below the horizon: per Lilly, the mind leans to arts and practical skill.') });
  const fast = Math.abs(m.speed) > 1.2;
  items.push({ text: m.retro ? l('Merkür retro: Lilly’ye göre fikirlerini geç ifade eden, düşünceyi içte uzun süre işleyen biri.', 'Mercury retrograde: per Lilly, slow to voice ideas, turning thoughts over inwardly.') : fast ? l('Merkür hızlı: çabuk kavrayan ama fikir değiştirmeye yatkın; yine de görüşlerini iyi gerekçelendirir.', 'Mercury swift: quick to grasp, apt to change opinions, though giving good reasons.') : l('Merkür ölçülü hızda: dengeli bir düşünme temposu.', 'Mercury at moderate speed: a balanced pace of thought.') });
  const sd = angleDiff(m.lon, P.sun.lon);
  if (sd < 17 / 60) items.push({ text: l('Merkür kazimi: Güneş’in tam kalbinde; çok güçlü bir zihin.', 'Mercury cazimi: in the heart of the Sun; a very powerful mind.') });
  else if (sd < 17) items.push({ text: l('Merkür Güneş’e çok yakın (yanık/ışın altında): Lilly’ye göre zihin bazen gereksiz ayrıntılara takılabilir; odak seçmek önemli.', 'Mercury close to the Sun (combust/under beams): per Lilly the mind may meddle in trifles; choosing a focus matters.') });
  const occidental = norm(m.lon - P.sun.lon) < 180;
  items.push({ text: occidental ? l('Merkür batılı (akşam yıldızı): daha temkinli ve düşüncelerini saklayan bir zihin.', 'Mercury occidental (evening star): a more guarded mind, keeping thoughts close.') : l('Merkür doğulu (sabah yıldızı): Lilly’ye göre daha açık ve cömert bir doğa.', 'Mercury oriental (morning star): per Lilly, a more open, liberal nature.') });
  if ([2, 6, 10].includes(m.sign) && (aspectBetween(ch, 'mercury', 'saturn')?.type === 'trine' || aspectBetween(ch, 'mercury', 'saturn')?.type === 'sextile' || aspectBetween(ch, 'mercury', 'jupiter')?.type === 'trine' || aspectBetween(ch, 'mercury', 'jupiter')?.type === 'sextile'))
    items.push({ text: l('Merkür hava burcunda ve Satürn/Jüpiter ile uyumlu: Lilly’ye göre çok keskin, nükteli bir zekâ ve dil yeteneği.', 'Mercury in an air sign in harmony with Saturn/Jupiter: per Lilly a most acute, witty mind and a gift for languages.') });
  if (ANGULAR.includes(m.house) && [2, 5].includes(m.sign)) items.push({ text: l('Merkür köşe evde ve kendi burcunda: Lilly’ye göre her işe uygun, becerikli bir zekâ.', 'Mercury angular in its own sign: per Lilly a wit fit for any employment.') });
  const rec = domicileRuler(m.sign) === 'saturn' || exaltRuler(m.sign) === 'saturn';
  if (rec) items.push({ text: l('Merkür Satürn’ün burcunda: Lilly’ye göre derin ve özgün bir hayal gücü.', 'Mercury in Saturn’s sign: per Lilly a wonderfully deep imagination.') });
  return { title: l('Zihnin ve zekân', 'Your mind and wit'), items };
}

// ================= 5. Zenginlik (Bölüm CXIII–CXVII) =================
const PLANET_SOURCE: Record<Classical, L> = {
  saturn: l('toprak, gayrimenkul, maden, inşaat, tarım, miras, uzun vadeli birikim ve yaşlı/köklü kişiler', 'land, property, mining, building, agriculture, inheritance, long-term savings and elders'),
  jupiter: l('kamu görevi, hukuk, eğitim, din/etik kurumları, saygın kişilerin tavsiyesi ve dürüst ün', 'public office, law, education, religious/ethical institutions, recommendation by notable people and honest reputation'),
  mars: l('rekabet, cesaret isteyen işler, mühendislik, ateş ve metal işleri, askeri/güvenlik alanları', 'competition, daring ventures, engineering, fire and metal work, military/security fields'),
  sun: l('yöneticiler, devlet, otorite sahipleri ve yüksek makamlar', 'leaders, government, authority figures and high office'),
  venus: l('kadınlar, dostluklar, hediyeler, evlilik, sanat, müzik, moda, güzellik ve keyif sektörleri', 'women, friendships, gifts, marriage, art, music, fashion, beauty and pleasure industries'),
  mercury: l('zekâ, ticaret, yazı, sözleşmeler, yolculuklar, hesap ve iletişim', 'wit, trade, writing, contracts, journeys, accounting and communication'),
  moon: l('halk, kamuoyu, sık değişen işler, su ve deniz, yolculuk ve gıda', 'the public, frequently changing work, water and sea, travel and food'),
};
const ELEMENT_SOURCE: L[] = [l('ateşle yapılan işler, rekabet ve girişim', 'things made by fire, competition and enterprise'), l('topraktan gelen ürünler ve somut varlıklar', 'the fruits of the earth and tangible assets'), l('fikirler, iletişim ve yetkililerin desteği', 'ideas, communication and the favour of authorities'), l('su, deniz, ticaret yolları ve duygusal bağlar', 'water, sea, trade routes and emotional ties')];
const HOUSE_SOURCE: L[] = [
  l('kendi emeğin ve kişisel çaban', 'your own effort'), l('kendi kazancın ve birikimin', 'your own earnings and savings'), l('kardeşler, yakın çevre ve kısa yolculuklar', 'siblings, neighbours and short trips'),
  l('baba, aile mülkü, toprak ve gayrimenkul', 'the father, family property, land and real estate'), l('çocuklar, keyif, eğlence ve yaratıcı işler', 'children, pleasure, entertainment and creative work'), l('hizmet, çalışanlar ve günlük iş', 'service, employees and daily work'),
  l('evlilik, ortaklık ve anlaşmalar', 'marriage, partnership and agreements'), l('miras, partnerin parası ve ortak kaynaklar', 'inheritance, partner’s money and shared resources'), l('yurt dışı, uzun yolculuk, eğitim ve yayın', 'abroad, long journeys, education and publishing'),
  l('meslek, kariyer ve otorite', 'profession, career and authority'), l('arkadaşlar, destekçiler ve görev/ünvanlar', 'friends, supporters and offices/titles'), l('gizli işler, büyük kurumlar ve tek başına çalışma', 'behind-the-scenes work, large institutions and solitary work'),
];
export function wealth(ch: Chart): Section | null {
  if (!ch.cusps.length || !ch.positions.fortune) return null;
  const P = ch.positions; const items: Section['items'] = [];
  const s2 = Math.floor(ch.cusps[1] / 30);
  const lord2 = domicileRuler(s2);
  const pofDisp = domicileRuler(P.fortune.sign);
  const in2 = CLASSICAL.filter(p => P[p].house === 2);
  const sigs = [...new Set<Classical>([lord2, ...in2, pofDisp, 'jupiter'])];
  const scored = sigs.map(p => ({ p, s: lillyScore(ch, p), ang: ANGULAR.includes(P[p].house) }));
  const strongN = scored.filter(x => x.s.total >= 5).length, weakN = scored.filter(x => x.s.total < 0).length;
  const level = strongN >= Math.ceil(sigs.length * 0.6) ? l('Göstergelerin çoğu güçlü: Lilly’ye göre büyük bir varlık edinme ve hiçbir şeye muhtaç olmama potansiyeli.', 'Most significators are strong: per Lilly, potential for a great estate and want of nothing.')
    : weakN >= Math.ceil(sigs.length * 0.6) ? l('Göstergelerin çoğu zayıf: maddi konular emek ister; Lilly’ye göre birikim yapmak zor olabilir, bu yüzden bütçe ve disiplin özellikle önemli.', 'Most significators are weak: material matters take effort; per Lilly saving may be hard, so budgeting and discipline matter greatly.')
    : l('Güçlü ve zayıf göstergeler karışık: Lilly’ye göre dalgalı bir talih; bazı dönemler kazandırır, bazıları kaybettirir, ama kişi ne çok zengin ne de muhtaç olur.', 'Strong and weak significators are mixed: per Lilly an inconstant fortune; some periods gain, some lose, yet one is neither very rich nor in want.');
  items.push({ label: l('Varlık göstergelerin', 'Significators of substance'), text: { tr: `${sigs.map(p => `${nm(p).tr} (${lillyScore(ch, p).total > 0 ? '+' : ''}${lillyScore(ch, p).total})`).join(', ')}. ${level.tr}`, en: `${sigs.map(p => `${nm(p).en} (${lillyScore(ch, p).total > 0 ? '+' : ''}${lillyScore(ch, p).total})`).join(', ')}. ${level.en}` } });
  // Kaynak
  const strongOnes = scored.filter(x => x.s.total >= 0).sort((a, b) => b.s.total - a.s.total).slice(0, 2);
  for (const x of strongOnes) items.push({ label: l('Kazanç kaynağı', 'Source of gain'), text: { tr: `${nm(x.p).tr} (${SIGNS[P[x.p].sign].tr}, ${P[x.p].house}. ev): ${PLANET_SOURCE[x.p].tr}; burcun doğası: ${ELEMENT_SOURCE[P[x.p].sign % 4].tr}; ev: ${HOUSE_SOURCE[P[x.p].house - 1].tr}.`, en: `${nm(x.p).en} (${SIGNS[P[x.p].sign].en}, ${ord(P[x.p].house)}): ${PLANET_SOURCE[x.p].en}; sign nature: ${ELEMENT_SOURCE[P[x.p].sign % 4].en}; house: ${HOUSE_SOURCE[P[x.p].house - 1].en}.` } });
  const weakOnes = scored.filter(x => x.s.total < 0);
  for (const x of weakOnes) items.push({ label: l('Dikkat edilecek alan', 'Area to watch'), text: { tr: `${nm(x.p).tr} zayıf ve ${P[x.p].house}. evde: Lilly’ye göre kayıp ya da engel en çok ${HOUSE_SOURCE[P[x.p].house - 1].tr} üzerinden gelebilir.`, en: `${nm(x.p).en} is weak in the ${ord(P[x.p].house)}: per Lilly, loss or hindrance may come mostly through ${HOUSE_SOURCE[P[x.p].house - 1].en}.` } });
  // Zenginlik aforizmaları
  const aph: L[] = [];
  const js = lillyScore(ch, 'jupiter'), ms = lillyScore(ch, 'moon');
  if (P.moon.house === 1 && ms.total > 0) aph.push(l('Ay 1. evde ve iyi durumda: Lilly’ye göre hayat boyu varlık ve itibar.', 'A fortunate Moon in the 1st: per Lilly, wealth and esteem all life long.'));
  if ((P.jupiter.house === 2 && P.moon.house === 1) || (P.jupiter.house === 1 && js.essTotal > 0 && P.moon.house === 2)) aph.push(l('Jüpiter ile Ay 1. ve 2. evlerde: Lilly’ye göre varlık vaadi.', 'Jupiter and the Moon in the 1st and 2nd: per Lilly a promise of wealth.'));
  const sat = lillyScore(ch, 'saturn');
  if (sat.essTotal > 0 && ch.asc !== null && Math.abs(angleDiff(P.saturn.lon, ch.asc) - 120) < 6) aph.push(l('Güçlü Satürn yükselene üçgen: Lilly’ye göre toprak, bahçe, tarla ve mülk yoluyla zenginlik.', 'A strong Saturn trine the Ascendant: per Lilly, riches through land, orchards, fields and property.'));
  const lord8 = domicileRuler(Math.floor(ch.cusps[7] / 30));
  if (P[lord8].house === 10 && lillyScore(ch, lord8).essTotal > 0) aph.push(l('8. evin güçlü yöneticisi 10. evde: Lilly’ye göre miras ya da başkalarının kaynaklarından kazanç.', 'A dignified 8th-house ruler in the 10th: per Lilly, gain by inheritance or others’ resources.'));
  if (aspectBetween(ch, 'moon', 'saturn')?.type === 'conjunction' && ANGULAR.includes(P.moon.house)) aph.push(l('Ay ile Satürn köşe evde kavuşuk: Lilly’ye göre maddi dalgalanmalara karşı temkinli olmak gerekir.', 'Moon conjunct Saturn in an angle: per Lilly, be cautious of material reversals.'));
  aph.forEach(a => items.push({ label: l('Lilly’nin aforizması', 'Lilly’s aphorism'), text: a }));
  // Meşru yol
  const mainSig = in2.length ? in2.map(p => lillyScore(ch, p)).sort((a, b) => b.total - a.total)[0].id : lord2;
  const ms2 = lillyScore(ch, mainSig);
  const goodWay = isBenefic(mainSig) && !ms2.essential.some(e => e.pts < 0) && !P[mainSig].retro;
  items.push({ label: l('Kazancın yolu (Bölüm CXVI)', 'Means of gain (Ch. CXVI)'), text: goodWay ? l('Ana gösterge iyi bir gezegen ve sağlam: Lilly’ye göre kazanç meşru ve dürüst yollardan gelir.', 'The main significator is a sound benefic: per Lilly, gain comes by lawful, honest means.') : l('Ana gösterge karışık durumda: Lilly bu durumda kazancın hem düz hem de dolambaçlı yollardan gelebileceğini söyler; şeffaf ve yazılı anlaşmalar seni korur.', 'The main significator is mixed: Lilly says gain may come by both straight and roundabout ways; transparent, written agreements protect you.') });
  // Süreklilik (Bölüm CXVII)
  const dur = ms2.total >= 5 ? l('Varlık kalıcı: Lilly’ye göre hayat boyu fazla sarsıntı olmadan sürer.', 'Durable estate: per Lilly it lasts all life without much disturbance.') : ms2.total >= 0 ? l('Varlık sürer ama emekle korunur: kazanılanı korumak da kazanmak kadar çaba ister.', 'The estate lasts but needs effort: keeping takes as much work as getting.') : l('Varlık dalgalı: birikimi korumak için güvenli yatırım ve acil durum fonu Lilly’nin uyarısına en iyi yanıttır.', 'The estate fluctuates: secure investments and an emergency fund are the best answer to Lilly’s warning.');
  items.push({ label: l('Varlığın sürekliliği (Bölüm CXVII)', 'Durability (Ch. CXVII)'), text: dur });
  // Zaman: en güçlü göstergenin bulunduğu çeyrek
  const best = scored.sort((a, b) => b.s.total - a.s.total)[0];
  const h = P[best.p].house;
  const when = [10, 11, 12].includes(h) ? l('gençlikte', 'in youth') : [7, 8, 9].includes(h) ? l('yetişkinlikte (yaklaşık 25–40 yaş)', 'in adulthood (about 25–40)') : [4, 5, 6].includes(h) ? l('olgunlukta (yaklaşık 40–50 yaş)', 'in maturity (about 40–50)') : l('ileri yaşlarda', 'in later life');
  items.push({ label: l('Bolluğun zamanı', 'Timing of prosperity'), text: { tr: `En güçlü varlık göstergen ${nm(best.p).tr} ${h}. evde: Lilly’nin çeyrek kuralına göre bolluk en çok ${when.tr} gelir.`, en: `Your strongest significator ${nm(best.p).en} is in the ${ord(h)}: by Lilly’s quarter rule, prosperity comes mostly ${when.en}.` } });
  return { title: l('Para ve varlık', 'Money and wealth'), items };
}

// ================= 6. Evlilik (Bölüm CXXX–CXXXVII) =================
const SPOUSE_BY_PLANET: Record<Classical, { well: L; ill: L } | null> = {
  saturn: { well: l('sessiz, ciddi, düşünceli, tutumlu ve çalışkan bir partner', 'a quiet, serious, thoughtful, thrifty and hard-working partner'), ill: l('zor beğenen, kuşkucu, inatçı ya da durgun bir partner; sabır ve açık iletişim gerekir', 'a demanding, suspicious, stubborn or sluggish partner; patience and clear communication are needed') },
  jupiter: { well: l('çok dürüst, yumuşak huylu, ahlaklı ve evini iyi yöneten bir partner', 'a very honest, gentle, principled partner who runs a good home'), ill: l('iyi niteliklere sahip ama bunları gösteremeyen, gölgede kalan bir partner', 'a partner with good virtues that stay clouded and unseen') },
  mars: { well: l('sıcak kalpli, cesur, boyun eğmeyen, haksızlığa tahammül etmeyen güçlü iradeli bir partner', 'a warm-hearted, brave partner who won’t be subdued or accept injustice; strong-willed'), ill: l('tartışmacı, inatçı, aceleci ve savurgan olabilen bir partner; çatışma yönetimi önemli', 'a partner who may be quarrelsome, stubborn, rash and extravagant; conflict management matters') },
  sun: null,
  venus: { well: l('güzel, hoş, nazik, kibar, cana yakın ve erdemli bir partner', 'a fair, pleasant, kind, courteous, affable and virtuous partner'), ill: l('kibirli, savurgan, çok konuşan ve parayı kolay harcayan bir partner', 'a vain, wasteful, talkative partner who spends easily') },
  mercury: { well: l('zeki, dikkatli, hoş konuşan ve ailesini düşünen bir partner', 'a clever, careful, well-spoken partner who provides for the family'), ill: l('çok konuşan, tutarsız ve ortamda gerginlik yaratabilen bir partner', 'a talkative, inconsistent partner who may stir discord') },
  moon: null,
};
export function marriage(ch: Chart): Section | null {
  if (!ch.cusps.length) return null;
  const P = ch.positions; const items: Section['items'] = [];
  const s7 = Math.floor(ch.cusps[6] / 30);
  const lord7 = domicileRuler(s7), lord1 = ch.asc !== null ? domicileRuler(Math.floor(ch.asc / 30)) : null;
  // İsteklilik (CXXX)
  const barrenCadent = (p: Classical) => BARREN.includes(P[p].sign) && [...CADENT, 8].includes(P[p].house);
  const saturnElevated = P.saturn.house >= 9 && P.saturn.house <= 11 && lillyScore(ch, 'saturn').total > 5;
  const signs: L[] = [];
  if (barrenCadent('venus') && barrenCadent('moon')) signs.push(l('Venüs ve Ay kısır burçlarda ve düşen evlerde: Lilly’ye göre evliliğe isteksizlik ya da bağımsız yaşam tercihi.', 'Venus and the Moon in barren signs and cadent houses: per Lilly, aversion to marriage or a preference for single life.'));
  if (saturnElevated && (aspectBetween(ch, 'saturn', 'venus') || aspectBetween(ch, 'saturn', 'moon'))) signs.push(l('Güçlü ve yüksekteki Satürn Venüs/Ay’a bakıyor: evliliğe temkinli, geç ve ciddi yaklaşım.', 'A strong, elevated Saturn aspects Venus/Moon: a cautious, late and serious approach to marriage.'));
  if (FRUITFUL.includes(P.venus.sign) || FRUITFUL.includes(P.moon.sign) || ANGULAR.includes(P.venus.house)) signs.push(l('Venüs ya da Ay verimli burçta veya Venüs köşe evde: Lilly’ye göre evlilik ve birlikte yaşam isteği güçlü.', 'Venus or the Moon in fruitful signs, or Venus angular: per Lilly, a strong desire to marry and share life.'));
  if (lord1 && aspectBetween(ch, lord1, lord7) && lord1 !== lord7) signs.push({ tr: `Yükselenin yöneticisi ${nm(lord1).tr} ile 7. evin yöneticisi ${nm(lord7).tr} açı yapıyor: Lilly’ye göre evlilik arzusu ve ilişki kurma yeteneği güçlü.`, en: `The Ascendant ruler ${nm(lord1).en} aspects the 7th ruler ${nm(lord7).en}: per Lilly, a strong wish and ability to marry.` });
  if (!signs.length) signs.push(l('Belirgin bir aşırı işaret yok: evlilik konusu koşullara ve kişisel tercihe göre şekillenir.', 'No strong testimony either way: marriage follows circumstances and personal choice.'));
  signs.forEach(s => items.push({ label: l('Evlilik isteği (Bölüm CXXX)', 'Inclination to marry (Ch. CXXX)'), text: s }));
  // Kolaylık (CXXXI)
  const msig = [lord7, 'venus', 'moon'] as Classical[];
  const avg = msig.reduce((s, p) => s + lillyScore(ch, p).total, 0) / msig.length;
  const venusMars = aspectBetween(ch, 'venus', 'mars');
  const malIn7 = (['saturn', 'mars'] as Classical[]).filter(p => P[p].house === 7);
  let ease: L = avg >= 5 ? l('Evlilik göstergeleri güçlü: Lilly’ye göre partner bulmak kolay olur.', 'Marriage significators are strong: per Lilly, finding a partner comes easily.') : avg >= 0 ? l('Göstergeler orta güçte: uygun partneri bulmak biraz zaman ve emek ister.', 'Significators are moderate: the right partner takes some time and effort.') : l('Göstergeler zayıf: Lilly’ye göre birçok kişiyle tanışma ama karar vermede zorluk; acele etmeden seçici olmak en iyisi.', 'Significators are weak: per Lilly, many acquaintances but difficulty deciding; being selective without haste is best.');
  if (!venusMars) ease = { tr: `${ease.tr} Venüs ile Mars arasında açı yok: Lilly’ye göre aşkta bazı aksilikler ve zamanlama sorunları.`, en: `${ease.en} No aspect between Venus and Mars: per Lilly, some crosses and timing issues in love.` };
  if (malIn7.length) ease = { tr: `${ease.tr} ${malIn7.map(p => nm(p).tr).join(' ve ')} 7. evde: Lilly bu durumda partner bulmanın olağanüstü emek gerektirdiğini gözlemlemiştir; ama sonunda ilişki kurulur.`, en: `${ease.en} ${malIn7.map(p => nm(p).en).join(' and ')} in the 7th: Lilly observed this requires extraordinary effort, but a bond is formed in the end.` };
  items.push({ label: l('Kolaylık (Bölüm CXXXI)', 'Ease (Ch. CXXXI)'), text: ease });
  // Partnerin geldiği yer (CXXXIII)
  const origin: L[] = [];
  const s9 = Math.floor(ch.cusps[8] / 30), lord9 = domicileRuler(s9);
  if (P[lord7].house === 9 || P[lord9].house === 7) origin.push(l('7. ve 9. ev yöneticileri bağlantılı: Lilly’ye göre partner doğduğun yerden uzak, farklı bir şehir ya da kültürden; inançlı, eğitimli ve erdemli biri.', 'The 7th and 9th rulers are linked: per Lilly the partner comes from far from your birthplace, another city or culture; principled, educated and virtuous.'));
  if ([3, 9].includes(P.venus.house) || [3, 9].includes(P.moon.house) || lillyScore(ch, lord7).peregrine) origin.push(l('Evlilik göstergeleri 3./9. evde ya da peregrin: Lilly’ye göre doğduğun yerden olmayan biriyle evlilik.', 'Marriage significators in the 3rd/9th or peregrine: per Lilly, marriage to someone not from your birthplace.'));
  if (lord9 === 'venus' && [1, 10].includes(P.venus.house)) origin.push(l('9. evin yöneticisi Venüs 1. ya da 10. evde: Lilly’ye göre partner başka bir ülkede doğmuş olabilir.', 'Venus, ruler of the 9th, in the 1st or 10th: per Lilly the partner may be born in another country.'));
  const tri = (sgn: number) => sgn % 4;
  const dirs = [P[lord7].sign, s7, P.venus.sign, P.moon.sign].map(tri);
  const dirName = [l('doğu', 'east'), l('güney', 'south'), l('batı', 'west'), l('kuzey', 'north')];
  const cnt = [0, 0, 0, 0]; dirs.forEach(d => cnt[d]++);
  origin.push({ tr: `Burçların yönlerine göre (Lilly’nin üçlük kuralı) partnerin en olası yönü: ${dirName[cnt.indexOf(Math.max(...cnt))].tr}.`, en: `By the signs’ directions (Lilly’s triplicity rule) the partner’s most likely direction: ${dirName[cnt.indexOf(Math.max(...cnt))].en}.` });
  origin.forEach(o => items.push({ label: l('Partnerin geldiği yer (Bölüm CXXXIII)', 'Where the partner comes from (Ch. CXXXIII)'), text: o }));
  // Partnerin karakteri (CXXXIV): Ay'ın uyguladığı gezegen
  const apps = moonApplications(ch).filter(p => SPOUSE_BY_PLANET[p]);
  const spSig = apps[0] ?? (SPOUSE_BY_PLANET[lord7] ? lord7 : null);
  if (spSig) {
    const sp = SPOUSE_BY_PLANET[spSig]!; const ok = lillyScore(ch, spSig).total >= 0;
    items.push({ label: l('Partnerin karakteri (Bölüm CXXXIV)', 'The partner’s character (Ch. CXXXIV)'), text: { tr: `${apps[0] ? `Ay’ın uyguladığı ilk gezegen ${nm(spSig).tr}` : `7. evin yöneticisi ${nm(spSig).tr}`} ${ok ? 'iyi durumda' : 'zorlanmış durumda'}: Lilly’ye göre ${ok ? sp.well.tr : sp.ill.tr}.`, en: `${apps[0] ? `The first planet the Moon applies to is ${nm(spSig).en}` : `The 7th ruler ${nm(spSig).en}`}, ${ok ? 'well placed' : 'afflicted'}: per Lilly, ${ok ? sp.well.en : sp.ill.en}.` } });
  }
  // Aforizmalar
  const aph: L[] = [];
  const vh = P.venus.house;
  const VH: Record<number, L> = {
    2: l('Venüs 2. evde: evlilikte maddi güvence önemli bir etken.', 'Venus in the 2nd: financial security is an important factor in marriage.'),
    6: l('Venüs 6. evde: partner iş ya da hizmet ortamından gelebilir.', 'Venus in the 6th: the partner may come from work or service settings.'),
    7: l('Venüs 7. evde: Lilly’ye göre evlilik biraz geç gelir; öncesinde birkaç önemli aşk yaşanabilir.', 'Venus in the 7th: per Lilly marriage comes somewhat late, often after several loves.'),
    10: l('Venüs 10. evde: Lilly’ye göre saygın, kendini iyi taşıyan bir partner.', 'Venus in the 10th: per Lilly a distinguished, well-presented partner.'),
    11: l('Venüs 11. evde: Lilly’ye göre partner daha önceden çocuk sahibi olabilir.', 'Venus in the 11th: per Lilly the partner may already have children.'),
  };
  if (VH[vh]) aph.push(VH[vh]);
  const l7h = P[lord7].house;
  if (l7h === 10 || P[domicileRuler(Math.floor(ch.cusps[9] / 30))].house === 7) aph.push(l('7. ve 10. ev yöneticileri bağlantılı: Lilly’ye göre iyi bir eş.', 'The 7th and 10th rulers are linked: per Lilly, a good spouse.'));
  if (l7h === 2 || P[domicileRuler(Math.floor(ch.cusps[1] / 30))].house === 7) aph.push(l('7. ve 2. ev yöneticileri bağlantılı: Lilly’ye göre iyi ve kazandıran bir evlilik.', 'The 7th and 2nd rulers are linked: per Lilly a good, profitable marriage.'));
  if (l7h === 7) aph.push(l('7. evin yöneticisi kendi evinde: Lilly’ye göre dürüst ve sade bir partner.', 'The 7th ruler in its own house: per Lilly an honest, unpretentious partner.'));
  if (l7h === 8 && isBenefic(lord7)) aph.push(l('İyi gezegen olan 7. ev yöneticisi 8. evde: Lilly’ye göre mirası ya da güçlü kaynakları olan bir partner.', 'A benefic 7th ruler in the 8th: per Lilly a partner with inheritance or ample resources.'));
  if (l7h === 6 || l7h === 12) aph.push(l('7. evin yöneticisi 6. ya da 12. evde: partner mütevazı ya da zorlu koşullardan gelmiş, emekle yükselmiş biri olabilir.', 'The 7th ruler in the 6th or 12th: the partner may come from modest or hard beginnings, rising through effort.'));
  const benIn7 = (['jupiter', 'venus'] as Classical[]).filter(p => P[p].house === 7 && lillyScore(ch, p).total > 0);
  if (benIn7.length) aph.push(l('Güçlü iyi gezegen 7. evde: Lilly’ye göre varlıklı ve iyi aileden gelen bir partner.', 'A strong benefic in the 7th: per Lilly a well-off partner from a good family.'));
  if (malIn7.length && !(['jupiter', 'venus'] as Classical[]).some(b => malIn7.some(m => aspectBetween(ch, b, m)))) aph.push(l('Satürn ya da Mars 7. evde ve iyi gezegenlerden destek almıyor: Lilly’ye göre evlilikte zorluk ve emek; ilişkide sabır ve sınırlar çok önemli.', 'Saturn or Mars in the 7th without benefic support: per Lilly hardship and labour in marriage; patience and boundaries matter greatly.'));
  if ((['jupiter', 'venus'] as Classical[]).some(b => { const a = aspectBetween(ch, b, 'moon'); return a && ['trine', 'sextile', 'conjunction'].includes(a.type); })) aph.push(l('Jüpiter ya da Venüs Ay ile uyumlu: Lilly’ye göre varlıklı ve saygın bir aileyle bağ.', 'Jupiter or Venus in harmony with the Moon: per Lilly a bond with a wealthy, respected family.'));
  // Kraliyet yıldızları 7. ev başlangıcında
  for (const st of [{ n: l('Regulus', 'Regulus'), lon: 149.83 }, { n: l('Spica', 'Spica'), lon: 203.83 }, { n: l('Aldebaran', 'Aldebaran'), lon: 69.78 }, { n: l('Antares', 'Antares'), lon: 249.77 }])
    if (angleDiff(ch.cusps[6], starLon(st.lon, ch.jdUT)) < 3) aph.push({ tr: `7. ev başlangıcında ${st.n.tr} (kraliyet yıldızı): Lilly’ye göre varlıklı ve iyi huylu bir partner.`, en: `${st.n.en} (a royal star) on the 7th cusp: per Lilly a rich, good-natured partner.` });
  aph.forEach(a => items.push({ label: l('Lilly’nin aforizması', 'Lilly’s aphorism'), text: a }));
  // Uyum (CXXXV)
  const harmony = spSig && (isBenefic(spSig) || (aspectBetween(ch, spSig, 'moon') && ['trine', 'sextile'].includes(aspectBetween(ch, spSig, 'moon')!.type)));
  items.push({ label: l('Karşılıklı sevgi (Bölüm CXXXV)', 'Mutual love (Ch. CXXXV)'), text: harmony ? l('Partneri gösteren gezegen iyi ve Ay’a dostça bakıyor: Lilly’ye göre çok sevgi, tatlı bir birliktelik ve kalıcı iyi niyet.', 'The partner’s significator is benefic and looks kindly on the Moon: per Lilly much love, sweet companionship and lasting goodwill.') : l('Partner göstergesi ile Ay arasında güçlü bir uyum yok: sevgi var ama emek ister; ortak hedefler ve açık iletişim ilişkiyi besler.', 'No strong harmony between the partner’s significator and the Moon: love is there but needs work; shared goals and open communication nourish it.') });
  // Birden fazla önemli ilişki
  const appsAll = moonApplications(ch).length;
  items.push({ label: l('İlişki sayısı eğilimi', 'Tendency in number of bonds'), text: [2, 5, 8, 11].includes(P.moon.sign) && appsAll >= 2 ? l('Ay çift gövdeli burçta ve birden fazla gezegene uyguluyor: Lilly’ye göre hayatta birden fazla önemli ilişki ya da evlilik eğilimi.', 'The Moon in a double-bodied sign applying to several planets: per Lilly, a tendency to more than one significant relationship or marriage.') : l('Lilly’nin kurallarına göre tek ve kalıcı bir bağ eğilimi öne çıkıyor.', 'By Lilly’s rules, a tendency toward one lasting bond stands out.') });
  return { title: l('Evlilik ve partner', 'Marriage and partner'), items };
}

// ================= 7. Meslek (Bölüm CXLVIII–CXLIX) =================
const PROF_ALONE: Record<'mercury' | 'venus' | 'mars', L> = {
  mercury: l('Lilly’ye göre bedenden çok zihinle yapılan işler: yazı, sayılar, öğretim, eğitim, felsefe, ticaret, şiir, mühendislik/tasarım, astroloji; sekreterlik, muhasebe, matematik.', 'Per Lilly, work done by the mind rather than the body: writing, numbers, teaching, philosophy, trade, poetry, engineering/design, astrology; secretarial work, accounting, mathematics.'),
  venus: l('Lilly’ye göre keyif, incelik ve duyulara hitap eden işler: eczacılık/kozmetik, parfüm, gastronomi ve içecek, resim, mücevher, moda ve gardırop, müzik.', 'Per Lilly, work of pleasure, delicacy and the senses: pharmacy/cosmetics, perfume, food and drink, painting, jewellery, fashion and wardrobe, music.'),
  mars: l('Lilly’ye göre güç ve emek isteyen, ateşle ya da metalle yapılan işler; güçlüyse komuta, askeriye, güvenlik ve spor; orta güçte mühendislik, tıp ve cerrahi, mimarlık, marangozluk.', 'Per Lilly, work demanding strength and effort, with fire or metal; when strong, command, military, security and sport; moderate, engineering, medicine and surgery, architecture, carpentry.'),
};
const PROF_MIX: Record<string, L> = {
  'mercury+jupiter': l('Merkür–Jüpiter: Lilly’ye göre etkileyici hatipler, adil yargıçlar, hukukçular, din/etik alanında çalışanlar, bankacılar ve büyük insanlarla dostluk.', 'Mercury–Jupiter: per Lilly, excellent orators, just judges, lawyers, those in religion/ethics, bankers, and friendship with the great.'),
  'mercury+sun': l('Merkür–Güneş (yanık değilse): Lilly’ye göre yöneticilerle yakın çalışma; hazine, kamu hesapları, denetim, danışmanlık.', 'Mercury–Sun (not combust): per Lilly, close work with authorities; treasury, public accounts, audit, counsel.'),
  'mercury+moon': l('Merkür–Ay: anlayışı artırır; geleceği merak etme, tahmin ve astroloji yeteneği.', 'Mercury–Moon: increases understanding; curiosity about the future, forecasting and astrology.'),
  'mercury+venus': l('Merkür–Venüs: Lilly’ye göre hoş ve akıcı bir dil; müzisyenler, şairler, hatipler, dans eğitmenleri, ressamlar, kozmetik, oyun ve sahne yazarlığı.', 'Mercury–Venus: per Lilly a pleasant, fluent tongue; musicians, poets, orators, dance teachers, painters, cosmetics, playwriting.'),
  'mercury+mars': l('Merkür–Mars: Lilly’ye göre çok keskin bir kavrayış; doktorlar, cerrahlar, heykeltıraşlar, kimyagerler, oymacılar, noterler, mühendis ve matbaacılar.', 'Mercury–Mars: per Lilly most sharp conceptions; physicians, surgeons, sculptors, chemists, engravers, notaries, surveyors and printers.'),
  'mercury+saturn': l('Merkür–Satürn: başkalarının işlerini yöneten, kurumsal ve idari görevler; arşiv ve kayıt işleri.', 'Mercury–Saturn: managing others’ affairs, institutional and administrative roles; archives and records.'),
  'venus+saturn': l('Venüs–Satürn: Lilly’ye göre keyif veren ürünlerin ticareti.', 'Venus–Saturn: per Lilly, trade in commodities of pleasure.'),
  'venus+jupiter': l('Venüs–Jüpiter: Lilly’ye göre din/etik, hekimlik, kumaş ve tekstil ticareti; kadınlar ya da inanç kurumları aracılığıyla yükseliş.', 'Venus–Jupiter: per Lilly religion/ethics, medicine, cloth and textile trade; preferment through women or faith institutions.'),
  'venus+mars': l('Venüs–Mars: Lilly’ye göre meslekte hem emek hem keyif; aşçılık, hekimlik, berberlik/güzellik, eczacılık, cerrahi, bahçecilik, boyacılık.', 'Venus–Mars: per Lilly both labour and pleasure in the work; cooking, medicine, barbering/beauty, pharmacy, surgery, gardening, dyeing.'),
  'mars+jupiter': l('Mars–Jüpiter (iyi yerleşimli): Lilly’ye göre komuta görevlerinde başarılı, saray/üst düzey kurum insanı.', 'Mars–Jupiter (well placed): per Lilly, a fortunate commander, at home in high institutions.'),
  'mars+sun': l('Mars–Güneş: Lilly’ye göre meslekten çok yöneticiliğe ve otoriteye yatkınlık.', 'Mars–Sun: per Lilly an inclination to magistracy and authority rather than a trade.'),
  'mars+saturn': l('Mars–Satürn: ağır emek, toprak ve inşaat işleri; dayanıklılık isteyen meslekler.', 'Mars–Saturn: hard labour, land and building work; professions requiring endurance.'),
  'mars+moon': l('Mars–Ay: halkla iç içe, fiziksel ve hızlı tempolu işler; gıda sektörü.', 'Mars–Moon: physical, fast-paced public-facing work; the food sector.'),
};
const PROF_SIGN: L[] = [
  l('öncü burç: zekâ ve düşünce isteyen meslekler (geometri, tıp, astroloji)', 'cardinal sign: professions needing wit and contemplation (geometry, medicine, astrology)'),
  l('sabit burç: eğitim ve uzmanlık gerektiren meslekler', 'fixed sign: professions requiring learning and expertise'),
  l('değişken burç: çok yönlü ve uyarlanabilir işler', 'mutable sign: versatile, adaptable work'),
];
export function profession(ch: Chart): Section {
  const P = ch.positions; const items: Section['items'] = [];
  const three: ('mercury' | 'venus' | 'mars')[] = ['mercury', 'venus', 'mars'];
  const sc = (p: Classical) => lillyScore(ch, p);
  const combust = (p: Classical) => angleDiff(P[p].lon, P.sun.lon) < 8.5 && angleDiff(P[p].lon, P.sun.lon) >= 17 / 60;
  let sig: 'mercury' | 'venus' | 'mars' | null = null; let rule = 0;
  // Kural 1: 10., 1. veya 7. evde, kendi onurlarında, yanık değil
  const r1 = three.filter(p => [10, 1, 7].includes(P[p].house) && sc(p).essTotal > 0 && !combust(p));
  if (r1.length) { sig = r1.sort((a, b) => sc(b).total - sc(a).total)[0]; rule = 1; }
  // Kural 2: MC burcunun yöneticisi ve onurlu (peregrin/düşüşte değil)
  if (!sig && ch.mc !== null) { const mr = domicileRuler(Math.floor(ch.mc / 30)); if ((three as Classical[]).includes(mr) && sc(mr).essTotal > 0) { sig = mr as any; rule = 2; } }
  // Kural 3: Ay'a tam açı
  if (!sig) { const r3 = three.filter(p => partileAsp(ch, p, 'moon')); if (r3.length) { sig = r3.sort((a, b) => sc(b).total - sc(a).total)[0]; rule = 3; } }
  // Kural 4: Ay'a orbu içinde ve kötü gezegenlerce bozulmamış
  if (!sig) { const r4 = three.filter(p => aspectBetween(ch, p, 'moon') && !(['saturn', 'mars'] as Classical[]).some(m => m !== p && ['conjunction', 'square', 'opposition'].includes(aspectBetween(ch, m, p)?.type ?? ''))); if (r4.length) { sig = r4.sort((a, b) => sc(b).total - sc(a).total)[0]; rule = 4; } }
  // Kural 5: Güneş'ten önce doğan
  if (!sig) { sig = three.map(p => ({ p, d: norm(P.sun.lon - P[p].lon) })).filter(x => x.d > 0 && x.d < 180).sort((a, b) => a.d - b.d)[0]?.p ?? 'mercury'; rule = 5; }
  const ruleText: L[] = [
    l('', ''),
    l('meslek göstergesi 1., 7. veya 10. evde ve kendi onurlarında (Lilly’nin ilk ve en güçlü kuralı)', 'the significator sits in the 1st, 7th or 10th in its own dignities (Lilly’s first, strongest rule)'),
    l('meslek göstergesi MC burcunun yöneticisi ve onurlu (ikinci kural)', 'the significator rules the Midheaven and is dignified (second rule)'),
    l('meslek göstergesi Ay’a tam açı yapıyor (üçüncü kural)', 'the significator aspects the Moon partilely (third rule)'),
    l('meslek göstergesi Ay’a açı yapıyor (dördüncü kural)', 'the significator aspects the Moon (fourth rule)'),
    l('meslek göstergesi Güneş’ten önce doğan gezegen (beşinci kural)', 'the significator is the planet rising before the Sun (fifth rule)'),
  ];
  items.push({ label: l('Meslek göstergen (Bölüm CXLVIII)', 'Your significator of profession (Ch. CXLVIII)'), text: { tr: `${nm(sig).tr} — ${ruleText[rule].tr}. Lilly’ye göre Merkür zihni ve bilgeliği, Mars bedensel gücü, Venüs ise hazzı ve zevki gösterir.${rule >= 3 ? ' Lilly, göstergenin üçüncü kural ve sonrasıyla bulunduğu durumlarda kişinin mesleğini sonradan ve daha esnek biçimde bulduğunu söyler; kariyerin zamanla şekillenir.' : ''}`, en: `${nm(sig).en} — ${ruleText[rule].en}. Per Lilly, Mercury shows wisdom of mind, Mars bodily strength, Venus delight.${rule >= 3 ? ' Lilly notes that when the significator is found by the third rule or later, the vocation is found later and more loosely; your career takes shape over time.' : ''}` } });
  items.push({ label: l('Mesleğin doğası', 'Nature of the work'), text: PROF_ALONE[sig] });
  for (const p of CLASSICAL) {
    if (p === sig) continue;
    const a = aspectBetween(ch, sig, p);
    const k = `${sig}+${p}`;
    if (a && PROF_MIX[k]) items.push({ label: l('Gezegen karışımı', 'Planetary mixture'), text: PROF_MIX[k] });
  }
  const s = sc(sig), oriental = sig === 'mars' ? norm(P.sun.lon - P.mars.lon) < 180 : norm(P[sig].lon - P.sun.lon) > 180;
  const success = s.essTotal > 0 && ANGULAR.includes(P[sig].house) && oriental ? l('Gösterge onurlu, köşe evde ve doğulu: Lilly’ye göre mesleğinde ünlü, alanının çoğunu geride bırakan ve kamuoyunda itibar kazanan biri.', 'The significator is dignified, angular and oriental: per Lilly famous in the profession, surpassing most peers and gaining public reputation.')
    : s.total >= 0 ? l('Gösterge orta güçte: mesleğinde sağlam ve yeterli; ustalık zamanla ve deneyimle gelir.', 'The significator is moderate: solid and capable in the profession; mastery grows with time and experience.')
    : l('Gösterge zayıf: Lilly bu durumda başkalarına bağımlı kalma riskinden söz eder; uzmanlaşma, mentor ve sertifikalarla güçlenmek bu etkiyi dengeler.', 'The significator is weak: Lilly speaks of a risk of depending on others; specialisation, mentors and credentials counter this.');
  items.push({ label: l('Meslekte başarı', 'Success in the profession'), text: success });
  const af: L[] = [];
  if (['square', 'opposition', 'conjunction'].includes(aspectBetween(ch, 'saturn', sig)?.type ?? '') && sig !== ('saturn' as any)) af.push(l('Satürn göstergeyi zorluyor: Lilly’ye göre öne çıkmaktan çekinme; özgüven ve görünürlük üzerine çalışmak önemli.', 'Saturn afflicts the significator: per Lilly, reluctance to put oneself forward; work on confidence and visibility.'));
  if (sig !== 'mars' && ['square', 'opposition', 'conjunction'].includes(aspectBetween(ch, 'mars', sig)?.type ?? '')) af.push(l('Mars göstergeyi zorluyor: Lilly’ye göre aceleci ve inatçı çıkışlar; sakin ve stratejik davranmak itibarı korur.', 'Mars afflicts the significator: per Lilly, rash, obstinate moves; calm strategy protects reputation.'));
  if (['trine', 'sextile', 'conjunction'].includes(aspectBetween(ch, 'jupiter', sig)?.type ?? '')) af.push(l('Jüpiter göstergeye destek veriyor: Lilly’ye göre otoriteyle güç, saygın ve ünlü bir meslek.', 'Jupiter supports the significator: per Lilly, power with authority, a respected and renowned profession.'));
  if (['trine', 'sextile'].includes(aspectBetween(ch, 'sun', sig)?.type ?? '')) af.push(l('Güneş göstergeye bakıyor: Lilly’ye göre meslek daha seçkin, daha değerli işlerle yapılır.', 'The Sun aspects the significator: per Lilly the profession becomes more refined, dealing in finer things.'));
  af.forEach(a => items.push({ label: l('Lilly’nin aforizması', 'Lilly’s aphorism'), text: a }));
  const sg = P[sig].sign;
  const human = [2, 5, 6, 10].includes(sg), fourFoot = [0, 1, 4, 8, 9].includes(sg);
  items.push({ label: l('Burcun etkisi', 'Influence of the sign'), text: { tr: `${nm(sig).tr} ${SIGNS[sg].tr} burcunda: ${PROF_SIGN[MOVABLE.includes(sg) ? 0 : FIXED.includes(sg) ? 1 : 2].tr}${human ? '; insan burcu: liberal sanatlar ve otoriteyle öğretilen meslekler' : ''}${fourFoot ? '; dört ayaklı burç: uygulamalı ve teknik meslekler' : ''}; element: ${ELEMENT_SOURCE[sg % 4].tr}.`, en: `${nm(sig).en} in ${SIGNS[sg].en}: ${PROF_SIGN[MOVABLE.includes(sg) ? 0 : FIXED.includes(sg) ? 1 : 2].en}${human ? '; human sign: liberal arts taught with authority' : ''}${fourFoot ? '; four-footed sign: hands-on, technical trades' : ''}; element: ${ELEMENT_SOURCE[sg % 4].en}.` } });
  // Batlamyus: Güneş'ten önce doğan + MC yöneticisi
  if (ch.mc !== null) {
    const mcr = domicileRuler(Math.floor(ch.mc / 30));
    const rising = CLASSICAL.filter(p => p !== 'sun' && p !== 'moon').map(p => ({ p, d: norm(P.sun.lon - P[p].lon) })).filter(x => x.d > 0 && x.d < 180).sort((a, b) => a.d - b.d)[0]?.p;
    if (rising) items.push({ label: l('Batlamyus’un yöntemi', 'Ptolemy’s method'), text: { tr: `Güneş’ten önce doğan gezegen ${nm(rising).tr}, MC yöneticisi ${nm(mcr).tr}.${rising === mcr ? ' İkisi aynı: Lilly’ye göre bu gezegen kişinin bütün eylem ve mesleklerinin efendisidir.' : ' Lilly ikisinin doğasını birlikte okumayı önerir.'}`, en: `The planet rising before the Sun is ${nm(rising).en}; the Midheaven ruler is ${nm(mcr).en}.${rising === mcr ? ' They coincide: per Lilly this planet masters all the native’s actions and arts.' : ' Lilly advises reading their natures together.'}` } });
  }
  return { title: l('Meslek ve yetenek', 'Profession and talent'), items };
}

// ================= 8. Yolculuk (Bölüm CXXXIX–CXL) =================
export function travel(ch: Chart): Section | null {
  if (!ch.cusps.length) return null;
  const P = ch.positions; const items: Section['items'] = [];
  const lord9 = domicileRuler(Math.floor(ch.cusps[8] / 30)), lord1 = domicileRuler(Math.floor(ch.asc! / 30));
  let t = 0; const why: L[] = [];
  const mm = aspectBetween(ch, 'moon', 'mars');
  if (mm?.type === 'conjunction' || (domicileRuler(P.moon.sign) === 'mars' && domicileRuler(P.mars.sign) === 'moon')) { t += 2; why.push(l('Ay ile Mars kavuşuk ya da karşılıklı kabulde', 'the Moon and Mars are conjoined or in mutual reception')); }
  if ([1, 3, 9].includes(P.moon.house) || [1, 3, 9].includes(P.mars.house)) { t += 2; why.push(l('Ay ya da Mars 1., 3. veya 9. evde', 'the Moon or Mars is in the 1st, 3rd or 9th')); }
  if (P[lord9].house === 1 || P[lord1].house === 9 || aspectBetween(ch, lord1, lord9)?.type === 'conjunction') { t += 2; why.push(l('1. ve 9. ev yöneticileri bağlantılı', 'the 1st and 9th rulers are linked')); }
  if (domicileRuler(P.moon.sign) === 'mars' || domicileRuler(P.mars.sign) === 'moon') { t += 1; why.push(l('Ay Mars’ın ya da Mars Ay’ın burcunda', 'the Moon is in Mars’ sign or Mars in the Moon’s')); }
  const movable = CLASSICAL.filter(p => MOVABLE.includes(P[p].sign)).length;
  if (movable >= 4) { t += 1; why.push(l('birçok gezegen öncü (hareketli) burçta', 'many planets are in movable signs')); }
  const occ = CLASSICAL.filter(p => p !== 'sun' && (p === 'moon' ? norm(P.moon.lon - P.sun.lon) < 180 : norm(P[p].lon - P.sun.lon) < 180)).length;
  if (occ >= 4) { t += 1; why.push(l('birçok gezegen batılı', 'many planets are occidental')); }
  const verdict = t >= 4 ? l('Lilly’ye göre sık ve uzun yolculuklar; yabancı yerler hayatında önemli bir yer tutar.', 'Per Lilly, frequent and long journeys; foreign places play a major role in your life.') : t >= 2 ? l('Lilly’ye göre yolculuklar var ama sınırlı; önemli olanlar seçici ve amaçlı.', 'Per Lilly, journeys occur but in moderation; the important ones are purposeful.') : l('Lilly’ye göre yolculuk tanıklığı az: kişi genelde kendi memleketinde kalmayı ve kök salmayı tercih eder.', 'Per Lilly, few testimonies of travel: one tends to stay and root at home.');
  items.push({ label: l('Yolculuk eğilimi (Bölüm CXXXIX)', 'Inclination to travel (Ch. CXXXIX)'), text: { tr: `${verdict.tr}${why.length ? ` Tanıklıklar: ${why.map(w => w.tr).join('; ')}.` : ''}`, en: `${verdict.en}${why.length ? ` Testimonies: ${why.map(w => w.en).join('; ')}.` : ''}` } });
  const sigs: Classical[] = ['moon', 'mars', lord9];
  const cnt = [0, 0, 0, 0]; sigs.forEach(p => cnt[P[p].sign % 4]++);
  const dirName = [l('doğu', 'east'), l('güney', 'south'), l('batı', 'west'), l('kuzey', 'north')];
  items.push({ label: l('Yön', 'Direction'), text: { tr: `Göstergelerin burç üçlüklerine göre (ateş doğu, toprak güney, hava batı, su kuzey) en olası yön: ${dirName[cnt.indexOf(Math.max(...cnt))].tr}.`, en: `By the triplicities of the significators (fire east, earth south, air west, water north) the most likely direction: ${dirName[cnt.indexOf(Math.max(...cnt))].en}.` } });
  const wet = sigs.filter(p => [2, 3].includes(P[p].sign % 4)).length;
  items.push({ label: l('Kara mı deniz mi', 'Land or sea'), text: wet >= 2 ? l('Göstergeler çoğunlukla su ve hava burçlarında: Lilly’ye göre su üzerinden ya da karışık yolculuklar.', 'Significators mostly in water and air signs: per Lilly, journeys by water or mixed.') : l('Göstergeler çoğunlukla ateş ve toprak burçlarında: Lilly’ye göre daha çok kara yolculukları.', 'Significators mostly in fire and earth signs: per Lilly, journeys mainly by land.') });
  items.push({ label: l('Kazanç', 'Profit'), text: MOVABLE.includes(P[lord9].sign) ? l('9. ev yöneticisi öncü burçta: Lilly’ye göre yolculuklar kazançlı ve hızlı sonuç veren cinsten.', 'The 9th ruler in a movable sign: per Lilly, profitable journeys with quick results.') : FIXED.includes(P[lord9].sign) ? l('9. ev yöneticisi sabit burçta: Lilly’ye göre yurt dışında uzun kalış, ama maddi kazanç sınırlı.', 'The 9th ruler in a fixed sign: per Lilly, long stays abroad but limited profit.') : l('9. ev yöneticisi değişken burçta: hem kısa hem uzun, karışık yolculuklar.', 'The 9th ruler in a mutable sign: a mix of short and long journeys.') });
  const HOUSE_TRAVEL: L[] = [l('yeni yerler görme isteği', 'a natural desire to see new places'), l('ticaret ve kazanç', 'trade and gain'), l('kardeşler, yakın çevre ya da eğitim', 'siblings, neighbours or study'), l('aile ve mülk işleri', 'family and property'), l('keyif, aşk ve tatil', 'pleasure, love and holiday'), l('iş ve hizmet', 'work and service'), l('ortaklık ve evlilik', 'partnership and marriage'), l('miras ya da ortak kaynaklar', 'inheritance or shared resources'), l('eğitim, inanç ve bilgi', 'education, belief and knowledge'), l('kariyer ve itibar', 'career and reputation'), l('arkadaşlar ve topluluklar', 'friends and communities'), l('içsel arayış ya da gizli işler', 'inner search or private matters')];
  items.push({ label: l('Yolculuğun nedeni (Bölüm CXL)', 'Cause of travel (Ch. CXL)'), text: { tr: `9. evin yöneticisi ${nm(lord9).tr} ${P[lord9].house}. evde: yolculukların en çok ${HOUSE_TRAVEL[P[lord9].house - 1].tr} nedeniyle.`, en: `The 9th ruler ${nm(lord9).en} in the ${ord(P[lord9].house)}: journeys mostly for ${HOUSE_TRAVEL[P[lord9].house - 1].en}.` } });
  return { title: l('Yolculuklar', 'Journeys'), items };
}

// ================= 9. Arkadaşlar (Bölüm CXLIX–CL) =================
const FRIEND_KIND: Record<Classical, L> = {
  saturn: l('olgun ve yaşça büyük, ciddi, toprak/maden/inşaat gibi işlerle uğraşan, tutumlu kişiler', 'mature, older, serious people in land, mining or building, careful with money'),
  jupiter: l('din/etik ve hukuk insanları, saygın, varlıklı, dürüst ve ölçülü kişiler, yargıçlar', 'people of faith/ethics and law, respected, well-off, honest and sober people, judges'),
  mars: l('cesur, atak, askeri/sağlık/teknik alanlardan, girişimci kişiler', 'bold, daring people from military, medical or technical fields, entrepreneurs'),
  sun: l('otorite sahibi, nüfuzlu, toplumda önde gelen kişiler', 'people of authority and influence, prominent in society'),
  venus: l('müzisyenler, sanatçılar, şık ve kibar, keyifli kişiler', 'musicians, artists, stylish, courteous and pleasant people'),
  mercury: l('zeki, eğitimli, yazar, matematikçi, tüccar ve teknik insanlar', 'clever, educated people, writers, mathematicians, merchants and technical minds'),
  moon: l('halkın içinden, değişken, yolculuk eden ve geniş çevreli kişiler', 'people of the public, changeable, travelling and widely connected'),
};
const FRIEND_IN11: Partial<Record<Classical, L>> = {
  saturn: l('Satürn 11. evde: Lilly’ye göre bazı arkadaşlar güvenilmez ya da çıkarcı olabilir; az ama seçilmiş dost.', 'Saturn in the 11th: per Lilly some friends may be unreliable or self-serving; few but chosen friends.'),
  mars: l('Mars 11. evde: Lilly’ye göre sadakati sınanan arkadaşlıklar; dostluklarda net sınırlar önemli.', 'Mars in the 11th: per Lilly friendships whose loyalty is tested; clear boundaries matter.'),
  sun: l('Güneş 11. evde: Lilly’ye göre güçlü ve nüfuzlu dostlar.', 'Sun in the 11th: per Lilly powerful, influential friends.'),
  venus: l('Venüs 11. evde: kadınlar ve sanat çevresi aracılığıyla dostluklar.', 'Venus in the 11th: friendships through women and artistic circles.'),
  jupiter: l('Jüpiter 11. evde: Lilly’ye göre çok sayıda dost.', 'Jupiter in the 11th: per Lilly, many friends.'),
  moon: l('Ay 11. evde: Lilly’ye göre çok kişi tarafından tanınır ama az gerçek dost.', 'Moon in the 11th: per Lilly known to many, yet few true friends.'),
};
export function friends(ch: Chart): Section | null {
  if (!ch.cusps.length) return null;
  const P = ch.positions; const items: Section['items'] = [];
  const s11 = Math.floor(ch.cusps[10] / 30), lord11 = domicileRuler(s11), lord1 = domicileRuler(Math.floor(ch.asc! / 30));
  const in11 = CLASSICAL.filter(p => P[p].house === 11 || P[p].house === 1);
  const sig = in11.length ? in11.map(p => lillyScore(ch, p)).sort((a, b) => b.total - a.total)[0].id : lord11;
  items.push({ label: l('Dostların niteliği (Bölüm CL)', 'Quality of friends (Ch. CL)'), text: { tr: `Gösterge ${nm(sig).tr}: dostların çoğunlukla ${FRIEND_KIND[sig].tr}.`, en: `Significator ${nm(sig).en}: your friends are mostly ${FRIEND_KIND[sig].en}.` } });
  CLASSICAL.filter(p => P[p].house === 11 && FRIEND_IN11[p]).forEach(p => items.push({ label: l('Lilly’nin aforizması', 'Lilly’s aphorism'), text: FRIEND_IN11[p]! }));
  const benWell = (['jupiter', 'venus'] as Classical[]).filter(p => [1, 11].includes(P[p].house) && lillyScore(ch, p).total > 0);
  if (benWell.length) items.push({ text: l('İyi gezegenler 1./11. evde ve güçlü: Lilly’ye göre çok sayıda, samimi ve faydalı dost.', 'Strong benefics in the 1st/11th: per Lilly many sincere and profitable friends.') });
  const a = aspectBetween(ch, lord1, lord11);
  items.push({ text: lord1 === lord11 ? l('Yükselen ile 11. ev aynı gezegence yönetiliyor: dostlarla doğal bir ruh birliği.', 'The same planet rules the Ascendant and the 11th: a natural kinship with friends.') : a && ['trine', 'sextile', 'conjunction'].includes(a.type) ? l('Yükselenin yöneticisi ile 11. evin yöneticisi uyumlu: dostluk ve destek kolay gelir.', 'The Ascendant and 11th rulers are in harmony: friendship and support come easily.') : !a ? l('Yükselenin ve 11. evin yöneticileri arasında açı yok: Lilly’ye göre dostluklar kendiliğinden kurulmaz, emek ve süreklilik ister.', 'No aspect between the Ascendant and 11th rulers: per Lilly friendships don’t form by themselves; they need effort and constancy.') : l('Yükselenin ve 11. evin yöneticileri gergin açıda: arkadaşlarla zaman zaman görüş ayrılığı.', 'The Ascendant and 11th rulers in tension: occasional disagreements with friends.') });
  items.push({ label: l('Dostlukların kalıcılığı', 'Constancy of friends'), text: FIXED.includes(s11) ? l('11. ev sabit burçta: Lilly’ye göre kalıcı ve sadık dostlar.', 'Fixed sign on the 11th: per Lilly, constant, faithful friends.') : MOVABLE.includes(s11) ? l('11. ev öncü burçta: Lilly’ye göre değişen ve dönemsel dostluklar.', 'Movable sign on the 11th: per Lilly, changing, seasonal friendships.') : l('11. ev değişken burçta: orta derecede kalıcı dostluklar.', 'Mutable sign on the 11th: friendships of middling constancy.') });
  return { title: l('Dostlar', 'Friends'), items };
}

// ================= 10. İki kişinin uyumu (Bölüm CLI) =================
const PLANET_FRIENDS: Record<Classical, Classical[]> = {
  saturn: ['jupiter', 'sun', 'mercury'], jupiter: ['saturn', 'sun', 'venus', 'mercury', 'moon'], mars: ['venus'],
  sun: ['jupiter', 'saturn', 'mars'], venus: ['jupiter', 'mars', 'mercury', 'moon'], mercury: ['jupiter', 'venus', 'saturn'], moon: ['jupiter', 'venus', 'saturn'],
};
export function concord(a: Chart, b: Chart): Section | null {
  if (a.asc === null || b.asc === null) return null;
  const items: Section['items'] = [];
  const sa = Math.floor(a.asc / 30), sb = Math.floor(b.asc / 30);
  const la = domicileRuler(sa), lb = domicileRuler(sb);
  if (sa === sb) items.push({ text: l('Aynı yükselen burç: Lilly’ye göre benzer mizaç ve karakter; “benzerlik sevginin anasıdır”.', 'The same rising sign: per Lilly, similar temperament and manners; “likeness is the mother of affection”.') });
  if (la === lb) items.push({ text: l('Yükselenleriniz aynı gezegence yönetiliyor: Lilly’ye göre aynı huy ve aynı duygular.', 'Your Ascendants share the same ruler: per Lilly, the same manners and affections.') });
  else items.push({ text: PLANET_FRIENDS[la].includes(lb) || PLANET_FRIENDS[lb].includes(la) ? { tr: `Yükselen yöneticileriniz (${nm(la).tr} ve ${nm(lb).tr}) Lilly’nin geleneğinde dost gezegenler: sevgi ve dostluk.`, en: `Your Ascendant rulers (${nm(la).en} and ${nm(lb).en}) are friendly planets in Lilly’s tradition: love and friendship.` } : { tr: `Yükselen yöneticileriniz (${nm(la).tr} ve ${nm(lb).tr}) geleneksel olarak dost sayılmaz: Lilly’ye göre farklı mizaçlar; anlayış ve sabırla köprü kurulur.`, en: `Your Ascendant rulers (${nm(la).en} and ${nm(lb).en}) aren’t traditional friends: per Lilly, differing temperaments; understanding and patience build the bridge.` } });
  const d = angleDiff(a.positions[la].lon, b.positions[lb].lon);
  for (const [t, ang, txt] of [['trine', 120, l('üçgen', 'trine')], ['sextile', 60, l('altmışlık', 'sextile')], ['conjunction', 0, l('kavuşum', 'conjunction')], ['square', 90, l('kare', 'square')], ['opposition', 180, l('karşıt', 'opposition')]] as const)
    if (Math.abs(d - ang) < 6) { items.push({ text: { tr: `Yükselen yöneticileriniz birbirine ${txt.tr} açısıyla bağlı: ${t === 'square' || t === 'opposition' ? 'çekim var ama sürtüşme de' : 'uyumlu bir bağ'}.`, en: `Your Ascendant rulers are linked by ${txt.en}: ${t === 'square' || t === 'opposition' ? 'attraction, but friction too' : 'a harmonious bond'}.` } }); break; }
  const ta = temperament(a).kind, tb = temperament(b).kind;
  items.push({ text: { tr: `Mizaçlarınız: ${TEMPERAMENTS[ta].name.tr} ve ${TEMPERAMENTS[tb].name.tr}. ${ta === tb ? 'Lilly’ye göre mizaç uyumu karşılıklı iyi niyetin temelidir.' : 'Farklı mizaçlar birbirini tamamlayabilir; ama tempo ve tepki farklarını konuşmak önemli.'}`, en: `Your temperaments: ${TEMPERAMENTS[ta].name.en} and ${TEMPERAMENTS[tb].name.en}. ${ta === tb ? 'Per Lilly, agreement in temperament is the basis of mutual goodwill.' : 'Different temperaments can complement each other; talking through differences in pace and reaction matters.'}` } });
  return { title: l('Lilly’ye göre uyum (Bölüm CLI)', 'Concord per Lilly (Ch. CLI)'), items };
}

// ================= 11. Yıllık profeksiyon =================
export function profection(ch: Chart, now = new Date()) {
  if (ch.asc === null) return null;
  const b = ch.input;
  let age = now.getFullYear() - b.year;
  if (now.getMonth() + 1 < b.month || (now.getMonth() + 1 === b.month && now.getDate() < b.day)) age--;
  const house = (age % 12) + 1;
  const sign = (Math.floor(ch.asc / 30) + age % 12) % 12;
  const lord = domicileRuler(sign);
  const lp = ch.positions[lord];
  const s = lillyScore(ch, lord);
  return {
    age, house, sign, lord,
    text: {
      tr: `${age} yaşındasın: yıllık profeksiyonda yükselen her yıl bir burç ilerler; bu yıl ${house}. ev (${SIGNS[sign].tr}) etkin. Bu yılın efendisi ${nm(lord).tr}; doğum haritanda ${SIGNS[lp.sign].tr} burcunda ve ${lp.house}. evde (${HOUSES[lp.house - 1].short.tr.toLocaleLowerCase('tr')}), Lilly puanı ${s.total > 0 ? '+' : ''}${s.total}. Bu yıl ${HOUSES[house - 1].area.tr} konuları öne çıkar; yılın efendisinin güçlü olması (${s.total >= 5 ? 'güçlü' : s.total >= 0 ? 'orta' : 'zayıf'}) yılın genel akışını gösterir. Bu yıl ${nm(lord).tr}’in transitleri ve Güneş dönüşündeki konumu özellikle önemlidir.`,
      en: `You are ${age}: in annual profection the Ascendant advances one sign per year; this year the ${ord(house)} house (${SIGNS[sign].en}) is activated. The lord of the year is ${nm(lord).en}; natally in ${SIGNS[lp.sign].en} in the ${ord(lp.house)} (${HOUSES[lp.house - 1].short.en.toLowerCase()}), Lilly score ${s.total > 0 ? '+' : ''}${s.total}. Themes of ${HOUSES[house - 1].area.en} come forward; the lord’s strength (${s.total >= 5 ? 'strong' : s.total >= 0 ? 'moderate' : 'weak'}) colours the year. Transits of ${nm(lord).en} and its place in your solar return matter especially this year.`,
    },
  };
}

export { CLASSICAL };
