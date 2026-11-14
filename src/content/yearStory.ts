// Yıllık hikâye (Güneş dönüşü): her sayfanın kısa, akılda kalan metinleri.
import type { L } from './base';
const l = (tr: string, en: string): L => ({ tr, en });

/** Yılın sahnesi (Güneş dönüşünde Güneş'in evi) ve yılın teması (profeksiyon evi) */
export const HOUSE_YEAR: { word: L; head: L; text: L }[] = [
  { word: l('Yeniden doğuş', 'Rebirth'), head: l('Kendini yeniden yarattığın yıl', 'The year you reinvent yourself'), text: l('Görünüşün, tarzın, hayata bakışın değişiyor. Bu yıl başkalarının değil, senin istediğin sen ön planda.', 'Your look, style and outlook change. This year it’s the you that you want who comes first.') },
  { word: l('Değer', 'Worth'), head: l('Paranı ve değerini büyüttüğün yıl', 'The year you grow your money and worth'), text: l('Kazanç, birikim ve “ne kadar değerliyim” sorusu öne çıkıyor. Yeteneklerini paraya çevirmek için güzel bir yıl.', 'Income, savings and “what am I worth?” come forward. A good year to turn talents into money.') },
  { word: l('Bağlantı', 'Connection'), head: l('Öğrenmenin ve konuşmanın yılı', 'A year of learning and talking'), text: l('Kurslar, yazılar, kısa yolculuklar, kardeşler ve komşular. Telefonun hiç susmayacak.', 'Courses, writing, short trips, siblings and neighbours. Your phone won’t stop.') },
  { word: l('Yuva', 'Home'), head: l('Köklerine döndüğün yıl', 'The year you return to your roots'), text: l('Ev, aile, taşınma ya da yuva kurma. İçindeki güvenli alanı yeniden inşa ediyorsun.', 'Home, family, moving or nesting. You rebuild your inner safe place.') },
  { word: l('Neşe', 'Joy'), head: l('Aşkın ve eğlencenin yılı', 'A year of love and fun'), text: l('Flört, yaratıcılık, çocuklar ve keyif. Kalbin hafifliyor; kendini ifade etmekten çekinme.', 'Dating, creativity, children and fun. Your heart lightens; don’t hold back.') },
  { word: l('Düzen', 'Order'), head: l('Hayatını düzene soktuğun yıl', 'The year you get your life in order'), text: l('İş rutinleri, sağlık alışkanlıkları, günlük hayatın. Küçük değişiklikler büyük fark yaratıyor.', 'Work routines, health habits, daily life. Small changes make a big difference.') },
  { word: l('Biz', 'Us'), head: l('İlişkilerin yılı', 'The year of relationships'), text: l('Evlilik, ortaklık, ciddi bağlar. Hayatına giren ya da hayatında derinleşen biri bu yılın merkezinde.', 'Marriage, partnership, serious bonds. Someone entering or deepening in your life is at the centre.') },
  { word: l('Dönüşüm', 'Transformation'), head: l('Derin dönüşüm yılı', 'A year of deep transformation'), text: l('Ortak paralar, tutku, krizler ve yeniden doğuş. Bıraktığın şey sana yer açıyor.', 'Shared money, passion, crises and renewal. What you let go makes room for you.') },
  { word: l('Ufuk', 'Horizon'), head: l('Ufkunun genişlediği yıl', 'The year your horizons widen'), text: l('Yurt dışı, eğitim, uzun yolculuklar, yeni inançlar. Dünyan büyüyor.', 'Abroad, study, long trips, new beliefs. Your world gets bigger.') },
  { word: l('Zirve', 'Peak'), head: l('Kariyerinde yükseldiğin yıl', 'The year you rise in your career'), text: l('İş, statü ve hedefler. Herkesin önünde olduğun, emeğinin görüldüğü bir yıl.', 'Work, status and goals. A year when you’re visible and your effort is seen.') },
  { word: l('Topluluk', 'Community'), head: l('Arkadaşların ve hayallerin yılı', 'A year of friends and dreams'), text: l('Yeni çevreler, gruplar, sosyal medya ve gelecek planları. Doğru insanlar seni ileri taşıyor.', 'New circles, groups, social media and future plans. The right people carry you forward.') },
  { word: l('Arınma', 'Release'), head: l('İçine döndüğün, hazırlandığın yıl', 'A year of turning inward and preparing'), text: l('Dinlenme, kapanışlar, ruhsal derinlik. Yeni bir döngüden önce eskiyi tamamlıyorsun.', 'Rest, closures, spiritual depth. You complete the old before a new cycle.') },
];
/** Aşk sayfası: Güneş dönüşünde Venüs'ün evi */
export const VENUS_YEAR: L[] = [
  l('Çekiciliğin tavan yapıyor; insanlar sana kendiliğinden yöneliyor.', 'Your charm peaks; people are drawn to you naturally.'),
  l('Aşk ve para iç içe: hediyeler, güzel harcamalar, değer gördüğün anlar.', 'Love and money intertwine: gifts, lovely spending, feeling valued.'),
  l('Bir mesaj, bir sohbet, yakın çevreden biri; aşk konuşarak başlıyor.', 'A message, a chat, someone nearby; love starts with words.'),
  l('Evde huzur ve aile sıcaklığı; yuvanı güzelleştirdiğin bir yıl.', 'Peace at home and family warmth; a year to beautify your nest.'),
  l('Flört, romantizm ve kelebekler: yılın en tatlı alanı burası.', 'Dating, romance and butterflies: the sweetest area of your year.'),
  l('İş yerinde ya da günlük hayatta tatlı bir karşılaşma olabilir.', 'A sweet meeting may happen at work or in daily life.'),
  l('İlişkiler için yılın en güçlü işaretlerinden biri: ciddi bir bağ ya da evlilik gündemde.', 'One of the strongest signs for relationships: a serious bond or marriage is on the agenda.'),
  l('Tutkulu, derin ve dönüştürücü bir aşk enerjisi.', 'Passionate, deep and transforming love energy.'),
  l('Uzaktan biri, bir yolculuk ya da farklı bir kültür kalbine dokunabilir.', 'Someone far away, a trip or another culture may touch your heart.'),
  l('Aşk ve kariyer kesişiyor; işte tanınan ya da işte tanışılan biri.', 'Love and career cross: someone met through work or known for their work.'),
  l('Arkadaşlıktan aşka; sosyal çevren kalbini açıyor.', 'From friendship to love; your circle opens your heart.'),
  l('Gizli, sessiz ya da ruhsal bir bağ; kalbin içine dönük.', 'A secret, quiet or spiritual bond; your heart turns inward.'),
];
/** Şans sayfası: Güneş dönüşünde Jüpiter'in evi */
export const JUP_YEAR: L[] = [
  l('Özgüvenin ve görünürlüğün büyüyor; şans seni kişisel olarak buluyor.', 'Your confidence and visibility grow; luck finds you personally.'),
  l('Kazanç kapıları açık: zam, yeni iş ya da beklenmedik bir gelir.', 'Income doors are open: a raise, a new job or unexpected money.'),
  l('Öğrenme, yazma ve iletişimde şans; doğru bilgi doğru zamanda.', 'Luck in learning, writing and talking; the right info at the right time.'),
  l('Ev ve aile alanında bereket: taşınma, ev alma, aile büyümesi.', 'Blessings at home: moving, buying a home, the family growing.'),
  l('Aşkta, eğlencede ve yaratıcı işlerde şanslısın.', 'You’re lucky in love, fun and creative work.'),
  l('İşte ve sağlıkta iyileşme; günlük hayatın kolaylaşıyor.', 'Improvement at work and in health; daily life gets easier.'),
  l('İlişkilerde ve ortaklıklarda büyüme; doğru insanlar hayatına giriyor.', 'Growth in relationships and partnerships; the right people come in.'),
  l('Ortak paralarda, yatırımda ya da destek almada şans.', 'Luck in shared money, investments or receiving support.'),
  l('Yurt dışı, eğitim ve yolculukta şans çok güçlü.', 'Luck is very strong abroad, in study and travel.'),
  l('Kariyerde büyük fırsat: terfi, tanınma, yeni rol.', 'A big career opportunity: promotion, recognition, a new role.'),
  l('Arkadaşların ve çevren sana kapı açıyor; hayallerin gerçeğe yaklaşıyor.', 'Friends open doors; your dreams come closer.'),
  l('Görünmez bir koruma; zor anlarda bir şekilde kurtuluyorsun.', 'An unseen protection; you somehow get through hard moments.'),
];
/** Sınav sayfası: Güneş dönüşünde Satürn'ün evi */
export const SAT_YEAR: L[] = [
  l('Kendine karşı ciddileştiğin, olgunlaştığın bir yıl; sağlığına özen göster.', 'You get serious with yourself and mature; look after your health.'),
  l('Bütçe disiplini isteyen bir yıl; sabırla biriktirdiğin kalıcı olur.', 'A year needing budget discipline; what you save patiently lasts.'),
  l('Bir eğitimi, sınavı ya da evrak işini sabırla tamamlaman gerekecek.', 'You’ll need to patiently finish a course, exam or paperwork.'),
  l('Ev ve ailede sorumluluk; sağlam bir temel atıyorsun.', 'Responsibility at home and in family; you lay a solid foundation.'),
  l('Aşk ve eğlencede ciddiyet; hafif şeyler yerine kalıcı olanı seçiyorsun.', 'Seriousness in love and fun; you choose the lasting over the light.'),
  l('İş yükü artıyor; düzen kurarsan yıl sonunda ödülünü alırsın.', 'Workload rises; build order and you’ll be rewarded by year’s end.'),
  l('İlişkiler sınanıyor: ya söz veriliyor ya yollar ayrılıyor.', 'Relationships are tested: commitment or parting.'),
  l('Ortak paralar, borçlar ve derin duygularla yüzleşme yılı.', 'A year of facing shared money, debts and deep feelings.'),
  l('İnançlarını sorguladığın, uzun vadeli bir eğitime başlayabileceğin yıl.', 'You question beliefs and may start long-term study.'),
  l('Kariyerde büyük sorumluluk; emeğin kalıcı bir başarıya dönüşüyor.', 'Big career responsibility; your effort becomes lasting success.'),
  l('Arkadaş çevreni elediğin, hayallerini gerçekçi planlara çevirdiğin yıl.', 'You filter your circle and turn dreams into realistic plans.'),
  l('Yalnız kalıp kendini dinlemen gereken dönemler; eskiyi kapatıyorsun.', 'Times to be alone and listen to yourself; you close old chapters.'),
];
