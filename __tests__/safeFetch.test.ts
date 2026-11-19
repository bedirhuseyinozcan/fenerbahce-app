import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  Linking: { openURL: vi.fn() },
}));

import { safeFetch } from "@/utils/safeFetch";

describe("safeFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("falls back to site.web.api.espn.com when site.api.espn.com returns 500", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("error", { status: 500 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const res = await safeFetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule",
    );

    expect(res).not.toBeNull();
    expect(res?.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain("://site.api.espn.com/");
    expect(fetchMock.mock.calls[1][0]).toContain("://site.web.api.espn.com/");
  });

  it("falls back to secondary ESPN host when primary throws network error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    const res = await safeFetch(
      "https://site.api.espn.com/apis/v2/sports/soccer/tur.1/standings",
    );

    expect(res?.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns null when all candidates fail", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("bad", { status: 502 }));

    vi.stubGlobal("fetch", fetchMock);

    const res = await safeFetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/tur.1/teams/436/schedule",
    );

    expect(res).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
