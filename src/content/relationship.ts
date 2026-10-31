// İlişki yorumları (kompozit, Davison, sinastri) — Astrology Master tarzı: her başlık için uzun paragraf.
// Tüm metinler özgündür.
import type { AspectType, BodyId } from '../engine/astro';
import { L, SIGNS, DIGNITY, ASPECT_INFO } from './base';

type K = BodyId | 'asc' | 'mc';
const l = (tr: string, en: string): L => ({ tr, en });
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
const capEn = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export interface RelPoint {
  name: L; gen: L;          // "Güneş" / "Güneş'in"
  theme: L;                 // isim öbeği: ilişkinin hangi tarafı
  key: L;                   // kısa anahtar kelime
  gift: L;                  // fiil öbeği (özne: gezegen)
  risk: L;                  // yan cümle
  tip: L;                   // tam cümle
}

export const REL: Record<string, RelPoint> = {
  sun: {
    name: l('Güneş', 'Sun'), gen: l("Güneş'in", "the Sun's"),
    theme: l('kimlik, amaç ve yaşam sevinci', 'identity, purpose and joy of life'), key: l('kimlik', 'identity'),
    gift: l('çiftin birlikte parlamasını ve ortak bir yön bulmasını sağlar', 'helps the couple shine together and find a shared direction'),
    risk: l('egolar karşı karşıya geldiğinde ilişki bir yarışa dönüşebilir', 'when egos collide the relationship can turn into a contest'),
    tip: l('Birbirinizin başarısını kendi başarınız gibi kutlamak bu enerjiyi en verimli şekilde kullanmanızı sağlar.', 'Celebrating each other’s wins as your own lets you use this energy best.'),
  },
  moon: {
    name: l('Ay', 'Moon'), gen: l("Ay'ın", "the Moon's"),
    theme: l('duygusal güven, şefkat ve günlük ritim', 'emotional security, tenderness and daily rhythm'), key: l('duygular', 'feelings'),
    gift: l('birbirinizin yanında kendinizi evinizde hissetmenizi sağlar', 'lets you feel at home in each other’s company'),
    risk: l('ruh hâli dalgalanmaları ve söylenmemiş beklentiler kırgınlıklara yol açabilir', 'mood swings and unspoken expectations can lead to hurt feelings'),
    tip: l('Duygularınızı tahmin ettirmek yerine açıkça söylemek bu bağı her gün yeniden besler.', 'Naming your feelings rather than making each other guess renews this bond daily.'),
  },
  mercury: {
    name: l('Merkür', 'Mercury'), gen: l("Merkür'ün", "Mercury's"),
    theme: l('iletişim, fikirler ve günlük konuşmalar', 'communication, ideas and everyday talk'), key: l('iletişim', 'communication'),
    gift: l('fikir alışverişini, plan yapmayı ve birlikte öğrenmeyi kolaylaştırır', 'eases exchanging ideas, making plans and learning together'),
    risk: l('yanlış anlamalar, ukalalık ya da laf yetiştirme yorucu olabilir', 'misunderstandings, point-scoring or nitpicking can be tiring'),
    tip: l('Önce dinleyip sonra cevap vermek, aranızdaki zihinsel uyumu en güçlü hâline taşır.', 'Listening first and answering second brings your mental rapport to its best.'),
  },
  venus: {
    name: l('Venüs', 'Venus'), gen: l("Venüs'ün", "Venus's"),
    theme: l('sevgi, romantizm, zevkler ve uyum', 'love, romance, tastes and harmony'), key: l('sevgi', 'love'),
    gift: l('ilişkiye sıcaklık, incelik ve birlikte keyif alma becerisi katar', 'adds warmth, grace and the ability to enjoy life together'),
    risk: l('çatışmadan kaçmak için sorunların halının altına süpürülmesi mümkündür', 'problems may get swept under the rug to avoid conflict'),
    tip: l('Küçük sürprizler, güzel ortamlar ve birlikte yaratılan ritüeller bu enerjiyi canlı tutar.', 'Small surprises, beautiful settings and shared rituals keep this energy alive.'),
  },
  mars: {
    name: l('Mars', 'Mars'), gen: l("Mars'ın", "Mars's"),
    theme: l('tutku, enerji ve harekete geçme isteği', 'passion, drive and the urge to act'), key: l('tutku', 'passion'),
    gift: l('çifte cesaret, cinsel canlılık ve birlikte iş bitirme gücü verir', 'gives the couple courage, sexual vitality and the power to get things done'),
    risk: l('sabırsızlık, rekabet ve ani öfke patlamaları ilişkiyi yıpratabilir', 'impatience, rivalry and sudden flare-ups can wear the relationship down'),
    tip: l('Bu enerjiyi spor, ortak projeler ya da yeni maceralar gibi aynı yöne bakan uğraşlara akıtmak çatışmayı azaltır.', 'Channelling this energy into sport, joint projects or new adventures that face the same way reduces conflict.'),
  },
  jupiter: {
    name: l('Jüpiter', 'Jupiter'), gen: l("Jüpiter'in", "Jupiter's"),
    theme: l('büyüme, iyimserlik, inançlar ve bolluk', 'growth, optimism, beliefs and abundance'), key: l('büyüme', 'growth'),
    gift: l('birbirinize güven aşılamanızı ve birlikte büyük düşünmenizi sağlar', 'lets you instil confidence in each other and think big together'),
    risk: l('abartılı vaatler, aşırı harcama ya da her şeyi fazla iyimser görmek dengeyi bozabilir', 'grand promises, overspending or excessive optimism can upset the balance'),
    tip: l('Hayallerinizi somut adımlara bölmek bu bereketli enerjinin boşa akmasını önler.', 'Breaking your dreams into concrete steps keeps this generous energy from leaking away.'),
  },
  saturn: {
    name: l('Satürn', 'Saturn'), gen: l("Satürn'ün", "Saturn's"),
    theme: l('bağlılık, sorumluluk ve ilişkinin kalıcılığı', 'commitment, responsibility and the relationship’s staying power'), key: l('bağlılık', 'commitment'),
    gift: l('ilişkiye sağlam bir zemin, sadakat ve zamanla olgunlaşan bir güven kazandırır', 'gives the relationship solid ground, loyalty and trust that matures with time'),
    risk: l('soğukluk, eleştiri ya da yük gibi hissedilen görevler sevgiyi gölgeleyebilir', 'coolness, criticism or duties that feel like burdens can overshadow affection'),
    tip: l('Kuralları birlikte koymak ve emeği karşılıklı takdir etmek, Satürn’ün ağırlığını güvene dönüştürür.', 'Setting the rules together and appreciating each other’s effort turns Saturn’s weight into trust.'),
  },
  uranus: {
    name: l('Uranüs', 'Uranus'), gen: l("Uranüs'ün", "Uranus's"),
    theme: l('özgürlük, yenilik ve beklenmedik değişimler', 'freedom, novelty and unexpected change'), key: l('özgürlük', 'freedom'),
    gift: l('ilişkiyi rutinden kurtarır, sıra dışı deneyimler ve arkadaşça bir rahatlık getirir', 'frees the relationship from routine, bringing unusual experiences and a friendly ease'),
    risk: l('ani kopuşlar, tutarsızlık ya da bağlanma korkusu güveni sarsabilir', 'sudden breaks, inconsistency or fear of commitment can shake trust'),
    tip: l('Birbirinize nefes alacak alan tanımak, Uranüs’ün heyecanını ilişkiyi besleyen bir güce çevirir.', 'Giving each other room to breathe turns Uranus’s excitement into a force that feeds the bond.'),
  },
  neptune: {
    name: l('Neptün', 'Neptune'), gen: l("Neptün'ün", "Neptune's"),
    theme: l('hayaller, ruhsal bağ, şefkat ve idealler', 'dreams, spiritual connection, compassion and ideals'), key: l('hayaller', 'dreams'),
    gift: l('ilişkiye büyülü, sezgisel ve koşulsuz sevgiye yakın bir hava katar', 'brings a magical, intuitive atmosphere close to unconditional love'),
    risk: l('gerçekleri görmezden gelmek, belirsizlik ya da hayal kırıklıkları yaşanabilir', 'ignoring realities, vagueness or disappointment may occur'),
    tip: l('Romantizmi korurken beklentileri açıkça konuşmak, Neptün’ün sisini dağıtır.', 'Keeping the romance while discussing expectations openly clears Neptune’s fog.'),
  },
  pluto: {
    name: l('Plüton', 'Pluto'), gen: l("Plüton'un", "Pluto's"),
    theme: l('derin bağ, dönüşüm ve güç dengesi', 'deep bonding, transformation and the balance of power'), key: l('dönüşüm', 'transformation'),
    gift: l('çifti derinden dönüştüren, sıradanlığa izin vermeyen yoğun bir bağ kurar', 'creates an intense bond that transforms the couple and allows nothing ordinary'),
    risk: l('kıskançlık, kontrol isteği ya da güç mücadelesi yüzeye çıkabilir', 'jealousy, the urge to control or power struggles can surface'),
    tip: l('Güveni kontrol yerine şeffaflıkla kurmak, bu yoğunluğu iyileştirici bir güce dönüştürür.', 'Building trust through openness rather than control turns this intensity into a healing force.'),
  },
  node: {
    name: l('Kuzey Ay Düğümü', 'North Node'), gen: l("Kuzey Ay Düğümü'nün", "the North Node's"),
    theme: l('ilişkinin gelişim yönü ve kadersel amacı', 'the relationship’s path of growth and sense of destiny'), key: l('kader yolu', 'destiny path'),
    gift: l('birlikteliğe “bir sebeple tanıştık” hissi ve ortak bir gelişim hedefi verir', 'gives the union a “we met for a reason” feeling and a shared goal of growth'),
    risk: l('alışılmış konfora sığınmak ilişkinin gelişimini yavaşlatabilir', 'retreating into familiar comfort can slow the relationship’s growth'),
    tip: l('Birlikte yeni şeyler denemek ilişkinin asıl potansiyelini açığa çıkarır.', 'Trying new things together unlocks the relationship’s real potential.'),
  },
  chiron: {
    name: l('Chiron', 'Chiron'), gen: l("Chiron'un", "Chiron's"),
    theme: l('yaralar, hassasiyetler ve birlikte iyileşme', 'wounds, sensitivities and healing together'), key: l('şifa', 'healing'),
    gift: l('eski yaraların güvenli bir alanda konuşulmasına ve iyileşmesine imkân tanır', 'allows old wounds to be voiced and healed in a safe space'),
    risk: l('hassas noktalara farkında olmadan dokunmak kırgınlık yaratabilir', 'touching sore spots unknowingly can cause hurt'),
    tip: l('Birbirinizin kırılgan yanlarına şefkatle yaklaşmak, bu yerleşimi ilişkinin en iyileştirici tarafı yapar.', 'Approaching each other’s fragile sides with compassion makes this the most healing part of the bond.'),
  },
  juno: {
    name: l('Juno', 'Juno'), gen: l("Juno'nun", "Juno's"),
    theme: l('evlilik, bağlılık sözü ve ortaklık beklentileri', 'marriage, the promise of commitment and partnership expectations'), key: l('bağlılık sözü', 'commitment'),
    gift: l('ilişkinin ciddiye alınmasını ve karşılıklı sadakatin güçlenmesini sağlar', 'helps the relationship be taken seriously and strengthens mutual loyalty'),
    risk: l('karşılanmayan beklentiler kıskançlık veya küskünlük doğurabilir', 'unmet expectations can breed jealousy or resentment'),
    tip: l('Ortaklıktan ne beklediğinizi açıkça konuşmak Juno’nun sözünü sağlamlaştırır.', 'Spelling out what you expect from the partnership strengthens Juno’s vow.'),
  },
  ceres: {
    name: l('Ceres', 'Ceres'), gen: l("Ceres'in", "Ceres's"),
    theme: l('bakım verme, beslenme ve şefkatli ilgi', 'caregiving, nourishment and attentive tenderness'), key: l('bakım', 'care'),
    gift: l('birbirinizi besleyen, kollayan ve ilgiyle saran bir ortam yaratır', 'creates a climate where you nourish, protect and look after each other'),
    risk: l('aşırı korumacılık ya da ilgi dengesizliği yük hissi yaratabilir', 'over-protectiveness or uneven care can feel like a burden'),
    tip: l('Bakımın iki yönlü akmasına özen göstermek bu bağı dengeli tutar.', 'Making sure care flows both ways keeps the bond balanced.'),
  },
  pallas: {
    name: l('Pallas', 'Pallas'), gen: l("Pallas'ın", "Pallas's"),
    theme: l('strateji, akıl birliği ve sorun çözme', 'strategy, meeting of minds and problem-solving'), key: l('strateji', 'strategy'),
    gift: l('birlikte plan yapma ve zorlukları zekâyla aşma becerisi verir', 'gives a talent for planning together and overcoming problems cleverly'),
    risk: l('ilişki fazla akılcı yaşanırsa duygular arka planda kalabilir', 'if the relationship is lived too rationally, feelings may fall behind'),
    tip: l('Zihinsel ortaklığa küçük duygusal dokunuşlar eklemek dengeyi korur.', 'Adding small emotional touches to your mental partnership keeps the balance.'),
  },
  vesta: {
    name: l('Vesta', 'Vesta'), gen: l("Vesta'nın", "Vesta's"),
    theme: l('sadakat, odak ve ilişkiye adanmışlık', 'devotion, focus and dedication to the relationship'), key: l('adanmışlık', 'devotion'),
    gift: l('ilişkiye kutsal bir alan gibi özen gösterilmesini sağlar', 'makes you tend the relationship like a sacred space'),
    risk: l('işe ya da göreve fazla odaklanmak yakınlığı azaltabilir', 'over-focusing on work or duty can reduce intimacy'),
    tip: l('Birbirinize ayırdığınız özel zamanı korumak Vesta’nın ateşini canlı tutar.', 'Protecting your special time together keeps Vesta’s flame alive.'),
  },
  lilith: {
    name: l('Lilith', 'Lilith'), gen: l("Lilith'in", "Lilith's"),
    theme: l('gölge arzular, tabular ve bastırılmış tepkiler', 'shadow desires, taboos and suppressed reactions'), key: l('gölge arzular', 'shadow desires'),
    gift: l('ilişkinin daha dürüst, çıplak ve sahici yaşanmasını sağlar', 'makes the relationship more honest, raw and authentic'),
    risk: l('tetiklenmeler, güç oyunları ya da ani tepkiler yüzeye çıkabilir', 'triggers, power games or sudden reactions may surface'),
    tip: l('Gölge duyguları yargılamadan konuşabilmek bu yerleşimi özgürleştirici kılar.', 'Being able to talk about shadow feelings without judgement makes this placement liberating.'),
  },
  fortune: {
    name: l('Şans Noktası', 'Part of Fortune'), gen: l("Şans Noktası'nın", "the Part of Fortune's"),
    theme: l('kolay akan mutluluk ve doğal destek', 'easy-flowing happiness and natural support'), key: l('şans', 'fortune'),
    gift: l('ilişkinin keyif ve kolaylık bulduğu alanı gösterir', 'shows where the relationship finds pleasure and ease'),
    risk: l('bu kolaylığı hafife almak fırsatların kaçmasına neden olabilir', 'taking this ease for granted can let chances slip'),
    tip: l('Bu alana bilinçli zaman ayırmak ilişkinin şansını büyütür.', 'Giving this area conscious time grows the relationship’s luck.'),
  },
  asc: {
    name: l('Yükselen', 'Ascendant'), gen: l("Yükselen'in", "the Ascendant's"),
    theme: l('ilişkinin dışarıya yansıyan yüzü ve ilk izlenim', 'the relationship’s public face and first impression'), key: l('ilk izlenim', 'first impression'),
    gift: l('çiftin dış dünyaya karşı nasıl durduğunu belirler', 'shapes how the couple presents itself to the world'),
    risk: l('dışarıya verilen görüntü ile içerideki gerçek farklılaşabilir', 'the image shown outside may differ from the reality inside'),
    tip: l('Görünüşle gerçeği aynı çizgide tutmak ilişkiye güven katar.', 'Keeping image and reality in line adds trust.'),
  },
  mc: {
    name: l('MC', 'MC'), gen: l("MC'nin", "the MC's"),
    theme: l('hedefler, toplumsal görünürlük ve kariyer', 'goals, public visibility and career'), key: l('hedefler', 'goals'),
    gift: l('çiftin birlikte nereye yürüdüğünü ve toplum içindeki yerini gösterir', 'shows where the couple is heading together and its place in society'),
    risk: l('hedef baskısı ilişkinin duygusal tarafını gölgeleyebilir', 'pressure to achieve can overshadow the emotional side'),
    tip: l('Ortak hedefleri düzenli olarak birlikte gözden geçirmek ikinizi aynı yönde tutar.', 'Reviewing your shared goals together regularly keeps you aligned.'),
  },
};
export const relName = (k: K): L => REL[k]?.name ?? l(k, k);

