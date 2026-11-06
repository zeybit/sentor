// Doğum haritasını hiç astroloji bilmeyen birinin okuyabileceği akıcı bölümlere dönüştürür.
// Derece, orb, puan ve kaynak adı yoktur; her bölüm önce neyi anlattığını sade bir dille açıklar.
import type { AspectType, BodyId, Chart } from '../engine/astro';
import { L, SIGNS, ASPECT_INFO, DIGNITY } from './base';
import { placementText, ASC } from './placements';
import { PLANET_HOUSE } from './houseTexts';
import { natalAspectText } from './aspectPairs';
import { SIGN_RULERS } from '../engine/astro';
import * as N from './lillyNatal';

type Lang = 'tr' | 'en';
type K = BodyId | 'asc' | 'mc';
const l = (tr: string, en: string): L => ({ tr, en });
const capTr = (s: string) => (s ? (s[0] === 'i' ? 'İ' : s[0] === 'ı' ? 'I' : s[0].toLocaleUpperCase('tr')) + s.slice(1) : s);
const capEn = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export interface Chapter { id: string; title: L; intro: L; paras: L[] }

const NAME: Partial<Record<K, L>> = {
  sun: l('Güneş', 'The Sun'), moon: l('Ay', 'The Moon'), mercury: l('Merkür', 'Mercury'), venus: l('Venüs', 'Venus'), mars: l('Mars', 'Mars'),
  jupiter: l('Jüpiter', 'Jupiter'), saturn: l('Satürn', 'Saturn'), uranus: l('Uranüs', 'Uranus'), neptune: l('Neptün', 'Neptune'), pluto: l('Plüton', 'Pluto'),
  node: l('Kuzey Ay Düğümü', 'The North Node'), chiron: l('Chiron', 'Chiron'), juno: l('Juno', 'Juno'), asc: l('Yükselen', 'The Ascendant'), mc: l('MC', 'The MC'),
  ceres: l('Ceres', 'Ceres'), pallas: l('Pallas', 'Pallas'), vesta: l('Vesta', 'Vesta'), lilith: l('Lilith', 'Lilith'),
};
const name = (k: K, lang: Lang) => (NAME[k] ?? l(k, k))[lang];
const nameLow = (k: K, lang: Lang) => (lang === 'en' && name(k, lang).startsWith('The ') ? 'the ' + name(k, lang).slice(4) : name(k, lang));

/** Gezegenin rolü — sade bir cümle */
const ROLE: Partial<Record<BodyId, L>> = {
  sun: l('Güneş, özünü anlatır: neyle parladığını, hayatta neyin peşinden gittiğini ve kendini nasıl ortaya koyduğunu.', 'The Sun describes your core: what makes you shine, what you pursue in life and how you show yourself.'),
  moon: l('Ay, iç dünyanı anlatır: neye ihtiyaç duyduğunu, nerede kendini güvende hissettiğini ve duygularını nasıl yaşadığını.', 'The Moon describes your inner world: what you need, where you feel safe and how you live your feelings.'),
  mercury: l('Merkür, düşünme ve konuşma biçimini anlatır: nasıl öğrendiğini, nasıl karar verdiğini ve kendini nasıl anlattığını.', 'Mercury describes how you think and speak: how you learn, decide and explain yourself.'),
  venus: l('Venüs, nasıl sevdiğini anlatır: kimden hoşlandığını, sevgiyi nasıl gösterdiğini ve neyi güzel bulduğunu.', 'Venus describes how you love: who attracts you, how you show affection and what you find beautiful.'),
  mars: l('Mars, enerjini ve arzunu anlatır: neyi istediğini, ona nasıl gittiğini ve öfkeni nasıl yaşadığını.', 'Mars describes your drive and desire: what you want, how you go after it and how you handle anger.'),
  jupiter: l('Jüpiter, şansının ve büyümenin nereden geldiğini anlatır: hayatın sana en cömert davrandığı alanı.', 'Jupiter describes where your luck and growth come from: the area where life is most generous to you.'),
  saturn: l('Satürn, hayatın sana verdiği dersleri anlatır: zorlandığın ama zamanla en sağlam hâline ulaştığın alanı.', 'Saturn describes life’s lessons for you: the area where you struggle at first but become strongest over time.'),
  uranus: l('Uranüs, özgür ve sıra dışı yanını anlatır: kurallara uymak istemediğin, ani değişimler yaşadığın alanı.', 'Uranus describes your free, unconventional side: where you resist rules and experience sudden change.'),
  neptune: l('Neptün, hayallerini ve sezgilerini anlatır: ilham aldığın ama bazen gerçeği bulanık gördüğün alanı.', 'Neptune describes your dreams and intuition: where you find inspiration but sometimes see reality through a haze.'),
  pluto: l('Plüton, en derin dönüşümünü anlatır: hayatının köklü biçimde değiştiği ve gücünü yeniden bulduğun alanı.', 'Pluto describes your deepest transformation: where your life changes at the root and you find your power again.'),
  chiron: l('Chiron, en hassas yaranı ve bu yaradan doğan şifa verme gücünü anlatır.', 'Chiron describes your most sensitive wound and the healing gift that grows from it.'),
  juno: l('Juno, uzun süreli bir bağlılıkta ne aradığını anlatır.', 'Juno describes what you look for in a lasting commitment.'),
  node: l('Kuzey Ay Düğümü, bu hayatta gelişmeye çağrıldığın yönü anlatır.', 'The North Node describes the direction you are called to grow in this life.'),
};

