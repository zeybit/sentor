// Sinastri ev yerleşimleri: bir kişinin gezegenleri diğerinin hangi evine düşüyor ve bu ne anlama geliyor.
// Metinler isimlerle kurulur (Türkçe ekler ünlü uyumuna göre eklenir), böylece iki yönde de doğru okunur.
import type { BodyId, Chart } from '../engine/astro';
import { houseOf } from '../engine/astro';
import { BODIES, HOUSES, L, SIGNS } from './base';

export const OVERLAY_BODIES: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];

// ---------- Türkçe isim ekleri ----------
const VOW = 'aeıioöuüAEIIOÖUÜ';
function lastVowel(w: string) { for (let i = w.length - 1; i >= 0; i--) if (VOW.includes(w[i])) return w[i].toLocaleLowerCase('tr'); return 'e'; }
function endsVowel(w: string) { return VOW.includes(w[w.length - 1] ?? ''); }
const back = (v: string) => 'aıou'.includes(v);
export function trForms(name: string) {
  const n = name.trim() || 'O';
  const v = lastVowel(n), vw = endsVowel(n);
  const h4 = 'aı'.includes(v) ? 'ı' : 'ei'.includes(v) ? 'i' : 'ou'.includes(v) ? 'u' : 'ü';
  const h2 = back(v) ? 'a' : 'e';
  return { nom: n, gen: `${n}'${vw ? 'n' : ''}${h4}n`, acc: `${n}'${vw ? 'y' : ''}${h4}`, dat: `${n}'${vw ? 'y' : ''}${h2}` };
}
type F = ReturnType<typeof trForms>;
const enGen = (n: string) => `${n.trim() || 'their'}’s`;

/** Gezegeni getiren kişinin ilişkiye kattığı */
const VISIT: Record<string, (O: F, H: F) => L> = {
  sun: (O, H) => ({ tr: `${O.nom} bu alana ışık, ilgi ve yön getirir; ${O.gen} varlığı burayı aydınlatır ve ${H.nom} bu konuda ondan cesaret alır.`, en: `brings light, attention and direction here; their presence lights up this area and gives courage.` }),
  moon: (O, H) => ({ tr: `${O.nom} bu alanda duygusal yakınlık ve şefkat uyandırır; aranızda içgüdüsel bir tanıdıklık oluşur ve ${H.nom} burada kendini korunmuş hisseder.`, en: `stirs emotional closeness and tenderness here; an instinctive familiarity forms and the other feels protected.` }),
  mercury: (O) => ({ tr: `${O.nom} bu alana fikir, sohbet ve merak getirir; bu konular en çok onunla konuşulur ve yeni bakış açıları onunla gelir.`, en: `brings ideas, conversation and curiosity; these topics are talked about most with them.` }),
  venus: (O, H) => ({ tr: `${O.nom} bu alana sevgi, hayranlık ve keyif getirir; ${H.nom} burada ${O.dat} karşı yumuşar ve bu konuyu onunla daha güzel yaşar.`, en: `brings love, admiration and pleasure; the other softens toward them here and enjoys this area more with them.` }),
  mars: (O) => ({ tr: `${O.nom} bu alana enerji, arzu ve hareket getirir; burada heyecan da artar, tartışma da. Bu yerleşim harekete geçirir ama sabır ister.`, en: `brings energy, desire and action; excitement rises here, and so do arguments. It energises but needs patience.` }),
  jupiter: (O, H) => ({ tr: `${O.nom} bu alana şans, cömertlik ve büyüme getirir; ${H.nom} bu konuda ${O.acc} bir şans kapısı gibi görür.`, en: `brings luck, generosity and growth; the other sees them as a door of luck in this area.` }),
  saturn: (O) => ({ tr: `${O.nom} bu alana ciddiyet, sorumluluk ve kalıcılık getirir; burada başta bir ağırlık ya da kısıtlanma hissi olabilir ama zamanla bu alan sağlamlaşır.`, en: `brings seriousness, responsibility and permanence; at first it can feel heavy or restricting, but over time this area becomes solid.` }),
  uranus: (O) => ({ tr: `${O.nom} bu alana sürpriz, özgürlük ve ani değişim getirir; onunla birlikte bu konuda hiçbir şey eskisi gibi kalmaz.`, en: `brings surprise, freedom and sudden change; with them nothing stays the same in this area.` }),
  neptune: (O) => ({ tr: `${O.nom} bu alana büyü, ilham ve idealleştirme getirir; burada sınırlar bulanıklaşabilir, onu olduğundan farklı görmek mümkün.`, en: `brings magic, inspiration and idealisation; boundaries can blur and they may be seen as other than they are.` }),
  pluto: (O, H) => ({ tr: `${O.nom} bu alana yoğunluk, güç ve dönüşüm getirir; ${H.nom} burada derinden etkilenir ve bu ilişkiden sonra bu konuda aynı kişi kalmaz.`, en: `brings intensity, power and transformation; the other is deeply affected and is not the same in this area afterwards.` }),
  node: (O) => ({ tr: `${O.nom} bu alanda bir kader hissi uyandırır; bu konuda ikiniz için bir büyüme yönü açılır, sanki bu kişi tam bu alanda sizi ileri itmek için gelmiş gibi.`, en: `brings a sense of fate; a direction of growth opens here, as if they came to push you forward in exactly this area.` }),
};

