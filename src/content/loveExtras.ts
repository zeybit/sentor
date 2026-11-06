// Aşk ve eş konusunda ek teknikler: türetilmiş evler, Juno kuralları, Venüs evi, çekim dili.
// Metinler özgündür.
import type { BodyId, Chart } from '../engine/astro';
import { angleDiff } from '../engine/astro';
import { L, SIGNS } from './base';

const l = (tr: string, en: string): L => ({ tr, en });
const SIGN_TONE: L[] = [
  l('hızlı ve atak', 'fast and bold'), l('sakin ve istikrarlı', 'calm and steady'), l('hareketli ve çok yönlü', 'lively and varied'),
  l('duygusal ve aileye bağlı', 'emotional and family-bound'), l('gösterişli ve cömert', 'showy and generous'), l('düzenli ve hesaplı', 'orderly and careful'),
  l('uyumlu ve dengeli', 'harmonious and balanced'), l('yoğun ve derin', 'intense and deep'), l('özgür ve geniş', 'free and expansive'),
  l('ciddi ve yapılı', 'serious and structured'), l('sıra dışı ve bağımsız', 'unconventional and independent'), l('hassas ve akışkan', 'sensitive and fluid'),
];

// ---------------- Türetilmiş evler: eşin hayatı ----------------
// 7. ev eşin kendisidir; eşin 2. evi senin 8., 4. evi senin 10., 6. evi senin 12. evindir.
const DERIVED: { house: number; title: L; what: L }[] = [
  { house: 8, title: l('Eşinin parası', 'Your spouse’s money'), what: l('eşinin kazancını ve maddi kaynaklarını', 'your spouse’s income and resources') },
  { house: 10, title: l('Eşinin ailesi', 'Your spouse’s family'), what: l('eşinin ailesini, yani kayınvalide ve kayınpeder ilişkini', 'your spouse’s family, your in-laws') },
  { house: 12, title: l('Eşinin günlük hayatı', 'Your spouse’s daily life'), what: l('eşinin iş düzenini, günlük rutinini ve sağlığa bakışını', 'your spouse’s work routine, daily life and approach to health') },
  { house: 11, title: l('Eşinle çocuklar ve keyif', 'Children and joy with your spouse'), what: l('eşinin aşk ve eğlence anlayışını, çocuklarla ilişkisini', 'your spouse’s idea of fun and their bond with children') },
];
const SIGN_MONEY: L[] = [
  l('Parayı hızlı kazanır, hızlı harcar; kendi işini kurmaya yatkındır.', 'Earns fast, spends fast; inclined to run their own business.'),
  l('Birikim yapan, maddi güvenliğe çok önem veren biridir; para konusunda sağlamdır.', 'A saver who values security highly; solid with money.'),
  l('Birden fazla gelir kaynağı olabilir; zekâsıyla ve sözleriyle kazanır.', 'May have several income sources; earns with wits and words.'),
  l('Aileden gelen destek ya da miras olabilir; parayı ev ve aile için harcar.', 'There may be family support or inheritance; spends on home and family.'),
  l('Cömert ve gösterişli harcar; kazancı görünürlüğüyle ve yaratıcılığıyla gelir.', 'Spends generously and with flair; income comes through visibility and creativity.'),
  l('Hesaplı ve dikkatlidir; emeğiyle, düzenli çalışarak kazanır.', 'Careful and precise; earns through steady, diligent work.'),
  l('Ortaklıklar ve ilişkiler yoluyla kazanır; estetik ve zevkli harcamaları sever.', 'Earns through partnerships; enjoys tasteful spending.'),
  l('Para konusunda güçlü ve stratejiktir; yatırım, finans ya da ortak kaynaklarla ilgili olabilir.', 'Strong and strategic with money; may deal with investment, finance or shared resources.'),
  l('Şanslı ve iyimserdir; yurt dışı, eğitim ya da yayıncılık yoluyla kazanabilir.', 'Lucky and optimistic; may earn through travel, education or publishing.'),
  l('Sabırla ve zamanla zenginleşir; kariyerinde yükseldikçe kazancı artar.', 'Grows wealthy patiently over time; income rises with their career.'),
  l('Geliri dalgalı ama yenilikçidir; teknoloji ya da sıra dışı işlerden kazanabilir.', 'Income fluctuates but is inventive; may earn from tech or unusual work.'),
  l('Para konusunda sezgiseldir; sanat, şifa ya da yardım alanlarından kazanabilir, sınır koymayı öğrenmesi gerekir.', 'Intuitive with money; may earn from art, healing or helping work, and needs to learn boundaries.'),
];
const SIGN_FAMILY: L[] = [
  l('Eşinin ailesi canlı, doğrudan ve biraz sabırsız olabilir; açık konuşmak ilişkiyi kolaylaştırır.', 'Your in-laws may be lively, direct and a bit impatient; speaking openly helps.'),
  l('Eşinin ailesi geleneklerine bağlı, sakin ve maddi olarak istikrarlı olabilir.', 'Your in-laws may be traditional, calm and financially stable.'),
  l('Eşinin ailesi kalabalık, konuşkan ve sosyal olabilir; iletişim bol olur.', 'Your in-laws may be large, chatty and sociable; lots of communication.'),
  l('Eşinin ailesi duygusal ve birbirine çok bağlıdır; sana da sahip çıkarlar.', 'Your in-laws are emotional and close-knit; they take you under their wing.'),
  l('Eşinin ailesi gururlu ve görünür olabilir; saygı ve takdir önemlidir.', 'Your in-laws may be proud and prominent; respect and appreciation matter.'),
  l('Eşinin ailesi düzenli ve titizdir; küçük detaylara önem verirler.', 'Your in-laws are orderly and particular; small details matter to them.'),
  l('Eşinin ailesiyle uyumlu ve nazik bir ilişki kurarsın.', 'You build a harmonious, polite relationship with your in-laws.'),
  l('Eşinin ailesiyle ilişki yoğun olabilir; güven zamanla kurulur.', 'Your relationship with your in-laws may be intense; trust is built over time.'),
  l('Eşinin ailesi farklı bir şehirden ya da kültürden olabilir; geniş görüşlüdürler.', 'Your in-laws may be from another city or culture; they are open-minded.'),
  l('Eşinin ailesi ciddi, kuralcı ve saygın olabilir; zamanla seni çok benimserler.', 'Your in-laws may be serious, rule-minded and respected; they warm to you over time.'),
  l('Eşinin ailesi alışılmadık ya da özgürlükçüdür; mesafeli ama saygılı bir ilişki.', 'Your in-laws are unconventional or liberal; a distant but respectful bond.'),
  l('Eşinin ailesi hassas ve şefkatlidir; bazen sınırları belirsiz olabilir.', 'Your in-laws are sensitive and caring; boundaries can sometimes blur.'),
];

