import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import cityTz from 'city-timezones';
import type { BirthInput } from '../engine/astro';
import { useStore } from '../store';
import { Btn, Field, P, Sub, st } from './kit';
import { C } from '../theme';

export interface BirthFormValue { name: string; place: string; birth: BirthInput }
export interface Place { label: string; lat: number; lon: number; tz: string }

export async function searchPlaces(q: string, lang: string): Promise<Place[]> {
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=8&language=${lang}&name=${encodeURIComponent(q)}`);
    const j = await r.json();
    if (j.results?.length) {
      return j.results.filter((x: any) => x.timezone).map((x: any) => ({
        label: [x.name, x.admin1, x.country].filter(Boolean).join(', '), lat: x.latitude, lon: x.longitude, tz: x.timezone,
      }));
    }
  } catch { /* çevrimdışı → yerel liste */ }
  const ql = q.toLocaleLowerCase('tr');
  return (cityTz.cityMapping as any[])
    .filter(c => c.city.toLocaleLowerCase('tr').startsWith(ql) || c.city_ascii.toLowerCase().startsWith(ql))
    .sort((a, b) => b.pop - a.pop).slice(0, 8)
    .map(c => ({ label: `${c.city}, ${c.country}`, lat: c.lat, lon: c.lng, tz: c.timezone }));
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function BirthForm({ initial, onSubmit, submitLabel, nameLabel }: {
  initial?: BirthFormValue | null; onSubmit: (v: BirthFormValue) => void; submitLabel: string; nameLabel?: string;
}) {
  const { s, lang } = useStore();
  const b = initial?.birth;
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(b ? `${pad(b.day)}.${pad(b.month)}.${b.year}` : '');
  const [time, setTime] = useState(b && b.timeKnown ? `${pad(b.hour)}:${pad(b.minute)}` : '');
  const [unknown, setUnknown] = useState(b ? !b.timeKnown : false);
  const [q, setQ] = useState(initial?.place ?? '');
  const [place, setPlace] = useState<Place | null>(b ? { label: initial!.place, lat: b.lat, lon: b.lon, tz: b.tz } : null);
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(false);
  const [mLat, setMLat] = useState(''); const [mLon, setMLon] = useState(''); const [mTz, setMTz] = useState('Europe/Istanbul');
  const [err, setErr] = useState('');
  const timer = useRef<any>(null);

  useEffect(() => {
    if (place && q === place.label) return;
    if (q.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setBusy(true); setResults(await searchPlaces(q.trim(), lang)); setBusy(false);
    }, 400);
    return () => clearTimeout(timer.current);
  }, [q]);

  const submit = () => {
    const dm = date.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (!dm) return setErr(s.errDate);
    const [day, month, year] = [+dm[1], +dm[2], +dm[3]];
    const test = new Date(Date.UTC(year, month - 1, day));
    if (test.getUTCMonth() !== month - 1 || year < 1800 || year > 2100) return setErr(s.errDate);
    let hour = 12, minute = 0;
    if (!unknown) {
      const tm = time.trim().match(/^(\d{1,2})[:.](\d{2})$/);
      if (!tm || +tm[1] > 23 || +tm[2] > 59) return setErr(s.errTime);
      hour = +tm[1]; minute = +tm[2];
    }
    let p = place;
    if (manual) {
      const la = parseFloat(mLat.replace(',', '.')), lo = parseFloat(mLon.replace(',', '.'));
      if (isNaN(la) || isNaN(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180 || !mTz.includes('/')) return setErr(s.errPlace);
      p = { label: `${la.toFixed(2)}, ${lo.toFixed(2)}`, lat: la, lon: lo, tz: mTz.trim() };
    }
    if (!p) return setErr(s.errPlace);
    setErr('');
    onSubmit({ name: name.trim(), place: p.label, birth: { year, month, day, hour, minute, timeKnown: !unknown, lat: p.lat, lon: p.lon, tz: p.tz } });
  };

  return (
    <View>
      <Field label={nameLabel ?? s.name} value={name} onChangeText={setName} />
      <Field label={s.birthDate} value={date} onChangeText={setDate} placeholder="14.03.2003" keyboardType="numbers-and-punctuation" />
      {!unknown && <Field label={s.birthTime} value={time} onChangeText={setTime} placeholder="09:30" keyboardType="numbers-and-punctuation" />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Switch value={unknown} onValueChange={setUnknown} trackColor={{ true: C.rose, false: C.line }} />
        <P>{s.timeUnknown}</P>
      </View>
      {unknown && <Sub style={{ marginBottom: 12 }}>{s.timeUnknownNote}</Sub>}

      {!manual ? (
        <View>
          <Field label={s.birthPlace} value={q} onChangeText={t => { setQ(t); setPlace(null); }} placeholder={s.searchCity} />
          {busy && <Sub>{s.searching}</Sub>}
          {!busy && !place && q.length >= 2 && results.length === 0 && <Sub>{s.noResults}</Sub>}
          {!place && results.map((r, i) => (
            <Pressable key={i} onPress={() => { setPlace(r); setQ(r.label); setResults([]); }} style={({ pressed }) => [{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }, pressed && { opacity: 0.6 }]}>
              <Text style={st.p}>{r.label}</Text>
              <Text style={st.sub}>{r.lat.toFixed(2)}, {r.lon.toFixed(2)}, {r.tz}</Text>
            </Pressable>
          ))}
          {place && <Sub>{place.lat.toFixed(3)}, {place.lon.toFixed(3)}, {place.tz}</Sub>}
        </View>
      ) : (
        <View>
          <Field label={s.lat} value={mLat} onChangeText={setMLat} keyboardType="numbers-and-punctuation" placeholder="41.01" />
          <Field label={s.lon} value={mLon} onChangeText={setMLon} keyboardType="numbers-and-punctuation" placeholder="28.97" />
          <Field label={s.tz} value={mTz} onChangeText={setMTz} autoCapitalize="none" />
        </View>
      )}
      <Btn kind="ghost" title={s.manual} onPress={() => setManual(!manual)} />
      {err ? <Text style={{ color: C.rose, marginBottom: 6 }}>{err}</Text> : null}
      <Btn title={submitLabel} onPress={submit} />
    </View>
  );
}
