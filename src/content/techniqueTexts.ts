// Transit, progresyon, solar arc, dönüş, sinastri, kompozit, kartografi, Arap noktaları, sabit yıldız ve gezegen saati yorumları. Özgün metinler.
import type { BodyId, AspectType, Chart } from '../engine/astro';
import { houseOf } from '../engine/astro';
import { L, SIGNS, BODIES, HOUSES, BODY_FUNCTION, SIGN_ADVERB, ASPECT_INFO } from './base';
import { ord } from './life';
import { returnAscLife, returnLife, returnStageLife } from './lifeTexts';
import type { CrossAspect, LotId, AngleLine } from '../engine/techniques';

const l = (tr: string, en: string): L => ({ tr, en });
type K = BodyId | 'asc' | 'mc';
const fn = (k: K): L => k === 'asc' ? l('kişiliğin, görünüşün ve yaşama yaklaşımın', 'your personality, appearance and approach to life') : k === 'mc' ? l('kariyerin, hedeflerin ve toplumdaki yerin', 'your career, goals and public standing') : BODY_FUNCTION[k as BodyId];
export const ptName = (k: K): L => k === 'asc' ? l('Yükselen', 'Ascendant') : k === 'mc' ? l('MC', 'Midheaven') : BODIES[k as BodyId].name;
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
type Nat = 'harmonious' | 'challenging' | 'fusion' | 'adjust';
const nature = (t: AspectType): Nat => ASPECT_INFO[t].nature;

