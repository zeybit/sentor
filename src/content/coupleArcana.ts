// Uyum matrisi: iki kişinin matrisi toplandığında çıkan sayıların ilişki diliyle yorumu ("siz" diliyle).
import { L } from './base';
import { ARCANA } from './arcana';
const l = (tr: string, en: string): L => ({ tr, en });

/** 22 enerjinin bir ilişkideki karşılığı */
export const COUPLE: Record<number, { bond: L; risk: L; tip: L }> = {
  1: { bond: l('Birbirinizi konuşarak, fikir üreterek ve yeni işlere başlayarak beslersiniz. Birlikteyken ikiniz de daha cesur ve girişken olursunuz.', 'You feed each other through talk, ideas and starting new things. Together you both become bolder and more enterprising.'),
    risk: l('Sözler fazla keskinleşebilir; kimin haklı olduğu yarışı ilişkiyi yorar.', 'Words can get too sharp; competing over who is right wears the relationship down.'),
    tip: l('Ortak bir proje başlatın; enerjinizi birbirinize değil aynı hedefe yöneltin.', 'Start a shared project; aim your energy at one goal rather than at each other.') },
  2: { bond: l('Aranızda sözsüz bir anlaşma var. Çoğu şeyi konuşmadan hissedersiniz; güven yavaş ama derin kurulur.', 'There is an unspoken understanding between you. You sense most things without words; trust builds slowly but deeply.'),
    risk: l('Söylenmeyenler birikebilir; sessizlik zamanla mesafeye dönüşür.', 'What goes unsaid can pile up; silence may slowly turn into distance.'),
    tip: l('Hissettiklerinizi tahmin etmeye bırakmayın, ara sıra yüksek sesle söyleyin.', 'Do not leave feelings to guesswork; say them out loud now and then.') },
  3: { bond: l('Sıcak, bereketli ve besleyici bir birliktelik. Ev kurmak, güzel bir hayat yaratmak ve birbirinize bakmak sizi mutlu eder.', 'A warm, abundant, nurturing bond. Building a home, creating a beautiful life and caring for each other makes you happy.'),
    risk: l('Biriniz hep veren, diğeri hep alan tarafa geçerse denge bozulur.', 'If one of you always gives and the other always takes, the balance breaks.'),
    tip: l('Şefkati karşılıklı tutun; teşekkür etmeyi ve şımartılmayı ikiniz de öğrenin.', 'Keep care mutual; both of you learn to thank and to be pampered.') },
  4: { bond: l('Sağlam, güvenilir ve düzen kuran bir ilişki. Birlikte plan yapar, söz verir ve tutarsınız; başkaları size güvenir.', 'A solid, reliable relationship that builds structure. You plan, promise and keep your word together; others trust you.'),
    risk: l('Kontrol ve kurallar sevginin önüne geçebilir; ilişki bir işletmeye dönüşebilir.', 'Control and rules can get ahead of love; the relationship can turn into a business.'),
    tip: l('Planın içine plansız anlar da koyun; romantizmi takvime yazmayı unutmayın.', 'Leave unplanned moments in the plan; remember to put romance on the calendar.') },
  5: { bond: l('Ortak değerler, inançlar ve öğrenme isteği sizi bağlar. Birbirinize öğretir, birbirinizden öğrenirsiniz.', 'Shared values, beliefs and a love of learning bind you. You teach each other and learn from each other.'),
    risk: l('Biriniz diğerine akıl vermeye başlarsa ilişki öğretmen–öğrenci ilişkisine döner.', 'If one starts lecturing the other, it becomes a teacher–pupil relationship.'),
    tip: l('Gelenekleri birlikte seçin; ailelerden gelen kuralları değil kendi kurallarınızı yaşayın.', 'Choose your traditions together; live by your own rules, not those handed down by families.') },
  6: { bond: l('Bu güçlü bir aşk enerjisi: çekim, romantizm ve birbirini seçme duygusu yüksek. Gerçekten birlikte olmayı seçmiş iki insansınız.', 'This is a strong love energy: attraction, romance and the feeling of choosing each other run high. You are two people who truly chose to be together.'),
    risk: l('Kararsızlık ve kıskançlık; birinizin aklı başka seçeneklerde kalabilir.', 'Indecision and jealousy; one of you may keep thinking about other options.'),
    tip: l('Seçiminizi her gün yeniden yapın; sevgiyi söylemek kadar göstermek de önemli.', 'Make your choice again every day; showing love matters as much as saying it.') },
  7: { bond: l('Birlikte hareket eden, hedefe koşan bir ekip gibisiniz. Seyahat, değişim ve ilerleme bu ilişkinin yakıtı.', 'You are like a team in motion, racing toward goals. Travel, change and progress fuel this relationship.'),
    risk: l('Hep bir sonraki hedefe bakarken birbirinizi gözden kaçırabilirsiniz.', 'Always looking to the next goal, you can lose sight of each other.'),
    tip: l('Durup kazandıklarınızı birlikte kutlayın; yolculuk kadar varış da önemli.', 'Stop and celebrate what you have achieved together; arriving matters as much as travelling.') },
  8: { bond: l('Adalet ve dürüstlük üzerine kurulu bir ilişki. Hesap sorulabilen, net ve dengeli bir bağınız var.', 'A relationship built on fairness and honesty. Your bond is clear, balanced and accountable.'),
    risk: l('Her şeyi tartıp ölçmek, kim ne verdi diye saymak sevgiyi soğutur.', 'Weighing everything and keeping score of who gave what cools love.'),
    tip: l('Adil olun ama hesap tutmayın; bazen karşılık beklemeden verin.', 'Be fair but do not keep accounts; sometimes give without expecting anything back.') },
  9: { bond: l('Derin, bilge ve biraz içe dönük bir ilişki. Birlikte sessizliği, doğayı ve derin sohbetleri seversiniz.', 'A deep, wise and somewhat inward relationship. Together you love silence, nature and deep conversations.'),
    risk: l('İkiniz de kendi kabuğunuza çekilirseniz aynı evde yalnız kalabilirsiniz.', 'If you both withdraw into your shells, you can end up lonely in the same house.'),
    tip: l('Yalnız kalma ihtiyacına saygı gösterin ama birlikte vakit için de alan açın.', 'Respect each other\'s need to be alone, but make room for time together too.') },
  10: { bond: l('Şans, kader ve döngüler ilişkisi. Karşılaşmanız tesadüf gibi görünse de hayatınızı değiştiren dönemeçler birlikte gelir.', 'A relationship of luck, fate and cycles. Your meeting may look like chance, but life-changing turns come to you together.'),
    risk: l('Dönemsel iniş çıkışlar; iyi giderken çok iyi, kötü giderken çok kötü.', 'Cyclical ups and downs; very good when it is good, very bad when it is bad.'),
    tip: l('Zor dönemin geçeceğini bilin; esnek kalın ve fırsatları birlikte değerlendirin.', 'Know that hard times pass; stay flexible and seize opportunities together.') },
  11: { bond: l('Güçlü, tutkulu ve enerjik bir birliktelik. Birlikteyken dağları devirebilirsiniz; aranızdaki çekim yoğun.', 'A strong, passionate, energetic union. Together you can move mountains; the attraction between you is intense.'),
    risk: l('Güç savaşı ve öfke patlamaları; ikiniz de geri adım atmak istemeyebilirsiniz.', 'Power struggles and outbursts; neither of you may want to back down.'),
    tip: l('Gücünüzü birbirinize karşı değil birlikte kullanın; spor ve ortak hedefler bu enerjiyi dengeler.', 'Use your strength together, not against each other; sport and shared goals balance this energy.') },
  12: { bond: l('Fedakârlık ve farklı bakış açısı üzerine kurulu bir bağ. Birbiriniz için çok şeyden vazgeçebilirsiniz.', 'A bond built on sacrifice and seeing things differently. You may give up a lot for each other.'),
    risk: l('Biriniz kendini kurban gibi hissetmeye başlarsa ilişki ağırlaşır.', 'If one starts feeling like a victim, the relationship grows heavy.'),
    tip: l('Fedakârlığı dengede tutun; ihtiyaçlarınızı açıkça söyleyin.', 'Keep sacrifice balanced; state your needs openly.') },
  13: { bond: l('Dönüşüm ilişkisi: birlikte olduğunuzda ikiniz de eski hâlinizi bırakırsınız. Bu bağ sizi kökten değiştirir.', 'A relationship of transformation: together you both leave your old selves behind. This bond changes you at the root.'),
    risk: l('Ani kopuşlar, bitişler ve yeniden başlamalar yaşanabilir.', 'Sudden breaks, endings and new starts may happen.'),
    tip: l('Değişimden korkmayın; eskiyen alışkanlıkları birlikte bırakıp ilişkiyi yenileyin.', 'Do not fear change; drop worn-out habits together and renew the relationship.') },
  14: { bond: l('Uyum, sükûnet ve denge ilişkisi. Birbirinizi sakinleştirir, birbirinize iyi gelirsiniz.', 'A relationship of harmony, calm and balance. You soothe each other and do each other good.'),
    risk: l('Fazla uyum heyecanı söndürebilir; tartışmaktan kaçınmak sorunları ertelemek olabilir.', 'Too much harmony can dull excitement; avoiding arguments can mean postponing problems.'),
    tip: l('Ara sıra rutini bozun; sakinliği korurken heyecanı da besleyin.', 'Break the routine now and then; keep the calm while feeding the excitement.') },
  15: { bond: l('Yoğun çekim, tutku ve güçlü bir bağımlılık hissi. Birbirinizden kopmak çok zordur.', 'Intense attraction, passion and a strong sense of attachment. Breaking away from each other is very hard.'),
    risk: l('Kıskançlık, kontrol ve sahiplenme; tutku bağımlılığa dönüşebilir.', 'Jealousy, control and possessiveness; passion can turn into dependence.'),
    tip: l('Tutkuyu özgürlükle dengeleyin; birbirinizin ayrı hayatlarına da alan bırakın.', 'Balance passion with freedom; leave room for each other\'s separate lives.') },
  16: { bond: l('Sarsıcı ama özgürleştirici bir bağ. Bu ilişki ikinizin de kurduğu eski yapıları yıkar ve yerine daha gerçek bir şey koyar.', 'A shaking but liberating bond. This relationship breaks old structures you both built and puts something more real in their place.'),
    risk: l('Ani krizler, beklenmedik değişimler ve sert tartışmalar.', 'Sudden crises, unexpected changes and harsh arguments.'),
    tip: l('Krizleri bir son değil yeniden yapılanma olarak görün; birlikte daha sağlam temeller atın.', 'See crises as rebuilding, not endings; lay firmer foundations together.') },
  17: { bond: l('Umut, ilham ve yaratıcılık ilişkisi. Birbirinizin içindeki en güzel yanı görür, birbirinize ilham verirsiniz.', 'A relationship of hope, inspiration and creativity. You see the best in each other and inspire each other.'),
    risk: l('Birbirinizi fazla idealleştirip gerçeği görmezden gelebilirsiniz.', 'You may idealise each other too much and overlook reality.'),
    tip: l('Hayalleri somut adımlara çevirin; sanat, müzik ya da ortak bir hobi bağınızı güçlendirir.', 'Turn dreams into concrete steps; art, music or a shared hobby strengthens your bond.') },
  18: { bond: l('Sezgisel, duygusal ve gizemli bir bağ. Aranızdaki çekim açıklanamaz; birbirinizin rüyalarına bile girersiniz.', 'An intuitive, emotional and mysterious bond. The pull between you cannot be explained; you even appear in each other\'s dreams.'),
    risk: l('Kuşku, kaygı ve yanlış anlaşılmalar; söylenmeyenleri hayal gücü doldurur.', 'Doubt, anxiety and misunderstandings; imagination fills in what is not said.'),
    tip: l('Kuşkularınızı içinizde büyütmeyin, açıkça konuşun; netlik bu ilişkinin ilacıdır.', 'Do not let doubts grow inside; talk openly. Clarity is this relationship\'s medicine.') },
  19: { bond: l('Neşeli, sıcak ve aydınlık bir ilişki. Birlikteyken güler, parlar ve çevrenize de enerji verirsiniz.', 'A joyful, warm and bright relationship. Together you laugh, shine and give energy to people around you.'),
    risk: l('İkiniz de ilgi odağı olmak isteyebilir; ego çatışmaları çıkabilir.', 'You may both want the spotlight; ego clashes may arise.'),
    tip: l('Birbirinizin başarısını kendi başarınız gibi kutlayın; çocuklar ve oyun bu bağı besler.', 'Celebrate each other\'s success as your own; children and play nourish this bond.') },
  20: { bond: l('Ailevi, köklü ve uyanış getiren bir bağ. Bu ilişki iki aileyi birleştirir ve ikinize de geçmişle barışma fırsatı verir.', 'A familial, rooted bond that brings awakening. This relationship joins two families and gives you both a chance to make peace with the past.'),
    risk: l('Ailelerin ilişkiye fazla karışması ya da eski aile kalıplarının tekrar etmesi.', 'Families interfering too much, or old family patterns repeating.'),
    tip: l('Ailelerinize saygı gösterin ama kendi yuvanızın kurallarını birlikte koyun.', 'Respect your families, but set the rules of your own home together.') },
  21: { bond: l('Geniş ufuklu, özgür ve dünyaya açılan bir ilişki. Birlikte seyahat eder, farklı kültürler ve yeni dünyalar keşfedersiniz.', 'A wide-horizoned, free relationship that opens to the world. Together you travel and discover different cultures and new worlds.'),
    risk: l('Fazla özgürlük bağlılık sorununa dönüşebilir; ortak bir merkez bulmak zorlaşır.', 'Too much freedom can turn into commitment issues; finding a shared centre becomes hard.'),
    tip: l('Özgürlüğü koruyun ama bir "biz" alanı da oluşturun; ortak bir ev ya da gelenek iyi gelir.', 'Keep your freedom but also create a "we" space; a shared home or ritual helps.') },
  22: { bond: l('Hafif, eğlenceli ve kendiliğinden bir ilişki. Birlikte çocuk gibi oynar, maceraya atılır ve anı yaşarsınız.', 'A light, playful and spontaneous relationship. Together you play like children, jump into adventures and live in the moment.'),
    risk: l('Sorumluluktan kaçmak ve geleceği planlamamak ilişkiyi belirsiz bırakabilir.', 'Avoiding responsibility and not planning the future can leave the relationship uncertain.'),
    tip: l('Eğlenceyi kaybetmeden küçük ortak hedefler koyun; hafiflik ile güveni birlikte büyütün.', 'Without losing the fun, set small shared goals; grow lightness and trust together.') },
};

