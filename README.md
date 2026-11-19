<div align="center">

  # 💛💙 Fenerbahçe 1907 — Çok Branşlı Canlı Takip & Tahmin Ligi

  <p align="center">
    <strong>Sıfır maliyetli mimariyle Futbol, Basketbol ve Voleybol canlı skorları, marş oynatıcısı, bildirim merkezi ve arkadaş grubu tahmin ligi.</strong>
  </p>

  <p align="center">
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" /></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <img src="https://img.shields.io/badge/Cloudflare%20Worker-0%E2%82%BA-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Worker" />
  </p>

</div>

---

## 🌟 Özellikler

### 🏠 1. Modüler Ana Sayfa & Canlı Nabız
- **Canlı Ticker & Maç Hero Kartı:** Maç sürerken otomatik 15–20 sn polling (TanStack Query), geri sayım ve `Europe/Istanbul` takvim günüyle doğru **"BUGÜN MAÇ GÜNÜ!"** tespiti.
- **Maç Günü Hava Durumu:** Kadıköy iç saha maçlarında Open-Meteo üzerinden saatlik/anlık hava durumu.
- **Puan Durumu Önizlemesi & Tarihte Bugün:** Süper Lig'de Fenerbahçe sabitlenmiş canlı tablo özeti ve 28 olaylı kulüp tarihi kartı.

### ⚽ 2. Canlı Maç Merkezi 2.0 (`app/mac/[id].tsx`)
- **Dakika Dakika Anlatım & Olaylar:** ESPN `commentary` + `keyEvents` verisinden Türkçe saha olayları, sarı/kırmızı kartlar, VAR kararları ve değişiklikler.
- **Dinamik Saha Dizilişi & Momentum:** Çarpışma çözücülü formasyon tahtası, gerçek istatistiklerden hesaplanan momentum ve gol anında canlı banner + haptic titreşim.
- **Skor Tahmini & Tek Tık Hatırlatma (🔔):** Maç başlamadan skor kaydetme (3P tam skor / 1P doğru sonuç) ve 1 saat / 15 dk öncesi için yerel hatırlatma planlama.

### 🏆 3. Arkadaş Tahmin Ligi (`app/tahmin-ligi.tsx`)
- **Oda Kodu & Takma Ad:** `FBXXXX` oda kodu oluşturup arkadaş grubuyla aynı sıralamada yarışma (`worker/` D1 veritabanı üzerinden senkron veya Worker olmadan yerel mod + WhatsApp/Share kartı).

### 👥 4. Kadro & Oyuncu Profili 2.0 (`app/sporcular.tsx`)
- **Çok Kaynaklı Canlı Kadrolar:** Futbolda ESPN (+ sezon istatistiği & fiziksel profil), Erkek Basketbolda **EuroLeague v2/v3 canlı kadro & sezon ortalamaları** (Wikipedia yedekli), Kadın Voleybolda Wikipedia ve diğer branşlarda sezon listeleri.

### 🔔 5. Bildirim Merkezi & Cloudflare Maç Motoru (`app/bildirimler.tsx` & `worker/`)
- **Sunucusuz Yerel Hatırlatmalar:** `expo-notifications` ile maçtan 1 saat ve 15 dk önce yerel uyarılar.
- **Gizli `ntfy.sh` Kanalı + 7/24 Cloudflare BFF:** `worker/` klasöründeki Cron + SQLite Durable Object (`MatchWatcher`) + D1 altyapısı sayesinde bilgisayar kapalıyken bile ~15 sn içinde gol, kırmızı kart, VAR iptali ve çeyrek sonu push bildirimi.

### 🎵 6. Global Marşlar 2.0 (`app/(tabs)/marslar.tsx`)
- **Arka Plan Sesi & Yüzen Mini Oynatıcı:** Tüm ekranlarda görünen `MiniAnthemPlayer`, favoriler, karıştırma, tek parça/liste tekrar, sarma ve senkronize söz modalı.