// ---------------- Transit etkileri (transit gezegen × açı doğası) ----------------
export const TRANSIT_EFFECT: Partial<Record<BodyId, Record<'harmonious' | 'challenging' | 'fusion', L>>> = {
  sun: { harmonious: l('Güneş bu alana ışık ve özgüven getiriyor; kendini göstermek için iyi bir gün.', 'The Sun brings light and confidence here; a good day to show yourself.'), challenging: l('Güneş bu alanda ego çatışmaları ya da yorgunluk yaratabilir; dengeyi koru.', 'The Sun may stir ego clashes or fatigue here; keep your balance.'), fusion: l('Güneş bu noktayı aydınlatıyor: konu gündeme gelir, odak sende.', 'The Sun spotlights this point: the matter comes up and the focus is on you.') },
  moon: { harmonious: l('Ay duygusal destek ve sezgi veriyor; ruh halin akışta.', 'The Moon gives emotional support and intuition; your mood flows.'), challenging: l('Ay duygusal dalgalanma getirebilir; tepki vermeden önce bekle.', 'The Moon may bring emotional waves; pause before reacting.'), fusion: l('Ay bu noktadan geçiyor: kısa süreli ama yoğun bir duygusal vurgu.', 'The Moon passes this point: a brief but intense emotional emphasis.') },
  mercury: { harmonious: l('Merkür akıcı iletişim, iyi haberler ve net düşünce getiriyor.', 'Mercury brings smooth communication, good news and clear thinking.'), challenging: l('Merkür yanlış anlamalar, gerginlik yaratan konuşmalar ya da dağınık düşünce getirebilir.', 'Mercury may bring misunderstandings, tense conversations or scattered thoughts.'), fusion: l('Merkür bu konuyu konuşmaya, yazmaya ve planlamaya açıyor.', 'Mercury opens this matter to talk, writing and planning.') },
  venus: { harmonious: l('Venüs sevgi, keyif, uyum ve maddi kolaylık getiriyor.', 'Venus brings love, pleasure, harmony and financial ease.'), challenging: l('Venüs aşırı harcama, tembellik ya da ilişkilerde küçük kırgınlıklar getirebilir.', 'Venus may bring overspending, laziness or small hurts in relationships.'), fusion: l('Venüs bu alanı tatlandırıyor: çekicilik ve sosyal kolaylık artar.', 'Venus sweetens this area: charm and social ease increase.') },
  mars: { harmonious: l('Mars enerji, cesaret ve girişim gücü veriyor; harekete geçmek için ideal.', 'Mars gives energy, courage and drive; ideal for taking action.'), challenging: l('Mars sabırsızlık, tartışma ya da aceleden doğan hatalar getirebilir; enerjini sporla boşalt.', 'Mars may bring impatience, arguments or hasty mistakes; release energy through exercise.'), fusion: l('Mars bu alanı ateşliyor: yoğun enerji, tutku ve mücadele isteği.', 'Mars ignites this area: intense energy, passion and fighting spirit.') },
  jupiter: { harmonious: l('Jüpiter şans, büyüme, fırsat ve destek getiriyor; kapılar açılıyor.', 'Jupiter brings luck, growth, opportunity and support; doors are opening.'), challenging: l('Jüpiter aşırılık, fazla iyimserlik ya da abartılı vaatler getirebilir; ölçülü kal.', 'Jupiter may bring excess, overconfidence or inflated promises; stay measured.'), fusion: l('Jüpiter bu alanı genişletiyor: önemli bir büyüme ve bereket dönemi.', 'Jupiter expands this area: a significant period of growth and abundance.') },
  saturn: { harmonious: l('Satürn kalıcı yapılar kurmak için sağlam bir zemin veriyor; emek karşılık bulur.', 'Saturn gives solid ground for lasting structures; effort pays off.'), challenging: l('Satürn sınav, gecikme ve sorumluluk getiriyor; sabırla kurulanlar kalıcı olur.', 'Saturn brings tests, delays and responsibility; what is built patiently lasts.'), fusion: l('Satürn bu alanda olgunlaşma dönemini başlatıyor: ciddiyet, yapı ve uzun vadeli kararlar.', 'Saturn starts a maturing period here: seriousness, structure and long-term decisions.') },
  uranus: { harmonious: l('Uranüs heyecan verici yenilikler, özgürleşme ve beklenmedik fırsatlar getiriyor.', 'Uranus brings exciting innovations, liberation and unexpected opportunities.'), challenging: l('Uranüs ani değişimler, kopuşlar ve huzursuzluk getirebilir; esnek kal.', 'Uranus may bring sudden changes, breaks and restlessness; stay flexible.'), fusion: l('Uranüs bu alanı uyandırıyor: köklü bir yenilenme ve özgürleşme.', 'Uranus awakens this area: a radical renewal and liberation.') },
  neptune: { harmonious: l('Neptün ilham, sezgi, şefkat ve ruhani derinlik getiriyor.', 'Neptune brings inspiration, intuition, compassion and spiritual depth.'), challenging: l('Neptün belirsizlik, kafa karışıklığı ya da hayal kırıklığı getirebilir; önemli kararları netleştir.', 'Neptune may bring uncertainty, confusion or disillusion; clarify important decisions.'), fusion: l('Neptün bu alanı yumuşatıp sınırlarını bulanıklaştırıyor: hayaller ve hassasiyet artar.', 'Neptune softens and blurs this area: dreams and sensitivity increase.') },
  pluto: { harmonious: l('Plüton derin bir güçlenme ve dönüşüm fırsatı veriyor.', 'Pluto offers deep empowerment and transformation.'), challenging: l('Plüton güç mücadeleleri ve köklü dönüşümler getiriyor; eskiyi bırakmak yeniliği getirir.', 'Pluto brings power struggles and deep transformations; letting go of the old brings the new.'), fusion: l('Plüton bu alanı kökünden dönüştürüyor: bir dönemin sonu ve yeni bir başlangıç.', 'Pluto transforms this area at its roots: the end of an era and a new beginning.') },
  chiron: { harmonious: l('Chiron eski yaraları iyileştirme fırsatı getiriyor.', 'Chiron brings a chance to heal old wounds.'), challenging: l('Chiron hassas noktalara dokunuyor; kendine şefkat göster.', 'Chiron touches sore spots; be gentle with yourself.'), fusion: l('Chiron bu alanda şifa sürecini başlatıyor.', 'Chiron starts a healing process here.') },
  node: { harmonious: l('Ay Düğümü kader fırsatları getiriyor.', 'The Node brings fated opportunities.'), challenging: l('Ay Düğümü yön değiştirme ihtiyacını gösteriyor.', 'The Node signals a need to change direction.'), fusion: l('Ay Düğümü bu alanı kader çizginle birleştiriyor.', 'The Node ties this area to your destiny.') },
};

/** Transit süresi (yaklaşık) */
export const TRANSIT_SPAN: Partial<Record<BodyId, L>> = {
  moon: l('birkaç saat', 'a few hours'), sun: l('1–2 gün', '1–2 days'), mercury: l('1–3 gün', '1–3 days'), venus: l('2–4 gün', '2–4 days'),
  mars: l('3–7 gün', '3–7 days'), jupiter: l('2–4 hafta', '2–4 weeks'), saturn: l('1–3 ay', '1–3 months'), uranus: l('3–6 ay', '3–6 months'),
  neptune: l('6–12 ay', '6–12 months'), pluto: l('1 yıla kadar', 'up to a year'), chiron: l('2–4 ay', '2–4 months'), node: l('1–2 ay', '1–2 months'),
};

