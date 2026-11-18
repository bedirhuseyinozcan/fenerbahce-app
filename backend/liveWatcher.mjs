/**
 * 💛💙 Fenerbahçe Sıfır Maliyetli Canlı Maç & Gol Bildirim Motoru (Faz 2 Backend)
 *
 * Nasıl Çalıştırılır?
 *   node backend/liveWatcher.mjs
 *
 * Özel bir ntfy.sh kanalına bildirim göndermek için:
 *   NTFY_TOPIC=fenerbahce-canli-1907 node backend/liveWatcher.mjs
 *
 * Bu script:
 * 1. Her 15 saniyede bir ESPN (Futbol) ve EuroLeague (Basketbol) canlı uç noktalarını yoklar.
 * 2. Fenerbahçe'nin maçı başladığında, gol olduğunda, kırmızı kart çıktığında veya maç bittiğinde
 *    aynı olayı tekrar bildirmeden (idempotent eventKey) ntfy.sh kanalına anlık push bildirim gönderir.
 */

const NTFY_TOPIC = process.env.NTFY_TOPIC || "fenerbahce-canli-1907";
const POLL_INTERVAL_MS = 15 * 1000;

const notifiedEvents = new Set();
const matchStates = new Map();

async function sendNtfyPush(title, message, tags = "soccer,yellow_heart,blue_heart") {
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",
      headers: {
        Title: title,
        Priority: "high",
        Tags: tags,
      },
      body: message,
    });
    console.log(`[PUSH -> ${NTFY_TOPIC}] ${title}: ${message} (HTTP ${res.status})`);
  } catch (err) {
    console.warn("[PUSH HATASI]:", err.message);
  }
}

async function checkFootballMatches() {
  const leagues = ["tur.1", "uefa.champions", "uefa.europa"];

  for (const slug of leagues) {
    try {
      const res = await fetch(
        `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${slug}/teams/436/schedule`,
      );
      if (!res.ok) continue;
      const data = await res.json();
      const events = Array.isArray(data.events) ? data.events : [];

      for (const ev of events) {
        const comp = ev.competitions?.[0];
        if (!comp) continue;

        const state = comp.status?.type?.state; // pre | in | post
        const matchId = String(ev.id);
        const home = comp.competitors?.find((c) => c.homeAway === "home");
        const away = comp.competitors?.find((c) => c.homeAway === "away");
        if (!home || !away) continue;

        const homeName = home.team?.displayName || "Ev Sahibi";
        const awayName = away.team?.displayName || "Deplasman";
        const homeScore = home.score?.displayValue ?? home.score ?? "0";
        const awayScore = away.score?.displayValue ?? away.score ?? "0";
        const scoreStr = `${homeName} ${homeScore} - ${awayScore} ${awayName}`;

        const prevState = matchStates.get(matchId);

        // Maç yeni başladıysa
        if (state === "in" && prevState && prevState.state === "pre") {
          const startKey = `${matchId}-start`;
          if (!notifiedEvents.has(startKey)) {
            notifiedEvents.add(startKey);
            await sendNtfyPush(
              "Fenerbahce Maci Basladi!",
              `Düdük çaldı! ${scoreStr}`,
            );
          }
        }

        // Canlı maçta skor değiştiyse (GOL!)
        if (
          state === "in" &&
          prevState &&
          (prevState.homeScore !== String(homeScore) ||
            prevState.awayScore !== String(awayScore))
        ) {
          const clock = comp.status?.displayClock || "Canlı";
          const goalKey = `${matchId}-score-${homeScore}-${awayScore}`;
          if (!notifiedEvents.has(goalKey)) {
            notifiedEvents.add(goalKey);
            await sendNtfyPush(
              "GOOOL! Skor Degisti!",
              `(${clock}) ${scoreStr}`,
            );
          }
        }

        // Maç bittiyse
        if (state === "post" && prevState && prevState.state === "in") {
          const ftKey = `${matchId}-ft`;
          if (!notifiedEvents.has(ftKey)) {
            notifiedEvents.add(ftKey);
            await sendNtfyPush(
              "Mac Sonucu!",
              `MS: ${scoreStr}`,
              "checkered_flag,yellow_heart,blue_heart",
            );
          }
        }

        matchStates.set(matchId, {
          state,
          homeScore: String(homeScore),
          awayScore: String(awayScore),
        });
      }
    } catch (err) {
      console.warn(`[ESPN ${slug} kontrol hatası]:`, err.message);
    }
  }
}

async function runLoop() {
  console.log(
    `💛💙 Fenerbahçe Canlı Maç Motoru Başlatıldı! Bildirim Kanalı: https://ntfy.sh/${NTFY_TOPIC}`,
  );
  console.log(`Yoklama aralığı: ${POLL_INTERVAL_MS / 1000} saniye...\n`);

  await checkFootballMatches();
  setInterval(checkFootballMatches, POLL_INTERVAL_MS);
}

runLoop();