/** Evin, ev sahibinin hayatındaki karşılığı */
const HOST: ((O: F, H: F) => L)[] = [
  (O, H) => ({ tr: `Bu, ${H.gen} kimliği, görünüşü ve tavrıyla ilgili. ${O.nom} ${H.dat} kendini daha net görmeyi, daha cesur olmayı ya da tarzını değiştirmeyi düşündürür; etkisi ilk andan, yüz yüze fark edilir.`, en: `This touches identity, appearance and manner: they make the other see themselves more clearly or change their style; the effect is felt face to face from the first moment.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} parası, sahip oldukları ve öz değeriyle ilgili. ${O.nom} ${H.gen} neye değer verdiğini, nasıl kazanıp harcadığını etkiler; birlikteyken para ve güvenlik konuları sık konuşulur.`, en: `This touches money, possessions and self-worth: they affect what the other values and how they earn and spend; money and security come up often.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} günlük iletişimi, yakın çevresi ve kısa yolculuklarıyla ilgili. Mesajlaşmalar, gündelik sohbetler ve birlikte yapılan küçük gezintiler bu ilişkinin dokusunu oluşturur; ${O.nom} ${H.gen} düşünme biçimini değiştirir.`, en: `This touches daily communication, close circle and short trips: messages, everyday talk and small outings make up this bond; they change how the other thinks.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} evi, ailesi ve iç dünyasıyla ilgili. ${O.nom} ${H.dat} "yuva" hissi verir ya da en derin aile meselelerine dokunur; birlikte yaşamak ve ev kurmak gündeme gelebilir.`, en: `This touches home, family and inner world: they give the other a feeling of home or touch the deepest family issues; living together may come up.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} aşk, flört, eğlence ve yaratıcılık alanı. İlişkinin romantik, oyunbaz ve keyifli yüzü burada yaşanır; ${O.nom} ${H.gen} kalbini hızlandıran kişidir. Çocuk konusu da bu evde gündeme gelir.`, en: `This is the other's house of romance, flirting, fun and creativity: the playful, romantic face of the relationship lives here; they make the other's heart race. Children also come up here.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} günlük düzeni, işi ve sağlığıyla ilgili. ${O.nom} ${H.gen} rutinlerine karışır; birlikte çalışmak, birbirine bakmak ve pratik destek bu bağın parçasıdır. Romantizmden çok gündelik bir yakınlık getirir.`, en: `This touches daily routine, work and health: they become part of the other's routines; working together and practical care are part of the bond, more everyday than romantic.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} evlilik ve ortaklık evi. ${H.nom} ${O.acc} ciddi bir partner, eş adayı ya da "öteki yarısı" olarak görür. Uzun süreli bağlar için en güçlü yerleşimlerden biridir.`, en: `This is the other's house of marriage and partnership: they are seen as a serious partner, a potential spouse or "the other half". One of the strongest placements for lasting bonds.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} yakınlık, cinsellik ve ortak kaynak evi. Çekim derin ve yoğundur; güven, kıskançlık, ortak para ve birbirinin sırları ilişkinin merkezine yerleşir.`, en: `This is the house of intimacy, sexuality and shared resources: the pull is deep and intense; trust, jealousy, shared money and secrets sit at the centre.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} inançları, eğitimi ve uzak yolculuklarıyla ilgili. ${O.nom} ${H.gen} ufkunu genişletir; birlikte seyahat, farklı kültürler ve hayatın anlamı üzerine sohbetler bağı güçlendirir.`, en: `This touches beliefs, education and long journeys: they widen the other's horizons; travel, other cultures and talks about meaning strengthen the bond.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} kariyeri ve toplumdaki yeriyle ilgili. ${O.nom} ${H.gen} hedeflerini ve itibarını etkiler; ilişki herkesin gözü önünde olur ve iş hayatına da yansır.`, en: `This touches career and public standing: they affect the other's goals and reputation; the relationship is visible to all and reflects on work life.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} arkadaşlıkları, çevresi ve gelecek hayalleriyle ilgili. Aranızda güçlü bir dostluk temeli vardır; ortak arkadaşlar ve birlikte kurulan gelecek planları ilişkiyi besler.`, en: `This touches friendships, social circle and hopes: there is a strong friendship base; shared friends and future plans feed the relationship.` }),
  (O, H) => ({ tr: `Bu, ${H.gen} gizli dünyası ve bilinçaltıyla ilgili. Bağ ruhsal, sezgisel ve biraz gizemlidir; ${O.nom} ${H.gen} kimseye göstermediği tarafını görür. İlişki bazen gizli kalabilir ya da açıklanamaz bir kader hissi taşır.`, en: `This touches the hidden world and subconscious: the bond is spiritual, intuitive and a little mysterious; they see the side the other shows no one. The relationship may stay hidden or carry an inexplicable sense of fate.` }),
];

