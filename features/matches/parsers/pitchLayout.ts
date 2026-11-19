import { Lineup, Player } from "@/types";

export function getPitchCoordinates(
  formationPlace?: number | string,
  posName?: string,
  posAbbr?: string,
  formation?: string,
): { x: number; y: number } {
  const pNum =
    formationPlace !== undefined && formationPlace !== null
      ? parseInt(String(formationPlace), 10)
      : NaN;

  if (!isNaN(pNum) && pNum >= 1 && pNum <= 11) {
    if (formation === "4-1-4-1") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 50, y: 55 };
        case 8:
          return { x: 62, y: 38 };
        case 10:
          return { x: 38, y: 38 };
        case 7:
          return { x: 84, y: 35 };
        case 11:
          return { x: 16, y: 35 };
        case 9:
          return { x: 50, y: 15 };
      }
    } else if (formation === "4-3-3") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 50, y: 54 };
        case 7:
          return { x: 68, y: 44 };
        case 8:
          return { x: 32, y: 44 };
        case 10:
          return { x: 82, y: 22 };
        case 11:
          return { x: 18, y: 22 };
        case 9:
          return { x: 50, y: 15 };
      }
    } else if (formation === "4-4-2") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 7:
          return { x: 84, y: 46 };
        case 8:
          return { x: 62, y: 48 };
        case 4:
          return { x: 38, y: 48 };
        case 11:
          return { x: 16, y: 46 };
        case 10:
          return { x: 64, y: 16 };
        case 9:
          return { x: 36, y: 16 };
      }
    } else if (formation === "3-5-2") {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 74, y: 72 };
        case 5:
          return { x: 50, y: 74 };
        case 6:
          return { x: 26, y: 72 };
        case 7:
          return { x: 86, y: 46 };
        case 8:
          return { x: 64, y: 50 };
        case 4:
          return { x: 50, y: 56 };
        case 10:
          return { x: 36, y: 50 };
        case 3:
          return { x: 14, y: 46 };
        case 11:
          return { x: 64, y: 16 };
        case 9:
          return { x: 36, y: 16 };
      }
    } else {
      switch (pNum) {
        case 1:
          return { x: 50, y: 88 };
        case 2:
          return { x: 86, y: 70 };
        case 5:
          return { x: 62, y: 72 };
        case 6:
          return { x: 38, y: 72 };
        case 3:
          return { x: 14, y: 70 };
        case 4:
          return { x: 35, y: 53 };
        case 8:
          return { x: 65, y: 53 };
        case 7:
          return { x: 84, y: 33 };
        case 10:
          return { x: 50, y: 33 };
        case 11:
          return { x: 16, y: 33 };
        case 9:
          return { x: 50, y: 15 };
      }
    }
  }

  const a = (posAbbr || "").toUpperCase().trim();
  const p = (posName || "").toLowerCase().trim();

  if (a === "G" || a === "GK" || p.includes("goal")) return { x: 50, y: 88 };

  if (a === "RB" || p.includes("right back")) return { x: 86, y: 70 };
  if (a === "LB" || p.includes("left back")) return { x: 14, y: 70 };
  if (a === "RWB" || p.includes("right wing back")) return { x: 88, y: 62 };
  if (a === "LWB" || p.includes("left wing back")) return { x: 12, y: 62 };
  if (
    a === "CD-R" ||
    a === "CB-R" ||
    a === "RCB" ||
    p.includes("center right defender")
  )
    return { x: 62, y: 72 };
  if (
    a === "CD-L" ||
    a === "CB-L" ||
    a === "LCB" ||
    p.includes("center left defender")
  )
    return { x: 38, y: 72 };
  if (a === "CD" || a === "CB" || p.includes("center back"))
    return { x: 50, y: 72 };
  if (p.includes("defender") || p.includes("back")) return { x: 50, y: 72 };

  if (a === "DM-R" || a === "RDM") return { x: 65, y: 54 };
  if (a === "DM-L" || a === "LDM") return { x: 35, y: 54 };
  if (a === "DM" || a === "CDM" || p.includes("defensive mid"))
    return { x: 50, y: 55 };
  if (a === "AM-R" || a === "RAM" || p.includes("attacking midfielder right"))
    return { x: 82, y: 33 };
  if (a === "AM-L" || a === "LAM" || p.includes("attacking midfielder left"))
    return { x: 18, y: 33 };
  if (a === "AM" || a === "CAM" || p.includes("attacking mid"))
    return { x: 50, y: 33 };
  if (a === "CM-R" || a === "RCM" || p.includes("center right mid"))
    return { x: 64, y: 44 };
  if (a === "CM-L" || a === "LCM" || p.includes("center left mid"))
    return { x: 36, y: 44 };
  if (a === "RM" || p.includes("right mid")) return { x: 84, y: 40 };
  if (a === "LM" || p.includes("left mid")) return { x: 16, y: 40 };
  if (a === "CM" || a === "M" || p.includes("midfield"))
    return { x: 50, y: 46 };

  if (
    a === "RW" ||
    a === "RF" ||
    p.includes("right wing") ||
    p.includes("right forward")
  )
    return { x: 82, y: 20 };
  if (
    a === "LW" ||
    a === "LF" ||
    p.includes("left wing") ||
    p.includes("left forward")
  )
    return { x: 18, y: 20 };
  if (
    a === "ST" ||
    a === "CF" ||
    a === "F" ||
    p.includes("striker") ||
    p.includes("forward")
  )
    return { x: 50, y: 15 };

  return { x: 50, y: 50 };
}