export type CouplePos = 'E' | 'A' | 'B' | 'C' | 'D' | 'love' | 'money' | 'X' | 'tail1' | 'tail2' | 'tail3' | 'talent1' | 'talent2' | 'personal' | 'social' | 'spiritual';
export const COUPLE_POS: Record<CouplePos, { title: L; what: L }> = {
  E: { title: l('İlişkinizin özü', 'The core of your relationship'), what: l('Matrisin merkezi, ikinizi bir arada tutan ana enerjidir; bu ilişkinin en doğal hâli budur.', 'The centre of the matrix is the main energy holding you together; it is the relationship at its most natural.') },
  A: { title: l('Sizi birbirinize çeken kıvılcım', 'The spark that drew you together'), what: l('İlk tanıştığınızda birbirinizde gördüğünüz ve ilişkiyi başlatan enerji.', 'The energy you saw in each other when you first met, the one that started it all.') },
  B: { title: l('Birlikte açılan yeteneğiniz', 'The gift that opens when you are together'), what: l('İkinizin yan yana olduğunda ortaya çıkan ilham ve yaratıcı güç.', 'The inspiration and creative power that appears when you are side by side.') },
  C: { title: l('Dünyaya bakan yüzünüz', 'The face you show the world'), what: l('Çevrenizin sizi bir çift olarak nasıl gördüğü ve ortak maddi hayatınız.', 'How people around you see you as a couple, and your shared material life.') },
  D: { title: l('Birlikte geçmeniz gereken sınav', 'The test you must pass together'), what: l('Bu ilişkinin ikinize öğretmek için geldiği ana ders.', 'The main lesson this relationship came to teach you both.') },
  love: { title: l('Aşkınızın dili', 'The language of your love'), what: l('Sevginizi nasıl yaşadığınız ve ilişkinin romantik tarafı.', 'How you live your love and the romantic side of the relationship.') },
  money: { title: l('Ortak paranız ve işleriniz', 'Your shared money and work'), what: l('Birlikte para kazanma, harcama ve iş yapma biçiminiz.', 'How you earn, spend and work together.') },
  X: { title: l('Aşk ile para arasındaki denge', 'The balance between love and money'), what: l('Duygular ile maddi konuların ilişkinizde nasıl buluştuğu.', 'How feelings and material matters meet in your relationship.') },
  tail1: { title: l('İlişkinin geçmişten getirdiği tema', 'The theme the relationship carries from the past'), what: l('Bu bağın çözülmesi gereken eski bir düğüm gibi taşıdığı konu.', 'The issue this bond carries like an old knot waiting to be untied.') },
  tail2: { title: l('Bu temayı bugün nasıl yaşıyorsunuz', 'How you live this theme today'), what: l('Eski düğümün bugünkü ilişkinizde nasıl ortaya çıktığı.', 'How the old knot shows up in your relationship today.') },
  tail3: { title: l('Düğüm çözüldüğünde varacağınız yer', 'Where you arrive once the knot is untied'), what: l('Dersi birlikte çözdüğünüzde ilişkinin ulaşacağı hâl.', 'What the relationship becomes once you resolve the lesson together.') },
  talent1: { title: l('İlişkinin doğal armağanı', 'The relationship\'s natural gift'), what: l('Hiç çaba harcamadan birlikte yaptığınız güzel şey.', 'The beautiful thing you do together without any effort.') },
  talent2: { title: l('Birlikte geliştirdikçe açılan güç', 'The power that opens as you grow together'), what: l('Zamanla ve emekle birlikte geliştirebileceğiniz yetenek.', 'The ability you can develop together with time and effort.') },
  personal: { title: l('Bu ilişki neden hayatınıza girdi', 'Why this relationship came into your lives'), what: l('İkinizin kişisel olarak bu bağdan öğreneceği şey.', 'What each of you will personally learn from this bond.') },
  social: { title: l('Birlikte çevrenize ne katıyorsunuz', 'What you give others together'), what: l('Bir çift olarak ailenize, arkadaşlarınıza ve topluma verdiğiniz.', 'What you give to your families, friends and society as a couple.') },
  spiritual: { title: l('İlişkinin en derin anlamı', 'The deepest meaning of the relationship'), what: l('Bu bağın ruhsal düzeydeki amacı.', 'The purpose of this bond on a soul level.') },
};

