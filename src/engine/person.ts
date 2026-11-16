// Profil bilgisinden hayat takvimi için kişisel bağlam: cinsiyet (klasik eş göstergesi) ve geçmiş ilişki tarihleri
import type { PersonCtx } from './timeline';
import { parseDate, LifeEvent } from './rectify';

export function personCtx(p?: { gender?: 'f' | 'm'; events?: LifeEvent[] } | null): PersonCtx {
  return {
    gender: p?.gender ?? null,
    loveDates: (p?.events ?? []).filter(e => e.type === 'love').map(e => parseDate(e.date)).filter((d): d is Date => !!d),
  };
}
