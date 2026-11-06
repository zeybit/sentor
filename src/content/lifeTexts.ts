// Harita türlerindeki yorumları "hayatında ne olacak" diliyle anlatan yardımcılar.
// Başlıklar gezegen/açı adı yerine hayat alanını ve etkinin tonunu söyler.
import type { AspectType, BodyId } from '../engine/astro';
import { ASPECT_INFO, HOUSES, L, SIGN_ADVERB, SIGNS } from './base';
import { TRANSIT_EFFECT, TRANSIT_SPAN } from './techniqueTexts';
const l = (tr: string, en: string): L => ({ tr, en });
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
type K = BodyId | 'asc' | 'mc';
type Tone = 'easy' | 'hard' | 'fusion';
const tone = (t: AspectType): Tone => { const n = ASPECT_INFO[t].nature; return n === 'harmonious' ? 'easy' : n === 'fusion' ? 'fusion' : 'hard'; };

/** Doğum haritandaki noktanın hayatta karşılık geldiği alan */
export const LIFE_AREA: Partial<Record<K, L>> = {
  sun: l('kendine güvenin ve hedeflerin', 'your confidence and goals'),
  moon: l('duyguların, evin ve ailen', 'your feelings, home and family'),
  mercury: l('kafandakiler, konuşmaların ve evrak işlerin', 'your thoughts, conversations and paperwork'),
  venus: l('aşk hayatın, keyiflerin ve paran', 'your love life, pleasures and money'),
  mars: l('enerjin, motivasyonun ve öfken', 'your energy, drive and temper'),
  jupiter: l('şansın ve büyüme fırsatların', 'your luck and chances to grow'),
  saturn: l('sorumlulukların ve uzun vadeli planların', 'your responsibilities and long-term plans'),
  uranus: l('özgürlük ihtiyacın ve değişim isteğin', 'your need for freedom and change'),
  neptune: l('hayallerin ve sezgilerin', 'your dreams and intuition'),
  pluto: l('içindeki güç ve köklü değişimler', 'your inner power and deep changes'),
  chiron: l('eski kırgınlıkların ve iyileşmen', 'your old hurts and healing'),
  node: l('hayatının yönü', 'the direction of your life'),
  lilith: l('saklı tarafın ve bastırdığın arzuların', 'your hidden side and suppressed desires'),
  asc: l('görünüşün ve insanlara karşı tavrın', 'your appearance and how you come across'),
  mc: l('kariyerin ve itibarın', 'your career and reputation'),
};
export const lifeArea = (k: K): L => LIFE_AREA[k] ?? l('hayatının bu alanı', 'this area of life');

