import { Brand } from "@/constants/theme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface LivePulseDotProps {
  color?: string;
  size?: number;
}

export function LivePulseDot({
  color = Brand.liveRed,
  size = 7,
}: LivePulseDotProps) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.75);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.8, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    ringOpacity.value = withRepeat(
      withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [ringOpacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

interface LivePillProps {
  label?: string;
  compact?: boolean;
}

export function LivePill({ label = "CANLI", compact = false }: LivePillProps) {
  return (
    <View style={[styles.pill, compact && styles.pillCompact]}>
      <LivePulseDot color={Brand.white} size={compact ? 5 : 6} />
      <Text style={[styles.pillText, compact && styles.pillTextCompact]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Brand.liveRed,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillCompact: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    gap: 4,
  },
  pillText: {
    color: Brand.white,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  pillTextCompact: {
    fontSize: 9,
  },
});
