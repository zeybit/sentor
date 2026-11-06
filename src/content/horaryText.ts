// Soru Sor (horary) metinleri — Lilly ve Döşer'in kurallarından uyarlanmıştır.
import type { BodyId, AspectType } from '../engine/astro';
import type { HoraryResult, Verdict } from '../engine/horary';
import { L, SIGNS, BODIES, HOUSES, ASPECT_INFO } from './base';
import { ord } from './life';

const l = (tr: string, en: string): L => ({ tr, en });

export interface Question { key: string; house: number; label: L; hint: L }

// Sağlık, ölüm, hamilelik ve hukuk soruları bilinçli olarak dahil edilmedi.
export const QUESTIONS: Question[] = [
  { key: 'love', house: 7, label: l('İlişki / evlilik olacak mı?', 'Will this relationship / marriage happen?'), hint: l('Sevgili, eş adayı veya ilişkinin geleceği (7. ev)', 'A partner, prospective spouse or the relationship’s future (7th house)') },
  { key: 'contact', house: 7, label: l('O kişi bana dönecek / yazacak mı?', 'Will they come back / contact me?'), hint: l('Belirli bir kişiyle yeniden bağlantı (7. ev)', 'Reconnecting with a specific person (7th house)') },
  { key: 'career', house: 10, label: l('Bu işe / terfiye girecek miyim?', 'Will I get this job / promotion?'), hint: l('Kariyer, iş başvurusu, statü (10. ev)', 'Career, job application, status (10th house)') },
  { key: 'work', house: 6, label: l('İş ortamım / günlük işim düzelecek mi?', 'Will my workplace / daily work improve?'), hint: l('Çalışma koşulları, iş arkadaşları, rutin (6. ev)', 'Work conditions, co-workers, routine (6th house)') },
  { key: 'money', house: 2, label: l('Bu para / kazanç gelecek mi?', 'Will this money / income come?'), hint: l('Gelir, alacak, maddi kazanç (2. ev)', 'Income, money owed, financial gain (2nd house)') },
  { key: 'lost', house: 2, label: l('Kaybettiğim eşyayı bulacak mıyım?', 'Will I find my lost item?'), hint: l('Kayıp taşınabilir eşya (2. ev)', 'A lost movable item (2nd house)') },
  { key: 'home', house: 4, label: l('Bu evi alacak / taşınacak mıyım?', 'Will I buy this home / move?'), hint: l('Ev, gayrimenkul, aile yuvası (4. ev)', 'Home, property, family base (4th house)') },
  { key: 'travel', house: 9, label: l('Bu yolculuk / yurt dışı planı gerçekleşecek mi?', 'Will this trip / move abroad happen?'), hint: l('Uzun yolculuk, yurt dışı, vize (9. ev)', 'Long journeys, abroad, visas (9th house)') },
  { key: 'study', house: 9, label: l('Bu okula / programa kabul edilecek miyim?', 'Will I be accepted to this school / program?'), hint: l('Yüksek eğitim, sınav, kabul (9. ev)', 'Higher education, exams, admission (9th house)') },
  { key: 'news', house: 3, label: l('Beklediğim haber / mesaj gelecek mi?', 'Will the news / message I’m waiting for arrive?'), hint: l('Haber, yazışma, kardeşler, yakın çevre (3. ev)', 'News, messages, siblings, neighbours (3rd house)') },
  { key: 'wish', house: 11, label: l('Bu dileğim gerçekleşecek mi?', 'Will this wish come true?'), hint: l('Umutlar, dilekler, arkadaşların desteği (11. ev)', 'Hopes, wishes, friends’ support (11th house)') },
];