// ---------------- Burçlar: ilişkideki tonu ----------------
const SIGN_REL: { mood: L; detail: L }[] = [
  { mood: l('cesur, hızlı ve doğrudan', 'bold, fast and direct'), detail: l('Koç enerjisi ilişkiye heyecan, spontanlık ve ilk adımı atma cesareti getirir; beklemek yerine harekete geçmeyi sever.', 'Aries energy brings excitement, spontaneity and the courage to make the first move; it prefers action over waiting.') },
  { mood: l('sakin, duyusal ve sadık', 'calm, sensual and loyal'), detail: l('Boğa enerjisi güven, istikrar ve bedensel keyiflerle beslenir; güzel yemekler, dokunuş ve huzurlu bir yuva bu ilişkinin dilidir.', 'Taurus energy thrives on security, stability and bodily pleasures; good food, touch and a peaceful home are this relationship’s language.') },
  { mood: l('meraklı, hareketli ve sohbet dolu', 'curious, lively and full of conversation'), detail: l('İkizler enerjisi zihinsel kıvılcımla canlanır; esprili konuşmalar, kısa geziler ve sürekli yeni bilgiler ilişkiyi taze tutar.', 'Gemini energy comes alive through mental sparks; witty talk, short trips and constant new information keep things fresh.') },
  { mood: l('şefkatli, koruyucu ve yuva odaklı', 'tender, protective and home-centred'), detail: l('Yengeç enerjisi aidiyet ve duygusal güven arar; birlikte bir yuva kurmak, aile bağları ve anılar bu ilişkinin kalbidir.', 'Cancer energy seeks belonging and emotional safety; building a home, family ties and shared memories are its heart.') },
  { mood: l('coşkulu, cömert ve romantik', 'exuberant, generous and romantic'), detail: l('Aslan enerjisi ilişkiye sahne ışığı, büyük jestler ve birbirini gururla sahiplenme getirir; takdir edilmek burada çok önemlidir.', 'Leo energy brings a spotlight, grand gestures and proudly claiming each other; appreciation matters greatly here.') },
  { mood: l('özenli, pratik ve hizmet odaklı', 'attentive, practical and service-minded'), detail: l('Başak enerjisi sevgiyi küçük ama anlamlı yardımlarla gösterir; düzen, sağlıklı rutinler ve birbirini geliştirme isteği öne çıkar.', 'Virgo energy shows love through small but meaningful help; order, healthy routines and wanting to improve each other stand out.') },
  { mood: l('uyumlu, zarif ve ortaklık odaklı', 'harmonious, graceful and partnership-minded'), detail: l('Terazi enerjisi denge, adalet ve estetik arar; birlikte güzel ortamlarda bulunmak ve kararları ortak almak ilişkinin temelidir.', 'Libra energy seeks balance, fairness and beauty; spending time in lovely settings and making decisions together is the foundation.') },
  { mood: l('yoğun, tutkulu ve derin', 'intense, passionate and deep'), detail: l('Akrep enerjisi yüzeysel bağlarla yetinmez; tam bir güven, sırların paylaşılması ve duygusal derinlik ister.', 'Scorpio energy is not content with surface ties; it wants total trust, shared secrets and emotional depth.') },
  { mood: l('maceraperest, özgür ve keşif dolu', 'adventurous, free and exploratory'), detail: l('Yay enerjisi birlikte keşfetmeyi, öğrenmeyi ve ufku genişletmeyi sever; seyahatler, felsefi sohbetler ve ortak bir inanç ilişkiyi besler.', 'Sagittarius energy loves exploring, learning and widening horizons together; travel, philosophical talks and a shared belief nourish the bond.') },
  { mood: l('ciddi, kararlı ve uzun vadeli', 'serious, committed and long-term'), detail: l('Oğlak enerjisi ilişkiyi zamanla inşa edilen bir yapı gibi görür; ortak hedefler, sorumluluk ve sabır bu birlikteliğin taşıyıcı kolonlarıdır.', 'Capricorn energy sees the relationship as a structure built over time; shared goals, responsibility and patience are its pillars.') },
  { mood: l('özgün, arkadaşça ve özgürlükçü', 'original, friendly and freedom-loving'), detail: l('Kova enerjisi ilişkide dostluğu ve bireyselliği ön plana çıkarır; sıra dışı fikirler, ortak arkadaş çevresi ve birbirine alan tanımak önemlidir.', 'Aquarius energy puts friendship and individuality first; unusual ideas, a shared circle of friends and giving each other space matter.') },
  { mood: l('hassas, sezgisel ve romantik', 'sensitive, intuitive and romantic'), detail: l('Balık enerjisi ilişkiyi neredeyse ruhsal bir birlik gibi yaşar; sanat, müzik, empati ve sözsüz anlaşma bu bağın dilidir.', 'Pisces energy lives the relationship almost as a spiritual union; art, music, empathy and unspoken understanding are its language.') },
];

