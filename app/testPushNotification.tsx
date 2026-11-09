import { PushNotificationService } from "@/lib/pushNotificationService";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function TestPushNotification() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const { userInfo } = useAuthStore();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
    console.log(message);
  };

  const handleRegister = async () => {
    if (!userInfo?.sub) {
      Alert.alert("Error", "No user ID found. Please login first.");
      addLog("❌ No user ID found. Please login first.");
      return;
    }

    setLoading(true);
    addLog("🚀 Starting registration...");
    addLog(`👤 User ID: ${userInfo.sub}`);

    try {
      const result = await PushNotificationService.registerForPushNotifications(
        userInfo.sub,
      );

      if (result) {
        setToken(result);
        addLog(`✅ Success! Token: ${result.substring(0, 50)}...`);
        Alert.alert("Success", "Push notification token registered!");
      } else {
        addLog("❌ Registration failed - check logs above");
        Alert.alert("Failed", "Could not register token. Check console logs.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Error: ${message}`);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!userInfo?.sub || !token) {
      Alert.alert("Error", "No token to unregister");
      return;
    }

    setLoading(true);
    addLog("🗑️ Unregistering token...");

    try {
      await PushNotificationService.unregisterPushNotifications(userInfo.sub);
      addLog("✅ Token unregistered successfully");
      setToken(null);
      Alert.alert("Success", "Token unregistered!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      addLog(`❌ Error: ${message}`);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!token) {
      Alert.alert("Error", "Register token first");
      return;
    }

    addLog("📬 Sending test notification...");
    Alert.alert(
      "Test Notification",
      "To send a test notification, use Expo's Push Notification Tool:\n\nhttps://expo.dev/notifications",
      [
        {
          text: "Copy Token",
          onPress: () => {
            // You would use Clipboard here in a real app
            addLog(`📋 Token: ${token}`);
          },
        },
        { text: "OK" },
      ],
    );
  };

  const clearLogs = () => setLogs([]);

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
        <Text className="text-2xl font-bold mb-2">
          🔔 Push Notification Test
        </Text>
        <Text className="text-gray-600 mb-4">
          Test token registration with your backend
        </Text>

        {userInfo?.sub ? (
          <View className="mb-4">
            <Text className="text-sm text-gray-500">
              User ID: {userInfo.sub}
            </Text>
            <Text className="text-sm text-gray-500">
              Name: {userInfo.name || "N/A"}
            </Text>
          </View>
        ) : (
          <Text className="text-sm text-red-500 mb-4">
            ⚠️ Please login first
          </Text>
        )}

        {token && (
          <View className="bg-green-50 p-3 rounded mb-4">
            <Text className="text-xs text-green-800 font-semibold mb-1">
              ✅ Token Registered:
            </Text>
            <Text className="text-xs text-green-700" numberOfLines={2}>
              {token}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 mb-4">
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading || !userInfo?.sub}
          className={`p-4 rounded-lg ${
            loading || !userInfo?.sub ? "bg-gray-300" : "bg-blue-500"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "⏳ Registering..." : "📱 Register Token"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleUnregister}
          disabled={loading || !token}
          className={`p-4 rounded-lg ${
            loading || !token ? "bg-gray-300" : "bg-red-500"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            🗑️ Unregister Token
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSendTestNotification}
          disabled={!token}
          className={`p-4 rounded-lg ${
            !token ? "bg-gray-300" : "bg-green-500"
          }`}
        >
          <Text className="text-white text-center font-semibold">
            📬 Send Test Notification
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View className="bg-black rounded-lg p-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white font-semibold">📋 Console Logs</Text>
          <TouchableOpacity onPress={clearLogs}>
            <Text className="text-blue-400 text-sm">Clear</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <Text className="text-gray-400 text-sm italic">
            No logs yet. Click "Register Token" to start.
          </Text>
        ) : (
          <View className="space-y-2">
            {logs.map((log, index) => (
              <Text key={index} className="text-green-400 text-xs font-mono">
                {log}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View className="bg-yellow-50 p-4 rounded-lg mt-4">
        <Text className="text-yellow-800 font-semibold mb-2">
          ⚠️ Requirements:
        </Text>
        <Text className="text-yellow-700 text-sm mb-1">
          • Must run on physical device (not emulator)
        </Text>
        <Text className="text-yellow-700 text-sm mb-1">
          • Notification permissions required
        </Text>
        <Text className="text-yellow-700 text-sm">
          • Backend API must be accessible
        </Text>
      </View>
    </ScrollView>
  );
}
