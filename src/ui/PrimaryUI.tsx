// Drakonik harita yorumu ve primer direksiyon listesi
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { Chart } from '../engine/astro';
import { primaryDirections, draconicContacts, DPt } from '../engine/primary';
import { BODIES, SIGNS, SIGN_KEYWORDS } from '../content/base';
import { placementText } from '../content/placements';
import { ANGLE_NAME, pdText, PD_NOTE, DRACONIC_CORE, draconicContactText } from '../content/progTexts';
import { More, Section, Sub, st } from './kit';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const ptName = (k: DPt, lang: Lang) => k === 'asc' ? tx('Yükselen', 'Ascendant', lang) : k === 'mc' ? 'MC' : k === 'dsc' ? tx('Alçalan', 'Descendant', lang) : k === 'ic' ? 'IC' : BODIES[k].name[lang];
const firstSentences = (t: string, n: number) => (t.match(/[^.!?]+[.!?]+/g) ?? [t]).slice(0, n).map(x => x.trim()).join(' ');

export function DraconicReading({ natal, dr, lang }: { natal: Chart; dr: Chart; lang: Lang }) {
  const contacts = useMemo(() => draconicContacts(natal, dr), [natal, dr]);
  const core: { k: 'sun' | 'moon' | 'asc'; sign: number }[] = [
    { k: 'sun', sign: dr.positions.sun.sign }, { k: 'moon', sign: dr.positions.moon.sign },
    ...(dr.asc !== null ? [{ k: 'asc' as const, sign: Math.floor(dr.asc / 30) }] : []),
  ];
  return (
    <View>
      <Section title={tx('Ruhunun burçları', 'Your soul’s signs', lang)} sub={tx('Drakonik haritada bütün gezegenler, Kuzey Ay Düğümü 0° Koç olacak şekilde kaydırılır. Doğum haritan bu hayattaki kişiliğini anlatırken drakonik harita ruhunun getirdiği özü, “neden buradayım” sorusunu anlatır. Doğum haritandan farklı çıkan burçlar, içinde taşıdığın ama dışarıdan görünmeyen yanlardır.', 'In the draconic chart every planet is shifted so the North Node sits at 0° Aries. Your birth chart describes this life’s personality; the draconic chart describes the essence your soul brings, the “why am I here”. Signs that differ from your birth chart are sides you carry inside but rarely show.', lang)}>
        {core.map(c => {
          const natalSign = c.k === 'asc' ? Math.floor(natal.asc! / 30) : natal.positions[c.k].sign;
          const same = natalSign === c.sign;
          const body = c.k === 'asc' ? SIGN_KEYWORDS[c.sign][lang] : firstSentences(placementText(c.k, c.sign)[lang], 2);
          return (
            <View key={c.k} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold }}>{DRACONIC_CORE[c.k][lang]} · {ptName(c.k, lang)} {SIGNS[c.sign][lang]}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 2 }}>{body}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, marginTop: 2 }}>
                {same ? tx('Doğum haritandaki burçla aynı: ruhunla kişiliğin bu konuda uyumlu.', 'Same as your birth chart: soul and personality agree here.', lang)
                  : tx(`Doğum haritanda ${SIGNS[natalSign].tr}: dışarıya ${SIGNS[natalSign].tr} gibi görünsen de içinde ${SIGNS[c.sign].tr} bir öz taşıyorsun.`, `Birth chart: ${SIGNS[natalSign].en}. You may look ${SIGNS[natalSign].en} outside, but you carry a ${SIGNS[c.sign].en} essence within.`, lang)}
              </Text>
            </View>
          );
        })}
      </Section>
      <Section title={tx('Ruhun ile bu hayatın buluştuğu noktalar', 'Where your soul meets this life', lang)} sub={tx('Drakonik bir noktanın doğum haritandaki bir noktaya 1,5 dereceden yakın düşmesi en güçlü drakonik işarettir. Bu alanlar sana “tanıdık”, kaderle ilgili gelir.', 'A draconic point falling within 1.5° of a birth chart point is the strongest draconic signature. These areas feel familiar and fated to you.', lang)}>
        {contacts.length ? contacts.map((x, i) => (
          <View key={i} style={{ paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold }}>{tx('Drakonik', 'Draconic', lang)} {ptName(x.a, lang)} → {tx('doğum', 'natal', lang)} {ptName(x.b, lang)} ({x.orb.toFixed(1)}°)</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink, marginTop: 2 }}>{draconicContactText(x.a, x.b)[lang]}</Text>
          </View>
        )) : <Text style={st.p}>{tx('Drakonik noktaların doğum haritanla sıkı bir kavuşum yapmıyor: ruhunun teması ile bu hayattaki kişiliğin birbirinden bağımsız, kendi yolunu çizen bir yapıdasın.', 'No tight draconic–natal conjunctions: your soul’s theme and this life’s personality run independently.', lang)}</Text>}
      </Section>
    </View>
  );
}

