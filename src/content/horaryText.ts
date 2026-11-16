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
  likely: { tone: 'good', title: l('Muhtemelen evet', 'Probably yes'), body: l('Ana göstergeler doğrudan buluşmasa da klasik kurallardaki ikincil işaretler olumlu: Ay, soranın eş göstergesi olarak konunun gezegenine uyguluyor ya da konunun gezegeni sana doğru geliyor. İş olur ama kesinliği tam bir buluşma kadar güçlü değil.', 'The main significators don’t meet directly, but the secondary classical signs are positive: the Moon, your co-significator, applies to the matter’s planet, or the matter’s planet comes toward you. It can happen, though less certainly than with a full perfection.') },
  viaThird: { tone: 'mixed', title: l('Bir aracı ya da üçüncü kişi sayesinde mümkün', 'Possible through a go-between or third party'), body: l('Göstergeler doğrudan buluşmuyor ama hızlı bir gezegen ışığı birinden diğerine taşıyor (ışık aktarımı) ya da aralarında karşılıklı kabul var. Bir arkadaş, aracı veya beklenmedik bir yardım sonucu getirebilir.', 'The significators don’t meet directly, but a faster planet carries light from one to the other (translation of light), or they are in mutual reception. A friend, intermediary or unexpected help may bring it about.') },
  blocked: { tone: 'bad', title: l('Başlıyor gibi ama engelleniyor', 'It looks promising but gets blocked'), body: l('Göstergeler buluşacakken araya başka bir gezegen giriyor (engelleme) ya da uygulayan gezegen geri dönüyor (refranation). bu, son anda vazgeçme, iptal veya planın değişmesi olarak yaşanabilir.', 'The significators are about to meet, but another planet intervenes (prohibition) or the applying planet turns back (refranation). Per Doşer, this can show as a last-minute withdrawal, cancellation or change of plan.') },
  notNow: { tone: 'bad', title: l('Şu an için olası görünmüyor', 'Not likely at this time'), body: l('Göstergeler, hızlı olan burcunu değiştirmeden önce buluşmuyor ve aralarında ışık aktarımı yok. bu, konunun şimdiki koşullarda tamamlanmayacağını gösterir. Koşullar değişirse soru daha sonra yeniden sorulabilir.', 'The significators don’t meet before the faster one changes sign, and no light is translated between them. The matter won’t complete under current conditions. If circumstances change, the question may be asked again later.') },
};

