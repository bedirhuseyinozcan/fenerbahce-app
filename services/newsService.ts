import { formatIstanbulDate, formatIstanbulTime } from "@/services/fixtureService";
import { NewsData } from "@/types";
import { safeFetch } from "@/utils/safeFetch";

const RSS_SOURCES: { url: string; defaultCategory: string }[] = [
  {
    url: "https://www.fotomac.com.tr/rss/fenerbahce.xml",
    defaultCategory: "FUTBOL",
  },
  {
    url: "https://www.trtspor.com.tr/fenerbahce_articles.rss",
    defaultCategory: "KULÜP",
  },
];

let cachedNews: NewsData[] | null = null;
let lastNewsFetch = 0;
const NEWS_TTL_MS = 2 * 60 * 1000;

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
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
            defaultCat: src.defaultCategory,
          }))
          .catch(() => ({ text: "", defaultCat: src.defaultCategory })),
      ),
    );

    for (const { text: xmlText, defaultCat } of responses) {
      if (!xmlText) continue;
      const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

      for (let index = 0; index < items.length; index++) {
        const item = items[index];
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const link = linkMatch
          ? linkMatch[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()
          : "";

        if (link && seenLinks.has(link)) continue;

        const titleMatch = item.match(
          /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/,
        );
        const fallbackTitle = item.match(/<title>([\s\S]*?)<\/title>/);
        const rawTitle = titleMatch
          ? titleMatch[1]
          : fallbackTitle
            ? fallbackTitle[1]
            : "Fenerbahçe Haberi";
        const title = decodeHtmlEntities(rawTitle);

        const titleKey = title.toLowerCase().slice(0, 45);
        if (seenTitles.has(titleKey)) continue;

        if (link) seenLinks.add(link);
        seenTitles.add(titleKey);

        const imageMatch =
          item.match(/url="([^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i) ||
          item.match(/url="([^"]+)"/);
        const image = imageMatch
          ? imageMatch[1]
          : "https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg";

        const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        let date = "";
        if (dateMatch) {
          const d = new Date(dateMatch[1].trim());
          if (!isNaN(d.getTime())) {
            date = `${formatIstanbulDate(d)} • ${formatIstanbulTime(d)}`;
          }
        }

        const categoryMatch = item.match(
          /<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/,
        );
        const fallbackCat = item.match(/<category>([\s\S]*?)<\/category>/);
        let category = categoryMatch
          ? categoryMatch[1].toUpperCase()
          : fallbackCat
            ? fallbackCat[1].toUpperCase()
            : defaultCat;

        const lowerTitle = title.toLowerCase();
        if (
          lowerTitle.includes("transfer") ||
          lowerTitle.includes("imza") ||
          lowerTitle.includes("teklif")
        ) {
          category = "TRANSFER";
        } else if (
          lowerTitle.includes("beko") ||
          lowerTitle.includes("euroleague") ||
          lowerTitle.includes("jasikevicius")
        ) {
          category = "BASKETBOL";
        } else if (
          lowerTitle.includes("vargas") ||
          lowerTitle.includes("eda erdem") ||
          lowerTitle.includes("sultanlar") ||
          lowerTitle.includes("voleybol")
        ) {
          category = "VOLEYBOL";
        }

        newsList.push({
          id: `news-${newsList.length}-${link.slice(-25).replace(/[^a-zA-Z0-9]/g, "") || index}`,
          title,
          link,
          image,
          date,
          category,
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
