import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { useStore } from '../store';
import { Field, H1, P, Sub, st } from '../ui/kit';
import { C, F } from '../theme';
import { TERMS } from '../content/glossary';


export default function HelpScreen() {
  const { lang } = useStore();
  const i = lang === 'tr' ? 0 : 1;
  const [q, setQ] = useState('');
  const list = TERMS.filter(x => !q.trim() || (x.t[i] + ' ' + x.d[i]).toLocaleLowerCase(lang).includes(q.trim().toLocaleLowerCase(lang)));
  return (
    <View>
      <H1>{lang === 'tr' ? 'Terimler' : 'Glossary'}</H1>
      <Sub style={{ marginBottom: 16 }}>{lang === 'tr' ? 'Uygulamada geçen kavramların kısa açıklamaları.' : 'Short explanations of the terms used in the app.'}</Sub>
      <Field label="" value={q} onChangeText={setQ} placeholder={lang === 'tr' ? 'Terim ara (ör. orb)' : 'Search (e.g. orb)'} />
      {list.map(x => (
        <View key={x.t[0]} style={st.row}>
          <Text style={{ fontFamily: F.serifBold, fontWeight: '700', fontSize: 19, color: C.ink, marginBottom: 2 }}>{x.t[i]}</Text>
          <P>{x.d[i]}</P>
        </View>
      ))}
      {!list.length ? <P>{lang === 'tr' ? 'Bu aramayla eşleşen terim yok. Daha kısa bir kelime dene.' : 'No term matches. Try a shorter word.'}</P> : null}
      <Sub style={{ marginTop: 24 }}>{lang === 'tr' ? 'Astroloji ve kader matrisi bilimsel kanıta dayanmaz; yorumlar kendini tanıma ve eğlence amaçlıdır.' : 'Astrology and the destiny matrix are not scientifically proven; readings are for self-reflection and fun.'}</Sub>
    </View>
  );
}
