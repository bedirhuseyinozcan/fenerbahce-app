import { Radius } from "@/constants/theme";
import { useAnthemPlayer } from "@/context/AnthemPlayerContext";
import { useAppTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useSegments } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function MiniAnthemPlayer() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    progressPercent,
    hasActivated,
    miniDismissed,
    togglePlay,
    playNext,
    dismissMiniPlayer,
  } = useAnthemPlayer();
  const { brand } = useAppTheme();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const segmentList = segments as readonly string[];
  const isOnMarslar = segmentList.includes("marslar");

  if (!hasActivated || miniDismissed || isOnMarslar) {
    return null;
  }

  const isInTabs = segmentList[0] === "(tabs)";
  const bottomOffset = isInTabs
    ? insets.bottom + 62
    : Math.max(insets.bottom, 12) + 8;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      <LinearGradient
        colors={[brand.navyLight, brand.navyDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bar, { borderColor: "rgba(255, 237, 0, 0.35)" }]}
      >
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%`, backgroundColor: brand.yellow },
            ]}
          />
        </View>

        <View style={styles.contentRow}>
          <TouchableOpacity
            style={styles.trackPressArea}
            onPress={() => router.push("/(tabs)/marslar")}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: currentTrack.coverImage }}
              style={[styles.cover, { borderColor: brand.yellow }]}
              contentFit="cover"
            />
            <View style={styles.textCol}>
              <Text style={styles.title} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={togglePlay}
              style={[styles.playBtn, { backgroundColor: brand.yellow }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {isBuffering ? (
                <ActivityIndicator size="small" color={brand.navy} />
              ) : (
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={16}
                  color={brand.navy}
                  style={{ marginLeft: isPlaying ? 0 : 1.5 }}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={playNext}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Ionicons name="play-skip-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dismissMiniPlayer}
              style={styles.iconBtn}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Ionicons name="close" size={18} color="#9FB3CC" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 50,
  },
  bar: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  progressTrack: {
    height: 2.5,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  progressFill: {
    height: "100%",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  trackPressArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  textCol: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  artist: {
    color: "#9FB3CC",
    fontSize: 11,
    marginTop: 1,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    padding: 4,
  },
});
