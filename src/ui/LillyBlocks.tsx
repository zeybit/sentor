import React from 'react';
import { Text, View } from 'react-native';
import type { Chart } from '../engine/astro';
import * as N from '../content/lillyNatal';
import { yearReport } from '../content/lillyYear';
import { BODIES, SIGNS } from '../content/base';
import { Expand, P, Section, Sub, st } from './kit';
import { C, serif } from '../theme';

type Lang = 'tr' | 'en';
const T = {
  tr: {
    title: 'Karakterinin derin katmanları', sub: 'Haritandaki gezegenlerin gücüne ve birbirleriyle ilişkisine bakarak karakterini, zihnini ve hayat alanlarını anlatır.',
    lord: 'Doğum haritanın efendisi', temp: 'Mizacın', tempHow: 'Mizaç, yükselen ve yöneticisi, 1. evdeki gezegenler, Ay ve ona bakan gezegenler, mevsim ve harita efendisinin sıcak–soğuk–nemli–kuru niteliklerini sayarak bulur. Zıt nitelikler birbirini götürür.',
    secondary: 'İkincil eğilim', balanced: 'Nitelikler birbirine çok yakın: dengeli, karma bir mizaç.', table: 'Gezegenlerin güç tablosu', year: 'Bu yılın teması: profeksiyon ve Güneş dönüşü', yearRange: 'Profeksiyon yılın', needsTime: 'Bu bölüm için doğum saati gerekli.',
    note: 'Yorumlar kendini tanıman için yazıldı; kesin hüküm değil, eğilimleri anlatır. Sağlık, ömür ve ölümle ilgili yorum yapılmaz.',
    q: { hot: 'Sıcak', cold: 'Soğuk', moist: 'Nemli', dry: 'Kuru' },
  },
  en: {
    title: 'The deeper layers of your character', sub: 'Looks at how strong each planet is and how they relate, to describe your character, mind and life areas.',
    lord: 'Lord of your chart', temp: 'Your temperament', tempHow: 'Temperament is found by counting the hot, cold, moist and dry qualities of the Ascendant and its ruler, planets in the 1st, the Moon and planets aspecting her, the season and the Lord of the Geniture. Contrary qualities cancel out.',
    secondary: 'Secondary tendency', balanced: 'The qualities are very close: a balanced, mixed temperament.', table: 'Planet strength table', year: 'This year’s theme: profection and solar return', yearRange: 'Your profection year', needsTime: 'This section needs your birth time.',
    note: 'These readings are for self-understanding; they describe tendencies, not fixed verdicts. Nothing is said about health, lifespan or death.',
    q: { hot: 'Hot', cold: 'Cold', moist: 'Moist', dry: 'Dry' },
  },
};

export function SectionView({ sec, lang }: { sec: N.Section | null; lang: 'tr' | 'en' }) {
  if (!sec) return null;
  return (
    <Section title={sec.title[lang]}>
      <Expand more={lang === 'tr' ? 'Tümünü göster' : 'Show all'} less={lang === 'tr' ? 'Daha az göster' : 'Show less'} initial={5} items={sec.items.map((it, i) => (
        <View key={i} style={st.row}>
          {it.label ? <Text style={st.rowLabel}>{it.label[lang]}</Text> : null}
          <P>{it.text[lang]}</P>
        </View>
      ))} />
    </Section>
  );
}


export function LordAndTemperament({ chart, lang }: { chart: Chart; lang: Lang }) {
  const t = T[lang];
  const lord = N.lordOfGeniture(chart);
  const temp = chart.asc !== null ? N.temperament(chart) : null;
  return (
    <>
      <Section title={t.lord}>
        <Text style={{ fontFamily: serif, fontSize: 26, color: C.rose, marginBottom: 6 }}>{BODIES[lord.lord.id].glyph} {BODIES[lord.lord.id].name[lang]}</Text>
        <P>{lord.text[lang]}</P>
      </Section>
      {temp ? (
        <Section title={t.temp}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: C.ink, marginBottom: 4 }}>{N.TEMPERAMENTS[temp.kind].name[lang]}</Text>
          <P>{N.TEMPERAMENTS[temp.kind].desc[lang]}</P>
          {temp.balanced ? <Sub style={{ marginTop: 6 }}>{t.balanced}</Sub> : temp.secondary !== temp.kind ? <Sub style={{ marginTop: 6 }}>{t.secondary}: {N.TEMPERAMENTS[temp.secondary].name[lang]}</Sub> : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {(['hot', 'cold', 'moist', 'dry'] as const).map(q => (
              <View key={q} style={{ flex: 1, alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 8 }}>
                <Text style={{ fontFamily: serif, fontSize: 22, color: q === 'hot' ? C.fire : q === 'cold' ? C.water : q === 'moist' ? C.air : C.earth, fontVariant: ['tabular-nums'] }}>{temp.tally[q]}</Text>
                <Text style={st.sub}>{t.q[q]}</Text>
              </View>
            ))}
          </View>
          <Sub style={{ marginTop: 10 }}>{t.tempHow}</Sub>
          <View style={{ marginTop: 6 }}>
            {temp.rows.map((row, i) => <Text key={i} style={st.sub}>• {row.who[lang]}: {row.q.map(q => t.q[q]).join(', ')}</Text>)}
          </View>
        </Section>
      ) : null}
    </>
  );
}

export function YearCard({ chart, lang }: { chart: Chart; lang: Lang }) {
  const t = T[lang];
  const y = yearReport(chart);
  if (!y) return null;
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Section title={t.year}>
      <Sub style={{ marginBottom: 6 }}>{t.yearRange}: {fmt.format(y.start)} – {fmt.format(y.end)}, {SIGNS[y.profSign][lang]}</Sub>
      {y.lines.map((x, i) => (
        <View key={i} style={st.row}>
          <Text style={st.rowLabel}>{x.label[lang]}</Text>
          <P>{x.text[lang]}</P>
        </View>
      ))}
    </Section>
  );
}

export const LILLY_NOTE = { tr: T.tr.note, en: T.en.note };
