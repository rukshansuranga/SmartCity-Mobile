import { ROUTES } from "@/constants/routes";
import { appStore } from "@/stores/appStore";
import { useAuthStore } from "@/stores/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, Tabs, useRouter } from "expo-router";
import { Image, Text, View } from "react-native";
import { Badge, IconButton } from "react-native-paper";

function TaxHeader({ options, route }) {
  const router = useRouter();
  const { idToken, logOut } = useAuthStore();
  const { unreadNotificationCount } = appStore();

  const title =
    options.title ||
    (typeof options.headerTitle === "string"
      ? options.headerTitle
      : undefined) ||
    (route && route.name ? route.name : "");

  async function handleLogout() {
    try {
      await fetch(
        `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/logout?id_token_hint=${idToken}`
      );
      logOut();
    } catch (e) {
      console.warn(e);
    }
  }

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
          {unreadNotificationCount > 0 && (
            <Badge
              className="absolute top-0 right-2 bg-red-500 text-white font-bold"
              size={18}
              style={{ zIndex: 2 }}
            >
              {unreadNotificationCount}
            </Badge>
          )}
        </View>
        <Link href={ROUTES.HOME} asChild>
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
          size={24}
          onPress={handleLogout}
          style={{
            backgroundColor: "#57cc99",
            borderRadius: 12,
          }}
        />
      </View>
    </View>
  );
}

export default function TaxLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#22577a",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#c7f9cc",
          borderTopColor: "#80ed99",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: true,
        header: (props) => <TaxHeader {...props} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides it from the tabs
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: "Tax Summary",
          tabBarLabel: "Summary",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="summarize" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="units"
        options={{
          title: "Tax Units",
          tabBarLabel: "Units",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Tax History",
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Tax Payment",
          tabBarLabel: "Payment",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="payment" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