/** Etkileyen gezegenin, açının tonuna göre hayattaki karşılığı */
const TONE_TXT: Partial<Record<BodyId, Record<Tone, L>>> = {
  sun: { easy: l('öne çıkıyor, kendini gösterme fırsatı', 'in the spotlight, a chance to shine'), hard: l('yorgunluk ve ego çatışmasına dikkat', 'watch for fatigue and ego clashes'), fusion: l('gündemin tam ortasında', 'right at the centre of your agenda') },
  moon: { easy: l('içini rahatlatan bir an', 'a soothing moment'), hard: l('duygusal dalgalanma', 'emotional ups and downs'), fusion: l('kısa ama yoğun bir duygu', 'a brief but strong feeling') },
  mercury: { easy: l('konuşmalar ve haberler kolay akıyor', 'talks and news flow easily'), hard: l('yanlış anlaşılmalara dikkat', 'watch for misunderstandings'), fusion: l('konuşulacak, yazılacak, karar verilecek', 'time to talk, write and decide') },
  venus: { easy: l('tatlı ve keyifli bir dönem', 'a sweet, pleasant spell'), hard: l('keyif ile gerçek arasında gerilim', 'tension between pleasure and reality'), fusion: l('sevgi ve keyif kapını çalıyor', 'love and pleasure knock on your door') },
  mars: { easy: l('harekete geçmek için doğru an', 'the right moment to act'), hard: l('gerginlik ve aceleciliğe dikkat', 'watch for tension and haste'), fusion: l('enerji yükseliyor, sabırsızlık da', 'energy rises, and so does impatience') },
  jupiter: { easy: l('şans ve fırsat kapısı açılıyor', 'a door of luck and opportunity opens'), hard: l('abartı ve fazla harcamaya dikkat', 'watch for overdoing and overspending'), fusion: l('büyüme ve bolluk dönemi', 'a period of growth and plenty') },
  saturn: { easy: l('kalıcı adımlar atma zamanı', 'time to take lasting steps'), hard: l('sınav, yük ve sabır dönemi', 'a time of tests, weight and patience'), fusion: l('ciddi bir dönemeç; olgunlaşma zamanı', 'a serious turning point; time to mature') },
  uranus: { easy: l('heyecan verici bir yenilik', 'an exciting new start'), hard: l('beklenmedik sarsıntılar', 'unexpected shake-ups'), fusion: l('ani ve hayatı değiştiren bir gelişme', 'a sudden, life-changing development') },
  neptune: { easy: l('ilham ve sezgi güçleniyor', 'inspiration and intuition grow'), hard: l('belirsizlik ve hayal kırıklığı riski', 'risk of confusion and disappointment'), fusion: l('sisli ama ilham dolu bir dönem', 'a foggy but inspired period') },
  pluto: { easy: l('güç kazandıran derin bir değişim', 'a deep change that empowers you'), hard: l('zorlayıcı ama dönüştürücü bir süreç', 'a hard but transforming process'), fusion: l('köklü bir yeniden doğuş', 'a radical rebirth') },
  chiron: { easy: l('eski yaralar iyileşebilir', 'old wounds can heal'), hard: l('eski kırgınlıklar yeniden gün yüzüne çıkıyor', 'old hurts resurface'), fusion: l('iyileşme ve yüzleşme zamanı', 'a time to face things and heal') },
  lilith: { easy: l('saklı gücün işine yarıyor', 'your hidden power works for you'), hard: l('bastırdıkların yüzeye çıkıyor', 'what you suppressed comes to the surface'), fusion: l('artık yeter dediğin bir an', 'an "enough is enough" moment') },
  node: { easy: l('doğru yöne bir kapı aralanıyor', 'a door opens in the right direction'), hard: l('yön değiştirme baskısı', 'pressure to change course'), fusion: l('kader gibi hissettiren bir buluşma ya da karar', 'a meeting or decision that feels fated') },
};

const ANGLE_TXT: Record<'asc' | 'mc', Record<Tone, { t: L; e: L }>> = {
  asc: {
    easy: { t: l('çevrenden destek geliyor', 'support comes from people around you'), e: l('İnsanlarla ilişkin ve kendini gösterme biçimin bu alanı kolaylaştırıyor; doğru kişiler doğru anda karşına çıkabilir.', 'How you relate to people and present yourself makes this area easier; the right people may appear at the right time.') },
    hard: { t: l('yeni bir duruş gerektiren bir olay', 'an event that asks you to take a new stance'), e: l('Bir olay seni bu konuda tavrını değiştirmeye zorlayabilir; eskisi gibi davranmak artık işe yaramaz.', 'An event may push you to change your stance here; behaving as before no longer works.') },
    fusion: { t: l('kendini yeniden tanımlama zamanı', 'time to redefine yourself'), e: l('Bu konu doğrudan senin kim olduğunla ilgili bir başlangıç getiriyor; görünüşün, tavrın ya da yaşam yerin değişebilir.', 'This brings a fresh start tied to who you are; your look, manner or place of living may change.') },
  },
  mc: {
    easy: { t: l('kariyerinden destek geliyor', 'your career gives support'), e: l('İş hayatındaki bir gelişme bu alanı besliyor; bir terfi, takdir ya da iyi bir teklif söz konusu olabilir.', 'A development at work feeds this area; a promotion, recognition or a good offer may come.') },
    hard: { t: l('iş hayatında bir sarsıntı', 'a shake-up at work'), e: l('Kariyer hedeflerin ile bu alan arasında denge kurman gerekebilir; bir iş değişikliği ya da yön sorgulaması gündeme gelebilir.', 'You may need to balance career goals with this area; a job change or a rethink of direction may come up.') },
    fusion: { t: l('kariyerde bir dönüm noktası', 'a career turning point'), e: l('Toplumdaki yerin ve hedeflerin bu konu üzerinden yeniden şekilleniyor; adını duyuracağın bir adım olabilir.', 'Your public role and goals are reshaped through this; it may be a step that makes your name known.') },
  },
};

