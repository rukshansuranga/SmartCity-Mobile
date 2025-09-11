// prettier-ignore-start
import "react-native-get-random-values";
// prettier-ignore-end

import "@/global.css";
import { SplashScreen, Stack, useRouter } from "expo-router";

import { useAuthStore } from "@/stores/authStore";
// import { makeRedirectUri, useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { getUnreadNotificationCount } from "@/api/notificationAction";
import { appStore } from "@/stores/appStore";
import { useEffect } from "react";
import { Image, Text, View } from "react-native";
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
  const title =
    options.title ||
    (typeof options.headerTitle === "string"
      ? options.headerTitle
      : undefined) ||
    (route && route.name ? route.name : "");
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between bg-[#38a3a5] px-4 py-2 shadow-md rounded-b-xl">
      <View className="flex-row items-center gap-2">
        <Text className="text-white text-xl font-bold tracking-wide drop-shadow-md">
          {title}
        </Text>
        {/* Uncomment to show user name */}
        {/* {userName && (
          <Text className="text-white text-lg font-bold ml-2">Hi, {userName}</Text>
        )} */}
      </View>
      <View className="flex-row items-center gap-1">
        <IconButton
          icon="logout"
          size={24}
          onPress={logOut}
          style={{
            backgroundColor: "#57cc99",
            borderRadius: 12,
          }}
        />
        <IconButton
          icon="home"
          size={24}
          onPress={() => router.replace("/")}
          style={{
            backgroundColor: "#57cc99",
            borderRadius: 12,
          }}
        />
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
            onPress={() => router.push("/(notification)/NotificationList")}
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
      </View>
    </View>
  );
}

export default function RootLayout() {
  const { isSignedIn, _hasHydrated, accessToken, idToken, userInfo, logOut } =
    useAuthStore();

  const { updateNotificationCount, unreadNotificationCount } = appStore();

  // Auth logic is handled in signIn.tsx

  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after the store has been hydrated

  useEffect(() => {
    if (_hasHydrated) {
      SplashScreen.hideAsync();
      if (isSignedIn && accessToken && userInfo) {
        fetchUnreadNotificationCount();
      }
    }
  }, [_hasHydrated]);

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
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}`
      );
      // @ts-ignore
      logOut();
    } catch (e) {
      console.warn(e);
    }
  }

  async function fetchUnreadNotificationCount() {
    console.log("Fetching unread notification count...");
    try {
      const count = await getUnreadNotificationCount(userInfo.sub);
      if (!count.isSuccess) {
        console.error(
          "Failed to fetch unread notification count:",
          count.message
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
  }

  //console.log("auth store1:", userInfo, accessToken);

  // console.log("isSignedIn:", isSignedIn);
  // console.log("accessToken:", accessToken);
  // console.log("userInfo:", userInfo);

  return (
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
          <Stack.Protected guard={!isSignedIn}>
            <Stack.Screen name="signIn" />
          </Stack.Protected>

          <Stack.Protected guard={isSignedIn}>
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen
              name="(notification)/NotificationList"
              options={{ headerShown: true, title: "Notifications" }}
            />
            <Stack.Screen name="(complains)" options={{ title: "Complains" }} />
            <Stack.Screen name="(garbage)" options={{ title: "Garbage" }} />
            <Stack.Screen name="(projects)" options={{ title: "Projects" }} />
            <Stack.Screen name="editUser" options={{ title: "Edit User" }} />
          </Stack.Protected>
        </Stack>
        <Toast />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
