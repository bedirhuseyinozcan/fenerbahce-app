import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { evaluatePredictionResult } from "@/services/fanEngagementService";
import { MatchDetailData, PredictionData } from "@/types";
import { triggerLightHaptic } from "@/utils/haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ScorePredictionCardProps {
  match: MatchDetailData;
  isLive: boolean;
  isFinished: boolean;
  predHome: number;
  predAway: number;
  savedPred: PredictionData | null;
  syncNote?: string;
  onOpenLeague?: () => void;
  onChangeHome: (delta: number) => void;
  onChangeAway: (delta: number) => void;
  onSave: () => void;
}

export function ScorePredictionCard({
  match,
  isLive,
  isFinished,
  predHome,
  predAway,
  savedPred,
  syncNote,
  onOpenLeague,
  onChangeHome,
  onChangeAway,
  onSave,
}: ScorePredictionCardProps) {
  const { theme, brand } = useAppTheme();
  const isLocked = isLive || isFinished;
  const evaluation = evaluatePredictionResult(savedPred, match);

  const renderOutcomeBadge = () => {
    if (!savedPred) {
      if (isLocked) {
        return (
          <Text style={[styles.predLocked, { color: theme.secondaryText }]}>
            {isLive ? "Maç başladı (Kilitli)" : "Maç sona erdi"}
          </Text>
        );
      }
      return null;
    }

    if (evaluation.status === "exact") {
      return (
        <View
          style={[
            styles.resultPill,
            { backgroundColor: "rgba(16, 185, 129, 0.18)" },
          ]}
        >
          <Text style={[styles.resultPillText, { color: brand.winGreen }]}>
            🎯 Tam Skor! +3 Puan
          </Text>
        </View>
      );
    }

    if (evaluation.status === "outcome") {
      return (
        <View
          style={[
            styles.resultPill,
            { backgroundColor: "rgba(245, 158, 11, 0.18)" },
          ]}
        >
          <Text style={[styles.resultPillText, { color: brand.drawAmber }]}>
            ✅ Doğru Sonuç! +1 Puan
          </Text>
        </View>
      );
    }

    if (evaluation.status === "miss") {
      return (
        <View
          style={[
            styles.resultPill,
            { backgroundColor: "rgba(239, 68, 68, 0.14)" },
          ]}
        >
          <Text style={[styles.resultPillText, { color: brand.lossRed }]}>
            ❌ Bu Sefer Olmadı
          </Text>
        </View>
      );
    }

    return (
      <Text style={[styles.predSaved, { color: brand.winGreen }]}>
        ✓ Tahminin: {savedPred.homeScore} - {savedPred.awayScore}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: "rgba(255, 237, 0, 0.45)",
        },
      ]}
    >
      <View style={styles.predHeader}>
        <Text style={[styles.predTitle, { color: theme.accent }]}>
          🎯 TARAFTAR SKOR TAHMİNİ
        </Text>
        {renderOutcomeBadge()}
      </View>

      <View style={styles.predRow}>
        <View style={styles.predTeamCol}>
          <Text
            style={[styles.predTeamLabel, { color: theme.text }]}
            numberOfLines={1}
          >
            {match.homeTeam}
          </Text>
          <View style={styles.predStepperRow}>
            <TouchableOpacity
              disabled={isLocked}
              onPress={() => {
                triggerLightHaptic();
                onChangeHome(-1);
              }}
              style={[
                styles.stepperBtn,
                { backgroundColor: brand.navy },
                isLocked && styles.stepperDisabled,
              ]}
            >
              <Text style={[styles.stepperText, { color: brand.yellow }]}>
                -
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.predScoreValue,
                styles.tabularNumbers,
                { color: theme.text },
              ]}
            >
              {predHome}
            </Text>
            <TouchableOpacity
              disabled={isLocked}
              onPress={() => {
                triggerLightHaptic();
                onChangeHome(1);
              }}
              style={[
                styles.stepperBtn,
                { backgroundColor: brand.navy },
                isLocked && styles.stepperDisabled,
              ]}
            >
              <Text style={[styles.stepperText, { color: brand.yellow }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.predDash, { color: theme.secondaryText }]}>-</Text>

        <View style={styles.predTeamCol}>
          <Text
            style={[styles.predTeamLabel, { color: theme.text }]}
            numberOfLines={1}
          >
            {match.awayTeam}
          </Text>
          <View style={styles.predStepperRow}>
            <TouchableOpacity
              disabled={isLocked}
              onPress={() => {
                triggerLightHaptic();
                onChangeAway(-1);
              }}
              style={[
                styles.stepperBtn,
                { backgroundColor: brand.navy },
                isLocked && styles.stepperDisabled,
              ]}
            >
              <Text style={[styles.stepperText, { color: brand.yellow }]}>
                -
              </Text>
            </TouchableOpacity>
            <Text
              style={[
                styles.predScoreValue,
                styles.tabularNumbers,
                { color: theme.text },
              ]}
            >
              {predAway}
            </Text>
            <TouchableOpacity
              disabled={isLocked}
              onPress={() => {
                triggerLightHaptic();
                onChangeAway(1);
              }}
              style={[
                styles.stepperBtn,
                { backgroundColor: brand.navy },
                isLocked && styles.stepperDisabled,
              ]}
            >
              <Text style={[styles.stepperText, { color: brand.yellow }]}>
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!isLocked && (
        <TouchableOpacity
          onPress={onSave}
          style={[styles.predSaveBtn, { backgroundColor: brand.navy }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.predSaveBtnText, { color: brand.yellow }]}>
            {savedPred ? "Tahmini Güncelle" : "Skor Tahminini Kaydet"}
          </Text>
        </TouchableOpacity>
      )}

      {(syncNote || onOpenLeague) && (
        <View style={styles.leagueFooterRow}>
          <Text
            style={[styles.syncNoteText, { color: theme.secondaryText }]}
            numberOfLines={2}
          >
            {syncNote || "Arkadaşlarınla yarışmak için Tahmin Ligi'ne katıl"}
          </Text>
          {onOpenLeague && (
            <TouchableOpacity onPress={onOpenLeague}>
              <Text style={[styles.leagueLinkText, { color: theme.accent }]}>
                Tahmin Ligi →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  infoCard: {
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 16,
  },
  predHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
    flexWrap: "wrap",
  },
  predTitle: {
    fontSize: 13,
    fontWeight: "900",
  },
  predSaved: {
    fontSize: 11,
    fontWeight: "bold",
  },
  predLocked: {
    fontSize: 11,
    fontWeight: "600",
  },
  resultPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  predRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginVertical: 6,
  },
  predTeamCol: {
    alignItems: "center",
    flex: 1,
  },
  predTeamLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },
  predStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperDisabled: {
    opacity: 0.45,
  },
  stepperText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  predScoreValue: {
    fontSize: 20,
    fontWeight: "900",
    minWidth: 24,
    textAlign: "center",
  },
  predDash: {
    fontSize: 18,
    fontWeight: "900",
  },
  predSaveBtn: {
    marginTop: 10,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  predSaveBtnText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  leagueFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  syncNoteText: {
    flex: 1,
    fontSize: 11,
  },
  leagueLinkText: {
    fontSize: 11,
    fontWeight: "800",
  },
});
