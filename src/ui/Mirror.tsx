// "Seni anlatan cümleler": haritadan çıkan somut davranış cümleleri, kart destesi olarak.
// Sağa kaydır = tuttu, sola kaydır = tutmadı. Bitince özet ve tutan cümlelerin listesi gösterilir.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Chart } from '../engine/astro';
import { mirrorLines, MIRROR_CATS, MirrorLine } from '../content/mirror';
import { More, Sub, st } from './kit';
import { C, F } from '../theme';
import { useStore } from '../store';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const SWIPE = 110;

/** Kategorileri sırayla karıştırır: her turda her kategorinin en güçlü cümlesi */
function interleave(all: MirrorLine[]): MirrorLine[] {
  const groups = MIRROR_CATS.map(c => all.filter(x => x.cat === c.key));
  const out: MirrorLine[] = [];
  for (let i = 0; out.length < all.length; i++) groups.forEach(g => { if (g[i]) out.push(g[i]); });
  return out;
}

export default function Mirror({ chart, lang, personId }: { chart: Chart; lang: Lang; personId?: string }) {
  const { profile } = useStore();
  const deck = useMemo(() => interleave(mirrorLines(chart)), [chart]);
  const key = `mirror.v1.${personId ?? profile?.id ?? 'me'}`;
  const [fb, setFb] = useState<Record<string, 1 | 0>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    AsyncStorage.getItem(key).then(v => { try { setFb(v ? JSON.parse(v) : {}); } catch { setFb({}); } }).catch(() => {}).finally(() => setLoaded(true));
  }, [key]);
  const keyRef = useRef(key); keyRef.current = key;
  const save = (next: Record<string, 1 | 0>) => { setFb(next); AsyncStorage.setItem(keyRef.current, JSON.stringify(next)).catch(() => {}); };

  const remaining = deck.filter(x => fb[x.id] === undefined);
  const card = remaining[0], nextCard = remaining[1];
  const done = deck.length - remaining.length;

  const pan = useRef(new Animated.ValueXY()).current;
  const cardRef = useRef<MirrorLine | undefined>(card);
  cardRef.current = card;
  const fbRef = useRef(fb); fbRef.current = fb;

  const commit = (v: 1 | 0) => {
    const c = cardRef.current;
    if (!c) return;
    Animated.timing(pan, { toValue: { x: (v ? 1 : -1) * 600, y: 40 }, duration: 220, useNativeDriver: false }).start(() => {
      pan.setValue({ x: 0, y: 0 });
      save({ ...fbRef.current, [c.id]: v });
      setHistory(h => [...h, c.id]);
    });
  };
  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    const next = { ...fb }; delete next[last];
    save(next); setHistory(h => h.slice(0, -1));
  };
  const restart = () => { save({}); setHistory([]); };

  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
    onPanResponderMove: (_, g) => pan.setValue({ x: g.dx, y: g.dy * 0.25 }),
    onPanResponderRelease: (_, g) => {
      if (g.dx > SWIPE) commit(1);
      else if (g.dx < -SWIPE) commit(0);
      else Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
    },
    onPanResponderTerminate: () => Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start(),
  }), []);

  // Klavye: sağ/sol ok tuşları (web)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') commit(1); else if (e.key === 'ArrowLeft') commit(0); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (!deck.length || !loaded) return null;
  const catLabel = (x: MirrorLine) => MIRROR_CATS.find(c => c.key === x.cat)!.label[lang];
  const rotate = pan.x.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-14deg', '0deg', '14deg'] });
  const yesO = pan.x.interpolate({ inputRange: [0, SWIPE], outputRange: [0, 1], extrapolate: 'clamp' });
  const noO = pan.x.interpolate({ inputRange: [-SWIPE, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const nextScale = pan.x.interpolate({ inputRange: [-SWIPE, 0, SWIPE], outputRange: [1, 0.95, 1], extrapolate: 'clamp' });

  const face = (x: MirrorLine) => (
    <>
      <Text style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: 2, color: C.gold, textTransform: 'uppercase' }}>{catLabel(x)}</Text>
      <Text style={{ fontFamily: F.serif, fontSize: 23, lineHeight: 32, color: C.ink, marginTop: 14, flexGrow: 1 }}>{x.text[lang]}</Text>
      <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 19, color: C.sub, marginTop: 14 }}>{tx('Haritandaki kaynağı: ', 'From your chart: ', lang)}{x.why[lang]}</Text>
    </>
  );
  const cardBox = { minHeight: 300, padding: 24, borderRadius: 14, borderWidth: 1, borderColor: C.line, backgroundColor: C.card } as const;
  const stamp = (label: string, color: string, side: 'left' | 'right', o: Animated.AnimatedInterpolation<number>) => (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 56, [side]: 18, opacity: o, borderWidth: 2, borderColor: color, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, transform: [{ rotate: side === 'left' ? '-10deg' : '10deg' }] }}>
      <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 18, letterSpacing: 2, color }}>{label}</Text>
    </Animated.View>
  );
  const roundBtn = (label: string, color: string, onPress: () => void, a11y: string, size = 60) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}
      style={({ pressed }) => ({ width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1, backgroundColor: C.card })}>
      <Text style={{ fontSize: size * 0.4, color, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );

  const hits = deck.filter(x => fb[x.id] === 1);
  const summary = (
    <View>
      <Text style={{ fontFamily: F.serif, fontSize: 40, lineHeight: 46, color: C.gold }}>{hits.length}/{deck.length}</Text>
      <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 24, color: C.ink, marginBottom: 10 }}>{tx(`Haritanın seni anlattığı ${deck.length} cümleden ${hits.length} tanesi sende tuttu (%${Math.round((hits.length / deck.length) * 100)}).`, `${hits.length} of the ${deck.length} lines your chart wrote about you fit (${Math.round((hits.length / deck.length) * 100)}%).`, lang)}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {MIRROR_CATS.filter(c => deck.some(x => x.cat === c.key)).map(c => {
          const n = deck.filter(x => x.cat === c.key).length, h = hits.filter(x => x.cat === c.key).length;
          return <Text key={c.key} style={{ fontFamily: F.sansMed, fontSize: 13, color: C.sub, borderWidth: 1, borderColor: C.line, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 }}>{c.label[lang]} {h}/{n}</Text>;
        })}
      </View>
      {hits.length ? (
        <>
          <Text style={[st.rowLabel, { marginBottom: 4 }]}>{tx('Sende tutanlar', 'The ones that fit', lang)}</Text>
          {hits.slice(0, 4).map(x => <Text key={x.id} style={{ fontFamily: F.serif, fontSize: 17, lineHeight: 25, color: C.ink, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line }}>{x.text[lang]}</Text>)}
          {hits.length > 4 ? <More count={hits.length - 4}>{hits.slice(4).map(x => <Text key={x.id} style={{ fontFamily: F.serif, fontSize: 17, lineHeight: 25, color: C.ink, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.line }}>{x.text[lang]}</Text>)}</More> : null}
        </>
      ) : null}
      <Pressable onPress={restart} accessibilityRole="button" style={{ alignSelf: 'flex-start', paddingVertical: 10 }}>
        <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.rose, fontSize: 15 }}>{tx('Baştan başla', 'Start over', lang)}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={[st.panel, { marginBottom: 36 }]} {...({ dataSet: { lift: '1' } } as any)}>
      <Text style={[st.rowLabel, { marginBottom: 6 }]}>{tx('Kendini bul', 'Find yourself', lang)}</Text>
      <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 30, color: C.ink, marginBottom: 4 }}>{tx('Seni anlatan cümleler', 'Lines that describe you', lang)}</Text>
      <Sub style={{ marginBottom: 16 }}>{tx('Haritandaki birleşimlerden çıkan cümleler, kart kart. Seni anlatıyorsa sağa, anlatmıyorsa sola kaydır. Sonunda kaçının tuttuğunu görürsün.', 'Lines drawn from combinations in your chart, one card at a time. Swipe right if it’s you, left if it isn’t. At the end you’ll see how many fit.', lang)}</Sub>

      {card ? (
        <View style={{ maxWidth: 520, width: '100%', alignSelf: 'center' }}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, textAlign: 'center', marginBottom: 10 }}>{done + 1} / {deck.length}</Text>
          <View style={{ minHeight: 320 }}>
            {nextCard ? (
              <Animated.View pointerEvents="none" style={[cardBox, { position: 'absolute', left: 0, right: 0, top: 0, opacity: 0.6, transform: [{ scale: nextScale }] }]}>{face(nextCard)}</Animated.View>
            ) : null}
            <Animated.View {...responder.panHandlers}
              style={[cardBox, { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }, Platform.OS === 'web' ? ({ cursor: 'grab', userSelect: 'none', touchAction: 'pan-y' } as any) : null]}>
              {face(card)}
              {stamp(tx('TUTTU', 'SO ME', lang), C.rose, 'left', yesO)}
              {stamp(tx('TUTMADI', 'NOT ME', lang), C.sub, 'right', noO)}
            </Animated.View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 22, marginTop: 18 }}>
            {roundBtn('✕', C.sub, () => commit(0), tx('Tutmadı', 'Not me', lang))}
            {roundBtn('↺', C.gold, undo, tx('Geri al', 'Undo', lang), 42)}
            {roundBtn('✓', C.rose, () => commit(1), tx('Tuttu', 'So me', lang))}
          </View>
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub, textAlign: 'center', marginTop: 10 }}>{tx('Sola: tutmadı · Sağa: tuttu', 'Left: not me · Right: so me', lang)}</Text>
        </View>
      ) : summary}
    </View>
  );
}
