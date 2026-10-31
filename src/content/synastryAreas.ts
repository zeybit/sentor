// Sinastri: alanlara göre uyum, kısa özet, temel sorular, yakınlık dili, en kolay / en zor açılar.
// Puanlama: açı türü (uyumlu +, zorlayıcı −, kavuşum gezegenlere göre) × orb yakınlığı × gezegen ağırlığı.
import type { BodyId, Chart } from '../engine/astro';
import type { CrossAspect } from '../engine/techniques';
import { L, ASPECT_INFO, SIGN_ELEMENT } from './base';
import { relName } from './relationship';

type K = BodyId | 'asc' | 'mc';
const l = (tr: string, en: string): L => ({ tr, en });

const W: Partial<Record<K, number>> = {
  sun: 1, moon: 1, venus: 1, mars: 1, asc: 0.9, mercury: 0.8, jupiter: 0.8, saturn: 0.85, mc: 0.7,
  uranus: 0.6, neptune: 0.6, pluto: 0.7, node: 0.6, chiron: 0.5, juno: 0.6, ceres: 0.45, pallas: 0.45, vesta: 0.45, lilith: 0.5, fortune: 0.45,
};
const BENEFIC = new Set<K>(['venus', 'jupiter', 'sun', 'moon', 'mercury', 'fortune', 'juno', 'ceres']);
const MALEFIC = new Set<K>(['saturn', 'mars', 'pluto', 'uranus', 'neptune', 'lilith', 'chiron']);
const MAJOR = new Set<K>(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'asc', 'mc']);

/** Bu sinastride bakılacak orb sınırı */
export const synOrb = (a: K, b: K) => (MAJOR.has(a) && MAJOR.has(b) ? 6 : 3);

export interface Scored { x: CrossAspect; pol: number; strength: number }

/** Açının işareti: +1 destek, −1 dikkat; kavuşumda gezegenlere bakılır */
export function polarity(x: CrossAspect): number {
  const n = ASPECT_INFO[x.type].nature;
  if (n === 'harmonious') return 1;
  if (n === 'challenging') return -1;
  if (n === 'adjust') return -0.5;
  const ben = (BENEFIC.has(x.a) ? 1 : 0) + (BENEFIC.has(x.b) ? 1 : 0);
  const mal = (MALEFIC.has(x.a) ? 1 : 0) + (MALEFIC.has(x.b) ? 1 : 0);
  if (mal === 0) return 1;
  if (ben === 0) return -1;
  return x.a === 'venus' || x.b === 'venus' || x.a === 'jupiter' || x.b === 'jupiter' ? 0.5 : -0.5;
}
export function score(list: CrossAspect[]): Scored[] {
  return list.map(x => {
    const orbMax = synOrb(x.a, x.b);
    const strength = Math.max(0, 1 - x.orb / (orbMax + 0.5)) * (W[x.a] ?? 0.4) * (W[x.b] ?? 0.4);
    return { x, pol: polarity(x), strength };
  });
}