export function coupleStory(pos: CouplePos, n: number): L {
  const c = COUPLE[n]; const a = ARCANA[n]; const p = COUPLE_POS[pos];
  return {
    tr: `${p.what.tr} Sizde bu nokta ${a.name.tr} enerjisi taşıyor. ${c.bond.tr} Dikkat etmeniz gereken: ${c.risk.tr.charAt(0).toLocaleLowerCase('tr') + c.risk.tr.slice(1)} ${c.tip.tr}`,
    en: `${p.what.en} For you this point carries the energy of ${a.name.en}. ${c.bond.en} What to watch: ${c.risk.en.charAt(0).toLowerCase() + c.risk.en.slice(1)} ${c.tip.en}`,
  };
}
export const COUPLE_INTRO = l(
  'Uyum matrisi, iki kişinin matrislerindeki her sayının toplanmasıyla kurulur. Ortaya çıkan sayılar artık ikinizi ayrı ayrı değil, ilişkinizi anlatır: sizi neyin bir araya getirdiği, birlikte neyi güzel yaptığınız ve hangi konuda birlikte çalışmanız gerektiği.',
  'The compatibility matrix is built by adding each number in the two people\'s matrices. The resulting numbers no longer describe you separately but your relationship: what brought you together, what you do well together and what you need to work on together.');

