import { registerResident } from "@/api/residentAction";
import { useAuthStore } from "@/stores/authStore";
import { Council } from "@/types";
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Alert, Text, View } from "react-native";
import { Button } from "react-native-paper";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { logIn, setCouncils, selectedCouncil } = useAuthStore();
  const router = useRouter();

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

    const getToken = async ({ code, codeVerifier, redirectUri }) => {
      console.log("[DEBUG] getToken called with:", {
        code,
        codeVerifier,
        redirectUri,
      });
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

          // Navigate based on council selection
          if (councils.length === 0) {
            console.warn("[DEBUG] No councils available for user");
            // Optionally show error to user
          } else if (!selectedCouncil) {
            console.log(
              "[DEBUG] No council selected, navigating to selectCouncil",
            );
            router.replace("/selectCouncil" as any);
          } else {
            console.log("[DEBUG] Council already selected, navigating to home");
            router.replace("/home");
          }
        }
      } catch (e) {
        console.error("[DEBUG] getToken error:", e);
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
    console.log("[DEBUG] handleLogin called");
    console.log("[DEBUG] promptAsync type:", typeof promptAsync);
    console.log("[DEBUG] promptAsync:", promptAsync);
    console.log("[DEBUG] request:", request);
    console.log("[DEBUG] discovery:", discovery);

    if (!promptAsync) {
      console.error("[DEBUG] promptAsync is not available!");
      return;
    }

    try {
      console.log("[DEBUG] Calling promptAsync...");
      const result = promptAsync();
      console.log("[DEBUG] promptAsync result:", result);

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
    promptRegisterAsync();
  }

  //Handle registration response (same as login)
  useEffect(() => {
    console.log("[DEBUG] registerResponse:", registerResponse);

    const getToken = async ({ code, codeVerifier, redirectUri }) => {
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

        if (tokenResponse.ok) {
          const payload = await tokenResponse.json();

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

          const userInfo = await userInfoResponse.json();
          console.log("[DEBUG] Registration - userInfo:", userInfo);

          Alert.alert(
            "[DEBUG] Registration - userInfo",
            `Welcome ${userInfo.given_name}! User ID: ${userInfo.sub}`,
          );

          await registerResident({
            sub: userInfo.sub,
            given_name: userInfo.given_name,
            family_name: userInfo.family_name,
            mobile: userInfo.mobile || "",
            email: userInfo.email,
            email_verified: userInfo.email_verified,
            name: userInfo.name,
            preferred_username: userInfo.preferred_username,
            councils: userInfo.councils,
          });
          console.log("[DEBUG] Resident registered successfully");

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
        <View className="w-full rounded-xl shadow-md h-16 bg-[#22577a] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleLogin}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              Sign In
            </Text>
          </Button>
        </View>
        <View className="w-full rounded-xl shadow-md h-16 bg-[#38a3a5] flex justify-center items-center">
          <Button
            mode="contained"
            onPress={handleRegister}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
              borderRadius: 12,
            }}
            contentStyle={{ height: "100%" }}
          >
            <Text className="font-bold text-xl text-center w-full text-white">
              Sign Up
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
}