### 📊 7. Puan Durumları, Derbi Merkezi, Tarih Arşivi & Haberler
- **Puan Durumu (`app/puan-durumu.tsx`):** Trendyol Süper Lig, UEFA Şampiyonlar Ligi, UEFA Avrupa Ligi ve EuroLeague tabloları.
- **Derbi Merkezi (`app/derbi-merkezi.tsx`):** GS, BJK ve TS karşısındaki form ve rekabet özeti.
- **Tarihte Fenerbahçe (`app/tarih-arsivi.tsx`):** 28 dönüm noktası, kategori/yıl arama ve paylaşım.
- **Çoklu RSS Haber Akışı (`app/haberler.tsx`):** Fotomaç, TRT Spor ve NTV Spor (Fenerbahçe filtreli) tek akışta.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
| :--- | :--- |
| **İstemci** | Expo SDK 57, React 19.2, React Native 0.86, Expo Router, TypeScript 6.0 |
| **Durum & Önbellek** | TanStack Query v5, `expo-sqlite` kalıcı depolama (platform ayrımlı) |
| **Medya & UI** | `expo-audio`, `expo-image`, `expo-haptics`, `react-native-reanimated`, Semantik Aydınlık/Karanlık Tema |
| **Bildirimler** | `expo-notifications`, `ntfy.sh`, Expo Push Service |
| **Sunucu (Opsiyonel 0 ₺)** | Cloudflare Workers + D1 SQLite + SQLite Durable Objects (`worker/`) |
| **Test & CI** | Vitest (`npm test`), TypeScript (`npm run typecheck`), GitHub Actions (`.github/workflows/ci.yml`) |

---

## 📁 Proje Yapısı

```text
fenerbahce-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Ana Sayfa
│   │   ├── fikstur.tsx         # Canlı / Yaklaşan / Biten Fikstür
│   │   ├── marslar.tsx         # Marşlar & Besteler
│   │   ├── daha.tsx            # Tema, Özet & Kısayollar
│   │   └── _layout.tsx
│   ├── mac/[id].tsx            # Canlı Maç Merkezi
│   ├── tahmin-ligi.tsx         # Çok Oyunculu Arkadaş Tahmin Ligi
│   ├── bildirimler.tsx         # Bildirim Merkezi & Worker Eşitleme
│   ├── tarih-arsivi.tsx        # 1907'den Bugüne Tarih Arşivi
│   ├── sporcular.tsx           # 6 Branş Kadro & Oyuncu İstatistikleri
│   ├── puan-durumu.tsx         # Süper Lig / ŞL / UEL / EuroLeague
│   ├── derbi-merkezi.tsx       # GS / BJK / TS Derbi Merkezi
│   ├── haberler.tsx            # Çoklu RSS Haber Akışı
│   └── _layout.tsx             # Kök Query, Tema, Bildirim & Mini Player
├── features/                   # Modüler UI ve parser'lar (home, matches, anthems, squads)
├── services/                   # API istemcileri, kalıcı cache, bildirim & tahmin ligi
├── context/                    # ThemeContext & AnthemPlayerContext
├── data/                       # Marşlar & Tarihte Fenerbahçe verisi
├── utils/                      # safeFetch, storage (SQLite/web), haptics, browser
├── worker/                     # Cloudflare Free Tier BFF (Cron + DO + D1 + Push + Tahmin API)
├── backend/                    # Yerel Node.js canlı maç izleyicisi (liveWatcher.mjs)
├── __tests__/                  # Vitest birim testleri
├── eas.json                    # Android preview APK & EAS Update profilleri
└── .github/workflows/ci.yml    # Otomatik typecheck + test CI akışı
```

---

## 🚀 Kurulum, Test ve Dağıtım

### 1. Geliştirme & Test
```bash
npm install
npm run typecheck
npm test
npx expo start
```

### 2. Cloudflare Worker Maç Motorunu Kurma (0 ₺)
Ayrıntılı 5 adımlık kurulum için [worker/README.md](worker/README.md) dosyasına bakın:
```bash
cd worker
npm install
npm run typecheck
npx wrangler login
```

### 3. Android APK Üretme & OTA Güncelleme (`eas.json`)
Expo Go üzerinde Android uzak push bildirimleri kısıtlı olduğu için gerçek bildirimlerde **preview/development build** önerilir:
```bash
# Tek seferlik APK üretimi (arkadaşlara paylaşılabilir)
npx eas build --platform android --profile preview

# Sonraki JS/UI değişikliklerini APK yenilemeden gönderme
npx eas update --channel preview
```

---

## 🔒 Güvenlik ve Telif Notu
- Arkadaş grubu içi kişisel kullanım için deponuzu **Private** tutmanız ve [data/marslarData.ts](data/marslarData.ts) içindeki ses dosyalarını herkese açık GitHub Release yerine kendi kapalı **Cloudflare R2** alanınıza (ücretsiz 10 GB) taşımanız önerilir.