type Facet = 'spark' | 'gift' | 'world' | 'test' | 'love' | 'money' | 'purpose';
/** Her enerjinin, matristeki konumuna göre ilişkideki özel anlamı */
export const FACET: Record<number, Record<Facet, L>> = {
  1: { spark: l('Birbirinizin zekâsına ve hızına vuruldunuz; ilk sohbetten sonra ikiniz de "bu kişiyle bir şeyler yapılır" diye düşündünüz.', 'You fell for each other\'s wit and speed; after the first talk you both thought "I could build something with this person".'),
    gift: l('Birlikte fikir üretir, bir işi sıfırdan başlatırsınız; ortak girişimler size çok yakışır.', 'Together you generate ideas and start things from scratch; joint ventures suit you well.'),
    world: l('Dışarıdan hareketli, girişken ve "her işe koşan" bir çift olarak görünürsünüz.', 'From outside you look like a lively, enterprising couple who jumps at every project.'),
    test: l('Sınavınız sözlerinizle ilgili: kırıcı konuşmamak ve sözünüzün arkasında durmak.', 'Your test is about words: not speaking hurtfully and standing behind what you say.'),
    love: l('Aşkınız sohbet ve flörtle beslenir; konuşmayı bıraktığınız gün kıvılcım söner.', 'Your love is fed by talk and flirting; the day you stop talking, the spark fades.'),
    money: l('Para, yeni başlattığınız işlerden ve fikirlerinizden gelir; ortak bir girişim kazandırır.', 'Money comes from what you start and your ideas; a joint venture pays.'),
    purpose: l('Birbirinize harekete geçme cesareti vermek için bir aradasınız.', 'You are together to give each other the courage to act.') },
  2: { spark: l('İlk anda bir tanıdıklık hissettiniz; sanki birbirinizi önceden biliyormuşsunuz gibi.', 'From the first moment you felt familiar, as if you already knew each other.'),
    gift: l('Birbirinizin sezgilerini güçlendirirsiniz; birlikte doğru kararları hissederek bulursunuz.', 'You strengthen each other\'s intuition; together you feel your way to the right decisions.'),
    world: l('Dışarıdan sakin, kapalı ve biraz gizemli bir çift gibi görünürsünüz; ilişkinizi kolay göstermezsiniz.', 'From outside you look calm, private and a little mysterious; you don\'t show your relationship easily.'),
    test: l('Sınavınız sırlarla ilgili: birbirinizden bir şey saklamadan yakın kalabilmek.', 'Your test is about secrets: staying close without hiding things from each other.'),
    love: l('Aşkınız sessiz anlarda, bakışlarda ve küçük jestlerde yaşanır; gösterişe ihtiyacınız yok.', 'Your love lives in quiet moments, glances and small gestures; you need no show.'),
    money: l('Parayı sessizce ve temkinli yönetirsiniz; ortak birikim sizi güvende hissettirir.', 'You manage money quietly and carefully; shared savings make you feel safe.'),
    purpose: l('Birbirinize iç sesinizi dinlemeyi öğretmek için bir aradasınız.', 'You are together to teach each other to listen to your inner voice.') },
  3: { spark: l('Birbirinizin sıcaklığına ve şefkatine çekildiniz; yanında rahat ettiğiniz biri gibi geldi.', 'You were drawn to each other\'s warmth and tenderness; it felt like someone you could relax with.'),
    gift: l('Birlikte güzel bir ev, bereketli bir sofra ve sıcak bir çevre yaratırsınız.', 'Together you create a beautiful home, a generous table and a warm circle.'),
    world: l('Dışarıdan bakımlı, keyifli ve "her şeyi yolunda" bir çift olarak görünürsünüz.', 'From outside you look well kept, comfortable and like everything is going well.'),
    test: l('Sınavınız denge: biriniz sürekli bakım veren tarafa dönüşmemeli.', 'Your test is balance: neither of you should become the permanent caregiver.'),
    love: l('Aşkı bakımla gösterirsiniz: yemek yapmak, hediye almak, birbirinizi şımartmak.', 'You show love through care: cooking, gifts, pampering each other.'),
    money: l('Para kolay gelir ama kolay harcanır; ev, konfor ve güzel şeylere gider.', 'Money comes easily and goes easily; it goes to home, comfort and beautiful things.'),
    purpose: l('Birlikte bir şeyi büyütmek, yeşertmek için bir aradasınız: bir yuva, bir aile ya da ortak bir eser.', 'You are together to grow something: a home, a family or a shared creation.') },
  4: { spark: l('Birbirinizdeki güvenilirliği gördünüz; "bu insan sözünü tutar" duygusu sizi bağladı.', 'You saw reliability in each other; the feeling that "this person keeps their word" tied you.'),
    gift: l('Birlikte düzen kurar, uzun vadeli planları hayata geçirirsiniz.', 'Together you build order and bring long-term plans to life.'),
    world: l('Dışarıdan ciddi, oturmuş ve güvenilir bir çift olarak görünürsünüz.', 'From outside you look serious, settled and trustworthy.'),
    test: l('Sınavınız kontrol: kimin karar verdiği değil, birlikte nasıl karar verdiğiniz önemli.', 'Your test is control: what matters is not who decides but how you decide together.'),
    love: l('Aşkınız güven ve süreklilikle büyür; heyecandan çok sadakat ön plandadır.', 'Your love grows through trust and continuity; loyalty comes before excitement.'),
    money: l('Parayı planlı yönetirsiniz; ev, mülk ve uzun vadeli yatırım size iyi gelir.', 'You manage money with a plan; property and long-term investment suit you.'),
    purpose: l('Birbirinize sağlam bir zemin vermek için bir aradasınız.', 'You are together to give each other solid ground.') },
  5: { spark: l('Ortak değerleriniz ve birbirinizden öğrenme isteğiniz sizi bir araya getirdi.', 'Shared values and the wish to learn from each other brought you together.'),
    gift: l('Birlikte öğretir, danışmanlık eder, başkalarına yol gösterirsiniz.', 'Together you teach, advise and guide others.'),
    world: l('Dışarıdan geleneklere saygılı, düzgün ve örnek gösterilen bir çift olarak görünürsünüz.', 'From outside you look like a proper, tradition-respecting couple others look up to.'),
    test: l('Sınavınız birbirinizi değiştirmeye çalışmadan kabul etmek.', 'Your test is accepting each other without trying to change one another.'),
    love: l('Aşkınız resmiyet kazandığında güçlenir; nişan, evlilik ve ritüeller sizin için anlamlı.', 'Your love grows stronger once it is official; engagement, marriage and rituals mean a lot to you.'),
    money: l('Para eğitimden, bilgiden ve köklü kurumlardan gelir.', 'Money comes from education, knowledge and established institutions.'),
    purpose: l('Birbirinize kendi inancınızı ve doğrunuzu bulmayı öğretmek için bir aradasınız.', 'You are together to teach each other to find your own beliefs and truth.') },
  6: { spark: l('Güçlü bir fiziksel ve duygusal çekim; birbirinizi gördüğünüz anda seçtiniz.', 'A strong physical and emotional pull; you chose each other the moment you met.'),
    gift: l('Birlikte güzellik yaratırsınız: estetik, tasarım, sanat ya da sadece güzel bir hayat.', 'Together you create beauty: aesthetics, design, art or simply a beautiful life.'),
    world: l('Dışarıdan çok âşık, uyumlu ve göz önünde bir çift olarak görünürsünüz.', 'From outside you look very much in love, harmonious and visible.'),
    test: l('Sınavınız seçim: başka seçeneklere bakmadan birbirinizi her gün yeniden seçmek.', 'Your test is choice: choosing each other again every day without looking elsewhere.'),
    love: l('Aşkınız romantik ve tutkulu; iltifat, dokunuş ve birlikte vakit sizi canlı tutar.', 'Your love is romantic and passionate; compliments, touch and time together keep it alive.'),
    money: l('Para ortaklıklardan ve insan ilişkilerinden gelir; birlikte iş yapmak kazandırır.', 'Money comes from partnerships and people; working together pays off.'),
    purpose: l('Sevmeyi ve sevilmeyi gerçekten öğrenmek için bir aradasınız.', 'You are together to truly learn to love and be loved.') },
  7: { spark: l('Birbirinizin hırsına ve hedeflerine vuruldunuz; ikiniz de bir yere varmak istiyordunuz.', 'You fell for each other\'s drive and goals; you both wanted to get somewhere.'),
    gift: l('Birlikte yol alırsınız: taşınma, seyahat, kariyer atılımı.', 'Together you move forward: moving house, travelling, career leaps.'),
    world: l('Dışarıdan başarılı, hareketli ve hep bir hedefi olan bir çift olarak görünürsünüz.', 'From outside you look successful, on the move and always aiming at something.'),
    test: l('Sınavınız yön: ikinizin hedefi farklılaşırsa ilişki iki ayrı yöne çekilir.', 'Your test is direction: if your goals diverge, the relationship gets pulled two ways.'),
    love: l('Aşkınız birlikte yolculuk ettikçe canlanır; durgunluk sizi sıkar.', 'Your love comes alive as you travel together; stagnation bores you.'),
    money: l('Para çalışarak, hareket ederek ve hedef koyarak gelir; ulaşım, ticaret, seyahat işleri uygun.', 'Money comes from work, movement and goals; transport, trade and travel suit you.'),
    purpose: l('Birbirinizi ileriye taşımak için bir aradasınız.', 'You are together to carry each other forward.') },
  8: { spark: l('Birbirinizin dürüstlüğüne güvendiniz; aranızda hesapsız, net bir başlangıç vardı.', 'You trusted each other\'s honesty; your start was clear and straightforward.'),
    gift: l('Birlikte adil kararlar verir, sorunları akılla çözersiniz.', 'Together you make fair decisions and solve problems with reason.'),
    world: l('Dışarıdan dengeli, mantıklı ve sözüne güvenilen bir çift olarak görünürsünüz.', 'From outside you look balanced, sensible and trustworthy.'),
    test: l('Sınavınız hesap tutmamak: kim ne yaptı diye saymak ilişkiyi mahkemeye çevirir.', 'Your test is not keeping score: counting who did what turns the relationship into a courtroom.'),
    love: l('Aşkınız eşitlik ister; ikiniz de eşit değer gördüğünüzde güçlenir.', 'Your love needs equality; it grows when you both feel equally valued.'),
    money: l('Parayı açık ve adil paylaşmalısınız; hukuk, sözleşme ve resmi işler size kazandırır.', 'Share money openly and fairly; law, contracts and official matters pay off for you.'),
    purpose: l('Birbirinize adaleti ve sorumluluğu öğretmek için bir aradasınız.', 'You are together to teach each other fairness and responsibility.') },
  9: { spark: l('Birbirinizin derinliğine çekildiniz; yüzeysel olmayan biriyle tanışmanın rahatlığı.', 'You were drawn to each other\'s depth; the relief of meeting someone who isn\'t shallow.'),
    gift: l('Birlikte derin düşünür, anlam arar, birbirinize bilgelik katarsınız.', 'Together you think deeply, search for meaning and add wisdom to each other.'),
    world: l('Dışarıdan içine kapanık, sakin ve kendi dünyasında yaşayan bir çift gibi görünürsünüz.', 'From outside you look private, calm and living in your own world.'),
    test: l('Sınavınız yalnızlık: aynı evde yan yana ama ayrı dünyalarda yaşamamak.', 'Your test is solitude: not living side by side in separate worlds.'),
    love: l('Aşkınız sessiz ve derin; uzun sohbetler ve doğada birlikte vakit sizi besler.', 'Your love is quiet and deep; long talks and time in nature nourish you.'),
    money: l('Para bilgi, uzmanlık ve sakin, uzun soluklu işlerden gelir.', 'Money comes from knowledge, expertise and calm, long-term work.'),
    purpose: l('Birlikte hayatın anlamını aramak ve birbirinize iç huzuru öğretmek için bir aradasınız.', 'You are together to search for life\'s meaning and teach each other inner peace.') },
  10: { spark: l('Karşılaşmanız tesadüf gibiydi ama doğru zamanda geldi; şans sizi buluşturdu.', 'Your meeting looked like chance but came at the right time; luck brought you together.'),
    gift: l('Birlikte fırsatları görür ve değerlendirirsiniz; şansınız birlikteyken açılır.', 'Together you spot and seize opportunities; your luck opens when you are together.'),
    world: l('Dışarıdan şanslı ve hayatı hep hareketli bir çift olarak görünürsünüz.', 'From outside you look lucky, with a life always in motion.'),
    test: l('Sınavınız iniş çıkışlar: zor dönemlerde de birbirinizin yanında kalmak.', 'Your test is ups and downs: staying by each other in hard times too.'),
    love: l('Aşkınız dönem dönem tazelenir; birlikte yeni bir şeye başladığınızda yeniden canlanır.', 'Your love renews in cycles; it revives whenever you start something new together.'),
    money: l('Para dalgalı gelir; iyi dönemde biriktirmek, zor dönemi kolaylaştırır.', 'Money comes in waves; saving in good times eases the lean ones.'),
    purpose: l('Birbirinize akışa güvenmeyi öğretmek için bir aradasınız.', 'You are together to teach each other to trust the flow.') },
  11: { spark: l('Birbirinizin gücüne ve tutkusuna vuruldunuz; aranızda yoğun bir çekim vardı.', 'You fell for each other\'s strength and passion; the attraction was intense.'),
    gift: l('Birlikte çok güçlüsünüz; zor işleri ancak ikiniz başarabilirsiniz.', 'Together you are very strong; hard tasks only the two of you can pull off.'),
    world: l('Dışarıdan güçlü, iddialı ve "karşı konulmaz" bir çift olarak görünürsünüz.', 'From outside you look powerful, bold and unstoppable.'),
    test: l('Sınavınız güç: kimin haklı olduğunu değil, birlikte nasıl kazanacağınızı düşünmek.', 'Your test is power: thinking not about who is right but about how you win together.'),
    love: l('Aşkınız tutkulu ve fiziksel; spor ve hareket ilişkinizi canlı tutar.', 'Your love is passionate and physical; sport and movement keep it alive.'),
    money: l('Para emekle, cesaretle ve risk alarak gelir.', 'Money comes through effort, courage and risk-taking.'),
    purpose: l('Birbirinize gücünüzü sevgiyle kullanmayı öğretmek için bir aradasınız.', 'You are together to teach each other to use your strength with love.') },
  12: { spark: l('Birbirinizde farklı bir bakış açısı gördünüz; "bu kişi dünyaya benden başka bakıyor" hissi sizi çekti.', 'You saw a different perspective in each other; the sense that "this person sees the world differently" drew you in.'),
    gift: l('Birlikte başkalarına yardım eder, empatiyle iyileştirirsiniz; gönüllülük ve şefkat işleri size yakışır.', 'Together you help and heal others with empathy; caring and volunteer work suits you.'),
    world: l('Dışarıdan alışılmışın dışında, fedakâr ve biraz anlaşılması zor bir çift gibi görünürsünüz.', 'From outside you look unconventional, self-giving and a little hard to read.'),
    test: l('Sınavınız fedakârlık: biriniz kendini sürekli feda ederse ilişki ağırlaşır.', 'Your test is sacrifice: if one of you keeps giving yourself up, the relationship grows heavy.'),
    love: l('Aşkınız sabır ister; acele etmeden, zamanla derinleşir.', 'Your love needs patience; it deepens over time, without rushing.'),
    money: l('Para yavaş gelir; hızlı kazanç peşinde koşmak yerine anlamlı işlere yönelmek kazandırır.', 'Money comes slowly; meaningful work pays better than chasing quick gains.'),
    purpose: l('Birbirinize hayata başka bir açıdan bakmayı öğretmek için bir aradasınız.', 'You are together to teach each other to see life from another angle.') },
  13: { spark: l('Tanıştığınızda ikinizin de hayatında bir şey bitiyordu; bu ilişki yeni bir sayfa açtı.', 'When you met, something was ending in both your lives; this relationship opened a new page.'),
    gift: l('Birlikte eskiyi bırakıp yeniden başlama gücünüz var; krizden güçlenerek çıkarsınız.', 'Together you have the power to let go and start over; you come out of crises stronger.'),
    world: l('Dışarıdan çok değişen, her yıl başka bir hayat yaşayan bir çift gibi görünürsünüz.', 'From outside you look like a couple who changes a lot, living a different life each year.'),
    test: l('Sınavınız bırakmak: eski alışkanlıklara ve geçmiş ilişkilere tutunmamak.', 'Your test is letting go: not clinging to old habits and past relationships.'),
    love: l('Aşkınız yenilendikçe yaşar; aynı kalırsa söner.', 'Your love lives by renewing itself; if it stays the same, it fades.'),
    money: l('Para dönüşüm işlerinden gelir: yenileme, yeniden yapılandırma, krizi fırsata çevirmek.', 'Money comes from transformation: renovation, restructuring, turning crisis into opportunity.'),
    purpose: l('Birbirinizin dönüşümüne eşlik etmek için bir aradasınız.', 'You are together to accompany each other\'s transformation.') },
  14: { spark: l('Birbirinizin yanında sakinleştiniz; huzur veren bu his sizi bağladı.', 'You calmed down in each other\'s presence; that peaceful feeling bound you.'),
    gift: l('Birlikte uzlaştırır, iyileştirir ve dengelersiniz; arabulucu bir çiftsiniz.', 'Together you reconcile, heal and balance; you are a peacemaking couple.'),
    world: l('Dışarıdan uyumlu, dengeli ve hiç kavga etmeyen bir çift gibi görünürsünüz.', 'From outside you look harmonious, balanced and like you never fight.'),
    test: l('Sınavınız sorunları ertelemek: sükûneti korumak için konuşmamak.', 'Your test is postponing problems: not talking in order to keep the peace.'),
    love: l('Aşkınız yumuşak ve istikrarlı; küçük rutinler ve ortak sakin anlar sizi bağlar.', 'Your love is gentle and steady; small routines and shared calm moments bind you.'),
    money: l('Parayı ölçülü yönetirsiniz; sağlık, iyileştirme ve denge işleri kazandırır.', 'You manage money moderately; health, healing and balance work pays.'),
    purpose: l('Birbirinize denge ve iç huzur öğretmek için bir aradasınız.', 'You are together to teach each other balance and inner peace.') },
  15: { spark: l('Karşı konulmaz bir çekim; mantığınız "dur" dese de birbirinize gittiniz.', 'An irresistible pull; even when reason said stop, you went toward each other.'),
    gift: l('Birlikte etkileyici ve çekicisiniz; ikna, satış ve sahne işlerinde güçlüsünüz.', 'Together you are magnetic; you are strong in persuasion, sales and the stage.'),
    world: l('Dışarıdan çok tutkulu, biraz da kıskanılan bir çift olarak görünürsünüz.', 'From outside you look very passionate and somewhat envied.'),
    test: l('Sınavınız bağımlılık: kıskançlık ve kontrolü sevgiyle karıştırmamak.', 'Your test is dependence: not mistaking jealousy and control for love.'),
    love: l('Aşkınız yoğun ve tutkulu; fiziksel yakınlık ilişkinizin merkezinde.', 'Your love is intense and passionate; physical closeness is at its centre.'),
    money: l('Para hızlı ve büyük gelebilir; lüksü sevmek kadar sınır koymak da önemli.', 'Money can come fast and big; setting limits matters as much as loving luxury.'),
    purpose: l('Birbirinize sevgi ile bağımlılık arasındaki farkı öğretmek için bir aradasınız.', 'You are together to teach each other the difference between love and dependence.') },
  16: { spark: l('Tanışmanız hayatınızı sarstı; ilişkiniz bir anda ve beklenmedik şekilde başladı.', 'Meeting each other shook your lives; it started suddenly and unexpectedly.'),
    gift: l('Birlikte eskiyi yıkıp yenisini kurarsınız; inşaat, tasarım, yeniden yapılanma işleri size uygun.', 'Together you tear down the old and build the new; construction, design and rebuilding suit you.'),
    world: l('Dışarıdan sürprizlerle dolu, "ne yapacakları belli olmaz" bir çift gibi görünürsünüz.', 'From outside you look full of surprises, impossible to predict.'),
    test: l('Sınavınız kriz: ani tartışmalarda köprüleri yakmadan konuşabilmek.', 'Your test is crisis: being able to talk in sudden fights without burning bridges.'),
    love: l('Aşkınız gerçeklikle sınanır; maskeler düştüğünde daha sağlam hâle gelir.', 'Your love is tested by reality; once the masks fall, it grows stronger.'),
    money: l('Para dalgalı olabilir; sağlam bir yedek bütçe ilişkiyi korur.', 'Money can be volatile; a solid reserve protects the relationship.'),
    purpose: l('Birbirinizi sahte olandan kurtarmak için bir aradasınız.', 'You are together to free each other from what is false.') },
  17: { spark: l('Birbirinize umut verdiniz; tanıştığınızda ikiniz de yeniden inanmaya başladınız.', 'You gave each other hope; when you met you both started believing again.'),
    gift: l('Birlikte ilham verirsiniz; sanat, müzik, tasarım ya da sosyal medyada güzel işler çıkarırsınız.', 'Together you inspire; you make beautiful things in art, music, design or social media.'),
    world: l('Dışarıdan ilham veren, "ben de böyle bir ilişki isterim" dedirten bir çift olarak görünürsünüz.', 'From outside you look inspiring, the kind of couple people want to be.'),
    test: l('Sınavınız idealleştirmek: birbirinizi olduğunuz gibi görmek.', 'Your test is idealisation: seeing each other as you really are.'),
    love: l('Aşkınız hayallerle beslenir; birlikte gelecek kurmak sizi bağlar.', 'Your love is fed by dreams; building a future together binds you.'),
    money: l('Para yaratıcı işlerden, sanattan ve görünürlükten gelir.', 'Money comes from creative work, art and visibility.'),
    purpose: l('Birbirinize kendinize inanmayı öğretmek için bir aradasınız.', 'You are together to teach each other to believe in yourselves.') },
  18: { spark: l('Açıklayamadığınız, büyülü bir çekim; neden birbirinizi bu kadar etkilediğinizi bilmiyorsunuz.', 'An inexplicable, magical pull; you don\'t know why you affect each other so much.'),
    gift: l('Birlikte çok sezgiselsiniz; rüya, sanat, psikoloji ve şifa alanında güçlüsünüz.', 'Together you are very intuitive; strong in dreams, art, psychology and healing.'),
    world: l('Dışarıdan gizemli, çözülmesi zor bir çift gibi görünürsünüz.', 'From outside you look mysterious and hard to figure out.'),
    test: l('Sınavınız kuşku: kaygılarınızı birbirinize yansıtmadan açıkça konuşmak.', 'Your test is doubt: talking openly instead of projecting anxieties onto each other.'),
    love: l('Aşkınız duygusal ve romantik; dolunay gecesi kadar büyülü, bazen de kafa karıştırıcı.', 'Your love is emotional and romantic; as magical as a full moon night, sometimes confusing.'),
    money: l('Parada belirsizlik olabilir; net bütçe ve yazılı anlaşmalar sizi korur.', 'Money may feel uncertain; a clear budget and written agreements protect you.'),
    purpose: l('Birbirinize korkularınızla yüzleşmeyi öğretmek için bir aradasınız.', 'You are together to teach each other to face your fears.') },
  19: { spark: l('Birbirinizin neşesine ve ışığına çekildiniz; yanında gülümsediğiniz biri.', 'You were drawn to each other\'s joy and light; someone who makes you smile.'),
    gift: l('Birlikte parlarsınız; çocuklar, eğlence, organizasyon ve sahne işleri size yakışır.', 'Together you shine; children, entertainment, events and the stage suit you.'),
    world: l('Dışarıdan mutlu, enerjik ve herkesin yanında olmak istediği bir çift olarak görünürsünüz.', 'From outside you look happy, energetic, the couple everyone wants to be around.'),
    test: l('Sınavınız ego: ikinizin de parlamasına yer açmak.', 'Your test is ego: making room for both of you to shine.'),
    love: l('Aşkınız oyun ve kahkahayla büyür; birlikte eğlendikçe bağınız güçlenir.', 'Your love grows through play and laughter; the more you have fun, the stronger it gets.'),
    money: l('Para görünürlükten, liderlikten ve insanlarla çalışmaktan gelir.', 'Money comes from visibility, leadership and working with people.'),
    purpose: l('Birbirinize hayattan keyif almayı öğretmek için bir aradasınız.', 'You are together to teach each other to enjoy life.') },
  20: { spark: l('Birbirinizde "aile" hissini buldunuz; tanıdık, sıcak ve köklü bir duygu.', 'You found a sense of "family" in each other; familiar, warm and rooted.'),
    gift: l('Birlikte aileleri birleştirir, geleneği yeniden yorumlarsınız; aile işleri size uygun.', 'Together you join families and reinterpret tradition; family businesses suit you.'),
    world: l('Dışarıdan aile odaklı, güvenilir ve ailelerin onayladığı bir çift olarak görünürsünüz.', 'From outside you look family-focused, reliable and approved by the families.'),
    test: l('Sınavınız aileler: onların beklentileriyle kendi yolunuz arasında denge kurmak.', 'Your test is families: balancing their expectations with your own path.'),
    love: l('Aşkınız ortak geçmiş ve ortak gelecekle büyür; aile kurmak sizin için önemli.', 'Your love grows through shared past and future; building a family matters to you.'),
    money: l('Para aileden, mirastan ya da aile işlerinden gelebilir.', 'Money may come from family, inheritance or family business.'),
    purpose: l('Birbirinizin aile yaralarını iyileştirmek için bir aradasınız.', 'You are together to heal each other\'s family wounds.') },
  21: { spark: l('Birbirinizin özgür ruhuna vuruldunuz; dünyayı birlikte görme isteği.', 'You fell for each other\'s free spirit; the wish to see the world together.'),
    gift: l('Birlikte sınırları aşarsınız; yurt dışı, farklı kültürler ve uluslararası işler size yakışır.', 'Together you cross borders; abroad, other cultures and international work suit you.'),
    world: l('Dışarıdan özgür, gezgin ve kalıplara sığmayan bir çift olarak görünürsünüz.', 'From outside you look free, well-travelled and outside the mould.'),
    test: l('Sınavınız bağlılık: özgürlüğü korurken ortak bir merkez kurmak.', 'Your test is commitment: building a shared centre while keeping your freedom.'),
    love: l('Aşkınız yeni yerler ve yeni deneyimlerle canlanır.', 'Your love comes alive through new places and experiences.'),
    money: l('Para yurt dışıyla, seyahatle ve geniş ağlarla bağlantılı işlerden gelir.', 'Money comes from work tied to abroad, travel and wide networks.'),
    purpose: l('Birbirinizin dünyasını genişletmek için bir aradasınız.', 'You are together to widen each other\'s world.') },
  22: { spark: l('Birbirinizin hafifliğine ve çocuksu neşesine çekildiniz; ilişki bir oyun gibi başladı.', 'You were drawn to each other\'s lightness and childlike joy; it started like a game.'),
    gift: l('Birlikte maceraya atılır, yeni şeyleri ilk deneyenler olursunuz.', 'Together you jump into adventure and are the first to try new things.'),
    world: l('Dışarıdan özgür, eğlenceli ve biraz da sorumsuz görünen bir çift olarak görünürsünüz.', 'From outside you look free, fun and maybe a little carefree.'),
    test: l('Sınavınız sorumluluk: eğlenceyi kaybetmeden geleceği birlikte planlamak.', 'Your test is responsibility: planning the future together without losing the fun.'),
    love: l('Aşkınız kendiliğinden ve hafif; sürprizler ve spontane kaçamaklar sizi canlı tutar.', 'Your love is spontaneous and light; surprises and impromptu getaways keep it alive.'),
    money: l('Para düzensiz gelebilir; küçük bir ortak birikim bu özgürlüğü güvenceye alır.', 'Money may come irregularly; a small shared saving secures this freedom.'),
    purpose: l('Birbirinize hayatı hafife almadan hafif yaşamayı öğretmek için bir aradasınız.', 'You are together to teach each other to live lightly without taking life lightly.') },
};

