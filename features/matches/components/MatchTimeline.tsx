import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { CommentaryItem, MatchEvent } from "@/types";
import { triggerSelectionHaptic } from "@/utils/haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MatchTimelineProps {
  events: MatchEvent[];
  commentary?: CommentaryItem[];
  isLive: boolean;
  isFinished: boolean;
}

export function MatchTimeline({
  events,
  commentary = [],
  isLive,
  isFinished,
}: MatchTimelineProps) {
  const { theme, brand } = useAppTheme();
  const hasCommentary = commentary.length > 0;
  const [timelineMode, setTimelineMode] = useState<"events" | "commentary">(
    "events",
  );

  const visibleCommentary = useMemo(() => commentary.slice(0, 40), [commentary]);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionHeading, { color: theme.text }]}>
          {timelineMode === "events" ? "MAÇ OLAYLARI" : "CANLI ANLATIM"}
        </Text>

        {hasCommentary && (
          <View
            style={[
              styles.modeSwitch,
              {
                backgroundColor: theme.surfaceSubtle,
                borderColor: theme.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                triggerSelectionHaptic();
                setTimelineMode("events");
              }}
              style={[
                styles.modeBtn,
                timelineMode === "events" && { backgroundColor: brand.navy },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  {
                    color:
                      timelineMode === "events"
                        ? brand.yellow
                        : theme.secondaryText,
                  },
                ]}
              >
                Önemli Anlar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                triggerSelectionHaptic();
                setTimelineMode("commentary");
              }}
              style={[
                styles.modeBtn,
                timelineMode === "commentary" && {
                  backgroundColor: brand.navy,
                },
              ]}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  {
                    color:
                      timelineMode === "commentary"
                        ? brand.yellow
                        : theme.secondaryText,
                  },
                ]}
              >
                Tüm Anlatım ({commentary.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {timelineMode === "commentary" && hasCommentary ? (
        <View
          style={[
            styles.eventsCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              paddingHorizontal: 14,
            },
          ]}
        >
          {visibleCommentary.map((item) => {
            const dotColor =
              item.importance === "goal"
                ? brand.winGreen
                : item.importance === "card"
                  ? brand.drawAmber
                  : item.importance === "chance"
                    ? theme.accent
                    : theme.secondaryText;
            return (
              <View
                key={item.id}
                style={[styles.commRow, { borderBottomColor: theme.divider }]}
              >
                <View style={styles.commClockCol}>
                  <Text
                    style={[
                      styles.commClock,
                      styles.tabularNumbers,
                      { color: theme.accent },
                    ]}
                  >
                    {item.clock}
                  </Text>
                  <View
                    style={[styles.commDot, { backgroundColor: dotColor }]}
                  />
                </View>
                <Text
                  style={[
                    styles.commText,
                    {
                      color: theme.text,
                      fontWeight:
                        item.importance === "goal" ? "700" : "normal",
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            );
          })}
        </View>
      ) : events.length > 0 ? (
        <View
          style={[
            styles.eventsCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          {events.map((event, index) => {
            const isHome = event.team === "home";
            return (
              <View
                key={event.id || index}
                style={[styles.eventRow, { borderBottomColor: theme.divider }]}
              >
                <View style={styles.eventTeamSide}>
                  {isHome && (
                    <View style={styles.eventContentRightAlign}>
                      <Text
                        style={[
                          styles.eventPlayer,
                          { color: theme.text, textAlign: "right" },
                        ]}
                      >
                        {event.player}
                      </Text>
                      {event.detail && (
                        <Text
                          style={[
                            styles.eventDetail,
                            {
                              color: theme.secondaryText,
                              textAlign: "right",
                            },
                          ]}
                        >
                          {event.detail}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.eventCenter}>
                  <View
                    style={[
                      styles.eventIconBadge,
                      { backgroundColor: theme.surfaceSubtle },
                    ]}
                  >
                    {event.type === "goal" && (
                      <Text style={{ fontSize: 14 }}>⚽</Text>
                    )}
                    {event.type === "yellow-card" && (
                      <View
                        style={[
                          styles.cardSquare,
                          { backgroundColor: "#FFD600" },
                        ]}
                      />
                    )}
                    {event.type === "red-card" && (
                      <View
                        style={[
                          styles.cardSquare,
                          { backgroundColor: "#D50000" },
                        ]}
                      />
                    )}
                    {event.type === "substitution" && (
                      <Ionicons
                        name="swap-horizontal"
                        size={16}
                        color="#00C853"
                      />
                    )}
                    {event.type === "var" && (
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "bold",
                          color: theme.text,
                        }}
                      >
                        VAR
                      </Text>
                    )}
                    {event.type === "basket-3pt" && (
                      <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                        🎯 3P
                      </Text>
                    )}
                    {event.type === "basket-2pt" && (
                      <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                        🏀 2P
                      </Text>
                    )}
                    {event.type === "timeout" && (
                      <Text style={{ fontSize: 13 }}>⏱️</Text>
                    )}
                    {event.type === "ace" && (
                      <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                        ⚡ACE
                      </Text>
                    )}
                    {event.type === "block" && (
                      <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                        🧱BLK
                      </Text>
                    )}
                    {event.type === "spike" && (
                      <Text style={{ fontSize: 12 }}>💥</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.eventMinute,
                      styles.tabularNumbers,
                      { color: theme.accent },
                    ]}
                  >
                    {event.quarterOrSet
                      ? event.quarterOrSet
                      : `${event.minute}'`}
                  </Text>
                </View>

                <View style={styles.eventTeamSide}>
                  {!isHome && (
                    <View style={styles.eventContentLeftAlign}>
                      <Text
                        style={[
                          styles.eventPlayer,
                          { color: theme.text, textAlign: "left" },
                        ]}
                      >
                        {event.player}
                      </Text>
                      {event.detail && (
                        <Text
                          style={[
                            styles.eventDetail,
                            {
                              color: theme.secondaryText,
                              textAlign: "left",
                            },
                          ]}
                        >
                          {event.detail}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="time-outline" size={32} color={theme.secondaryText} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
            {isFinished
              ? "Bu karşılaşma için detaylı dakika olay kaydı paylaşılmadı."
              : isLive
                ? "Önemli anlar oluştukça burada listelenecek."
                : "Maç henüz başlamadığı için önemli an bulunmuyor."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  modeSwitch: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  modeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
  eventsCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  eventTeamSide: {
    flex: 1,
  },
  eventContentRightAlign: {
    alignItems: "flex-end",
    paddingRight: 10,
  },
  eventContentLeftAlign: {
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  eventPlayer: {
    fontSize: 13,
    fontWeight: "bold",
  },
  eventDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  eventCenter: {
    alignItems: "center",
    width: 50,
  },
  eventIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  cardSquare: {
    width: 10,
    height: 14,
    borderRadius: 2,
  },
  eventMinute: {
    fontSize: 11,
    fontWeight: "bold",
  },
  commRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    gap: 10,
  },
  commClockCol: {
    width: 44,
    alignItems: "center",
    gap: 4,
  },
  commClock: {
    fontSize: 11,
    fontWeight: "800",
  },
  commDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  commText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
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
});