export function derivedSpouse(ch: Chart): { title: L; text: L }[] {
  if (!ch.cusps.length) return [];
  const out: { title: L; text: L }[] = [];
  const PL: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const PNAME: Record<string, L> = { sun: l('Güneş', 'the Sun'), moon: l('Ay', 'the Moon'), mercury: l('Merkür', 'Mercury'), venus: l('Venüs', 'Venus'), mars: l('Mars', 'Mars'), jupiter: l('Jüpiter', 'Jupiter'), saturn: l('Satürn', 'Saturn'), uranus: l('Uranüs', 'Uranus'), neptune: l('Neptün', 'Neptune'), pluto: l('Plüton', 'Pluto') };
  const BENEFIC = ['venus', 'jupiter', 'sun'], HARDP = ['saturn', 'mars', 'pluto', 'uranus'];
  for (const d of DERIVED) {
    const sign = Math.floor(ch.cusps[d.house - 1] / 30);
    const inside = PL.filter(p => ch.positions[p].house === d.house);
    const tone = inside.some(p => BENEFIC.includes(p)) ? l(' Bu evdeki iyi gezegenler bu alanı destekliyor.', ' The helpful planets in this house support this area.')
      : inside.some(p => HARDP.includes(p)) ? l(' Bu evdeki zorlayıcı gezegenler bu alanda emek ve sabır istiyor.', ' The demanding planets in this house ask for effort and patience here.') : l('', '');
    const body = d.house === 8 ? SIGN_MONEY[sign] : d.house === 10 ? SIGN_FAMILY[sign] : l(`Bu alanda eşin ${SIGN_TONE[sign].tr} bir tavır taşır.`, `Here your spouse is ${SIGN_TONE[sign].en}.`);
    out.push({ title: d.title, text: l(
      `Senin ${d.house}. evin ${d.what.tr} anlatan eve denk gelir ve ${SIGNS[sign].tr} burcuyla başlıyor. ${body.tr}${inside.length ? ` Bu evde ${inside.map(p => PNAME[p].tr).join(', ')} var.` : ''}${tone.tr}`,
      `Your house ${d.house} corresponds to the house in your spouse’s chart that describes ${d.what.en}, and it begins in ${SIGNS[sign].en}. ${body.en}${inside.length ? ` ${inside.map(p => PNAME[p].en).join(', ')} ${inside.length > 1 ? 'are' : 'is'} here.` : ''}${tone.en}`) });
  }
  return out;
}

