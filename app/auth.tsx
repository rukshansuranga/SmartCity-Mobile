import { registerResident } from "@/api/residentAction";
import { PushNotificationService } from "@/lib/pushNotificationService";
import { useAuthStore } from "@/stores/authStore";
import { Council } from "@/types";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import Toast from "react-native-toast-message";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { logIn, setCouncils, selectedCouncil } = useAuthStore();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string>("");

  const redirectUri = makeRedirectUri({
    scheme: "smart-city",
    path: "auth",
  });

  const discovery = useAutoDiscovery(process.env.EXPO_PUBLIC_KEYCLOAK_URL);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
      scopes: ["openid", "profile"],
      redirectUri: redirectUri,
    },
    discovery,
  );

  const [registerRequest, registerResponse, promptRegisterAsync] =
    useAuthRequest(
      {
        clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
        scopes: ["openid", "profile"],
        redirectUri: redirectUri,
        extraParams: {
          kc_action: "register",
          prompt: "create",
        },
      },
      discovery,
    );

  useEffect(() => {
    console.log("[DEBUG] useEffect triggered. response:", response);

    const getToken = async ({
      code,
      codeVerifier,
      redirectUri,
    }: {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    }) => {
      console.log("[DEBUG] getToken called with:", {
        code,
        codeVerifier,
        redirectUri,
      });
      setIsAuthenticating(true);
      setAuthError("");
      try {
        const formData = {
          grant_type: "authorization_code",
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        };
        const formBody = Object.entries(formData)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&");

        console.log("[DEBUG] Requesting token...");
        const tokenResponse = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody,
          },
        );

        console.log("[DEBUG] tokenResponse.ok:", tokenResponse.ok);
        if (tokenResponse.ok) {
          const payload = await tokenResponse.json();
          console.log("[DEBUG] Token payload received");

          const userInfoResponse = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${payload.access_token}`,
                Accept: "application/json",
              },
            },
          );

          console.log("[DEBUG] userInfoResponse.ok:", userInfoResponse.ok);
          const userInfo = await userInfoResponse.json();
          console.log("[DEBUG] userInfo:", userInfo);
          console.log("User ID (sub):", userInfo.sub);

          // Extract councils from userInfo and convert to Council type
          const councilNames: string[] = userInfo.councils || [];
          const councils: Council[] = councilNames.map((councilName) => ({
            value: councilName,
            label: councilName,
          }));
          console.log("[DEBUG] Extracted councils:", councils);

          // Store councils in auth store
          setCouncils(councils);

          // Login with all token data
          logIn({
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            idToken: payload.id_token,
            expiresIn: payload.expires_in,
            userInfo: userInfo,
          });

          console.log("[DEBUG] logIn called successfully");
          Toast.show({
            type: "success",
            text1: "Login Successful",
            text2: `Welcome ${userInfo.given_name || userInfo.name}!`,
          });

          // Register device token for push notifications (non-blocking)
          PushNotificationService.registerForPushNotifications(userInfo.sub)
            .then((token) => {
              if (token) {
                console.log("[DEBUG] Device token registered successfully");
              }
            })
            .catch((error) => {
              console.error("[DEBUG] Device token registration failed:", error);
            });

          // Navigate based on council selection
          if (councils.length === 0) {
            console.warn("[DEBUG] No councils available for user");
            Toast.show({
              type: "error",
              text1: "No Councils",
              text2: "No councils available. Please contact support.",
            });
          } else if (!selectedCouncil) {
            console.log(
              "[DEBUG] No council selected, navigating to selectCouncil",
            );
            router.replace("/selectCouncil" as any);
          } else {
            console.log("[DEBUG] Council already selected, navigating to home");
            router.replace("/home");
          }
        } else {
          setIsAuthenticating(false);
          const errorMsg = "Failed to get authentication token";
          setAuthError(errorMsg);
          Toast.show({
            type: "error",
            text1: "Login Failed",
            text2: errorMsg,
          });
        }
      } catch (e) {
        console.error("[DEBUG] getToken error:", e);
        setIsAuthenticating(false);
        const errorMsg =
          e instanceof Error ? e.message : "An error occurred during login";
        setAuthError(errorMsg);
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: errorMsg,
        });
      }
    };

    if (response?.type === "success") {
      const { code } = response.params;
      console.log("[DEBUG] Auth code received:", code);
      getToken({
        code,
        codeVerifier: request?.codeVerifier,
        redirectUri,
      });
    } else if (response?.type === "error") {
      console.log("[DEBUG] Auth error:", response.error);
      setAuthError("Authentication failed. Please try again.");
      Toast.show({
        type: "error",
        text1: "Authentication Failed",
        text2: response.error?.message || "Please try again",
      });
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      console.log("[DEBUG] Auth dismissed or cancelled by user");
      setAuthError("");
    } else {
      console.log("[DEBUG] response is not success or undefined.");
    }
  }, [
    response,
    request,
    redirectUri,
    logIn,
    setCouncils,
    selectedCouncil,
    router,
  ]);

  function handleLogin() {
    //console.log("[DEBUG] handleLogin called");
    //console.log("[DEBUG] promptAsync type:", typeof promptAsync);
    //console.log("[DEBUG] promptAsync:", promptAsync);
    //console.log("[DEBUG] request:", request);
    //console.log("[DEBUG] discovery:", discovery);

    if (!request) {
      console.warn("[DEBUG] Auth request is still loading...");
      Toast.show({
        type: "info",
        text1: "Please wait",
        text2: "Authentication is initializing...",
      });
      return;
    }

    if (!promptAsync) {
      console.error("[DEBUG] promptAsync is not available!");
      return;
    }

    try {
      //console.log("[DEBUG] Calling promptAsync...");
      const result = promptAsync();
      //console.log("[DEBUG] promptAsync result:", result);

      if (result && typeof result.then === "function") {
        result
          .then((res) => {
            console.log("[DEBUG] promptAsync resolved:", res);
          })
          .catch((err) => {
            console.error("[DEBUG] promptAsync rejected:", err);
          });
      }
    } catch (error) {
      console.error("[DEBUG] Error calling promptAsync:", error);
    }
  }

  function handleRegister() {
    if (!registerRequest) {
      console.warn("[DEBUG] Register request is still loading...");
      Toast.show({
        type: "info",
        text1: "Please wait",
        text2: "Authentication is initializing...",
      });
      return;
    }
    promptRegisterAsync();
  }

  //Handle registration response (same as login)
  useEffect(() => {
    //console.log("[DEBUG] registerResponse:", registerResponse);

    const getToken = async ({
      code,
      codeVerifier,
      redirectUri,
    }: {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    }) => {
      console.log("[DEBUG] Registration getToken called with:", {
        code,
        codeVerifier,
        redirectUri,
      });
      setIsAuthenticating(true);
      setAuthError("");
      try {
        const formData = {
          grant_type: "authorization_code",
          client_id: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID,
          code: code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        };
        const formBody = Object.entries(formData)
          .map(
            ([key, value]) =>
              `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
          )
          .join("&");

        console.log("[DEBUG] Registration - Requesting token...");
        const tokenResponse = await fetch(
          `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: formBody,
          },
        );

        console.log(
          "[DEBUG] Registration - tokenResponse.ok:",
          tokenResponse.ok,
        );
        console.log(
          "[DEBUG] Registration - tokenResponse.status:",
          tokenResponse.status,
        );

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error("[DEBUG] Registration - Token request failed:", {
            status: tokenResponse.status,
            statusText: tokenResponse.statusText,
            error: errorText,
          });
          setIsAuthenticating(false);
          const errorMsg = `Failed to get token: ${tokenResponse.status}`;
          setAuthError(errorMsg);
          Alert.alert("Registration Token Error", errorMsg);
          return;
        }

        if (tokenResponse.ok) {
          console.log("[DEBUG] Registration - Token payload received");
          const payload = await tokenResponse.json();

          console.log("[DEBUG] Registration - Fetching userInfo...");
          const userInfoResponse = await fetch(
            `${process.env.EXPO_PUBLIC_KEYCLOAK_URL}/protocol/openid-connect/userinfo`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${payload.access_token}`,
                Accept: "application/json",
              },
            },
          );

          console.log(
            "[DEBUG] Registration - userInfoResponse.ok:",
            userInfoResponse.ok,
          );
          console.log(
            "[DEBUG] Registration - userInfoResponse.status:",
            userInfoResponse.status,
          );

          if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            console.error("[DEBUG] Registration - UserInfo fetch failed:", {
              status: userInfoResponse.status,
              statusText: userInfoResponse.statusText,
              error: errorText,
            });
            setIsAuthenticating(false);
            const errorMsg = `Failed to get user info: ${userInfoResponse.status}`;
            setAuthError(errorMsg);
            Alert.alert("Registration UserInfo Error", errorMsg);
            return;
          }

          const userInfo = await userInfoResponse.json();
          console.log("[DEBUG] Registration - userInfo:", userInfo);
          console.log("[DEBUG] Registration - userInfo.sub:", userInfo.sub);

          Alert.alert(
            "[DEBUG] Registration - userInfo",
            `Welcome ${userInfo.given_name}! User ID: ${userInfo.sub}`,
          );

          console.log("[DEBUG] Registration - Calling registerResident...");
          const residentData = {
            sub: userInfo.sub,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            mobile: userInfo.mobile || "",
            email: userInfo.email,
            email_verified: userInfo.email_verified,
            name: userInfo.name,
            preferred_username: userInfo.preferred_username,
            councils: userInfo.councils,
          };
          console.log("[DEBUG] Registration - residentData:", residentData);

          try {
            const registerResult = await registerResident(residentData);
            console.log(
              "[DEBUG] Resident registered successfully:",
              registerResult,
            );
          } catch (registerError) {
            console.error("[DEBUG] registerResident failed:", registerError);
            console.error("[DEBUG] registerResident error details:", {
              message: registerError?.message,
              response: registerError?.response,
              status: registerError?.status,
            });
            Alert.alert(
              "Resident Registration Error",
              `Failed to register resident: ${registerError?.message || "Unknown error"}`,
            );
            // Don't return here - continue with login even if backend registration fails
          }

          //add alert with userinfo
          Alert.alert(
            "Registration Successful",
            `Welcome ${userInfo.given_name}! User ID: ${userInfo.sub}`,
          );

          // Extract councils from userInfo and convert to Council type
          const councilNames: string[] = userInfo.councils || [];
          const councils: Council[] = councilNames.map((councilName) => ({
            value: councilName,
            label: councilName,
          }));
          console.log("[DEBUG] Extracted councils:", councils);

          // Store councils in auth store
          setCouncils(councils);

          // Login with all token data
          logIn({
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            idToken: payload.id_token,
            expiresIn: payload.expires_in,
            userInfo: userInfo,
          });

          // Register device token for push notifications (non-blocking)
          PushNotificationService.registerForPushNotifications(userInfo.sub)
            .then((token) => {
              if (token) {
                console.log("[DEBUG] Device token registered after signup");
              }
            })
            .catch((error) => {
              console.error(
                "[DEBUG] Device token registration failed after signup:",
                error,
              );
            });

          // For new registrations, always navigate to council selection
          if (councils.length === 0) {
            console.warn("[DEBUG] No councils available for new user");
            // Show error to user
          } else {
            console.log(
              "[DEBUG] New registration, navigating to selectCouncil",
            );
            router.replace("/selectCouncil" as any);
          }
        }
      } catch (e) {
        console.error("[DEBUG] Registration getToken error:", e);
        console.error("[DEBUG] Registration getToken error details:", {
          message: e?.message,
          stack: e?.stack,
          name: e?.name,
        });
        setIsAuthenticating(false);
        const errorMsg = e?.message || "Unknown error";
        setAuthError(errorMsg);
        Alert.alert(
          "Registration Error",
          `An error occurred during registration: ${errorMsg}`,
        );
      }
    };

    if (registerResponse?.type === "success") {
      const { code } = registerResponse.params;
      console.log("[DEBUG] Registration auth code:", code);
      getToken({
        code,
        codeVerifier: registerRequest?.codeVerifier,
        redirectUri,
      });
    } else if (registerResponse?.type === "error") {
      console.log("[DEBUG] Registration error:", registerResponse.error);
      setAuthError("Registration failed. Please try again.");
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: registerResponse.error?.message || "Please try again",
      });
    } else if (
      registerResponse?.type === "dismiss" ||
      registerResponse?.type === "cancel"
    ) {
      console.log("[DEBUG] Registration dismissed or cancelled by user");
      setAuthError("");
    }
  }, [
    registerResponse,
    registerRequest,
    redirectUri,
    logIn,
    setCouncils,
    router,
  ]);

  return (
    <View className="flex-1 justify-center items-center bg-[#c7f9cc] px-4">
      <View className="w-full flex flex-col gap-4">
        {authError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <View className="w-full rounded-xl shadow-md h-16 bg-[#22577a] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleLogin}
            disabled={!request || isAuthenticating}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
              opacity: !request || isAuthenticating ? 0.5 : 1,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              {!request ? "Loading..." : "Sign In"}
            </Text>
          </Button>
        </View>
        <View className="w-full rounded-xl shadow-md h-16 bg-[#38a3a5] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleRegister}
            disabled={!registerRequest || isAuthenticating}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
              opacity: !registerRequest || isAuthenticating ? 0.5 : 1,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              {!registerRequest ? "Loading..." : "Sign Up"}
            </Text>
          </Button>
        </View>
      </View>

      {/* Loading Overlay */}
      {isAuthenticating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22577a" />
            <Text style={styles.loadingText}>Authenticating...</Text>
            <Text style={styles.loadingSubtext}>
              Please wait while we verify your credentials
            </Text>
          </View>
        </View>
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fcc",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 280,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#22577a",
    textAlign: "center",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
