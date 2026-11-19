import { Radius } from "@/constants/theme";
import { useAppTheme } from "@/context/ThemeContext";
import { useEffect } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({
  width = "100%",
  height,
  borderRadius = Radius.sm,
  style,
}: SkeletonBoxProps) {
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.95, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.skeletonBase,
        },
        animStyle,
        style,
      ]}
    />
  );
}

export function HeroSkeleton() {
  return (
    <View style={styles.heroSkeleton}>
      <SkeletonBox width={180} height={24} borderRadius={12} />
      <View style={styles.heroRow}>
        <View style={styles.heroTeamCol}>
          <SkeletonBox width={54} height={54} borderRadius={27} />
          <SkeletonBox
            width={72}
            height={12}
            borderRadius={6}
            style={{ marginTop: 8 }}
          />
        </View>
        <View style={styles.heroTeamCol}>
          <SkeletonBox width={80} height={12} borderRadius={6} />
          <SkeletonBox
            width={92}
            height={28}
            borderRadius={8}
            style={{ marginTop: 8 }}
          />
        </View>
        <View style={styles.heroTeamCol}>
          <SkeletonBox width={54} height={54} borderRadius={27} />
          <SkeletonBox
            width={72}
            height={12}
            borderRadius={6}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
      <SkeletonBox width="100%" height={56} borderRadius={14} />
    </View>
  );
}

export function MatchCardSkeleton({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.matchCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          width: fullWidth ? "100%" : 280,
          marginRight: fullWidth ? 0 : 16,
        },
      ]}
    >
      <View style={styles.rowBetween}>
        <SkeletonBox width={64} height={12} />
        <SkeletonBox width={110} height={12} />
      </View>
      <View style={[styles.rowBetween, { marginTop: 16 }]}>
        <View style={styles.centerCol}>
          <SkeletonBox width={42} height={42} borderRadius={21} />
          <SkeletonBox width={68} height={10} style={{ marginTop: 8 }} />
        </View>
        <View style={styles.centerCol}>
          <SkeletonBox width={60} height={22} />
          <SkeletonBox width={80} height={10} style={{ marginTop: 8 }} />
        </View>
        <View style={styles.centerCol}>
          <SkeletonBox width={42} height={42} borderRadius={21} />
          <SkeletonBox width={68} height={10} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
}

export function StandingsSkeleton({ rows = 5 }: { rows?: number }) {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.standingsBox,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.standingsRow}>
          <SkeletonBox width={18} height={14} />
          <SkeletonBox width={22} height={22} borderRadius={11} />
          <SkeletonBox width="45%" height={14} />
          <SkeletonBox width={22} height={14} style={{ marginLeft: "auto" }} />
          <SkeletonBox width={22} height={14} />
          <SkeletonBox width={26} height={14} />
        </View>
      ))}
    </View>
  );
}

export function NewsCardSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.newsCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <SkeletonBox width={104} height={104} borderRadius={0} />
      <View style={styles.newsBody}>
        <SkeletonBox width={64} height={12} />
        <SkeletonBox width="95%" height={15} style={{ marginTop: 8 }} />
        <SkeletonBox width="70%" height={15} style={{ marginTop: 6 }} />
        <SkeletonBox width={90} height={10} style={{ marginTop: "auto" }} />
      </View>
    </View>
  );
}

export function AthleteCardSkeleton() {
  const { theme } = useAppTheme();
  return (
    <View
      style={[
        styles.athleteCard,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <SkeletonBox width="60%" height={15} />
        <SkeletonBox width="38%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSkeleton: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 18,
    alignItems: "center",
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 12,
    alignItems: "center",
  },
  heroTeamCol: {
    alignItems: "center",
    flex: 1,
  },
  matchCard: {
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    marginVertical: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerCol: {
    alignItems: "center",
    flex: 1,
  },
  standingsBox: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: 6,
  },
  standingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  newsCard: {
    flexDirection: "row",
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
    height: 104,
  },
  newsBody: {
    flex: 1,
    padding: 12,
  },
  athleteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: 10,
  },
});