const ORD_TR = ['birinci', 'ikinci', 'üçüncü', 'dördüncü', 'beşinci', 'altıncı', 'yedinci', 'sekizinci', 'dokuzuncu', 'onuncu', 'on birinci', 'on ikinci'];
const ORD_EN = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth'];
/** Evin sade anlamı */
const HOUSE_PLAIN: L[] = [
  l('kişiliğini ve dış dünyaya nasıl göründüğünü anlatır', 'describes your personality and how you come across'),
  l('paranı, kazancını ve kendine verdiğin değeri anlatır', 'describes your money, income and self-worth'),
  l('iletişimi, kardeşlerini ve yakın çevreni anlatır', 'describes communication, siblings and your close surroundings'),
  l('evini, aileni ve köklerini anlatır', 'describes your home, family and roots'),
  l('aşkı, eğlenceyi, yaratıcılığı ve çocukları anlatır', 'describes romance, fun, creativity and children'),
  l('günlük düzenini, işini ve sağlığını anlatır', 'describes your daily routine, work and health'),
  l('evliliği, ciddi ilişkileri ve ortaklıkları anlatır', 'describes marriage, committed relationships and partnerships'),
  l('derin bağları, tutkuyu, ortak parayı ve dönüşümü anlatır', 'describes deep bonds, passion, shared money and transformation'),
  l('yurt dışını, eğitimi, inançlarını ve hayatın anlamını anlatır', 'describes travel abroad, education, beliefs and meaning'),
  l('kariyerini, toplumdaki yerini ve hedeflerini anlatır', 'describes your career, public standing and goals'),
  l('arkadaşlarını, çevreni ve gelecek hayallerini anlatır', 'describes friends, communities and future hopes'),
  l('iç dünyanı, yalnız kaldığın anları ve maneviyatı anlatır', 'describes your inner world, solitude and spirituality'),
];
const LEADS: L[] = [
  l('Bu yerleşim hayatında şöyle görünür: ', 'In daily life this shows up like this: '),
  l('Pratikte bunun anlamı şu: ', 'In practice this means: '),
  l('Bunun sana yansıması şöyle: ', 'This is how it reflects on you: '),
  l('Bu da sana şunu getirir: ', 'And it brings you this: '),
];
const lowTr = (s: string) => (s ? (s[0] === 'I' ? 'ı' : s[0] === 'İ' ? 'i' : s[0].toLocaleLowerCase('tr')) + s.slice(1) : s);
const lowEn = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/** "Güneş 1. evde: ..." önekini kaldırır */
const stripHouse = (s: string) => s.replace(/^[^:]{2,40} (?:\d+\. evde|in the \d+(?:st|nd|rd|th)):\s*/i, '');
/** "Kuşak yerleşimi: ...", "Lilith Koç: ..." gibi önekleri kaldırır */
const PLANET_WORDS = /^(?:Kuşak yerleşimi|Generational placement|Güneş|Ay|Merkür|Venüs|Mars|Jüpiter|Satürn|Uranüs|Neptün|Plüton|Chiron|Juno|Kuzey|Güney|Lilith|Ceres|Pallas|Vesta|Sun|Moon|Mercury|Venus|Jupiter|Saturn|Uranus|Neptune|Pluto|North|South)\b[^:.]{0,40}:\s*/;
const stripLead = (s: string) => s.replace(PLANET_WORDS, '');

