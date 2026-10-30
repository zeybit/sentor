// Sosyal medyada (TikTok, Instagram, X) doğum haritası hakkında sık paylaşılan konular.
// Metinler özgündür; içerik üreticilerinin cümleleri kopyalanmamıştır.
// Her maddede: popüler iddia + astrolojik açıdan dengeli yorum.
import type { BodyId, Chart, AspectType } from '../engine/astro';
import { PLANETS } from '../engine/astro';
import { L, SIGNS, BODIES, HOUSES } from './base';

export type TrendCat = 'love' | 'beauty' | 'career' | 'money' | 'personality' | 'spiritual';

export interface Trend {
  id: string;
  cat: TrendCat;
  tag: L;           // sosyal medyada kullanılan etiket
  claim: L;         // popüler söylem
  reality: L;       // astrolojik bağlamda daha dengeli okuma
  match: (ch: Chart) => boolean;
  needsTime?: boolean;
}

const l = (tr: string, en: string): L => ({ tr, en });
const inH = (ch: Chart, id: BodyId, h: number) => ch.cusps.length > 0 && ch.positions[id].house === h;
const asp = (ch: Chart, a: BodyId, b: BodyId, types?: AspectType[]) =>
  ch.aspects.some(x => ((x.a === a && x.b === b) || (x.a === b && x.b === a)) && (!types || types.includes(x.type)));
const ascSign = (ch: Chart) => (ch.asc === null ? -1 : Math.floor(ch.asc / 30));

export function stelliums(ch: Chart): { kind: 'sign' | 'house'; idx: number; bodies: BodyId[] }[] {
  const out: { kind: 'sign' | 'house'; idx: number; bodies: BodyId[] }[] = [];
  for (let s = 0; s < 12; s++) {
    const b = PLANETS.filter(p => ch.positions[p].sign === s);
    if (b.length >= 3) out.push({ kind: 'sign', idx: s, bodies: b });
  }
  if (ch.cusps.length) for (let h = 1; h <= 12; h++) {
    const b = PLANETS.filter(p => ch.positions[p].house === h);
    if (b.length >= 3) out.push({ kind: 'house', idx: h, bodies: b });
  }
  return out;
}