// ---------------- Evler: ilişkideki alanı ----------------
const HOUSE_REL: { meaning: L; activity: L }[] = [
  { meaning: l('1. ev ilişkinin kimliğini ve dışarıdan nasıl göründüğünü anlatır; buradaki gezegen çiftin karakterini belirgin biçimde boyar.', 'The 1st house describes the relationship’s identity and how it looks from outside; a planet here strongly colours the couple’s character.'),
    activity: l('Birlikte görünmek, ortak bir tarz geliştirmek ve “biz” kimliğini sahiplenmek bu yerleşimi güçlendirir.', 'Being seen together, developing a shared style and owning your “we” identity strengthens this placement.') },
  { meaning: l('2. ev ortak değerleri, parayı ve maddi güvenliği temsil eder; ilişkinin neye değer verdiği burada görünür.', 'The 2nd house represents shared values, money and material security; what the relationship values shows here.'),
    activity: l('Ortak bütçe yapmak, birlikte birikim hedefleri koymak ve küçük keyiflere yatırım yapmak bu alanı destekler.', 'Making a joint budget, setting savings goals together and investing in small pleasures supports this area.') },
  { meaning: l('3. ev günlük iletişimi, kısa yolculukları ve çevreyi anlatır; ilişkinin konuşma dili burada şekillenir.', 'The 3rd house covers daily communication, short trips and surroundings; the relationship’s way of talking takes shape here.'),
    activity: l('Hafta sonu kaçamakları, birlikte kitap okumak ya da gün sonu sohbetleri bu bağı canlı tutar.', 'Weekend getaways, reading together or end-of-day chats keep this bond lively.') },
  { meaning: l('4. ev yuvayı, aileyi ve ilişkinin duygusal köklerini temsil eder; çiftin kendini güvende hissettiği alan burasıdır.', 'The 4th house represents home, family and the relationship’s emotional roots; it is where the couple feels safe.'),
    activity: l('Ev düzenlemek, aile sofraları ve birlikte oluşturulan gelenekler bu yerleşimin enerjisini besler.', 'Making a home, family meals and traditions you create together feed this placement.') },
  { meaning: l('5. ev romantizmi, eğlenceyi, yaratıcılığı ve çocukları anlatır; ilişkinin oyuncu ve neşeli yüzü burada görünür.', 'The 5th house speaks of romance, fun, creativity and children; the playful, joyful face of the relationship appears here.'),
    activity: l('Randevu geceleri, hobiler, konserler ve birlikte üretilen yaratıcı işler bu alanı parlatır.', 'Date nights, hobbies, concerts and creative projects made together make this area shine.') },
  { meaning: l('6. ev günlük rutinleri, birlikte çalışmayı ve sağlıklı alışkanlıkları temsil eder; ilişki burada pratik hayatın içinde sınanır.', 'The 6th house represents daily routines, working together and healthy habits; here the relationship is tested in practical life.'),
    activity: l('Ev işlerini adil paylaşmak, birlikte spor yapmak ve ortak rutinler kurmak bu yerleşimi olumlu kullanmanın yoludur.', 'Sharing chores fairly, exercising together and building routines is the way to use this placement well.') },
  { meaning: l('7. ev ortaklığın kendisini, evliliği ve karşılıklı sözleşmeleri anlatır; buradaki gezegen ilişkinin bir “birliktelik” olarak nasıl işlediğini gösterir.', 'The 7th house is partnership itself, marriage and mutual agreements; a planet here shows how the relationship works as a union.'),
    activity: l('Kararları birlikte almak, eşit sorumluluk paylaşmak ve birbirini resmî olarak sahiplenmek bu alanı güçlendirir.', 'Making decisions together, sharing responsibility equally and committing formally strengthens this area.') },
  { meaning: l('8. ev derin bağı, cinselliği, ortak kaynakları ve dönüşümü temsil eder; ilişkinin en mahrem katmanı burada yaşanır.', 'The 8th house represents deep bonding, sexuality, shared resources and transformation; the most intimate layer is lived here.'),
    activity: l('Sırları paylaşmak, ortak finansal kararlar almak ve krizlerden birlikte geçmek bu bağı derinleştirir.', 'Sharing secrets, making joint financial decisions and getting through crises together deepens this bond.') },
  { meaning: l('9. ev ortak inançları, felsefeyi, uzak yolculukları ve öğrenmeyi anlatır; ilişkinin anlam arayışı burada görünür.', 'The 9th house covers shared beliefs, philosophy, long journeys and learning; the relationship’s search for meaning appears here.'),
    activity: l('Uzun seyahatler, birlikte eğitim almak ya da farklı kültürleri keşfetmek bu yerleşimi canlandırır.', 'Long journeys, studying together or exploring other cultures bring this placement alive.') },
  { meaning: l('10. ev çiftin toplumsal imajını, ortak hedefleri ve kariyerini temsil eder; ilişki burada dünyaya ne verdiğiyle tanınır.', 'The 10th house represents the couple’s public image, shared goals and career; here the relationship is known for what it gives the world.'),
    activity: l('Ortak bir iş, birbirinin kariyerini desteklemek ya da birlikte görünür bir hedef koymak bu alanı güçlendirir.', 'A joint venture, supporting each other’s careers or setting a visible shared goal strengthens this area.') },
  { meaning: l('11. ev arkadaşlığı, sosyal çevreyi ve geleceğe dair umutları anlatır; ilişkinin dostluk temeli burada görünür.', 'The 11th house speaks of friendship, social circles and hopes for the future; the relationship’s friendship base appears here.'),
    activity: l('Ortak arkadaş grupları, topluluk etkinlikleri ve birlikte kurulan gelecek hayalleri bu bağı besler.', 'Shared friend groups, community activities and dreams of the future built together nourish this bond.') },
  { meaning: l('12. ev ilişkinin perde arkasını anlatır: sessiz fedakârlıklar, ruhsal paylaşımlar ve dışarıdan pek görünmeyen bağlar burada yaşanır.', 'The 12th house describes what happens behind the curtain: quiet sacrifices, spiritual sharing and bonds hardly visible from outside.'),
    activity: l('Birlikte inzivaya çekilmek, meditasyon, sanat ya da gönüllü işler gibi içe dönük paylaşımlar bu yerleşimi derinleştirir.', 'Retreating together, meditation, art or volunteer work — inward-facing sharing deepens this placement.') },
];

