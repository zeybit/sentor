// Harita → doğum haritasının altında: stelyumlar (burç ve ev) ve element dengesi.
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { BodyId, Chart } from '../engine/astro';
import { PLANETS } from '../engine/astro';
import { BODIES, HOUSES, SIGNS, SIGN_GLYPHS, SIGN_KEYWORDS } from '../content/base';
import { stelliums } from '../content/trends';
import { ELEMENT_TYPE, elementProfile } from '../content/explore';
import { C, F } from '../theme';
import { st } from './kit';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const ECOL = () => [C.fire, C.earth, C.air, C.water];

const LOW: { tr: string; en: string }[] = [
  { tr: 'Ateş az: harekete geçmek, kendini öne koymak zor gelebilir; motivasyonu çoğu zaman dışarıda ararsın.', en: 'Little fire: getting started and putting yourself forward can be hard; you often look outside for motivation.' },
  { tr: 'Toprak az: rutin, para ve beden düzeni zorlar; fikirleri somuta dökmek emek ister.', en: 'Little earth: routine, money and body care take effort; turning ideas into results is work.' },
  { tr: 'Hava az: duygularını ya da fikirlerini kelimeye dökmek, olaylara mesafeli bakmak zor olabilir.', en: 'Little air: putting feelings and ideas into words, or stepping back to see objectively, can be hard.' },
  { tr: 'Su az: duygularını fark etmen ve göstermen geç gelir; empatiyi bilinçli olarak çalıştırırsın.', en: 'Little water: you notice and show feelings late; empathy is something you practise on purpose.' },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: F.sansMed, fontSize: 11, letterSpacing: 1.6, color: C.gold, textTransform: 'uppercase' }}>{children}</Text>;
}
function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text accessibilityRole="header" style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 30, color: C.ink }}>{title}</Text>
      <Text style={[st.sub, { marginTop: 2 }]}>{sub}</Text>
    </View>
  );
}
function Planets({ bodies, lang }: { bodies: BodyId[]; lang: Lang }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {bodies.map(b => (
        <View key={b} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 }}>
          <Text style={{ fontSize: 14, color: C.gold }}>{BODIES[b].glyph}</Text>
          <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.ink }}>{BODIES[b].name[lang]}</Text>
        </View>
      ))}
    </View>
  );
}

export function Stelliums({ chart, lang }: { chart: Chart; lang: Lang }) {
  const list = useMemo(() => stelliums(chart), [chart]);
  const signs = list.filter(s => s.kind === 'sign'), houses = list.filter(s => s.kind === 'house');
  const card = (s: (typeof list)[number], i: number) => {
    const isSign = s.kind === 'sign';
    return (
      <View key={i} style={[st.panel, { padding: 16, marginBottom: 10 }]}>
        <Kicker>{isSign ? tx('Burç stelyumu', 'Sign stellium', lang) : tx('Ev stelyumu', 'House stellium', lang)} · {s.bodies.length} {tx('gezegen', 'planets', lang)}</Kicker>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
          {isSign ? <Text style={{ fontSize: 22, color: C.gold }}>{SIGN_GLYPHS[s.idx]}</Text> : null}
          <Text style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 26, color: C.ink, flexShrink: 1 }}>
            {isSign ? tx(`${SIGNS[s.idx].tr} burcunda`, `In ${SIGNS[s.idx].en}`, lang) : HOUSES[s.idx - 1].name[lang]}
          </Text>
        </View>
        <Planets bodies={s.bodies} lang={lang} />
        <Text style={[st.p, { marginTop: 8 }]}>
          {isSign
            ? tx(`${SIGN_KEYWORDS[s.idx].tr} temaları karakterinde baskın. Bu burcun tarzı, Güneş burcundan bile daha belirgin görünebilir; insanlar seni önce bu yanınla tanır.`,
              `${SIGN_KEYWORDS[s.idx].en}: these themes dominate your character. This sign’s style may show even more than your Sun sign; people meet this side of you first.`, lang)
            : tx(`Hayatının ağırlık merkezi burası: ${HOUSES[s.idx - 1].area.tr}. Enerjinin büyük kısmı bu alana akar; önemli olaylar da en çok burada yaşanır.`,
              `This is your life’s centre of gravity: ${HOUSES[s.idx - 1].area.en}. Most of your energy flows here, and key events happen here most.`, lang)}
        </Text>
      </View>
    );
  };
  return (
    <View style={{ marginTop: 22 }}>
      <Head title={tx('Stelyumların', 'Your stelliums', lang)} sub={tx('Aynı burçta ya da aynı evde üç ya da daha fazla gezegen: enerjinin toplandığı yer.', 'Three or more planets in one sign or one house: where your energy gathers.', lang)} />
      {signs.map(card)}
      {houses.map((s, i) => card(s, i + 10))}
      {!list.length ? <Text style={st.p}>{tx('Haritanda stelyum yok. Enerjin tek bir alanda toplanmıyor, hayatın farklı alanlarına dağılıyor; çok yönlü bir yapın var.', 'There is no stellium in your chart. Your energy is spread across many areas rather than gathered in one; you are many-sided.', lang)}</Text> : null}
      {!chart.cusps.length ? <Text style={[st.sub, { marginTop: 4 }]}>{tx('Doğum saatin bilinmediği için ev stelyumlarına bakılamadı.', 'House stelliums need a birth time.', lang)}</Text> : null}
    </View>
  );
}

