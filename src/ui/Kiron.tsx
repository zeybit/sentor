// Kiron: Sentor'un astroloğu. Ekranın köşesinde duran animasyonlu kısa yol; dokununca sohbet açılır.
// Cevaplar önce uygulamanın kendi hesaplarından kurulur (her yerde çalışır). Claude içindeki sürümde, kullanıcı izin verirse,
// aynı hesaplanmış veriler bir yapay zekâ yorumuna dönüştürülür (veride olmayan hiçbir şey eklenmez).
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useStore } from '../store';
import { answer, detectIntent, advisorPrompt, Action } from '../engine/advisor';
import { useLayout } from './kit';
import { C, F } from '../theme';

type Msg =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'bot'; paras: string[]; actions: Action[]; facts: string; question: string; collapsed?: boolean }
  | { id: number; role: 'ai'; text: string; status: 'thinking' | 'writing' | 'done' | 'error' };

const tx = (tr: string, en: string, lang: 'tr' | 'en') => (lang === 'tr' ? tr : en);

/** Animasyonlu yüz: dönen usturlap halkası, göz kırpan gözler, gülümseme ve başında Sentor oku */
export function KironFace({ size = 60, talking = false }: { size?: number; talking?: boolean }) {
  const spin = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 24000, easing: Easing.linear, useNativeDriver: false }));
    const b = Animated.loop(Animated.sequence([
      Animated.delay(2600),
      Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: false }),
      Animated.delay(900),
      Animated.timing(blink, { toValue: 0.1, duration: 80, useNativeDriver: false }),
      Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: false }),
    ]));
    const c = Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(bob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    a.start(); b.start(); c.start();
    return () => { a.stop(); b.stop(); c.stop(); };
  }, []);
  const rot = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ty = bob.interpolate({ inputRange: [0, 1], outputRange: [-2, 2] });
  const s = size, r = s / 2;
  const eyeW = s * 0.1, eyeH = s * 0.15;
  return (
    <Animated.View style={{ width: s, height: s, transform: [{ translateY: ty }] }}>
      <Animated.View style={{ position: 'absolute', width: s, height: s, transform: [{ rotate: rot }] }}>
        <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <Circle cx={r} cy={r} r={r - 1.5} stroke={C.gold} strokeWidth={1.5} fill="none" opacity={0.9} />
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * 15 * Math.PI) / 180, l1 = r - 1.5, l2 = r - (i % 6 === 0 ? 6 : 3.5);
            return <Line key={i} x1={r + l1 * Math.cos(a)} y1={r + l1 * Math.sin(a)} x2={r + l2 * Math.cos(a)} y2={r + l2 * Math.sin(a)} stroke={C.gold} strokeWidth={i % 6 === 0 ? 1.4 : 0.8} opacity={0.8} />;
          })}
        </Svg>
      </Animated.View>
      <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ position: 'absolute' }}>
        <Circle cx={r} cy={r} r={r * 0.72} fill={C.card} stroke={C.line} />
        {/* gülümseme */}
        <Path d={talking ? `M ${r - s * 0.12} ${r + s * 0.12} Q ${r} ${r + s * 0.26} ${r + s * 0.12} ${r + s * 0.12} Z` : `M ${r - s * 0.13} ${r + s * 0.12} Q ${r} ${r + s * 0.22} ${r + s * 0.13} ${r + s * 0.12}`} stroke={C.gold} strokeWidth={s * 0.035} strokeLinecap="round" fill={talking ? C.gold : 'none'} />
        {/* başındaki ok: Sentor'un yayından çıkan ok */}
        <Line x1={r - s * 0.2} y1={r - s * 0.36} x2={r + s * 0.2} y2={r - s * 0.48} stroke={C.ink} strokeWidth={s * 0.03} strokeLinecap="round" />
        <Path d={`M ${r + s * 0.2} ${r - s * 0.48} l ${-s * 0.09} ${-s * 0.005} l ${s * 0.05} ${s * 0.075} Z`} fill={C.second} />
      </Svg>
      {[-1, 1].map(k => (
        <Animated.View key={k} style={{ position: 'absolute', left: r + k * s * 0.13 - eyeW / 2, top: r - s * 0.1 - eyeH / 2, width: eyeW, height: eyeH, borderRadius: eyeW, backgroundColor: C.ink, transform: [{ scaleY: blink }] }} />
      ))}
    </Animated.View>
  );
}

function Dots() {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.timing(v, { toValue: 3, duration: 1200, easing: Easing.linear, useNativeDriver: false })); a.start(); return () => a.stop(); }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 6 }}>
      {[0, 1, 2].map(i => <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.gold, opacity: v.interpolate({ inputRange: [i, i + 0.5, i + 1, 3], outputRange: [0.3, 1, 0.3, 0.3], extrapolate: 'clamp' }) }} />)}
    </View>
  );
}

