// Kara Ay Lilith: bastırılmış güç, yasaklı arzular, "hayır" deme hakkı ve kimsenin evcilleştiremediği taraf.
// Metinler sade, kitap gibi akan bir dille yazıldı; teknik terim kullanılmaz.
import type { BodyId, Chart } from '../engine/astro';
import { angleDiff, bodyLon, houseOf } from '../engine/astro';
import { L, SIGNS } from './base';
import type { Chapter } from './story';
const l = (tr: string, en: string): L => ({ tr, en });

/** Burçlara göre Lilith: bastırılan şey, yaralandığı yer, sahiplenildiğinde verdiği güç */
export const LILITH_SIGN: { hide: L; wound: L; power: L }[] = [
  { hide: l('Öfken ve kimseye sormadan harekete geçme isteğin. Küçükken "sakin ol", "bu kadar sert olma" sözlerini sık duymuş olabilirsin.', 'Your anger and your urge to act without asking anyone. As a child you may often have heard "calm down" or "don\'t be so harsh".'),
    wound: l('Birinin seni durdurmaya ya da yavaşlatmaya çalışması sende çok derin bir tepki uyandırır.', 'Someone trying to stop or slow you down triggers a very deep reaction.'),
    power: l('Öfkeni saklamak yerine yön verdiğinde, kimsenin cesaret edemediği işleri ilk yapan kişi olursun.', 'When you direct your anger instead of hiding it, you become the first to do what no one else dares.') },
  { hide: l('Bedenine, zevklerine ve sahip olmak istediklerine duyduğun açlık. Keyif almak sana bir yerde ayıp ya da bencillik gibi öğretilmiş olabilir.', 'Your hunger for your body, your pleasures and what you want to own. Enjoying things may once have been taught to you as shameful or selfish.'),
    wound: l('Maddi güvencesizlik ya da bedeninin yargılanması seni en çok sarsan şeylerdendir.', 'Financial insecurity or having your body judged shakes you more than most things.'),
    power: l('Kendine iyi bakmayı ve keyfi suçluluk duymadan yaşamayı öğrendiğinde, insanları çeken sakin ve güçlü bir çekicilik kazanırsın.', 'When you learn to care for yourself and enjoy without guilt, you gain a calm, strong magnetism that draws people in.') },
  { hide: l('Aklından geçenleri olduğu gibi söyleme isteğin. Fazla soru sorduğun, fazla konuştuğun ya da "boş konuştuğun" söylenmiş olabilir.', 'Your urge to say exactly what crosses your mind. You may have been told you ask too many questions, talk too much or talk nonsense.'),
    wound: l('Susturulmak, dinlenmemek ya da sözünün kesilmesi seni derinden yaralar.', 'Being silenced, ignored or interrupted wounds you deeply.'),
    power: l('Sesini sahiplendiğinde sözlerin insanları rahatsız eder ama uyandırır; yazı, konuşma ve fikirlerle iz bırakırsın.', 'When you own your voice, your words unsettle people but wake them up; you leave a mark with writing, speaking and ideas.') },
  { hide: l('Bakılmak, korunmak ve şefkat görmek isteyen tarafın. Ya çok erken büyümek zorunda kaldın ya da duygusal ihtiyaçların fazla bulundu.', 'The part of you that wants to be cared for and protected. Either you had to grow up too early, or your emotional needs were seen as too much.'),
    wound: l('Ailede ya da yakın ilişkilerde reddedilmek, sende en derin izi bırakan şeydir.', 'Rejection in the family or close relationships leaves the deepest mark on you.'),
    power: l('İhtiyaçlarını utanmadan söylediğinde, başkalarına da kendini güvende hissettiren çok güçlü bir yuva olursun.', 'When you voice your needs without shame, you become a powerful home that makes others feel safe too.') },
  { hide: l('Görülmek, alkışlanmak ve sahnede olmak isteğin. "Gösteriş yapma", "kendini bu kadar öne çıkarma" denmiş olabilir.', 'Your wish to be seen, applauded and on stage. You may have been told not to show off or put yourself forward.'),
    wound: l('Görmezden gelinmek ya da başkasının gölgesinde kalmak seni en çok inciten şeydir.', 'Being overlooked or left in someone\'s shadow hurts you most.'),
    power: l('Parlamaktan özür dilemeyi bıraktığında, girdiğin her ortamda havayı değiştiren bir karizman olur.', 'When you stop apologising for shining, you carry a charisma that changes the air of every room.') },
  { hide: l('Kusursuz olmak zorunda olmadığın gerçeği. Her şeyi doğru yapmazsan sevilmeyeceğine dair gizli bir inanç taşıyor olabilirsin.', 'The truth that you don\'t have to be perfect. You may secretly believe you won\'t be loved unless you do everything right.'),
    wound: l('Eleştirilmek ya da yaptığın emeğin küçümsenmesi seni beklenmedik kadar derinden etkiler.', 'Criticism or having your effort belittled affects you more deeply than people expect.'),
    power: l('Kendine karşı yumuşadığında, gözünden hiçbir şey kaçmayan ama yargılamayan, iyileştiren bir ustalığa ulaşırsın.', 'When you soften towards yourself, you reach a healing mastery that misses nothing yet does not judge.') },
  { hide: l('Hayır deme hakkın. Herkesle iyi geçinmek, uyumlu ve sevimli olmak için kendi isteklerini çok kez yuttun.', 'Your right to say no. You often swallowed your own wishes to get along, to be pleasant and easy.'),
    wound: l('İlişkilerde eşit görülmemek ya da hep veren taraf olmak, içinde sessiz bir öfke biriktirir.', 'Not being treated as an equal in relationships, or always being the giver, builds a quiet anger inside.'),
    power: l('Sınır koymayı öğrendiğinde ilişkilerin bozulmaz, tam tersine gerçekten seni seven insanlar kalır.', 'When you learn to set limits, your relationships do not break; the people who truly love you stay.') },
  { hide: l('Yoğunluğun: tutkun, kıskançlığın, kontrol etme isteğin ve hiçbir şeyi yarım yaşamayan doğan. Bunlar hep "fazla" bulunmuş olabilir.', 'Your intensity: your passion, jealousy, need for control and your refusal to live anything halfway. These may always have been called "too much".'),
    wound: l('İhanete uğramak ya da güvendiğin birinin seni kullanması, en derin yaran olabilir.', 'Betrayal, or being used by someone you trusted, may be your deepest wound.'),
    power: l('Karanlığından korkmayı bıraktığında başkalarının bakamadığı yerlere bakabilen, krizde bile ayakta kalan biri olursun.', 'When you stop fearing your own darkness, you become someone who can look where others cannot and stays standing in a crisis.') },
  { hide: l('Özgürlüğün ve kendi doğrunu yaşama isteğin. Bir inanca, bir kurala ya da başkasının yoluna uymaya zorlanmış olabilirsin.', 'Your freedom and your wish to live your own truth. You may have been pushed to fit a belief, a rule or someone else\'s path.'),
    wound: l('Sıkışmak, bir yere bağlanmak ya da fikirlerinin alay konusu olması seni çok yaralar.', 'Feeling trapped, tied down, or having your ideas mocked hurts you a lot.'),
    power: l('Kendi felsefeni sahiplendiğinde insanlara yeni ufuklar açan, sınırları genişleten biri olursun.', 'When you own your philosophy, you open new horizons for others and widen their limits.') },
  { hide: l('Hırsın ve güç isteğin. Ya çok erken sorumluluk yüklendin ya da başarı isteğin "soğukluk" olarak görüldü.', 'Your ambition and desire for power. Either you carried responsibility too early, or your drive was seen as coldness.'),
    wound: l('Otoritenin seni ezmesi ya da emeğinin karşılığını alamamak sende kalıcı bir iz bırakır.', 'Being crushed by authority, or not being rewarded for your effort, leaves a lasting mark.'),
    power: l('Güç istemekten utanmadığında, kendi kurallarını koyan ve başkalarına da yol açan bir lider olursun.', 'When you are not ashamed of wanting power, you become a leader who sets your own rules and opens the way for others.') },
  { hide: l('Farklılığın. Kalabalığa uymayan fikirlerin, tarzın ya da yaşam biçimin yüzünden dışlandığını hissetmiş olabilirsin.', 'Your difference. You may have felt left out because of ideas, style or a way of life that didn\'t fit the crowd.'),
    wound: l('Bir gruba ait olamamak ya da "garip" bulunmak, için için taşıdığın bir yalnızlık yaratır.', 'Not belonging to a group, or being seen as strange, creates a loneliness you carry quietly.'),
    power: l('Garipliğini sahiplendiğinde, zamanının ilerisinde olan ve kendi topluluğunu kendisi kuran biri olursun.', 'When you own your strangeness, you become someone ahead of your time who builds your own community.') },
  { hide: l('Hayallerin, sezgilerin ve dünyadan kaçma isteğin. Fazla hassas, fazla dalgın ya da "gerçekçi olmayan" biri olarak görülmüş olabilirsin.', 'Your dreams, intuition and wish to escape the world. You may have been seen as too sensitive, too dreamy or unrealistic.'),
    wound: l('Hayal kırıklığı ve kendini kurban gibi hissettiğin ilişkiler sende derin bir iz bırakır.', 'Disappointment, and relationships where you felt like the victim, leave a deep mark.'),
    power: l('Hassasiyetini bir yük değil bir yetenek olarak gördüğünde sanat, şifa ve sezgiyle insanlara dokunursun.', 'When you see your sensitivity as a gift rather than a burden, you touch people through art, healing and intuition.') },
];