// ---------------- Alanlar ----------------
export type AreaId = 'comm' | 'emotion' | 'attraction' | 'pleasure' | 'goals' | 'longevity' | 'freedom' | 'depth' | 'career';
interface AreaDef { id: AreaId; title: L; focus: K[]; sup: L; cha: L; easy: L; watch: L }
export const AREAS: AreaDef[] = [
  { id: 'comm', title: l('İletişim ve zihinsel uyum', 'Communication and mental rapport'), focus: ['mercury', 'sun', 'moon', 'jupiter', 'asc', 'pallas'],
    sup: l('konuşmayı, birlikte düşünmeyi ve birbirini anlamayı kolaylaştırır', 'makes talking, thinking together and understanding each other easier'),
    cha: l('ifade tarzı veya düşünce temposu farklı işleyebilir; yanlış anlamalar çıkabilir', 'styles of expression or thinking pace may differ; misunderstandings can arise'),
    easy: l('İletişim ve duyguları anlatma tarafı destekleniyor.', 'Communication and expressing feelings are supported.'),
    watch: l('Konuşma tarzı ve dinleme biçimi konusunda sabır gerekebilir.', 'Patience may be needed around how you talk and listen.') },
  { id: 'emotion', title: l('Duygusal güven ve bağlanma', 'Emotional security and attachment'), focus: ['moon', 'venus', 'saturn', 'ceres', 'chiron', 'juno'],
    sup: l('şefkati, yakınlığı ve birbirinin duygularını sezmeyi güçlendirir', 'strengthens tenderness, closeness and sensing each other’s feelings'),
    cha: l('duygusal ihtiyaçlar veya sevgi gösterme biçimi farklı algılanabilir', 'emotional needs or ways of showing love may be perceived differently'),
    easy: l('Duygusal güven ve birbirinizi kollama isteği belirgin.', 'Emotional security and the wish to look after each other are clear.'),
    watch: l('Duygusal ihtiyaçları tahmin etmek yerine sormak önemli olacak.', 'Asking about emotional needs rather than guessing will matter.') },
  { id: 'attraction', title: l('Çekim ve cinsel uyum', 'Attraction and sexual chemistry'), focus: ['venus', 'mars', 'pluto', 'sun', 'lilith', 'asc'],
    sup: l('romantik çekimi, arzuyu ve fiziksel yakınlığı artırır', 'boosts romantic attraction, desire and physical closeness'),
    cha: l('yoğun çekimle birlikte tepkisellik veya tetiklenme getirebilir', 'can bring reactivity or triggers along with strong attraction'),
    easy: l('Çekim, yakınlaşma ve ilişkiyi canlı tutan doğal bir akış görünüyor.', 'There is natural attraction, closeness and a flow that keeps things alive.'),
    watch: l('Tutku yoğunlaştığında sakin kalmak ve sınırları konuşmak gerekebilir.', 'When passion intensifies, staying calm and discussing boundaries may be needed.') },
  { id: 'pleasure', title: l('Keyif alanları ve sevgi dili', 'Shared pleasures and love language'), focus: ['venus', 'moon', 'jupiter', 'fortune'],
    sup: l('ortak keyifleri, birlikte eğlenmeyi ve hayattan tat almayı destekler', 'supports shared pleasures, having fun together and enjoying life'),
    cha: l('para, zevkler veya eğlence anlayışı farklılaşabilir', 'money, tastes or ideas of fun may differ'),
    easy: l('Birlikte eğlenmek ve hayattan keyif almak kolay.', 'Having fun and enjoying life together comes easily.'),
    watch: l('Zevkler ve harcama alışkanlıkları konusunda orta yol bulmak gerekebilir.', 'You may need a middle way on tastes and spending habits.') },
  { id: 'goals', title: l('Ortak hedefler ve bakış açıları', 'Shared goals and outlook'), focus: ['jupiter', 'saturn', 'sun', 'mercury', 'node'],
    sup: l('ortak hedef, öğrenme, büyüme ve plan yapma tarafını destekler', 'supports shared goals, learning, growth and planning'),
    cha: l('biri genişlemek isterken diğeri temkinli kalmak isteyebilir', 'one may want to expand while the other wants to stay cautious'),
    easy: l('Ortak hedefler ve hayata bakış açısı birbirini destekliyor.', 'Shared goals and outlooks on life support each other.'),
    watch: l('Gelecek planlarında temponuzu eşitlemek için konuşmanız gerekebilir.', 'You may need to talk to match your pace on future plans.') },
  { id: 'longevity', title: l('Uzun vadeli dayanıklılık', 'Long-term durability'), focus: ['saturn', 'moon', 'sun', 'venus', 'juno', 'vesta', 'asc'],
    sup: l('ilişkiye yapı, sadakat ve sorumluluk duygusu katar', 'adds structure, loyalty and a sense of responsibility'),
    cha: l('eleştiri, mesafe veya yük hissi bilinçli yönetilmelidir', 'criticism, distance or a sense of burden must be handled consciously'),
    easy: l('İlişkiyi ciddiye alma ve uzun vadede emek verme isteği güçlü.', 'The will to take the relationship seriously and invest long-term is strong.'),
    watch: l('Mesafe, soğukluk veya eleştirel tavır zaman zaman ilişkiyi zorlayabilir.', 'Distance, coolness or criticism may test the relationship at times.') },
  { id: 'freedom', title: l('Özgürlük ve alan ihtiyacı', 'Freedom and need for space'), focus: ['uranus', 'moon', 'venus', 'sun', 'jupiter'],
    sup: l('yeniliğe, arkadaşlığa ve bireysel alanı kabul etmeye kapasite verir', 'gives room for novelty, friendship and accepting individual space'),
    cha: l('ani uzaklaşma veya özgürlük–bağlılık dengesinde zorlanma görülebilir', 'sudden distancing or strain between freedom and commitment may appear'),
    easy: l('Birbirinize alan tanımak ve yenilikleri birlikte denemek kolay.', 'Giving each other space and trying new things together is easy.'),
    watch: l('Özgürlük ile bağlılık arasındaki dengeyi konuşmak gerekebilir.', 'You may need to discuss the balance between freedom and commitment.') },
  { id: 'depth', title: l('Derin bağ ve güç dengesi', 'Deep bond and balance of power'), focus: ['pluto', 'mars', 'venus', 'moon', 'mercury', 'lilith'],
    sup: l('derin konuşma, güçlü çekim ve psikolojik farkındalık potansiyeli verir', 'gives potential for deep talks, strong pull and psychological insight'),
    cha: l('kontrol, kıskançlık, takıntılı düşünme veya güç mücadelesi dikkat ister', 'control, jealousy, obsessive thinking or power struggles need care'),
    easy: l('Birbirinizi derinden anlama ve dönüştürme potansiyeli var.', 'There is potential to understand and transform each other deeply.'),
    watch: l('Güç mücadelesi, kıskançlık veya kontrol etme eğilimi dikkatle yönetilmelidir.', 'Power struggles, jealousy or the urge to control should be handled carefully.') },
  { id: 'career', title: l('Mesleki gelişim ve hayat yolu', 'Career growth and life path'), focus: ['mc', 'node', 'sun', 'jupiter', 'saturn'],
    sup: l('mesleki yön, görünürlük ve hayat yolu tarafında destekleyici bir temas verir', 'gives a supportive contact for career direction, visibility and life path'),
    cha: l('kariyer hedefleri veya hayat planı konusunda ritim farkı oluşturabilir', 'can create a difference in rhythm around career goals or life plans'),
    easy: l('Mesleki gelişim ve hayat yolunda birbirinizi destekleme potansiyeli var.', 'You have potential to support each other’s careers and life paths.'),
    watch: l('Kariyer ve hayat yolu konusunda beklenti baskısı oluşmaması için açık konuşmak gerekir.', 'Talk openly so that career and life-path expectations don’t become pressure.') },
];