function dignityLine(id: K, sign: number, name: L): L | null {
  const d = DIGNITY[id as BodyId];
  if (!d) return null;
  if (d.domicile.includes(sign) || d.exalt.includes(sign))
    return l(`Bu burç ${name.tr} için güçlü bir konum olduğundan, bu tema ilişkide doğal ve rahat bir şekilde akar.`, `As this sign is a strong position for ${name.en}, the theme flows naturally in the relationship.`);
  if (d.detriment.includes(sign) || d.fall.includes(sign))
    return l(`Bu burç ${name.tr} için zorlayıcı bir konumdur; bu tema ilişkide kendiliğinden değil, bilinçli emekle gelişir.`, `This sign is a challenging position for ${name.en}; the theme grows through conscious effort rather than by itself.`);
  return null;
}

const ORD_EN = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

/** "Güneş Yay Burcunda 12. Evde" */
export function relPlacementTitle(id: K, sign: number, house: number): L {
  const n = relName(id);
  return {
    tr: `${n.tr} ${SIGNS[sign].tr} Burcunda${house ? ` ${house}. Evde` : ''}`,
    en: `${n.en} in ${SIGNS[sign].en}${house ? ` in the ${ORD_EN[house - 1]} House` : ''}`,
  };
}

/** Kompozit/Davison yerleşimi için uzun paragraf */
export function relPlacementText(id: K, sign: number, house: number, kind: 'composite' | 'davison' = 'composite'): L {
  const p = REL[id]; const s = SIGN_REL[sign];
  if (!p) return l('', '');
  const chartTr = kind === 'composite' ? 'kompozit haritada' : 'Davison haritasında';
  const chartEn = kind === 'composite' ? 'in the composite chart' : 'in the Davison chart';
  const where = house ? { tr: ` ve ${house}. evde`, en: ` and in the ${ORD_EN[house - 1]} house` } : { tr: '', en: '' };
  const dig = dignityLine(id, sign, p.name);
  const h = house ? HOUSE_REL[house - 1] : null;
  const tr = [
    `${p.gen.tr} ${chartTr} ${SIGNS[sign].tr} burcunda${where.tr} olması, ilişkinizin ${p.theme.tr} tarafının ${s.mood.tr} bir tonda yaşandığını gösterir.`,
    s.detail.tr,
    dig?.tr,
    h?.meaning.tr,
    `${p.name.tr} bu yerleşimde ${p.gift.tr}.`,
    h?.activity.tr,
    `Öte yandan ${p.risk.tr}.`,
    p.tip.tr,
  ].filter(Boolean).join(' ');
  const en = [
    `${capEn(p.gen.en.replace(/'s$/, ''))} ${chartEn} in ${SIGNS[sign].en}${where.en} shows that the ${p.theme.en} side of your relationship is lived in a ${s.mood.en} tone.`,
    s.detail.en,
    dig?.en,
    h?.meaning.en,
    `In this placement ${p.name.en} ${p.gift.en}.`,
    h?.activity.en,
    `On the other hand, ${p.risk.en}.`,
    p.tip.en,
  ].filter(Boolean).join(' ');
  return { tr, en };
}