/** Soru türüne göre somut yorum: iyi / karışık / olumsuz sonuç */
export const Q_LINE: Record<string, Record<'good' | 'mixed' | 'bad', L>> = {
  love: { good: l('İlişki ilerleme eğiliminde: karşı taraf da istekli, bir adım atılabilir.', 'The relationship tends to move forward: the other side is willing too, a step can be taken.'), mixed: l('İlişki mümkün ama kendiliğinden olmaz; konuşma, sabır ya da bir aracı gerekir.', 'The relationship is possible but won’t happen by itself; it takes talking, patience or a go-between.'), bad: l('Şu an ilişki için koşullar olgun değil; zorlamak yerine zamana bırakmak daha iyi.', 'Conditions aren’t ripe for the relationship now; better to give it time than to force it.') },
  contact: { good: l('O kişinin sana dönme ya da yazma ihtimali yüksek.', 'They are quite likely to come back or get in touch.'), mixed: l('Bir temas olabilir ama dolaylı yoldan, bir ortak tanıdık ya da tesadüf aracılığıyla.', 'Contact may come, but indirectly: through a mutual friend or by chance.'), bad: l('Yakın zamanda onun ilk adımı atması beklenmiyor; istiyorsan adımı sen atmalısın.', 'They are not expected to make the first move soon; if you want it, you’ll have to reach out.') },
  career: { good: l('İş ya da terfi yolu açık görünüyor; başvurunu ya da görüşmeni ertelemeden takip et.', 'The path to the job or promotion looks open; follow up on your application or interview without delay.'), mixed: l('Olabilir ama ek çaba, ikinci görüşme ya da birinin tavsiyesi gerekebilir.', 'It can happen, but may need extra effort, a second interview or someone’s recommendation.'), bad: l('Bu fırsat şu an sana göre değil ya da gecikiyor; alternatifleri de açık tut.', 'This opportunity isn’t for you right now or is delayed; keep alternatives open.') },
  work: { good: l('Günlük işinde rahatlama ve düzelme bekleniyor.', 'Relief and improvement in your daily work are expected.'), mixed: l('Düzelme olur ama senin de bir şeyleri değiştirmen ya da konuşman gerekir.', 'Things improve, but you also need to change something or speak up.'), bad: l('Kısa vadede büyük bir değişiklik beklenmiyor; kendi rutinini korumaya odaklan.', 'No big change is expected soon; focus on protecting your own routine.') },
  money: { good: l('Beklediğin para ya da kazanç gelme eğiliminde.', 'The money or gain you expect tends to arrive.'), mixed: l('Para gelir ama gecikmeli, parça parça ya da takip ederek.', 'The money comes, but late, in parts or only if you chase it.'), bad: l('Bu kazanç şu an zor görünüyor; harcamalarını buna göre planla.', 'This gain looks difficult right now; plan your spending accordingly.') },
  lost: { good: l('Eşyayı bulma ihtimalin yüksek; büyük ihtimalle yakında ve tahmin ettiğinden yakın bir yerde.', 'You are likely to find it; probably soon and closer than you think.'), mixed: l('Bulunabilir ama biri yardım ederse ya da arama yerini değiştirirsen.', 'It can be found, but with someone’s help or if you search elsewhere.'), bad: l('Bulmak zor görünüyor; yine de iyice aramadığın yerlere bir kez daha bak.', 'Finding it looks hard; still, check once more where you haven’t searched properly.') },
  home: { good: l('Ev ya da taşınma planı gerçekleşme eğiliminde.', 'The home or moving plan tends to come through.'), mixed: l('Olur ama pazarlık, evrak ya da zamanlama sorunlarıyla.', 'It happens, but with negotiation, paperwork or timing issues.'), bad: l('Bu ev ya da plan şu an uygun görünmüyor; acele etme.', 'This home or plan doesn’t look right now; don’t rush.') },
  travel: { good: l('Yolculuk ya da yurt dışı planı gerçekleşme eğiliminde.', 'The trip or move abroad tends to happen.'), mixed: l('Gerçekleşir ama değişen tarihler, vize ya da ek hazırlıkla.', 'It happens, but with changed dates, visa issues or extra preparation.'), bad: l('Plan şu an gecikiyor ya da değişiyor; esnek kal.', 'The plan is delayed or changing for now; stay flexible.') },
  study: { good: l('Kabul için işaretler olumlu; hazırlığını sürdür.', 'The signs for admission are positive; keep preparing.'), mixed: l('Mümkün ama yedek liste, ek başvuru ya da ikinci deneme gerekebilir.', 'Possible, but a waiting list, extra application or second attempt may be needed.'), bad: l('Bu dönem için zor görünüyor; seçeneklerini genişlet.', 'It looks hard this time; widen your options.') },
  news: { good: l('Beklediğin haber ya da mesaj gelme eğiliminde.', 'The news or message you’re waiting for tends to arrive.'), mixed: l('Haber gelir ama gecikmeli ya da beklediğinden farklı.', 'The news comes, but late or different from what you expect.'), bad: l('Yakın zamanda beklediğin haberin gelmesi zor; gerekirse sen sor.', 'The news is unlikely to come soon; ask yourself if needed.') },
  wish: { good: l('Dileğin gerçekleşme eğiliminde; arkadaş desteği işe yarar.', 'Your wish tends to come true; friends’ support helps.'), mixed: l('Gerçekleşebilir ama biraz farklı bir biçimde ya da yardımla.', 'It may come true, but in a slightly different form or with help.'), bad: l('Bu dilek şu an için uzak görünüyor; hedefini küçük adımlara böl.', 'This wish looks far off for now; break it into smaller steps.') },
};

