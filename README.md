<div align="center">

  # 💛💙 Fenerbahçe Spor Kulübü Mobil Uygulaması

  <p align="center">
    <strong>Sarı Lacivert sevdayı dijital dünyada yaşatan, modern ve eksiksiz taraftar mobil uygulaması.</strong>
  </p>

  <p align="center">
    <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" /></a>
    <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React%20Native-0.86-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <img src="https://img.shields.io/badge/Fenerbah%C3%A7e-1907-002D72?style=for-the-badge&logoColor=FFED00" alt="Fenerbahçe 1907" />
  </p>

  <sub>En son teknolojilerle geliştirilmiş, canlı spor API'leri ve kesintisiz ses akışı ile donatılmış yeni nesil Fenerbahçe mobil deneyimi.</sub>

</div>

---

## 🌟 Öne Çıkan Özellikler

### 🏠 1. Canlı Ana Sayfa (Home Hub)
* **Geri Sayım Sayacı (Match Countdown):** Sıradaki derbi veya lig maçına kalan gün, saat ve dakikayı canlı sayan dinamik gösterge.
* **Son Maç Skoru & Durum:** Kulübün en son oynadığı karşılaşmanın skoru ve detayları.
* **Canlı Puan Durumu Özeti:** Süper Lig'deki güncel sıramız ve puanımız tek bakışta.
* **Son Dakika Haber Kartları:** Kulüpten en güncel gelişmeler ve transfer haberleri.

### ⚽ 2. Canlı Puan Durumu & Fikstür (ESPN Canlı API Entegrasyonu)
* **Otomatik ve Gerçek Zamanlı:** Manuel veri girmeye son! Dünyanın önde gelen spor veri sağlayıcısı **ESPN API** ile tam entegrasyon.
* **Trendyol Süper Lig Tablosu:** Oynanan maç, galibiyet, beraberlik, mağlubiyet, atılan/yenilen gol, averaj ve puanlar anlık güncellenir.
* **Form Göstergeleri:** Takımların son 5 maçtaki performans grafiği (Galibiyet/Beraberlik/Mağlubiyet).

### 👥 3. Futbol Takımı & Kadro
* **Pozisyona Göre Filtreleme:** Kaleciler, Defans, Orta Saha ve Forvet hatları.
* **Detaylı Oyuncu Bilgileri:** Forma numarası, uyruk ve mevki detayları.
* **Teknik Heyet:** Teknik Direktör Emre Belözoğlu ve ekibi.

### 🎵 4. Marşlar & Besteler (Cloud CDN Audio Player)
* **Yeni Nesil `expo-audio` Motoru:** Expo SDK 57'nin en güncel yerel ses altyapısı.
* **+10s İleri / -10s Geri Sarma:** Şarkının istediğiniz yerine anında atlayabileceğiniz tek dokunuşluk sarma butonları.
* **İnteraktif İlerleme Çubuğu (Tap-to-Seek):** Zaman çubuğunda istenen saniyeye dokunarak zıplama ve canlı imleç (thumb).
* **Şarkı Sözleri Modalı:** Parçaların tüm kıtalarını içeren, sarı-lacivert vurgulu açılır söz penceresi.
* **0 MB Uygulama Boyutu:** Tüm parçalar küresel **Fastly/GitHub CDN** üzerinden anlık parçalı akışla (HTTP 206 Range Streaming) çalar; uygulamanın boyutunu şişirmez.
* **10 Efsane Parça:** Kıraç 100. Yıl, Nesrin Sipahi Yaşa Fenerbahçe, Selçuk Abay Bizler İnandık, Samanyolu, Ne Sevmek Ne Sevilmek, Bir Sabah Tuttu Babam Elimden ve daha fazlası.

### 📰 5. Haberler & Medya
* **TRT Spor & Kulüp Akışı:** XML/RSS ve API servisleri üzerinden anlık çekilen temiz haber akışı.
* **Detaylı Okuma:** Haber görseli, yayınlanma saati ve tam metin okuma görünümü.

### 🎨 6. Tasarım ve Tema
* **Resmi Kulüp Renkleri:** Lacivert (`#002D72`) ve Kanarya Sarısı (`#FFED00`).
* **Karanlık / Aydınlık Mod:** Telefonun sistem temasıyla tam uyumlu dinamik renk paleti.

---

## 🛠️ Teknoloji Yığını