/** En önemli yerleşimler için özel, ayrıntılı yorumlar */
const SPECIAL: Record<string, (O: F, H: F) => L> = {
  'sun-1': (O, H) => ({ tr: `${O.gen} Güneş'i ${H.gen} yükselen evine düşüyor: ${H.nom} ${O.acc} ilk gördüğü anda fark eder; ${O.nom} ${H.gen} kimliğini parlatan, onu daha özgüvenli yapan biridir. ${H.nom} bazen ${O.gen} gölgesinde kaldığını hissedebilir, bu yüzden iki tarafın da parlamasına yer açmak önemli.`, en: `Their Sun falls in the other's first house: they are noticed at first sight and make the other more confident; the other may sometimes feel in their shadow, so both need room to shine.` }),
  'sun-5': (O, H) => ({ tr: `${O.gen} Güneş'i ${H.gen} aşk evinde: ${H.nom} ${O.acc} gerçekten eğlenceli, çekici ve "aşık olunacak" biri olarak görür. Birlikte flört, oyun, yaratıcı işler ve kutlamalar ilişkinin merkezindedir. Romantik bir başlangıç için çok güçlü bir işarettir.`, en: `Their Sun is in the other's house of romance: they are seen as fun, attractive and someone to fall for. Flirting, play and celebration are central; a very strong sign for a romantic start.` }),
  'sun-7': (O, H) => ({ tr: `${O.gen} Güneş'i ${H.gen} evlilik evinde: ${H.nom} ${O.acc} hayat ortağı olarak görür. Bu, sinastride evliliğe en çok işaret eden yerleşimlerden biridir; ${O.nom} ${H.gen} hayatına "partner" rolüyle girer ve ilişki doğal olarak ciddiye biner.`, en: `Their Sun is in the other's house of marriage: they are seen as a life partner. One of the strongest marriage indicators in synastry; the relationship naturally turns serious.` }),
  'moon-4': (O, H) => ({ tr: `${O.gen} Ay'ı ${H.gen} ev ve aile evinde: ${O.nom} ${H.dat} aileden biri gibi gelir. Birlikte yemek yemek, aynı evde vakit geçirmek ve ailelerle tanışmak çok doğal akar; birlikte yaşama isteği erken doğabilir.`, en: `Their Moon is in the other's house of home: they feel like family. Sharing meals, time at home and meeting families flow naturally; the wish to live together may come early.` }),
  'moon-7': (O, H) => ({ tr: `${O.gen} Ay'ı ${H.gen} evlilik evinde: ${H.nom} ${O.acc} duygusal olarak "eşim" diye hisseder. ${O.nom} ilişkide şefkat ve bakım arar; ${H.nom} de ona bu güveni vermek ister. Uzun süreli birliktelik için çok besleyici bir yerleşim.`, en: `Their Moon is in the other's house of marriage: they feel like a spouse emotionally. They seek care in the relationship and the other wants to give it; very nourishing for a lasting bond.` }),
  'moon-8': (O, H) => ({ tr: `${O.gen} Ay'ı ${H.gen} yakınlık evinde: duygular çok derin ve yoğun yaşanır. ${O.nom} ${H.gen} en gizli duygularına dokunur; bu güçlü bir bağlılık getirir ama kıskançlık ve sahiplenmeye de açık bir yerleşimdir.`, en: `Their Moon is in the other's house of intimacy: feelings run deep and intense. They touch the other's most hidden emotions; strong attachment, but open to jealousy and possessiveness.` }),
  'venus-1': (O, H) => ({ tr: `${O.gen} Venüs'ü ${H.gen} yükselen evinde: ${O.nom} ${H.acc} çok çekici bulur, onun görünüşüne ve tarzına hayrandır. ${H.nom} ${O.gen} yanında kendini güzel ve değerli hisseder. Fiziksel çekim için çok güçlü bir işaret.`, en: `Their Venus is in the other's first house: they find the other very attractive and admire their look and style; the other feels beautiful and valued. A strong sign of physical attraction.` }),
  'venus-5': (O, H) => ({ tr: `${O.gen} Venüs'ü ${H.gen} aşk evinde: klasik bir romantik aşk yerleşimi. Flört, hediye, sürprizler ve birlikte eğlence bu ilişkinin dilidir; ${H.nom} ${O.gen} yanında kendini âşık hisseder.`, en: `Their Venus is in the other's house of romance: a classic romantic placement. Flirting, gifts, surprises and fun are the language here; the other feels in love beside them.` }),
  'venus-7': (O, H) => ({ tr: `${O.gen} Venüs'ü ${H.gen} evlilik evinde: sinastrideki en güçlü evlilik ve uyum işaretlerinden biri. ${H.nom} ${O.acc} ideal partner olarak görür; ${O.nom} ilişkiye zarafet, uyum ve sevgi getirir. Bu yerleşim ilişkinin kalıcı olma ihtimalini belirgin şekilde artırır.`, en: `Their Venus is in the other's house of marriage: one of the strongest marriage and harmony signs. They are seen as the ideal partner and bring grace and love; it clearly raises the odds of a lasting relationship.` }),
  'venus-8': (O, H) => ({ tr: `${O.gen} Venüs'ü ${H.gen} yakınlık evinde: aradaki çekim tutkulu ve bağımlılık yaratacak kadar güçlü. Cinsel uyum yüksek olur; ortak para ve hediyeleşme de bu ilişkide önemli bir yer tutar.`, en: `Their Venus is in the other's house of intimacy: the attraction is passionate and almost addictive. Sexual harmony is high; shared money and gifts matter too.` }),
  'venus-12': (O, H) => ({ tr: `${O.gen} Venüs'ü ${H.gen} gizli evinde: ${O.nom} ${H.acc} sessizce ve koşulsuz sever. Bu sevgi bazen dile getirilmez ya da ilişki bir süre gizli yaşanır; ruhsal ve fedakâr bir bağ.`, en: `Their Venus is in the other's hidden house: they love quietly and unconditionally. This love may go unspoken, or the relationship may stay private for a while; a spiritual, self-giving bond.` }),
  'mars-1': (O, H) => ({ tr: `${O.gen} Mars'ı ${H.gen} yükselen evinde: ${O.nom} ${H.acc} harekete geçirir, cesaretlendirir; fiziksel çekim hızlı ve güçlüdür. Ancak ${H.nom} kendini zaman zaman zorlanmış ya da itilmiş hissedebilir.`, en: `Their Mars is in the other's first house: they energise and embolden the other; physical attraction is fast and strong, though the other may at times feel pushed.` }),
  'mars-5': (O, H) => ({ tr: `${O.gen} Mars'ı ${H.gen} aşk evinde: tutkulu, flörtöz ve heyecanlı bir çekim. Romantizm hızlı başlar; birlikte spor, macera ve oyun bu ilişkiyi canlı tutar.`, en: `Their Mars is in the other's house of romance: passionate, flirtatious, exciting attraction. Romance starts fast; sport, adventure and play keep it alive.` }),
  'mars-7': (O, H) => ({ tr: `${O.gen} Mars'ı ${H.gen} evlilik evinde: ${H.nom} ${O.acc} hem çok çekici hem de bazen zorlayıcı bir partner olarak yaşar. İlişkide enerji yüksek, tartışmalar da açık yapılır; doğru yönetildiğinde güçlü ve canlı bir ortaklık.`, en: `Their Mars is in the other's house of marriage: they are lived as both very attractive and sometimes challenging. High energy and open arguments; well managed, a strong, lively partnership.` }),
  'mars-8': (O, H) => ({ tr: `${O.gen} Mars'ı ${H.gen} yakınlık evinde: sinastrideki en güçlü cinsel çekim işaretlerinden biri. Tutku yoğun; güç dengesi ve kıskançlık konularına dikkat etmek gerekir.`, en: `Their Mars is in the other's house of intimacy: one of the strongest signs of sexual attraction. Passion is intense; watch power balance and jealousy.` }),
  'mars-12': (O, H) => ({ tr: `${O.gen} Mars'ı ${H.gen} gizli evinde: ${O.gen} enerjisi ${H.gen} bilinçaltını harekete geçirir; açıkça söylenmeyen arzular ve bastırılmış kızgınlıklar olabilir. Açık konuşmak bu yerleşimin ilacıdır.`, en: `Their Mars is in the other's hidden house: their energy stirs the other's subconscious; unspoken desires and suppressed anger may arise. Speaking openly is the remedy.` }),
  'jupiter-7': (O, H) => ({ tr: `${O.gen} Jüpiter'i ${H.gen} evlilik evinde: ${O.nom} ${H.dat} şans ve bolluk getiren bir partnerdir. Evlilik için çok olumlu bir işaret; ilişki ikisini de büyütür ve hayatlarını genişletir.`, en: `Their Jupiter is in the other's house of marriage: a partner who brings luck and abundance. Very favourable for marriage; the bond grows and widens both lives.` }),
  'saturn-7': (O, H) => ({ tr: `${O.gen} Satürn'ü ${H.gen} evlilik evinde: klasik bir "ciddi ilişki ve bağlılık" işareti. ${O.nom} ilişkiye sorumluluk ve kalıcılık getirir; ${H.nom} bazen kendini kısıtlanmış hissetse de bu yerleşim uzun süreli evliliklerde sıkça görülür.`, en: `Their Saturn is in the other's house of marriage: a classic sign of serious commitment. They bring responsibility and permanence; the other may sometimes feel restricted, yet it is common in long marriages.` }),
  'saturn-5': (O, H) => ({ tr: `${O.gen} Satürn'ü ${H.gen} aşk evinde: romantizm ağır ve ciddi başlar. ${H.nom} kendini rahat bırakmakta zorlanabilir; eğlenceyi bilinçli olarak ilişkiye eklemek gerekir.`, en: `Their Saturn is in the other's house of romance: romance starts heavy and serious. The other may struggle to relax; fun needs to be added consciously.` }),
  'saturn-4': (O, H) => ({ tr: `${O.gen} Satürn'ü ${H.gen} ev evinde: ${O.nom} ${H.gen} ev hayatına düzen ve güvenlik getirir ama aynı zamanda aile içi bir ağırlık ya da otorite hissi de taşıyabilir.`, en: `Their Saturn is in the other's house of home: they bring order and security to home life, but also a sense of family weight or authority.` }),
  'uranus-7': (O, H) => ({ tr: `${O.gen} Uranüs'ü ${H.gen} evlilik evinde: heyecan verici ama öngörülemez bir ortaklık. İlişki alışılmış kalıplara uymaz; özgürlük alanı tanındığında yaşar, sıkıştırıldığında kopabilir.`, en: `Their Uranus is in the other's house of marriage: an exciting but unpredictable partnership. It lives when given freedom and can break when squeezed.` }),
  'neptune-5': (O, H) => ({ tr: `${O.gen} Neptün'ü ${H.gen} aşk evinde: masalsı, romantik ve hayalperest bir aşk. Birlikte sanat ve müzik çok güzeldir; ama ${H.nom} ${O.acc} idealleştirip gerçeği gözden kaçırabilir.`, en: `Their Neptune is in the other's house of romance: a dreamy, fairy-tale love. Art and music together are beautiful, but the other may idealise them and miss reality.` }),
  'neptune-7': (O, H) => ({ tr: `${O.gen} Neptün'ü ${H.gen} evlilik evinde: ruhsal ve fedakâr bir ortaklık; "ruh eşi" hissi verir. Ancak beklentiler ve sınırlar net konuşulmazsa hayal kırıklığı riski yüksektir.`, en: `Their Neptune is in the other's house of marriage: a spiritual, self-giving partnership with a "soulmate" feel; if expectations are not discussed, the risk of disappointment is high.` }),
  'pluto-7': (O, H) => ({ tr: `${O.gen} Plüton'u ${H.gen} evlilik evinde: kader gibi hissettiren, dönüştürücü bir ortaklık. Güç dengesi bu ilişkinin ana konusudur; birbirinizi kontrol etmek yerine birlikte dönüşmeyi seçtiğinizde çok güçlü bir bağ olur.`, en: `Their Pluto is in the other's house of marriage: a fated, transformative partnership. Power balance is the main theme; choosing to transform together instead of controlling makes it very strong.` }),
  'pluto-8': (O, H) => ({ tr: `${O.gen} Plüton'u ${H.gen} yakınlık evinde: son derece yoğun bir çekim; cinsellik, güven ve ortak para konularında derin bir dönüşüm. Bu ilişki iz bırakır.`, en: `Their Pluto is in the other's house of intimacy: an extremely intense pull, deep transformation around sex, trust and shared money. This relationship leaves a mark.` }),
};

