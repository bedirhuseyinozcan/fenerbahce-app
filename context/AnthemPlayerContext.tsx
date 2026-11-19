import { marslarList, Song } from "@/data/marslarData";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/utils/haptics";
import { getJson, setJson } from "@/utils/storage";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export type RepeatMode = "all" | "one";

const FAVORITE_ANTHEMS_KEY = "fb_favorite_anthems_v1";

interface AnthemPlayerContextValue {
  currentTrack: Song;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  progressPercent: number;
  hasActivated: boolean;
  miniDismissed: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  playTrack: (song: Song, customQueue?: Song[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (deltaSeconds: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: (id: string) => void;
  dismissMiniPlayer: () => void;
}

const AnthemPlayerContext = createContext<AnthemPlayerContextValue | null>(null);

function loadFavoriteIds(): string[] {
  const stored = getJson<string[]>(FAVORITE_ANTHEMS_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function AnthemPlayerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSongId, setCurrentSongId] = useState<string>(marslarList[0].id);
  const [queue, setQueue] = useState<Song[]>(marslarList);
  const [hasActivated, setHasActivated] = useState<boolean>(false);
  const [miniDismissed, setMiniDismissed] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("all");
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavoriteIds);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: "doNotMix",
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  const initialSource = useMemo(() => marslarList[0].audioUrl, []);
  const player = useAudioPlayer(initialSource, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const currentTrack = useMemo(() => {
    return marslarList.find((s) => s.id === currentSongId) || marslarList[0];
  }, [currentSongId]);

  const isPlaying = Boolean(status.playing);
  const isBuffering = Boolean(status.isBuffering);
  const currentTime = Number.isFinite(status.currentTime)
    ? status.currentTime
    : 0;
  const duration =
    Number.isFinite(status.duration) && status.duration > 0
      ? status.duration
      : currentTrack.durationSec;
  const progressPercent =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;

  const currentSongIdRef = useRef(currentSongId);
  currentSongIdRef.current = currentSongId;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const repeatModeRef = useRef(repeatMode);
  repeatModeRef.current = repeatMode;
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;
  const durationRef = useRef(duration);
  durationRef.current = duration;
  const currentTimeRef = useRef(currentTime);
  currentTimeRef.current = currentTime;

  const startSong = useCallback(
    (song: Song) => {
      setCurrentSongId(song.id);
      setHasActivated(true);
      setMiniDismissed(false);
      try {
        player.replace(song.audioUrl);
        player.play();
      } catch {
        // ignore audio errors in non-browser contexts
      }
    },
    [player],
  );

  const playTrack = useCallback(
    (song: Song, customQueue?: Song[]) => {
      if (customQueue && customQueue.length > 0) {
        setQueue(customQueue);
      }
      if (currentSongIdRef.current === song.id) {
        triggerLightHaptic();
        setHasActivated(true);
        setMiniDismissed(false);
        if (player.playing) {
          player.pause();
        } else {
          player.play();
        }
        return;
      }
      triggerLightHaptic();
      startSong(song);
    },
    [player, startSong],
  );

  const togglePlay = useCallback(() => {
    triggerLightHaptic();
    setHasActivated(true);
    setMiniDismissed(false);
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const playNext = useCallback(
    (fromFinish: boolean = false) => {
      const list = queueRef.current.length > 0 ? queueRef.current : marslarList;
      if (list.length === 0) return;

      if (fromFinish && repeatModeRef.current === "one") {
        player.seekTo(0);
        player.play();
        return;
      }

      if (shuffleRef.current && list.length > 1) {
        const candidates = list.filter((s) => s.id !== currentSongIdRef.current);
        const randomSong =
          candidates[Math.floor(Math.random() * candidates.length)] || list[0];
        if (!fromFinish) triggerLightHaptic();
        startSong(randomSong);
        return;
      }

      const currentIndex = list.findIndex(
        (s) => s.id === currentSongIdRef.current,
      );
      const nextIdx =
        currentIndex === -1 ? 0 : (currentIndex + 1) % list.length;
      const nextSong = list[nextIdx];
      if (nextSong) {
        if (!fromFinish) triggerLightHaptic();
        startSong(nextSong);
      }
    },
    [player, startSong],
  );

  const playPrev = useCallback(() => {
    const list = queueRef.current.length > 0 ? queueRef.current : marslarList;
    if (list.length === 0) return;

    const currentIndex = list.findIndex(
      (s) => s.id === currentSongIdRef.current,
    );
    const prevIdx =
      currentIndex === -1 ? 0 : (currentIndex - 1 + list.length) % list.length;
    const prevSong = list[prevIdx];
    if (prevSong) {
      triggerLightHaptic();
      startSong(prevSong);
    }
  }, [startSong]);

  const didFinishRef = useRef(false);
  useEffect(() => {
    if (status.didJustFinish && !didFinishRef.current) {
      didFinishRef.current = true;
      playNext(true);
    } else if (!status.didJustFinish) {
      didFinishRef.current = false;
    }
  }, [status.didJustFinish, playNext]);

  const seekTo = useCallback(
    (seconds: number) => {
      const maxDur = durationRef.current;
      const clamped = Math.max(
        0,
        Math.min(maxDur > 0 ? maxDur - 0.5 : seconds, seconds),
      );
      if (Number.isFinite(clamped)) {
        player.seekTo(clamped);
      }
    },
    [player],
  );

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      triggerLightHaptic();
      seekTo(currentTimeRef.current + deltaSeconds);
    },
    [seekTo],
  );

  const toggleShuffle = useCallback(() => {
    triggerSelectionHaptic();
    setShuffle((prev) => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    triggerSelectionHaptic();
    setRepeatMode((prev) => (prev === "all" ? "one" : "all"));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    triggerSelectionHaptic();
    setFavoriteIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      setJson(FAVORITE_ANTHEMS_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favoriteIds.includes(id),
    [favoriteIds],
  );

  const dismissMiniPlayer = useCallback(() => {
    triggerLightHaptic();
    if (player.playing) {
      player.pause();
    }
    setMiniDismissed(true);
  }, [player]);

  const handlePlayNext = useCallback(() => playNext(false), [playNext]);

  const value = useMemo<AnthemPlayerContextValue>(
    () => ({
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      progressPercent,
      hasActivated,
      miniDismissed,
      repeatMode,
      shuffle,
      favoriteIds,
      isFavorite,
      playTrack,
      togglePlay,
      playNext: handlePlayNext,
      playPrev,
      seekTo,
      seekBy,
      toggleShuffle,
      toggleRepeat,
      toggleFavorite,
      dismissMiniPlayer,
    }),
    [
      currentTrack,
      isPlaying,
      isBuffering,
      currentTime,
      duration,
      progressPercent,
      hasActivated,
      miniDismissed,
      repeatMode,
      shuffle,
      favoriteIds,
      isFavorite,
      playTrack,
      togglePlay,
      handlePlayNext,
      playPrev,
      seekTo,
      seekBy,
      toggleShuffle,
      toggleRepeat,
      toggleFavorite,
      dismissMiniPlayer,
    ],
  );

  return (
    <AnthemPlayerContext.Provider value={value}>
      {children}
    </AnthemPlayerContext.Provider>
  );
}

/**
 * Accesses the shared app-wide anthem audio player state and controls.
 */
export function useAnthemPlayer(): AnthemPlayerContextValue {
  const ctx = useContext(AnthemPlayerContext);
  if (!ctx) {
    throw new Error("useAnthemPlayer must be used inside AnthemPlayerProvider");
  }
  return ctx;
}
