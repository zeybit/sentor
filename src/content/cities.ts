// Büyük şehirler listesi (700 bin üzeri nüfus): kartografi, bulucu ve şehir önerileri için
import cityTz from 'city-timezones';

let BIG: { name: string; country: string; lat: number; lon: number; pop: number }[] | null = null;
export const bigCities = () => BIG ?? (BIG = (cityTz.cityMapping as any[]).filter(c => c.pop >= 700000).map(c => ({ name: c.city, country: c.country, lat: c.lat, lon: c.lng, pop: c.pop })));
