import Colors from "@/constants/Colors";
import { getCloudinaryUrl } from "@/utils/cloudinary";
import { Image, ImageProps } from "expo-image";
import React from "react";
import { View } from "react-native";

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
  placeholderColor = Colors.light.placeholder,
  ...props
}: CloudinaryImageProps) {
  const optimizedUrl = getCloudinaryUrl(publicId, width, height);

  if (!optimizedUrl) {
    return <View style={[style, { backgroundColor: placeholderColor }]} />;
  }

  return (
    <Image
      source={{ uri: optimizedUrl }}
      style={[style]}
      transition={300}
      cachePolicy="memory-disk"
      contentFit="cover"
      {...props}
    />
  );
}