// ---------------- Juno kuralları ----------------
export function junoRules(ch: Chart): L[] {
  const P = ch.positions, J = P.juno;
  if (!J) return [];
  const out: L[] = [];
  const conj = (b: BodyId, orb = 6) => P[b] && angleDiff(J.lon, P[b].lon) <= orb;
  if (conj('saturn')) out.push(l('Juno Satürn ile kavuşuyor: senden yaşça büyük, olgun biriyle evlenme ihtimalin yüksek; eşin kuralcı ve seni zaman zaman zorlayan biri olabilir.', 'Juno conjoins Saturn: you are likely to marry someone older and mature; your spouse may be strict and sometimes challenging.'));
  if (J.house === 9 || J.sign === 8) out.push(l('Juno yurt dışı ve uzak yerlerle ilgili bir konumda: yabancı, başka bir ülkede yaşamış ya da farklı bir kültürden bir eş ihtimali var.', 'Juno is placed in the area of foreign lands: a spouse who is foreign, has lived abroad or comes from another culture is possible.'));
  if (conj('venus')) out.push(l('Juno Venüs ile kavuşuyor: romantik, çekici ve zevk sahibi bir eş; evlilikte uyum ve sevgi ön planda.', 'Juno conjoins Venus: a romantic, attractive spouse with good taste; harmony and affection lead the marriage.'));
  if (conj('mars')) out.push(l('Juno Mars ile kavuşuyor: tutkulu, enerjik ve sporcu ruhlu bir eş; tartışmalar olabilir ama çekim hep canlı kalır.', 'Juno conjoins Mars: a passionate, energetic, sporty spouse; there may be arguments, but the attraction stays alive.'));
  if (conj('jupiter')) out.push(l('Juno Jüpiter ile kavuşuyor: cömert, iyimser ve bolluk getiren bir eş; evlilik hayatını genişletir.', 'Juno conjoins Jupiter: a generous, optimistic spouse who brings abundance; marriage broadens your life.'));
  if (conj('uranus')) out.push(l('Juno Uranüs ile kavuşuyor: beklenmedik ya da hızlı gelişen bir evlilik; eşin sıra dışı ve özgürlüğüne düşkün biri.', 'Juno conjoins Uranus: an unexpected or fast-moving marriage; your spouse is unconventional and freedom-loving.'));
  if (conj('neptune')) out.push(l('Juno Neptün ile kavuşuyor: ruhsal, sanatsal ya da çok romantik bir eş; onu idealize etmemeye dikkat et.', 'Juno conjoins Neptune: a spiritual, artistic or deeply romantic spouse; be careful not to idealise them.'));
  if (conj('pluto')) out.push(l('Juno Plüton ile kavuşuyor: güçlü, etkileyici ve dönüştürücü bir eş; derin ama yoğun bir bağ.', 'Juno conjoins Pluto: a powerful, magnetic, transforming spouse; a deep but intense bond.'));
  if (conj('sun')) out.push(l('Juno Güneş ile kavuşuyor: evlilik kimliğinin merkezinde; eşin görünür ve parlayan biri olabilir.', 'Juno conjoins the Sun: marriage is central to your identity; your spouse may be prominent and radiant.'));
  if (conj('moon')) out.push(l('Juno Ay ile kavuşuyor: şefkatli, aile odaklı bir eş; evlilikte duygusal güven en önemli şey.', 'Juno conjoins the Moon: a caring, family-minded spouse; emotional security matters most.'));
  if (J.house === 7) out.push(l('Juno evlilik evinde: evlilik hayatında merkezi bir yer tutar; ciddi ilişkiler kurma ihtimalin yüksek.', 'Juno is in the marriage house: marriage holds a central place in your life.'));
  if (J.house === 10) out.push(l('Juno kariyer evinde: eşin kariyer sahibi ya da statülü biri olabilir; iş çevresinde tanışma ihtimali var.', 'Juno is in the career house: your spouse may have a career or status; you may meet through work.'));
  if (J.house === 12) out.push(l('Juno on ikinci evde: ilişki başta sessiz ya da gizli ilerleyebilir; eşinle ruhsal bir bağ kurarsın.', 'Juno is in the twelfth house: the relationship may start quietly or privately; you share a spiritual bond.'));
  return out;
}