const LILITH_EFF: Record<Tone, L> = {
  easy: l('Saklamaya alıştığın taraf bu konuda sana cesaret veriyor; kurallara uymadığın yerde şans buluyorsun', 'The side you usually hide gives you courage here; you find luck where you break the rules'),
  hard: l('Bu konuda yıllardır yuttuğun bir şey yüzeye çıkabilir: öfke, kıskançlık ya da bastırılmış bir istek. Kaçmak yerine adını koymak seni özgürleştirir', 'Something you swallowed for years may rise here: anger, jealousy or a suppressed wish. Naming it instead of running frees you'),
  fusion: l('Bu konuda artık eskisi gibi uysal olamazsın. Sınır çizmek, hayır demek ya da yasak sayılan bir şeyi istemek gündeme gelir', 'You can no longer be as compliant as before here. Setting limits, saying no, or wanting something forbidden comes up'),
};
const TO_LILITH: Record<Tone, L> = {
  easy: l('Bu etki saklı tarafını yumuşakça uyandırıyor; bastırdığın bir isteği sahiplenmek kolaylaşıyor', 'This gently wakes your hidden side; owning a suppressed wish becomes easier'),
  hard: l('Bu etki seni kızdıran, kıskandıran ya da "fazla" bulunduğun eski bir yaraya dokunuyor. Tepkin büyük olabilir; altındaki ihtiyacı görmeye çalış', 'This touches an old wound where you were angry, jealous or called "too much". Your reaction may be big; look for the need beneath it'),
  fusion: l('Bu etki tam olarak bastırdığın gücün üstüne basıyor: yasak bir çekim, güçlü bir öfke ya da bir anda gelen özgürleşme isteği olabilir', 'This lands right on your suppressed power: a forbidden attraction, strong anger or a sudden urge to break free'),
};

export type Technique = 'transit' | 'progressed' | 'solarArc';
export const CLOSING: Record<Technique, L | null> = {
  transit: null,
  progressed: l('Bu dışarıdan çok içeride yaşanan, birkaç yıl süren yavaş bir değişim; bir sabah fark edersin ki artık başka şeyler istiyorsun.', 'This is a slow change lived more inside than outside and lasting a few years; one morning you notice you want different things.'),
  solarArc: l('Bu etki genellikle bir yıl içinde somut bir olayla kendini gösterir: bir karar, bir taşınma, bir başlangıç ya da bir veda.', 'This usually shows up within a year as a concrete event: a decision, a move, a beginning or a goodbye.'),
};

