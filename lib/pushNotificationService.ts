import { registerDeviceToken, removeDeviceToken } from "@/api/newsAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class PushNotificationService {
  private static STORAGE_KEY = "expo_push_token";

  /**
   * Register for push notifications and save token to backend
   */
  static async registerForPushNotifications(
    residentId: string,
  ): Promise<string | null> {
    try {
      // Check if device is physical (not simulator)
      if (!Device.isDevice) {
        console.log(
          "⚠️ Push notifications only work on physical devices, not simulators",
        );
        return null;
      }

      // Check existing permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== "granted") {
        console.log("📱 Requesting notification permissions...");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // If still not granted, exit
      if (finalStatus !== "granted") {
        console.log("❌ Notification permission not granted");
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        console.error("❌ Expo project ID not found in app.json");
        return null;
      }

      console.log("🔑 Generating Expo push token...");
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;

      console.log("✅ Expo Push Token:", token);

      // Check if token has changed
      const storedToken = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedToken === token) {
        console.log("ℹ️ Token unchanged, skipping backend registration");
        return token;
      }

      // Register token with backend
      const platform = Platform.OS === "ios" ? "iOS" : "Android";
      console.log(`📤 Registering token with backend (${platform})...`);

      const response = await registerDeviceToken(residentId, token, platform);

      if (response.isSuccess) {
        console.log("✅ Device token registered successfully");
        // Store token locally
        await AsyncStorage.setItem(this.STORAGE_KEY, token);
      } else {
        console.error("❌ Failed to register device token:", response.message);
        return null;
      }

      return token;
    } catch (error) {
      console.error("❌ Error registering for push notifications:", error);
      return null;
    }
  }

  /**
   * Unregister push notifications
   */
  static async unregisterPushNotifications(residentId: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (token) {
        console.log("🗑️ Unregistering device token...");
        await removeDeviceToken(residentId, token);
        await AsyncStorage.removeItem(this.STORAGE_KEY);
        console.log("✅ Device token unregistered");
      }
    } catch (error) {
      console.error("❌ Error unregistering push notifications:", error);
    }
  }

  /**
   * Get stored push token
   */
  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("❌ Error getting stored token:", error);
      return null;
    }
  }

  /**
   * Add notification received listener (when app is in foreground)
   */
  static addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  /**
   * Set badge count
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("❌ Error setting badge count:", error);
    }
  }

  /**
   * Get last notification response (for cold start)
   */
  static async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    try {
      return await Notifications.getLastNotificationResponseAsync();
    } catch (error) {
      console.error("❌ Error getting last notification response:", error);
      return null;
    }
  }

  /**
   * Cancel all notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("✅ All notifications cancelled");
    } catch (error) {
      console.error("❌ Error cancelling notifications:", error);
    }
  }
}
