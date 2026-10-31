import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { Field, H1, P, Sub, st } from '../ui/kit';
import { C, F } from '../theme';

type G = { t: [string, string]; d: [string, string] };
const TERMS: G[] = [
  { t: ['Doğum haritası', 'Birth chart'], d: ['Doğduğun an ve yerde gökyüzünün fotoğrafı: gezegenlerin hangi burç ve evde olduğu.', 'A snapshot of the sky at the time and place you were born: which sign and house each planet was in.'] },
  { t: ['Yükselen (ASC)', 'Ascendant (ASC)'], d: ['Doğduğun anda doğu ufkunda yükselen burç. İlk izlenimi ve dış görünüşü anlatır; doğru hesap için doğum saati gerekir.', 'The sign rising on the eastern horizon at birth. It describes first impressions and appearance; it needs your birth time.'] },
  { t: ['MC (Tepe noktası)', 'Midheaven (MC)'], d: ['Haritanın en üst noktası; kariyer, hedefler ve toplumdaki yerin.', 'The top of the chart: career, goals and public standing.'] },
  { t: ['Ev', 'House'], d: ['Haritanın 12 hayat alanından biri (para, aile, aşk, iş...). Ev sistemi bu alanların nasıl bölündüğünü belirler; varsayılan Placidus.', 'One of the 12 life areas of the chart (money, family, love, work…). The house system decides how they are divided; Placidus is the default.'] },
  { t: ['Açı', 'Aspect'], d: ['İki gezegen arasındaki belirli açısal mesafe: kavuşum 0°, altmışlık 60°, kare 90°, üçgen 120°, karşıt 180°.', 'A specific angular distance between two planets: conjunction 0°, sextile 60°, square 90°, trine 120°, opposition 180°.'] },
  { t: ['Orb', 'Orb'], d: ['Bir açının tam değerden ne kadar saptığı. Orb ne kadar küçükse etki o kadar güçlü hissedilir.', 'How far an aspect is from exact. The smaller the orb, the stronger it feels.'] },
  { t: ['Retro (geri hareket)', 'Retrograde'], d: ['Dünya’dan bakınca bir gezegenin gökyüzünde geri gidiyor gibi görünmesi. O gezegenin konularında gözden geçirme dönemi sayılır.', 'When a planet appears to move backwards from Earth’s view. Traditionally a time to review that planet’s themes.'] },
  { t: ['Transit', 'Transit'], d: ['Gezegenlerin bugünkü konumlarının doğum haritana yaptığı etkiler.', 'How today’s planets interact with your birth chart.'] },
  { t: ['Progresyon', 'Progression'], d: ['“Bir gün = bir yıl” kuralıyla haritanın ilerletilmesi; iç gelişimini ve olgunlaşmanı gösterir.', 'Advancing the chart by “one day = one year”; shows inner growth and maturing.'] },
  { t: ['Solar Arc', 'Solar Arc'], d: ['Tüm haritanın Güneş’in ilerlediği kadar kaydırılması; önemli olayların zamanlamasında kullanılır.', 'Moving the whole chart by the Sun’s progressed distance; used for timing key events.'] },
  { t: ['Güneş dönüşü', 'Solar return'], d: ['Güneş’in doğduğun dereceye her yıl döndüğü anın haritası; o yılın teması.', 'The chart for the moment the Sun returns to its birth degree each year: that year’s theme.'] },
  { t: ['Sinastri', 'Synastry'], d: ['İki kişinin haritalarının üst üste konup karşılaştırılması.', 'Laying two people’s charts over each other to compare them.'] },
  { t: ['Kompozit harita', 'Composite chart'], d: ['İki haritanın orta noktalarından oluşan, ilişkinin kendisini anlatan tek harita.', 'A single chart made from the midpoints of two charts; it describes the relationship itself.'] },
  { t: ['Davison haritası', 'Davison chart'], d: ['İki kişinin doğum zaman ve yerlerinin ortalamasıyla kurulan gerçek bir gökyüzü haritası.', 'A real sky chart for the average time and place of two births.'] },
  { t: ['Juno', 'Juno'], d: ['Evlilik ve bağlılıkla ilişkilendirilen asteroit; partnerde aradığın bağlılık biçimi.', 'An asteroid linked with marriage and commitment: the kind of commitment you seek.'] },
  { t: ['Lilith', 'Lilith'], d: ['Ay yörüngesinin Dünya’dan en uzak noktası; bastırılmış arzular ve gölge yanlar.', 'The Moon’s orbital point farthest from Earth: suppressed desires and shadow sides.'] },
  { t: ['Kader matrisi', 'Destiny matrix'], d: ['Doğum tarihindeki sayıları 22 Büyük Arkana’ya indirgeyerek kurulan sayısal bir sistem. Astrolojiden ayrıdır; saat ve yer gerektirmez.', 'A numerical system that reduces your birth date to the 22 Major Arcana. It is separate from astrology and needs no time or place.'] },
  { t: ['Karmik kuyruk', 'Karmic tail'], d: ['Matrisin alt kolundaki üç sayı; geçmişten getirildiği kabul edilen ve bu hayatta çözülmesi beklenen tema.', 'The three numbers on the matrix’s lower arm: a theme said to be carried from the past, to be resolved in this life.'] },
  { t: ['Horary (soru haritası)', 'Horary'], d: ['Bir sorunun sorulduğu anın haritasıyla o soruyu cevaplama yöntemi.', 'Answering a question with the chart of the moment it is asked.'] },
];

export default function HelpScreen() {
  const { lang } = useStore();
  const i = lang === 'tr' ? 0 : 1;
  const [q, setQ] = useState('');
  const list = TERMS.filter(x => !q.trim() || (x.t[i] + ' ' + x.d[i]).toLocaleLowerCase(lang).includes(q.trim().toLocaleLowerCase(lang)));
  return (
    <View>
      <H1>{lang === 'tr' ? 'Terimler' : 'Glossary'}</H1>
      <Sub style={{ marginBottom: 16 }}>{lang === 'tr' ? 'Uygulamada geçen kavramların kısa açıklamaları.' : 'Short explanations of the terms used in the app.'}</Sub>
      <Field label="" value={q} onChangeText={setQ} placeholder={lang === 'tr' ? 'Terim ara (ör. orb)' : 'Search (e.g. orb)'} />
      {list.map(x => (
        <View key={x.t[0]} style={st.row}>
          <Text style={{ fontFamily: F.serifBold, fontWeight: '700', fontSize: 19, color: C.ink, marginBottom: 2 }}>{x.t[i]}</Text>
          <P>{x.d[i]}</P>
        </View>
      ))}
      {!list.length ? <P>{lang === 'tr' ? 'Bu aramayla eşleşen terim yok. Daha kısa bir kelime dene.' : 'No term matches. Try a shorter word.'}</P> : null}
      <Sub style={{ marginTop: 24 }}>{lang === 'tr' ? 'Astroloji ve kader matrisi bilimsel kanıta dayanmaz; yorumlar kendini tanıma ve eğlence amaçlıdır.' : 'Astrology and the destiny matrix are not scientifically proven; readings are for self-reflection and fun.'}</Sub>
    </View>
  );
}