function aspectsOf(ch: Chart, id: BodyId, max: number, used: Set<string>) {
  const out = ch.aspects
    .filter(a => (a.a === id || a.b === id) && a.type !== 'quincunx' && !['southNode', 'fortune', 'lilith', 'ceres', 'pallas', 'vesta'].includes(a.a === id ? a.b : a.a))
    .filter(a => natalAspectText(a.a, a.b, a.type))
    .filter(a => !used.has([a.a, a.b].sort().join('-')))
    .sort((x, y) => x.orb - y.orb)
    .slice(0, max);
  out.forEach(a => used.add([a.a, a.b].sort().join('-')));
  return out;
}
function aspectSentence(a: { a: BodyId; b: BodyId; type: AspectType }, self: BodyId, lang: Lang): string {
  const other = a.a === self ? a.b : a.a;
  const n = ASPECT_INFO[a.type].nature;
  const lead = lang === 'tr'
    ? (n === 'fusion' ? `${name(self, lang)} ile ${name(other, lang)} haritanda iç içe geçmiş durumda.` : n === 'harmonious' ? `${name(self, lang)} ile ${name(other, lang)} birbirini destekliyor.` : `${name(self, lang)} ile ${name(other, lang)} arasında bir gerilim var.`)
    : (n === 'fusion' ? `${capEn(nameLow(self, lang))} and ${nameLow(other, lang)} are fused together in your chart.` : n === 'harmonious' ? `${capEn(nameLow(self, lang))} and ${nameLow(other, lang)} support each other.` : `There is tension between ${nameLow(self, lang)} and ${nameLow(other, lang)}.`);
  return `${lead} ${natalAspectText(a.a, a.b, a.type)![lang]}`;
}

/** Bir gezegen için akıcı bir paragraf */
const ALL_IDS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'chiron', 'juno'];
function planetPara(ch: Chart, id: BodyId, lang: Lang, opts: { role?: boolean; aspects?: number } = {}, used: Set<string> = new Set()): L {
  const p = ch.positions[id];
  if (!p) return l('', '');
  const out = (lg: Lang) => {
    const parts: string[] = [];
    if (opts.role !== false && ROLE[id]) parts.push(ROLE[id]![lg]);
    const sign = SIGNS[p.sign][lg];
    const signText = stripLead(placementText(id, p.sign)[lg]);
    if (['uranus', 'neptune', 'pluto'].includes(id)) {
      parts.push(lg === 'tr'
        ? `${name(id, lg)} bir burçta yıllarca kaldığı için ${sign} yerleşimini aynı yıllarda doğan herkesle paylaşırsın; bu, kuşağının ortak temasıdır.`
        : `Because ${nameLow(id, lg)} stays in one sign for years, you share its ${sign} placement with everyone born around you; it is a theme of your generation.`);
    } else {
      parts.push(lg === 'tr' ? `Senin haritanda ${name(id, lg)} ${sign} burcunda. ${capTr(signText)}` : `In your chart ${nameLow(id, lg)} is in ${sign}. ${capEn(signText)}`);
    }
    const dg = DIGNITY[id];
    if (dg && (dg.domicile.includes(p.sign) || dg.exalt.includes(p.sign))) {
      parts.push(lg === 'tr' ? `Bu burç ${name(id, lg)} için en rahat olduğu yerlerden biri; bu yüzden bu yanını kolayca ve doğal biçimde yaşarsın.` : `This sign is one of ${nameLow(id, lg)}’s most comfortable places, so you live this side of yourself easily and naturally.`);
    }
    if (p.house) {
      const ht = PLANET_HOUSE[id]?.[p.house - 1];
      const what = id === 'node' ? (lg === 'tr' ? 'Bu nokta' : 'This point') : ['chiron', 'juno'].includes(id) ? (lg === 'tr' ? 'Bu gök cismi' : 'It') : (lg === 'tr' ? 'Bu gezegen' : 'It');
      parts.push(lg === 'tr'
        ? `${what} haritanın ${ORD_TR[p.house - 1]} evinde duruyor; bu ev ${HOUSE_PLAIN[p.house - 1].tr}.`
        : `${what} sits in your ${ORD_EN[p.house - 1]} house, which ${HOUSE_PLAIN[p.house - 1].en}.`);
      if (ht) {
        const lead = LEADS[(ALL_IDS.indexOf(id) + p.house) % LEADS.length][lg];
        const body = stripHouse(ht[lg]);
        parts.push(lead + (lg === 'tr' ? lowTr(body) : lowEn(body)));
      }
    }
    if (p.retro && !['node', 'juno', 'chiron'].includes(id)) parts.push(lg === 'tr'
      ? `Doğduğun gün ${name(id, lg)} gökyüzünde geri gidiyormuş gibi görünüyordu; bu yüzden bu konuları içinden, düşünerek ve kendine özgü bir yoldan yaşarsın.`
      : `On the day you were born ${nameLow(id, lg)} appeared to move backwards in the sky, so you live these themes inwardly, thoughtfully and in your own way.`);
    for (const a of aspectsOf(ch, id, opts.aspects ?? 1, used)) parts.push(aspectSentence(a, id, lg));
    return parts.join(' ');
  };
  const snap = new Set(used);
  const tr = out('tr');
  const after = new Set(used); used.clear(); snap.forEach(x => used.add(x));
  const en = out('en');
  after.forEach(x => used.add(x));
  return { tr, en };
}

