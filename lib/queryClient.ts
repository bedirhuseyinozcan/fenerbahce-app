import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, AppStateStatus, Platform } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 30 * 60_000,
      retry: 1,
      refetchOnReconnect: true,
    },
  },
});

export function setupQueryFocusManager(): () => void {
  if (Platform.OS === "web") {
    return () => {};
  }

  const onAppStateChange = (status: AppStateStatus) => {
    focusManager.setFocused(status === "active");
  };

  const subscription = AppState.addEventListener("change", onAppStateChange);
  return () => {
    subscription.remove();
  };
}
