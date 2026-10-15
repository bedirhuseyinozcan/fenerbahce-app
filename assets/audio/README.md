# Yerel Ses Dosyaları (Local MP3 Files)

Bu klasöre dilediğiniz Fenerbahçe marş ve tezahürat `.mp3` dosyalarını ekleyebilirsiniz.

### Nasıl Kullanılır?
1. İndirdiğiniz `.mp3` dosyasını bu klasöre atın (Örn: `100yil.mp3`).
2. `data/marslarData.ts` dosyasında ilgili parçanın `audioUrl` alanını şu şekilde güncelleyin:

```ts
audioUrl: require("@/assets/audio/100yil.mp3"),
```

Bu sayede marşlar internet bağlantısına ihtiyaç duymadan, doğrudan telefon hafızasından ışık hızında çalacaktır!