export function PrimaryList({ natal, lang }: { natal: Chart; lang: Lang }) {
  const list = useMemo(() => primaryDirections(natal), [natal]);
  if (!natal.input.timeKnown || natal.asc === null) return (
    <Section title={tx('Primer direksiyonlar', 'Primary directions', lang)}>
      <Text style={st.p}>{tx('Primer direksiyonlar için doğum saati gerekir; saat 4 dakika kayarsa tarihler bir yıl kayar. Doğum saatini ekle ya da Saat düzeltme bölümünden yaklaşık saatini bul.', 'Primary directions need a birth time; a 4-minute error shifts dates by a year. Add your birth time or estimate it under Rectification.', lang)}</Text>
    </Section>
  );
  const now = Date.now();
  const fmt = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
  const row = (d: (typeof list)[number], i: number) => {
    const past = d.date.getTime() < now;
    return (
      <View key={i} style={{ flexDirection: 'row', gap: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line, opacity: past ? 0.7 : 1 }}>
        <View style={{ width: 92 }}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 26, color: past ? C.sub : C.gold }}>{d.age.toFixed(1)}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{tx('yaş', 'age', lang)} · {fmt(d.date)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink }}>{BODIES[d.prom].name[lang]} → {ANGLE_NAME[d.angle][lang]}{past ? tx('  · geçmiş', '  · past', lang) : ''}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink, marginTop: 2 }}>{pdText(d.prom, d.angle)[lang].split('. ').slice(1).join('. ') || pdText(d.prom, d.angle)[lang]}</Text>
        </View>
      </View>
    );
  };
  const upcoming = list.filter(d => d.date.getTime() >= now), past = list.filter(d => d.date.getTime() < now);
  return (
    <View>
      <Section title={tx('Önündeki primer direksiyonlar', 'Your coming primary directions', lang)} sub={tx('Doğduğun günün gökyüzü, doğumundan sonraki saatlerde dönmeye devam eder; gezegenler sırayla haritanın dört köşesine ulaşır. Dönen her derece hayatının yaklaşık bir yılıdır (Naibod anahtarı). Batlamyus’tan beri hayatın büyük olaylarını zamanlamak için kullanılan en eski tekniktir.', 'After your birth the sky keeps turning; planets reach the four angles of your chart one by one. Each degree turned is about a year of life (Naibod key). Since Ptolemy it has been the oldest technique for timing major life events.', lang)}>
        {upcoming.length ? upcoming.slice(0, 6).map(row) : <Text style={st.p}>{tx('Hesaplanan aralıkta yeni bir direksiyon yok.', 'No further directions in range.', lang)}</Text>}
        {upcoming.length > 6 ? <More count={upcoming.length - 6}>{upcoming.slice(6).map((d, i) => row(d, i + 6))}</More> : null}
        <Sub style={{ marginTop: 10 }}>{PD_NOTE[lang]}</Sub>
      </Section>
      {past.length ? (
        <Section title={tx('Geçmişte yaşadıkların', 'Already behind you', lang)} sub={tx('Bu yaşlarda hayatında belirgin bir olay olduysa doğum saatin büyük ihtimalle doğrudur; olmadıysa saat birkaç dakika kayık olabilir.', 'If something notable happened at these ages, your birth time is probably right; if not, it may be off by a few minutes.', lang)}>
          {past.slice(-3).map(row)}
          {past.length > 3 ? <More count={past.length - 3}>{past.slice(0, -3).map((d, i) => row(d, 100 + i))}</More> : null}
        </Section>
      ) : null}
    </View>
  );
}
