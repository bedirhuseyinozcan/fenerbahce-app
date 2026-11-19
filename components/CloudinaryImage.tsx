import { useAppTheme } from "@/context/ThemeContext";
import { getCloudinaryUrl } from "@/utils/cloudinary";
import { Image, ImageProps } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface CloudinaryImageProps extends Omit<ImageProps, "source"> {
  publicId: string;
  width?: number;
  height?: number;
  placeholderColor?: string;
}

export default function CloudinaryImage({
  publicId,
  width,
  height,
  style,
  placeholderColor,
  ...props
}: CloudinaryImageProps) {
  const { theme, brand } = useAppTheme();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [publicId]);

  const optimizedUrl = getCloudinaryUrl(publicId, width, height);
  const bg = placeholderColor ?? theme.placeholder;
  const isFenerbahceCrest = publicId === "fener.png";

  if (!optimizedUrl || hasError) {
    if (isFenerbahceCrest) {
      return (
        <View
          style={[
            styles.fbFallbackBadge,
            { backgroundColor: brand.navy, borderColor: brand.yellow },
            style,
          ]}
        >
          <Text style={[styles.fbFallbackText, { color: brand.yellow }]}>
            FB
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.fallbackBox,
          { backgroundColor: bg, borderColor: theme.border },
          style,
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri: optimizedUrl }}
      style={[style]}
      transition={250}
      cachePolicy="memory-disk"
      contentFit="cover"
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  fallbackBox: {
    borderRadius: 999,
    borderWidth: 1,
  },
  fbFallbackBadge: {
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  fbFallbackText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
});