export function transitText(t: K, n: K, type: AspectType, prefix: L = l('Transit', 'Transit')): { title: L; body: L } {
  const nat = nature(type);
  const eff = TRANSIT_EFFECT[t as BodyId]?.[nat === 'adjust' ? 'challenging' : nat] ?? ASPECT_INFO[type].desc;
  const span = TRANSIT_SPAN[t as BodyId];
  return {
    title: { tr: `${prefix.tr} ${ptName(t).tr} ${ASPECT_INFO[type].name.tr} natal ${ptName(n).tr}`, en: `${prefix.en} ${ptName(t).en} ${ASPECT_INFO[type].name.en} natal ${ptName(n).en}` },
    body: {
      tr: `${eff.tr} Bu etki ${fn(n).tr} üzerinde hissedilir.${span ? ` Etki süresi: ${span.tr}.` : ''}`,
      en: `${eff.en} It is felt in ${fn(n).en}.${span ? ` Duration: ${span.en}.` : ''}`,
    },
  };
}

export const TRANSIT_HOUSE: Partial<Record<BodyId, L>> = {
  jupiter: l('genişleme, şans ve fırsat', 'expansion, luck and opportunity'), saturn: l('sorumluluk, yapı ve olgunlaşma', 'responsibility, structure and maturation'),
  uranus: l('ani değişim ve özgürleşme', 'sudden change and liberation'), neptune: l('ilham, hassasiyet ve belirsizlik', 'inspiration, sensitivity and uncertainty'),
  pluto: l('derin dönüşüm ve güç', 'deep transformation and power'), mars: l('enerji, mücadele ve hareket', 'energy, struggle and action'),
  venus: l('keyif, sevgi ve uyum', 'pleasure, love and harmony'), sun: l('odak ve canlılık', 'focus and vitality'), mercury: l('iletişim ve planlama', 'communication and planning'),
};
export function transitHouseText(t: BodyId, house: number): L {
  return { tr: `Transit ${BODIES[t].name.tr} ${house}. evinde: ${HOUSES[house - 1].area.tr} alanında ${TRANSIT_HOUSE[t]?.tr ?? 'hareket'} dönemi.`, en: `Transit ${BODIES[t].name.en} in your ${ord(house)} house: a period of ${TRANSIT_HOUSE[t]?.en ?? 'activity'} in ${HOUSES[house - 1].area.en}.` };
}