/** Kompozit yükselen paragrafı */
export function relAscText(sign: number, kind: 'composite' | 'davison' = 'composite'): L {
  const s = SIGN_REL[sign];
  const nm = kind === 'composite' ? { tr: 'Kompozit', en: 'composite' } : { tr: 'Davison', en: 'Davison' };
  return {
    tr: `Yükselen ${SIGNS[sign].tr} burcunda olan bir ${nm.tr} harita, ilişkinin genel havasını ve dış dünyaya nasıl yansıdığını anlatır. Bu ilişki çevrenize ${s.mood.tr} bir birliktelik olarak görünür. ${s.detail.tr} Yükselen, çiftin bir araya geldiğinde nasıl davrandığını ve ilişkinin “ilk izlenimini” belirler; bu yüzden bu burcun nitelikleri birlikteyken kendiliğinden ortaya çıkar. Bu enerjiyi bilinçli olarak sahiplenmek, ilişkinin kendi karakterini bulmasına ve dışarıya güvenli bir duruş sergilemesine yardım eder.`,
    en: `A ${nm.en} chart with the Ascendant in ${SIGNS[sign].en} describes the general atmosphere of the relationship and how it appears to the world. Others see this as a ${s.mood.en} union. ${s.detail.en} The Ascendant sets how the couple behaves when together and the relationship’s “first impression”, so these qualities emerge naturally when you are side by side. Consciously owning this energy helps the relationship find its own character and present a confident face to the world.`,
  };
}