export const VERDICT_TEXT: Record<Verdict, { title: L; body: L; tone: 'good' | 'mixed' | 'bad' }> = {
  yes: { tone: 'good', title: l('Evet — gerçekleşme ihtimali güçlü', 'Yes — strong chance it happens'), body: l('Senin göstergen ile konunun göstergesi uyumlu bir açıyla (kavuşum, altmışlık veya üçgen) buluşuyor. bu, işin kendiliğinden ve fazla zorlanmadan tamamlanacağını gösterir.', 'Your significator and the matter’s significator meet by a harmonious aspect (conjunction, sextile or trine). The matter completes readily and without great strain.') },
  yesEffort: { tone: 'mixed', title: l('Evet, ama emek ve sabırla', 'Yes, but with effort and patience'), body: l('Göstergeler kare açıyla buluşuyor. Sonuç gelir ama engeller, gecikmeler ve çaba gerektirir. Karşılıklı kabul (reception) varsa yol daha da kolaylaşır.', 'The significators meet by square. The outcome comes, but with obstacles, delays and effort. Mutual reception eases the way.') },
  yesRegret: { tone: 'mixed', title: l('Gerçekleşebilir, ama memnuniyet garanti değil', 'It may happen, but satisfaction isn’t guaranteed'), body: l('Göstergeler karşıt açıyla buluşuyor. Karşıtla tamamlanan işler çoğu zaman sonradan pişmanlık, tartışma ya da ayrılık getirir. Kararını vermeden önce artı ve eksileri tart.', 'The significators meet by opposition. Matters perfected by opposition often bring later regret, dispute or separation. Weigh pros and cons first.') },
  viaThird: { tone: 'mixed', title: l('Bir aracı ya da üçüncü kişi sayesinde mümkün', 'Possible through a go-between or third party'), body: l('Göstergeler doğrudan buluşmuyor ama hızlı bir gezegen ışığı birinden diğerine taşıyor (ışık aktarımı) ya da aralarında karşılıklı kabul var. Bir arkadaş, aracı veya beklenmedik bir yardım sonucu getirebilir.', 'The significators don’t meet directly, but a faster planet carries light from one to the other (translation of light), or they are in mutual reception. A friend, intermediary or unexpected help may bring it about.') },
  blocked: { tone: 'bad', title: l('Başlıyor gibi ama engelleniyor', 'It looks promising but gets blocked'), body: l('Göstergeler buluşacakken araya başka bir gezegen giriyor (engelleme) ya da uygulayan gezegen geri dönüyor (refranation). bu, son anda vazgeçme, iptal veya planın değişmesi olarak yaşanabilir.', 'The significators are about to meet, but another planet intervenes (prohibition) or the applying planet turns back (refranation). Per Doşer, this can show as a last-minute withdrawal, cancellation or change of plan.') },
  notNow: { tone: 'bad', title: l('Şu an için olası görünmüyor', 'Not likely at this time'), body: l('Göstergeler, hızlı olan burcunu değiştirmeden önce buluşmuyor ve aralarında ışık aktarımı yok. bu, konunun şimdiki koşullarda tamamlanmayacağını gösterir. Koşullar değişirse soru daha sonra yeniden sorulabilir.', 'The significators don’t meet before the faster one changes sign, and no light is translated between them. The matter won’t complete under current conditions. If circumstances change, the question may be asked again later.') },
};

const UNIT: Record<string, L> = { days: l('gün', 'days'), weeks: l('hafta', 'weeks'), months: l('ay', 'months'), years: l('yıl', 'years') };

export function sigLine(id: BodyId, who: L, r: HoraryResult): L {
  const p = r.chart.positions[id];
  const st = id === r.querent ? r.qStrength : r.sStrength;
  const notes: L[] = [];
  if (st.ess >= 4) notes.push(l('güçlü (kendi evinde/yüceliminde)', 'strong (dignified)'));
  if (st.ess <= -4) notes.push(l('zayıf (zararda/düşüşte)', 'weak (debilitated)'));
  if (st.angular) notes.push(l('köşe evde: etkin', 'angular: active'));
  if (st.cadent) notes.push(l('düşen evde: etkisi az', 'cadent: little power'));
  if (st.retro) notes.push(l('retro: geri adım, tekrar', 'retrograde: backtracking'));
  if (st.cazimi) notes.push(l('kazimi: Güneş’in kalbinde, çok güçlü', 'cazimi: very strong'));
  else if (st.combust) notes.push(l('yanık: Güneş’e çok yakın, gizli ya da güçsüz', 'combust: hidden or powerless'));
  else if (st.underBeams) notes.push(l('ışın altında: kısmen görünmez', 'under the beams: partly hidden'));
  const n = notes.length ? ` — ${notes.map(x => x.tr).join(', ')}` : '';
  const ne = notes.length ? ` — ${notes.map(x => x.en).join(', ')}` : '';
  return {
    tr: `${who.tr}: ${BODIES[id].name.tr}, ${SIGNS[p.sign].tr} ${Math.floor(p.lon % 30)}°, ${p.house}. evde${n}`,
    en: `${who.en}: ${BODIES[id].name.en}, ${Math.floor(p.lon % 30)}° ${SIGNS[p.sign].en}, ${ord(p.house)} house${ne}`,
  };
}