/** Bir gezegenin doğum haritandaki bir noktaya etkisini hayat diliyle anlatır */
export function lifeAspect(t: K, n: K, type: AspectType, tech: Technique): { title: L; body: L } {
  const tn = tone(type);
  const area = lifeArea(n);
  const ang = t === 'asc' || t === 'mc' ? ANGLE_TXT[t][tn] : null;
  const tt = ang?.t ?? TONE_TXT[t as BodyId]?.[tn] ?? (tn === 'easy' ? l('destekleniyor', 'supported') : tn === 'hard' ? l('sınanıyor', 'being tested') : l('gündemde', 'on the agenda'));
  const raw = ang?.e ?? (t === 'lilith' ? LILITH_EFF[tn] : n === 'lilith' ? TO_LILITH[tn] : null) ?? TRANSIT_EFFECT[t as BodyId]?.[tn === 'easy' ? 'harmonious' : tn === 'hard' ? 'challenging' : 'fusion'] ?? ASPECT_INFO[type].desc;
  const eff = { tr: cap(raw.tr), en: cap(raw.en) };
  const span = tech === 'transit' ? (t === 'lilith' ? l('1–2 ay', '1–2 months') : TRANSIT_SPAN[t as BodyId]) : null;
  return {
    title: { tr: `${cap(area.tr)}: ${tt.tr}`, en: `${cap(area.en)}: ${tt.en}` },
    body: {
      tr: `${eff.tr.replace(/\.$/, '')}. Bunu en çok ${area.tr} konusunda hissedersin.${span ? ` Yaklaşık ${span.tr} sürer.` : ''}`,
      en: `${eff.en.replace(/\.$/, '')}. You feel it most in ${area.en}.${span ? ` It lasts about ${span.en}.` : ''}`,
    },
  };
}

/** İki noktanın birbiriyle ilişkisi (dönüş haritası iç dengeleri, gizli bağlar) */
const SHORT: Partial<Record<K, L>> = {
  sun: l('özgüvenin', 'your confidence'), moon: l('duyguların', 'your feelings'), mercury: l('aklın', 'your mind'), venus: l('aşk hayatın', 'your love life'),
  mars: l('enerjin', 'your energy'), jupiter: l('şansın', 'your luck'), saturn: l('sorumlulukların', 'your duties'), uranus: l('özgürlük isteğin', 'your need for freedom'),
  neptune: l('hayallerin', 'your dreams'), pluto: l('içindeki güç', 'your inner power'), lilith: l('saklı tarafın', 'your hidden side'), chiron: l('eski yaraların', 'your old wounds'), node: l('hayat yönün', 'your life direction'),
  asc: l('görünüşün', 'your image'), mc: l('kariyerin', 'your career'),
};
export const shortArea = (k: K): L => SHORT[k] ?? lifeArea(k);
export function lifePair(a: K, b: K, type: AspectType): L {
  const tn = tone(type);
  const A = shortArea(a), B = shortArea(b);
  const v = tn === 'easy' ? l('birbirini destekliyor', 'support each other') : tn === 'hard' ? l('birbiriyle çekişiyor', 'pull against each other') : l('iç içe geçiyor', 'merge together');
  return { tr: `${cap(A.tr)} ve ${B.tr} ${v.tr}`, en: `${cap(A.en)} and ${B.en} ${v.en}` };
}

const SLOW_THEME: Partial<Record<BodyId, L>> = {
  jupiter: l('şans ve büyüme getiriyor', 'brings luck and growth'), saturn: l('emek, sabır ve sorumluluk istiyor', 'asks for effort, patience and responsibility'),
  uranus: l('beklenmedik değişim ve özgürleşme getiriyor', 'brings unexpected change and freedom'), neptune: l('ilham veriyor ama netliği bulanıklaştırabiliyor', 'inspires but can blur clarity'),
  pluto: l('derin ve kalıcı bir dönüşüm yaşatıyor', 'brings deep and lasting transformation'), mars: l('hareket, enerji ve biraz da tartışma getiriyor', 'brings action, energy and some friction'),
};
const SLOW_SPAN: Partial<Record<BodyId, L>> = {
  jupiter: l('yaklaşık bir yıl', 'about a year'), saturn: l('iki-üç yıl', 'two to three years'), uranus: l('yedi yıl kadar', 'about seven years'),
  neptune: l('on yılı aşkın', 'over ten years'), pluto: l('on yıllarca', 'for decades'), mars: l('birkaç hafta', 'a few weeks'),
};
export function lifeHouse(t: BodyId, house: number): { title: L; body: L } {
  const area = HOUSES[house - 1].area;
  const th = SLOW_THEME[t] ?? l('hareket getiriyor', 'brings activity');
  const sp = SLOW_SPAN[t];
  return {
    title: { tr: cap(area.tr), en: cap(area.en) },
    body: { tr: `Bu alan şu sıralar ${th.tr}.${sp ? ` Bu hâl ${sp.tr} sürer.` : ''}`, en: `This area currently ${th.en}.${sp ? ` It lasts ${sp.en}.` : ''}` },
  };
}