// ---------------- Progresyon ----------------
export const PROG_MOON_SIGN: L[] = [
  l('Progres Ay Koç’ta: yeni başlangıçlar, cesaret ve bağımsızlık isteğiyle geçen yaklaşık 2,5 yıllık bir duygusal dönem.', 'Progressed Moon in Aries: a ~2.5-year emotional chapter of new beginnings, courage and independence.'),
  l('Progres Ay Boğa’da: güvenlik, konfor, maddi istikrar ve yavaşlama ihtiyacı.', 'Progressed Moon in Taurus: a need for security, comfort, stability and slowing down.'),
  l('Progres Ay İkizler’de: öğrenme, sosyalleşme, yazışma ve hareketli bir dönem.', 'Progressed Moon in Gemini: a lively chapter of learning, socialising and messaging.'),
  l('Progres Ay Yengeç’te: aile, yuva, kökler ve duygusal güvenlik ön planda.', 'Progressed Moon in Cancer: family, home, roots and emotional safety come first.'),
  l('Progres Ay Aslan’da: yaratıcılık, aşk, görünür olmak ve kendini ifade etme isteği.', 'Progressed Moon in Leo: a wish for creativity, romance, visibility and self-expression.'),
  l('Progres Ay Başak’ta: düzen, sağlık, iş ve gelişim üzerine odaklanma.', 'Progressed Moon in Virgo: focus on order, health, work and improvement.'),
  l('Progres Ay Terazi’de: ilişkiler, ortaklıklar ve denge kurma dönemi.', 'Progressed Moon in Libra: a chapter of relationships, partnerships and balance.'),
  l('Progres Ay Akrep’te: derin duygular, dönüşüm ve yakınlık; eskiyi bırakma.', 'Progressed Moon in Scorpio: deep feelings, transformation and intimacy; letting go of the old.'),
  l('Progres Ay Yay’da: seyahat, eğitim, özgürlük ve anlam arayışı.', 'Progressed Moon in Sagittarius: travel, study, freedom and the search for meaning.'),
  l('Progres Ay Oğlak’ta: hedefler, sorumluluklar ve kariyerde olgunlaşma.', 'Progressed Moon in Capricorn: goals, responsibilities and career maturity.'),
  l('Progres Ay Kova’da: arkadaşlar, topluluklar, yenilik ve özgürleşme.', 'Progressed Moon in Aquarius: friends, communities, innovation and liberation.'),
  l('Progres Ay Balık’ta: içe dönüş, maneviyat, sanat ve bir döngünün tamamlanması.', 'Progressed Moon in Pisces: introspection, spirituality, art and the closing of a cycle.'),
];
export function progMoonHouse(h: number): L {
  return { tr: `Önümüzdeki iki-üç yıl boyunca kalbin en çok şu konularda: ${HOUSES[h - 1].area.tr}.`, en: `For the next two to three years your heart is mostly on ${HOUSES[h - 1].area.en}.` };
}
export function progSunText(sign: number): L {
  return { tr: `Hayatının bu uzun evresinde (yaklaşık 30 yıl) kendini ${SIGN_ADVERB[sign].tr} ifade etmeye başlıyorsun; neyi önemsediğin buna göre şekilleniyor.`, en: `In this long chapter of life (about 30 years) you start expressing yourself ${SIGN_ADVERB[sign].en}; what you care about takes shape around it.` };
}
export const PROG_PHASE: L[] = [
  l('Progres Ay fazı yeni ay: 29 yıllık döngünün başı; yeni bir hayat bölümü tohumlanıyor.', 'Progressed new moon: the start of a 29-year cycle; a new life chapter is seeded.'),
  l('Hilal: yeni başlangıçlar şekilleniyor; eskinin direnciyle mücadele.', 'Crescent: new beginnings take shape; struggling with the old.'),
  l('İlk dördün: harekete geçme ve kriz aşaması; kararlar netleşir.', 'First quarter: action and crisis; decisions crystallise.'),
  l('Şişkin ay: ince ayar ve gelişme; mükemmelleştirme.', 'Gibbous: refinement and development; perfecting.'),
  l('Dolunay: zirve ve farkındalık; ilişkiler ve sonuçlar görünür olur.', 'Full: culmination and awareness; relationships and results become visible.'),
  l('Yayılan ay: öğrendiklerini paylaşma; anlam ve öğretme.', 'Disseminating: sharing what you learned; meaning and teaching.'),
  l('Son dördün: yeniden yönlenme; eski yapıları bırakma.', 'Last quarter: reorientation; releasing old structures.'),
  l('Balsamik: döngünün kapanışı; dinlenme, iç gözlem ve hazırlık.', 'Balsamic: closing the cycle; rest, reflection and preparation.'),
];

// ---------------- Dönüşler ----------------
export function returnTexts(ret: Chart, natal: Chart, kind: 'solar' | 'lunar'): { title: L; body: L }[] {
  const out: { title: L; body: L }[] = [];
  if (ret.asc !== null) {
    out.push(returnAscLife(Math.floor(ret.asc / 30), kind));
    if (natal.cusps.length) out.push(returnStageLife(houseOf(ret.asc, natal.cusps), kind));
  }
  for (const p of ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn', 'lilith'] as BodyId[]) {
    const pp = ret.positions[p]; if (!pp?.house) continue;
    const r = returnLife(p, pp.house, kind); if (r) out.push(r);
  }
  return out;
}
export function returnTextsTechnical(ret: Chart, natal: Chart, kind: 'solar' | 'lunar'): { title: L; body: L }[] {
  const out: { title: L; body: L }[] = [];
  const period = kind === 'solar' ? l('bu yıl', 'this year') : l('bu ay', 'this month');
  if (ret.asc !== null) {
    const s = Math.floor(ret.asc / 30);
    out.push({ title: l(`Dönüş yükseleni ${SIGNS[s].tr}`, `Return Ascendant ${SIGNS[s].en}`), body: { tr: `${cap(period.tr)} hayata ${SIGN_ADVERB[s].tr} bir şekilde yaklaşırsın.`, en: `${cap(period.en)} you approach life ${SIGN_ADVERB[s].en}.` } });
    if (natal.cusps.length) { const h = houseOf(ret.asc, natal.cusps); out.push({ title: l(`Dönüş yükseleni doğum haritanın ${h}. evinde`, `Return Ascendant in your natal ${ord(h)} house`), body: { tr: `${cap(period.tr)} ana sahne: ${HOUSES[h - 1].area.tr}.`, en: `${cap(period.en)} the main stage is ${HOUSES[h - 1].area.en}.` } }); }
  }
  for (const p of ['sun', 'moon', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]) {
    const pp = ret.positions[p]; if (!pp?.house) continue;
    out.push({ title: { tr: `${BODIES[p].name.tr} dönüşte ${pp.house}. evde`, en: `${BODIES[p].name.en} in the return’s ${ord(pp.house)} house` }, body: { tr: `${cap(period.tr)} ${BODY_FUNCTION[p].tr} en çok ${HOUSES[pp.house - 1].area.tr} alanında öne çıkar.`, en: `${cap(period.en)} ${BODY_FUNCTION[p].en} stand out mostly in ${HOUSES[pp.house - 1].area.en}.` } });
  }
  return out;
}