export function horaryNotes(r: HoraryResult, fmt: (d: Date) => string): { considerations: L[]; details: L[]; timing: L | null } {
  const considerations: L[] = [];
  if (r.ascEarly) considerations.push(l('Yükselen çok erken derecede (3°’den az): soru için henüz erken olabilir; konu tam olgunlaşmamış.', 'Ascendant in very early degrees (<3°): it may be too early to judge; the matter isn’t ripe.'));
  if (r.ascLate) considerations.push(l('Yükselen son derecelerde (27°’den fazla): karar büyük ölçüde verilmiş ve sen onay arıyorsun; konu bir sonuca yakın.', 'Ascendant in late degrees (>27°): per Doşer the decision is largely made and you seek confirmation; the matter is near its end.'));
  if (r.moonVoid) considerations.push(l('Ay boşta (burç değiştirmeden başka gezegene açı yapmıyor): “bir şey olmaz”; göstergeler güçlüyse gecikmeyle olur, kayıp eşya sorularında ise eşyanın geri döneceğini gösterir.', 'Void-of-course Moon: “nothing comes of it”; per Doşer, with strong significators it happens late, and in lost-item questions the item returns.'));
  if (r.moonViaCombusta) considerations.push(l('Ay “yanık yol”da (15° Terazi–15° Akrep): geleneksel olarak sakıncalı sayılır; bazı olumsuz gelişmelere işaret edebilir.', 'Moon in the via combusta (15° Libra–15° Scorpio): the ancients avoided it; Doşer doesn’t see it as critical, though it may hint at setbacks.'));
  if (r.moonLate) considerations.push(l('Ay burcun son derecelerinde: bir şeyin sonuna gelindiğini gösterir.', 'Moon in the last degrees of a sign: per Doşer, something is coming to an end.'));
  if (r.saturnAngular) considerations.push(l(`Satürn ${r.saturnAngular}. evde (köşe ev): soran için zorluk ve gecikme; yine de yanıt verilebilir.`, `Saturn in the ${ord(r.saturnAngular)} (angular): per Doşer, challenges and delays for the querent; the question can still be judged.`));
  if (r.sameRuler) considerations.push(l('Sen ve konu aynı gezegenle temsil ediliyorsunuz; bu durumda soranın göstergesi olarak Ay kullanıldı.', 'You and the matter share the same ruler; so the Moon is used as your significator.'));

  const details: L[] = [];
  if (r.perfection) {
    const a = ASPECT_INFO[r.perfection.type];
    details.push({ tr: `Göstergeler ${a.name.tr.toLocaleLowerCase('tr')} açısıyla ${fmt(r.perfection.date)} tarihinde buluşuyor.`, en: `The significators perfect a ${a.name.en.toLowerCase()} on ${fmt(r.perfection.date)}.` });
  }
  if (r.translation) {
    const a = ASPECT_INFO[r.translation.type];
    details.push({ tr: `${BODIES[r.translation.by].name.tr} ışığı taşıyor (${a.name.tr.toLocaleLowerCase('tr')}, ${fmt(r.translation.date)}).`, en: `${BODIES[r.translation.by].name.en} translates the light (${a.name.en.toLowerCase()}, ${fmt(r.translation.date)}).` });
  }
  if (r.prohibition) details.push({ tr: `Engelleme: ${BODIES[r.prohibition.a].name.tr}, ${BODIES[r.prohibition.b].name.tr} ile daha önce (${fmt(r.prohibition.date)}) açı yapıyor.`, en: `Prohibition: ${BODIES[r.prohibition.a].name.en} aspects ${BODIES[r.prohibition.b].name.en} first (${fmt(r.prohibition.date)}).` });
  if (r.refranation) details.push({ tr: `Geri dönme: ${BODIES[r.refranation].name.tr} açı tamamlanmadan yön değiştiriyor.`, en: `Refranation: ${BODIES[r.refranation].name.en} turns direction before perfection.` });
  if (r.reception.mutual) details.push(l('Göstergeler karşılıklı kabulde: iki taraf da birbirini istiyor; zor açıları bile yumuşatır.', 'The significators are in mutual reception: both sides want each other; it softens even hard aspects.'));
  else if (r.reception.aReceivedByB) details.push(l('Konunun gezegeni seni kabul ediyor: karşı taraf ya da koşullar sana olumlu bakıyor.', 'The matter’s planet receives you: the other side or circumstances favour you.'));
  else if (r.reception.bReceivedByA) details.push(l('Sen konuyu kabul ediyorsun: bunu gerçekten istiyorsun.', 'You receive the matter: you truly want it.'));
  if (r.moonNext.length) {
    const m = r.moonNext[0];
    details.push({ tr: `Ay’ın sıradaki açısı: ${BODIES[m.b].name.tr} ile ${ASPECT_INFO[m.type].name.tr.toLocaleLowerCase('tr')} (${fmt(m.date)}). Ay olayların genel akışını gösterir.`, en: `The Moon’s next aspect: ${ASPECT_INFO[m.type].name.en.toLowerCase()} ${BODIES[m.b].name.en} (${fmt(m.date)}). Per Doşer the Moon shows the general flow of events.` });
  }

  let timing: L | null = null;
  if (r.timing) {
    const u = UNIT[r.timing.unit];
    timing = {
      tr: `Gökyüzünde açının tamamlanmasına yaklaşık ${Math.max(1, Math.round(r.timing.days))} gün var. Geleneksel sembolik ölçüye (burç niteliği + ev konumu) göre ise yaklaşık ${r.timing.amount} ${u.tr}.`,
      en: `In the sky the aspect perfects in about ${Math.max(1, Math.round(r.timing.days))} days. By the traditional symbolic measure (sign quality + house placement) it is about ${r.timing.amount} ${u.en}.`,
    };
  }
  return { considerations, details, timing };
}

export const houseLabel = (h: number): L => HOUSES[h - 1].name;
export type { AspectType };
