import { HistoricalEvent } from "@/types";

export const fenerbahceHistoryEvents: HistoricalEvent[] = [
  {
    id: "h-1907-05-03",
    day: 3,
    month: 5,
    year: 1907,
    title: "Fenerbahçe Spor Kulübü Kuruldu",
    description:
      "Ziya Songülen, Ayetullah Bey ve Necip Okaner tarafından Kadıköy Moda'da sarı-lacivert sevdanın temelleri atıldı.",
    category: "Kulüp Tarihi",
  },
  {
    id: "h-2002-11-06",
    day: 6,
    month: 11,
    year: 2002,
    title: "Kadıköy'de Tarihi 6-0'lık Derbi Zaferi",
    description:
      "Fenerbahçe, Şükrü Saracoğlu Stadyumu'nda ezeli rakibi Galatasaray'ı Tuncay Şanlı, Ortega, Serhat Akın (2), Ceyhun Eriş ve Ümit Özat'ın golleriyle 6-0 mağlup etti.",
    category: "Derbi Zaferi",
    score: "FB 6 - 0 GS",
  },
  {
    id: "h-2017-05-21",
    day: 21,
    month: 5,
    year: 2017,
    title: "Fenerbahçe EuroLeague Şampiyonu! 🏆",
    description:
      "Željko Obradović yönetimindeki Fenerbahçe Erkek Basketbol Takımı, Final Four finalinde Olympiakos'u 80-64 yenerek Türk basketbol tarihinin ilk EuroLeague şampiyonluğunu kazandı.",
    category: "Avrupa",
    score: "FB 80 - 64 OLY",
  },
  {
    id: "h-2025-05-25",
    day: 25,
    month: 5,
    year: 2025,
    title: "2. EuroLeague Şampiyonluğu! 💛💙",
    description:
      "Šarūnas Jasikevičius yönetimindeki Fenerbahçe Beko, Avrupa'nın zirvesine bir kez daha çıkarak 2. EuroLeague kupasını müzesine götürdü.",
    category: "Avrupa",
  },
  {
    id: "h-2008-04-02",
    day: 2,
    month: 4,
    year: 2008,
    title: "Şampiyonlar Ligi Çeyrek Finalinde Chelsea Zaferi",
    description:
      "Zico yönetimindeki Fenerbahçe, UEFA Şampiyonlar Ligi çeyrek final ilk maçında Kadıköy'de İngiliz devi Chelsea'yi Kazım ve Deivid'in muhteşem golleriyle 2-1 mağlup etti.",
    category: "Avrupa",
    score: "FB 2 - 1 CHE",
  },
  {
    id: "h-2023-04-16",
    day: 16,
    month: 4,
    year: 2023,
    title: "Fenerbahçe Opet Kadınlar EuroLeague Şampiyonu",
    description:
      "Fenerbahçe Kadın Basketbol Takımı, EuroLeague Women finalinde tarihi bir farkla şampiyonluğa ulaşarak kupayı kazandı.",
    category: "Avrupa",
  },
  {
    id: "h-2010-12-18",
    day: 18,
    month: 12,
    year: 2010,
    title: "Sarı Melekler Dünya Şampiyonu!",
    description:
      "Fenerbahçe Kadın Voleybol Takımı, Doha'da düzenlenen FIVB Kadınlar Dünya Kulüpler Şampiyonası'nda set vermeden Dünya Şampiyonu oldu.",
    category: "Avrupa",
    score: "FB 3 - 0 SOL",
  },
  {
    id: "h-1989-05-03",
    day: 3,
    month: 5,
    year: 1989,
    title: "3-0'dan 4-3'lük Efsane Geri Dönüş & 103 Gol Sezonu",
    description:
      "Türkiye Kupası çeyrek finalinde ilk yarıyı 3-0 geride kapatan Fenerbahçe, ikinci yarıda Hasan Vezir'in 3 ve Aykut Kocaman'ın golüyle maçı 4-3 kazandı.",
    category: "Derbi Zaferi",
    score: "GS 3 - 4 FB",
  },
  {
    id: "h-1928-08-10",
    day: 10,
    month: 8,
    year: 1928,
    title: "Gazi Mustafa Kemal Atatürk'ün Kulübümüzü Ziyareti",
    description:
      "Cumhuriyetimizin kurucusu Gazi Mustafa Kemal Atatürk, Kuşdili'ndeki Fenerbahçe Kulübü'nü ziyaret ederek şeref defterine tarihi satırlarını yazdı.",
    category: "Kulüp Tarihi",
  },
];

export function getTodayHistoricalEvent(
  now: Date = new Date(),
): HistoricalEvent {
  const day = now.getDate();
  const month = now.getMonth() + 1;

  const exact = fenerbahceHistoryEvents.find(
    (e) => e.day === day && e.month === month,
  );
  if (exact) return exact;

  const sameMonth = fenerbahceHistoryEvents.find((e) => e.month === month);
  if (sameMonth) return sameMonth;

  const idx = (day + month) % fenerbahceHistoryEvents.length;
  return fenerbahceHistoryEvents[idx];
}
