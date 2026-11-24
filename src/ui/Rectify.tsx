// Doğum saati düzeltme ekranı
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useStore } from '../store';
import { rectify, EventType, LifeEvent, Candidate, parseDate } from '../engine/rectify';
import { SIGNS } from '../content/base';
import { Btn, Chips, P, Section, Sub, st } from './kit';
import { C, F, serif } from '../theme';
import { maskDate, dateProblem } from '../util';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const TYPES: { key: EventType; tr: string; en: string }[] = [
  { key: 'love', tr: 'Evlilik / ciddi ilişki başlangıcı', en: 'Marriage / serious relationship' },
  { key: 'breakup', tr: 'Ayrılık / boşanma', en: 'Breakup / divorce' },
  { key: 'career', tr: 'İşe başlama / terfi / mezuniyet', en: 'New job / promotion / graduation' },
  { key: 'move', tr: 'Taşınma / ev alma', en: 'Moving / buying a home' },
  { key: 'child', tr: 'Çocuk doğumu', en: 'Birth of a child' },
  { key: 'loss', tr: 'Kayıp / yas', en: 'Loss / bereavement' },
  { key: 'health', tr: 'Kaza / ameliyat', en: 'Accident / surgery' },
];
const pad = (n: number) => String(n).padStart(2, '0');