export const FACET_OF: Record<CouplePos, Facet> = {
  E: 'purpose', A: 'spark', B: 'gift', C: 'world', D: 'test', love: 'love', money: 'money', X: 'love',
  tail1: 'test', tail2: 'test', tail3: 'purpose', talent1: 'gift', talent2: 'gift', personal: 'purpose', social: 'world', spiritual: 'purpose',
};
export const facetText = (pos: CouplePos, n: number): L => FACET[n][FACET_OF[pos]];

const WHERE: Record<CouplePos, L> = {
  E: l('ilişkinizin özünde', 'the core of your relationship'), A: l('sizi birbirinize çeken şeyde', 'what drew you together'), B: l('birlikte açılan yeteneğinizde', 'the gift you share'),
  C: l('dünyaya bakan yüzünüzde', 'the face you show the world'), D: l('birlikte geçmeniz gereken sınavda', 'the test you face together'), love: l('aşkınızın dilinde', 'the language of your love'),
  money: l('ortak paranızda', 'your shared money'), X: l('aşk ile para dengesinde', 'the balance of love and money'), tail1: l('geçmişten gelen düğümde', 'the knot from the past'),
  tail2: l('bu düğümü bugün yaşama biçiminizde', 'how you live that knot today'), tail3: l('düğüm çözüldüğünde varacağınız yerde', 'where you arrive once it is untied'),
  talent1: l('ilişkinin doğal armağanında', 'the relationship\'s natural gift'), talent2: l('birlikte geliştirdiğiniz güçte', 'the power you grow together'),
  personal: l('ilişkinin kişisel amacında', 'the personal purpose of the bond'), social: l('çevrenize kattığınız şeyde', 'what you give others'), spiritual: l('ilişkinin en derin anlamında', 'the deepest meaning of the bond'),
};
const joinTr = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ve ${xs[xs.length - 1]}`;
const joinEn = (xs: string[]) => xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
const lowTr = (s: string) => s.charAt(0).toLocaleLowerCase('tr') + s.slice(1);
const lowEn = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export interface CoupleItem { pos: CouplePos; n: number; text: L; repeat: boolean }
export interface CoupleSection { title: L; items: CoupleItem[] }

export function buildCouple(m: { [k: string]: any }): { summary: L | null; sections: CoupleSection[]; families: L } {
  const plan: { title: L; pos: [CouplePos, number][] }[] = [
    { title: l('İlişkinizin temeli', 'The foundation of your relationship'), pos: [['E', m.E], ['A', m.A], ['B', m.B], ['C', m.C], ['D', m.D]] },
    { title: l('Aşk ve para', 'Love and money'), pos: [['love', m.love], ['money', m.money], ['X', m.X]] },
    { title: l('İlişkinin karmik düğümü', 'The karmic knot of the relationship'), pos: [['tail1', m.D1], ['tail2', m.D2], ['tail3', m.D]] },
    { title: l('Birlikte parladığınız yer', 'Where you shine together'), pos: [['talent1', m.B2], ['talent2', m.B1]] },
    { title: l('Bu ilişkinin amacı', 'The purpose of this relationship'), pos: [['personal', m.personal], ['social', m.social], ['spiritual', m.spiritual]] },
  ];
  const seen = new Map<number, CouplePos[]>();
  const sections: CoupleSection[] = plan.map(sec => ({
    title: sec.title,
    items: sec.pos.map(([pos, n]) => {
      const prev = seen.get(n) ?? [];
      const a = ARCANA[n], c = COUPLE[n], f = facetText(pos, n), p = COUPLE_POS[pos];
      let text: L;
      if (!prev.length) {
        text = {
          tr: `${p.what.tr} Sizde burada ${a.name.tr} var. ${c.bond.tr} ${f.tr} Dikkat etmeniz gereken: ${lowTr(c.risk.tr)} ${c.tip.tr}`,
          en: `${p.what.en} Here you have ${a.name.en}. ${c.bond.en} ${f.en} What to watch: ${lowEn(c.risk.en)} ${c.tip.en}`,
        };
      } else {
        const wTr = joinTr(prev.map(q => WHERE[q].tr)), wEn = joinEn(prev.map(q => WHERE[q].en));
        const first = prev.find(q => FACET_OF[q] !== FACET_OF[pos]) ?? prev[0]; const ff = facetText(first, n);
        const same = FACET_OF[first] === FACET_OF[pos];
        const lead = prev.length >= 2
          ? { tr: `${a.name.tr} bu matriste artık bir tesadüf değil, ilişkinizin omurgası; daha önce ${wTr} karşımıza çıkmıştı.`, en: `${a.name.en} is no coincidence in this matrix any more; it is the backbone of your relationship, having already appeared in ${wEn}.` }
          : { tr: `Burada yine ${a.name.tr} çıkıyor; ${wTr} gördüğümüz enerjinin aynısı.`, en: `${a.name.en} appears here again, the same energy as in ${wEn}.` };
        text = same ? {
          tr: `${p.what.tr} ${lead.tr} Anlamı burada değişmiyor, güçleniyor: ${lowTr(f.tr)} Aynı mesajın iki ayrı yerden gelmesi, bunun ilişkinizin pazarlık edilemez bir parçası olduğunu gösteriyor.`,
          en: `${p.what.en} ${lead.en} Its meaning does not change here, it grows stronger: ${lowEn(f.en)} The same message coming from two places shows it is a non-negotiable part of your relationship.`,
        } : {
          tr: `${p.what.tr} ${lead.tr} ${cap(WHERE[first].tr)} bunun anlamı şuydu: ${lowTr(ff.tr)} ${cap(WHERE[pos].tr)} ise şöyle yaşanıyor: ${lowTr(f.tr)} Yani ${WHERE[first].tr} olan biten, ${WHERE[pos].tr} aynen hissedilir; birini beslediğinizde diğeri de güçlenir, birini ihmal ettiğinizde ikisi birden zayıflar.`,
          en: `${p.what.en} ${lead.en} In ${WHERE[first].en} it meant: ${lowEn(ff.en)} In ${WHERE[pos].en} it plays out like this: ${lowEn(f.en)} So whatever happens in ${WHERE[first].en} is felt just as much in ${WHERE[pos].en}; feed one and the other grows, neglect one and both weaken.`,
        };
      }
      seen.set(n, [...prev, pos]);
      return { pos, n, text, repeat: prev.length > 0 };
    }),
  }));

  // Ana tema: en çok tekrar eden enerjiler
  const top = [...seen.entries()].filter(([, ps]) => ps.length >= 2).sort((x, y) => y[1].length - x[1].length);
  let summary: L | null = null;
  if (top.length) {
    const [n1, p1] = top[0]; const a1 = ARCANA[n1], c1 = COUPLE[n1];
    let tr = `Matrisinizde ${a1.name.tr} enerjisi ${p1.length} kez çıkıyor: ${joinTr(p1.map(q => WHERE[q].tr))}. Bu, ilişkinizin ana temasının ${a1.key.tr} olduğunu gösterir. ${c1.bond.tr} Bu kadar baskın olduğu için riski de büyür: ${lowTr(c1.risk.tr)} ${c1.tip.tr}`;
    let en = `${a1.name.en} appears ${p1.length} times in your matrix: in ${joinEn(p1.map(q => WHERE[q].en))}. This shows the main theme of your relationship is ${a1.key.en}. ${c1.bond.en} Because it dominates, its risk grows too: ${lowEn(c1.risk.en)} ${c1.tip.en}`;
    if (top[1]) {
      const [n2, p2] = top[1]; const a2 = ARCANA[n2], c2 = COUPLE[n2];
      tr += ` İkinci güçlü enerjiniz ${a2.name.tr} (${p2.length} kez: ${joinTr(p2.map(q => WHERE[q].tr))}). ${a1.name.tr} ilişkiye ${a1.key.tr} katarken, ${a2.name.tr} ${a2.key.tr} getiriyor. Bu ikisi birlikte okunduğunda şu ortaya çıkıyor: ${lowTr(c1.bond.tr.split('.')[0])}; buna ${lowTr(c2.bond.tr.split('.')[0])} eşlik ediyor. İkisi dengede kaldığında ilişkiniz en güçlü hâline ulaşır; biri diğerini bastırırsa ${lowTr(c2.risk.tr)}`;
      en += ` Your second strong energy is ${a2.name.en} (${p2.length} times: ${joinEn(p2.map(q => WHERE[q].en))}). While ${a1.name.en} brings ${a1.key.en}, ${a2.name.en} brings ${a2.key.en}. Read together: ${lowEn(c1.bond.en.split('.')[0])}, accompanied by ${lowEn(c2.bond.en.split('.')[0])}. When the two stay balanced, the relationship is at its strongest; if one suppresses the other, ${lowEn(c2.risk.en)}`;
    }
    summary = { tr, en };
  }

  // Aile çizgileri
  const fm = m.male as number, ff = m.female as number;
  const families: L = fm === ff
    ? { tr: `İki ailenizden gelen çizgiler aynı enerjide birleşiyor: ${fm} ${ARCANA[fm].name.tr}. Bu, ailelerinizin ilişkiye benzer bir beklenti ve tarz getirdiğini gösterir. ${FACET[fm].world.tr} Ailelerle ilgili dikkat etmeniz gereken: ${lowTr(COUPLE[fm].risk.tr)}`,
        en: `The lines from both your families meet in the same energy: ${fm} ${ARCANA[fm].name.en}. Your families bring similar expectations and style to the relationship. ${FACET[fm].world.en} Something to watch with families: ${lowEn(COUPLE[fm].risk.en)}` }
    : { tr: `Baba taraflarınızdan gelen çizgi ${fm} ${ARCANA[fm].name.tr}: ${lowTr(FACET[fm].world.tr)} Anne taraflarınızdan gelen çizgi ${ff} ${ARCANA[ff].name.tr}: ${lowTr(FACET[ff].world.tr)} İki farklı aile tarzı ilişkinizde buluşuyor; ${ARCANA[fm].key.tr} ile ${ARCANA[ff].key.tr} arasında orta yolu bulduğunuzda aileler de size destek olur.`,
        en: `The line from your fathers' sides is ${fm} ${ARCANA[fm].name.en}: ${lowEn(FACET[fm].world.en)} The line from your mothers' sides is ${ff} ${ARCANA[ff].name.en}: ${lowEn(FACET[ff].world.en)} Two family styles meet in your relationship; when you find the middle way between ${ARCANA[fm].key.en} and ${ARCANA[ff].key.en}, the families support you too.` };
  return { summary, sections, families };
}