export type Band = 'veryGood' | 'good' | 'balanced' | 'effort' | 'muchEffort';
export const BAND: Record<Band, { name: L; text: L }> = {
  veryGood: { name: l('Çok uyumlu', 'Very harmonious'), text: l('Bu alanda destekleyici açılar belirgin; ilişki buradan güç alabilir.', 'Supportive aspects are prominent here; the relationship can draw strength from this area.') },
  good: { name: l('Uyumlu', 'Harmonious'), text: l('Bu alanda anlaşmayı kolaylaştıran temaslar var; doğru kullanıldığında ilişkiyi rahatlatır.', 'Contacts here make agreement easier; used well, they ease the relationship.') },
  balanced: { name: l('Dengeli', 'Balanced'), text: l('Bu alanda hem destekleyici hem de öğretici göstergeler birlikte çalışıyor.', 'Supportive and instructive indicators work together here.') },
  effort: { name: l('Emek ister', 'Needs effort'), text: l('Bu alanda farkındalık gerekiyor; küçük konuları zamanında konuşmak önemli.', 'Awareness is needed here; discussing small issues in time matters.') },
  muchEffort: { name: l('Belirgin şekilde emek ister', 'Needs considerable effort'), text: l('Bu alanda açık konuşma, sınır ve sabır önemli; aksi hâlde küçük konular büyüyebilir.', 'Open talk, boundaries and patience are vital here; otherwise small issues can grow.') },
};
const band = (r: number): Band => (r >= 0.65 ? 'veryGood' : r >= 0.55 ? 'good' : r >= 0.45 ? 'balanced' : r >= 0.35 ? 'effort' : 'muchEffort');