// ---------------- Venüs evi: insanlar seni en çok nerede beğenir ----------------
export const VENUS_ADMIRED: L[] = [
  l('Dış görünüşün, yürüyüşün ve bakışların ilk anda dikkat çeker; insanlar seni gördükleri an beğenir.', 'Your looks, walk and gaze catch the eye at once; people like you the moment they see you.'),
  l('Sesin, konuşma tonun, tarzın ve kendinden emin duruşunla beğenilirsin; kaliteli bir havan var.', 'You are admired for your voice, tone, style and self-assured presence; you give off quality.'),
  l('Sohbetin, esprilerin ve mesajlaşma tarzınla beğenilirsin; yazdığın her şey çekici bulunur.', 'You are admired for your conversation, humour and texting style; whatever you write charms people.'),
  l('Sıcaklığın, ev hâlin ve insanlara kendini evinde hissettirmenle sevilirsin; yakın olanlar seni çok beğenir.', 'You are loved for your warmth and for making people feel at home; those close to you adore you.'),
  l('Eğlenceli hâlin, yaratıcılığın ve flörtöz enerjinle beğenilirsin; partilerde ve etkinliklerde parlarsın.', 'You are admired for your fun side, creativity and flirty energy; you shine at parties and events.'),
  l('Çalışkanlığın, özenin ve yardımseverliğinle beğenilirsin; iş yerinde ve günlük hayatta fark edilirsin.', 'You are admired for your diligence, care and helpfulness; you are noticed at work and in daily life.'),
  l('Kombinin, zarif duruşun, nazik konuşman ve insanlara kendini iyi hissettiren yumuşak enerjinle beğenilirsin.', 'You are admired for your outfits, graceful bearing, kind words and the gentle energy that makes others feel good.'),
  l('Bakışların, sessizliğin ve gizemli duruşunla beğenilirsin; insanlar seni çözmek ister.', 'You are admired for your gaze, your silences and your mysterious air; people want to figure you out.'),
  l('Bilgin, görgün, dünyaya bakışın ve maceracı ruhunla beğenilirsin; yabancılar ve uzaktakiler seni çekici bulur.', 'You are admired for your knowledge, worldliness and adventurous spirit; foreigners and distant people find you attractive.'),
  l('Başarın, duruşun ve profesyonel hâlinle beğenilirsin; iş hayatında ve toplum önünde çekicisin.', 'You are admired for your success, poise and professionalism; you are attractive in public and at work.'),
  l('Arkadaşlığın, özgün fikirlerin ve sosyal çevrendeki yerinle beğenilirsin; gruplar ve sosyal medya seni sever.', 'You are admired for your friendship, original ideas and social standing; groups and social media love you.'),
  l('İnce ruhun, şefkatin ve sezgilerinle beğenilirsin; seni gizlice beğenenler sandığından fazla olabilir.', 'You are admired for your gentle soul, compassion and intuition; you may have more secret admirers than you think.'),
];