export function ElementBalance({ chart, lang }: { chart: Chart; lang: Lang }) {
  const e = useMemo(() => elementProfile(chart), [chart]);
  const col = ECOL();
  const by = [0, 1, 2, 3].map(i => PLANETS.filter(p => chart.positions[p].sign % 4 === i));
  const low = e.pct.indexOf(Math.min(...e.pct));
  return (
    <View style={{ marginTop: 26 }}>
      <Head title={tx('Element dengesi', 'Element balance', lang)} sub={tx('Gezegenlerinin ve yükselenin ateş, toprak, hava ve su burçlarına dağılımı. Güneş, Ay ve yükselen daha ağır sayılır.', 'How your planets and Ascendant spread over fire, earth, air and water signs. Sun, Moon and Ascendant weigh more.', lang)} />
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', marginBottom: 14 }}>
        {e.pct.map((v, i) => v > 0 ? <View key={i} style={{ flex: v, backgroundColor: col[i] }} /> : null)}
      </View>
      {e.pct.map((v, i) => (
        <View key={i} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text style={{ fontFamily: i === e.lead ? F.sansBold : F.sansMed, fontWeight: i === e.lead ? '700' : '500', fontSize: 15, color: C.ink }}>
              <Text style={{ color: col[i] }}>● </Text>{ELEMENT_TYPE[i].title[lang]}
            </Text>
            <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: C.ink, fontVariant: ['tabular-nums'] }}>%{v}</Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: C.line, marginTop: 5 }}>
            <View style={{ width: `${v}%`, height: 6, borderRadius: 3, backgroundColor: col[i] }} />
          </View>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, marginTop: 4 }}>
            {by[i].length ? by[i].map(p => `${BODIES[p].glyph} ${BODIES[p].name[lang]}`).join('  ') : tx('Bu elementte gezegen yok', 'No planets here', lang)}
            {chart.asc !== null && Math.floor(chart.asc / 30) % 4 === i ? tx('  · Yükselen', '  · Ascendant', lang) : ''}
          </Text>
        </View>
      ))}
      <View style={{ borderLeftWidth: 3, borderLeftColor: col[e.lead], paddingLeft: 12, marginTop: 6 }}>
        <Text style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 25, color: C.ink }}>{tx(`Baskın element: ${ELEMENT_TYPE[e.lead].title.tr}`, `Dominant element: ${ELEMENT_TYPE[e.lead].title.en}`, lang)}</Text>
        <Text style={[st.p, { marginTop: 4 }]}>{ELEMENT_TYPE[e.lead].text[lang]}</Text>
        {low !== e.lead && e.pct[low] <= 15 ? <Text style={[st.p, { marginTop: 8 }]}>{LOW[low][lang]}</Text> : null}
      </View>
    </View>
  );
}