/** Konunun gezegeni haritanın hangi evinde: karşı tarafın ya da konunun şu anki durumu */
const Q_POS: L[] = [
  l('sana çok yakın; konu kendiliğinden sana doğru geliyor', 'very close to you; the matter is coming toward you'),
  l('maddi konularla, kendi değerleriyle meşgul', 'busy with money and its own values'),
  l('yakın çevrede, iletişimde; haberleşme ve kısa adımlar öne çıkıyor', 'in your close circle, in communication; messages and small steps matter'),
  l('evde, ailede, köklerde; özel hayatıyla ilgili', 'at home, with family; focused on private life'),
  l('keyif ve romantizm arayışında; eğlenceli ve rahat', 'seeking pleasure and romance; relaxed and playful'),
  l('günlük işlerle, yorgunlukla ya da sorumluluklarla meşgul', 'busy with daily tasks, tiredness or duties'),
  l('karşı tarafta; açıkça senin karşında ve ortaklığa açık', 'opposite you; openly facing you and open to partnership'),
  l('derin düşüncelerde, belirsizlik ya da ortak para konularında', 'deep in thought, uncertainty or shared money matters'),
  l('uzakta ya da kafası başka yerde; yolculuk, eğitim ya da inançlarla meşgul', 'far away or mentally elsewhere; busy with travel, study or beliefs'),
  l('işiyle, statüsüyle ve görünür hedefleriyle meşgul', 'busy with work, status and visible goals'),
  l('arkadaşlar ve gelecek planlarıyla meşgul; umutlu', 'busy with friends and future plans; hopeful'),
  l('gizli, sessiz ya da kendi içine kapanmış; görünenden fazlası var', 'hidden, quiet or withdrawn; there is more than meets the eye'),
];

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
  if (r.moonPerf) details.push({ tr: `Ay, senin eş göstergen olarak konunun gezegenine ${ASPECT_INFO[r.moonPerf.type].name.tr.toLocaleLowerCase('tr')} açısıyla ulaşıyor (${fmt(r.moonPerf.date)}). Klasik kurallarda bu, işin gerçekleşmesi için ikinci derecede bir işarettir.`, en: `The Moon, your co-significator, reaches the matter’s planet by ${ASPECT_INFO[r.moonPerf.type].name.en.toLowerCase()} (${fmt(r.moonPerf.date)}). In classical rules this is a secondary sign that it will happen.` });
  if (r.collection) details.push({ tr: `Işığın toplanması: iki gösterge de ${BODIES[r.collection.by].name.tr} ile buluşuyor. Konu, daha güçlü ya da yaşça büyük bir kişinin (ya da bir kurumun) devreye girmesiyle çözülebilir.`, en: `Collection of light: both significators meet ${BODIES[r.collection.by].name.en}. The matter may be resolved when a more powerful or older person (or an institution) steps in.` });
  if (r.comesToYou) details.push(l('Konunun gezegeni 1. evde, yani sana doğru geliyor: istediğin şey ya da kişi seni arıyor.', 'The matter’s planet is in the 1st house, coming toward you: what or whom you want is seeking you.'));
  if (r.goesToIt) details.push(l('Senin gezegenin konunun evinde: bu konuya yönelmişsin, aklın ve enerjin orada.', 'Your planet is in the matter’s house: you are drawn to it, your mind and energy are there.'));
  if (r.helpers.length) details.push({ tr: `Konunun evinde ${r.helpers.map(x => BODIES[x].name.tr).join(' ve ')} var: konu destekleniyor, yardım eden kişiler ya da şanslı koşullar var.`, en: `${r.helpers.map(x => BODIES[x].name.en).join(' and ')} in the matter’s house: the matter is supported by helpful people or lucky conditions.` });
  if (r.hinders.length) details.push({ tr: `Konunun evinde ${r.hinders.map(x => BODIES[x].name.tr).join(' ve ')} var: engeller, gecikmeler ya da gerginlik olabilir.`, en: `${r.hinders.map(x => BODIES[x].name.en).join(' and ')} in the matter’s house: obstacles, delays or tension are possible.` });
  const qh = r.chart.positions[r.quesited].house;
  if (qh) details.push({ tr: `Konunun (ya da karşı tarafın) şu anki durumu: ${Q_POS[qh - 1].tr}.`, en: `The current state of the matter (or the other person): ${Q_POS[qh - 1].en}.` });
  if (r.moonLast && r.moonNext.length > 1) {
    const good = ['trine', 'sextile', 'conjunction'].includes(r.moonLast.type) && !['mars', 'saturn'].includes(r.moonLast.b);
    details.push({ tr: `Ay burcunu ${BODIES[r.moonLast.b].name.tr} ile ${ASPECT_INFO[r.moonLast.type].name.tr.toLocaleLowerCase('tr')} açısıyla bitiriyor: ${good ? 'işin sonu genelde iyi bağlanır.' : 'işin sonunda bir zorluk ya da hayal kırıklığı olabilir.'}`, en: `The Moon ends its sign with a ${ASPECT_INFO[r.moonLast.type].name.en.toLowerCase()} to ${BODIES[r.moonLast.b].name.en}: ${good ? 'the matter usually ends well.' : 'there may be a difficulty or disappointment at the end.'}` });
  }
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
