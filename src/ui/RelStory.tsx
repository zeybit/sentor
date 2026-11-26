// Aşk → İlişki hikâyesi: tanışma, ilk adım, ilk buluşma, başlangıç, ayrılık ve barışma anlarının haritaları;
// iki kişinin aşk kalıpları, dürüst sinastri ve kompozit zamanlama. Metin "acı gerçek, tatlı yalandan iyidir" ilkesiyle kurulur.
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore, Profile } from '../store';
import { searchPlaces, Place } from './BirthForm';
import { EV_LABEL, EventCard, EvType, RelEvent, eventChart, fullStory, parseEventDate } from '../engine/relstory';
import { Btn, Chips, Field, More, Section, Sub, st } from './kit';
import { C, F } from '../theme';
import { maskDate, maskTime, dateProblem, timeProblem } from '../util';

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
  const [q, setQ] = useState('');
  const [evPlace, setEvPlace] = useState<Place | null>(null);
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const home: Place | null = profile ? { label: profile.place, lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null;
  const short = (l: string) => l.split(',')[0].trim();
  useEffect(() => {
    if (evPlace && q === evPlace.label) return;
    if (q.trim().length < 2) { setResults([]); return; }
    const id = setTimeout(async () => { setBusy(true); setResults(await searchPlaces(q.trim(), 'tr')); setBusy(false); }, 400);
    return () => clearTimeout(id);
  }, [q]);
  useEffect(() => { AsyncStorage.getItem(key).then(v => { try { setEvents(v ? JSON.parse(v) : []); } catch { setEvents([]); } }).catch(() => setEvents([])); }, [key]);
  const save = (list: RelEvent[]) => { setEvents(list); AsyncStorage.setItem(key, JSON.stringify(list)).catch(() => {}); };

  const add = () => {
    const ev: RelEvent = { id: String(Date.now()), type, date: date.trim(), time: time.trim() || undefined, place: evPlace ?? undefined };
    const p = parseEventDate(ev);
    const dp = dateProblem(ev.date, 'tr', true), tp = ev.time ? timeProblem(ev.time, 'tr', true) : '';
    if (dp || !p) { setErr(dp || 'Tarihi GG.AA.YYYY biçiminde yaz (ör. 14.02.2025).'); return; }
    if (tp) { setErr(tp + ' Bilmiyorsan boş bırak.'); return; }
    if (new Date(p.y, p.m - 1, p.d) > new Date()) { setErr('Bu tarih henüz gelmedi; yaşanmış bir olayın tarihini gir.'); return; }
    if (!evPlace) { setErr('Olayın yaşandığı şehri seç. Haritanın evleri ve köşeleri yere göre değişir.'); return; }
    setErr(''); setDate(''); setTime('');
    save([...events, ev].sort((a, b) => { const x = parseEventDate(a)!, y = parseEventDate(b)!; return new Date(x.y, x.m - 1, x.d).getTime() - new Date(y.y, y.m - 1, y.d).getTime(); }));
  };

  const place = profile ? { lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null;
  const reading = useMemo(() => {
    if (!chart || !profile || !place) return null;
    const pc = partner ? chartOf(partner) : null;
    const me = { name: profile.name || 'Sen', gender: profile.gender, chart };
    const them = partner && pc ? { name: partner.name || 'O', gender: partner.gender, chart: pc } : null;
    const evs = events.map(ev => ({ ev, c: eventChart(ev, ev.place ?? place)! })).filter(x => x.c);
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
        {!others.length ? <Sub style={{ marginTop: 6 }}>Karşı tarafın doğum bilgisini Uyum analizi bölümünden eklersen sinastri ve kompozit zamanlamayı da okurum.</Sub> : null}

        <Text style={[st.rowLabel, { marginTop: 16, marginBottom: 6 }]}>Olay ekle</Text>
        <Chips items={TYPES.map(t => ({ key: t, label: EV_LABEL[t] }))} value={type} onChange={setType} />
        <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <View style={{ flexGrow: 1, minWidth: 160 }}><Field label="Tarih" placeholder="GG.AA.YYYY" value={date} onChangeText={v => { setErr(''); setDate(maskDate(v, date)); }} maxLength={10} error={dateProblem(date)} keyboardType="numbers-and-punctuation" /></View>
          <View style={{ flexGrow: 1, minWidth: 120 }}><Field label="Saat (biliyorsan)" placeholder="SS:DD" value={time} onChangeText={v => { setErr(''); setTime(maskTime(v, time)); }} maxLength={5} error={timeProblem(time)} keyboardType="numbers-and-punctuation" /></View>
        </View>
        <Field label="Olay yeri" placeholder="Şehir ara (ör. İzmir)" value={q} onChangeText={v => { setErr(''); setQ(v); setEvPlace(null); }} />
        {!evPlace && home ? (
          <Pressable onPress={() => { setErr(''); setEvPlace(home); setQ(home.label); setResults([]); }} accessibilityRole="button" style={({ pressed }) => [{ alignSelf: 'flex-start', borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginTop: -6, marginBottom: 8 }, pressed && { opacity: 0.6 }]}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.ink }}>Doğum yerim ({short(home.label)})</Text>
          </Pressable>
        ) : null}
        {busy ? <Sub>Aranıyor…</Sub> : null}
        {!busy && !evPlace && q.trim().length >= 2 && !results.length ? <Sub>Sonuç yok; farklı yazmayı dene.</Sub> : null}
        {!evPlace && results.map((r, i) => (
          <Pressable key={i} onPress={() => { setErr(''); setEvPlace(r); setQ(r.label); setResults([]); }} style={({ pressed }) => [{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }, pressed && { opacity: 0.6 }]}>
            <Text style={st.p}>{r.label}</Text>
          </Pressable>
        ))}
        {err && err !== dateProblem(date) && !(timeProblem(time) && err.startsWith(timeProblem(time))) ? <Text style={{ color: C.second, fontFamily: F.sans, fontSize: 14, marginTop: 4 }}>{err}</Text> : null}
        <View style={{ marginTop: 8 }}><Btn small title="Olayı ekle" onPress={add} disabled={!date.trim()} /></View>
        <Sub style={{ marginTop: 6 }}>Saat girmezsen öğlen 12:00 alır, evleri yorumlamam.</Sub>

        {events.length ? (
          <View style={{ marginTop: 12, gap: 6 }}>
            {events.map(e => (
              <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.line, borderRadius: 6, paddingVertical: 6, paddingHorizontal: 10 }}>
                <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: C.ink }}>{EV_LABEL[e.type]} · {e.date}{e.time ? ' ' + e.time : ''}{e.place ? ' · ' + short(e.place.label) : ''}</Text>
                <Pressable onPress={() => save(events.filter(x => x.id !== e.id))} accessibilityRole="button" accessibilityLabel="Olayı sil" hitSlop={8}><Text style={{ color: C.sub, fontSize: 18 }}>×</Text></Pressable>
              </View>
            ))}
          </View>
        ) : null}
      </Section>

      {reading ? (
        <View style={[st.panel, { marginBottom: 30 }]}>
          <Text style={[st.rowLabel, { marginBottom: 6 }]}>{reading.title}</Text>
          {reading.opening ? <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 32, color: C.ink }}>{reading.opening}</Text> : null}
          {reading.links?.length ? sec({ emoji: '🔗', title: 'Olaylar arasındaki bağlar', items: reading.links }, 900) : null}
          {reading.events?.length ? (
            <View style={{ marginTop: 22 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 22, lineHeight: 28, color: C.ink, marginBottom: 8 }}>🗓️ Olay haritaları</Text>
              {reading.events.map((ev, k) => <EventBlock key={ev.title + k} ev={ev} initial={k === 0} sec={sec} hideOpening={k === 0} />)}
            </View>
          ) : null}
          {reading.secs.slice(0, 3).map(sec)}
          {reading.secs.length > 3 ? <More count={reading.secs.length - 3}>{reading.secs.slice(3).map((s, k) => sec(s, k + 3))}</More> : null}
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

/** Tek olayın kartı: başlık ve özü görünür, dokununca bölümleri açılır */
function EventBlock({ ev, initial, sec, hideOpening }: { ev: EventCard; initial: boolean; sec: (s: { emoji: string; title: string; items: any[] }, k: number) => React.ReactNode; hideOpening: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 16, padding: 14, marginBottom: 10 }}>
      <Pressable onPress={() => setOpen(o => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <Text style={{ fontSize: 20 }}>{ev.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 16, color: C.ink }}>{ev.title}</Text>
          {!hideOpening || !open ? <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 22, color: C.sub, marginTop: 2 }} numberOfLines={open ? undefined : 2}>{ev.opening}</Text> : null}
          {ev.note ? <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.second, marginTop: 4 }}>{ev.note}</Text> : null}
        </View>
        <Text style={{ fontSize: 20, color: C.sub }}>{open ? '▴' : '▾'}</Text>
      </Pressable>
      {open ? ev.secs.map((s2, k) => sec(s2, k)) : null}
    </View>
  );
}