| Alan | Teknoloji | Versiyon / Detay |
| :--- | :--- | :--- |
| **Çekirdek** | [React Native](https://reactnative.dev) | `0.86.3` |
| **Geliştirme Platformu** | [Expo](https://expo.dev) | `SDK 57.0.0` |
| **Kütüphane** | [React](https://react.dev) | `19.2.3` (Modern Concurrency) |
| **Yönlendirme / Navigasyon** | [Expo Router](https://docs.expo.dev/router/introduction/) | `~57.0.0` (File-based routing) |
| **Programlama Dili** | [TypeScript](https://www.typescriptlang.org) | `~5.9.2` (Tam tip güvenliği) |
| **Ses Oynatıcı** | [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) | `~57.0.5` (Native Audio Session) |
| **Görsel Optimizasyonu** | [expo-image](https://docs.expo.dev/versions/latest/sdk/image/) | `~57.0.0` (Hardware-accelerated cache) |
| **Spor Veri Sağlayıcı** | ESPN Public API | Canlı Süper Lig Puan Tablosu & Maçlar |
| **Ses Dağıtım Ağı (CDN)** | GitHub Fastly CDN | HTTP 206 Partial Content Audio Streaming |

---

## 📁 Proje Dizin Yapısı

```text
fenerbahce-app/
├── app/                          # Expo Router sayfa ve tab navigasyonu
│   ├── (tabs)/                   # Alt menü sekmeleri
│   │   ├── index.tsx             # Ana Sayfa (Canlı Skor, Geri Sayım, Tarihte Bugün, Puan Özeti)
│   │   ├── fikstur.tsx           # Fikstür & Canlı / Gelecek / Biten Maçlar
│   │   ├── marslar.tsx           # Marşlar & Besteler (CDN Ses Oynatıcı)
│   │   ├── daha.tsx              # Tahmin Ligi, ntfy Bildirim Kanalı, Menü & Bağlantılar
│   │   └── _layout.tsx           # Tab Bar yapılandırması
│   ├── mac/[id].tsx              # Canlı Maç Merkezi (Saha Dizilişi, Olaylar, İstatistik, Tahmin)
│   ├── sporcular.tsx             # 6 Branş A Takım Kadroları & Oyuncu Profilleri
│   ├── puan-durumu.tsx           # Süper Lig, Şampiyonlar Ligi & EuroLeague Puan Durumu
│   ├── haberler.tsx              # Çoklu RSS Haber Akışı
│   └── _layout.tsx               # Kök Layout & Tema Sağlayıcı
├── components/                   # MatchCard, SoccerPitch, CloudinaryImage vb.
├── constants/                    # Renk paletleri (Colors.ts - Sarı & Lacivert)
├── data/                         # Marşlar (marslarData.ts) ve Tarihte Bugün (historyData.ts)
├── services/                     # Canlı API Entegrasyonları (ESPN, EuroLeague, TheSportsDB, RSS, ntfy)
│   ├── fixtureService.ts         # Çoklu branş ve turnuva canlı fikstür servisi
│   ├── matchDetailService.ts     # Canlı maç merkezi, kadro ve olay motoru
│   ├── standingsService.ts       # Süper Lig, ŞL ve EuroLeague puan tablosu servisi
│   ├── athleteService.ts         # 6 branş sporcu kadro servisi
│   ├── newsService.ts            # Çoklu RSS haber birleştirici
│   └── fanEngagementService.ts   # Skor tahmin ligi ve ntfy.sh sıfır maliyetli bildirim servisi
├── types/                        # TypeScript model ve arayüz tanımları
├── app.json                      # Expo SDK 57 yapılandırma dosyası
└── tsconfig.json                 # TypeScript kuralları
```

---

## 🚀 Kurulum ve Çalıştırma

Projeyi bilgisayarınızda veya telefonunuzda çalıştırmak için aşağıdaki adımları takip edin:

### 1. Gereksinimler
* [Node.js](https://nodejs.org) (v18 veya üzeri önerilir)
* [Expo Go](https://expo.dev/client) mobil uygulaması (Android için Play Store, iOS için App Store'dan ücretsiz indirebilirsiniz)

### 2. Projeyi Klonlayın
```bash
git clone https://github.com/bedirhuseyinozcan/fenerbahce-app.git
cd fenerbahce-app
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Geliştirme Sunucusunu Başlatın
```bash
npx expo start
```

### 5. Telefonda Çalıştırma
* Terminalde açılan **QR kodu**, Android telefonunuzda **Expo Go** uygulamasından okutun; iOS'ta ise standart Kamera uygulamasından taratın.
* Kodlarda değişiklik yaptığınızda Fast Refresh sayesinde anında telefonunuzda canlı güncellenecektir.

---

## 💛💙 Katkıda Bulunma

1. Bu depoyu Fork'layın (`fork`).
2. Yeni özellik dalı açın (`git checkout -b feature/harika-ozellik`).
3. Değişikliklerinizi commit edin (`git commit -m 'feat: yeni özellik eklendi'`).
4. Dalınıza push yapın (`git push origin feature/harika-ozellik`).
5. Bir **Pull Request** açın.

---

<div align="center">
  <sub>Mustafa Kemal Atatürk'ün izinde, Sarı-Lacivert renklerin peşinde... 🌟</sub>
</div>