/** Dönüş haritası (Güneş/Ay dönüşü) için hayat dilinde başlıklar */
const RET_PLANET: Partial<Record<BodyId, { t: L; b: L }>> = {
  sun: { t: l('Enerjini en çok nereye harcayacaksın', 'Where most of your energy goes'), b: l('enerjinin ve dikkatinin büyük kısmı', 'most of your energy and attention') },
  moon: { t: l('Duygusal olarak en çok neyle meşgul olacaksın', 'What will occupy your heart'), b: l('kalbin ve aklın en çok', 'your heart and mind mostly') },
  venus: { t: l('Aşk ve keyif nereden gelecek', 'Where love and joy will come from'), b: l('sevgi, keyif ve güzel anlar en çok', 'love, pleasure and good moments mostly') },
  mars: { t: l('Nerede mücadele edip harekete geçeceksin', 'Where you will fight and act'), b: l('mücadele ve harekete geçme isteğin en çok', 'your urge to act and fight mostly') },
  jupiter: { t: l('Şansın nerede açılıyor', 'Where luck opens up'), b: l('şans ve fırsatlar en çok', 'luck and opportunities mostly') },
  lilith: { t: l('Nerede kuralları yıkacaksın', 'Where you will break the rules'), b: l('bastırdığın istekler ve hayır deme gücün en çok', 'your suppressed wishes and power to say no mostly') },
  saturn: { t: l('Nerede emek ve sabır gerekecek', 'Where effort and patience will be needed'), b: l('emek, sabır ve sorumluluk en çok', 'effort, patience and responsibility mostly') },
};
export function returnLife(planet: BodyId, house: number, kind: 'solar' | 'lunar'): { title: L; body: L } | null {
  const r = RET_PLANET[planet]; if (!r) return null;
  const per = kind === 'solar' ? l('Bu yıl', 'This year') : l('Bu ay', 'This month');
  const area = HOUSES[house - 1].area;
  return { title: r.t, body: { tr: `${per.tr} ${r.b.tr} şu konulara gider: ${area.tr}.`, en: `${per.en} ${r.b.en} goes to: ${area.en}.` } };
}
export function returnAscLife(sign: number, kind: 'solar' | 'lunar'): { title: L; body: L } {
  const per = kind === 'solar' ? l('bu yıl', 'this year') : l('bu ay', 'this month');
  return { title: kind === 'solar' ? l('Bu yıl nasıl bir tavırla yaşayacaksın', 'Your attitude this year') : l('Bu ay nasıl bir tavırla yaşayacaksın', 'Your attitude this month'),
    body: { tr: `${cap(per.tr)} hayata ${SIGN_ADVERB[sign].tr} bir şekilde yaklaşırsın; insanlar seni böyle görür (${SIGNS[sign].tr} havası).`, en: `${cap(per.en)} you approach life ${SIGN_ADVERB[sign].en}; this is how people see you (${SIGNS[sign].en} mood).` } };
}
export function returnStageLife(house: number, kind: 'solar' | 'lunar'): { title: L; body: L } {
  const area = HOUSES[house - 1].area;
  return { title: kind === 'solar' ? l('Yılın ana sahnesi', 'The main stage of the year') : l('Ayın ana sahnesi', 'The main stage of the month'),
    body: { tr: `${kind === 'solar' ? 'Bu yıl' : 'Bu ay'} hayatının merkezinde şunlar olacak: ${area.tr}. Önemli gelişmelerin çoğu bu alandan gelir.`, en: `${kind === 'solar' ? 'This year' : 'This month'} the centre of your life is ${area.en}. Most key developments come from here.` } };
}