export default function Kiron({ onNav }: { onNav: (to: string) => void }) {
  const { chart, profile, lang } = useStore();
  const { wide } = useLayout();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const idRef = useRef(1);
  const scroll = useRef<any>(null);
  const sampleRef = useRef<any>(undefined);
  const aiOff = useRef(false);

  // Claude içindeki sürümde yapay zekâ yorumu (yoksa yalnızca hesaplanmış cevaplar)
  useEffect(() => {
    const c = (globalThis as any).claude;
    if (!c?.use) { sampleRef.current = null; return; }
    c.use('sample').then((s: any) => { sampleRef.current = s; }).catch(() => { sampleRef.current = null; });
  }, []);
  // Tanıtım balonu: açılıştan kısa süre sonra bir kez
  useEffect(() => {
    const a = setTimeout(() => setTeaser(true), 2500), b = setTimeout(() => setTeaser(false), 11000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);
  useEffect(() => { setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60); }, [msgs, open]);
  useEffect(() => { setMsgs([]); }, [profile?.id]);

  if (!chart || !profile) return null;
  const first = profile.name?.split(' ')[0] || '';
  const QUICK = lang === 'tr'
    ? ['Bu yıl beni ne bekliyor?', 'Ne zaman evlenirim?', 'Aşk hayatım nasıl?', 'Kariyerim', 'Bugün nasıl bir gün?', 'Bu ay', 'Beni anlat']
    : ['What does this year hold?', 'When will I marry?', 'My love life', 'My career', 'How is today?', 'This month', 'Describe me'];

  const update = (id: number, patch: Partial<Msg>) => setMsgs(m => m.map(x => (x.id === id ? ({ ...x, ...patch } as Msg) : x)));
  const send = (q: string) => {
    const text = q.trim();
    if (!text || busy) return;
    setInput(''); setBusy(true);
    const uid = idRef.current++;
    setMsgs(m => [...m, { id: uid, role: 'user', text }]);
    setTimeout(() => {
      const a = answer(detectIntent(text), chart, profile, lang, text);
      const ai = sampleRef.current && !aiOff.current && a.intent !== 'help';
      const bid = idRef.current++;
      setMsgs(m => [...m, { id: bid, role: 'bot', paras: a.paras, actions: a.actions, facts: a.facts, question: text, collapsed: !!ai }]);
      if (!ai) { setBusy(false); return; }
      const aid = idRef.current++;
      setMsgs(m => [...m, { id: aid, role: 'ai', text: '', status: 'thinking' }]);
      type Turn = { role: 'user' | 'assistant'; content: string };
      const history: Turn[] = [];
      let lastQ: string | null = null;
      for (const x of msgs) { if (x.role === 'user') lastQ = x.text; else if (x.role === 'ai' && x.status === 'done' && lastQ) { history.push({ role: 'user', content: lastQ }, { role: 'assistant', content: x.text }); lastQ = null; } }
      sampleRef.current(advisorPrompt(lang, a.facts, history, text), { onText: ({ text: t }: { text: string }) => update(aid, { text: t, status: 'writing' } as any) })
        .then((r: { text: string }) => update(aid, { text: r.text, status: 'done' } as any))
        .catch((e: any) => {
          if (e?.code === 'not_granted') { aiOff.current = true; setMsgs(m => m.filter(x => x.id !== aid).map(x => (x.id === bid ? ({ ...x, collapsed: false } as Msg) : x))); }
          else update(aid, { text: e?.text || tx('Yorumu şu an yazamadım; yukarıdaki hesaplar geçerli.', 'I couldn’t write the interpretation right now; the calculations above stand.', lang), status: e?.text ? 'done' : 'error' } as any);
        })
        .finally(() => setBusy(false));
    }, 450);
  };

  const fab = (
    <View pointerEvents="box-none" style={{ position: 'absolute', right: wide ? 28 : 14, bottom: wide ? 26 : 78, alignItems: 'flex-end', zIndex: 90 }}>
      {teaser && !open ? (
        <Pressable onPress={() => { setTeaser(false); setOpen(true); }} style={{ maxWidth: 250, marginBottom: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 14, borderBottomRightRadius: 4, paddingVertical: 10, paddingHorizontal: 12 }} {...({ dataSet: { enter: '1' } } as any)}>
          <Text style={{ fontFamily: F.sans, fontSize: 14, lineHeight: 20, color: C.ink }}>{tx(`Merhaba${first ? ' ' + first : ''}! Ben Kiron, Sentor’un astroloğu. Bu yıl seni neler bekliyor, birlikte bakalım mı?`, `Hi${first ? ' ' + first : ''}! I’m Kiron, Sentor’s astrologer. Shall we look at what this year holds?`, lang)}</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={() => { setOpen(o => !o); setTeaser(false); }} accessibilityRole="button" accessibilityLabel={tx('Kiron ile konuş', 'Talk to Kiron', lang)}
        style={({ pressed }) => ({ width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', backgroundColor: C.glass, borderWidth: 1, borderColor: C.line, opacity: pressed ? 0.8 : 1, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8, ...(Platform.OS === 'web' ? { backdropFilter: 'blur(14px)', cursor: 'pointer' } : {}) } as any)}>
        <KironFace size={56} />
      </Pressable>
    </View>
  );
  if (!open) return fab;

  const panelStyle = wide
    ? { position: 'absolute' as const, right: 24, bottom: 24, width: 430, height: Math.min(700, height - 48), borderRadius: 16, borderWidth: 1 }
    : { position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0, borderRadius: 0, borderWidth: 0 };
  const bubble = { borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, maxWidth: '92%' as const };

  return (
    <>
      <View style={[panelStyle, { zIndex: 100, backgroundColor: C.bg, borderColor: C.line, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 30, shadowOffset: { width: 0, height: 12 }, elevation: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: C.glass }}>
          <KironFace size={44} talking={busy} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.serif, fontSize: 20, color: C.ink }}>Kiron</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{busy ? tx('haritana bakıyor…', 'reading your chart…', lang) : tx('Sentor’un astroloğu', 'Sentor’s astrologer', lang)}</Text>
          </View>
          <Pressable onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel={tx('Kapat', 'Close', lang)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 22, color: C.sub }}>×</Text>
          </Pressable>
        </View>

        <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }} keyboardShouldPersistTaps="handled">
          <View style={[bubble, { backgroundColor: C.card, alignSelf: 'flex-start' }]}>
            <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 22, color: C.ink }}>{tx(`Merhaba${first ? ' ' + first : ''}! Haritana profeksiyon, Güneş dönüşü, progresyon, solar arc, primer direksiyon, transit ve tutulmaları birlikte okuyarak bakıyorum. Ne sormak istersin?`, `Hi${first ? ' ' + first : ''}! I read your chart combining profections, solar returns, progressions, solar arcs, primary directions, transits and eclipses. What would you like to ask?`, lang)}</Text>
          </View>
          {msgs.map(m => m.role === 'user' ? (
            <View key={m.id} style={[bubble, { backgroundColor: C.rose, alignSelf: 'flex-end' }]}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 15, lineHeight: 21, color: C.onAccent }}>{m.text}</Text>
            </View>
          ) : m.role === 'bot' ? (
            <View key={m.id} style={[bubble, { backgroundColor: C.card, alignSelf: 'flex-start', borderWidth: m.collapsed ? 1 : 0, borderColor: C.line }]}>
              {m.collapsed ? (
                <Pressable onPress={() => update(m.id, { collapsed: false } as any)} accessibilityRole="button">
                  <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold }}>{tx('Haritandan hesapladıklarım (göster) ↓', 'What I computed from your chart (show) ↓', lang)}</Text>
                </Pressable>
              ) : m.paras.map((p, i) => (
                <Text key={i} style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 22, color: C.ink, marginTop: i ? 8 : 0 }}>{p}</Text>
              ))}
              {m.actions.length ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {m.actions.map(a => (
                    <Pressable key={a.to} onPress={() => { onNav(a.to); if (!wide) setOpen(false); }} accessibilityRole="link" style={{ borderWidth: 1, borderColor: C.rose, borderRadius: 4, paddingVertical: 4, paddingHorizontal: 10 }}>
                      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.rose }}>{a.label} →</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ) : (
            <View key={m.id} style={[bubble, { backgroundColor: C.card, alignSelf: 'flex-start', borderLeftWidth: 3, borderLeftColor: C.gold }]}>
              <Text style={{ fontFamily: F.mono, fontSize: 10, letterSpacing: 1.5, color: C.gold, marginBottom: 4 }}>{tx('KIRON’UN YORUMU', 'KIRON’S READING', lang)}</Text>
              {m.status === 'thinking' ? <Dots /> : <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: m.status === 'error' ? C.sub : C.ink }}>{m.text}</Text>}
            </View>
          ))}
          {busy && !msgs.some(m => m.role === 'ai' && m.status === 'thinking') ? <View style={[bubble, { backgroundColor: C.card, alignSelf: 'flex-start' }]}><Dots /></View> : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 8 }} keyboardShouldPersistTaps="handled">
          {QUICK.map(q => (
            <Pressable key={q} onPress={() => send(q)} disabled={busy} style={{ borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingVertical: 6, paddingHorizontal: 12, opacity: busy ? 0.5 : 1 }}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.ink }}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingTop: 4, borderTopWidth: 0 }}>
          <TextInput value={input} onChangeText={setInput} onSubmitEditing={() => send(input)} placeholder={tx('Kiron’a sor…', 'Ask Kiron…', lang)} placeholderTextColor={C.sub} returnKeyType="send"
            style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, fontFamily: F.sans, fontSize: 15, color: C.ink, backgroundColor: C.card, ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}) } as any} />
          <Pressable onPress={() => send(input)} disabled={busy || !input.trim()} accessibilityRole="button" accessibilityLabel={tx('Gönder', 'Send', lang)}
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: input.trim() && !busy ? C.gold : C.card, borderWidth: 1, borderColor: C.line }}>
            <Text style={{ fontSize: 18, color: input.trim() && !busy ? C.bg : C.sub, fontWeight: '700' }}>↑</Text>
          </Pressable>
        </View>
        <Text style={{ fontFamily: F.sans, fontSize: 11, color: C.sub, textAlign: 'center', paddingBottom: 8 }}>{tx('Astroloji eğilimleri anlatır, kesin kader değildir.', 'Astrology describes tendencies, not fixed fate.', lang)}</Text>
      </View>
    </>
  );
}
