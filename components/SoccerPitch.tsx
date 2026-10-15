import Colors from "@/constants/Colors";
import { Lineup, Player } from "@/types";
import { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SoccerPitchProps {
  lineup: Lineup;
  teamName: string;
  isFenerbahce?: boolean;
  branch?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PITCH_WIDTH = SCREEN_WIDTH - 32;
const PITCH_HEIGHT = 440;

export default function SoccerPitch({
  lineup,
  teamName,
  isFenerbahce = true,
  branch = "Futbol",
}: SoccerPitchProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const isBasketball = branch === "Basketbol";
  const isVolleyball = branch === "Voleybol";

  return (
    <View style={styles.wrapper}>
      <View style={styles.pitchHeader}>
        <View style={styles.formationBadge}>
          <Text style={styles.formationText}>
            {isBasketball
              ? "İlk 5"
              : isVolleyball
                ? "İlk 6"
                : `Formasyon: ${lineup.formation}`}
          </Text>
        </View>
        <Text style={styles.coachText}>
          {isBasketball || isVolleyball ? "Baş Antrenör: " : "T.D.: "}
          {lineup.coach}
        </Text>
      </View>

      {selectedPlayer && (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedBannerText}>
            #{selectedPlayer.number} {selectedPlayer.name} (
            {selectedPlayer.position})
          </Text>
        </View>
      )}

      <View style={styles.pitchContainer}>
        <View style={styles.stripesContainer}>
          {[...Array(6)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.stripe,
                {
                  backgroundColor: isBasketball
                    ? i % 2 === 0
                      ? "#C1894D"
                      : "#B47C42"
                    : isVolleyball
                      ? i % 2 === 0
                        ? "#1E88E5"
                        : "#1976D2"
                      : i % 2 === 0
                        ? "#1b5e20"
                        : "#226a27",
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.pitchBorder}>
          {!isBasketball && !isVolleyball && (
            <>
              <View style={styles.topPenaltyBox} />
              <View style={styles.topGoalBox} />
              <View style={styles.topPenaltyArc} />
              <View style={styles.halfwayLine} />
              <View style={styles.centerCircle} />
              <View style={styles.centerSpot} />
              <View style={styles.bottomPenaltyArc} />
              <View style={styles.bottomPenaltyBox} />
              <View style={styles.bottomGoalBox} />
            </>
          )}

          {isBasketball && (
            <>
              <View style={styles.halfwayLine} />
              <View style={styles.centerCircle} />
              <View style={styles.bballTopKey} />
              <View style={styles.bballTopArc} />
              <View style={styles.bballBottomKey} />
              <View style={styles.bballBottomArc} />
            </>
          )}

          {isVolleyball && (
            <>
              <View
                style={[
                  styles.halfwayLine,
                  { height: 3, backgroundColor: "#FFD54F" },
                ]}
              />
              <View style={styles.vballAttackLineTop} />
              <View style={styles.vballAttackLineBottom} />
            </>
          )}

          {lineup.startingXI.map((player) => {
            const isSelected = selectedPlayer?.id === player.id;
            return (
              <TouchableOpacity
                key={player.id}
                activeOpacity={0.8}
                onPress={() => setSelectedPlayer(player)}
                style={[
                  styles.playerWrapper,
                  {
                    left: `${player.gridPosition.x}%`,
                    top: `${player.gridPosition.y}%`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.playerCircle,
                    {
                      backgroundColor: isFenerbahce
                        ? isSelected
                          ? Colors.brand.yellow
                          : Colors.brand.navy
                        : isSelected
                          ? "#E53935"
                          : "#37474F",
                      borderColor: isFenerbahce
                        ? Colors.brand.yellow
                        : "#FFFFFF",
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.playerNumber,
                      {
                        color: isFenerbahce
                          ? isSelected
                            ? Colors.brand.navy
                            : Colors.brand.yellow
                          : "#FFFFFF",
                      },
                    ]}
                  >
                    {player.number}
                  </Text>
                </View>

                <View style={styles.playerNamePill}>
                  <Text style={styles.playerNameText} numberOfLines={1}>
                    {player.name.split(" ").slice(-1)[0]}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 12,
    alignItems: "center",
  },
  pitchHeader: {
    width: PITCH_WIDTH,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  formationBadge: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.brand.yellow,
  },
  formationText: {
    color: Colors.brand.yellow,
    fontSize: 12,
    fontWeight: "bold",
  },
  coachText: {
    color: "#666",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedBanner: {
    width: PITCH_WIDTH,
    backgroundColor: "rgba(7, 33, 70, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  selectedBannerText: {
    color: Colors.brand.yellow,
    fontSize: 13,
    fontWeight: "bold",
  },
  pitchContainer: {
    width: PITCH_WIDTH,
    height: PITCH_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  stripesContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: "column",
  },
  stripe: {
    flex: 1,
  },
  pitchBorder: {
    ...StyleSheet.absoluteFill,
    margin: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  halfwayLine: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.65)",
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 80,
    height: 80,
    marginLeft: -40,
    marginTop: -40,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  centerSpot: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 6,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  bottomPenaltyBox: {
    position: "absolute",
    bottom: 0,
    left: "22%",
    right: "22%",
    height: 65,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  bottomGoalBox: {
    position: "absolute",
    bottom: 0,
    left: "35%",
    right: "35%",
    height: 25,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  bottomPenaltyArc: {
    position: "absolute",
    bottom: 50,
    left: "50%",
    marginLeft: -25,
    width: 50,
    height: 30,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  topPenaltyBox: {
    position: "absolute",
    top: 0,
    left: "22%",
    right: "22%",
    height: 65,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  topGoalBox: {
    position: "absolute",
    top: 0,
    left: "35%",
    right: "35%",
    height: 25,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  topPenaltyArc: {
    position: "absolute",
    top: 50,
    left: "50%",
    marginLeft: -25,
    width: 50,
    height: 30,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  bballTopKey: {
    position: "absolute",
    top: 0,
    left: "32%",
    right: "32%",
    height: 80,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  bballTopArc: {
    position: "absolute",
    top: -20,
    left: "12%",
    right: "12%",
    height: 140,
    borderRadius: 80,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  bballBottomKey: {
    position: "absolute",
    bottom: 0,
    left: "32%",
    right: "32%",
    height: 80,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  bballBottomArc: {
    position: "absolute",
    bottom: -20,
    left: "12%",
    right: "12%",
    height: 140,
    borderRadius: 80,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.65)",
  },
  vballAttackLineTop: {
    position: "absolute",
    top: "33%",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  vballAttackLineBottom: {
    position: "absolute",
    bottom: "33%",
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  playerWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -24 }, { translateY: -20 }],
    width: 48,
  },
  playerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  playerNumber: {
    fontSize: 13,
    fontWeight: "bold",
  },
  playerNamePill: {
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 55,
  },
  playerNameText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
  },
});