// ---------------- Sinastri ----------------
const SYN: Record<string, { s: L; h: L; c: L }> = {
  'sun-moon': { c: l('Güneş–Ay kavuşumu: ilişkilerde en güçlü bağlardan biri; biri ışık verir, diğeri kucaklar.', 'Sun–Moon conjunction: one of the strongest bonds; one shines, the other embraces.'), s: l('Kimlik ile duygular uyumlu: birbirinizi doğal olarak anlar ve desteklersiniz.', 'Identity and emotions harmonise: you naturally understand and support each other.'), h: l('İstekler ile duygusal ihtiyaçlar çekişebilir; anlayış ve konuşma bağı güçlendirir.', 'Wants and emotional needs may clash; understanding and talk strengthen the bond.') },
  'moon-moon': { c: l('Ay–Ay kavuşumu: duygusal ritimleriniz aynı; ev hayatında doğal uyum.', 'Moon–Moon conjunction: your emotional rhythms match; natural harmony at home.'), s: l('Duygusal ihtiyaçlarınız uyumlu; birlikte rahat edersiniz.', 'Your emotional needs harmonise; you feel at ease together.'), h: l('Duygusal tepkileriniz farklı; birbirinizin ihtiyacını sormak önemli.', 'Your emotional reactions differ; asking about each other’s needs matters.') },
  'venus-mars': { c: l('Venüs–Mars kavuşumu: güçlü fiziksel ve romantik çekim.', 'Venus–Mars conjunction: strong physical and romantic attraction.'), s: l('Romantik ve tutkulu bir uyum; çekim kolay ve keyifli.', 'A romantic, passionate harmony; attraction is easy and enjoyable.'), h: l('Yoğun çekim ama sürtüşme de var; tutku kıvılcım gibi.', 'Intense attraction with friction; passion like sparks.') },
  'venus-venus': { c: l('Zevkleriniz ve sevgi diliniz aynı.', 'Your tastes and love languages match.'), s: l('Estetik ve sevgi anlayışınız uyumlu.', 'Your aesthetics and ways of loving harmonise.'), h: l('Sevgi dilleriniz farklı; birbirinize nasıl sevildiğinizi anlatın.', 'Your love languages differ; tell each other how you feel loved.') },
  'sun-venus': { c: l('Biri diğerinin ışığına hayranlık duyar; sıcak ve sevgi dolu bir bağ.', 'One admires the other’s light; a warm, loving bond.'), s: l('Sevgi ve takdir kolay akar.', 'Love and appreciation flow easily.'), h: l('Takdir beklentileri farklı olabilir.', 'Expectations of appreciation may differ.') },
  'mercury-mercury': { c: l('Aynı dili konuşursunuz; zihinsel uyum güçlü.', 'You speak the same language; strong mental rapport.'), s: l('Kolay ve keyifli sohbetler.', 'Easy, enjoyable conversations.'), h: l('Düşünce tarzlarınız farklı; dinlemek köprü kurar.', 'Your thinking styles differ; listening builds bridges.') },
  'saturn-venus': { c: l('Bağlılık ve ciddiyet; ilişkiyi kalıcı kılan ama zaman zaman ağırlaştıran bir bağ.', 'Commitment and seriousness; a bond that makes the relationship last but can feel heavy.'), s: l('Sadakat ve güven; uzun vadeli potansiyel.', 'Loyalty and trust; long-term potential.'), h: l('Biri diğerini kısıtlanmış hissettirebilir; sıcaklık ve takdir dengeyi sağlar.', 'One may feel restricted; warmth and appreciation restore balance.') },
  'saturn-moon': { c: l('Koruyucu ama ciddi bir bağ; güven inşa edilir.', 'A protective but serious bond; trust is built.'), s: l('Duygusal güven ve istikrar.', 'Emotional security and stability.'), h: l('Duygusal soğukluk hissi; şefkatli ifade önemli.', 'A sense of emotional coolness; tender expression matters.') },
  'sun-sun': { c: l('Benzer kimlikler ve hedefler.', 'Similar identities and goals.'), s: l('Birbirinizi canlandırırsınız.', 'You energise each other.'), h: l('Ego çatışmaları olabilir.', 'Ego clashes may arise.') },
  'mars-mars': { c: l('Aynı enerji temposu.', 'The same energy tempo.'), s: l('Birlikte harekete geçmek kolay.', 'Acting together is easy.'), h: l('Rekabet ve tartışma eğilimi.', 'A tendency to compete and argue.') },
  'jupiter-venus': { c: l('Bereketli, cömert ve neşeli bir bağ.', 'An abundant, generous, joyful bond.'), s: l('Birbirinize şans getirirsiniz.', 'You bring each other luck.'), h: l('Aşırılık ve abartıya dikkat.', 'Watch for excess.') },
  'sun-jupiter': { c: l('Birbirinizi büyütürsünüz.', 'You help each other grow.'), s: l('İyimser ve destekleyici bir bağ.', 'An optimistic, supportive bond.'), h: l('Beklentiler fazla yüksek olabilir.', 'Expectations may be too high.') },
  'asc-venus': { c: l('Biri diğerini çok çekici bulur.', 'One finds the other very attractive.'), s: l('Doğal bir hoşlanma.', 'A natural liking.'), h: l('Görünüş ve beklentiler farklı.', 'Appearances and expectations differ.') },
  'asc-mars': { c: l('Güçlü fiziksel çekim ve enerji.', 'Strong physical attraction and energy.'), s: l('Birbirinizi harekete geçirirsiniz.', 'You get each other moving.'), h: l('Sürtüşme ve rekabet.', 'Friction and rivalry.') },
  'moon-venus': { c: l('Şefkatli ve sevgi dolu bir yakınlık.', 'A tender, loving closeness.'), s: l('Duygusal ve romantik uyum.', 'Emotional and romantic harmony.'), h: l('Duygusal ihtiyaçlar ve sevgi ifadesi farklı.', 'Emotional needs and love expression differ.') },
  'mercury-moon': { c: l('Duyguları kolayca konuşabilirsiniz.', 'You can talk feelings easily.'), s: l('Anlayışlı iletişim.', 'Understanding communication.'), h: l('Mantık ile duygu arasında yanlış anlamalar.', 'Misunderstandings between logic and feeling.') },
};
export function synPair(a: K, b: K, type: AspectType): L | null {
  const n = nature(type);
  for (const k of [`${a}-${b}`, `${b}-${a}`]) {
    const t = SYN[k];
    if (t) return n === 'fusion' ? t.c : n === 'harmonious' ? t.s : t.h;
  }
  return null;
}
export function synastryText(a: K, b: K, type: AspectType): L {
  const nat = nature(type);
  for (const k of [`${a}-${b}`, `${b}-${a}`]) {
    const t = SYN[k];
    if (t) return nat === 'fusion' ? t.c : nat === 'harmonious' ? t.s : t.h;
  }
  return { tr: `${cap(fn(a).tr)} ile onun ${fn(b).tr} arasında: ${ASPECT_INFO[type].desc.tr}.`, en: `Between your ${fn(a).en} and their ${fn(b).en}: ${ASPECT_INFO[type].desc.en}.` };
}
export function synastryTitle(x: CrossAspect, me: string, them: string): L {
  return { tr: `${me} ${ptName(x.b).tr} ${ASPECT_INFO[x.type].name.tr} ${them} ${ptName(x.a).tr}`, en: `${me} ${ptName(x.b).en} ${ASPECT_INFO[x.type].name.en} ${them} ${ptName(x.a).en}` };
}
export const HARMONY: Record<'bad' | 'average' | 'good' | 'perfect', L> = {
  bad: l('Zayıf uyum: farklılıklar büyük; ilişki çok emek ister.', 'Weak harmony: big differences; the relationship needs much effort.'),
  average: l('Orta uyum: hem çekim hem sürtüşme var.', 'Average harmony: both attraction and friction.'),
  good: l('İyi uyum: doğal bir çekim ve anlayış.', 'Good harmony: natural attraction and understanding.'),
  perfect: l('Mükemmel uyum: nadir görülen güçlü bir bağ.', 'Perfect harmony: a rare, strong bond.'),
};

