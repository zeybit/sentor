// Harita sekmesindeki her harita türünün sade anlatımı: ne işe yarar, ne zaman bakılır, hangi soruya cevap verir.
import type { L } from './base';
const l = (tr: string, en: string): L => ({ tr, en });

export interface KindInfo { what: L; when: L; ask: L }
export const KIND_INFO: Record<string, KindInfo> = {
  natal: {
    what: l('Doğduğun anın gökyüzü. Karakterini, yeteneklerini, zorlandığın yerleri ve hayatının ana temalarını gösterir. Diğer bütün haritalar bunun üzerine okunur.',
      'The sky at the moment you were born. It shows your character, talents, sore spots and the main themes of your life. Every other chart is read on top of it.'),
    when: l('Kendini tanımak istediğinde. Başka bir haritaya bakmadan önce temeli anlamak için.', 'When you want to understand yourself, and before you look at any other chart.'),
    ask: l('Ben nasıl biriyim, neyde iyiyim, neyi öğrenmeye geldim?', 'Who am I, what am I good at, what am I here to learn?'),
  },
  transit: {
    what: l('Seçtiğin tarihte gökyüzündeki gezegenlerin senin doğum haritana nasıl dokunduğunu gösterir. Dış haladaki gezegenler o günün gökyüzüdür. Daha çok dışarıdan gelen olayları, fırsatları ve baskıları anlatır.',
      'Shows how the planets on a chosen date touch your birth chart. The outer ring is the sky on that day. It mostly describes events, openings and pressures that come from outside.'),
    when: l('Bir günün, haftanın ya da ayın nasıl geçeceğini merak ettiğinde. Tarihi ileri geri alarak istediğin döneme bakabilirsin.', 'When you wonder how a day, week or month will go. Move the date forward or back to look at any period.'),
    ask: l('Önümüzdeki aylar işte ve ilişkide nasıl geçecek?', 'How will the coming months go at work and in love?'),
  },
  progressed: {
    what: l('Haritanın seninle birlikte yavaşça olgunlaşmış hâli: doğumundan sonraki her gün, hayatının bir yılına karşılık gelir. Dışarıdaki olaylardan çok iç dünyandaki değişimi, yıllar içinde ihtiyaçlarının ve önceliklerinin nasıl değiştiğini anlatır.',
      'Your chart slowly maturing with you: each day after birth stands for one year of life. It describes inner change more than outer events: how your needs and priorities shift over the years.'),
    when: l('İçinde büyük bir değişim hissettiğinde ya da birkaç yıllık genel eğilimi görmek istediğinde.', 'When you feel a big inner shift, or want to see the trend of the next few years.'),
    ask: l('Son yıllarda neden önceliklerim değişti, beni hangi evre bekliyor?', 'Why have my priorities changed lately, and what phase comes next?'),
  },
  timeline: {
    what: l('Transit ve progresyonun aynı anda aynı konuyu işaret ettiği ayları bulur. Aşk, kariyer, ev, yolculuk ve büyük değişim için hayatının en güçlü dönemlerini tek çizgide gösterir.',
      'Finds the months when transits and progressions point to the same topic at once. It shows the strongest periods of your life for love, career, home, travel and big change on one line.'),
    when: l('"Ne zaman?" sorusunun cevabını aradığında. En kısa yol budur.', 'Whenever your question is "when?". This is the shortest way to the answer.'),
    ask: l('Evlilik, iş değişikliği ya da taşınma ne zaman gündeme gelir?', 'When will marriage, a job change or a move come up?'),
  },
  solarArc: {
    what: l('Bütün haritanın yılda yaklaşık bir derece ileri taşınmasıdır. Hayatındaki dönüm noktalarını (taşınma, evlilik, iş değişikliği, kayıp ya da kazanç) yıl düzeyinde işaretlemekte çok başarılıdır.',
      'The whole chart moved forward about one degree a year. It is very good at marking turning points (moves, marriage, job changes, losses or gains) to the year.'),
    when: l('Bir olayın hangi yıl olacağını ya da geçmişte bir olayın neden o yıl olduğunu görmek istediğinde.', 'When you want to know which year something will happen, or why something happened in a past year.'),
    ask: l('Hangi yaşımda önemli bir kırılma yaşarım?', 'At what age will I hit a major turning point?'),
  },
  solarReturn: {
    what: l('Güneş her yıl, doğduğun anda bulunduğu dereceye geri döner. Bu an senin kişisel yeni yılındır. O anın haritası, doğum gününden sonraki on iki ayın ana temasını gösterir: hangi alan öne çıkacak, yıl nasıl bir hava taşıyacak.',
      'Each year the Sun returns to the exact degree it held when you were born. That moment is your personal new year, and its chart shows the main theme of the twelve months after your birthday: which area comes forward, what the year feels like.'),
    when: l('Doğum gününden önce ya da hemen sonra, yeni yaşının nasıl geçeceğini görmek için. Doğum gününü geçirdiğin şehir haritayı değiştirir; şehri Ayarlar > Şu anki konum bölümünden değiştirebilirsin.', 'Just before or after your birthday, to see how the new year of your life will go. The city you spend your birthday in changes the chart; you can change it under Settings > Current location.'),
    ask: l('Bu yaşımda en çok hangi alan öne çıkacak?', 'Which area of life will lead this year?'),
  },
  lunarReturn: {
    what: l('Ay, yaklaşık 27 günde bir doğduğun andaki yerine döner. Bu dönüşün haritası önümüzdeki bir ayın duygusal havasını ve günlük gündemini gösterir.',
      'Roughly every 27 days the Moon returns to where it was when you were born. The chart of that return shows the emotional tone and daily agenda of the month ahead.'),
    when: l('Her ayın başında, kısa vadeli plan yaparken.', 'At the start of each month, when making short-term plans.'),
    ask: l('Bu ay neye odaklanmalıyım, nerede yorulabilirim?', 'What should I focus on this month, and where might I get tired?'),
  },
  antiscia: {
    what: l('Gezegenlerin Yengeç ile Oğlak arasındaki eksene göre "ayna" noktalarıdır. Haritada ilk bakışta görünmeyen gizli bağlantıları, arka planda sessizce çalışan etkileri ortaya çıkarır.',
      'The "mirror" points of the planets across the Cancer–Capricorn axis. They reveal hidden links that are not visible at first glance, influences that work quietly in the background.'),
    when: l('Doğum haritanı okuduktan sonra, daha derine inmek istediğinde. İleri düzey bir bakıştır.', 'After you have read your birth chart and want to go deeper. It is an advanced view.'),
    ask: l('Haritamda göze çarpmayan ama beni etkileyen bir bağlantı var mı?', 'Is there a hidden link in my chart that still affects me?'),
  },
  now: {
    what: l('Şu anın gökyüzü, kendi başına. Gezegenler şu an hangi burçta, hangisi geri gidiyor, aralarında hangi açılar var; herkes için geçerli genel havayı gösterir.',
      'The sky right now, on its own. Which signs the planets are in, which are retrograde, what angles they make: the general weather that applies to everyone.'),
    when: l('Gündemdeki astroloji konuşmalarını (Merkür retrosu, dolunay vb.) anlamak istediğinde.', 'When you want to understand the astrology everyone is talking about (Mercury retrograde, full moons and so on).'),
    ask: l('Şu an gökyüzünde neler oluyor?', 'What is happening in the sky right now?'),
  },
  cartography: {
    what: l('Gezegenlerinin dünya haritası üzerinde nereden geçtiğini gösterir. Hangi şehirde aşkın, kariyerin, huzurun ya da şansın daha kolay geldiğini, hangi yerlerin seni zorlayabileceğini anlatır.',
      'Shows where your planets cross the world map. It tells you in which cities love, career, peace or luck come more easily, and which places may be harder for you.'),
    when: l('Taşınma, yurt dışında okuma ya da çalışma, uzun tatil planlarken.', 'When planning a move, studying or working abroad, or a long trip.'),
    ask: l('Hangi şehirde kariyerim daha çok parlar?', 'In which city would my career shine most?'),
  },
  finder: {
    what: l('Bir gezegenin senin haritandaki bir noktaya ne zaman açı yapacağını ya da yeni bir burca ne zaman gireceğini önceden bulur ve tarihleri listeler.',
      'Finds in advance when a planet will make an angle to a point in your chart, or when it will enter a new sign, and lists the dates.'),
    when: l('Belirli bir etkinin tam tarihini merak ettiğinde. Örneğin şans gezegeni Jüpiter\'in Güneş\'ine ne zaman dokunacağı.', 'When you want the exact date of a specific influence, for example when lucky Jupiter will touch your Sun.'),
    ask: l('Jüpiter Venüs\'üme ne zaman gelecek?', 'When will Jupiter reach my Venus?'),
  },
};