export default function Rectify() {
  const { profile, setProfile, opts, lang } = useStore();
  const [events, setEvents] = useState<LifeEvent[]>(() => profile?.events ?? [{ date: '', type: 'love' }, { date: '', type: 'career' }, { date: '', type: 'move' }]);
  const [busy, setBusy] = useState<number | null>(null);
  const [res, setRes] = useState<{ list: Candidate[]; used: number } | null>(null);
  const [err, setErr] = useState('');
  const [applied, setApplied] = useState('');
  if (!profile) return null;
  const b = profile.birth;
  const upd = (i: number, patch: Partial<LifeEvent>) => setEvents(es => es.map((e, k) => (k === i ? { ...e, ...patch } : e)));
  const valid = events.filter(e => parseDate(e.date));
  const run = async () => {
    setErr(''); setApplied('');
    if (valid.length < 3) { setErr(tx('En az üç olayın tarihini GG.AA.YYYY biçiminde gir.', 'Enter at least three event dates as DD.MM.YYYY.', lang)); return; }
    setBusy(0); setRes(null);
    setProfile({ ...profile, events: valid });
    const r = await rectify(b, valid, opts, lang, p => setBusy(p));
    setBusy(null); setRes(r);
  };
  const apply = (c: Candidate) => {
    setProfile({ ...profile, birth: { ...b, hour: c.hour, minute: c.minute, timeKnown: true }, events: valid });
    setApplied(`${pad(c.hour)}:${pad(c.minute)}`);
  };
  const best = res?.list[0]?.score ?? 1;

  return (
    <View>
      <Section title={tx('Doğum saatini olaylarınla düzelt', 'Rectify your birth time with life events', lang)}
        sub={b.timeKnown ? tx(`Kayıtlı saatin ${pad(b.hour)}:${pad(b.minute)}. Uygulama bu saatin iki saat öncesi ve sonrasını tarar.`, `Your saved time is ${pad(b.hour)}:${pad(b.minute)}. The app scans two hours either side.`, lang)
          : tx('Doğum saatin bilinmiyor; uygulama günün 24 saatini tarar.', 'Your birth time is unknown; the app scans the whole day.', lang)}>
        <P style={{ marginBottom: 12 }}>{tx('Hayatındaki önemli olayların tarihlerini gir. Her olay belirli bir köşeyle ilgilidir: evlilik partner noktasıyla, iş kariyer noktasıyla, taşınma yuva noktasıyla. Uygulama, olayların tarihinde gökyüzünün bu noktalara en çok dokunduğu doğum saatini bulur. Ne kadar çok ve ne kadar kesin tarih girersen sonuç o kadar güvenilir olur.', 'Enter the dates of important events. Each relates to a chart angle: marriage to the partner point, career to the career point, moving to the home point. The app finds the birth time at which the sky touched those points most on your event dates. More and more precise dates give a more reliable result.', lang)}</P>
        {events.map((e, i) => (
          <View key={i} style={[st.panel, { marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Text style={{ fontFamily: F.sansBold, fontWeight: '700', color: C.gold }}>{i + 1}.</Text>
              <TextInput value={e.date} onChangeText={v => upd(i, { date: maskDate(v, e.date) })} maxLength={10} placeholder={tx('GG.AA.YYYY', 'DD.MM.YYYY', lang)} placeholderTextColor={C.sub} keyboardType="numbers-and-punctuation"
                accessibilityLabel={tx(`${i + 1}. olayın tarihi`, `Date of event ${i + 1}`, lang)}
                style={{ flex: 1, borderWidth: 1, borderColor: e.date && !parseDate(e.date) ? C.fire : C.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, color: C.ink, backgroundColor: C.bg }} />
              {events.length > 3 ? <Pressable accessibilityRole="button" accessibilityLabel={tx('Olayı sil', 'Remove event', lang)} onPress={() => setEvents(es => es.filter((_, k) => k !== i))}><Text style={{ color: C.fire, fontSize: 18, paddingHorizontal: 6 }}>×</Text></Pressable> : null}
            </View>
            {dateProblem(e.date, lang) ? <Text accessibilityRole="alert" style={{ color: C.fire, fontSize: 13, marginBottom: 6, fontFamily: F.sansMed }}>{dateProblem(e.date, lang)}</Text> : null}
            <Chips items={TYPES.map(t => ({ key: t.key, label: t[lang] }))} value={e.type} onChange={v => upd(i, { type: v as EventType })} />
          </View>
        ))}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
          {events.length < 8 ? <Btn kind="ghost" title={tx('+ Olay ekle', '+ Add event', lang)} onPress={() => setEvents(es => [...es, { date: '', type: 'career' }])} /> : null}
          <Btn title={busy !== null ? tx(`Hesaplanıyor… %${Math.round(busy * 100)}`, `Calculating… ${Math.round(busy * 100)}%`, lang) : tx('Doğum saatimi bul', 'Find my birth time', lang)} onPress={busy !== null ? () => {} : run} />
        </View>
        {err ? <Sub style={{ color: C.fire, marginTop: 8 }}>{err}</Sub> : null}
      </Section>

      {res ? (
        <Section title={tx('En olası doğum saatlerin', 'Your most likely birth times', lang)} sub={tx(`${res.used} olaya göre hesaplandı.`, `Based on ${res.used} events.`, lang)}>
          {!res.list.length || res.list[0].score < 0.5 ? <P>{tx('Bu olaylar belirgin bir saate işaret etmiyor. Daha fazla ya da daha kesin tarihli olay eklemeyi dene.', 'These events do not point clearly to one time. Try adding more or more precise events.', lang)}</P> : res.list.map((c, i) => (
            <View key={i} style={[st.panel, { marginBottom: 12, borderLeftWidth: 3, borderLeftColor: i === 0 ? C.gold : C.line }]}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <Text style={{ fontFamily: serif, fontSize: 34, color: C.ink }}>{pad(c.hour)}:{pad(c.minute)}</Text>
                <Text style={st.sub}>{tx('Yükselen', 'Rising', lang)} {SIGNS[Math.floor(c.asc / 30)][lang]} · MC {SIGNS[Math.floor(c.mc / 30)][lang]}</Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, marginTop: 6 }}>
                <View style={{ width: `${Math.round((c.score / best) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: i === 0 ? C.gold : C.sub }} />
              </View>
              <Sub style={{ marginTop: 6 }}>{tx('Eşleşen göstergeler', 'Matching indicators', lang)}: {[...new Set(c.hits.map(h => `${h.event + 1}. ${h.text}`))].slice(0, 5).join('; ') || '—'}</Sub>
              <View style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                <Btn small kind={i === 0 ? 'primary' : 'ghost'} title={tx('Bu saati kullan', 'Use this time', lang)} onPress={() => apply(c)} />
              </View>
            </View>
          ))}
          {applied ? <P style={{ color: C.earth, fontWeight: '700' }}>{tx(`Doğum saatin ${applied} olarak güncellendi; bütün yorumlar yeni saate göre yeniden hesaplandı.`, `Your birth time is now ${applied}; all readings were recalculated.`, lang)}</P> : null}
          <Sub style={{ marginTop: 6 }}>{tx('Bu bir tahmindir. Kesin saati hastane kaydı ya da nüfus belgesi verir; onlara ulaşabiliyorsan önce onları kullan.', 'This is an estimate. A hospital record or birth certificate gives the exact time; use those first if you can.', lang)}</Sub>
        </Section>
      ) : null}
    </View>
  );
}