export function resolveLineupCollisions(players: Player[]): Player[] {
  if (players.length <= 1) return players;

  const spreadRow = (row: Player[], defaultY: number) => {
    if (row.length === 0) return;
    const count = row.length;
    const hasOverlap =
      row.length > 1 &&
      row.some((p1, idx1) =>
        row.some(
          (p2, idx2) =>
            idx1 !== idx2 &&
            Math.abs(p1.gridPosition.x - p2.gridPosition.x) < 8 &&
            Math.abs(p1.gridPosition.y - p2.gridPosition.y) < 8,
        ),
      );

    if (hasOverlap || row.every((p) => p.gridPosition.x === 50)) {
      const sorted = [...row].sort(
        (a, b) => a.gridPosition.x - b.gridPosition.x,
      );
      sorted.forEach((p, i) => {
        const x = count === 1 ? 50 : Math.round(15 + (i * 70) / (count - 1));
        p.gridPosition = {
          x,
          y: p.gridPosition.y || defaultY,
        };
      });
    }
  };

  const gks = players.filter((p) => p.gridPosition.y >= 82);
  const dfs = players.filter(
    (p) => p.gridPosition.y >= 60 && p.gridPosition.y < 82,
  );
  const mfs = players.filter(
    (p) => p.gridPosition.y >= 26 && p.gridPosition.y < 60,
  );
  const fws = players.filter((p) => p.gridPosition.y < 26);

  spreadRow(gks, 88);
  spreadRow(dfs, 71);

  const dms = mfs.filter((p) => p.gridPosition.y >= 45);
  const ams = mfs.filter((p) => p.gridPosition.y < 45);
  if (dms.length > 0 && ams.length > 0) {
    spreadRow(dms, 53);
    spreadRow(ams, 33);
  } else {
    spreadRow(mfs, 46);
  }

  spreadRow(fws, 16);

  return players;
}

export function mapPositionAbbr(pos: string = ""): string {
  const p = pos.toLowerCase();
  if (p.includes("goalkeeper")) return "KL";
  if (p.includes("defender") || p.includes("back")) return "DF";
  if (p.includes("midfield")) return "OS";
  if (p.includes("forward") || p.includes("striker") || p.includes("winger"))
    return "FV";
  return "OY";
}

export function isSamePlayer(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false;
  const clean = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const a = clean(nameA);
  const b = clean(nameB);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;

  const partsA = a.split(/\s+/).filter(Boolean);
  const partsB = b.split(/\s+/).filter(Boolean);
  const lastA = partsA[partsA.length - 1];
  const lastB = partsB[partsB.length - 1];
  if (lastA && lastB && lastA === lastB && lastA.length > 2) return true;

  return false;
}

export function attachStatsToLineup(
  lineup: Lineup,
  teamKey: "home" | "away",
  goalsAndAssists: {
    team: "home" | "away";
    scorer: string;
    assister?: string;
  }[],
): void {
  if (!lineup) return;
  const teamEvents = goalsAndAssists.filter((e) => e.team === teamKey);

  const tallyPlayer = (p: {
    name: string;
    goals?: number;
    assists?: number;
  }) => {
    let goals = 0;
    let assists = 0;
    teamEvents.forEach((ev) => {
      if (isSamePlayer(p.name, ev.scorer)) {
        goals++;
      }
      if (ev.assister && isSamePlayer(p.name, ev.assister)) {
        assists++;
      }
    });
    if (goals > 0) {
      p.goals = goals;
    } else {
      delete p.goals;
    }
    if (assists > 0) {
      p.assists = assists;
    } else {
      delete p.assists;
    }
  };

  if (Array.isArray(lineup.startingXI)) {
    lineup.startingXI.forEach(tallyPlayer);
  }
  if (Array.isArray(lineup.substitutes)) {
    lineup.substitutes.forEach(tallyPlayer);
  }
}
