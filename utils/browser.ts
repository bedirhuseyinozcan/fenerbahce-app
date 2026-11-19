import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";

export async function openInAppUrl(url: string): Promise<void> {
  if (!url) return;

  if (Platform.OS === "web") {
    try {
      await Linking.openURL(url);
    } catch {}
    return;
  }

  try {
    await WebBrowser.openBrowserAsync(url, {
      toolbarColor: "#072146",
      controlsColor: "#FFED00",
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    });
  } catch {
    try {
      await Linking.openURL(url);
    } catch {}
  }
}