const POSS: Record<string, string> = { sun: "Güneş'i", moon: "Ay'ı", mercury: "Merkür'ü", venus: "Venüs'ü", mars: "Mars'ı", jupiter: "Jüpiter'i", saturn: "Satürn'ü", uranus: "Uranüs'ü", neptune: "Neptün'ü", pluto: "Plüton'u", node: 'Kuzey Ay Düğümü' };

export interface OverlayRow { body: BodyId; lon: number; sign: number; house: number; title: L; text: L }

/** owner'ın gezegenleri host'un evlerine nereye düşüyor */
export function overlays(owner: Chart, host: Chart, ownerName: string, hostName: string): OverlayRow[] {
  if (!host.cusps.length) return [];
  const O = trForms(ownerName), H = trForms(hostName);
  const told = new Set<number>();
  return OVERLAY_BODIES.filter(b => owner.positions[b]).map(b => {
    const lon = owner.positions[b].lon, sign = Math.floor(lon / 30), house = houseOf(lon, host.cusps);
    const sp = SPECIAL[`${b}-${house}`];
    const again = told.has(house); told.add(house);
    const hostTr = again ? `Bu gezegen de ${H.gen} ${house}. evine düşüyor; aynı eve birden fazla gezegen gelmesi, ${O.gen} ${H.gen} hayatında bu alanı özellikle güçlü etkilediğini gösterir.` : HOST[house - 1](O, H).tr;
    const hostEn = again ? `This planet too falls in the other's ${house}th house; several planets in one house show this area is especially affected.` : HOST[house - 1](O, H).en;
    const tr = sp ? sp(O, H).tr : `${VISIT[b](O, H).tr} ${hostTr}`;
    const enBase = sp ? sp(O, H).en : `${enGen(ownerName)} ${BODIES[b].name.en} ${VISIT[b](O, H).en} ${hostEn}`;
    return {
      body: b, lon, sign, house,
      title: { tr: `${O.gen} ${POSS[b]} → ${H.gen} ${house}. evi (${SIGNS[sign].tr})`, en: `${enGen(ownerName)} ${BODIES[b].name.en} → ${enGen(hostName)} ${house}th house (${SIGNS[sign].en})` },
      text: { tr, en: enBase },
    };
  });
}

