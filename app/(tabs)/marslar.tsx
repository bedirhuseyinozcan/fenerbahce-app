import { useAnthemPlayer } from "@/context/AnthemPlayerContext";
import { useAppTheme } from "@/context/ThemeContext";
import { marslarList, Song } from "@/data/marslarData";
import { AnthemHeroPlayer } from "@/features/anthems/components/AnthemHeroPlayer";
import { AnthemTrackRow } from "@/features/anthems/components/AnthemTrackRow";
import { LyricsModal } from "@/features/anthems/components/LyricsModal";
import { triggerSelectionHaptic } from "@/utils/haptics";
import { useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MarslarScreen() {
  const { theme, brand } = useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    currentTrack,
    isPlaying,
    favoriteIds,
    isFavorite,
    playTrack,
    toggleFavorite,
  } = useAnthemPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [lyricsModalVisible, setLyricsModalVisible] = useState<boolean>(false);
  const [activeLyricsSong, setActiveLyricsSong] = useState<Song | null>(null);

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(marslarList.map((s) => s.category)));
    return favoriteIds.length > 0
      ? ["Tümü", "Favoriler", ...uniqueCats]
      : ["Tümü", ...uniqueCats];
  }, [favoriteIds.length]);

  const effectiveCategory = categories.includes(selectedCategory)
    ? selectedCategory
    : "Tümü";

  const filteredSongs = useMemo(() => {
    if (effectiveCategory === "Tümü") return marslarList;
    if (effectiveCategory === "Favoriler") {
      return marslarList.filter((s) => favoriteIds.includes(s.id));
    }
    return marslarList.filter((s) => s.category === effectiveCategory);
  }, [effectiveCategory, favoriteIds]);

  const openLyrics = (song: Song) => {
    setActiveLyricsSong(song);
    setLyricsModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AnthemHeroPlayer onOpenLyrics={openLyrics} />

      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((cat) => {
            const isActive = effectiveCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isActive
                      ? brand.yellow
                      : theme.cardBackground,
                    borderColor: isActive ? brand.yellow : theme.border,
                  },
                ]}
                onPress={() => {
                  triggerSelectionHaptic();
                  setSelectedCategory(cat);
                }}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isActive ? brand.navy : theme.text },
                    isActive && { fontWeight: "bold" },
                  ]}
                >
                  {cat === "Favoriler" ? "❤️ Favoriler" : cat}
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
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <AnthemTrackRow
            song={item}
            index={index}
            isCurrent={currentTrack.id === item.id}
            isPlaying={isPlaying}
            isFavorite={isFavorite(item.id)}
            onSelect={() => playTrack(item, filteredSongs)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            onOpenLyrics={() => openLyrics(item)}
          />
        )}
      />

      <LyricsModal
        song={activeLyricsSong}
        visible={lyricsModalVisible}
        onClose={() => setLyricsModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  categoryPillText: {
    fontSize: 13,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
});