export interface AreaResult { def: AreaDef; score: number; band: Band; sup: Scored[]; cha: Scored[] }

function relevance(s: Scored, focus: K[]) {
  const ia = focus.includes(s.x.a), ib = focus.includes(s.x.b);
  if (!ia && !ib) return 0;
  return ia && ib ? 1 : 0.55;
}

export function areas(sc: Scored[]): AreaResult[] {
  return AREAS.map(def => {
    let total = 0, sp = 0, ch = 0;
    const rel = sc.map(s => ({ s, r: relevance(s, def.focus) })).filter(z => z.r > 0);
    for (const z of rel) { const v = z.s.pol * z.s.strength * z.r * 10; total += v; if (v > 0) sp += v; else ch -= v; }
    const sup = rel.filter(z => z.s.pol > 0).sort((p, q) => q.s.strength * q.r - p.s.strength * p.r || p.s.x.orb - q.s.x.orb).slice(0, 3).map(z => z.s);
    const cha = rel.filter(z => z.s.pol < 0).sort((p, q) => q.s.strength * q.r - p.s.strength * p.r || p.s.x.orb - q.s.x.orb).slice(0, 3).map(z => z.s);
    const v = Math.round(total);
    return { def, score: v, band: band(sp / Math.max(0.01, sp + ch)), sup, cha };
  });
}

// ---------------- Kısa özet ----------------
export interface Summary { support: number; challenge: number; status: L; easy: L[]; watch: L[] }
export function summary(sc: Scored[], ar: AreaResult[]): Summary {
  let sp = 0, ch = 0;
  for (const s of sc) { const v = s.pol * s.strength * 10; if (v > 0) sp += v; else ch -= v; }
  const r = sp / Math.max(1, sp + ch);
  const status = r >= 0.62 ? l('Çok uyumlu', 'Very harmonious') : r >= 0.53 ? l('Uyumlu', 'Harmonious') : r >= 0.45 ? l('Dengeli', 'Balanced') : l('Emek isteyen', 'Needs effort');
  const sorted = [...ar].sort((a, b) => b.score - a.score);
  return {
    support: Math.round(sp), challenge: Math.round(ch), status,
    easy: sorted.filter(a => a.band === 'veryGood' || a.band === 'good' || a.score > 0).slice(0, 3).map(a => a.def.easy),
    watch: [...sorted].reverse().filter(a => a.band === 'effort' || a.band === 'muchEffort' || a.score < 0).slice(0, 3).map(a => a.def.watch),
  };
}

