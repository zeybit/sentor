// "Seni anlatan cümleler": kategorilere ayrılmış, haritadan çıkan somut davranış cümleleri ve "tuttu / tutmadı" geri bildirimi
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Chart } from '../engine/astro';
import { mirrorLines, MIRROR_CATS, MirrorCat, MirrorLine } from '../content/mirror';
import { Chips, More, Sub, st } from './kit';
import { C, F } from '../theme';
import { useStore } from '../store';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);

export default function Mirror({ chart, lang, personId, only }: { chart: Chart; lang: Lang; personId?: string; only?: MirrorCat }) {
  const { profile } = useStore();
  const all = useMemo(() => mirrorLines(chart), [chart]);
  const cats = MIRROR_CATS.filter(c => all.some(x => x.cat === c.key));
  const [cat, setCat] = useState<MirrorCat>(only ?? cats[0]?.key ?? 'self');
  const key = `mirror.v1.${personId ?? profile?.id ?? 'me'}`;
  const [fb, setFb] = useState<Record<string, 1 | 0>>({});
  useEffect(() => { AsyncStorage.getItem(key).then(v => { try { setFb(v ? JSON.parse(v) : {}); } catch { setFb({}); } }).catch(() => {}); }, [key]);
  const vote = (id: string, v: 1 | 0) => {
    const next = { ...fb };
    if (next[id] === v) delete next[id]; else next[id] = v;
    setFb(next);
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  };
  if (!all.length) return null;
  const list = all.filter(x => x.cat === (only ?? cat));
  const voted = Object.keys(fb).filter(id => all.some(x => x.id === id));
  const hits = voted.filter(id => fb[id] === 1).length;

  const line = (x: MirrorLine) => (
    <View key={x.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderTopColor: C.line }}>
      <Text style={{ fontFamily: F.serif, fontSize: 19, lineHeight: 27, color: C.ink }}>{x.text[lang]}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
        <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, flexShrink: 1 }}>{tx('Neden: ', 'Why: ', lang)}{x.why[lang]}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {([[1, tx('Tuttu', 'So me', lang)], [0, tx('Tutmadı', 'Not me', lang)]] as const).map(([v, label]) => {
            const on = fb[x.id] === v;
            return (
              <Pressable key={v} onPress={() => vote(x.id, v)} accessibilityRole="button" accessibilityState={{ selected: on }}
                style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4, borderWidth: 1, borderColor: on ? (v ? C.rose : C.sub) : C.line, backgroundColor: on && v ? C.rose : 'transparent' }}>
                <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: on && v ? C.onAccent : on ? C.ink : C.sub }}>{v ? '✓ ' : ''}{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[st.panel, { marginBottom: 36 }]} {...({ dataSet: { lift: '1' } } as any)}>
      <Text style={[st.rowLabel, { marginBottom: 6 }]}>{tx('Kendini bul', 'Find yourself', lang)}</Text>
      <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 30, color: C.ink, marginBottom: 4 }}>{only === 'love' ? tx('Aşkta seni anlatan cümleler', 'Lines that describe you in love', lang) : tx('Seni anlatan cümleler', 'Lines that describe you', lang)}</Text>
      <Sub style={{ marginBottom: 10 }}>{tx('Tek tek “şu konum şu demek” yerine, haritandaki birleşimlerden çıkan somut cümleler. Her birinin altında haritanın neresinden geldiği yazar. Okurken “Tuttu” ya da “Tutmadı” diye işaretle; kaçının sende tuttuğunu görürsün.', 'Not “this placement means that”, but concrete lines drawn from combinations in your chart, each showing where it comes from. Mark “So me” or “Not me” as you read and see how many fit.', lang)}</Sub>
      {only ? null : <Chips items={cats.map(c => ({ key: c.key, label: `${c.label[lang]} (${all.filter(x => x.cat === c.key).length})` }))} value={cat} onChange={v => setCat(v)} />}
      {list.slice(0, 5).map(line)}
      {list.length > 5 ? <More count={list.length - 5}>{list.slice(5).map(line)}</More> : null}
      {voted.length ? <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: C.gold, marginTop: 10 }}>{tx(`İşaretlediğin ${voted.length} cümleden ${hits} tanesi sende tuttu.`, `${hits} of the ${voted.length} lines you marked fit you.`, lang)}</Text> : null}
    </View>
  );
}