/** Evlere göre Lilith: bu isyan ve güç hayatın hangi alanında yaşanır */
export const LILITH_HOUSE: L[] = [
  l('Bu enerji en çok görünüşünde ve tavrında yaşanır. İnsanlar seni ilk gördüklerinde bir şey hisseder ama tam adını koyamaz; ya çok çekici ya da biraz ürkütücü bulunursun. Kimsenin kalıbına sığmamak senin doğanda var.', 'This energy lives mostly in your appearance and manner. People feel something when they first see you but cannot quite name it; you seem either very attractive or a little intimidating. Not fitting anyone\'s mould is in your nature.'),
  l('Bu enerji en çok parayla ve öz değerinle ilgilidir. Kendi parasını kazanmak, kimseye muhtaç olmamak senin için bir özgürlük meselesidir. Değerini başkalarının onayına bağladığında kaybeder, kendin belirlediğinde kazanırsın.', 'This energy is mostly about money and self-worth. Earning your own money and needing no one is a matter of freedom for you. You lose when your worth depends on others\' approval and win when you set it yourself.'),
  l('Bu enerji en çok sözlerinde yaşanır. Söylenmemesi gerekeni söyleyen, tabuları konuşan kişi sen olabilirsin. Kardeşlerle ya da yakın çevreyle ilgili eski bir kırgınlık da bu alanda olabilir.', 'This energy lives mostly in your words. You may be the one who says what should not be said and talks about taboos. An old hurt with siblings or close circles may also sit here.'),
  l('Bu enerji en çok ailende ve evinde yaşanır. Ailede konuşulmayan bir konu, sana yüklenmiş bir rol ya da duygusal bir eksiklik olmuş olabilir. Kendi evini kendi kurallarınla kurduğunda bu yara iyileşir.', 'This energy lives mostly in your family and home. There may have been an unspoken topic, a role placed on you, or an emotional gap. When you build your own home by your own rules, this wound heals.'),
  l('Bu enerji en çok aşkta, flörtte ve yaratıcılıkta yaşanır. Sıradan ilişkiler seni sıkar; yasak, karmaşık ya da tutkulu aşklara çekilebilirsin. Sanatta ve kendini ifade etmede cesur, sınır tanımayan bir yanın var.', 'This energy lives mostly in romance, flirting and creativity. Ordinary relationships bore you; you may be drawn to forbidden, complicated or passionate love. You have a bold, limitless side in art and self-expression.'),
  l('Bu enerji en çok günlük hayatında, işinde ve bedeninde yaşanır. Sana dayatılan rutinlere ve patronlara uymakta zorlanırsın. Bedenin, bastırdığın duyguları bazen yorgunluk ya da hassasiyetle sana hatırlatabilir.', 'This energy lives mostly in your daily life, work and body. You struggle with routines and bosses imposed on you. Your body may remind you of suppressed feelings through fatigue or sensitivity.'),
  l('Bu enerji en çok ikili ilişkilerinde ve evlilikte yaşanır. İlişkilerde güç dengesi senin için çok önemlidir; eşit olmayan bir bağa razı olmadığında en sağlıklı ilişkiyi kurarsın. Sıra dışı ya da başkalarının onaylamadığı ilişkiler yaşayabilirsin.', 'This energy lives mostly in your partnerships and marriage. The balance of power matters greatly to you; when you refuse unequal bonds, you build your healthiest relationships. You may live unusual relationships others don\'t approve of.'),
  l('Bu enerji en çok yakınlıkta, cinsellikte ve ortak parada yaşanır. Derin bağlarda kontrol ve güven temaları öne çıkar. Tabu sayılan konulara, psikolojiye ve gizemlere doğal bir merakın vardır.', 'This energy lives mostly in intimacy, sexuality and shared money. Control and trust themes come up in deep bonds. You have a natural curiosity for taboo subjects, psychology and mysteries.'),
  l('Bu enerji en çok inançlarında, eğitiminde ve yolculuklarında yaşanır. Sana öğretilen doğrulara körü körüne inanmazsın. Uzak kültürler, farklı felsefeler ve kendi keşfettiğin bir inanç sistemi seni özgürleştirir.', 'This energy lives mostly in your beliefs, education and travels. You don\'t blindly accept the truths you were taught. Distant cultures, different philosophies and a belief system you discover yourself set you free.'),
  l('Bu enerji en çok kariyerinde ve toplum önündeki imajında yaşanır. Kuralları yıkan, tartışılan ama unutulmayan biri olabilirsin. Otoriteyle çatışma yaşayabilirsin; en iyi kendi işinde ya da kendi kurallarını koyduğun bir yerde parlarsın.', 'This energy lives mostly in your career and public image. You may be someone who breaks rules, gets talked about but is not forgotten. You may clash with authority; you shine best in your own business or where you set the rules.'),
  l('Bu enerji en çok arkadaşlıklarında ve gruplarda yaşanır. Kalabalıkta bile kendini biraz dışarıda hissedebilirsin. Sıra dışı insanlarla, toplumun kenarındaki topluluklarla ve geleceğe dair cesur hayallerle güçlenirsin.', 'This energy lives mostly in friendships and groups. You may feel a little on the outside even in a crowd. You grow stronger with unusual people, communities on the edges of society and bold visions of the future.'),
  l('Bu enerji en çok iç dünyanda, rüyalarında ve yalnız kaldığında yaşanır. Kimseye göstermediğin, belki kendinden bile sakladığın bir taraf var. Yalnızlık, meditasyon, sanat ya da terapi bu gizli gücü ortaya çıkarır.', 'This energy lives mostly in your inner world, your dreams and when you are alone. There is a side you show no one, perhaps even hide from yourself. Solitude, meditation, art or therapy bring this hidden power out.'),
];

