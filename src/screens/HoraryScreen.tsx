import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useStore } from '../store';
import { castHorary, HoraryResult } from '../engine/horary';
import { QUESTIONS, VERDICT_TEXT, Q_LINE, sigLine, horaryNotes } from '../content/horaryText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HOUSES } from '../content/base';
import { searchPlaces, Place } from '../ui/BirthForm';
import Wheel from '../ui/Wheel';
import { Btn, Field, H1, P, Section, Sub, st, useLayout } from '../ui/kit';
import { C, serif } from '../theme';

interface Asked { key: string; at: string; lat: number; lon: number; label: string; question: string }
const HKEY = 'horary.history.v1';

export default function HoraryScreen() {
  const { s, lang, profile } = useStore();
  const t = s.hq;
  const { inner } = useLayout();
  const [qKey, setQKey] = useState(QUESTIONS[0].key);
  const [text, setText] = useState('');
  const [place, setPlace] = useState<Place | null>(profile ? { label: profile.place, lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null);
  const [editPlace, setEditPlace] = useState(!profile);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ r: HoraryResult; asked: Date; question: string; key: string; repeat?: boolean } | null>(null);
  const [hist, setHist] = useState<Asked[]>([]);
  useEffect(() => { AsyncStorage.getItem(HKEY).then(v => { try { setHist(v ? JSON.parse(v) : []); } catch { /* bozuk kayıt */ } }).catch(() => {}); }, []);
  const saveHist = (h: Asked[]) => { setHist(h); AsyncStorage.setItem(HKEY, JSON.stringify(h)).catch(() => {}); };
  /** Kayıtlı bir soruyu ilk sorulduğu anın haritasıyla yeniden açar: aynı an, aynı yanıt */
  const reopen = (a: Asked, repeat = false) => {
    const qq = QUESTIONS.find(x => x.key === a.key) ?? QUESTIONS[0];
    const asked = new Date(a.at);
    setRes({ r: castHorary(asked, a.lat, a.lon, qq.house), asked, question: a.question, key: qq.key, repeat });
  };
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!editPlace || q.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => setResults(await searchPlaces(q.trim(), lang)), 400);
    return () => clearTimeout(timer.current);
  }, [q, editPlace]);

  const fmt = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: place?.tz }).format(d);

  const ask = (force = false) => {
    if (!place) return;
    // Lilly: aynı soru kısa süre içinde yeniden sorulursa ilk haritanın yanıtı geçerlidir
    const prev = hist.find(h => h.key === qKey && Date.now() - new Date(h.at).getTime() < 24 * 3600e3);
    if (prev && !force) { reopen(prev, true); return; }
    setBusy(true);
    setTimeout(() => {
      const asked = new Date();
      const qq = QUESTIONS.find(x => x.key === qKey)!;
      const question = text.trim() || qq.label[lang];
      try {
        setRes({ r: castHorary(asked, place.lat, place.lon, qq.house), asked, question, key: qq.key });
        saveHist([{ key: qq.key, at: asked.toISOString(), lat: place.lat, lon: place.lon, label: place.label, question }, ...hist.filter(h => !(h.key === qq.key && force))].slice(0, 12));
      } finally { setBusy(false); }
    }, 30);
  };

  if (res) {
    const { r } = res;
    const v = VERDICT_TEXT[r.verdict];
    const n = horaryNotes(r, fmt);
    const col = v.tone === 'good' ? C.earth : v.tone === 'mixed' ? C.gold : C.rose;
    return (
      <View>
        <Sub>{fmt(res.asked)}, {place?.label}</Sub>
        <H1>{res.question}</H1>
        {res.repeat ? (
          <View style={[st.panel, { marginBottom: 16 }]}>
            <P>{lang === 'tr' ? `Bu soruyu ${fmt(res.asked)} tarihinde zaten sordun. Soru astrolojisinde (horary) harita, sorunun ilk içtenlikle sorulduğu ana göre kurulur; aynı soruyu tekrar sormak yeni bir yanıt vermez, ilk haritanın yanıtı geçerlidir. Bu yüzden o anın yanıtını gösteriyoruz.` : `You already asked this on ${fmt(res.asked)}. In horary the chart is cast for the moment the question was first sincerely asked; asking again gives no new answer, the first chart stands. So here is that moment’s answer.`}</P>
            <Btn kind="ghost" small title={lang === 'tr' ? 'Durum gerçekten değişti, yeni harita kur' : 'The situation really changed, cast a new chart'} onPress={() => { setRes(null); setTimeout(() => ask(true), 0); }} />
          </View>
        ) : null}
        <Section>
          <Text style={{ fontFamily: serif, fontSize: 22, lineHeight: 28, color: col, marginBottom: 6 }}>{v.title[lang]}</Text>
          <P>{Q_LINE[res.key]?.[v.tone]?.[lang] ?? ''}</P>
          <P style={{ marginTop: 6 }}>{v.body[lang]}</P>
        </Section>
        <Section title={t.details}>
          <View style={st.row}><P>{sigLine(r.querent, { tr: t.you, en: t.you }, r)[lang]}</P></View>
          <View style={st.row}><P>{sigLine(r.quesited, { tr: `${t.matter} (${HOUSES[r.house - 1].name.tr})`, en: `${t.matter} (${HOUSES[r.house - 1].name.en})` }, r)[lang]}</P></View>
          {n.details.map((d, i) => <View key={i} style={st.row}><P>{d[lang]}</P></View>)}
        </Section>
        {n.timing ? <Section title={t.timing}><P>{n.timing[lang]}</P></Section> : null}
        {n.considerations.length ? (
          <Section title={t.considerations}>
            {n.considerations.map((c, i) => <View key={i} style={st.row}><P>{c[lang]}</P></View>)}
          </Section>
        ) : null}
        <Section title={t.chartAt}>
          <View style={{ alignItems: 'center' }}><Wheel chart={r.chart} size={Math.min(inner(760), 440)} /></View>
          <Sub style={{ marginTop: 8 }}>Regiomontanus</Sub>
        </Section>
        <Sub style={{ marginBottom: 10 }}>{t.note}</Sub>
        <Btn title={t.askAgain} onPress={() => { setRes(null); setText(''); }} />
      </View>
    );
  }

  return (
    <View>
      <H1>{t.title}</H1>
      <Sub style={{ marginBottom: 8 }}>{t.intro}</Sub>
      <Sub style={{ marginBottom: 14, color: C.ink }}>{t.rules}</Sub>

      <Section title={t.pick}>
        {QUESTIONS.map(x => (
          <Pressable key={x.key} onPress={() => setQKey(x.key)} accessibilityRole="radio" accessibilityState={{ selected: qKey === x.key }}
            style={({ pressed }) => [st.row, { flexDirection: 'row', gap: 12, alignItems: 'center' }, pressed && { opacity: 0.6 }]}>
            <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: qKey === x.key ? C.rose : C.line, alignItems: 'center', justifyContent: 'center' }}>
              {qKey === x.key ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.rose }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.p, { fontWeight: qKey === x.key ? '700' : '400' }]}>{x.label[lang]}</Text>
              <Text style={st.sub}>{x.hint[lang]}</Text>
            </View>
          </Pressable>
        ))}
      </Section>

      <Section>
        <Field label={t.yourQ} value={text} onChangeText={setText} />
        <Text style={st.label}>{t.place}</Text>
        {!editPlace && place ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <P>{place.label}</P>
            <Btn kind="ghost" title={t.change} onPress={() => { setEditPlace(true); setQ(''); }} />
          </View>
        ) : (
          <View>
            <Field label="" value={q} onChangeText={setQ} placeholder={s.searchCity} />
            {results.map((p, i) => (
              <Pressable key={i} onPress={() => { setPlace(p); setEditPlace(false); setResults([]); }} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }}>
                <Text style={st.p}>{p.label}</Text>
                <Text style={st.sub}>{p.tz}</Text>
              </Pressable>
            ))}
          </View>
        )}
        <Btn title={busy ? '…' : t.ask} onPress={() => ask()} disabled={!place || busy} />
        <Sub style={{ marginTop: 8 }}>{lang === 'tr' ? 'Yanıt, sorunun sorulduğu dakikanın gökyüzüne göre çıkar; bu yüzden farklı anlarda farklı, aynı soruyu tekrar sorduğunda ise aynı yanıtı görürsün.' : 'The answer depends on the sky at the minute you ask; so different moments give different answers, and asking the same question again shows the same answer.'}</Sub>
      </Section>
      {hist.length ? (
        <Section title={lang === 'tr' ? 'Son soruların' : 'Your recent questions'}>
          {hist.slice(0, 6).map((h, i) => (
            <Pressable key={i} onPress={() => reopen(h)} accessibilityRole="button" style={({ pressed }) => [st.row, pressed && { opacity: 0.6 }]}>
              <Text style={st.p}>{h.question}</Text>
              <Text style={st.sub}>{fmt(new Date(h.at))}, {h.label}</Text>
            </Pressable>
          ))}
        </Section>
      ) : null}
    </View>
  );
}
