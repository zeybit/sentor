// Hikâye boyutunda (1080×1920) paylaşım görselleri: önizleme + PNG indirme.
import React, { useMemo, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import { Sub } from './kit';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);

/** SVG metnini PNG'ye çevirip indirir; claude.ai içinde platformun indirme izni kullanılır */
export async function downloadSvgAsPng(svg: string, filename: string): Promise<'saved' | 'declined' | 'unavailable' | 'error'> {
  if (Platform.OS !== 'web') return 'unavailable';
  const g = globalThis as any;
  const uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const blob: any = await new Promise(res => {
    const img = new g.Image();
    img.onload = () => {
      const cv = g.document.createElement('canvas'); cv.width = 1080; cv.height = 1920;
      cv.getContext('2d').drawImage(img, 0, 0);
      cv.toBlob((b: any) => res(b), 'image/png');
    };
    img.onerror = () => res(null);
    img.src = uri;
  });
  if (!blob) return 'error';
  const dl = g.claude?.use ? await g.claude.use('downloads').catch(() => null) : null;
  if (dl) {
    try { await dl.save({ filename, data: blob }); return 'saved'; }
    catch (e: any) { return e?.code === 'declined' ? 'declined' : 'unavailable'; }
  }
  const a = g.document.createElement('a');
  a.href = g.URL.createObjectURL(blob); a.download = filename;
  g.document.body.appendChild(a); a.click(); a.remove();
  return 'saved';
}

export const safeName = (s: string) => s.toLocaleLowerCase('tr').replace(/[^a-z0-9ğüşıöç]+/gi, '-').replace(/^-|-$/g, '') || 'kart';

export function ShareSvg({ svg, filename, lang }: { svg: string; filename: string; lang: Lang }) {
  const uri = useMemo(() => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), [svg]);
  const [msg, setMsg] = useState('');
  if (Platform.OS !== 'web') return null;
  const go = async () => {
    const r = await downloadSvgAsPng(svg, filename);
    setMsg(r === 'saved' ? tx('Görsel kaydedildi.', 'Image saved.', lang) : r === 'declined' ? tx('İndirme iptal edildi.', 'Download cancelled.', lang) : r === 'unavailable' ? tx('Bu görünümde indirme kullanılamıyor.', 'Downloads are unavailable in this view.', lang) : tx('Görsel oluşturulamadı.', 'Could not create the image.', lang));
  };
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={{ uri }} style={{ width: 252, height: 448, borderRadius: 16 }} accessibilityLabel={tx('Paylaşım kartı önizlemesi', 'Share card preview', lang)} />
      <Pressable accessibilityRole="button" onPress={go} style={{ marginTop: 12, backgroundColor: C.rose, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 }}>
        <Text style={{ color: C.bg, fontFamily: F.sansBold, fontWeight: '700' }}>{tx('Görsel olarak indir', 'Download as image', lang)}</Text>
      </Pressable>
      {msg ? <Sub style={{ marginTop: 6 }}>{msg}</Sub> : null}
      <Sub style={{ marginTop: 6, textAlign: 'center' }}>{tx('Hikâye boyutunda (1080×1920); Instagram ya da WhatsApp’ta paylaşabilirsin.', 'Story size (1080×1920) to share on Instagram or WhatsApp.', lang)}</Sub>
    </View>
  );
}

/** Kapalı başlar; dokununca kartı açar */
export function ShareToggle({ label, build, filename, lang }: { label: string; build: () => string; filename: string; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const svg = useMemo(() => (open ? build() : ''), [open, build]);
  if (Platform.OS !== 'web') return null;
  return (
    <View style={{ marginVertical: 10 }}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(o => !o)}
        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.rose, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16 }}>
        <Text style={{ color: C.rose, fontFamily: F.sansBold, fontWeight: '700', fontSize: 14 }}>{open ? tx('Kartı gizle', 'Hide card', lang) : `↗ ${label}`}</Text>
      </Pressable>
      {open && svg ? <View style={{ marginTop: 14 }}><ShareSvg svg={svg} filename={filename} lang={lang} /></View> : null}
    </View>
  );
}