// ---------------- Temel sorular ----------------
interface QDef { q: L; focus: K[]; yes: L; mixed: L; no: L }
const QUESTIONS: QDef[] = [
  { q: l('İlişki uzun vadeli birlikteliği destekliyor mu?', 'Does the relationship support a long-term union?'), focus: ['saturn', 'moon', 'juno', 'vesta', 'sun', 'venus'],
    yes: l('Göstergeler uzun vadeli birliktelik için destekleyici bir zemin sunuyor. Sorumluluk alma, duygusal güveni besleme ve ilişkiyi ciddiye alma tarafı rahat çalışabilir.', 'The indicators offer a supportive ground for a long-term union. Taking responsibility, nurturing security and taking the bond seriously can work smoothly.'),
    mixed: l('Uzun vadeli potansiyel var ama emek istiyor. Bağlılık kurulabilir; ancak mesafe ya da beklenti farklarını zamanında konuşmak gerekir.', 'There is long-term potential but it needs work. Commitment can be built, though distance or differing expectations must be discussed in time.'),
    no: l('Uzun vadeli birliktelik için zorlayıcı göstergeler ağır basıyor. Bu imkânsız değil; fakat sabır, net sınırlar ve ortak kurallar şart.', 'Challenging indicators weigh more for a long-term union. It is not impossible, but patience, clear boundaries and shared rules are essential.') },
  { q: l('Fiziksel yakınlık ve cinsel uyum destekleniyor mu?', 'Are physical closeness and sexual harmony supported?'), focus: ['venus', 'mars', 'pluto', 'lilith', 'sun', 'moon', 'asc'],
    yes: l('Fiziksel yakınlık, çekim ve romantik temas açısından destekleyici göstergeler öne çıkıyor; ilişki enerjisi canlı kalabilir.', 'Supportive indicators stand out for physical closeness, attraction and romantic touch; the energy can stay alive.'),
    mixed: l('Çekim güçlü ama dalgalı olabilir; tutku ile sürtüşme bir arada. Arzuları ve sınırları konuşmak uyumu artırır.', 'Attraction is strong but may fluctuate; passion and friction coexist. Talking about desires and limits improves harmony.'),
    no: l('Fiziksel uyum kendiliğinden akmayabilir; ritim farkları veya tetiklenmeler olabilir. Sabır ve açık iletişim bu alanı geliştirir.', 'Physical harmony may not flow by itself; differences in rhythm or triggers may occur. Patience and open talk develop this area.') },
  { q: l('Birliktelik mesleki gelişimi destekliyor mu?', 'Does the union support career growth?'), focus: ['mc', 'node', 'sun', 'jupiter', 'saturn'],
    yes: l('Birliktelik mesleki gelişim, görünürlük ve hedef belirleme açısından destekleyici çalışabilir; birbirinizin potansiyelini açığa çıkarabilirsiniz.', 'The union can support career growth, visibility and goal-setting; you can bring out each other’s potential.'),
    mixed: l('Kariyer tarafında hem destek hem rekabet var. Hedefleri ortaklaştırmak, rekabeti işbirliğine çevirir.', 'There is both support and rivalry in the career area. Aligning goals turns rivalry into cooperation.'),
    no: l('Kariyer hedefleriniz farklı yönlere çekebilir; birbirinizin yoluna saygı göstermek baskıyı azaltır.', 'Your career goals may pull in different directions; respecting each other’s path reduces pressure.') },
  { q: l('Birliktelik kişileri güçlendiriyor mu, yıpratıyor mu?', 'Does the union empower or wear you down?'), focus: [],
    yes: l('Genel tablo ilişkinin tarafları güçlendirdiğini, destek, farkındalık ve ortak yön duygusu kazandırdığını gösteriyor. Zorlayıcı başlıklar olsa bile destekleyici bağ daha görünür.', 'Overall, the relationship empowers both people, giving support, awareness and a shared sense of direction. Even with challenging themes, the supportive bond is more visible.'),
    mixed: l('Destekleyici ve zorlayıcı göstergeler dengede. İlişki büyütücü olabilir; bunun için zor başlıklarda birlikte çalışmak gerekir.', 'Supportive and challenging indicators are balanced. The relationship can be empowering if you work together on the hard themes.'),
    no: l('Zorlayıcı göstergeler ağır basıyor; ilişki farkındalık olmadan yorucu olabilir. Bilinçli emek, sınırlar ve şefkat dengeyi değiştirebilir.', 'Challenging indicators dominate; without awareness the bond can be tiring. Conscious effort, boundaries and compassion can shift the balance.') },
];
export interface QResult { q: L; text: L; sup: number; cau: number }
export function questions(sc: Scored[]): QResult[] {
  return QUESTIONS.map(d => {
    let sp = 0, ca = 0;
    for (const s of sc) {
      if (d.focus.length && !d.focus.includes(s.x.a) && !d.focus.includes(s.x.b)) continue;
      const v = s.pol * s.strength * 10;
      if (v > 0) sp += v; else ca -= v;
    }
    const r = sp / Math.max(1, sp + ca);
    return { q: d.q, text: r >= 0.6 ? d.yes : r >= 0.45 ? d.mixed : d.no, sup: Math.round(sp), cau: Math.round(ca) };
  });
}

