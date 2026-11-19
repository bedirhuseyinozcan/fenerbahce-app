import { Radius } from "@/constants/theme";
import { useAnthemPlayer } from "@/context/AnthemPlayerContext";
import { useAppTheme } from "@/context/ThemeContext";
import { Song } from "@/data/marslarData";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function formatTime(seconds: number = 0): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function AnthemHeroPlayer({
  onOpenLyrics,
}: {
  onOpenLyrics: (song: Song) => void;
}) {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    progressPercent,
    shuffle,
    repeatMode,
    isFavorite,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    seekBy,
    toggleShuffle,
    toggleRepeat,
    toggleFavorite,
  } = useAnthemPlayer();
  const { brand } = useAppTheme();
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);

  const fav = isFavorite(currentTrack.id);

  const handleProgressBarPress = (e: GestureResponderEvent) => {
    if (progressBarWidth > 0 && Number.isFinite(duration) && duration > 0) {
      const nativeEv = e.nativeEvent as any;
      let touchX = nativeEv.locationX;

      if (
        !Number.isFinite(touchX) &&
        typeof nativeEv.offsetX === "number" &&
        Number.isFinite(nativeEv.offsetX)
      ) {
        touchX = nativeEv.offsetX;
      }

      if (
        !Number.isFinite(touchX) &&
        typeof nativeEv.pageX === "number" &&
        (e.currentTarget as any)?.getBoundingClientRect
      ) {
        const rect = (e.currentTarget as any).getBoundingClientRect();
        touchX = nativeEv.pageX - rect.left;
      }

      if (!Number.isFinite(touchX)) return;

      const ratio = Math.max(0, Math.min(1, touchX / progressBarWidth));
      seekTo(ratio * duration);
    }
  };

  return (
    <LinearGradient
      colors={[brand.navyLight, brand.navyDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroPlayerCard}
    >
      <View style={styles.heroRow}>
        <Image
          source={{ uri: currentTrack.coverImage }}
          style={[styles.albumArt, { borderColor: brand.yellow }]}
          contentFit="cover"
        />

        <View style={styles.heroTrackInfo}>
          <View style={styles.topBadgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={[styles.categoryBadgeText, { color: brand.yellow }]}>
                {currentTrack.category.toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => toggleFavorite(currentTrack.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={fav ? "heart" : "heart-outline"}
                size={20}
                color={fav ? brand.yellow : "#A0AAB5"}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.heroArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>

          <TouchableOpacity
            style={styles.lyricsButton}
            onPress={() => onOpenLyrics(currentTrack)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={brand.yellow}
            />
            <Text style={[styles.lyricsButtonText, { color: brand.yellow }]}>
              Sözleri Oku
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={styles.progressContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setProgressBarWidth(w);
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.progressBarTouchable}
          onPress={handleProgressBarPress}
          hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
        >
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercent}%`,
                  backgroundColor: brand.yellow,
                },
              ]}
            />
            <View
              style={[styles.progressThumb, { left: `${progressPercent}%` }]}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.timeRow}>
          <Text style={[styles.timeText, styles.tabularNumbers]}>
            {formatTime(currentTime)}
          </Text>
          {isBuffering ? (
            <View style={styles.bufferingContainer}>
              <ActivityIndicator size="small" color={brand.yellow} />
              <Text style={[styles.bufferingText, { color: brand.yellow }]}>
                Yükleniyor...
              </Text>
            </View>
          ) : null}
          <Text style={[styles.timeText, styles.tabularNumbers]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity
          onPress={toggleShuffle}
          style={styles.modeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <Ionicons
            name="shuffle"
            size={20}
            color={shuffle ? brand.yellow : "rgba(255,255,255,0.55)"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playPrev}
          style={styles.secondaryButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="play-skip-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekBy(-10)}
          style={styles.seekButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="replay-10" size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          style={[
            styles.playButton,
            { backgroundColor: brand.yellow, shadowColor: brand.yellow },
          ]}
          activeOpacity={0.8}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color={brand.navy} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={28}
              color={brand.navy}
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekBy(10)}
          style={styles.seekButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="forward-10" size={26} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playNext}
          style={styles.secondaryButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="play-skip-forward" size={22} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleRepeat}
          style={styles.modeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        >
          <View style={styles.repeatWrap}>
            <Ionicons
              name="repeat"
              size={20}
              color={
                repeatMode === "one" ? brand.yellow : "rgba(255,255,255,0.55)"
              }
            />
            {repeatMode === "one" && (
              <Text style={[styles.repeatOneBadge, { color: brand.yellow }]}>
                1
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tabularNumbers: {
    fontVariant: ["tabular-nums"],
  },
  heroPlayerCard: {
    margin: 16,
    borderRadius: Radius.xl,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  albumArt: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 2,
  },
  heroTrackInfo: {
    flex: 1,
    marginLeft: 14,
  },
  topBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 237, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  heroArtist: {
    color: "#A0AAB5",
    fontSize: 12,
    marginTop: 2,
  },
  lyricsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  lyricsButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarTouchable: {
    paddingVertical: 8,
    justifyContent: "center",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    marginLeft: -7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    color: "#A0AAB5",
    fontSize: 11,
  },
  bufferingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bufferingText: {
    fontSize: 10,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  seekButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  modeBtn: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  repeatWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  repeatOneBadge: {
    position: "absolute",
    fontSize: 8,
    fontWeight: "900",
  },
});
