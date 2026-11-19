import {
  formatIstanbulDate,
  formatIstanbulTime,
} from "@/services/fixtureService";
import { NewsData } from "@/types";
import { safeFetch } from "@/utils/safeFetch";

interface RssSourceSpec {
  url: string;
  defaultCategory: string;
  requireFenerbahceKeyword?: boolean;
}

const RSS_SOURCES: RssSourceSpec[] = [
  {
    url: "https://www.fotomac.com.tr/rss/fenerbahce.xml",
    defaultCategory: "FUTBOL",
  },
  {
    url: "https://www.trtspor.com.tr/fenerbahce_articles.rss",
    defaultCategory: "KULÜP",
  },
  {
    url: "https://www.ntvspor.net/rss/kategori/futbol",
    defaultCategory: "FUTBOL",
    requireFenerbahceKeyword: true,
  },
];

const DEFAULT_NEWS_IMAGE =
  "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg";

let cachedNews: NewsData[] | null = null;
let lastNewsFetch = 0;
const NEWS_TTL_MS = 2 * 60 * 1000;

export function decodeHtmlEntities(str: string): string {
  return String(str || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_m, dec) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTagValue(itemXml: string, tagName: string): string {
  const regex = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`,
    "i",
  );
  const m = itemXml.match(regex);
  return m ? m[1] : "";
}

function extractRssImage(itemXml: string): string {
  const mediaMatch =
    itemXml.match(/<media:content[^>]*\burl=["']([^"']+)["']/i) ||
    itemXml.match(/<media:thumbnail[^>]*\burl=["']([^"']+)["']/i) ||
    itemXml.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i) ||
    itemXml.match(/url=["']([^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i) ||
    itemXml.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
  return mediaMatch?.[1] || DEFAULT_NEWS_IMAGE;
}

function classifyNewsCategory(title: string, rawCategory: string, fallbackCat: string): string {
  const lower = title.toLocaleLowerCase("tr-TR");
  if (
    lower.includes("transfer") ||
    lower.includes("imza") ||
    lower.includes("teklif") ||
    lower.includes("bonservis")
  ) {
    return "TRANSFER";
  }
  if (
    lower.includes("beko") ||
    lower.includes("euroleague") ||
    lower.includes("jasikevicius") ||
    lower.includes("basketbol")
  ) {
    return "BASKETBOL";
  }
  if (
    lower.includes("vargas") ||
    lower.includes("eda erdem") ||
    lower.includes("sultanlar") ||
    lower.includes("voleybol") ||
    lower.includes("medicana")
  ) {
    return "VOLEYBOL";
  }
  const catClean = decodeHtmlEntities(rawCategory).toLocaleUpperCase("tr-TR");
  return catClean || fallbackCat;
}

export function parseRssXml(
  xmlText: string,
  defaultCategory: string,
  requireFenerbahceKeyword: boolean = false,
): NewsData[] {
  if (!xmlText) return [];
  const items = xmlText.match(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi) || [];
  const parsed: NewsData[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const link = decodeHtmlEntities(extractTagValue(item, "link"));
    const title = decodeHtmlEntities(extractTagValue(item, "title")) || "Fenerbahçe Haberi";
    const desc = decodeHtmlEntities(extractTagValue(item, "description"));

    if (requireFenerbahceKeyword) {
      const hay = `${title} ${desc}`.toLocaleLowerCase("tr-TR");
      if (!hay.includes("fenerbah")) {
        continue;
      }
    }

    const pubRaw = decodeHtmlEntities(extractTagValue(item, "pubDate"));
    let date = "";
    if (pubRaw) {
      const d = new Date(pubRaw);
      if (!isNaN(d.getTime())) {
        date = `${formatIstanbulDate(d)} • ${formatIstanbulTime(d)}`;
      }
    }

    const rawCat = extractTagValue(item, "category");
    const category = classifyNewsCategory(title, rawCat, defaultCategory);
    const image = extractRssImage(item);

    parsed.push({
      id: `news-${index}-${link.slice(-25).replace(/[^a-zA-Z0-9]/g, "") || "item"}`,
      title,
      link,
      image,
      date,
      category,
    });
  }

  return parsed;
}

export const fetchNews = async (
  forceRefresh: boolean = false,
): Promise<NewsData[]> => {
  if (
    !forceRefresh &&
    cachedNews &&
    Date.now() - lastNewsFetch < NEWS_TTL_MS
  ) {
    return cachedNews;
  }

  try {
    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();
    const newsList: NewsData[] = [];

    const responses = await Promise.all(
      RSS_SOURCES.map((src) =>
        safeFetch(src.url)
          .then(async (r) => ({
            text: r && r.ok ? await r.text() : "",
            spec: src,
          }))
          .catch(() => ({ text: "", spec: src })),
      ),
    );

    for (const { text: xmlText, spec } of responses) {
      if (!xmlText) continue;
      const items = parseRssXml(
        xmlText,
        spec.defaultCategory,
        Boolean(spec.requireFenerbahceKeyword),
      );

      for (const entry of items) {
        if (entry.link && seenLinks.has(entry.link)) continue;
        const titleKey = entry.title.toLowerCase().slice(0, 45);
        if (seenTitles.has(titleKey)) continue;

        if (entry.link) seenLinks.add(entry.link);
        seenTitles.add(titleKey);
        newsList.push({
          ...entry,
          id: `news-${newsList.length}-${entry.link.slice(-25).replace(/[^a-zA-Z0-9]/g, "") || newsList.length}`,
        });
      }
    }

    cachedNews = newsList;
    lastNewsFetch = Date.now();
    return newsList;
  } catch {
    return cachedNews || [];
  }
};