// ---------------- Kompozit / Davison ----------------
export function compositePlacement(id: BodyId, sign: number, house: number): L {
  return {
    tr: `İlişkinizde ${BODY_FUNCTION[id].tr} ${SIGN_ADVERB[sign].tr} bir şekilde yaşanır${house ? `; bu enerji en çok ${HOUSES[house - 1].area.tr} alanında öne çıkar` : ''}.`,
    en: `In your relationship, ${BODY_FUNCTION[id].en} are lived ${SIGN_ADVERB[sign].en}${house ? `; this energy shows mostly in ${HOUSES[house - 1].area.en}` : ''}.`,
  };
}

// ---------------- Kartografi ----------------
const LINE: Record<AngleLine, L> = {
  MC: l('MC çizgisi: kariyer, tanınırlık ve toplumsal başarı', 'MC line: career, recognition and public success'),
  IC: l('IC çizgisi: ev, aile, kök salma ve iç huzur', 'IC line: home, family, putting down roots and inner peace'),
  ASC: l('ASC çizgisi: kişisel dönüşüm, enerji ve kendini ifade', 'ASC line: personal transformation, energy and self-expression'),
  DSC: l('DSC çizgisi: ilişkiler, ortaklıklar ve evlilik', 'DSC line: relationships, partnerships and marriage'),
};
const LINE_PLANET: Partial<Record<BodyId, L>> = {
  sun: l('görünürlük, özgüven ve canlılık', 'visibility, confidence and vitality'), moon: l('duygusal yakınlık, ev hissi ve halkla bağ', 'emotional closeness, a sense of home and connection with the public'),
  mercury: l('iletişim, eğitim ve ticaret', 'communication, study and trade'), venus: l('aşk, sanat, keyif ve sosyal kolaylık', 'love, art, pleasure and social ease'),
  mars: l('enerji, rekabet ve mücadele (bazen çatışma)', 'energy, competition and drive (sometimes conflict)'), jupiter: l('şans, büyüme ve bolluk', 'luck, growth and abundance'),
  saturn: l('ciddiyet, emek ve uzun vadeli yapı (bazen ağırlık)', 'seriousness, hard work and lasting structure (sometimes heaviness)'), uranus: l('ani değişim, yenilik ve özgürleşme', 'sudden change, innovation and liberation'),
  neptune: l('ilham, maneviyat ve sanat (bazen belirsizlik)', 'inspiration, spirituality and art (sometimes confusion)'), pluto: l('derin dönüşüm ve güç', 'deep transformation and power'),
};
export function lineText(b: BodyId, line: AngleLine): L {
  return { tr: `${BODIES[b].name.tr} ${LINE[line].tr}. Bu bölgede ${LINE_PLANET[b]?.tr ?? ''} temaları güçlenir.`, en: `${BODIES[b].name.en} ${LINE[line].en}. Here themes of ${LINE_PLANET[b]?.en ?? ''} intensify.` };
}

