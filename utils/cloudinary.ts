const CLOUD_NAME = "jrfrokt7";

/**
 * Cloudinary üzerinden optimize edilmiş (Lazy Load ve Caching için uygun) görsel URL'si üretir.
 * @param publicId Görselin Cloudinary'deki ID'si veya yolu (örn: "logos/fenerbahce")
 * @param width İstenilen genişlik
 * @param height İstenilen yükseklik
 * @returns Hazır CDN linki
 */
export const getCloudinaryUrl = (
  publicId: string,
  width?: number,
  height?: number,
) => {
  if (!publicId) return null;

  if (publicId.startsWith("http")) return publicId;

  let transformations = "q_auto,f_auto";

  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
