export interface Song {
  id: string;
  title: string;
  artist: string;
  category: "Marş" | "Beste" | "Tezahürat";
  duration: string;
  durationSec: number;
  audioUrl: string | number;
  coverImage: string;
  lyrics: string[];
}

export const marslarList: Song[] = [
  {
    id: "mars-1",
    title: "100. Yıl Marşı",
    artist: "Kıraç",
    category: "Marş",
    duration: "3:42",
    durationSec: 222,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Kirac-100-Yil-Sarkisi.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Cihatlar, Lefterler, Canlar, Fikretler",
      "Gündüzler, Enginler, Rıdvanlar, Aykutlar",
      "Birol'lar, Cemil'ler, Selçuk'lar, Tuncay'lar",
      "Hepsi can verdiler bu kutsal renklere...",
      "",
      "Yüz yıldır bu sevgi bitmedi, bitmez!",
      "Fenerbahçe sevgisi göklere benzer,",
      "Gözlerini açıp baktığın her an,",
      "Sarı-lacivert bir zafer yükselir oradan!",
      "",
      "Milyonlar el ele, kalpler hep seninle,",
      "Yürüyoruz gururla şanlı zaferlere!",
      "Yüz yaşındasın sen ulu bir çınar,",
      "Fenerbahçe sevgisi kıyamete kadar!"
    ],
  },
  {
    id: "mars-2",
    title: "Yaşa Fenerbahçe",
    artist: "Nesrin Sipahi & FSK Korosu",
    category: "Marş",
    duration: "2:55",
    durationSec: 175,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Nesrin.Sipahi.Fenerbahce.Marsi.Yasa.Fenerbahce.1974.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Dillere destan, kalplere sultan,",
      "Gözlerde ışıksın sen sarı-lacivert!",
      "Sahada devsin, gönülde sevgisin,",
      "Tarihlere şansın sen Fenerbahçe!",
      "",
      "Cihatlar, Lefterler, Canlar seninle,",
      "Milyonlar coşuyor şanlı isminle!",
      "Yaşa Fenerbahçe, şanlı Fenerbahçe,",
      "Mazinde bir tarih yatar, yaşa Fenerbahçe!",
      "",
      "Gücünle, aşkınla, altın harflerle,",
      "Yazıldın her yerde sarı-laciverte!"
    ],
  },
  {
    id: "mars-3",
    title: "Bizler İnandık",
    artist: "Selçuk Abay & Tribün Korosu",
    category: "Beste",
    duration: "3:10",
    durationSec: 190,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Selcuk.Abay.-.Bizler.inandik.Fenerbahce.Marsi.2021.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Bizler inandık siz de inanın,",
      "Bizim için bu maçı alın!",
      "Sarı-lacivert aşkımız için,",
      "Kupaları Kadıköy'e getirin!",
      "",
      "Geceler gündüz, yollar tükenir,",
      "Fenerbahçe aşkı asla bitmez!",
      "Yağmurda çamurda seninleyiz biz,",
      "Ölümüne bağlıyız, sarı-lacivertiz!"
    ],
  },
  {
    id: "mars-4",
    title: "Samanyolu (Bir Şarkısın Sen)",
    artist: "Kadıköy Korosu & FB TV",
    category: "Beste",
    duration: "3:30",
    durationSec: 210,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Fenerbahce.Taraftari.Samanyolu.Klibi.FB.TV.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Bir şarkısın sen ömür boyu sürecek,",
      "Dudaklarımdan yıllarca düşmeyecek...",
      "Ruhum seninle, kalbim seninle,",
      "Yeryüzünde tek sevdam Fenerbahçe!",
      "",
      "O göklerde dalgalanan şanlı sancak,",
      "Saraçoğlu'nda fırtınalar kopacak!",
      "Bir şarkısın sen ömür boyu sürecek,",
      "Dillerden düşmeyecek!"
    ],
  },
  {
    id: "mars-5",
    title: "Ne Sevmek Ne Sevilmek",
    artist: "Kill For You (KFY) & Okul Açık",
    category: "Beste",
    duration: "3:45",
    durationSec: 225,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/KFY.-.Ne.Sevmek.Ne.Sevilmek.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Ne sevmek ne sevilmek,",
      "Bizi bir tek sen anlarsın...",
      "Geceleri uykusuz bırakan,",
      "Sarı lacivert bir sevdalısın!",
      "",
      "Kadıköy sokaklarında yankılanan sesimiz,",
      "Fenerbahçe aşkıyla atar kalbimiz!",
      "Yağmurda karda seninleyiz hep,",
      "Bu sevda bitmez kıyamete denk!"
    ],
  },
  {
    id: "mars-6",
    title: "Bir Sabah Tuttu Babam Elimden",
    artist: "Kadıköy Tribünleri",
    category: "Beste",
    duration: "3:05",
    durationSec: 185,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Bir.sabah.tuttu.babam.elimden.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Bir sabah tuttu babam elimden,",
      "Götürdü beni Kadıköy'e...",
      "Gördüğüm ilk renk sarı-lacivert,",
      "Aşık oldum o gün Fenerbahçe'ye!",
      "",
      "Babadan oğula kutsal emanet,",
      "Bu büyük camia sana minnettar!",
      "Son nefese kadar sürsün bu sevgi,",
      "Fenerbahçe sonsuza kadar var!"
    ],
  },
  {
    id: "mars-7",
    title: "Kan Ağladı Bu Yürekler",
    artist: "Fenerbahçe Tribün Ruhu",
    category: "Beste",
    duration: "2:40",
    durationSec: 160,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Kan.Agladi.Bu.Yurekler.-.20.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Kan ağladı bu yürekler uykusuz gecelerde,",
      "İsmin yankılandı dillerde!",
      "Vazgeçmedik asla bu kutsal sevdadan,",
      "Şampiyonluk gelsin Kadıköy'e oradan!",
      "",
      "Sarı-lacivert aşkınla yanarız,",
      "Fenerbahçe nerede, biz oradayız!"
    ],
  },
  {
    id: "mars-8",
    title: "Kederli Günler Olsa da Bazen",
    artist: "Maraton & Okul Açık",
    category: "Beste",
    duration: "3:10",
    durationSec: 190,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Kederli.Gunler.Olsada.Bazen.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Kederli günler olsa da bazen,",
      "Gülümseriz yine kalbimizden!",
      "Seninle doğan bu büyük güneş,",
      "Hiç batmayacak bu göklerden!",
      "",
      "Fenerbahçe sevgisi sonsuz bir ırmak,",
      "Nasip olmaz herkese bu renklere tapmak!"
    ],
  },
  {
    id: "mars-9",
    title: "Kaderimiz Yazılmış Seninle",
    artist: "Tribün Marşları Korosu",
    category: "Marş",
    duration: "2:50",
    durationSec: 170,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Mutlulukta.Kederde.-.Kaderimiz.Yazilmis.Seninle.Fenerbahce.Tribun.Marsi.Official.Video.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Mutlulukta kederde,",
      "Kaderimiz yazılmış seninle!",
      "Adını haykırırız her yerde,",
      "Fenerbahçe aşkı kalbimizde!",
      "",
      "Yürüyoruz şerefle başımız dik,",
      "Bu renklere ömrümüzü verdik!"
    ],
  },
  {
    id: "mars-10",
    title: "Sadece Fenerbahçe",
    artist: "Fenerbahçe Marşları Grubu",
    category: "Marş",
    duration: "3:00",
    durationSec: 180,
    audioUrl: "https://github.com/bedirhuseyinozcan/fenerbahce-app/releases/download/v1.0.0-audio/Sadece.Fenerbahce.-.02.mp3",
    coverImage: "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg",
    lyrics: [
      "Sadece Fenerbahçe,",
      "Başka sevda yok bu kalpte!",
      "Sarı sarı lacivert,",
      "Arman parıldar gökyüzünde!",
      "",
      "Kadıköy inletsin caddeleri,",
      "Fenerbahçe Türk futbolunun dev efsanesi!"
    ],
  },
];
