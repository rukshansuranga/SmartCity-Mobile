import { useAuthStore } from "@/stores/authStore";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export function DebugAuthStore() {
  const state = useAuthStore();

  const handleReset = () => {
    Alert.alert(
      "Reset Auth Store",
      "Are you sure you want to reset the auth store? This will log you out.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            state.logOut();
            console.log("Auth store reset completed");
          },
        },
      ]
    );
  };

  const formatTokenExpiry = () => {
    if (!state.tokenExpiresAt) return "N/A";
    const date = new Date(state.tokenExpiresAt);
    const now = Date.now();
    const isExpired = now >= state.tokenExpiresAt;
    return `${date.toLocaleString()} ${isExpired ? "(EXPIRED)" : "(Valid)"}`;
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="bg-white rounded-lg p-4 mb-4 shadow">
        <Text className="font-bold text-xl mb-4">🔍 Auth Store Debug</Text>

        {/* Quick Stats */}
        <View className="mb-4 p-3 bg-blue-50 rounded">
          <Text className="font-semibold text-base mb-2">Quick Stats:</Text>
          <Text className="text-sm">
            ✓ Signed In: {state.isSignedIn ? "✅" : "❌"}
          </Text>
          <Text className="text-sm">
            ✓ Has User Info: {state.userInfo ? "✅" : "❌"}
          </Text>
          <Text className="text-sm">
            ✓ Has Access Token: {state.accessToken ? "✅" : "❌"}
          </Text>
          <Text className="text-sm">
            ✓ Token Expired: {state.isTokenExpired() ? "⚠️ YES" : "✅ NO"}
          </Text>
          <Text className="text-sm">
            ✓ Selected Council: {state.selectedCouncil?.label || "❌ None"}
          </Text>
          <Text className="text-sm">
            ✓ Councils Count: {state.councils?.length || 0}
          </Text>
        </View>

        {/* Token Expiry */}
        {state.tokenExpiresAt && (
          <View className="mb-4 p-3 bg-yellow-50 rounded">
            <Text className="font-semibold text-base mb-2">Token Info:</Text>
            <Text className="text-xs">Expires: {formatTokenExpiry()}</Text>
          </View>
        )}

        {/* User Info */}
        {state.userInfo && (
          <View className="mb-4 p-3 bg-green-50 rounded">
            <Text className="font-semibold text-base mb-2">User Info:</Text>
            <Text className="text-xs">
              Name: {state.userInfo.name || "N/A"}
            </Text>
            <Text className="text-xs">
              Email: {state.userInfo.email || "N/A"}
            </Text>
            <Text className="text-xs">
              Username: {state.userInfo.preferred_username || "N/A"}
            </Text>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity
          onPress={handleReset}
          className="bg-red-500 p-4 rounded-lg mb-4"
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold text-center">
            🔄 Reset Auth Store
          </Text>
        </TouchableOpacity>

        {/* Full State JSON */}
        <View className="bg-gray-50 p-3 rounded">
          <Text className="font-semibold text-base mb-2">
            Full State (JSON):
          </Text>
          <ScrollView horizontal>
            <Text className="text-xs font-mono">
              {JSON.stringify(
                {
                  isSignedIn: state.isSignedIn,
                  hasAccessToken: !!state.accessToken,
                  hasRefreshToken: !!state.refreshToken,
                  hasIdToken: !!state.idToken,
                  tokenExpiresAt: state.tokenExpiresAt,
                  userInfo: state.userInfo,
                  councils: state.councils,
                  selectedCouncil: state.selectedCouncil,
                  _hasHydrated: state._hasHydrated,
                  isTokenExpired: state.isTokenExpired(),
                },
                null,
                2
              )}
            </Text>
          </ScrollView>
        </View>

        {/* Tokens (Hidden by default for security) */}
        <View className="bg-red-50 p-3 rounded mt-4">
          <Text className="font-semibold text-base mb-2 text-red-600">
            ⚠️ Tokens (Be Careful):
          </Text>
          <Text className="text-xs text-gray-600 mb-2">
            Access Token:{" "}
            {state.accessToken
              ? `${state.accessToken.substring(0, 20)}...`
              : "None"}
          </Text>
          <Text className="text-xs text-gray-600 mb-2">
            Refresh Token:{" "}
            {state.refreshToken
              ? `${state.refreshToken.substring(0, 20)}...`
              : "None"}
          </Text>
          <Text className="text-xs text-gray-600">
            ID Token:{" "}
            {state.idToken ? `${state.idToken.substring(0, 20)}...` : "None"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
