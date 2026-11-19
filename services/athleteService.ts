import {
  attachEuroLeagueStats,
  parseEspnFootballRoster,
  parseEuroLeagueClubPeople,
} from "@/features/squads/parsers/athleteParsers";
import { getEuroLeagueSeasonCode } from "@/services/fixtureService";
import { Athlete, AthleteBranch } from "@/types";
import { safeFetch } from "@/utils/safeFetch";
import { getJson, setJson } from "@/utils/storage";
export const fallbackAthletes: Athlete[] = [
  // FUTBOL A TAKIMI (2026-2027 SEZONU)
  {
    id: "f-31",
    number: 31,
    name: "Ederson",
    position: "Kaleci",
    category: "Kaleci",
    country: "Brezilya",
    branch: "Futbol",
  },
  {
    id: "f-34",
    number: 34,
    name: "Mert Günok",
    position: "Kaleci",
    category: "Kaleci",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-13",
    number: 13,
    name: "Tarık Çetin",
    position: "Kaleci",
    category: "Kaleci",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-27",
    number: 27,
    name: "Nélson Semedo",
    position: "Sağ Bek",
    category: "Defans",
    country: "Portekiz",
    branch: "Futbol",
  },
  {
    id: "f-37",
    number: 37,
    name: "Milan Škriniar",
    position: "Stoper",
    category: "Defans",
    country: "Slovakya",
    branch: "Futbol",
  },
  {
    id: "f-15",
    number: 15,
    name: "Nathan Aké",
    position: "Stoper",
    category: "Defans",
    country: "Hollanda",
    branch: "Futbol",
  },
  {
    id: "f-4",
    number: 4,
    name: "Çağlar Söyüncü",
    position: "Stoper",
    category: "Defans",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-50",
    number: 50,
    name: "Rodrigo Becão",
    position: "Stoper",
    category: "Defans",
    country: "Brezilya",
    branch: "Futbol",
  },
  {
    id: "f-3",
    number: 3,
    name: "Archie Brown",
    position: "Sol Bek",
    category: "Defans",
    country: "İngiltere",
    branch: "Futbol",
  },
  {
    id: "f-18",
    number: 18,
    name: "Mert Müldür",
    position: "Sağ Bek",
    category: "Defans",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-24",
    number: 24,
    name: "Jayden Oosterwolde",
    position: "Sol Bek",
    category: "Defans",
    country: "Hollanda",
    branch: "Futbol",
  },
  {
    id: "f-22",
    number: 22,
    name: "Levent Mercan",
    position: "Sol Bek",
    category: "Defans",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-91",
    number: 91,
    name: "N'Golo Kanté",
    position: "Ön Libero",
    category: "Orta Saha",
    country: "Fransa",
    branch: "Futbol",
  },
  {
    id: "f-6",
    number: 6,
    name: "Mattéo Guendouzi",
    position: "Merkez Orta Saha",
    category: "Orta Saha",
    country: "Fransa",
    branch: "Futbol",
  },
  {
    id: "f-5",
    number: 5,
    name: "İsmail Yüksek",
    position: "Ön Libero",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-10",
    number: 10,
    name: "Marco Asensio",
    position: "10 Numara",
    category: "Orta Saha",
    country: "İspanya",
    branch: "Futbol",
  },
  {
    id: "f-8",
    number: 8,
    name: "Mert Hakan Yandaş",
    position: "Merkez Orta Saha",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-17",
    number: 17,
    name: "İrfan Can Kahveci",
    position: "Sağ Kanat",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-70",
    number: 70,
    name: "Oğuz Aydın",
    position: "Kanat",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-11",
    number: 11,
    name: "Mason Greenwood",
    position: "Sağ Forvet",
    category: "Forvet",
    country: "İngiltere",
    branch: "Futbol",
  },
  {
    id: "f-7",
    number: 7,
    name: "Kerem Aktürkoğlu",
    position: "Sol Forvet",
    category: "Forvet",
    country: "Türkiye",
    branch: "Futbol",
  },
  {
    id: "f-9",
    number: 9,
    name: "Romelu Lukaku",
    position: "Santrafor",
    category: "Forvet",
    country: "Belçika",
    branch: "Futbol",
  },
  {
    id: "f-19",
    number: 19,
    name: "Vedat Muriqi",
    position: "Santrafor",
    category: "Forvet",
    country: "Kosova",
    branch: "Futbol",
  },

  {
    id: "b-0",
    number: 0,
    name: "Shane Larkin",
    position: "Oyun Kurucu",
    category: "Gard",
    country: "Türkiye/ABD",
    branch: "Basketbol",
  },
  {
    id: "b-2",
    number: 2,
    name: "Wade Baldwin IV",
    position: "Gard",
    category: "Gard",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-10",
    number: 10,
    name: "Melih Mahmutoğlu",
    position: "Şutör Gard (Kaptan)",
    category: "Gard",
    country: "Türkiye",
    branch: "Basketbol",
  },
  {
    id: "b-23",
    number: 23,
    name: "Marko Gudurić",
    position: "Şutör Gard / Forvet",
    category: "Gard",
    country: "Sırbistan",
    branch: "Basketbol",
  },
  {
    id: "b-8",
    number: 8,
    name: "Talen Horton-Tucker",
    position: "Şutör Gard",
    category: "Gard",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-9",
    number: 9,
    name: "Johnny Juzang",
    position: "Şutör Gard",
    category: "Gard",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-11",
    number: 11,
    name: "Trent Forrest",
    position: "Gard",
    category: "Gard",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-12",
    number: 12,
    name: "Braxton Key",
    position: "Kısa Forvet",
    category: "Forvet/Pivot",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-21",
    number: 21,
    name: "Will Clyburn",
    position: "Forvet",
    category: "Forvet/Pivot",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-30",
    number: 30,
    name: "Chris Silva",
    position: "Pivot",
    category: "Forvet/Pivot",
    country: "Gabon",
    branch: "Basketbol",
  },
  {
    id: "b-31",
    number: 31,
    name: "Shavon Shields",
    position: "Forvet",
    category: "Forvet/Pivot",
    country: "Danimarka",
    branch: "Basketbol",
  },
  {
    id: "b-4",
    number: 4,
    name: "Nicolò Melli",
    position: "Uzun Forvet / Pivot",
    category: "Forvet/Pivot",
    country: "İtalya",
    branch: "Basketbol",
  },
  {
    id: "b-5",
    number: 5,
    name: "Sertaç Şanlı",
    position: "Pivot",
    category: "Forvet/Pivot",
    country: "Türkiye",
    branch: "Basketbol",
  },
  {
    id: "b-1",
    number: 1,
    name: "Marcus Bingham Jr.",
    position: "Pivot",
    category: "Forvet/Pivot",
    country: "ABD",
    branch: "Basketbol",
  },
  {
    id: "b-43",
    number: 43,
    name: "Ignas Sargiūnas",
    position: "Gard",
    category: "Gard",
    country: "Litvanya",
    branch: "Basketbol",
  },

  {
    id: "v-14",
    number: 14,
    name: "Eda Erdem",
    position: "Orta Oyuncu (Kaptan)",
    category: "Orta Oyuncu",
    country: "Türkiye",
    branch: "Voleybol",
  },
  {
    id: "v-44",
    number: 44,
    name: "Melissa Vargas",
    position: "Pasör Çaprazı",
    category: "Smaçör",
    country: "Türkiye/Küba",
    branch: "Voleybol",
  },
  {
    id: "v-10",
    number: 10,
    name: "Arina Fedorovtseva",
    position: "Smaçör",
    category: "Smaçör",
    country: "Rusya",
    branch: "Voleybol",
  },
  {
    id: "v-12",
    number: 12,
    name: "Ana Cristina de Souza",
    position: "Smaçör",
    category: "Smaçör",
    country: "Brezilya",
    branch: "Voleybol",
  },
  {
    id: "v-7",
    number: 7,
    name: "Hande Baladın",
    position: "Smaçör",
    category: "Smaçör",
    country: "Türkiye",
    branch: "Voleybol",
  },
  {
    id: "v-8",
    number: 8,
    name: "Alessia Orro",
    position: "Pasör",
    category: "Pasör",
    country: "İtalya",
    branch: "Voleybol",
  },
  {
    id: "v-1",
    number: 1,
    name: "Gizem Örge",
    position: "Libero",
    category: "Libero",
    country: "Türkiye",
    branch: "Voleybol",
  },
  // KADIN BASKETBOL (Fenerbahçe Opet)
  {
    id: "kb-10",
    number: 10,
    name: "Alperi Onar",
    position: "Oyun Kurucu (Kaptan)",
    category: "Gard",
    country: "Türkiye",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-2",
    number: 2,
    name: "Sevgi Uzun",
    position: "Oyun Kurucu",
    category: "Gard",
    country: "Türkiye",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-23",
    number: 23,
    name: "Kayla McBride",
    position: "Şutör Gard",
    category: "Gard",
    country: "ABD",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-5",
    number: 5,
    name: "Gabby Williams",
    position: "Kısa Forvet",
    category: "Forvet/Pivot",
    country: "Fransa/ABD",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-11",
    number: 11,
    name: "Emma Meesseman",
    position: "Uzun Forvet / Pivot",
    category: "Forvet/Pivot",
    country: "Belçika",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-33",
    number: 33,
    name: "Tina Charles",
    position: "Pivot",
    category: "Forvet/Pivot",
    country: "ABD",
    branch: "Kadın Basketbol",
  },
  {
    id: "kb-4",
    number: 4,
    name: "Olcay Çakır Turgut",
    position: "Oyun Kurucu",
    category: "Gard",
    country: "Türkiye",
    branch: "Kadın Basketbol",
  },
  // ERKEK VOLEYBOL (Fenerbahçe Medicana Erkek Voleybol)
  {
    id: "ev-1",
    number: 1,
    name: "Kaan Gürbüz",
    position: "Pasör Çaprazı",
    category: "Smaçör",
    country: "Türkiye",
    branch: "Erkek Voleybol",
  },
  {
    id: "ev-9",
    number: 9,
    name: "Earvin N'Gapeth",
    position: "Smaçör",
    category: "Smaçör",
    country: "Fransa",
    branch: "Erkek Voleybol",
  },
  {
    id: "ev-14",
    number: 14,
    name: "Dražen Luburić",
    position: "Pasör Çaprazı",
    category: "Smaçör",
    country: "Sırbistan",
    branch: "Erkek Voleybol",
  },
  {
    id: "ev-11",
    number: 11,
    name: "Fabian Drzyzga",
    position: "Pasör",
    category: "Pasör",
    country: "Polonya",
    branch: "Erkek Voleybol",
  },
  {
    id: "ev-7",
    number: 7,
    name: "Osman Çağatay Durmaz",
    position: "Orta Oyuncu",
    category: "Orta Oyuncu",
    country: "Türkiye",
    branch: "Erkek Voleybol",
  },
  {
    id: "ev-5",
    number: 5,
    name: "Burak Güngör",
    position: "Libero",
    category: "Libero",
    country: "Türkiye",
    branch: "Erkek Voleybol",
  },
  // KADIN FUTBOL (Fenerbahçe Petrol Ofisi)
  {
    id: "kf-1",
    number: 1,
    name: "Göknur Güleryüz",
    position: "Kaleci",
    category: "Kaleci",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
  {
    id: "kf-5",
    number: 5,
    name: "Yaşam Göksu",
    position: "Stoper (Kaptan)",
    category: "Defans",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
  {
    id: "kf-10",
    number: 10,
    name: "Busem Şeker",
    position: "On Numara",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
  {
    id: "kf-8",
    number: 8,
    name: "Ece Türkoğlu",
    position: "Merkez Orta Saha",
    category: "Orta Saha",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
  {
    id: "kf-9",
    number: 9,
    name: "Yağmur Uraz",
    position: "Santrafor",
    category: "Forvet",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
  {
    id: "kf-7",
    number: 7,
    name: "Zeynep Kerimoğlu",
    position: "Kanat Forvet",
    category: "Forvet",
    country: "Türkiye",
    branch: "Kadın Futbol",
  },
];

export const LIVE_ROSTER_BRANCHES = new Set<AthleteBranch>([
  "Futbol",
  "Basketbol",
  "Voleybol",
]);

const athletesCache = new Map<string, { data: Athlete[]; ts: number }>();
const ATHLETES_TTL_MS = 5 * 60 * 1000;

function loadPersistedRoster(branchKey: string): Athlete[] | null {
  const parsed = getJson<Athlete[]>(`fb_roster_v1_${branchKey}`);
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
}

function savePersistedRoster(branchKey: string, list: Athlete[]): void {
  if (!Array.isArray(list) || list.length === 0) return;
  setJson(`fb_roster_v1_${branchKey}`, list);
}

function withSourceFallback(branchFilter?: AthleteBranch): Athlete[] {
  const base = branchFilter
    ? fallbackAthletes.filter((a) => a.branch === branchFilter)
    : fallbackAthletes;
  return base.map((a) => ({ ...a, source: "season-list" }));
}

export function getFallbackAthletesByBranch(
  branch: AthleteBranch | "Tümü" = "Tümü",
): Athlete[] {
  const cached = athletesCache.get(branch);
  if (cached) return cached.data;
  if (branch !== "Tümü") {
    const persisted = loadPersistedRoster(branch);
    if (persisted) return persisted;
    return withSourceFallback(branch);
  }
  return withSourceFallback();
}

export const fetchAthletes = async (
  branch: AthleteBranch | "Tümü" = "Tümü",
): Promise<Athlete[]> => {
  const cached = athletesCache.get(branch);
  if (cached && Date.now() - cached.ts < ATHLETES_TTL_MS) {
    return cached.data;
  }

  const list: Athlete[] = [];

  if (branch === "Futbol" || branch === "Tümü") {
    let footballList: Athlete[] = [];
    try {
      const res = await safeFetch(
        "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/roster",
      );
      if (res && res.ok) {
        const data = await res.json();
        footballList = parseEspnFootballRoster(data);
        if (footballList.length > 0) {
          savePersistedRoster("Futbol", footballList);
        }
      }
    } catch {
      // ignore football live fetch error
    }

    if (footballList.length === 0) {
      footballList = loadPersistedRoster("Futbol") || withSourceFallback("Futbol");
    }
    list.push(...footballList);
  }

  if (branch === "Basketbol" || branch === "Tümü") {
    let basketList: Athlete[] = [];
    const seasonCode = getEuroLeagueSeasonCode();

    try {
      const [peopleRes, statsRes] = await Promise.all([
        safeFetch(
          `https://api-live.euroleague.net/v2/competitions/E/seasons/${seasonCode}/clubs/ULK/people`,
        ),
        safeFetch(
          `https://api-live.euroleague.net/v3/competitions/E/statistics/players/traditional?seasonMode=Single&seasonCode=${seasonCode}&clubCode=ULK`,
        ),
      ]);

      if (peopleRes && peopleRes.ok) {
        const peopleJson = await peopleRes.json();
        basketList = parseEuroLeagueClubPeople(peopleJson);
        if (basketList.length > 0 && statsRes && statsRes.ok) {
          try {
            const statsJson = await statsRes.json();
            basketList = attachEuroLeagueStats(basketList, statsJson);
          } catch {
            // stats optional
          }
        }
        if (basketList.length > 0) {
          savePersistedRoster("Basketbol", basketList);
        }
      }
    } catch {
      // fall through to secondary Wikipedia source
    }

    if (basketList.length === 0) {
      try {
        const res = await safeFetch(
          "https://tr.wikipedia.org/api/rest_v1/page/html/Fenerbah%C3%A7e_(basketbol_tak%C4%B1m%C4%B1)",
        );
        if (res && res.ok) {
          const html = await res.text();
          const rowsB = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];

          for (const row of rowsB) {
            const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
            if (cells.length >= 4 && cells[0] && cells[1]) {
              const posRaw = cells[0].replace(/<[^>]+>/g, "").trim();
              const numRaw = cells[1].replace(/<[^>]+>/g, "").trim();
              const nameMatch =
                cells[3]?.match(/<a[^>]*>([^<]+)<\/a>/) ||
                cells[2]?.match(/<a[^>]*>([^<]+)<\/a>/);

              if (
                /^\d+$/.test(numRaw) &&
                nameMatch &&
                nameMatch[1] &&
                !nameMatch[1].includes("Takım")
              ) {
                const playerName = nameMatch[1].replace(/,\s*/, " ").trim();
                const category: Athlete["category"] =
                  posRaw.includes("G") ||
                  posRaw.includes("OK") ||
                  posRaw.includes("ŞG")
                    ? "Gard"
                    : "Forvet/Pivot";

                basketList.push({
                  id: `wiki-bb-${numRaw}`,
                  number: parseInt(numRaw, 10),
                  name: playerName,
                  position: posRaw || "Oyuncu",
                  category,
                  branch: "Basketbol",
                  source: "wikipedia",
                });
              }
            }
          }
          if (basketList.length > 0) {
            savePersistedRoster("Basketbol", basketList);
          }
        }
      } catch {
        // fall through to persisted / season-list fallback
      }
    }

    if (basketList.length === 0) {
      basketList =
        loadPersistedRoster("Basketbol") || withSourceFallback("Basketbol");
    }
    list.push(...basketList);
  }

  if (branch === "Voleybol" || branch === "Tümü") {
    let volleyList: Athlete[] = [];
    try {
      const res = await safeFetch(
        "https://tr.wikipedia.org/api/rest_v1/page/html/Fenerbah%C3%A7e_(kad%C4%B1n_voleybol_tak%C4%B1m%C4%B1)",
      );
      if (res && res.ok) {
        const html = await res.text();
        const rowsV = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];

        for (const row of rowsV) {
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || [];
          if (cells.length >= 3 && cells[0] && cells[1] && cells[2]) {
            const numRaw = cells[0].replace(/<[^>]+>/g, "").trim();
            const nameMatch =
              cells[1].match(/<a[^>]*>([^<]+)<\/a>/) ||
              cells[1].replace(/<[^>]+>/g, "").trim();
            const name =
              typeof nameMatch === "string"
                ? nameMatch
                : nameMatch
                  ? nameMatch[1]
                  : "";
            const posRaw = cells[2].replace(/<[^>]+>/g, "").trim();

            if (
              /^\d+$/.test(numRaw) &&
              name &&
              !name.includes("Mevki") &&
              !name.includes("Takım") &&
              !name.includes("Salon")
            ) {
              let category: Athlete["category"] = "Smaçör";
              if (posRaw.includes("Libero")) category = "Libero";
              else if (posRaw.includes("Pasör") && !posRaw.includes("Çapraz"))
                category = "Pasör";
              else if (posRaw.includes("Orta")) category = "Orta Oyuncu";

              volleyList.push({
                id: `wiki-vb-${numRaw}`,
                number: parseInt(numRaw, 10),
                name: name.trim(),
                position: posRaw || "Oyuncu",
                category,
                branch: "Voleybol",
                source: "wikipedia",
              });
            }
          }
        }
        if (volleyList.length > 0) {
          savePersistedRoster("Voleybol", volleyList);
        }
      }
    } catch {
      // ignore wiki fetch failure
    }

    if (volleyList.length === 0) {
      volleyList =
        loadPersistedRoster("Voleybol") || withSourceFallback("Voleybol");
    }
    list.push(...volleyList);
  }

  const extraBranches: AthleteBranch[] = [
    "Kadın Basketbol",
    "Erkek Voleybol",
    "Kadın Futbol",
  ];
  for (const eb of extraBranches) {
    if (branch === eb || branch === "Tümü") {
      list.push(...withSourceFallback(eb));
    }
  }

  const finalResult =
    branch !== "Tümü" ? list.filter((a) => a.branch === branch) : list;
  athletesCache.set(branch, { data: finalResult, ts: Date.now() });
  return finalResult;
};