// Klasik maddeleri sade cümlelere çevirir: etikete göre giriş cümlesi, teknik gerekçe atılır
const LEAD_BY_LABEL: Record<string, L | null> = {
  'Tarif': l('Kişiliğin şöyle tarif edilebilir: ', 'Your personality can be described like this: '),
  'Göstergenin burcu': l('Bir yanın da şöyle: ', 'Another side of you: '),
  'Dispozitör': l('Buna derinlik katan bir taraf daha var: ', 'Another side adds depth: '),
  'Merkür’ün aldığı renk': l('Zihnin de bundan payını alır: ', 'Your mind takes on this colour too: '),
  'Gezegen karışımı': l('', ''),
  'Mesleğin doğası': l('Mesleğinde en çok şu tür işler sana uyar: ', 'The kind of work that suits you most: '),
  'Meslekte başarı': l('Mesleki başarı açısından haritan şunu söylüyor: ', 'On career success your chart says: '),
  'Kazanç kaynağı': l('Para sana şu yollardan gelebilir: ', 'Money can come to you through: '),
  'Kazancın yolu': l('', ''), 'Varlığın sürekliliği': l('', ''), 'Bolluğun zamanı': l('', ''),
  'Varlık göstergelerin': l('Maddi açıdan haritanda şu potansiyel var: ', 'Financially your chart shows this potential: '),
  'Dostların niteliği': l('Arkadaşlıklarına gelince, ', 'As for friendship, '),
  'Dostlukların kalıcılığı': l('', ''),
  'Yolculuk eğilimi': l('Yolculuklar hayatında yer tutar: ', 'Travel plays a part in your life: '),
  'Kara mı deniz mi': l('', ''), 'Yolculuğun nedeni': l('', ''), 'Kazanç': l('', ''),
  'Evlilik isteği': l('', ''), 'Kolaylık': l('', ''),
  'Partnerin karakteri': l('Partnerin için şu tarif uyuyor: ', 'This description fits your partner: '),
  'Gelenekten bir not': l('', ''),
  // atlananlar
  'Karakter göstergen': null, 'Meslek göstergen': null, 'Yön': null, 'Partnerin geldiği yer': null, 'Burcun etkisi': null, 'Bir başka bakış': null,
};
const LEFTOVER = /\d+\.\s*(?:,|ev|veya|or|and)|\d+(?:st|nd|rd|th)\b|\([+-]?\d|gösterge|significator|dispozit|dispositor|yönetici|ruler|Tanıklık|Testimon|burcun doğası|nature of the sign|köşe ev|angular|uyguluyor|applying|onurlu|dignified/i;
function classical(sec: N.Section | null, lang: Lang, max: number): string[] {
  if (!sec) return [];
  const out: string[] = [];
  for (const it of sec.items) {
    const key = it.label?.tr ?? '';
    const lead = key in LEAD_BY_LABEL ? LEAD_BY_LABEL[key] : l('', '');
    if (lead === null) continue;
    let t = it.text[lang].split(/\s*(?:Tanıklıklar|Testimonies):/)[0];
    const ci = t.indexOf(': ');
    if (ci >= 0 && ci < t.length - 20) t = t.slice(ci + 2);
    t = t.split(/;\s*(?:burcun doğası|ev:|nature of the sign|house:)/)[0];
    t = t.replace(/^[A-ZÇĞİÖŞÜa-zçğıöşü]{2,12}\.\s+/, '');
    t = t.replace(/\s*\([^)]*\)/g, '').trim().replace(/[;,]\s*$/, '');
    if (lang === 'tr') t = t.replace(/^[Kk]işi /, '').replace(/Bu kişide/g, 'Sende').replace(/\bkişinin\b/g, 'senin');
    else t = t.replace(/\b[Pp]er the ancients,?\s*/g, '').replace(/^[Tt]he native (is )?/, '').replace(/\bthe native\b/g, 'you').replace(/\byou is\b/g, 'you are');
    if (t.length < 25 || LEFTOVER.test(t)) continue;
    if (!/[.!?]$/.test(t)) t += '.';
    t = lead[lang] ? lead[lang] + (lang === 'tr' ? lowTr(t) : lowEn(t)) : (lang === 'tr' ? capTr(t) : capEn(t));
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}
const join = (xs: L[]): L => ({ tr: xs.map(x => x.tr).filter(Boolean).join(' '), en: xs.map(x => x.en).filter(Boolean).join(' ') });
const fromList = (xs: string[], lang: Lang) => xs.join(' ');

const SIGN_FEEL: L[] = [
  l('cesur, atak ve hızlı', 'bold, quick and direct'), l('sakin, sabırlı ve güvenilir', 'calm, patient and dependable'), l('meraklı, konuşkan ve çok yönlü', 'curious, chatty and versatile'),
  l('şefkatli, koruyucu ve duygusal', 'caring, protective and emotional'), l('sıcak, cömert ve gururlu', 'warm, generous and proud'), l('dikkatli, titiz ve yardımsever', 'careful, meticulous and helpful'),
  l('zarif, uyumlu ve adil', 'graceful, harmonious and fair'), l('yoğun, derin ve kararlı', 'intense, deep and determined'), l('iyimser, özgür ve maceracı', 'optimistic, free and adventurous'),
  l('ciddi, kararlı ve hedef odaklı', 'serious, determined and goal-driven'), l('özgün, bağımsız ve yenilikçi', 'original, independent and inventive'), l('hassas, hayalperest ve sezgisel', 'sensitive, dreamy and intuitive'),
];

const LORD_PLAIN: Record<string, L> = {
  sun: l('Güneş: kendine güvenen, görünür olmak isteyen ve başkalarına yön veren bir doğa.', 'the Sun: a confident nature that wants to be seen and to lead.'),
  moon: l('Ay: duyarlı, değişken ve insanlarla duygusal bağ kuran bir doğa.', 'the Moon: a sensitive, changeable nature that bonds with people emotionally.'),
  mercury: l('Merkür: zeki, meraklı, konuşmayı ve öğrenmeyi seven bir doğa.', 'Mercury: a clever, curious nature that loves talking and learning.'),
  venus: l('Venüs: uyumlu, sevecen, güzelliğe ve keyfe düşkün bir doğa.', 'Venus: a gentle, affectionate nature that loves beauty and pleasure.'),
  mars: l('Mars: cesur, enerjik, rekabeti seven ve hızlı harekete geçen bir doğa.', 'Mars: a brave, energetic nature that likes competition and acts fast.'),
  jupiter: l('Jüpiter: iyimser, cömert, adil ve insanlara güven veren bir doğa.', 'Jupiter: an optimistic, generous, fair nature that inspires trust.'),
  saturn: l('Satürn: ciddi, sabırlı, sorumluluk alan ve zamanla güçlenen bir doğa.', 'Saturn: a serious, patient, responsible nature that grows stronger with time.'),
};
const TEMP_PLAIN: Record<string, L> = {
  sanguine: l('Mizacın sıcak ve canlı: neşeli, cömert, insanlarla kolay kaynaşan ve barışı seven birisin.', 'Your temperament is warm and lively: cheerful, generous, easy with people and peace-loving.'),
  choleric: l('Mizacın ateşli: hızlı karar veren, hırslı, cesur ve yönetmeyi seven birisin. Enerjini gereksiz tartışmalara harcamamak sana iyi gelir.', 'Your temperament is fiery: quick to decide, ambitious, brave and fond of leading. Not spending energy on needless arguments serves you well.'),
  melancholic: l('Mizacın derin ve temkinli: kararlarını yavaş ve sağlam verir, planlarını kendine saklar, ciddi ve sağduyulu davranırsın.', 'Your temperament is deep and careful: you decide slowly and soundly, keep plans to yourself and act seriously and wisely.'),
  phlegmatic: l('Mizacın sakin ve yumuşak: çatışmadan kaçınan, bağlı, kendi temposunda ilerleyen ve uyum arayan birisin.', 'Your temperament is calm and gentle: you avoid conflict, stay loyal, move at your own pace and seek harmony.'),
};

export function natalStory(ch: Chart, lang: Lang): Chapter[] {
  const P = ch.positions;
  const ascSign = ch.asc !== null ? Math.floor(ch.asc / 30) : null;
  const mcSign = ch.mc !== null ? Math.floor(ch.mc / 30) : null;
  const L2 = (tr: string, en: string) => l(tr, en);
  const chapters: Chapter[] = [];
  const used = new Set<string>();

  // 1. Özün
  const core: L[] = [planetPara(ch, 'sun', lang, { aspects: 1 }, used), planetPara(ch, 'moon', lang, { aspects: 1 }, used)];
  if (ascSign !== null) core.push(L2(
    `Yükselen burcun ${SIGNS[ascSign].tr}. Yükselen, doğduğun anda doğu ufkunda yükselen burçtur; insanların seni ilk gördüğünde edindiği izlenimi ve hayata yaklaşma biçimini anlatır. ${capTr(ASC[ascSign].tr)}`,
    `Your rising sign is ${SIGNS[ascSign].en}. The rising sign was coming up on the eastern horizon at your birth; it describes the first impression you make and how you approach life. ${capEn(ASC[ascSign].en)}`));
  else core.push(L2('Doğum saatin bilinmediği için yükselen burcunu ve evleri hesaplayamıyoruz. Saatini öğrenirsen haritan çok daha kişisel hâle gelir.', 'Because your birth time is unknown, your rising sign and houses can’t be calculated. Adding your time makes the chart far more personal.'));
  chapters.push({ id: 'core', title: L2('Sen kimsin', 'Who you are'), intro: L2(
    'Bir doğum haritası, doğduğun an gökyüzünün fotoğrafıdır. Okumaya üç temel noktadan başlarız: Güneş özünü, Ay duygularını, yükselen burç ise dışarıya nasıl göründüğünü anlatır. Bu üçü birlikte kişiliğinin iskeletini oluşturur.',
    'A birth chart is a snapshot of the sky at the moment you were born. We start with three key points: the Sun is your core, the Moon your feelings, and the rising sign how you come across. Together they form the backbone of your personality.'), paras: core });

  // 2. Karakter
  const charParas: L[] = [];
  if (ascSign !== null) {
    const t = N.temperament(ch);
    charParas.push(TEMP_PLAIN[t.kind]);
  }
  const lord = N.lordOfGeniture(ch).lord.id;
  charParas.push(L2(`Haritanda en güçlü konumdaki gezegen ${LORD_PLAIN[lord].tr} Karakterine en çok bu gezegenin rengi sinmiştir; zorlandığında da en çok onun yöntemlerine başvurursun.`,
    `The strongest planet in your chart is ${LORD_PLAIN[lord].en} Your character carries its colour most of all, and under pressure you fall back on its ways.`));
  const man = classical(N.manners(ch), lang, 3);
  if (man.length) charParas.push({ tr: lang === 'tr' ? fromList(man, 'tr') : '', en: lang === 'en' ? fromList(man, 'en') : '' });
  chapters.push({ id: 'character', title: L2('Karakterinin derinlikleri', 'The depths of your character'), intro: L2(
    'Burçlar ve gezegenler bir araya geldiğinde ortaya bir mizaç çıkar: sıcak mı serin mi, hızlı mı sakin mi olduğun. Bu bölüm, haritanın bütününe bakarak karakterinin genel tonunu anlatır.',
    'When signs and planets combine, a temperament emerges: whether you are warm or cool, quick or calm. This section looks at the whole chart to describe the overall tone of your character.'), paras: charParas });

  // 3. Zihin
  const mind: L[] = [planetPara(ch, 'mercury', lang, { aspects: 2 }, used)];
  const wit = classical(N.wit(ch), lang, 2);
  if (wit.length) mind.push({ tr: lang === 'tr' ? fromList(wit, 'tr') : '', en: lang === 'en' ? fromList(wit, 'en') : '' });
  chapters.push({ id: 'mind', title: L2('Zihnin ve iletişimin', 'Your mind and how you communicate'), intro: L2(
    'Nasıl düşündüğün, nasıl öğrendiğin ve insanlarla nasıl konuştuğun büyük ölçüde Merkür gezegenine bağlıdır. Okulda, işte ve ilişkilerde kendini nasıl anlattığın bu bölümde.',
    'How you think, learn and talk with people depends largely on Mercury. How you express yourself at school, at work and in relationships is in this section.'), paras: mind });

  // 4. Aşk
  const love: L[] = [planetPara(ch, 'venus', lang, { aspects: 2 }, used), planetPara(ch, 'mars', lang, { aspects: 1 }, used)];
  if (ch.cusps.length) {
    const s7 = Math.floor(ch.cusps[6] / 30);
    love.push(L2(`Haritanın yedinci evi evliliği ve ciddi ilişkileri anlatır ve senin haritanda ${SIGNS[s7].tr} burcuyla başlıyor. Bu, uzun süreli bir ilişkide ${SIGN_FEEL[s7].tr} birine çekildiğini ve partnerinden bu nitelikleri beklediğini gösterir.`,
      `Your seventh house, the house of marriage and committed relationships, begins in ${SIGNS[s7].en}. This shows that for the long term you are drawn to someone ${SIGN_FEEL[s7].en}, and you expect these qualities from a partner.`));
  }
  if (P.juno) love.push(planetPara(ch, 'juno', lang, { aspects: 0 }, used));
  const mar = classical(N.marriage(ch), lang, 3);
  if (mar.length) love.push({ tr: lang === 'tr' ? fromList(mar, 'tr') : '', en: lang === 'en' ? fromList(mar, 'en') : '' });
  chapters.push({ id: 'love', title: L2('Aşk ve ilişkiler', 'Love and relationships'), intro: L2(
    'Aşk hayatını en çok iki gezegen anlatır: Venüs nasıl sevdiğini ve neden hoşlandığını, Mars ise neyi arzuladığını ve nasıl ilk adımı attığını gösterir. Haritanın yedinci evi de evlilik ve uzun süreli ilişkiler hakkında ipuçları verir.',
    'Two planets tell most about your love life: Venus shows how you love and what you like, Mars what you desire and how you make the first move. The seventh house adds clues about marriage and long-term bonds.'), paras: love });

  // 5. Kariyer ve para
  const work: L[] = [];
  if (mcSign !== null) work.push(L2(`Haritanın en tepesindeki nokta (MC) kariyerini ve toplumda nasıl tanınmak istediğini anlatır. Senin MC’n ${SIGNS[mcSign].tr} burcunda: işinde ${SIGN_FEEL[mcSign].tr} biri olarak tanınmak sana en çok yakışan yol.`,
    `The highest point of your chart (the MC) describes your career and how you want to be known. Your MC is in ${SIGNS[mcSign].en}: being known at work as someone ${SIGN_FEEL[mcSign].en} is the path that suits you best.`));
  const tenth = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]).filter(id => P[id].house === 10);
  for (const id of tenth) { const ht = PLANET_HOUSE[id]?.[9]; if (ht) work.push(L2(`${name(id, 'tr')} kariyer evinde duruyor. ${capTr(stripHouse(ht.tr))}`, `${capEn(nameLow(id, 'en'))} sits in your career house. ${capEn(stripHouse(ht.en))}`)); }
  const prof = classical(N.profession(ch), lang, 3);
  if (prof.length) work.push({ tr: lang === 'tr' ? fromList(prof, 'tr') : '', en: lang === 'en' ? fromList(prof, 'en') : '' });
  const wealth = classical(N.wealth(ch), lang, 2);
  if (wealth.length) work.push({ tr: lang === 'tr' ? fromList(wealth, 'tr') : '', en: lang === 'en' ? fromList(wealth, 'en') : '' });
  if (work.length) chapters.push({ id: 'work', title: L2('İş, para ve hayattaki yerin', 'Work, money and your place in the world'), intro: L2(
    'Hangi işte parlayacağını ve paranın sana hangi yollardan geleceğini haritanın tepe noktası, kariyer evi ve para evindeki gezegenler anlatır.',
    'Which work makes you shine and how money comes to you are described by the top of your chart, the career house and the planets in your money house.'), paras: work });

  // 6. Şans ve dersler
  chapters.push({ id: 'growth', title: L2('Şansın ve hayat derslerin', 'Your luck and life lessons'), intro: L2(
    'Her haritada hayatın kolay aktığı bir alan ve sabırla olgunlaştığın bir alan vardır. Jüpiter şansını, Satürn ise zamanla en güçlü hâle geldiğin dersleri anlatır.',
    'Every chart has an area where life flows easily and one where you mature through patience. Jupiter shows your luck; Saturn the lessons that make you strongest over time.'),
    paras: [planetPara(ch, 'jupiter', lang, { aspects: 1 }, used), planetPara(ch, 'saturn', lang, { aspects: 1 }, used), ...(P.chiron ? [planetPara(ch, 'chiron', lang, { aspects: 0 }, used)] : [])] });

  // 7. Derin katmanlar
  chapters.push({ id: 'deep', title: L2('Ruhunun derin katmanları', 'The deeper layers of your soul'), intro: L2(
    'Uranüs, Neptün ve Plüton gökyüzünde çok yavaş ilerler, bu yüzden burçları bütün bir kuşakta ortaktır. Asıl kişisel anlamları, haritanda hangi evde durduklarından gelir.',
    'Uranus, Neptune and Pluto move very slowly, so their signs are shared by a whole generation. Their personal meaning comes from the house they occupy in your chart.'),
    paras: (['uranus', 'neptune', 'pluto'] as BodyId[]).map(id => planetPara(ch, id, lang, { aspects: 0 }, used)) });

  // 8. Hayat yolu
  if (P.node) chapters.push({ id: 'path', title: L2('Hayat yolun', 'Your life path'), intro: L2(
    'Ay Düğümleri, Ay’ın yörüngesinin Güneş’in yolunu kestiği iki noktadır. Kuzey Düğüm, bu hayatta gelişmeye çağrıldığın ve en çok tatmin bulacağın yönü gösterir.',
    'The lunar nodes are where the Moon’s path crosses the Sun’s. The North Node points to the direction you are called to grow in, where you find the deepest fulfilment.'),
    paras: [planetPara(ch, 'node', lang, { role: false, aspects: 0 }, used)] });

  // 9. Arkadaşlar ve yolculuklar
  const fr = [...classical(N.friends(ch), lang, 2), ...classical(N.travel(ch), lang, 2)];
  if (fr.length) chapters.push({ id: 'world', title: L2('Arkadaşların ve yolculukların', 'Friends and journeys'), intro: L2(
    'Haritanın on birinci evi arkadaşlıkları, dokuzuncu ve üçüncü evleri ise uzak ve yakın yolculukları anlatır.',
    'The eleventh house describes friendships, the ninth and third houses long and short journeys.'),
    paras: [{ tr: lang === 'tr' ? fr.join(' ') : '', en: lang === 'en' ? fr.join(' ') : '' }] });

  return chapters.map(c => ({ ...c, paras: c.paras.filter(p => p[lang]) }));
}