// ---------------- Arap noktaları ----------------
export const LOT_TEXT: Record<LotId, { name: L; desc: L }> = {
  fortune: { name: l('Şans Noktası', 'Part of Fortune'), desc: l('Beden, sağlık ve maddi refah; doğal olarak bolluk bulduğun alan.', 'Body, wellbeing and material welfare; where you find abundance naturally.') },
  spirit: { name: l('Ruh Noktası', 'Part of Spirit'), desc: l('Zihin, irade ve bilinçli eylem; kendi seçimlerinle yarattığın alan.', 'Mind, will and conscious action; what you create by choice.') },
  eros: { name: l('Eros Noktası', 'Part of Eros'), desc: l('Arzu, aşk ve tutku; neyi ve kimi istediğin.', 'Desire, love and passion; what and whom you long for.') },
  necessity: { name: l('Zorunluluk Noktası', 'Part of Necessity'), desc: l('Kısıtlamalar ve kaçınılmazlar; mücadele ederek öğrendiğin alan.', 'Constraints and necessities; what you learn through struggle.') },
  courage: { name: l('Cesaret Noktası', 'Part of Courage'), desc: l('Cesaret, cüret ve eylem gücü.', 'Courage, boldness and power to act.') },
  victory: { name: l('Zafer Noktası', 'Part of Victory'), desc: l('Başarı, inanç ve ödüller.', 'Success, faith and rewards.') },
  nemesis: { name: l('Nemesis Noktası', 'Part of Nemesis'), desc: l('Sınavlar, gizli zorluklar ve karmik dersler.', 'Tests, hidden difficulties and karmic lessons.') },
  marriage: { name: l('Evlilik Noktası', 'Part of Marriage'), desc: l('Evlilik ve kalıcı birliktelik teması; partnerle ilgili ipuçları.', 'Marriage and lasting union; clues about the partner.') },
  father: { name: l('Baba Noktası', 'Part of Father'), desc: l('Baba ve baba figürleri ile ilişki.', 'Relationship with father and father figures.') },
  mother: { name: l('Anne Noktası', 'Part of Mother'), desc: l('Anne ve anne figürleri ile ilişki.', 'Relationship with mother and mother figures.') },
  siblings: { name: l('Kardeş Noktası', 'Part of Siblings'), desc: l('Kardeşler ve yakın akrabalar.', 'Siblings and close relatives.') },
  children: { name: l('Çocuk Noktası', 'Part of Children'), desc: l('Çocuklar ve yaratıcı üretkenlik.', 'Children and creative fertility.') },
  friends: { name: l('Dostluk Noktası', 'Part of Friends'), desc: l('Dostluklar ve destekçiler.', 'Friendships and supporters.') },
  commerce: { name: l('Ticaret Noktası', 'Part of Commerce'), desc: l('Ticaret, alışveriş ve iş bağlantıları.', 'Trade, buying and selling, business contacts.') },
  faith: { name: l('İnanç Noktası', 'Part of Faith'), desc: l('İnanç, sezgi ve ruhani bağlılık.', 'Faith, intuition and spiritual devotion.') },
};

