# 💛💙 Fenerbahçe Spor Kulübü Mobil Uygulaması

Bu proje, React Native (Expo) kullanılarak geliştirilen kapsamlı bir Fenerbahçe Spor Kulübü mobil uygulamasıdır. Proje, farklı spor branşları (Futbol, Basketbol, Voleybol vb.) için fikstürleri, güncel kadroları, haberleri ve daha fazlasını içerecek şekilde tasarlanmıştır.

## 🚀 Özellikler (Planlanan)

*   **Ana Sayfa:** Son dakika haberleri, yaklaşan maç sayacı (Countdown), güncel puan durumu özeti.
*   **Branşlar (Fikstür & Sonuçlar):** Futbol, Erkek/Kadın Basketbol, Voleybol vb. tüm branşların fikstürleri ve maç sonuçları.
*   **Kadro ve Sporcular:** Oyuncu profilleri, istatistikleri ve teknik ekip bilgileri.
*   **Taraftar Etkileşimi (Ekstra):**
    *   **Fenerium:** Yeni sezon formaları ve ürünler (Sanal Mağaza arayüzü).
    *   **Marşlar:** Popüler Fenerbahçe marşlarının dinlenebileceği mini audio player.
    *   **Tarihçe & Efsaneler:** Kulüp tarihi, kupalarımız ve efsaneleşmiş isimler (Alex, Lefter vb.).

## 🏗️ Proje Mimarisi

Bu proje, ölçeklenebilir ve temiz bir kod yapısı sunmak için aşağıdaki klasör mimarisine göre düzenlenmiştir:

```text
/app             # Ekranlar ve sayfa yönlendirmeleri (Expo Router - Dosya tabanlı navigasyon)
/assets          # Resimler, ikonlar, fontlar ve medya dosyaları
/components      # Tekrar kullanılabilir UI bileşenleri (Butonlar, Kartlar vb.)
/constants       # Renkler, temalar, sabit veriler ve konfigürasyonlar
/hooks           # Özel (Custom) React Hook'ları (örn. useMatchCountdown)
/services        # API istekleri, veritabanı bağlantıları (Supabase/Firebase/Axios)
/store           # Global State yönetimi (Zustand veya Redux)
/types           # TypeScript arayüzleri ve tipleri (Interface & Types)
/utils           # Yardımcı fonksiyonlar (Tarih formatlama, hesaplamalar vb.)
```

## 🛠️ Teknolojiler

*   **Framework:** React Native / Expo (v54)
*   **Navigasyon:** Expo Router (Dosya tabanlı)
*   **Dil:** TypeScript
*   **Stil:** StyleSheet (İleride NativeWind / Tailwind CSS eklenebilir)

## 🏃‍♂️ Kurulum ve Çalıştırma

Projeyi lokalinizde çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Projeyi başlatın:
   ```bash
   npx expo start
   ```

3. Çıkan menüde `i` tuşuna basarak iOS simülatöründe veya `a` tuşuna basarak Android emülatöründe çalıştırabilirsiniz. (Veya Expo Go uygulamasıyla telefonunuzdan QR kodu okutabilirsiniz.)
