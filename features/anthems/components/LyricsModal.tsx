import { useAppTheme } from "@/context/ThemeContext";
import { Song } from "@/data/marslarData";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LyricsModalProps {
  song: Song | null;
  visible: boolean;
  onClose: () => void;
}

export function LyricsModal({ song, visible, onClose }: LyricsModalProps) {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          {song && (
            <>
              <View
                style={[
                  styles.modalHeader,
                  { borderBottomColor: theme.divider },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.modalTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {song.title}
                  </Text>
                  <Text
                    style={[styles.modalArtist, { color: theme.secondaryText }]}
                  >
                    {song.artist}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.lyricsScrollView}
                showsVerticalScrollIndicator={false}
              >
                {song.lyrics.map((line, idx) => {
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
                        isFBHighlight && {
                          fontWeight: "bold",
                          color: theme.accent,
                        },
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
  );
}

const styles = StyleSheet.create({
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
});
