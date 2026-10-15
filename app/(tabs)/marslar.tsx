import Colors from "@/constants/Colors";
import { marslarList, Song } from "@/data/marslarData";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { Image } from "expo-image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  GestureResponderEvent,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatTime(seconds: number = 0): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function MarslarScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [currentSongId, setCurrentSongId] = useState<string>(marslarList[0].id);
  const [lyricsModalVisible, setLyricsModalVisible] = useState<boolean>(false);
  const [activeLyricsSong, setActiveLyricsSong] = useState<Song | null>(null);
  const [progressBarWidth, setProgressBarWidth] = useState<number>(0);

  const categories = ["Tümü", "Marş", "Beste", "Tezahürat"];
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: true,
    }).catch((err) => {
      console.warn("setAudioModeAsync uyarısı:", err);
    });
  }, []);

  const filteredSongs = useMemo(() => {
    if (selectedCategory === "Tümü") return marslarList;
    return marslarList.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const currentTrack = useMemo(() => {
    return marslarList.find((s) => s.id === currentSongId) || marslarList[0];
  }, [currentSongId]);

  const initialSource = useMemo(() => marslarList[0].audioUrl, []);
  const player = useAudioPlayer(initialSource, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const isBuffering = status.isBuffering;
  const currentTime = status.currentTime || 0;
  const duration =
    status.duration && status.duration > 0
      ? status.duration
      : currentTrack.durationSec;
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const didFinishRef = useRef(false);
  useEffect(() => {
    if (status.didJustFinish && !didFinishRef.current) {
      didFinishRef.current = true;
      handleNext();
    } else if (!status.didJustFinish) {
      didFinishRef.current = false;
    }
  }, [status.didJustFinish]);

  const togglePlay = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleNext = () => {
    const currentIndex = filteredSongs.findIndex((s) => s.id === currentSongId);
    const nextIdx =
      currentIndex === -1 ? 0 : (currentIndex + 1) % filteredSongs.length;
    const nextSong = filteredSongs[nextIdx];
    if (nextSong) {
      setCurrentSongId(nextSong.id);
      player.replace(nextSong.audioUrl);
      player.play();
    }
  };

  const handlePrev = () => {
    const currentIndex = filteredSongs.findIndex((s) => s.id === currentSongId);
    const prevIdx =
      currentIndex === -1
        ? 0
        : (currentIndex - 1 + filteredSongs.length) % filteredSongs.length;
    const prevSong = filteredSongs[prevIdx];
    if (prevSong) {
      setCurrentSongId(prevSong.id);
      player.replace(prevSong.audioUrl);
      player.play();
    }
  };

  const seekForward10 = () => {
    const dur =
      status.duration && status.duration > 0
        ? status.duration
        : currentTrack.durationSec;
    const target = Math.min(dur - 0.5, currentTime + 10);
    player.seekTo(target);
  };

  const seekBackward10 = () => {
    const target = Math.max(0, currentTime - 10);
    player.seekTo(target);
  };

  const handleProgressBarPress = (e: GestureResponderEvent) => {
    if (progressBarWidth > 0 && duration > 0) {
      const touchX = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, touchX / progressBarWidth));
      const targetSec = ratio * duration;
      player.seekTo(targetSec);
    }
  };

  const handleSelectTrack = (song: Song) => {
    if (currentSongId === song.id) {
      togglePlay();
    } else {
      setCurrentSongId(song.id);
      player.replace(song.audioUrl);
      player.play();
    }
  };

  const openLyrics = (song: Song) => {
    setActiveLyricsSong(song);
    setLyricsModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[styles.heroPlayerCard, { backgroundColor: Colors.brand.navy }]}
      >
        <View style={styles.heroRow}>
          <Image
            source={{ uri: currentTrack.coverImage }}
            style={styles.albumArt}
            contentFit="cover"
          />

          <View style={styles.heroTrackInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {currentTrack.category.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.heroArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>

            <TouchableOpacity
              style={styles.lyricsButton}
              onPress={() => openLyrics(currentTrack)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="document-text-outline"
                size={14}
                color={Colors.brand.yellow}
              />
              <Text style={styles.lyricsButtonText}>Sözleri Oku</Text>
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
                  { width: `${progressPercent}%` },
                ]}
              />
              <View
                style={[styles.progressThumb, { left: `${progressPercent}%` }]}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            {isBuffering ? (
              <View style={styles.bufferingContainer}>
                <ActivityIndicator size="small" color={Colors.brand.yellow} />
                <Text style={styles.bufferingText}>Yükleniyor...</Text>
              </View>
            ) : null}
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={handlePrev}
            style={styles.secondaryButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={seekBackward10}
            style={styles.seekButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="replay-10" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlay}
            style={styles.playButton}
            activeOpacity={0.8}
          >
            {isBuffering ? (
              <ActivityIndicator size="small" color={Colors.brand.navy} />
            ) : (
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={30}
                color={Colors.brand.navy}
                style={{ marginLeft: isPlaying ? 0 : 2 }}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={seekForward10}
            style={styles.seekButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name="forward-10" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={styles.secondaryButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="play-skip-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isActive
                      ? Colors.brand.yellow
                      : theme.cardBackground,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isActive ? Colors.brand.navy : theme.text },
                    isActive && { fontWeight: "bold" },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isCurrent = currentTrack.id === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.trackCard,
                { backgroundColor: theme.cardBackground },
                isCurrent && styles.trackCardActive,
              ]}
              onPress={() => handleSelectTrack(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.indexBadge,
                  isCurrent && { backgroundColor: Colors.brand.yellow },
                ]}
              >
                {isCurrent && isPlaying ? (
                  <Ionicons
                    name="volume-high"
                    size={18}
                    color={Colors.brand.navy}
                  />
                ) : isCurrent ? (
                  <Ionicons name="pause" size={16} color={Colors.brand.navy} />
                ) : (
                  <Text
                    style={[styles.indexText, { color: theme.secondaryText }]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <View style={styles.trackInfo}>
                <Text
                  style={[
                    styles.trackTitle,
                    { color: isCurrent ? Colors.brand.navy : theme.text },
                    isCurrent && { fontWeight: "bold" },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[styles.trackArtist, { color: theme.secondaryText }]}
                  numberOfLines={1}
                >
                  {item.artist} • {item.category}
                </Text>
              </View>

              <View style={styles.rightActions}>
                <TouchableOpacity
                  style={styles.lyricsIconBtn}
                  onPress={() => openLyrics(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="reader-outline"
                    size={20}
                    color={theme.secondaryText}
                  />
                </TouchableOpacity>
                <Text
                  style={[styles.durationText, { color: theme.secondaryText }]}
                >
                  {item.duration}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal
        visible={lyricsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLyricsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            {activeLyricsSong && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.modalTitle, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {activeLyricsSong.title}
                    </Text>
                    <Text
                      style={[
                        styles.modalArtist,
                        { color: theme.secondaryText },
                      ]}
                    >
                      {activeLyricsSong.artist}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setLyricsModalVisible(false)}
                    style={styles.modalCloseBtn}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.lyricsScrollView}
                  showsVerticalScrollIndicator={false}
                >
                  {activeLyricsSong.lyrics.map((line, idx) => {
                    const isFBHighlight =
                      line.includes("Fenerbahçe") ||
                      line.includes("Sarı") ||
                      line.includes("Kadıköy") ||
                      line.includes("Atatürk");
                    return (
                      <Text
                        key={idx}
                        style={[
                          styles.lyricLine,
                          { color: line ? theme.text : "transparent" },
                          isFBHighlight && styles.lyricHighlight,
                        ]}
                      >
                        {line || " "}
                      </Text>
                    );
                  })}
                  <View style={{ height: 30 }} />
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroPlayerCard: {
    margin: 16,
    borderRadius: 20,
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
    borderColor: Colors.brand.yellow,
  },
  heroTrackInfo: {
    flex: 1,
    marginLeft: 14,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 237, 0, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  categoryBadgeText: {
    color: Colors.brand.yellow,
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
    color: Colors.brand.yellow,
    fontSize: 11,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 16,
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
    backgroundColor: Colors.brand.yellow,
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
    color: Colors.brand.yellow,
    fontSize: 10,
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.brand.yellow,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.brand.yellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  seekButton: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  categoryPillText: {
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  trackCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  trackCardActive: {
    borderColor: Colors.brand.yellow,
    borderWidth: 1.5,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.04)",
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
    gap: 12,
    marginLeft: 8,
  },
  lyricsIconBtn: {
    padding: 4,
  },
  durationText: {
    fontSize: 12,
    minWidth: 32,
    textAlign: "right",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalArtist: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  lyricsScrollView: {
    marginTop: 16,
  },
  lyricLine: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    marginVertical: 2,
  },
  lyricHighlight: {
    fontWeight: "bold",
    color: Colors.brand.yellow,
  },
});