/** Lilith'in kişisel noktalarla teması */
const LILITH_CONTACT: Partial<Record<BodyId | 'asc' | 'mc', L>> = {
  sun: l('Lilith kimliğine çok yakın: kim olduğunu saklamak sana hep zor geldi. Ya çok sevilirsin ya da hiç anlaşılmazsın; ortası yoktur.', 'Lilith sits close to your identity: hiding who you are has always been hard. You are either loved deeply or not understood at all; there is no middle.'),
  moon: l('Lilith duygularına çok yakın: duygusal ihtiyaçların fazla bulunmuş olabilir. Annenle ilişkin ya da annelik konusu hayatında önemli bir yer tutar.', 'Lilith sits close to your feelings: your emotional needs may have been seen as too much. Your relationship with your mother, or motherhood itself, holds an important place in your life.'),
  mercury: l('Lilith aklına çok yakın: keskin, bazen acı sözlerin var. Başkalarının düşünmeye bile cesaret edemediğini söylersin.', 'Lilith sits close to your mind: your words are sharp, sometimes stinging. You say what others don\'t even dare to think.'),
  venus: l('Lilith aşk hayatına çok yakın: çekiciliğin güçlü ve biraz tehlikeli. Aşkta kurallara uymazsın; seni kıskanılan ya da yargılanan ilişkilere çekebilir.', 'Lilith sits close to your love life: your charm is strong and a little dangerous. You don\'t follow rules in love; it may draw you into envied or judged relationships.'),
  mars: l('Lilith enerjine çok yakın: tutkun ve öfken birlikte çalışır. Haksızlık karşısında susamazsın; bu gücü bir amaca bağladığında durdurulamazsın.', 'Lilith sits close to your energy: your passion and anger work together. You cannot stay silent before injustice; tied to a purpose, this power is unstoppable.'),
  jupiter: l('Lilith şansına çok yakın: inançların ve özgürlük isteğin büyük. Sıradan yollar sana dar gelir, kendi yolunu açtığında şansın da açılır.', 'Lilith sits close to your luck: your beliefs and need for freedom are big. Ordinary paths feel narrow; when you open your own, your luck opens too.'),
  saturn: l('Lilith sorumluluklarına çok yakın: kurallarla ve otoriteyle karmaşık bir ilişkin var. Hem onlara karşı çıkarsın hem de kendi kurallarını çok sert koyarsın.', 'Lilith sits close to your duties: you have a complicated relationship with rules and authority. You both rebel against them and set your own very strictly.'),
  asc: l('Lilith görünüşüne çok yakın: dışarıdan bakan herkes sende "farklı" bir şey sezer. Çekiciliğin gizemli, tavrın kalıplara sığmaz.', 'Lilith sits close to your image: everyone senses something "different" in you. Your charm is mysterious and your manner fits no mould.'),
  mc: l('Lilith kariyerine çok yakın: tanınmak istersin ama kendi şartlarınla. Kurallara uymayan, sınırları zorlayan bir iş ya da imaj sana yakışır.', 'Lilith sits close to your career: you want to be known, but on your terms. Work or an image that bends the rules suits you.'),
};

