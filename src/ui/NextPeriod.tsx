import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore } from '../store';
import { useNav } from '../nav';
import { lifeTimeline, Window } from '../engine/timeline';
import { TOPIC_INFO, fmtRange } from '../screens/FutureScreen';
import { C, F } from '../theme';
import { st } from './kit';

/** Bugün ekranında hayat takvimine kısa yol: sıradaki önemli dönem */
export default function NextPeriod() {
  const { chart, lang } = useStore();
  const nav = useNav();
  const [next, setNext] = useState<Window[] | null>(null);
  useEffect(() => {
    if (!chart) return;
    const id = setTimeout(() => {
      const now = new Date();
      const all = lifeTimeline(chart, { fromAge: 16, toAge: 75 }).filter(w => w.end > now);
      setNext(all.slice(0, 3));
    }, 60);
    return () => clearTimeout(id);
  }, [chart]);
  if (!next || !next.length) return null;
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  return (
    <Pressable onPress={() => nav('chart:timeline')} accessibilityRole="link" accessibilityLabel={L('Hayat takvimini aç', 'Open life calendar')}
      style={({ hovered }: any) => [st.panel, { marginBottom: 32 }, hovered && { borderColor: C.sub }]}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 4 }}>{L('Hayat takvimin', 'Your life calendar')}</Text>
      <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginBottom: 8 }}>{L('Sıradaki önemli dönemlerin', 'Your next important periods')}</Text>
      {next.map((w, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: TOPIC_INFO[w.topic].color() }} />
          <Text style={{ flex: 1, fontFamily: F.sansMed, fontSize: 15, color: C.ink }}>{TOPIC_INFO[w.topic].name[lang]}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 14, color: C.sub }}>{fmtRange(w, lang)}</Text>
        </View>
      ))}
      <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15, marginTop: 8 }}>{L('Ayrıntıları ve nedenlerini gör', 'See details and reasons')}</Text>
    </Pressable>
  );
}