// ---------------- Açılar ----------------
type Nat = 'harmonious' | 'challenging' | 'fusion' | 'adjust';
const nat = (t: AspectType): Nat => ASPECT_INFO[t].nature as Nat;
const HARD = new Set(['saturn', 'mars', 'pluto', 'uranus', 'neptune', 'lilith', 'chiron']);

const LINK: Record<AspectType, L> = {
  conjunction: l('iç içe geçirir ve tek bir güç gibi çalıştırır', 'fuses into a single force'),
  trine: l('doğal ve zahmetsiz bir akışla buluşturur', 'brings together in a natural, effortless flow'),
  sextile: l('destekleyici ve fırsat yaratan bir şekilde buluşturur', 'brings together in a supportive, opportunity-making way'),
  square: l('sürtüşmeyle karşı karşıya getirir ama aynı zamanda harekete geçirir', 'sets against each other with friction, yet also spurs action'),
  opposition: l('karşılıklı bir çekim ve denge arayışı içinde karşı karşıya getirir', 'faces each other in mutual attraction and a search for balance'),
  quincunx: l('farklı dillerden konuşan iki enerji gibi uyum sağlamaya zorlar', 'forces to adjust like two energies speaking different languages'),
} as any;

const TYPE_LINES: Record<Nat, L[]> = {
  fusion: [
    l('Kavuşumda iki gezegen birbirinden ayrı düşünülemez; bu temanın ilişkinin merkezinde durduğunu söyleyebiliriz.', 'In a conjunction the two planets cannot be separated; this theme sits at the centre of the relationship.'),
    l('Bu birleşim ilişkiye yoğunluk katar ve bu alanda yaşananlar ikinizi de aynı anda etkiler.', 'This merger adds intensity, and what happens here affects you both at once.'),
  ],
  harmonious: [
    l('Bu açı, çabalamadan işleyen bir anlayış sunar; birlikteyken bu alanda kendinizi rahat ve desteklenmiş hissedersiniz.', 'This aspect offers understanding that works without effort; together you feel at ease and supported in this area.'),
    l('Uyumlu açılar ilişkinin “kolay” taraflarıdır; burada küçük bir ilgi bile büyük karşılık bulur.', 'Harmonious aspects are the “easy” sides of a relationship; here even small attention brings a big return.'),
  ],
  challenging: [
    l('Zorlayıcı açılar ilişkiyi bitirmez; tersine, doğru yönetildiğinde en çok büyüten temaslar bunlardır.', 'Challenging aspects do not end a relationship; handled well, they are the contacts that make it grow most.'),
    l('Bu gerilim çekimi canlı tutar ama aynı zamanda sabır, açık iletişim ve uzlaşma ister.', 'This tension keeps the attraction alive but also asks for patience, open talk and compromise.'),
  ],
  adjust: [
    l('Bu açı sürekli küçük ayarlamalar gerektirir; birbirinizin farklı ihtiyaçlarını fark etmek anahtardır.', 'This aspect requires constant small adjustments; noticing each other’s different needs is key.'),
  ],
};
const CLOSE: Record<Nat, L> = {
  fusion: l('Bu enerjiyi birlikte ve bilinçli kullandığınızda ilişkinin en güçlü taraflarından biri hâline gelir.', 'Used together and consciously, this energy becomes one of the relationship’s greatest strengths.'),
  harmonious: l('Bu açı ilişkinin uzun vadede güvenebileceği sağlam bir kaynak sunar.', 'This aspect offers a solid resource the relationship can rely on in the long run.'),
  challenging: l('Farkındalıkla yaklaşıldığında bu açı, birbirinizi daha iyi tanımanızı ve birlikte olgunlaşmanızı sağlar.', 'Approached with awareness, this aspect helps you know each other better and mature together.'),
  adjust: l('Esneklik ve merak bu açıyı zenginleştirici bir deneyime dönüştürür.', 'Flexibility and curiosity turn this aspect into an enriching experience.'),
};

