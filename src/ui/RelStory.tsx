// Aşk → İlişki hikâyesi: tanışma, ilk adım, ilk buluşma, başlangıç, ayrılık ve barışma anlarının haritaları;
// iki kişinin aşk kalıpları, dürüst sinastri ve kompozit zamanlama. Metin "acı gerçek, tatlı yalandan iyidir" ilkesiyle kurulur.
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore, Profile } from '../store';
import { EV_LABEL, EvType, RelEvent, eventChart, fullStory, parseEventDate } from '../engine/relstory';
import { Btn, Chips, Field, More, Section, Sub, st } from './kit';
import { C, F } from '../theme';

const TYPES: EvType[] = ['meet', 'firstMove', 'firstDate', 'start', 'breakup', 'reunion'];

export default function RelStory() {
  const { chart, profile, people, chartOf, opts } = useStore();
  const others = people.filter(p => p.id !== profile?.id);
  const [pid, setPid] = useState<string>(others[0]?.id ?? 'none');
  const partner: Profile | null = others.find(p => p.id === pid) ?? null;
  const key = `relstory.v1.${profile?.id ?? 'me'}.${pid}`;
  const [events, setEvents] = useState<RelEvent[]>([]);
  const [type, setType] = useState<EvType>('firstDate');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { AsyncStorage.getItem(key).then(v => { try { setEvents(v ? JSON.parse(v) : []); } catch { setEvents([]); } }).catch(() => setEvents([])); }, [key]);
  const save = (list: RelEvent[]) => { setEvents(list); AsyncStorage.setItem(key, JSON.stringify(list)).catch(() => {}); };

  const add = () => {
    const ev: RelEvent = { id: String(Date.now()), type, date: date.trim(), time: time.trim() || undefined };
    const p = parseEventDate(ev);
    if (!p || p.m < 1 || p.m > 12 || p.d < 1 || p.d > 31) { setErr('Tarihi GG.AA.YYYY biçiminde yaz (ör. 14.02.2025).'); return; }
    if (ev.time && !/^\d{1,2}[:.]\d{2}$/.test(ev.time)) { setErr('Saati SS:DD biçiminde yaz ya da boş bırak.'); return; }
    setErr(''); setDate(''); setTime('');
    save([...events, ev].sort((a, b) => { const x = parseEventDate(a)!, y = parseEventDate(b)!; return new Date(x.y, x.m - 1, x.d).getTime() - new Date(y.y, y.m - 1, y.d).getTime(); }));
  };

  const place = profile ? { lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null;
  const reading = useMemo(() => {
    if (!chart || !profile || !place) return null;
    const pc = partner ? chartOf(partner) : null;
    const me = { name: profile.name || 'Sen', gender: profile.gender, chart };
    const them = partner && pc ? { name: partner.name || 'O', gender: partner.gender, chart: pc } : null;
    const evs = events.map(ev => ({ ev, c: eventChart(ev, place)! })).filter(x => x.c);
    try { return fullStory(me, them, evs); } catch { return null; }
  }, [chart, profile, partner, events, opts]);

  if (!chart || !profile) return null;
  const item = (i: { tech: string; text: string; voice?: string }, k: number) => (
    <View key={k} style={{ paddingVertical: 8, borderTopWidth: k ? 1 : 0, borderTopColor: C.line }}>
      <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, lineHeight: 22, color: C.ink }}>{i.tech}</Text>
      <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 23, color: C.ink, marginTop: 2 }}>{i.text}</Text>
      {i.voice ? <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 24, color: C.sub, marginTop: 4 }}>“{i.voice}”</Text> : null}
    </View>
  );
  const sec = (s: { emoji: string; title: string; items: any[] }, k: number) => (
    <View key={k} style={{ marginTop: 22 }}>
      <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginBottom: 6 }}>{s.emoji} {s.title}</Text>
      {s.items.map(item)}
    </View>
  );

  return (
    <View>
      <Section title="İlişki hikâyesi" sub="Bir ilişkinin önemli anları (tanışma, ilk adım, ilk buluşma, başlangıç, ayrılık, barışma) kendi haritalarını taşır. Bu anları ve iki doğum haritasını birlikte okuyup ilişkinin hikâyesini anlatıyorum: kim ne hissetti, neden yakınlaştınız, neden koptunuz, bundan sonra ne olabilir. Zor göstergeleri yumuşatmıyorum.">
        <Text style={[st.rowLabel, { marginBottom: 6 }]}>Kiminle?</Text>
        <Chips items={[...others.map(p => ({ key: p.id, label: p.name || p.place })), { key: 'none', label: 'Kişi eklemeden' }]} value={pid} onChange={setPid} />
        {!others.length ? <Sub style={{ marginTop: 6 }}>Karşı tarafın doğum bilgisini “Biriyle uyum” sekmesinden eklersen sinastri ve kompozit zamanlamayı da okurum.</Sub> : null}

        <Text style={[st.rowLabel, { marginTop: 16, marginBottom: 6 }]}>Olay ekle</Text>
        <Chips items={TYPES.map(t => ({ key: t, label: EV_LABEL[t] }))} value={type} onChange={setType} />
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <View style={{ flexGrow: 1, minWidth: 160 }}><Field label="Tarih" placeholder="GG.AA.YYYY" value={date} onChangeText={setDate} keyboardType="numbers-and-punctuation" /></View>
          <View style={{ flexGrow: 1, minWidth: 120 }}><Field label="Saat (biliyorsan)" placeholder="SS:DD" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" /></View>
        </View>
        {err ? <Text style={{ color: C.second, fontFamily: F.sans, fontSize: 14, marginTop: 4 }}>{err}</Text> : null}
        <View style={{ marginTop: 8 }}><Btn small title="Olayı ekle" onPress={add} disabled={!date.trim()} /></View>
        <Sub style={{ marginTop: 6 }}>Olay yeri olarak doğum yerini ({profile.place}) varsayıyorum. Saat girmezsen öğlen 12:00 alır, evleri yorumlamam.</Sub>

        {events.length ? (
          <View style={{ marginTop: 12, gap: 6 }}>
            {events.map(e => (
              <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.line, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 }}>
                <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: C.ink }}>{EV_LABEL[e.type]} · {e.date}{e.time ? ' ' + e.time : ''}</Text>
                <Pressable onPress={() => save(events.filter(x => x.id !== e.id))} accessibilityRole="button" accessibilityLabel="Olayı sil" hitSlop={8}><Text style={{ color: C.sub, fontSize: 18 }}>×</Text></Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </Section>

      {reading ? (
        <View style={[st.panel, { marginBottom: 30 }]}>
          <Text style={[st.rowLabel, { marginBottom: 6 }]}>{reading.title}</Text>
          <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 32, color: C.ink }}>{reading.opening}</Text>
          {reading.secs.slice(0, 4).map(sec)}
          {reading.secs.length > 4 ? <More count={reading.secs.length - 4}>{reading.secs.slice(4).map((s, k) => sec(s, k + 4))}</More> : null}
          {reading.truths.length ? (
            <View style={{ marginTop: 24, borderLeftWidth: 3, borderLeftColor: C.second, paddingLeft: 12 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginBottom: 6 }}>🩸 Acı gerçekler</Text>
              {reading.truths.map((t, k) => <Text key={k} style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 24, color: C.ink, marginTop: k ? 6 : 0 }}>• {t}</Text>)}
            </View>
          ) : null}
          <Text style={{ fontFamily: F.sans, fontSize: 16, lineHeight: 24, color: C.ink, marginTop: 20 }}>
            <Text style={{ fontFamily: F.sansBold, fontWeight: '700' }}>Özetle: </Text>{reading.summary.replace(/^Özetle:\s*/, '')}
          </Text>
          <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 22, color: C.sub, marginTop: 12 }}>{reading.next}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub, marginTop: 14 }}>Harita olayları değil eğilimleri gösterir: kimin ne yaptığını ya da kimin ayrılığı başlattığını haritadan kesin olarak çıkaramam. (Bu bir astrolojik yorumdur, bilimsel bir kesinlik değildir.)</Text>
        </View>
      ) : null}
    </View>
  );
}