// ---------------- Yakınlık dili ----------------
export type Intimacy = 'touch' | 'mind' | 'emotion' | 'space';
export const INTIMACY: Record<Intimacy, { name: L; lead: L }> = {
  touch: { name: l('Dokunsal yakınlık', 'Physical touch'), lead: l('Yakınlık dili daha çok dokunsal ve bedensel temas üzerinden çalışır. Sarılmak, aynı ortamda bulunmak ve fiziksel yakınlığı sakin bir ritimde kurmak ilişkiyi güçlendirir.', 'Your intimacy language works mostly through touch and bodily closeness. Hugging, simply being together and building physical closeness at a calm pace strengthen the bond.') },
  mind: { name: l('İşitsel ve zihinsel', 'Words and mind'), lead: l('Yakınlık dili daha çok sözler ve fikirler üzerinden çalışır. Uzun sohbetler, mesajlaşmalar ve birlikte öğrenmek sevgiyi besler.', 'Your intimacy language works mostly through words and ideas. Long talks, messages and learning together feed the love.') },
  emotion: { name: l('Duygusal güven', 'Emotional safety'), lead: l('Yakınlık dili daha çok duygusal güven üzerinden çalışır. Anlaşıldığını hissetmek, hassasiyetleri paylaşmak ve sadakat en büyük sevgi göstergesidir.', 'Your intimacy language works mostly through emotional safety. Feeling understood, sharing vulnerabilities and loyalty are the greatest signs of love.') },
  space: { name: l('Özgür alan', 'Free space'), lead: l('Yakınlık dili özgürlük ve ortak maceralar üzerinden çalışır. Birlikte yeni şeyler denemek ve birbirine alan tanımak bağı canlı tutar.', 'Your intimacy language works through freedom and shared adventures. Trying new things together and giving each other space keeps the bond alive.') },
};
export function intimacy(me: Chart, them: Chart, sc: Scored[]): { pct: Record<Intimacy, number>; lead: Intimacy } {
  const v: Record<Intimacy, number> = { touch: 1, mind: 1, emotion: 1, space: 1 };
  const byEl = { earth: 'touch', air: 'mind', water: 'emotion', fire: 'space' } as const;
  for (const c of [me, them]) for (const id of ['venus', 'moon', 'mars'] as BodyId[]) {
    const p = c.positions[id];
    if (p) v[byEl[SIGN_ELEMENT[p.sign]]] += id === 'mars' ? 1 : 2;
  }
  for (const s of sc) {
    if (s.pol <= 0) continue;
    const has = (k: K) => s.x.a === k || s.x.b === k;
    const w = s.strength * 4;
    if ((has('venus') && has('mars')) || (has('mars') && (has('moon') || has('sun')))) v.touch += w;
    if (has('mercury') || has('pallas')) v.mind += w;
    if (has('moon') || has('ceres') || has('neptune')) v.emotion += w;
    if (has('uranus') || has('jupiter')) v.space += w;
  }
  const sum = v.touch + v.mind + v.emotion + v.space;
  const pct = { touch: Math.round((v.touch / sum) * 100), mind: Math.round((v.mind / sum) * 100), emotion: Math.round((v.emotion / sum) * 100), space: 0 };
  pct.space = 100 - pct.touch - pct.mind - pct.emotion;
  const lead = (Object.keys(pct) as Intimacy[]).sort((a, b) => pct[b] - pct[a])[0];
  return { pct, lead };
}

/** En kolaylaştırıcı ve en çok dikkat isteyen açılar */
export function topAspects(sc: Scored[], n = 5) {
  const rank = (s: Scored) => s.strength;
  return {
    easy: sc.filter(s => s.pol > 0).sort((a, b) => rank(b) - rank(a)).slice(0, n),
    hard: sc.filter(s => s.pol < 0).sort((a, b) => rank(b) - rank(a)).slice(0, n),
  };
}

export const pointLabel = (k: K) => relName(k);