const LILITH_CYCLE = 8.85; // yıl

export function lilithChapter(ch: Chart, lang: 'tr' | 'en', now = new Date()): Chapter | null {
  const P = ch.positions; const lp = P.lilith; if (!lp) return null;
  const sg = lp.sign; const S = LILITH_SIGN[sg];
  const paras: L[] = [];
  paras.push({
    tr: `Senin Lilith'in ${SIGNS[sg].tr} burcunda. Bu, saklamayı öğrendiğin şeyi anlatır: ${S.hide.tr} ${S.wound.tr} ${S.power.tr}`,
    en: `Your Lilith is in ${SIGNS[sg].en}. It describes what you learned to hide: ${S.hide.en} ${S.wound.en} ${S.power.en}`,
  });
  if (ch.cusps.length) { const h = houseOf(lp.lon, ch.cusps); paras.push(LILITH_HOUSE[h - 1]); }
  // Temaslar (kavuşum ve karşıtlık, 4 derece)
  const contacts: L[] = [];
  for (const k of ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc', 'mc'] as const) {
    const lon = k === 'asc' ? ch.asc : k === 'mc' ? ch.mc : P[k]?.lon; if (lon === null || lon === undefined) continue;
    const d = angleDiff(lp.lon, lon);
    if (d <= 4 || Math.abs(d - 180) <= 4) { const c = LILITH_CONTACT[k]; if (c) contacts.push(c); }
  }
  if (contacts.length) paras.push({ tr: contacts.map(c => c.tr).join(' '), en: contacts.map(c => c.en).join(' ') });
  // Şu an gökyüzündeki Lilith ve Lilith dönüşleri
  const nowLon = bodyLon('lilith', now); const nowSign = Math.floor(nowLon / 30);
  const age = (now.getTime() - ch.utc.getTime()) / (365.25 * 86400000);
  const next = Math.ceil(age / LILITH_CYCLE + 0.0001) * LILITH_CYCLE;
  const returns = [1, 2, 3, 4, 5, 6, 7, 8].map(i => Math.round(i * LILITH_CYCLE)).filter(a => a < 80);
  const nowHouse = ch.cusps.length ? houseOf(nowLon, ch.cusps) : 0;
  const HOUSE_SHORT: L[] = [l('görünüşün ve tavrın', 'your image and manner'), l('paran ve öz değerin', 'your money and self-worth'), l('sözlerin ve yakın çevren', 'your words and close circle'), l('ailen ve evin', 'your family and home'), l('aşkın ve yaratıcılığın', 'your romance and creativity'), l('işin ve günlük düzenin', 'your work and daily routine'), l('ilişkilerin', 'your relationships'), l('yakınlık ve ortak para konuların', 'your intimacy and shared money'), l('inançların ve yolculukların', 'your beliefs and travels'), l('kariyerin', 'your career'), l('arkadaşlıkların', 'your friendships'), l('iç dünyan', 'your inner world')];
  paras.push({
    tr: `Lilith gökyüzünde yaklaşık dokuz ayda bir burç değiştirir ve dokuz yılda bir doğduğun yere geri döner. Şu an ${SIGNS[nowSign].tr} burcunda${nowHouse ? `; yani bu aylarda ${HOUSE_SHORT[nowHouse - 1].tr} konusunda bastırdığın şeyler yüzeye çıkabilir, "artık yeter" dediğin anlar yaşayabilirsin` : ''}. Lilith'in doğum yerine döndüğü yaşlar (${returns.slice(0, 6).join(', ')}…) eski bir yaranın yeniden açılıp bu kez iyileştiği, kendi sesini daha güçlü bulduğun dönemlerdir. Bir sonraki dönüşün yaklaşık ${Math.round(next)} yaşında.`,
    en: `Lilith changes sign about every nine months and returns to its birth place about every nine years. It is now in ${SIGNS[nowSign].en}${nowHouse ? `, so in these months what you suppressed around ${HOUSE_SHORT[nowHouse - 1].en} may rise to the surface, and you may have "enough is enough" moments` : ''}. The ages when Lilith returns (${returns.slice(0, 6).join(', ')}…) are times when an old wound reopens and this time heals, and you find your own voice more strongly. Your next return is around age ${Math.round(next)}.`,
  });
  return {
    id: 'lilith',
    title: l('Lilith: saklı gücün', 'Lilith: your hidden power'),
    intro: l('Lilith, Ay\'ın yörüngesinde Dünya\'dan en uzak noktadır. Haritada bir gezegen değil, bir boşluktur: hayatında bastırmayı öğrendiğin, "fazla" bulunan, kimsenin evcilleştiremediği tarafını gösterir. Burada saklanan şey aslında senin en çiğ ve en özgür gücündür.',
      'Lilith is the point of the Moon\'s orbit farthest from Earth. It is not a planet but an empty point: it shows the side of you that you learned to suppress, that was called "too much", that no one could tame. What hides here is actually your rawest and freest power.'),
    paras,
  };
}
