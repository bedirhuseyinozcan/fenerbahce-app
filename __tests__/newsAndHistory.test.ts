import { describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import {
  fenerbahceHistoryEvents,
  getTodayHistoricalEvent,
} from "@/data/historyData";
import { parseRssXml } from "@/services/newsService";

describe("newsService parseRssXml", () => {
  it("parses CDATA, numeric HTML entities, images, and filters Fenerbahçe items when required", () => {
    const xml = `
      <rss><channel>
        <item>
          <title><![CDATA[Fenerbahçe&#39;den dev transfer hamlesi]]></title>
          <link>https://example.com/fb-transfer</link>
          <description><![CDATA[<p>Kadıköy ekibi imza aşamasında.</p>]]></description>
          <pubDate>Thu, 19 Nov 2026 09:30:00 +0300</pubDate>
          <media:content url="https://cdn.example.com/fb.jpg" />
        </item>
        <item>
          <title>Başka bir takım haberi</title>
          <link>https://example.com/other</link>
          <description>İlgisiz içerik</description>
        </item>
      </channel></rss>
    `;

    const filtered = parseRssXml(xml, "FUTBOL", true);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("Fenerbahçe'den dev transfer hamlesi");
    expect(filtered[0].category).toBe("TRANSFER");
    expect(filtered[0].image).toBe("https://cdn.example.com/fb.jpg");
    expect(filtered[0].date).toContain("2026");

    const unfiltered = parseRssXml(xml, "FUTBOL", false);
    expect(unfiltered).toHaveLength(2);
  });
});

describe("historyData archive", () => {
  it("contains at least 25 unique chronological milestones", () => {
    expect(fenerbahceHistoryEvents.length).toBeGreaterThanOrEqual(25);
    const ids = new Set(fenerbahceHistoryEvents.map((e) => e.id));
    expect(ids.size).toBe(fenerbahceHistoryEvents.length);
  });

  it("matches exact historical date first in getTodayHistoricalEvent", () => {
    const nov6 = getTodayHistoricalEvent(new Date("2026-11-06T12:00:00Z"));
    expect(nov6.id).toBe("h-2002-11-06");
  });
});
