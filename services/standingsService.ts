import { mockStandings } from "@/data/mockStandings";
import { TeamStanding } from "@/types";

export const fetchSuperLigStandings = async (): Promise<TeamStanding[]> => {
  try {
    // Gelecekte gerçek API bağlandığında buraya fetch kodları yazılacak.
    // Şimdilik literatüre uygun şekilde "data" klasöründen statik mock listemizi dönüyoruz:
    return Promise.resolve(mockStandings);
  } catch (error) {
    console.error("Puan durumu çekilirken hata:", error);
    return [];
  }
};
