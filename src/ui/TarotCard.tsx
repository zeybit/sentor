import React from 'react';
import { Image, Text, View } from 'react-native';
import { TAROT_IMG } from '../content/tarotImages';
import { C, F } from '../theme';

/** Matristeki 1–22 sayısına karşılık gelen Büyük Arkana kartı (22 = Deli / 0).
 *  Matris eski sıralamayı kullanır (8 Adalet, 11 Güç); Rider–Waite destesinde bu ikisi yer değiştirdiği için görseller takas edilir. */
const imgIndex = (n: number) => (n === 8 ? 11 : n === 11 ? 8 : n % 22);
export function TarotCard({ n, w = 64, name, caption }: { n: number; w?: number; name?: string; caption?: string }) {
  const h = Math.round(w * 1.755);
  return (
    <View style={{ width: w, alignItems: 'center' }}>
      <Image source={{ uri: TAROT_IMG[imgIndex(n)] }} accessibilityLabel={name} style={{ width: w, height: h, borderRadius: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.card }} resizeMode="cover" />
      {name && caption ? <Text style={{ fontFamily: F.sansMed, fontSize: 12, lineHeight: 15, color: C.ink, textAlign: 'center', marginTop: 5, width: w + 24 }}>{name}</Text> : null}
      {caption ? <Text style={{ fontFamily: F.sans, fontSize: 11, lineHeight: 14, color: C.sub, textAlign: 'center', width: w + 24 }}>{caption}</Text> : null}
    </View>
  );
}

export const TAROT_CREDIT = {
  tr: 'Kart görselleri: Rider–Waite–Smith tarot destesi (1909, çizen Pamela Colman Smith), kamu malı.',
  en: 'Card images: Rider–Waite–Smith tarot deck (1909, illustrated by Pamela Colman Smith), public domain.',
};
