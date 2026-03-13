// prettier-ignore-start
import "react-native-get-random-values";
// prettier-ignore-end

import { ROUTES } from "@/constants/routes";
import "@/global.css";
import { Link, SplashScreen, Stack, useRouter } from "expo-router";

import { useAuthStore } from "@/stores/authStore";
// import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { getUnreadNotificationCount } from "@/api/notificationAction";
import { validateAndRefreshToken } from "@/lib/tokenManager";
import { appStore } from "@/stores/appStore";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Badge, IconButton } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
// Minimal custom header component

function MinimalHeader({
  options,
  route,
  logOut,
  userName,
  notificationCount,
}) {
  // Extract the base route name from nested routes
  const getRouteTitle = () => {
    if (options.title) return options.title;
    if (typeof options.headerTitle === "string") return options.headerTitle;

    // Map route names to proper titles
    const routeName = route?.name || "";
    const titleMap = {
      home: "Home",
      "(adviser)/index": "AI Assistant",
      "(adviser)": "AI Assistant",
      "(complains)/index": "Complains",
      "(complains)": "Complains",
      "(garbage)/index": "Garbage",
      "(garbage)": "Garbage",
      "(projects)/index": "Projects",
      "(projects)": "Projects",
      "(tax)/index": "Tax",
      "(tax)": "Tax",
      editUser: "Edit User",
      "(notification)/NotificationList": "Notifications",
    };

    return titleMap[routeName] || routeName;
  };

  const title = getRouteTitle();
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between bg-[#38a3a5] px-4 py-2 shadow-md rounded-b-xl">
      <View className="flex-row items-center gap-2">
        <Text className="text-white text-xl font-bold tracking-wide drop-shadow-md">
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-1">
        <View className="relative flex items-center justify-center">
          <IconButton
            icon={() => (
              <Image
                source={require("@/assets/icons/notification1.png")}
                style={{ width: 24, height: 24 }}
                resizeMode="contain"
              />
            )}
            size={24}
            onPress={() => router.push(ROUTES.NOTIFICATIONS)}
            style={{
              backgroundColor: "#57cc99",
              borderRadius: 12,
            }}
          />
          {!notificationCount?.error && (
            <Badge
              className="absolute top-0 right-2 bg-red-500 text-white font-bold"
              size={18}
              style={{ zIndex: 2 }}
            >
              {notificationCount ?? 0}
            </Badge>
          )}
        </View>
        <Link href="/home" asChild>
          <IconButton
            icon="home"
            size={24}
            style={{
              backgroundColor: "#57cc99",
              borderRadius: 12,
            }}
          />
        </Link>
        <IconButton
          icon="logout"
          testID="logout-button"
          size={24}
          onPress={logOut}
          style={{
            backgroundColor: "#57cc99",
            borderRadius: 12,
          }}
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const {
    isSignedIn,
    _hasHydrated,
    accessToken,
    idToken,
    userInfo,
    selectedCouncil,
    isTokenExpired,
    logOut,
  } = useAuthStore();

  const router = useRouter();

  console.log("isSignedIn in RootLayout:", isSignedIn);

  const { updateNotificationCount, unreadNotificationCount } = appStore();

  // Auth logic is handled in auth.tsx

  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after the store has been hydrated

  useEffect(() => {
    const initializeApp = async () => {
      if (!_hasHydrated) return;

      console.log("[RootLayout] Store hydrated, initializing app...");
      await SplashScreen.hideAsync();

      // Check if user is signed in
      if (!isSignedIn || !accessToken) {
        console.log("[RootLayout] User not signed in");
        return;
      }

      // Check if token is expired and try to refresh
      if (isTokenExpired()) {
        console.log("[RootLayout] Token expired, attempting refresh...");
        const isValid = await validateAndRefreshToken();

        if (!isValid) {
          console.log("[RootLayout] Token refresh failed, logging out");
          await logOut();
          router.replace("/auth" as any);
          return;
        }
        console.log("[RootLayout] Token refreshed successfully");
      }

      // Check if council is selected
      if (!selectedCouncil) {
        console.log("[RootLayout] No council selected, redirecting...");
        router.replace("/selectCouncil" as any);
        return;
      }

      // All checks passed, fetch notifications
      if (userInfo) {
        await fetchUnreadNotificationCount();
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, isSignedIn, accessToken, selectedCouncil]);

  // No useAuthRequest or response handling here

  if (!_hasHydrated) {
    return null;
  }

  async function handleLogout() {
    //console.log("isSignedIn:", isSignedIn);
    try {
      // const idToken = "authState.idToken";
      //console.log("Logging out with idToken:", idToken);
      await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}`,
      );
      // @ts-ignore
      logOut();
    } catch (e) {
      console.warn(e);
    }
  }

  const fetchUnreadNotificationCount = async () => {
    //console.log("Fetching unread notification count...");
    try {
      const count = await getUnreadNotificationCount(userInfo.sub);
      if (!count.isSuccess) {
        console.error(
          "Failed to fetch unread notification count:",
          count.message,
        );
        updateNotificationCount(0);
        return;
      }
      updateNotificationCount(count.data || 0);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      updateNotificationCount(0);
      // Toast error is already shown by fetchWrapper
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
        merchantIdentifier="merchant.com.smartcity"
      >
        <SafeAreaProvider>
          <SafeAreaView className="flex-1">
            <Stack
              screenOptions={{
                header: (props) => (
                  <MinimalHeader
                    {...props}
                    logOut={handleLogout}
                    userName={userInfo?.given_name}
                    notificationCount={unreadNotificationCount}
                  />
                ), // Use custom header
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Protected guard={!isSignedIn}>
                <Stack.Screen name="auth" options={{ headerShown: false }} />
              </Stack.Protected>{" "}
              <Stack.Protected guard={isSignedIn}>
                <Stack.Screen
                  name="selectCouncil"
                  options={{ headerShown: false, title: "Select Council" }}
                />
                <Stack.Screen name="home" options={{ title: "Home" }} />
                <Stack.Screen
                  name="(notification)/NotificationList"
                  options={{ headerShown: true, title: "Notifications" }}
                />
                <Stack.Screen
                  name="(complains)"
                  options={{ title: "Complains" }}
                />
                <Stack.Screen name="(garbage)" options={{ title: "Garbage" }} />
                <Stack.Screen
                  name="(projects)"
                  options={{ title: "Projects" }}
                />
                <Stack.Screen
                  name="(adviser)"
                  options={{ title: "AI Assistant" }}
                />
                <Stack.Screen name="(tax)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="editUser"
                  options={{ title: "Edit User" }}
                />
                <Stack.Screen name="(budget)" options={{ title: "Budget" }} />
                <Stack.Screen
                  name="(infrastructure)"
                  options={{ title: "Infrastructure" }}
                />
              </Stack.Protected>
            </Stack>
            <Toast />
          </SafeAreaView>
        </SafeAreaProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
