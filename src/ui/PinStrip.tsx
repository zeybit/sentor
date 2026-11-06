import React from 'react';
import { Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { pinUrl } from '../content/looks';
import { C } from '../theme';

/** Pinterest'in resmi pin gömme sayfası. Görsel Pinterest'ten yüklenir, pin sahibine ve kaynağa bağlı kalır. */
function PinFrame({ id }: { id: string }) {
  if (Platform.OS !== 'web') return null;
  return React.createElement('iframe', {
    src: `https://assets.pinterest.com/ext/embed.html?id=${id}`,
    title: 'Pinterest', loading: 'lazy', scrolling: 'no', frameBorder: 0,
    style: { width: 236, height: 400, border: 0, borderRadius: 12, background: 'transparent', display: 'block' },
  });
}

export function PinStrip({ pins, lang }: { pins: { id: string; t: string }[]; lang: 'tr' | 'en' }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
      {pins.map(p => (
        <View key={p.id} style={{ width: 236 }}>
          <View style={{ width: 236, height: Platform.OS === 'web' ? 400 : 0, borderRadius: 12, backgroundColor: C.card, borderWidth: Platform.OS === 'web' ? 1 : 0, borderColor: C.line, overflow: 'hidden' }}>
            <Text style={{ position: 'absolute', top: 180, left: 0, right: 0, textAlign: 'center', fontSize: 13, color: C.sub }}>{lang === 'tr' ? 'Pinterest yükleniyor…' : 'Loading Pinterest…'}</Text>
            <PinFrame id={p.id} />
          </View>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(pinUrl(p.id))} style={{ paddingVertical: 6 }}>
            <Text numberOfLines={1} style={{ fontSize: 13, color: C.rose, fontWeight: '600' }}>{p.t} · {lang === 'tr' ? "Pinterest'te aç" : 'Open on Pinterest'}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