// ---------------- Sabit yıldız doğaları ----------------
export const STAR_NATURE: Record<string, L> = {
  'saturn-jupiter': l('ciddiyet ve büyük sınavlar; yoğun irade', 'seriousness and great tests; intense will'), 'moon-mars': l('hırs ve hareketlilik', 'ambition and restlessness'),
  mars: l('cesaret, savaşçı ruh ve atılganlık', 'courage, a warrior spirit and boldness'), 'jupiter-saturn': l('başarı, öğreticilik ve kalıcı ün', 'success, teaching and lasting fame'),
  'mars-mercury': l('merak, keskin zekâ ve beceri', 'curiosity, sharp wit and skill'), 'jupiter-mars': l('parlaklık, şöhret ve tutku', 'brilliance, fame and passion'),
  mercury: l('zekâ ve yetenek', 'intelligence and talent'), 'mercury-mars': l('hızlı yükseliş, zekâ ve dikkat', 'swift rise, wit and caution'),
  'mars-jupiter': l('yücelik, liderlik ve onur', 'greatness, leadership and honour'), 'saturn-venus': l('incelik ve eleştirel bakış', 'refinement and a critical eye'),
  'saturn-mercury': l('dikkatli ve ciddi zekâ', 'careful, serious intelligence'), 'venus-mars': l('yetenek, şans ve koruma', 'talent, luck and protection'),
  'saturn-mars': l('zorluklar ve güç sınavları', 'difficulties and tests of strength'), 'venus-mercury': l('sanat, zarafet ve ilham', 'art, grace and inspiration'),
};

// ---------------- Gezegen saatleri ----------------
export const HOUR_USE: Partial<Record<BodyId, L>> = {
  sun: l('Otorite, başvuru, liderlik ve görünür olma', 'Authority, applications, leadership and visibility'),
  moon: l('Ev işleri, aile, yolculuk ve halkla ilişkiler', 'Home, family, travel and public relations'),
  mars: l('Spor, cesaret isteyen işler, cerrahi ve rekabet', 'Sport, bold tasks, surgery and competition'),
  mercury: l('Yazışma, sözleşme, ticaret, öğrenme ve kısa yolculuk', 'Correspondence, contracts, trade, learning and short trips'),
  jupiter: l('Para, hukuk, eğitim, büyüme ve iyilik isteme', 'Money, law, education, growth and asking favours'),
  venus: l('Aşk, güzellik, sanat, alışveriş ve sosyal etkinlik', 'Love, beauty, art, shopping and social events'),
  saturn: l('Planlama, disiplin, emlak ve uzun vadeli işler', 'Planning, discipline, property and long-term work'),
};

export { nature as aspectNature };
