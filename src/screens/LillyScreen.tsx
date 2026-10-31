import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import * as N from '../content/lillyNatal';
import { yearReport } from '../content/lillyYear';
import { BODIES, SIGNS } from '../content/base';
import LillyTable from '../ui/LillyTable';
import { Expand, H1, P, Section, Sub, st } from '../ui/kit';
import { C, serif } from '../theme';

const T = {
  tr: {
    title: 'Lilly Analizi', sub: 'William Lilly, Christian Astrology (1647), 3. Kitap: “Doğum Haritalarına Giriş”. Lilly’nin kendi karar sıralarıyla, adım adım.',
    lord: 'Doğum haritasının efendisi (Bölüm CV)', temp: 'Mizaç (Bölüm CVI)', tempHow: 'Lilly mizacı yükselen ve yöneticisi, 1. evdeki gezegenler, Ay ve ona bakan gezegenler, mevsim ve harita efendisinin sıcak–soğuk–nemli–kuru niteliklerini sayarak bulur. Zıt nitelikler birbirini götürür.',
    secondary: 'İkincil eğilim', balanced: 'Nitelikler birbirine çok yakın: dengeli, karma bir mizaç.', table: 'Lilly güç tablosu (Kitap I, s. 115)', year: 'Bu yıl: profeksiyon ve Güneş dönüşü (Bölüm CLXVI–CLXVIII)', yearRange: 'Profeksiyon yılın', needsTime: 'Bu bölüm için doğum saati gerekli.',
    note: 'Lilly’nin metinleri 17. yüzyıl diliyle yazılmıştır; burada bugünün diline, cinsiyetsiz ve saygılı bir biçimde uyarlanmıştır. Ömür, ölüm ve hastalık hükümleri bilinçli olarak dahil edilmemiştir.',
    q: { hot: 'Sıcak', cold: 'Soğuk', moist: 'Nemli', dry: 'Kuru' },
  },
  en: {
    title: 'Lilly Reading', sub: 'William Lilly, Christian Astrology (1647), Book III: “An Introduction to Nativities”, following Lilly’s own order of judgment, step by step.',
    lord: 'Lord of the Geniture (Ch. CV)', temp: 'Temperament (Ch. CVI)', tempHow: 'Lilly finds the temperament by counting the hot, cold, moist and dry qualities of the Ascendant and its ruler, planets in the 1st, the Moon and planets aspecting her, the season and the Lord of the Geniture. Contrary qualities cancel out.',
    secondary: 'Secondary tendency', balanced: 'The qualities are very close: a balanced, mixed temperament.', table: 'Lilly’s table of fortitudes (Book I, p. 115)', year: 'This year: profection and solar return (Ch. CLXVI–CLXVIII)', yearRange: 'Your profection year', needsTime: 'This section needs your birth time.',
    note: 'Lilly wrote in 17th-century English; his judgments are adapted here into today’s language, gender-neutral and respectful. Judgments about lifespan, death and disease are deliberately excluded.',
    q: { hot: 'Hot', cold: 'Cold', moist: 'Moist', dry: 'Dry' },
  },
};

function SectionView({ sec, lang }: { sec: N.Section | null; lang: 'tr' | 'en' }) {
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

export default function LillyScreen() {
  const { chart, lang } = useStore();
  const t = T[lang];
  const r = useMemo(() => {
    if (!chart) return null;
    return {
      lord: N.lordOfGeniture(chart), temp: chart.asc !== null ? N.temperament(chart) : null,
      manners: N.manners(chart), wit: N.wit(chart), wealth: N.wealth(chart), marriage: N.marriage(chart),
      profession: N.profession(chart), travel: N.travel(chart), friends: N.friends(chart), year: yearReport(chart),
    };
  }, [chart]);
  if (!chart || !r) return null;
  const fmt = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View>
      <H1>{t.title}</H1>
      <Sub style={{ marginBottom: 14 }}>{t.sub}</Sub>

      <Section title={t.lord}>
        <Text style={{ fontFamily: serif, fontSize: 30, color: C.rose, marginBottom: 6 }}>{BODIES[r.lord.lord.id].glyph} {BODIES[r.lord.lord.id].name[lang]}</Text>
        <P>{r.lord.text[lang]}</P>
      </Section>

      {r.temp ? (
        <Section title={t.temp}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: C.ink, marginBottom: 4 }}>{N.TEMPERAMENTS[r.temp.kind].name[lang]}</Text>
          <P>{N.TEMPERAMENTS[r.temp.kind].desc[lang]}</P>
          {r.temp.balanced ? <Sub style={{ marginTop: 6 }}>{t.balanced}</Sub> : r.temp.secondary !== r.temp.kind ? <Sub style={{ marginTop: 6 }}>{t.secondary}: {N.TEMPERAMENTS[r.temp.secondary].name[lang]}</Sub> : null}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            {(['hot', 'cold', 'moist', 'dry'] as const).map(q => (
              <View key={q} style={{ flex: 1, alignItems: 'center', backgroundColor: C.bg, borderRadius: 12, paddingVertical: 8 }}>
                <Text style={{ fontFamily: serif, fontSize: 22, color: q === 'hot' ? C.fire : q === 'cold' ? C.water : q === 'moist' ? C.air : C.earth, fontVariant: ['tabular-nums'] }}>{r.temp!.tally[q]}</Text>
                <Text style={st.sub}>{t.q[q]}</Text>
              </View>
            ))}
          </View>
          <Sub style={{ marginTop: 10 }}>{t.tempHow}</Sub>
          <View style={{ marginTop: 6 }}>
            {r.temp.rows.map((row, i) => <Text key={i} style={st.sub}>• {row.who[lang]}: {row.q.map(q => t.q[q]).join(', ')}</Text>)}
          </View>
        </Section>
      ) : <Section title={t.temp}><P>{t.needsTime}</P></Section>}

      <SectionView sec={r.manners} lang={lang} />
      <SectionView sec={r.wit} lang={lang} />
      {r.wealth ? <SectionView sec={r.wealth} lang={lang} /> : null}
      {r.marriage ? <SectionView sec={r.marriage} lang={lang} /> : null}
      <SectionView sec={r.profession} lang={lang} />
      {r.travel ? <SectionView sec={r.travel} lang={lang} /> : null}
      {r.friends ? <SectionView sec={r.friends} lang={lang} /> : null}

      {r.year ? (
        <Section title={t.year}>
          <Sub style={{ marginBottom: 6 }}>{t.yearRange}: {fmt.format(r.year.start)} – {fmt.format(r.year.end)} · {SIGNS[r.year.profSign][lang]}</Sub>
          {r.year.lines.map((x, i) => (
            <View key={i} style={st.row}>
              <Text style={st.rowLabel}>{x.label[lang]}</Text>
              <P>{x.text[lang]}</P>
            </View>
          ))}
        </Section>
      ) : null}

      <Section title={t.table}>
        <LillyTable chart={chart} lang={lang} />
      </Section>

      <Sub style={{ marginBottom: 20 }}>{t.note}</Sub>
    </View>
  );
}