export const TRENDS: Trend[] = [
  // ---------- GÜZELLİK ----------
  { id: 'venus1', cat: 'beauty', needsTime: true, tag: l('#Venüs1.Ev “güzellik yerleşimi”', '#Venus1stHouse “beauty placement”'),
    claim: l('Venüs 1. evdekiler “doğal güzel” ve herkesin hoşlandığı kişiler olarak paylaşılır.', 'Venus in the 1st is shared as the “naturally pretty, everyone has a crush on them” placement.'),
    reality: l('Geleneksel olarak 1. evdeki Venüs çekicilik, zarafet ve hoş bir ilk izlenimle ilişkilendirilir. Bu, estetik bir duruş ve sosyal sempati anlamına gelir; güzellik ölçüsü değildir.', 'Traditionally Venus in the 1st links to charm, grace and pleasant first impressions — an aesthetic presence and social warmth, not a beauty score.'),
    match: ch => inH(ch, 'venus', 1) },
  { id: 'venusAsc', cat: 'beauty', needsTime: true, tag: l('#VenüsYükselen kavuşumu', '#VenusConjunctAscendant'),
    claim: l('Venüs yükselene kavuşuksa “yüzün en çekici yerleşimi” denir.', 'Venus conjunct the Ascendant is called the most attractive face placement.'),
    reality: l('Venüs’ün yükselene yakınlığı (±8°) kişinin görünümüne Venüs niteliklerini (yumuşaklık, uyum, simetri hissi) kattığı şeklinde yorumlanır.', 'Venus close to the Ascendant (±8°) is read as lending Venusian qualities — softness, harmony, a sense of symmetry — to your appearance.'),
    match: ch => ch.asc !== null && Math.min(Math.abs(ch.positions.venus.lon - ch.asc), 360 - Math.abs(ch.positions.venus.lon - ch.asc)) <= 8 },
  { id: 'neptune1', cat: 'beauty', needsTime: true, tag: l('#Neptün1.Ev “filtreli yüz”', '#Neptune1st “filter face”'),
    claim: l('Neptün 1. evdekiler her fotoğrafta farklı görünür, “filtre yüzü” vardır.', 'Neptune 1st house people look different in every photo — “filter face”.'),
    reality: l('Neptün bulanıklaştıran ve idealize eden gezegendir; 1. evde kişinin değişken, rüya gibi ve yansıtma yüzeyi gibi algılandığı yorumlanır.', 'Neptune blurs and idealises; in the 1st it’s read as a changeable, dreamy, “mirror-like” presence others project onto.'),
    match: ch => inH(ch, 'neptune', 1) },
  { id: 'pluto1', cat: 'beauty', needsTime: true, tag: l('#Plüton1.Ev “korkutucu bakış”', '#Pluto1st “intimidating stare”'),
    claim: l('Plüton 1. evdekilerin insanları korkutan yoğun bir bakışı olduğu söylenir.', 'Pluto 1st house people are said to have an intimidating, intense stare.'),
    reality: l('Plüton yoğunluk ve güç temasıdır; 1. evde kişinin varlığının derin ve etkileyici algılandığı, ilk tanışmada mesafeli göründüğü yorumlanır.', 'Pluto is intensity and power; in the 1st your presence reads as deep and compelling, often reserved on first meeting.'),
    match: ch => inH(ch, 'pluto', 1) },
  { id: 'scorpioRising', cat: 'beauty', needsTime: true, tag: l('#AkrepYükselen bakışları', '#ScorpioRising eyes'),
    claim: l('Akrep yükselenlerin “ruhuna bakan” gözleri olduğu sık paylaşılır.', 'Scorpio risings are often said to have “soul-piercing” eyes.'),
    reality: l('Akrep yükselen, gizemli ve yoğun bir ilk izlenimle ilişkilendirilir; bakışlar bu enerjinin en çok konuşulan ifadesidir.', 'Scorpio rising links to a mysterious, intense first impression; the gaze is its most-discussed expression.'),
    match: ch => ascSign(ch) === 7 },
  { id: 'saturn1', cat: 'beauty', needsTime: true, tag: l('#Satürn1.Ev “yaşla güzelleşenler”', '#Saturn1st “ages like wine”'),
    claim: l('Satürn 1. evdekilerin çocukken olgun göründüğü, yaşla daha genç ve çekici hale geldiği söylenir.', 'Saturn 1st house people look mature as kids and “age backwards”.'),
    reality: l('Satürn zamanla olgunlaşmayı temsil eder; 1. evde kişinin özgüveni ve imajının yıllar içinde güçlendiği yorumlanır.', 'Saturn represents growth over time; in the 1st, confidence and image strengthen with the years.'),
    match: ch => inH(ch, 'saturn', 1) },
  { id: 'venusTaurusLibra', cat: 'beauty', tag: l('#VenüsKendiEvinde', '#VenusInDomicile'),
    claim: l('Venüs Boğa veya Terazi’deyse kişinin zevkinin ve çekiciliğinin çok güçlü olduğu söylenir.', 'Venus in Taurus or Libra is said to give exceptional taste and charm.'),
    reality: l('Venüs bu burçların yöneticisidir (kendi evinde); geleneksel astrolojide en rahat ifade ettiği konum kabul edilir — estetik ve ilişki becerileri doğal akar.', 'Venus rules these signs (domicile); traditionally its most comfortable expression — aesthetics and relating come naturally.'),
    match: ch => [1, 6].includes(ch.positions.venus.sign) },
  { id: 'venusPisces', cat: 'love', tag: l('#VenüsBalık ruh eşi aşkı', '#VenusPisces soulmate love'),
    claim: l('Venüs Balık “en romantik Venüs” olarak paylaşılır.', 'Venus in Pisces is shared as “the most romantic Venus”.'),
    reality: l('Venüs Balık’ta yücelimdedir; koşulsuz ve şefkatli sevgiyle ilişkilendirilir. Gölge tarafı sınır koymakta zorlanmaktır.', 'Venus is exalted in Pisces — unconditional, compassionate love. The shadow is weak boundaries.'),
    match: ch => ch.positions.venus.sign === 11 },

  // ---------- AŞK ----------
  { id: 'empty7', cat: 'love', needsTime: true, tag: l('#Boş7.Ev “evlenemeyecek miyim?”', '#Empty7thHouse “will I never marry?”'),
    claim: l('7. evi boş olanların evlenmeyeceği ya da ilişkilerinin önemsiz olduğu iddiası çok yayılır.', 'A viral claim says an empty 7th house means no marriage or unimportant relationships.'),
    reality: l('Bu bir efsanedir. Boş ev sadece o anda gezegen olmadığını gösterir; 7. evin burcu ve yöneticisinin konumu ilişkileri anlatmaya devam eder. Ayrıca transitler her eve zamanla girer.', 'This is a myth. An empty house just has no natal planets; its sign and ruler still describe relationships, and transits move through every house over time.'),
    match: ch => ch.cusps.length > 0 && PLANETS.every(p => ch.positions[p].house !== 7) },
  { id: 'jupiter7', cat: 'love', needsTime: true, tag: l('#Jüpiter7.Ev “zengin/şanslı eş”', '#Jupiter7th “lucky spouse”'),
    claim: l('Jüpiter 7. evdekilerin zengin veya çok şanslı bir eşle evleneceği söylenir.', 'Jupiter in the 7th is said to promise a wealthy or lucky spouse.'),
    reality: l('Jüpiter 7. evde ilişkiler yoluyla büyüme ve cömert, bilge partnerlerle ilişkilendirilir. “Zengin eş” garanti değil; ilişkilerin seni büyütmesi esas tema.', 'Jupiter in the 7th links to growth through relationships and generous, wise partners. “Rich spouse” isn’t guaranteed; growth through partnership is the theme.'),
    match: ch => inH(ch, 'jupiter', 7) },
  { id: 'saturn7', cat: 'love', needsTime: true, tag: l('#Satürn7.Ev geç evlilik', '#Saturn7th late marriage'),
    claim: l('Satürn 7. evdekilerin geç evleneceği ya da yaşça büyük biriyle evleneceği paylaşılır.', 'Saturn in the 7th is shared as late marriage or an older partner.'),
    reality: l('Geleneksel yorumda Satürn 7. evde ilişkileri ciddiye almayı, sorumluluğu ve zamanla güçlenen bağları anlatır. Olgun partner teması yaygın ama kesin değildir.', 'Traditionally it means taking relationships seriously and bonds that strengthen over time. An older/mature partner is common but not certain.'),
    match: ch => inH(ch, 'saturn', 7) },
  { id: 'venusMarsConj', cat: 'love', tag: l('#VenüsMarsKavuşumu “manyetik çekim”', '#VenusConjunctMars “magnetic”'),
    claim: l('Haritasında Venüs-Mars kavuşumu olanların karşı konulmaz bir çekiciliği olduğu söylenir.', 'Venus conjunct Mars is said to make someone irresistibly magnetic.'),
    reality: l('Sevgi (Venüs) ve arzu (Mars) birleşir; romantik ve yaratıcı enerjinin güçlü, tutku ile sevginin iç içe olduğu yorumlanır.', 'Love (Venus) and desire (Mars) merge — a strong romantic and creative charge where passion and affection intertwine.'),
    match: ch => asp(ch, 'venus', 'mars', ['conjunction']) },
  { id: 'moon8', cat: 'love', needsTime: true, tag: l('#Ay8.Ev “yoğun duygular”', '#Moon8th “intense feelings”'),
    claim: l('Ay 8. evdekilerin duygusal olarak “çok yoğun” ve kıskanç olduğu paylaşılır.', 'Moon in the 8th is shared as “too intense” and jealous emotionally.'),
    reality: l('8. ev derinlik ve dönüşüm alanıdır; Ay burada duygusal derinlik ve yüzeysellikten hoşlanmama olarak okunur. Kıskançlık bir etiket değil, güven ihtiyacının ifadesidir.', 'The 8th is depth and transformation; the Moon here reads as emotional depth and dislike of surface bonds. Jealousy isn’t a label — it’s a need for trust.'),
    match: ch => inH(ch, 'moon', 8) },
  { id: 'venus8', cat: 'love', needsTime: true, tag: l('#Venüs8.Ev “ya hep ya hiç”', '#Venus8th “all or nothing”'),
    claim: l('Venüs 8. evdekilerin aşkı “takıntılı” ve dönüştürücü yaşadığı söylenir.', 'Venus in the 8th is said to love obsessively and transformatively.'),
    reality: l('8. evdeki Venüs, derin yakınlık, sadakat ve paylaşılan kaynaklarla ilişkilendirilir. Sağlıklı ifadesi, güvene dayalı çok güçlü bağlardır.', 'Venus in the 8th links to deep intimacy, loyalty and shared resources. Its healthy expression is very strong, trust-based bonds.'),
    match: ch => inH(ch, 'venus', 8) },
  { id: 'lilith7', cat: 'love', needsTime: true, tag: l('#Lilith7.Ev', '#Lilith7thHouse'),
    claim: l('Lilith 7. evdekilerin “toksik” ilişkiler çektiği iddia edilir.', 'Lilith in the 7th is claimed to attract “toxic” partners.'),
    reality: l('Lilith bastırılmış güç temasıdır; 7. evde ilişkilerde eşitlik ve sınır meselelerini işaret eder. Kendi gücünü sahiplenmek, dengesiz ilişkileri tekrarlamamanın anahtarıdır.', 'Lilith is suppressed power; in the 7th it points to equality and boundary themes in relationships. Owning your power is the key to breaking unequal patterns.'),
    match: ch => inH(ch, 'lilith', 7) },
  { id: 'vertex', cat: 'love', needsTime: true, tag: l('#Vertex “kader buluşmaları”', '#Vertex “fated encounters”'),
    claim: l('Vertex noktası, hayatını değiştirecek “kaderinde olan” kişilerle tanışmayı gösterir diye paylaşılır.', 'The Vertex is shared as the point of “destined” life-changing meetings.'),
    reality: l('Vertex modern bir hesap noktasıdır; transitler veya partner gezegenleri bu noktayı tetiklediğinde önemli karşılaşmalar yorumlanır. Senin Vertex’in yukarıda — bu burç temaları kader buluşmalarına renk verir.', 'The Vertex is a modern calculated point; meaningful encounters are read when transits or a partner’s planets touch it. Yours is shown above — its sign colours those meetings.'),
    match: ch => ch.vertex !== null },
  { id: 'node7', cat: 'love', needsTime: true, tag: l('#KuzeyDüğüm7.Ev “ruh eşi kaderi”', '#NorthNode7th “soulmate destiny”'),
    claim: l('Kuzey Düğüm 7. evde ise “kaderin ruh eşinle tanışmak” denir.', 'North Node in the 7th is called “destined to meet your soulmate”.'),
    reality: l('Düğüm eksenine göre bu hayattaki büyüme alanın ortaklık ve iş birliği; bağımsızlığı (Güney Düğüm 1. ev) dengelemeyi öğrenmek.', 'By the nodal axis, your growth lies in partnership and collaboration — balancing independence (South Node in 1st).'),
    match: ch => inH(ch, 'node', 7) },

  // ---------- KARİYER / PARA ----------
  { id: 'sun10', cat: 'career', needsTime: true, tag: l('#Güneş10.Ev “ünlü olacak”', '#Sun10th “destined for fame”'),
    claim: l('Güneş 10. evdekilerin ünlü ya da çok başarılı olacağı paylaşılır.', 'Sun in the 10th is shared as “will be famous”.'),
    reality: l('Güneş 10. evde kariyer ve görünürlüğün kimliğin merkezinde olduğunu gösterir. Tanınma isteği ve liderlik potansiyeli güçlüdür; şöhret ise emek ve koşullara bağlıdır.', 'The Sun in the 10th puts career and visibility at the heart of identity — strong drive for recognition and leadership; fame itself depends on effort and circumstance.'),
    match: ch => inH(ch, 'sun', 10) },
  { id: 'jupiter10', cat: 'career', needsTime: true, tag: l('#Jüpiter10.Ev kariyer şansı', '#Jupiter10th career luck'),
    claim: l('Jüpiter 10. evde “kariyer piyangosu” olarak bilinir.', 'Jupiter in the 10th is known as the “career jackpot”.'),
    reality: l('Geleneksel olarak kariyer, itibar ve büyüme için en destekleyici yerleşimlerden biridir; fırsatlar genellikle toplumsal rolün üzerinden gelir.', 'Traditionally one of the most supportive placements for career and reputation; opportunities often arrive through your public role.'),
    match: ch => inH(ch, 'jupiter', 10) },
  { id: 'venus10', cat: 'career', needsTime: true, tag: l('#Venüs10.Ev “güzelliğiyle tanınan”', '#Venus10th “known for beauty”'),
    claim: l('Venüs 10. evdekilerin görünümleri veya tarzlarıyla tanındığı söylenir.', 'Venus in the 10th is said to be known for looks or style.'),
    reality: l('Kamu imajının sevimli ve estetik algılandığı; sanat, moda, güzellik veya diplomasi kariyerleriyle ilişkilendirilir.', 'Your public image reads as likeable and aesthetic; linked to careers in art, fashion, beauty or diplomacy.'),
    match: ch => inH(ch, 'venus', 10) },
  { id: 'mc11', cat: 'career', needsTime: true, tag: l('#11.EvGezegenleri “influencer yerleşimi”', '#11thHouse “influencer placement”'),
    claim: l('11. evde çok gezegen veya Güneş/Venüs varsa “sosyal medya fenomeni olacak” denir.', 'Planets (esp. Sun/Venus) in the 11th are called the “influencer placement”.'),
    reality: l('11. ev topluluklar, takipçiler ve ağlarla ilgilidir; burada kişisel gezegenler grup içinde görünürlüğü ve ağ kurma yeteneğini güçlendirir.', 'The 11th rules communities, followers and networks; personal planets here strengthen visibility in groups and networking skill.'),
    match: ch => (['sun', 'venus', 'moon', 'mercury'] as BodyId[]).some(p => inH(ch, p, 11)) },
  { id: 'jupiter2', cat: 'money', needsTime: true, tag: l('#Jüpiter2.Ev para mıknatısı', '#Jupiter2nd money magnet'),
    claim: l('Jüpiter 2. evde “para mıknatısı” olarak paylaşılır.', 'Jupiter in the 2nd is shared as a “money magnet”.'),
    reality: l('Kazanç ve kaynaklarda bolluk potansiyeli olarak yorumlanır; Jüpiter’in gölgesi aşırı harcamadır, bütçe disiplini bu potansiyeli kalıcı kılar.', 'Read as abundance potential in income; Jupiter’s shadow is overspending — budgeting makes it last.'),
    match: ch => inH(ch, 'jupiter', 2) },
  { id: 'pof', cat: 'money', needsTime: true, tag: l('#ŞansNoktası (Part of Fortune)', '#PartOfFortune'),
    claim: l('Şans Noktası’nın bulunduğu ev “hayatta en şanslı olduğun alan” diye paylaşılır.', 'The Part of Fortune house is shared as “where you’re luckiest”.'),
    reality: l('Helenistik astrolojide bedensel ve maddi iyiliğin noktasıdır; bulunduğu ev ve burç doğal bolluğun nereden aktığına dair ipucu verir.', 'In Hellenistic astrology it’s the lot of bodily and material wellbeing; its house and sign hint at where abundance flows naturally.'),
    match: ch => !!ch.positions.fortune },

  // ---------- KİŞİLİK ----------
  { id: 'stellium', cat: 'personality', tag: l('#Stellium (3+ gezegen)', '#Stellium (3+ planets)'),
    claim: l('Bir burç veya evde 3+ gezegen varsa o burcun “aşırı” özelliklerini taşıdığın söylenir.', 'Three or more planets in one sign/house is said to make you “extra” that sign.'),
    reality: l('Stellium gerçekten de enerjinin bir alanda yoğunlaştığını gösterir; o burç/ev teması hayatında güneş burcundan bile baskın olabilir.', 'A stellium does concentrate energy in one area; that sign/house theme can outweigh even your Sun sign.'),
    match: ch => stelliums(ch).length > 0 },
  { id: 'sun12', cat: 'spiritual', needsTime: true, tag: l('#Güneş12.Ev “gizli ruh”', '#Sun12th “hidden soul”'),
    claim: l('Güneş 12. evdekilerin kendilerini gizlediği, çok sezgisel olduğu paylaşılır.', 'Sun in the 12th people are shared as hidden and highly intuitive.'),
    reality: l('12. ev bilinçaltı ve maneviyattır; Güneş burada iç dünyanın zengin olduğunu, yalnız zamanın ve yaratıcı/ruhsal çalışmaların kimliği beslediğini anlatır.', 'The 12th is the subconscious and spiritual; the Sun here means a rich inner world nourished by solitude and creative/spiritual work.'),
    match: ch => inH(ch, 'sun', 12) },
  { id: 'moon12', cat: 'spiritual', needsTime: true, tag: l('#Ay12.Ev empatik sünger', '#Moon12th empath'),
    claim: l('Ay 12. evdekilerin “empatik sünger” olduğu söylenir.', 'Moon in the 12th is called an “empath sponge”.'),
    reality: l('Duygusal hassasiyet ve sezgi güçlüdür; duygularını tanımak ve enerjetik sınır koymak önemli.', 'Strong sensitivity and intuition; naming feelings and setting energetic boundaries is key.'),
    match: ch => inH(ch, 'moon', 12) },
  { id: 'mercuryRetro', cat: 'personality', tag: l('#NatalMerkürRetro', '#NatalMercuryRetrograde'),
    claim: l('Doğum haritasında Merkür retro olanların “farklı düşündüğü” paylaşılır.', 'Natal Mercury retrograde people are said to “think differently”.'),
    reality: l('Doğumda retro Merkür içe dönük, derinlemesine ve tekrar düşünerek işleyen bir zihinle ilişkilendirilir; yazma ve araştırma güçlüdür.', 'Natal Mercury retrograde links to an introspective mind that processes deeply and revisits ideas; strong in writing and research.'),
    match: ch => ch.positions.mercury.retro },
  { id: 'venusRetro', cat: 'love', tag: l('#NatalVenüsRetro', '#NatalVenusRetrograde'),
    claim: l('Natal Venüs retro olanların aşkta “eski sevgililere döndüğü” söylenir.', 'Natal Venus retrograde people are said to “go back to exes”.'),
    reality: l('Retro Venüs, sevgi ve değer kavramını kişisel olarak yeniden tanımlamakla ilişkilendirilir; tarz ve ilişkilerde kendine özgü, vintage ruhlu bir yaklaşım.', 'Retrograde Venus links to redefining love and value personally — an individual, often vintage-spirited approach to style and relationships.'),
    match: ch => ch.positions.venus.retro },
  { id: 'big3same', cat: 'personality', needsTime: true, tag: l('#ÜçlüAynıElement', '#Big3SameElement'),
    claim: l('Güneş, Ay ve Yükselen aynı elementteyse o elementin “saf hâli” olduğun paylaşılır.', 'Sun, Moon and Rising in one element is shared as being “pure” that element.'),
    reality: l('Üçlü aynı elementte olduğunda kişiliğin tutarlı ve belirgin olur; eksik elementleri bilinçli geliştirmek dengeyi sağlar.', 'When the Big Three share an element, personality is consistent and clear; consciously developing missing elements brings balance.'),
    match: ch => ch.asc !== null && ch.positions.sun.sign % 4 === ch.positions.moon.sign % 4 && ch.positions.sun.sign % 4 === Math.floor(ch.asc / 30) % 4 },
  { id: 'mars1', cat: 'personality', needsTime: true, tag: l('#Mars1.Ev “öfkeli görünen”', '#Mars1st “looks angry”'),
    claim: l('Mars 1. evdekilerin “dinlenirken bile kızgın görünen yüzü” olduğu paylaşılır.', 'Mars in the 1st is said to give “resting angry face”.'),
    reality: l('Mars 1. evde enerjik, doğrudan ve rekabetçi bir duruş olarak okunur; fiziksel aktivite bu enerjiyi en iyi yönlendirme yolu.', 'Mars in the 1st reads as an energetic, direct, competitive presence; physical activity channels it best.'),
    match: ch => inH(ch, 'mars', 1) },
  { id: 'uranus1', cat: 'personality', needsTime: true, tag: l('#Uranüs1.Ev “uzaylı enerjisi”', '#Uranus1st “alien vibes”'),
    claim: l('Uranüs 1. evdekilerin “başka gezegenden gelmiş gibi” olduğu söylenir.', 'Uranus in the 1st is said to have “alien vibes”.'),
    reality: l('Özgünlük, sıra dışılık ve bağımsızlık kimliğin ön planında; kalıplara uymama ihtiyacı belirgin.', 'Originality and independence are front and centre; a strong need not to fit moulds.'),
    match: ch => inH(ch, 'uranus', 1) },
  { id: 'chartRulerAsp', cat: 'personality', needsTime: true, tag: l('#HaritaYöneticisi', '#ChartRuler'),
    claim: l('“Harita yöneticin” hayatının ana kahramanıdır diye paylaşılır.', 'Your “chart ruler” is shared as the main character of your life.'),
    reality: l('Yükselen burcun yöneticisi gezegen geleneksel olarak haritanın yöneticisidir; bulunduğu ev, hayatında en çok enerji harcadığın alanı gösterir.', 'The ruler of your Rising sign is traditionally the chart ruler; its house shows where you pour the most life energy.'),
    match: ch => ch.asc !== null },
];

export function stelliumDetail(ch: Chart): L[] {
  return stelliums(ch).map(s => {
    const names = s.bodies.map(b => BODIES[b].name);
    const where = s.kind === 'sign'
      ? { tr: `${SIGNS[s.idx].tr} burcunda`, en: `in ${SIGNS[s.idx].en}` }
      : { tr: `${HOUSES[s.idx - 1].name.tr} içinde`, en: `in the ${HOUSES[s.idx - 1].name.en}` };
    return { tr: `${where.tr}: ${names.map(n => n.tr).join(', ')}`, en: `${where.en}: ${names.map(n => n.en).join(', ')}` };
  });
}