/** Gezegenlerin en çok toplandığı evlerden kısa bir sonuç */
export function overlaySummary(rows: OverlayRow[], ownerName: string, hostName: string): L | null {
  if (!rows.length) return null;
  const O = trForms(ownerName), H = trForms(hostName);
  const personal = rows.filter(r => ['sun', 'moon', 'mercury', 'venus', 'mars'].includes(r.body));
  const cnt = new Map<number, number>();
  for (const r of personal) cnt.set(r.house, (cnt.get(r.house) ?? 0) + 1);
  const top = [...cnt.entries()].sort((a, b) => b[1] - a[1]).filter(([, c]) => c >= 2);
  const love = rows.filter(r => [5, 7, 8].includes(r.house) && ['sun', 'moon', 'venus', 'mars', 'jupiter'].includes(r.body));
  const parts: string[] = []; const partsEn: string[] = [];
  if (top.length) {
    const hs = top.map(([h]) => `${h}. ev (${HOUSES[h - 1].short.tr.toLocaleLowerCase('tr')})`).join(' ve ');
    parts.push(`${O.gen} kişisel gezegenleri en çok ${H.gen} ${hs} alanında toplanıyor. Yani ${O.nom}, ${H.gen} hayatında en çok bu konulara dokunan kişi.`);
    partsEn.push(`${enGen(ownerName)} personal planets gather most in ${enGen(hostName)} ${top.map(([h]) => `${h}th house (${HOUSES[h - 1].short.en.toLowerCase()})`).join(' and ')}.`);
  }
  if (love.length) {
    parts.push(`${love.length} önemli gezegen ${H.gen} aşk, evlilik ya da yakınlık evlerine (5, 7, 8) düşüyor: bu, aranızdaki romantik ve kalıcı bağ potansiyelini güçlendiren bir işaret.`);
    partsEn.push(`${love.length} key planets fall in the other's houses of romance, marriage or intimacy (5, 7, 8), strengthening the romantic and lasting potential.`);
  } else {
    parts.push(`${O.gen} kişisel gezegenleri ${H.gen} aşk ve evlilik evlerine düşmüyor; bağ daha çok dostluk, günlük hayat ya da ortak hedefler üzerinden kurulur.`);
    partsEn.push(`None of their key planets fall in the other's houses of romance or marriage; the bond is built more on friendship, daily life or shared goals.`);
  }
  return { tr: parts.join(' '), en: partsEn.join(' ') };
}
