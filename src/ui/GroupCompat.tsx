// Grup uyumu: seçilen kişilerin ikişerli uyum puanları bir ısı haritasında.
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore, Profile } from '../store';
import type { Chart } from '../engine/astro';
import { synastry } from '../content/forecast';
import { SIGNS } from '../content/base';
import { groupSvg } from '../content/shareCards';
import { Chips, P, Section, Sub, st } from './kit';
import { ShareToggle } from './ShareImage';
import { C, F, serif, ELEMENT_COLOR } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const EL_NAME = [{ tr: 'Ateş', en: 'Fire' }, { tr: 'Toprak', en: 'Earth' }, { tr: 'Hava', en: 'Air' }, { tr: 'Su', en: 'Water' }];
const cellCol = (v: number) => (v >= 75 ? C.earth : v >= 60 ? '#7FA650' : v >= 45 ? C.gold : C.fire);

export default function GroupCompat({ onOpenPair }: { onOpenPair: (id: string) => void }) {
  const { people, chartOf, lang, profile } = useStore();
  const [sel, setSel] = useState<string[]>(() => people.slice(0, 6).map(p => p.id));
  const [cell, setCell] = useState<[number, number] | null>(null);
  const group = useMemo(() => people.filter(p => sel.includes(p.id)), [people, sel]);
  const charts = useMemo(() => group.map(p => chartOf(p)), [group]);
  const M = useMemo(() => {
    const n = group.length, m: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = charts[i], b = charts[j];
      if (!a || !b) continue;
      const v = Math.round((synastry(a, b).total + synastry(b, a).total) / 2);
      m[i][j] = m[j][i] = v;
    }
    return m;
  }, [charts]);
  const n = group.length;
  const pairs = useMemo(() => { const out: { i: number; j: number; v: number }[] = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) out.push({ i, j, v: M[i][j] }); return out.sort((a, b) => b.v - a.v); }, [M]);
  const avg = (i: number) => Math.round(M[i].reduce((a, b, k) => a + (k === i ? 0 : b), 0) / Math.max(1, n - 1));
  const glue = n >= 3 ? [...group.keys()].sort((a, b) => avg(b) - avg(a))[0] : -1;
  const elements = useMemo(() => {
    const c = [0, 0, 0, 0];
    charts.forEach((ch: Chart | null) => { if (!ch) return; c[ch.positions.sun.sign % 4] += 2; c[ch.positions.moon.sign % 4] += 2; if (ch.asc !== null) c[Math.floor(ch.asc / 30) % 4] += 1; });
    return c;
  }, [charts]);
  const totalEl = elements.reduce((a, b) => a + b, 0) || 1;
  const nm = (p: Profile) => p.name || p.place;
  const build = useCallback(() => groupSvg(group.map(nm), (i, j) => M[i][j], lang), [group, M, lang]);
  const box = Math.max(44, Math.min(70, 520 / Math.max(1, n)));

  return (
    <View>
      <Section title={tx('Grup uyumu', 'Group harmony', lang)} sub={tx('Arkadaş grubun, ailen ya da iş ekibin: kim kiminle ne kadar uyumlu, tek tabloda. Kişileri Ayarlar’dan ya da “Biriyle uyum” bölümünden ekleyebilirsin.', 'Your friends, family or team: who harmonises with whom, in one grid. Add people in Settings or under “Compatibility”.', lang)}>
        <Text style={st.label}>{tx('Gruptaki kişiler', 'People in the group', lang)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {people.map(p => {
            const on = sel.includes(p.id);
            return (
              <Pressable key={p.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={() => { setCell(null); setSel(s => (on ? s.filter(x => x !== p.id) : [...s, p.id])); }}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: on ? C.ink : C.line, backgroundColor: on ? C.ink : 'transparent' }}>
                <Text style={{ color: on ? C.bg : C.ink, fontFamily: F.sansMed, fontSize: 14 }}>{on ? '✓ ' : ''}{nm(p)}{p.id === profile?.id ? tx(' (sen)', ' (you)', lang) : ''}</Text>
              </Pressable>
            );
          })}
        </View>
        {n < 3 ? <P>{tx('Grup uyumu için en az üç kişi seç. İki kişi için “Biriyle uyum” bölümü daha ayrıntılı.', 'Pick at least three people. For two, “Compatibility” is more detailed.', lang)}</P> : (
          <>
            <View style={{ alignSelf: 'flex-start' }}>
              <View style={{ flexDirection: 'row', marginLeft: 92 }}>
                {group.map((p, j) => <Text key={p.id} numberOfLines={1} style={{ width: box, textAlign: 'center', fontSize: 12, color: C.sub }}>{nm(p).slice(0, 8)}</Text>)}
              </View>
              {group.map((p, i) => (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text numberOfLines={1} style={{ width: 88, marginRight: 4, textAlign: 'right', fontSize: 13, color: C.ink }}>{nm(p)}</Text>
                  {group.map((q, j) => i === j ? <View key={q.id} style={{ width: box - 4, height: box - 4, margin: 2, borderRadius: 10, backgroundColor: C.card }} /> : (
                    <Pressable key={q.id} accessibilityRole="button" accessibilityLabel={`${nm(p)} – ${nm(q)}: %${M[i][j]}`} onPress={() => setCell([i, j])}
                      style={{ width: box - 4, height: box - 4, margin: 2, borderRadius: 10, backgroundColor: cellCol(M[i][j]), alignItems: 'center', justifyContent: 'center', borderWidth: cell && ((cell[0] === i && cell[1] === j) || (cell[0] === j && cell[1] === i)) ? 3 : 0, borderColor: C.ink }}>
                      <Text style={{ color: '#fff', fontFamily: F.sansBold, fontWeight: '700', fontSize: 14 }}>%{M[i][j]}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
            <Sub style={{ marginTop: 6 }}>{tx('Yeşil: çok uyumlu, sarı: dengeli, kırmızı: emek ister. Bir kareye dokun.', 'Green: very harmonious, yellow: balanced, red: needs effort. Tap a square.', lang)}</Sub>
            {cell ? (
              <View style={[st.panel, { marginTop: 10 }]}>
                <Text style={{ fontFamily: serif, fontSize: 20, color: C.ink }}>{nm(group[cell[0]])} & {nm(group[cell[1]])}: %{M[cell[0]][cell[1]]}</Text>
                {[group[cell[0]], group[cell[1]]].some(p => p.id === profile?.id) ? (
                  <Pressable accessibilityRole="button" onPress={() => onOpenPair([group[cell[0]], group[cell[1]]].find(p => p.id !== profile?.id)!.id)} style={{ marginTop: 6 }}>
                    <Text style={{ color: C.rose, fontFamily: F.sansBold, fontWeight: '700' }}>{tx('Ayrıntılı uyumu aç', 'Open detailed compatibility', lang)}</Text>
                  </Pressable>
                ) : <Sub style={{ marginTop: 4 }}>{tx('Ayrıntılı yorum için bu ikiliden birini üstteki kişi seçiciden etkin kişi yap.', 'For a full reading, make one of them the active person from the switcher above.', lang)}</Sub>}
              </View>
            ) : null}

            <View style={{ marginTop: 18, gap: 10 }}>
              <View style={[st.panel, { borderLeftWidth: 3, borderLeftColor: C.earth }]}>
                <Text style={st.sub}>{tx('En uyumlu ikili', 'Most harmonious pair', lang)}</Text>
                <Text style={{ fontFamily: serif, fontSize: 20, color: C.ink }}>{nm(group[pairs[0].i])} & {nm(group[pairs[0].j])} · %{pairs[0].v}</Text>
              </View>
              <View style={[st.panel, { borderLeftWidth: 3, borderLeftColor: C.fire }]}>
                <Text style={st.sub}>{tx('En çok emek isteyen ikili', 'Pair needing most effort', lang)}</Text>
                <Text style={{ fontFamily: serif, fontSize: 20, color: C.ink }}>{nm(group[pairs[pairs.length - 1].i])} & {nm(group[pairs[pairs.length - 1].j])} · %{pairs[pairs.length - 1].v}</Text>
              </View>
              {glue >= 0 ? (
                <View style={[st.panel, { borderLeftWidth: 3, borderLeftColor: C.gold }]}>
                  <Text style={st.sub}>{tx('Grubun yapıştırıcısı', 'The group’s glue', lang)}</Text>
                  <Text style={{ fontFamily: serif, fontSize: 20, color: C.ink }}>{nm(group[glue])} · {tx('ortalama', 'average', lang)} %{avg(glue)}</Text>
                  <Sub>{tx('Herkesle ortalama en yüksek uyuma sahip kişi; grubu bir arada tutan, arabulucu rolü ona yakışır.', 'The person with the highest average harmony; the natural mediator who keeps the group together.', lang)}</Sub>
                </View>
              ) : null}
            </View>

            <Text style={[st.rowLabel, { marginTop: 18 }]}>{tx('Grubun element dengesi', 'The group’s element balance', lang)}</Text>
            <View style={{ flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden', marginTop: 6 }}>
              {elements.map((v, i) => v ? <View key={i} style={{ flex: v, backgroundColor: ELEMENT_COLOR[i] }} /> : null)}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 6 }}>
              {elements.map((v, i) => <Text key={i} style={{ fontSize: 13, color: C.ink }}><Text style={{ color: ELEMENT_COLOR[i] }}>● </Text>{EL_NAME[i][lang]} %{Math.round((v / totalEl) * 100)}</Text>)}
            </View>
            <P style={{ marginTop: 8 }}>{(() => {
              const max = elements.indexOf(Math.max(...elements)), min = elements.indexOf(Math.min(...elements));
              const A = [tx('enerjik, cesur ve hızlı karar veren', 'energetic, bold and quick to decide', lang), tx('sakin, pratik ve güvenilir', 'calm, practical and reliable', lang), tx('konuşkan, fikir üreten ve sosyal', 'talkative, idea-rich and social', lang), tx('duygusal, sezgisel ve birbirini kollayan', 'emotional, intuitive and protective', lang)];
              const B = [tx('cesaret ve harekete geçme', 'courage and getting things moving', lang), tx('plan yapma ve işi bitirme', 'planning and finishing', lang), tx('konuşup netleştirme', 'talking things through', lang), tx('duyguları dile getirme', 'voicing feelings', lang)];
              return tx(`Bu grup ağırlıklı olarak ${EL_NAME[max].tr.toLocaleLowerCase('tr')} enerjisi taşıyor: ${A[max]} bir ekip. En az ${EL_NAME[min].tr.toLocaleLowerCase('tr')} var; ${B[min]} konusunda birbirinize bilinçli olarak destek olmanız iyi gelir.`,
                `This group is mostly ${EL_NAME[max].en.toLowerCase()}: a ${A[max]} team. ${EL_NAME[min].en} is weakest; consciously support each other in ${B[min]}.`, lang);
            })()}</P>
            <ShareToggle label={tx('Grup kartınız', 'Your group card', lang)} build={build} filename="grup-uyumu.png" lang={lang} />
          </>
        )}
      </Section>
    </View>
  );
}
void SIGNS;
