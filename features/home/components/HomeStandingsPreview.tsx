import CloudinaryImage from "@/components/CloudinaryImage";
import { StandingsSkeleton } from "@/components/ui/Skeleton";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { TeamStanding } from "@/types";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HomeStandingsPreviewProps {
  standings: TeamStanding[];
  loading: boolean;
  onPressSeeAll: () => void;
}

export function HomeStandingsPreview({
  standings,
  loading,
  onPressSeeAll,
}: HomeStandingsPreviewProps) {
  const { theme } = useAppTheme();

  const { rows, hasGapToFB } = useMemo(() => {
    const fbIdx = standings.findIndex((t) =>
      t.teamName.toLowerCase().includes("fenerbah"),
    );
    if (fbIdx <= 4) {
      return { rows: standings.slice(0, 5), hasGapToFB: false };
    }
    return {
      rows: [...standings.slice(0, 4), standings[fbIdx]],
      hasGapToFB: true,
    };
  }, [standings]);

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          SÜPER LİG PUAN DURUMU
        </Text>
        <TouchableOpacity onPress={onPressSeeAll}>
          <Text style={[styles.sectionLink, { color: theme.accent }]}>
            + Tüm Liste
          </Text>
        </TouchableOpacity>
      </View>

      {loading && standings.length === 0 ? (
        <View style={{ marginHorizontal: 16 }}>
          <StandingsSkeleton rows={5} />
        </View>
      ) : (
        <View
          style={[
            styles.standingsContainer,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.standingsHeaderRow,
              { borderBottomColor: theme.divider },
            ]}
          >
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 0.6, color: theme.secondaryText },
              ]}
            >
              #
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 3, color: theme.secondaryText },
              ]}
            >
              TAKIM
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              O
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              AV
            </Text>
            <Text
              style={[
                styles.standingsHeaderText,
                { flex: 1, textAlign: "center", color: theme.secondaryText },
              ]}
            >
              P
            </Text>
          </View>

          {rows.map((team, idx) => {
            const isFB = team.teamName.toLowerCase().includes("fenerbah");
            const showDividerBefore = hasGapToFB && idx === rows.length - 1;
            const zoneColor =
              team.rank <= 2
                ? "#10B981"
                : team.rank <= 4
                  ? "#3B82F6"
                  : "transparent";

            return (
              <React.Fragment key={team.teamId}>
                {showDividerBefore && (
                  <View
                    style={[
                      styles.gapDivider,
                      { backgroundColor: theme.divider },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.standingsRow,
                    { borderBottomColor: theme.divider },
                    isFB && { backgroundColor: theme.highlightRow },
                  ]}
                >
                  <View style={styles.rankCol}>
                    <View
                      style={[
                        styles.zoneBar,
                        { backgroundColor: zoneColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.standingsText,
                        styles.tabularNumbers,
                        {
                          fontWeight: "bold",
                          color: isFB ? theme.accent : theme.text,
                        },
                      ]}
                    >
                      {team.rank}
                    </Text>
                  </View>
                  <View style={styles.standingsTeamCell}>
                    <CloudinaryImage
                      publicId={team.badge}
                      style={{ width: 20, height: 20, marginRight: 8 }}
                      contentFit="contain"
                    />
                    <Text
                      style={[
                        styles.standingsText,
                        {
                          color: theme.text,
                          fontWeight: isFB ? "bold" : "normal",
                          fontSize: 13,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {team.teamName}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {team.played}
                  </Text>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        color: theme.secondaryText,
                      },
                    ]}
                  >
                    {team.goalDifference > 0
                      ? `+${team.goalDifference}`
                      : team.goalDifference}
                  </Text>
                  <Text
                    style={[
                      styles.standingsText,
                      styles.tabularNumbers,
                      {
                        flex: 1,
                        textAlign: "center",
                        fontWeight: "bold",
                        color: theme.text,
                      },
                    ]}
                  >
                    {team.points}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "bold",
  },
  standingsContainer: {
    marginHorizontal: 16,
    borderRadius: Radius.md,
    paddingVertical: 6,
    borderWidth: 1,
  },
  standingsHeaderRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  standingsHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  gapDivider: {
    height: 2,
    marginHorizontal: 12,
    marginVertical: 2,
  },
  standingsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rankCol: {
    flex: 0.6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  zoneBar: {
    width: 3,
    height: 14,
    borderRadius: 2,
  },
  standingsTeamCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  standingsText: {
    fontSize: 14,
  },
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
});
