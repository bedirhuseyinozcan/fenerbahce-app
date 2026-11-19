import { useAppTheme } from "@/context/ThemeContext";
import { Song } from "@/data/marslarData";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AnthemTrackRowProps {
  song: Song;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onOpenLyrics: () => void;
}

export function AnthemTrackRow({
  song,
  index,
  isCurrent,
  isPlaying,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onOpenLyrics,
}: AnthemTrackRowProps) {
  const { theme, brand } = useAppTheme();

  return (
    <TouchableOpacity
      style={[
        styles.trackCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: isCurrent ? brand.yellow : theme.border,
          borderWidth: isCurrent ? 1.5 : 1,
        },
      ]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.indexBadge,
          {
            backgroundColor: isCurrent ? brand.yellow : theme.surfaceSubtle,
          },
        ]}
      >
        {isCurrent && isPlaying ? (
          <Ionicons name="volume-high" size={18} color={brand.navy} />
        ) : isCurrent ? (
          <Ionicons name="pause" size={16} color={brand.navy} />
        ) : (
          <Text style={[styles.indexText, { color: theme.secondaryText }]}>
            {index + 1}
          </Text>
        )}
      </View>

      <View style={styles.trackInfo}>
        <Text
          style={[
            styles.trackTitle,
            { color: isCurrent ? theme.accent : theme.text },
            isCurrent && { fontWeight: "bold" },
          ]}
          numberOfLines={1}
        >
          {song.title}
        </Text>
        <Text
          style={[styles.trackArtist, { color: theme.secondaryText }]}
          numberOfLines={1}
        >
          {song.artist} • {song.category}
        </Text>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onToggleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={19}
            color={isFavorite ? brand.liveRed : theme.secondaryText}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={onOpenLyrics}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        >
          <Ionicons
            name="reader-outline"
            size={19}
            color={theme.secondaryText}
          />
        </TouchableOpacity>
        <Text style={[styles.durationText, { color: theme.secondaryText }]}>
          {song.duration}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indexText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 12,
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  iconBtn: {
    padding: 4,
  },
  durationText: {
    fontSize: 12,
    minWidth: 32,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
});
