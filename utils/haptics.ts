import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function triggerLightHaptic(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function triggerMediumHaptic(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

export function triggerSuccessHaptic(): void {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
}

export function triggerSelectionHaptic(): void {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}
