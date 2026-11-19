import SoccerPitch from "@/components/SoccerPitch";
import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { MatchDetailData } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function MatchLineupsTab({ match }: { match: MatchDetailData }) {
  const { theme, brand } = useAppTheme();
  const [selectedTeamLineup, setSelectedTeamLineup] = useState<"home" | "away">(
    "home",
  );

  const currentLineup =
    selectedTeamLineup === "home" ? match.homeLineup : match.awayLineup;
  const hasConfirmedLineup =
    currentLineup.isConfirmed !== false &&
    currentLineup.startingXI &&
    currentLineup.startingXI.length > 0;

  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.teamToggleRow}>
        <TouchableOpacity
          style={[
            styles.teamToggleButton,
            {
              backgroundColor:
                selectedTeamLineup === "home"
                  ? brand.navy
                  : theme.cardBackground,
              borderColor:
                selectedTeamLineup === "home" ? brand.yellow : theme.border,
            },
          ]}
          onPress={() => {
            triggerSelectionHaptic();
            setSelectedTeamLineup("home");
          }}
        >
          <Text
            style={[
              styles.teamToggleText,
              {
                color:
                  selectedTeamLineup === "home"
                    ? brand.yellow
                    : theme.secondaryText,
              },
            ]}
            numberOfLines={1}
          >
            {match.homeTeam}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.teamToggleButton,
            {
              backgroundColor:
                selectedTeamLineup === "away"
                  ? brand.navy
                  : theme.cardBackground,
              borderColor:
                selectedTeamLineup === "away" ? brand.yellow : theme.border,
            },
          ]}
          onPress={() => {
            triggerSelectionHaptic();
            setSelectedTeamLineup("away");
          }}
        >
          <Text
            style={[
              styles.teamToggleText,
              {
                color:
                  selectedTeamLineup === "away"
                    ? brand.yellow
                    : theme.secondaryText,
              },
            ]}
            numberOfLines={1}
          >
            {match.awayTeam}
          </Text>
        </TouchableOpacity>
      </View>

      {!hasConfirmedLineup ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              paddingVertical: 36,
              paddingHorizontal: 20,
            },
          ]}
        >
          <Ionicons name="shirt-outline" size={36} color={theme.accent} />
          <Text
            style={{
              color: theme.text,
              fontSize: 15,
              fontWeight: "bold",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            Resmi Kadro Henüz Yayınlanmadı
          </Text>
          <Text
            style={[
              styles.emptyText,
              { color: theme.secondaryText, marginTop: 6 },
            ]}
          >
            Bu karşılaşma için resmi maç kadrosu açıklandığında veya sağlayıcı
            tarafından paylaşıldığında burada yer alacaktır.
          </Text>
          {currentLineup.coach ? (
            <View
              style={{
                marginTop: 14,
                backgroundColor: theme.badgeBg,
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: theme.badgeText,
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                Teknik Direktör: {currentLineup.coach}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <>
          <SoccerPitch
            lineup={currentLineup}
            teamName={
              selectedTeamLineup === "home" ? match.homeTeam : match.awayTeam
            }
            isFenerbahce={
              selectedTeamLineup === "home"
                ? match.homeTeam.toLowerCase().includes("fenerbah")
                : match.awayTeam.toLowerCase().includes("fenerbah")
            }
            branch={match.branch}
          />

          {currentLineup.substitutes.length > 0 && (
            <View
              style={[
                styles.subsCard,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.subsHeading, { color: theme.text }]}>
                YEDEKLER
              </Text>
              <View style={styles.subsGrid}>
                {currentLineup.substitutes.map((sub) => (
                  <View key={sub.id} style={styles.subItem}>
                    <View
                      style={[
                        styles.subNumberBadge,
                        { backgroundColor: brand.navy },
                      ]}
                    >
                      <Text
                        style={[styles.subNumberText, { color: brand.yellow }]}
                      >
                        {sub.number}
                      </Text>
                    </View>
                    <Text
                      style={[styles.subNameText, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {sub.name}
                    </Text>
                    <View style={styles.subMetaRight}>
                      {typeof sub.goals === "number" && sub.goals > 0 ? (
                        <View
                          style={[
                            styles.subEventBadge,
                            { backgroundColor: theme.surfaceSubtle },
                          ]}
                        >
                          <Text style={{ fontSize: 10, color: theme.text }}>
                            ⚽{sub.goals > 1 ? ` ${sub.goals}` : ""}
                          </Text>
                        </View>
                      ) : null}
                      {typeof sub.assists === "number" && sub.assists > 0 ? (
                        <View
                          style={[
                            styles.subEventBadge,
                            { backgroundColor: "#FFD700" },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="shoe-cleat"
                            size={11}
                            color={brand.navy}
                          />
                          {sub.assists > 1 ? (
                            <Text
                              style={{
                                fontSize: 9,
                                fontWeight: "800",
                                color: brand.navy,
                              }}
                            >
                              {sub.assists}
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                      <Text
                        style={[
                          styles.subPosText,
                          { color: theme.secondaryText },
                        ]}
                      >
                        {sub.position}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContentContainer: {
    padding: 16,
  },
  teamToggleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  teamToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
  },
  teamToggleText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  emptyCard: {
    padding: 30,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    textAlign: "center",
  },
  subsCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  subsHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  subsGrid: {
    gap: 8,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  subNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  subNumberText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  subNameText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
  },
  subMetaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subPosText: {
    fontSize: 12,
    fontWeight: "600",
  },
  subEventBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
