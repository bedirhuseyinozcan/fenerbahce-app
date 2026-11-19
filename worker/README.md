# 💛💙 Fenerbahçe Maç Motoru (Cloudflare Free Tier BFF)

Uygulama kapalıyken bile **0 ₺ maliyetle** 15 saniye içinde gol, kırmızı kart, VAR iptali, devre ve maç sonu push bildirimi gönderen arka uç motorudur.

## Mimari
- **Cron Trigger (`*/1 * * * *`)**: Dakikada bir bugünün Fenerbahçe Futbol & EuroLeague maçlarını kontrol eder.
- **SQLite Durable Object (`MatchWatcher`)**: Maç başlamadan 60 dk önce uyanır, canlıyken her **15 saniyede bir** alarm kurarak skoru önceki snapshot ile karşılaştırır (idempotent diff).
- **D1 SQLite**: Cihaz push token'ları, bildirim tercihleri, olay geçmişi ve (Adım 4'te) tahmin odaları.
- **Push Kanalları**: Expo Push Service (Android/iOS) + ntfy.sh (yedek ve kurulum gerektirmeyen kanal).

## 5 Dakikada Ücretsiz Kurulum

1. **Bağımlılıkları kur & Cloudflare'e giriş yap:**
   ```bash
   cd worker
   npm install
   npx wrangler login
   ```

2. **Ücretsiz D1 veritabanı oluştur:**
   ```bash
   npx wrangler d1 create fenerbahce-db
   ```
   Çıktıdaki `database_id` değerini `worker/wrangler.jsonc` içindeki `REPLACE_WITH_YOUR_D1_ID` yerine yaz.

3. **Veritabanı tablolarını oluştur:**
   ```bash
   npm run db:migrate:remote
   ```

4. **Deploy et:**
   ```bash
   npm run deploy
   ```

5. **Uygulamaya bağla:**
   Deploy çıktısındaki `https://fenerbahce-match-engine.<hesabin>.workers.dev` adresini uygulamadaki **Daha Fazla → Bildirim Merkezi → Cloudflare Maç Motoru** alanına yapıştır ve **Tercihleri Eşitle** butonuna bas.