const aspNm = (t: AspectType): L => ({ tr: ASPECT_INFO[t].name.tr.replace(/\s*\(.*\)/, '').toLocaleLowerCase('tr'), en: ASPECT_INFO[t].name.en.replace(/\s*\(.*\)/, '').toLowerCase() });
const hashPick = <T,>(arr: T[], a: string, b: string) => arr[(a.length * 7 + b.length * 3 + a.charCodeAt(0) + b.charCodeAt(0)) % arr.length];

/** "Güneş Üçgen Ay" */
export function relAspectTitle(a: K, b: K, type: AspectType): L {
  return { tr: `${relName(a).tr} ${ASPECT_INFO[type].name.tr} ${relName(b).tr}`, en: `${relName(a).en} ${ASPECT_INFO[type].name.en} ${relName(b).en}` };
}

function middle(a: K, b: K, n: Nat): L {
  const A = REL[a], B = REL[b];
  if (n === 'harmonious') return l(`Bu temasta ${A.name.tr} ${A.gift.tr}, ${B.name.tr} ise ${B.gift.tr}.`, `In this contact ${A.name.en} ${A.gift.en}, while ${B.name.en} ${B.gift.en}.`);
  if (n === 'challenging' || n === 'adjust') return l(`Dikkat edilmesi gereken nokta şu: ${A.risk.tr}; ayrıca ${B.risk.tr}.`, `The point to watch: ${A.risk.en}; also, ${B.risk.en}.`);
  const hard = HARD.has(a) || HARD.has(b);
  const heavy = HARD.has(a) ? A : B;
  return l(`Bu birleşimde ${A.name.tr} ${A.gift.tr}, ${B.name.tr} ise ${B.gift.tr}.${hard ? ` Ancak ${heavy.risk.tr}.` : ''}`, `In this merger ${A.name.en} ${A.gift.en}, while ${B.name.en} ${B.gift.en}.${hard ? ` However, ${heavy.risk.en}.` : ''}`);
}

/** Kompozit/Davison açı paragrafı */
export function relAspectText(a: K, b: K, type: AspectType, pair?: L | null): L {
  const A = REL[a], B = REL[b];
  if (!A || !B) return ASPECT_INFO[type].desc;
  const n = nat(type);
  const asp = ASPECT_INFO[type].name;
  const first = l(
    `${A.name.tr} ile ${B.name.tr} arasındaki ${aspNm(type).tr} açı, ilişkinizde ${A.theme.tr} ile ${B.theme.tr} temalarını ${LINK[type].tr}.`,
    `The ${aspNm(type).en} between ${A.name.en} and ${B.name.en} ${LINK[type].en} the themes of ${A.theme.en} and ${B.theme.en} in your relationship.`,
  );
  const typeLine = hashPick(TYPE_LINES[n], a, b);
  const m = middle(a, b, n);
  const tipOwner = HARD.has(a) ? A : HARD.has(b) ? B : A;
  return {
    tr: [first.tr, typeLine.tr, pair?.tr, m.tr, tipOwner.tip.tr, CLOSE[n].tr].filter(Boolean).join(' '),
    en: [first.en, typeLine.en, pair?.en, m.en, tipOwner.tip.en, CLOSE[n].en].filter(Boolean).join(' '),
  };
}

