import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Chart } from '../engine/astro';
import { CLASSICAL, lillyScore, mannersFor } from '../content/lillyDignity';
import { BODIES, SIGNS } from '../content/base';
import type { Lang } from '../content/base';
import { P, Sub, st } from './kit';
import { C, serif } from '../theme';

const T = {
  tr: { intro: 'Lilly’nin “güç ve zayıflık” tablosuna göre her gezegenin puanı. Esas onurlar gezegenin burçtaki doğal gücünü, ilineksel durumlar ise haritadaki etkinliğini gösterir. En yüksek puanlı gezegen hayatında en rahat kullandığın enerjidir.', ess: 'Esas', acc: 'İlineksel', total: 'Toplam', strongest: 'En güçlü gezegenin', manners: 'Lilly’ye göre karakter', tap: 'Ayrıntı için dokun' },
  en: { intro: 'Each planet’s score by Lilly’s table of fortitudes and debilities. Essential dignities show a planet’s natural strength by sign; accidental conditions show how active it is in the chart. The highest-scoring planet is the energy you use most easily.', ess: 'Essential', acc: 'Accidental', total: 'Total', strongest: 'Your strongest planet', manners: 'Character per Lilly', tap: 'Tap for details' },
};

export default function LillyTable({ chart, lang }: { chart: Chart; lang: Lang }) {
  const t = T[lang];
  const scores = useMemo(() => CLASSICAL.map(id => lillyScore(chart, id)), [chart]);
  const best = [...scores].sort((a, b) => b.total - a.total)[0];
  const [open, setOpen] = useState<string | null>(best.id);
  const max = Math.max(...scores.map(s => Math.abs(s.total)), 10);

  return (
    <View>
      <Sub style={{ marginBottom: 10 }}>{t.intro}</Sub>
      <Text style={{ fontFamily: serif, fontSize: 17, color: C.ink, marginBottom: 8 }}>
        {t.strongest}: {BODIES[best.id].glyph} {BODIES[best.id].name[lang]} ({best.total > 0 ? '+' : ''}{best.total})
      </Text>
      {scores.map(s => {
        const p = chart.positions[s.id];
        const isOpen = open === s.id;
        const m = mannersFor(s);
        return (
          <View key={s.id} style={st.row}>
            <Pressable onPress={() => setOpen(isOpen ? null : s.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ width: 110, fontSize: 15, color: C.ink }}>{BODIES[s.id].glyph} {BODIES[s.id].name[lang]}</Text>
                <View style={{ flex: 1, height: 10, flexDirection: 'row' }}>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {s.total < 0 ? <View style={{ width: `${(Math.abs(s.total) / max) * 100}%`, height: 10, borderRadius: 5, backgroundColor: C.rose }} /> : null}
                  </View>
                  <View style={{ width: 1, backgroundColor: C.sub }} />
                  <View style={{ flex: 1 }}>
                    {s.total > 0 ? <View style={{ width: `${(s.total / max) * 100}%`, height: 10, borderRadius: 5, backgroundColor: C.earth }} /> : null}
                  </View>
                </View>
                <Text style={{ width: 34, textAlign: 'right', fontWeight: '700', color: s.total >= 0 ? C.earth : C.rose, fontVariant: ['tabular-nums'] }}>{s.total > 0 ? '+' : ''}{s.total}</Text>
              </View>
              <Text style={[st.sub, { marginTop: 2 }]}>{SIGNS[p.sign][lang]}{p.house ? ` · ${p.house}.` : ''} · {t.ess} {s.essTotal >= 0 ? '+' : ''}{s.essTotal} · {t.acc} {s.accTotal >= 0 ? '+' : ''}{s.accTotal}{!isOpen ? ` · ${t.tap}` : ''}</Text>
            </Pressable>
            {isOpen ? (
              <View style={{ marginTop: 8, gap: 2 }}>
                {[...s.essential, ...s.accidental].map((x, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={st.sub}>{x.label[lang]}</Text>
                    <Text style={[st.sub, { color: x.pts >= 0 ? C.earth : C.rose, fontVariant: ['tabular-nums'] }]}>{x.pts > 0 ? '+' : ''}{x.pts}</Text>
                  </View>
                ))}
                <Text style={[st.rowLabel, { marginTop: 8 }]}>{t.manners}</Text>
                <P>{m.text[lang]}</P>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