// ---------------- Çekim dili: bir kişi neyden etkilenir (Ay ve Venüs burcu) ----------------
export const ATTRACTED_BY: L[] = [
  l('enerjik, cesur, kendine güvenen ve peşinden koşmaya değer bulduğu', 'energetic, brave, confident people worth chasing'),
  l('sakin, sadık, zevk sahibi, doğal güzelliğiyle ve şefkatiyle güven veren', 'calm, loyal, tasteful people who reassure with natural beauty and tenderness'),
  l('zeki, esprili, bir gün güldürüp ertesi gün düşündüren ve zihnini sürekli meşgul eden', 'clever, witty people who make them laugh one day and think the next'),
  l('şefkatli, duygusal derinliği olan ve onu evinde hissettiren', 'caring people with emotional depth who make them feel at home'),
  l('kendine güvenen, ışıltılı, onu takdir eden ve yanında gururlandıran', 'confident, radiant people who admire them and make them proud'),
  l('düzenli, zarif, akıllı ve küçük detaylara özen gösteren', 'neat, elegant, smart people who care about details'),
  l('zarif, uyumlu, sosyal ve estetik duruşuyla dikkat çeken', 'graceful, sociable people with an eye-catching aesthetic'),
  l('gizemli, derin, sadık ve onu tam anlamıyla anlayan', 'mysterious, deep, loyal people who truly understand them'),
  l('özgür ruhlu, eğlenceli, maceraya açık ve onunla birlikte keşfeden', 'free-spirited, fun people open to adventure who explore with them'),
  l('olgun, ayakları yere basan, hedefleri olan ve güven veren', 'mature, grounded, goal-driven people who inspire trust'),
  l('özgün, bağımsız, fikirleriyle onu şaşırtan ve alan tanıyan', 'original, independent people who surprise them with ideas and give them space'),
  l('romantik, hassas, sezgisel ve hayal gücü geniş', 'romantic, sensitive, intuitive and imaginative people'),
];
export function attractionText(c: Chart, name: string, lang: 'tr' | 'en'): string {
  const v = c.positions.venus.sign, m = c.positions.moon.sign;
  const nm = name || (lang === 'tr' ? 'Bu kişi' : 'This person');
  if (lang === 'tr') return `${nm}, Venüs’ü ${SIGNS[v].tr} burcunda olduğu için ${ATTRACTED_BY[v].tr} insanlardan etkilenir.${m !== v ? ` Ay’ı ${SIGNS[m].tr} burcunda; duygusal olarak ise ${ATTRACTED_BY[m].tr} birinin yanında kendini güvende hisseder.` : ''}`;
  return `${nm} has Venus in ${SIGNS[v].en}, so they are drawn to ${ATTRACTED_BY[v].en}.${m !== v ? ` With the Moon in ${SIGNS[m].en}, they feel emotionally safe with ${ATTRACTED_BY[m].en}.` : ''}`;
}

// ---------------- Yeni Ay / Dolunay hangi evine düşüyor ----------------
const AREA: L[] = [
  l('kendinle, görünüşünle ve yeni başlangıçlarınla', 'yourself, your image and fresh starts'),
  l('paranla, kazancınla ve kendine verdiğin değerle', 'your money, income and self-worth'),
  l('iletişimle, kardeşlerinle, yakın çevrenle ve kısa yolculuklarla', 'communication, siblings, your circle and short trips'),
  l('evinle, ailenle ve köklerinle', 'your home, family and roots'),
  l('aşkla, flörtle, eğlenceyle ve yaratıcılıkla', 'love, dating, fun and creativity'),
  l('işinle, günlük düzeninle ve sağlığınla', 'your work, routine and health'),
  l('ilişkilerinle, evlilikle ve ortaklıklarla', 'relationships, marriage and partnerships'),
  l('ortak parayla, borç-alacakla ve derin bağlarla', 'shared money, debts and deep bonds'),
  l('eğitimle, yurt dışıyla ve inançlarınla', 'study, travel abroad and beliefs'),
  l('kariyerinle ve toplumdaki yerinle', 'your career and public standing'),
  l('arkadaşlarınla, çevrenle ve hayallerinle', 'friends, communities and hopes'),
  l('iç dünyanla, dinlenmekle ve geride bırakman gerekenlerle', 'your inner world, rest and what you need to let go'),
];
export function lunationHouseText(kind: 'new' | 'full' | 'firstQuarter' | 'lastQuarter', house: number): L {
  const a = AREA[house - 1];
  if (kind === 'new') return l(`Senin ${house}. evinde: ${a.tr} ilgili yeni bir başlangıç için niyet etme zamanı.`, `In your house ${house}: a time to set intentions for a fresh start with ${a.en}.`);
  if (kind === 'full') return l(`Senin ${house}. evinde: ${a.tr} ilgili beklediğin bir konu netleşebilir, bir karar ya da sonuç gelebilir.`, `In your house ${house}: something you’ve been waiting for with ${a.en} may become clear; a decision or result may arrive.`);
  return l(`Senin ${house}. evinde: ${a.tr} ilgili bir ara değerlendirme.`, `In your house ${house}: a check-in on ${a.en}.`);
}
