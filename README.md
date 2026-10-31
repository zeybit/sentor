# Gökyüzü Haritam

Türkçe/İngilizce astroloji mobil uygulaması (Expo + React Native + TypeScript).

## Özellikler
- **Doğum haritası:** Güneş–Plüton, Kuzey/Güney Ay Düğümü, Lilith, Şans Noktası, Vertex; ev konumları, açılar, element dengesi, gezegen güçleri (yönetici/yücelim/zarar/düşüş), ev yöneticisi yorumları, harita çarkı.
- **Ev sistemleri (11):** Placidus, Koch, Porphyry, Regiomontanus, Campanus, Eşit, Tam Burç, Alcabitius, Topocentric, Morinus, Meridyen (kutup enlemlerinde otomatik Porphyry). Tropikal veya sidereal (Lahiri) zodyak.
- **Asteroitler:** Chiron, Ceres, Pallas, Juno, Vesta (ayarlardan aç/kapa).
- **Harita türleri (Harita sekmesi):** Doğum, Transit (çift çark), İkincil progresyon, Solar Arc, Güneş dönüşü, Ay dönüşü, Antiscia, Şimdiki gökyüzü — tarih çubuğuyla saat/gün/hafta/ay/yıl ileri-geri, elle tarih ve oynatma.
- **Yorum tarzı:** Her yerleşim (burç + ev) ve her açı için ayrı başlık ve paragraf; ~70 gezegen çiftine özel açı metni, gezegen-ev metinleri, transit/progresyon/dönüş yorumları (özgün metinler).
- **Tablolar:** Konumlar (derece, ev, deklinasyon), ev başlangıçları, üçgen açı ızgarası, element/nitelik yüzdeleri, Arap noktaları (15), orta noktalar, paraleller, sabit yıldızlar, Lilly güç tablosu.
- **Araçlar:** Astrokartografi (MC/IC/ASC/DSC çizgileri ve yakın şehirler), Bulucu (gelecekteki transitleri arar).
- **Stil:** Venüs (zevk), Yükselen (silüet, saç, makyaj), Ay (rahat kombin), Mars (spor), MC (iş imajı), 1. ev gezegenleri, kişisel renk paleti.
- **Aşk:** Venüs, Mars, 5. ve 7. ev, Venüs’ün evi, 7. ev gezegenleri + kayıtlı kişilerle sinastri (çift çark, uyum yüzdesi, açı yorumları), Kompozit ve Davison haritaları.
- **Ayarlar:** Birden çok kişi kaydı, açık/koyu tema, ev sistemi, zodyak, güncel konum.
- **Kariyer (Portföy içinde):** MC yönü ve uygun alanlar, 10. ev gezegenleri, 6. ev çalışma tarzı, 2. ev para ilişkisi, Jüpiter ve Satürn.
- **Bugün:** Kişisel transitler, Ay burcu/fazı/evi, günlük puanlar, retro gezegenler, gezegen saatleri, aylık transit listesi (istasyonlar ve burç geçişleri dahil), Ay takvimi (fazlar ve Ay'ın burç geçişleri).
- **Portföy:** Hayat, stil & partner portföyü — aura ve gardırop, makyaj/ten bitişi/dudak-allık tonları/saç, gelecekteki eş profili (Alçalan, 7. ev yöneticisi, Juno, Venüs–Mars), harita yöneticisi, kariyer, 2./8. ev, Ay Düğümleri ve 3 somut tavsiye.
- **Soru Sor (horary):** Sorunun sorulduğu an ve yer için Regiomontanus haritası; soran ve konu göstergeleri, perfection, ışık aktarımı, engelleme, refranation, karşılıklı kabul, boşta Ay, erken/geç yükselen, Satürn köşede uyarıları ve zamanlama. Kurallar William Lilly (Christian Astrology) ve Öner Döşer'e (The Art of Horary Astrology) dayanır. Sağlık, hukuk ve hamilelik soruları bilinçli olarak yoktur.
- **Klasik tarifler (Lilly, 1647):** Yükselen ve eş görünümü Lilly'nin kuralıyla (ev burcu + yönetici burcu + Ay + evdeki gezegenler), meslek göstergeleri (MC yöneticisi ve 10. ev), klasik renkler.
- **Doğum haritası yorumunun temeli Lilly (Christian Astrology III, 1647):** Harita sekmesinde Lilly'nin kendi karar sıralarıyla yorum — harita efendisi, mizaç (sıcak/soğuk/nemli/kuru sayımı), karakter göstergesi ve gezegen karışımları, sabit yıldızlar, zekâ (Merkür–Ay), zenginlik (göstergeler, kaynak, meşru yol, süreklilik, zamanlama), evlilik (istek, kolaylık, partnerin geldiği yer ve karakteri, aforizmalar, uyum), meslek (Merkür/Venüs/Mars beş adımlı kural, karışımlar, başarı), yolculuk, dostlar, Lilly güç tablosu (esas + ilineksel onurlar), yıllık ve aylık profeksiyon ve Güneş dönüşü (Bugün sekmesinde). Aşk sekmesindeki uyum analizine Lilly'nin "iki kişi arasındaki uyum" kuralı (Bölüm CLI) eklenir. Ömür, ölüm ve hastalık hükümleri bilinçli olarak yoktur.
- **Trendler:** Sosyal medyada en çok konuşulan 30 yerleşim; haritanda olanlar, popüler iddia + astrolojik anlamıyla (özgün metin).

## Doğruluk
- Gezegen konumları `astronomy-engine` ile hesaplanır (görünür, geosentrik, tropikal, gerçek ekliptik).
- `npm run verify`: 400 rastgele haritayı Swiss Ephemeris ile karşılaştırır. Son sonuç: gezegenlerde ≤ 21″, ev başlangıçları/ASC/MC ≤ 0.3″, burç/ev/retro uyuşmazlığı 0. Lilith (ortalama apoje) ≈ 7′ farkla. 11 ev sistemi, sidereal, asteroitler, progresyon, Güneş dönüşü, Ay fazları ve gün doğumu da Swiss Ephemeris ile test edilir. Asteroitler Swiss Ephemeris dosyasından üretilmiş 1900–2100 tablosundan okunur ( test: `SE_EPHE_PATH=<seas_18.se1 klasörü> npm run verify`).
- Doğum saati IANA saat dilimi veritabanıyla (yaz saati ve tarihsel değişiklikler dahil) UTC’ye çevrilir.
- Şehir arama: Open-Meteo Geocoding (internet), çevrimdışıyken yerleşik şehir listesi; elle koordinat da girilebilir.

## Çalıştırma
```bash
npm install
npx expo start          # telefonda Expo Go ile QR kodu okut
npm run typecheck
npm run verify          # Swiss Ephemeris ile doğruluk testi
npm run build:web       # web çıktısı → dist/
```
Horary testi: `npx tsx test/horary.ts` (açı anları Swiss Ephemeris ile karşılaştırılır).

Mağaza derlemesi: `npx eas-cli@latest build --platform android` (veya ios).

## Cloudflare ile yayın
Repodaki `wrangler.jsonc`, `dist/` klasörünü Cloudflare Workers'ta statik site olarak yayınlar.
- Deploy command: `npx wrangler deploy` (derleme dosyadaki `build.command` ile otomatik yapılır)
- Worker adı `wrangler.jsonc` içindeki `name` ile aynı olmalı (`sentor`).

`main` dalına yapılan her push otomatik olarak yeniden yayınlanır.

## Not
Astroloji bilimsel olarak kanıtlanmış bir yöntem değildir; uygulama eğlence ve kişisel keşif amaçlıdır. Bu not uygulamanın Ayarlar > Hakkında bölümünde ve giriş ekranında yer alır.
