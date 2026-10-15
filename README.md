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
* **Teknik Heyet:** Teknik Direktör José Mourinho ve ekibi.

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
├── app/                      # Expo Router sayfa ve tab navigasyonu
│   ├── (tabs)/               # Alt menü sekmeleri
│   │   ├── index.tsx         # Ana Sayfa (Haberler, Geri sayım, Puan özeti)
│   │   ├── maclar.tsx        # Fikstür & Canlı Puan Durumu
│   │   ├── kadro.tsx         # Takım Kadrosu & Oyuncu Profilleri
│   │   ├── marslar.tsx       # Marşlar & Besteler (CDN Ses Oynatıcı)
│   │   ├── daha-fazla.tsx    # Fenerium, Tarihçe, Kulüp Bağlantıları
│   │   └── _layout.tsx       # Tab Bar yapılandırması
│   ├── haberler.tsx          # Detaylı haberler akış ekranı
│   └── _layout.tsx           # Kök Layout & Tema Sağlayıcı
├── assets/                   # Vektörel ikonlar ve görseller
│   └── audio/                # Yerel ses rehberi
├── constants/                # Renk paletleri (Colors.ts - Sarı & Lacivert)
├── data/                     # Sabit veriler ve marş koleksiyonu (marslarData.ts)
├── services/                 # API Entegrasyonları (ESPN, TRT Spor RSS)
│   ├── standingsService.ts   # Canlı puan tablosu servisi
│   └── newsService.ts        # Canlı spor haberleri servisi
├── types/                    # TypeScript model ve arayüz tanımları
├── app.json                  # Expo ve uygulama yapılandırma dosyası
└── tsconfig.json             # TypeScript kuralları
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