// ---------------- Sinastri ----------------
/** Türkçe tamlayan eki: Ali → Ali'nin, Zeyn → Zeyn'in */
export function genitiveTr(name: string): string {
  const n = name.trim();
  if (!n) return 'onun';
  const vowels = n.toLocaleLowerCase('tr').match(/[aeıioöuü]/g);
  const last = vowels ? vowels[vowels.length - 1] : 'e';
  const v = { a: 'ı', ı: 'ı', e: 'i', i: 'i', o: 'u', u: 'u', ö: 'ü', ü: 'ü' }[last as 'a'] ?? 'i';
  const endsVowel = /[aeıioöuü]$/i.test(n);
  return `${n}'${endsVowel ? 'n' : ''}${v}n`;
}
export const genitiveEn = (name: string) => (name.trim() ? `${name.trim()}’s` : 'their');

/** Başlık: "Senin Güneş Üçgen Ali'nin Ay" — me = iç (sen), them = dış (partner) */
export function synTitle(mine: K, theirs: K, type: AspectType, them: string): L {
  return {
    tr: `Senin ${relName(mine).tr} ${ASPECT_INFO[type].name.tr} ${genitiveTr(them)} ${relName(theirs).tr}`,
    en: `Your ${relName(mine).en} ${ASPECT_INFO[type].name.en} ${genitiveEn(them)} ${relName(theirs).en}`,
  };
}

/** Sinastri açı paragrafı */
export function synLongText(mine: K, theirs: K, type: AspectType, them: string, pair?: L | null): L {
  const A = REL[mine], B = REL[theirs];
  if (!A || !B) return ASPECT_INFO[type].desc;
  const n = nat(type);
  const asp = ASPECT_INFO[type].name;
  const g = genitiveTr(them), ge = genitiveEn(them);
  const first = l(
    `Bu ${aspNm(type).tr} açı, senin ${A.theme.tr} tarafınla ${g} ${B.theme.tr} tarafını ${LINK[type].tr}.`,
    `This ${aspNm(type).en} ${LINK[type].en} your ${A.theme.en} and ${ge} ${B.theme.en}.`,
  );
  const typeLine = hashPick(TYPE_LINES[n], mine, theirs);
  let m: L;
  if (n === 'harmonious') m = l(`Senin ${A.name.tr} enerjin ${A.gift.tr}; onun ${B.name.tr} enerjisi ise ${B.gift.tr}.`, `Your ${A.name.en} ${A.gift.en}; their ${B.name.en} ${B.gift.en}.`);
  else if (n === 'fusion') m = l(`Bu kavuşumda senin ${A.key.tr} temanla onun ${B.key.tr} teması aynı noktada buluşur; birbirinizi bu alanda çok güçlü hissedersiniz.${HARD.has(mine) || HARD.has(theirs) ? ` Yine de ${(HARD.has(mine) ? A : B).risk.tr}.` : ''}`, `In this conjunction your ${A.key.en} and their ${B.key.en} meet at the same point; you feel each other very strongly here.${HARD.has(mine) || HARD.has(theirs) ? ` Still, ${(HARD.has(mine) ? A : B).risk.en}.` : ''}`);
  else m = l(`Senin tarafında ${A.risk.tr}; onun tarafında ise ${B.risk.tr}.`, `On your side, ${A.risk.en}; on their side, ${B.risk.en}.`);
  const tipOwner = HARD.has(theirs) ? B : HARD.has(mine) ? A : A;
  return {
    tr: [first.tr, pair?.tr, typeLine.tr, m.tr, tipOwner.tip.tr, CLOSE[n].tr].filter(Boolean).join(' '),
    en: [first.en, pair?.en, typeLine.en, m.en, tipOwner.tip.en, CLOSE[n].en].filter(Boolean).join(' '),
  };
}

/** Kısa "Neden önemli?" cümlesi */
export function synWhy(a: K, b: K, type: AspectType): L {
  const A = REL[a], B = REL[b];
  if (!A || !B) return ASPECT_INFO[type].desc;
  const n = nat(type);
  if (a === b) {
    if (n === 'harmonious') return l(`İkinizin ${A.key.tr} alanı aynı dili konuşur; ${A.name.tr} ${A.gift.tr}.`, `Your ${A.key.en} speak the same language; ${A.name.en} ${A.gift.en}.`);
    if (n === 'fusion') return l(`İkinizin ${A.key.tr} alanı aynı noktada buluşur; bu konuda birbirinizi çok iyi anlarsınız.`, `Your ${A.key.en} meet at one point; you understand each other well here.`);
    return l(`İkinizin ${A.key.tr} alanı farklı ritimde işler; ${A.risk.tr}.`, `Your ${A.key.en} run at different rhythms; ${A.risk.en}.`);
  }
  if (n === 'harmonious') return l(`${cap(A.key.tr)} ile ${B.key.tr} birbirini besler; ${A.name.tr} ${A.gift.tr}.`, `${capEn(A.key.en)} and ${B.key.en} feed each other; ${A.name.en} ${A.gift.en}.`);
  if (n === 'fusion') {
    const hard = HARD.has(a) || HARD.has(b);
    return hard ? l(`${cap(A.key.tr)} ve ${B.key.tr} kaynaşır; güçlü bir çekim yaratır ama ${(HARD.has(a) ? A : B).risk.tr}.`, `${capEn(A.key.en)} and ${B.key.en} fuse; strong pull, but ${(HARD.has(a) ? A : B).risk.en}.`)
      : l(`${cap(A.key.tr)} ve ${B.key.tr} aynı noktada buluşur; ilişkinin merkezinde güçlü bir ortak alan oluşturur.`, `${capEn(A.key.en)} and ${B.key.en} meet at one point, forming a strong shared core.`);
  }
  const heavy = HARD.has(a) ? A : HARD.has(b) ? B : A;
  return l(`${cap(A.key.tr)} ile ${B.key.tr} arasında gerilim var; ${heavy.risk.tr}.`, `Tension between ${A.key.en} and ${B.key.en}; ${heavy.risk.en}.`);
}
